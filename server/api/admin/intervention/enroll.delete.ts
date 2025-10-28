import { interventionRepo } from '~~/server/internal/intervention/repo'
import { extractAuditParams } from '~~/server/utils/auditLogger'

export default defineEventHandler(async (event) => {
  const session = await requireAuth(event)

  const body = await readBody(event)

  if (!body || !body.id) {
    throw createError({
      statusCode: 400,
      message: 'Bad request'
    })
  }

  const db = await useDB(event)

  const resp = await interventionRepo(db).deleteEnrollment({ id: body.id })
  const auditParams = extractAuditParams(event)

  await logAuditEvent({
    userId: session.user.id,
    ipAddress: auditParams.ipAddress,
    userAgent: auditParams.userAgent,
    targetId: body.id,
    category: 'enrollment',
    action: `DELETE: Intervention Enrollment`,
    targetType: 'intervention_enrollment',
    status: 'success'
  })

  return resp
})
