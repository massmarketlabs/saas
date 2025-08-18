import { dbQueries, deleteInterventionEnrollment } from '~~/server/database'
import { extractAuditParams } from '~~/server/utils/auditLogger'

export default defineEventHandler(async (event) => {
  const auditParams = extractAuditParams(event)
  const auth = await requireAuth(event)
  const payload = await readValidatedBody(event, deleteInterventionEnrollment.parse)
  const db = await useDB(event)

  return await dbQueries(db).interventions.deleteEnrollment(payload, auth.user, auditParams)
})
