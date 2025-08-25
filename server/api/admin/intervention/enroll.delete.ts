import { byIdSchema, dbQueries } from '~~/server/database'
import { extractAuditParams } from '~~/server/utils/auditLogger'

export default defineEventHandler(async (event) => {
  const auditParams = extractAuditParams(event)
  const auth = await requireAuth(event)
  const payload = await readValidatedBody(event, byIdSchema.parse)
  const db = await useDB(event)

  return await dbQueries(db).interventions.deleteEnrollment(payload, auth.user, auditParams)
})
