// server/api/admin/programs/post.ts
import type { H3Event } from 'h3'
import { createError } from 'h3'
import { z } from 'zod/v4'
import { programRepo } from '~~/server/internal/program/repo'
import { insertProgramSchema } from '~~/server/internal/program/zod-types'

// Define POST handler
export default defineEventHandler(async (event: H3Event) => {
  try {
    const user = await requireAuth(event)

    // Validate with Zod
    const body = await readValidatedBody(event, insertProgramSchema.safeParse)

    if (body.error) {
      throw createError({
        statusCode: 400,
        data: body.error
      })
    }

    // Get db connection
    const db = await useDB(event)
    // Insert into database
    const result = await programRepo(db).create(body.data)

    await logAuditEvent({
      userId: user.session.userId,
      category: 'organization',
      action: `Program ${result.data.name} created`,
      status: 'success',
      ipAddress: getRequestIP(event),
      userAgent: event.headers.get('user-agent') ?? undefined
    })

    return {
      success: true,
      data: result
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
