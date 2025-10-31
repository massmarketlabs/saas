import type { H3Event } from 'h3'
import { eq } from 'drizzle-orm'

import * as schema from '~~/server/internal/schemas'

export const interventionService = (event: H3Event) => {
  const updateSyllabusId = async () => {
    const __session = await requireAuth(event)

    const body = await readBody(event)

    const attachmentId = body.attachmentId

    if (!attachmentId) {
      throw createError({
        statusCode: 400,
        message: 'No attachment id found'
      })
    }

    const interventionId = getRouterParam(event, 'id')

    if (!interventionId) {
      throw createError({
        statusCode: 400,
        message: 'No intervention id found'
      })
    }

    const db = await useDB(event)

    return await db.update(schema.interventions).set({ syllabus_id: attachmentId }).where(eq(schema.interventions.id, interventionId)).returning()
  }

  return {
    updateSyllabusId
  }
}
