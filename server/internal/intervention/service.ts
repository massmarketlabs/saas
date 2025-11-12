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

    const resp = await repo.createSubject(body)

    return resp
  }

  const getInterventionClasslist = async (intervention_id: string) => {
    const session = await requireAuth(event)

    const db = await useDB(event)

    const repo = interventionRepo(db)

    const resp = repo.getInterventionClasslist(intervention_id)

    const audit_params = extractAuditParams(event)

    await logAuditEvent({
      category: 'enrollment',
      action: 'read',
      userId: session.user.id,
      status: 'success',
      targetId: intervention_id,
      targetType: 'intervention',
      details: `${session.user.id} accessed intervention ${intervention_id} to view enrollment`,
      ...audit_params
    })

    return resp
  }
  return {
    updateSyllabusId,
    createSubject,
    getInterventionClasslist
  }
}
