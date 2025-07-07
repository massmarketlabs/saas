import { and, eq } from 'drizzle-orm'
import { createInsertSchema } from 'drizzle-zod'
import { defineEventHandler, H3Error } from 'h3'
import { z } from 'zod/v4'
import { beneficiary, member } from '~~/server/database/schema'
// Create validation schema (same as in your component)
export const createBeneficiarySchema = createInsertSchema(beneficiary, {
  first_name_en: z.string().min(1, 'First name is required'),
  middle_name_en: z.string().min(1, 'Middle name is required'),
  last_name_en: z.string().min(1, 'Last name is required'),
  gid: z.string().min(1, 'Government Issued Identification Number is required'),
  gender: z.enum(['male', 'female', 'other']),
  // dob: z.date('Date of birth is required'),
  email: z.email().or(z.literal('')),
  phone: z.string().optional()
  // organization_id: z.string().optional()
})

// Infer the type from the schema
export type BeneficiaryFormData = z.infer<typeof createBeneficiarySchema>

// TODO: error handling which can be understood by the frontend to show errors on the appropriate field
export default defineEventHandler(async (event) => {
  try {
    // Get the authenticated user
    const session = await getAuthSession(event)
    const db = await useDB()

    if (!session?.user?.id) {
      throw createError({
        statusCode: 401,
        statusMessage: 'Unauthorized'
      })
    }

    const currentUser = await db
      .select()
      .from(member)
      .where(eq(member.userId, session.user.id))
      .limit(1)

    // Get user's organization ID
    // Adjust this based on your user/organization relationship
    const memberDetails = currentUser[0] // or however you access the org ID

    if (!memberDetails) {
      throw createError({
        statusCode: 400,
        statusMessage: 'User is not associated with an organization'
      })
    }
    const orgId = memberDetails.organizationId

    // Parse and validate request body
    const body = await readBody(event)
    const validatedData = createBeneficiarySchema.parse(body)

    // Check if GID already exists in the user's organization
    const existingBeneficiary = await db
      .select()
      .from(beneficiary)
      .where(and(eq(beneficiary.organization_id, orgId), eq(beneficiary.gid, validatedData.gid)))

    if (existingBeneficiary.length > 0) {
      throw createError({
        statusCode: 409,
        statusMessage: 'A beneficiary with this Government ID already exists in your organization'
      })
    }

    const insertValues = createBeneficiarySchema.parse({
      ...validatedData,
      joined_at: new Date(),
      updated_at: new Date(),
      created_at: new Date(),
      created_by: session.user.id,
      organization_id: orgId // Adjust field name as needed
    })

    // Create the beneficiary
    const newBeneficiary = await db
      .insert(beneficiary)
      .values(insertValues)
      .returning()

    // Return success response
    return {
      success: true,
      data: newBeneficiary[0],
      message: 'Beneficiary created successfully'
    }
  } catch (error) {
    console.error({ error })
    // Handle Zod validation errors
    if (error instanceof z.ZodError) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Validation failed',
        data: {
          errors: error.issues.map(issue => ({
            field: issue.path.join('.'),
            message: issue.message
          }))
        }
      })
    }

    if (error instanceof H3Error) {
      throw error
    }

    // Handle database errors
    // TODO: check type of error for type safety. Environment Matters (Cloudflare vs. Node Modules)
    if (error?.code === '23505') { // PostgreSQL unique constraint violation
      throw createError({
        statusCode: 409,
        statusMessage: 'A beneficiary with this information already exists'
      })
    }

    // Re-throw createError instances
    if (error?.code) {
      throw error
    }
    // Handle unexpected errors
    console.error('Error creating beneficiary:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal server error'
    })
  }
})
