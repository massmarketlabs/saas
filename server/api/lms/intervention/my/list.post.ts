import { eq, sql } from 'drizzle-orm'
import * as schema from '~~/server/database/schema'

export default defineEventHandler(async (event) => {
  const session = await requireAuth(event)
  const user_id = session.user.id

  const db = await useDB(event)

  const terms = await db.query.terms.findMany({
    where: (term, { exists }) =>
      exists(
        db
          .select()
          .from(schema.intervention_enrollment)
          .innerJoin(
            schema.interventions,
            eq(schema.interventions.id, schema.intervention_enrollment.intervention_id)
          )
          .where(
            sql`${schema.interventions.term_id} = ${term.id} AND ${schema.intervention_enrollment.user_id} = ${user_id}`
          )
      ),
    orderBy: (term, { asc }) => asc(term.start_date),
    with: {
      interventions: {
        where: (intervention, { exists }) =>
          exists(
            db
              .select()
              .from(schema.intervention_enrollment)
              .where(
                sql`${schema.intervention_enrollment.intervention_id} = ${intervention.id}
                AND ${schema.intervention_enrollment.user_id} = ${user_id}`
              )
          ),
        with: {
          intervention_enrollment: {
            where: (enrollment, { eq }) => eq(enrollment.user_id, user_id)
          },
          term: true
        }
      }
    }
  })

  const auditParams = extractAuditParams(event)

  await logAuditEvent({
    userId: user_id,
    action: 'Access granted to view personal interventions',
    category: 'enrollment',
    status: 'success',
    details: 'User granted permission to view their own enrolled intervention',
    userAgent: auditParams?.userAgent,
    ipAddress: auditParams?.ipAddress,
    targetType: 'read.enrollment'
  })
  return terms
})
