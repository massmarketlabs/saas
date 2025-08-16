import { dbQueries, insertInterventionEnrollment } from '~~/server/database'

export default defineEventHandler(async (event) => {
  const __user = await requireAuth(event)
  const { intervention_id, user_id } = await readValidatedBody(event, insertInterventionEnrollment.parse)
  const db = await useDB(event)
  return await dbQueries(db).interventions.toggleEnrollment({ user_id, intervention_id })
})
