import { storageService } from '~~/server/internal/storage/service'

export default defineEventHandler(async (event) => {
  const session = await requireAuth(event)
  const id = getRouterParam(event, 'id')
  if (!id) {
    throw createError({
      statusCode: 400,
      message: 'Intervention ID required'
    })
  }

  const db = await useDB(event)

  const enrollment = await db.query.enrollment.findFirst({
    where: (enrollment, { eq, and }) => (and(eq(enrollment.intervention_id, id), eq(enrollment.user_id, session.user.id)))
  })

  if (!enrollment) {
    throw createError({
      statusCode: 403,
      message: 'Not enrolled in requested intervention'
    })
  }

  const intervention = await db.query.interventions.findFirst({
    where: (intervention, { eq }) => (eq(intervention.id, id)),
    with: {
      term: true,
      primary_instructor: true,
      announcements: {
        with: {
          creator: true

        }
      }
    }
  })

  if (!intervention) {
    throw createError({
      status: 404,
      message: `Intervention ${id} cannot be found`
    })
  }

  const audit_params = extractAuditParams(event)

  await logAuditEvent({
    ...audit_params,
    category: 'intervention',
    action: 'read.intervention',
    targetId: id,
    userId: session.user.id,
    status: 'success',
    targetType: 'intervention',
    details: `User: ${session.user.id} read intervention: ${id}`
  })

  if (intervention.syllabus_id) {
    const storage = storageService()
    const res = await storage.getById(event, intervention.syllabus_id)
    if (res) {
      return {
        ...intervention,
        syllabus_src: res.url
      }
    }
  }
  return { ...intervention, syllabus_src: null }
})
