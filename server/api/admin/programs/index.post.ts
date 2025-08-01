import type { H3Event } from 'h3'
// import { insertProgramSchema } from '~~/server/validators/programs'
import { createError } from 'h3'
// server/api/admin/programs/post.ts
import { z } from 'zod/v4'
import { programs } from '~~/server/database/schema'
import { requireAuthWithOrganizationId } from '~~/server/utils/auth'

export const insertProgramSchema = z.object({
  name: z.string().min(1, 'Name is required')
})

export type InsertProgramInput = z.infer<typeof insertProgramSchema>

// Define POST handler
export default defineEventHandler(async (event: H3Event) => {
  try {
    const user = await requireAuthWithOrganizationId(event)

    const body = await readBody(event)

    // Validate with Zod
    const data = insertProgramSchema.parse(body)

    // Get db connection
    const db = await useDB()
    // Insert into database
    const result = await db.insert(programs).values({ ...data, organization_id: user.session.activeOrganizationId }).returning()

    await logAuditEvent({
      userId: user.session.userId,
      category: 'organization',
      action: `Program ${data.name} created`,
      status: 'success',
      ipAddress: getRequestIP(event),
      userAgent: event.headers.get('user-agent') ?? undefined
    })

    return {
      success: true,
      data: result[0]
    }
  } catch (error) {
    // Handle Zod errors or others
    if (error instanceof z.ZodError) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Validation error',
        data: error

      })
    }

    throw createError({
      statusCode: 500,
      statusMessage: 'Internal Server Error',
      data: error
    })
  }
})
