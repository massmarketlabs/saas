// /server/api/admin/beneficiary/index.post.ts

import { and, eq } from 'drizzle-orm'
import { createInsertSchema } from 'drizzle-zod'
import { defineEventHandler, H3Error } from 'h3'
import { z } from 'zod/v4'
import { beneficiary, member } from '~~/server/database/schema'

enum CreateBeneficiaryError {
  SchemaValidation = 'err_schema_validation',
  DuplicateGID = 'err_duplicate_government_id',
  InternalServer = 'err_internal_server',
  Unauthorized = 'err_unauthorized',
  CurrentUserUnassignedOrganization = 'err_unassigned_organization'
}

// Create validation schema
export const createBeneficiarySchema = createInsertSchema(beneficiary, {
  first_name_en: z.string().min(1, 'First name is required'),
  middle_name_en: z.string().min(1, 'Middle name is required'),
  last_name_en: z.string().min(1, 'Last name is required'),
  gid: z.string().min(1, 'Government Issued Identification Number is required'),
  gender: z.enum(['male', 'female', 'other']),
  email: z.email().or(z.null()),
  phone: z.string().optional()
}).omit({ created_at: true, joined_at: true, updated_at: true })

const getCurrentUserOrganizationMembership = async (
  session?: Awaited<ReturnType<typeof getAuthSession>>
) => {
  if (!session || !session.user || !session.user.id) {
    return null
  }
  const db = await useDB()

  const currentUserMemberships = await db
    .select()
    .from(member)
    .where(
      eq(
        member.userId,
        session.user.id
      )
    )
    .limit(1)

  return currentUserMemberships[0]
}

const checkExistingGID = async (gid: string, orgId: string) => {
  const db = await useDB()
  const existingBeneficiary = await db
    .select()
    .from(beneficiary)
    .where(
      and(
        eq(beneficiary.organization_id, orgId),
        eq(beneficiary.gid, gid)
      )
    )

  return existingBeneficiary
}

// Infer the type from the schema
export type BeneficiaryFormData = z.infer<typeof createBeneficiarySchema>

export interface CreateBeneficiaryResponse {
  statusCode: number
  data: typeof beneficiary.$inferSelect
  message: string
}

export default defineEventHandler(async (event): Promise<CreateBeneficiaryResponse> => {
  try {
    // Get the authenticated user
    const session = await getAuthSession(event)

    if (!session?.user?.id) {
      throw createError({
        statusCode: 401,
        statusMessage: CreateBeneficiaryError.Unauthorized
      })
    }

    const db = await useDB()

    const memberDetails = await getCurrentUserOrganizationMembership(session)

    if (!memberDetails) {
      throw createError({
        statusCode: 400,
        statusMessage: CreateBeneficiaryError.CurrentUserUnassignedOrganization
      })
    }

    const orgId = memberDetails.organizationId

    const auth = useServerAuth()

    const hasPermission = await auth.api.hasPermission({
      headers: event.headers,
      body: {
        permissions: {
          beneficiary: ['create']
        },
        organizationId: orgId
      }
    })

    if (!hasPermission.success) {
      throw createError({
        statusCode: 403,
        message: 'User must have create permissions for beneficiaries',
        statusMessage: 'Forbidden'
      })
    }

    const body = await readBody(event)

    // Parse and validate request body
    const validatedData = await createBeneficiarySchema
      .parseAsync(body)
      .then(async (parsedData) => {
        // After basic schema validation, check if GID is taken
        const existingBeneficiary = await checkExistingGID(parsedData.gid, orgId)

        if (existingBeneficiary.length > 0) {
          throw new z.ZodError([
            {
              code: 'custom',
              path: ['gid'],
              message: 'A beneficiary with this Government ID already exists in your organization',
              input: 'gid'
            }
          ])
        }

        return parsedData
      })

    const insertValues = createBeneficiarySchema.parse({
      ...validatedData,
      joined_at: new Date(),
      updated_at: new Date(),
      created_at: new Date(),
      created_by: session.user.id,
      organization_id: orgId
    })

    // Create the beneficiary
    const newBeneficiary = await db
      .insert(beneficiary)
      .values(insertValues)
      .returning()

    // Return success response
    return {
      statusCode: 200,
      data: newBeneficiary[0],
      message: 'Beneficiary created successfully'
    }
  } catch (error) {
    console.error('Error creating beneficiary:', error)

    // Handle Zod validation errors
    if (error instanceof z.ZodError) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Validation failed',
        data: {
          errors: error.issues.map(issue => ({
            field: issue.path.join('.'),
            message: issue.message,
            code: 'validation_error'
          }))
        }
      })
    }

    // Handle H3 errors (including our custom ones)
    if (error instanceof H3Error) {
      throw error
    }
    // Handle unexpected errors
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal server error'
    })
  }
})
