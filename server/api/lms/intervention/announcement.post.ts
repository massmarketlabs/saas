import { insertAnnouncement } from '~~/server/database'
import * as schemas from '~~/server/database/schema'

export default defineEventHandler(async (event) => {
  const session = await requireAuth(event)

  const payload = await readValidatedBody(event, insertAnnouncement.parse)

  const db = await useDB(event)

  const resp = await db.insert(schemas.announcement).values({ ...payload, created_by: session.user.id }).returning()

  const auditParams = extractAuditParams(event)

  await logAuditEvent({
    ...auditParams,
    userId: session.user.id,
    targetId: payload.intervention_id,
    category: 'intervention',
    action: 'create.announcement',
    details: 'new announcement created',
    status: 'success',
    targetType: 'intervention'
  })

  return resp
})
