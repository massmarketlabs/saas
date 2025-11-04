import type { H3Event } from 'h3'
import { interventionRepo } from './repo'
import { insertSubject } from './zod-types'

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

    const repo = interventionRepo(db)
    return await repo.updateSyllabusAttachmentId({ syllabus_id: attachmentId, id: interventionId })
  }

  const createSubject = async () => {
    const __session = await requireAuth(event)

    const body = await readValidatedBody(event, insertSubject.parse)

    const db = await useDB(event)

    const repo = interventionRepo(db)

    return await repo.createSubject(body)
  }

  return {
    updateSyllabusId,
    createSubject
  }
}
