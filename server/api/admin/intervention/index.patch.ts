import { dbQueries, requestCreateInterventionSchema } from '~~/server/database'

export default defineEventHandler(async (event) => {
  const __auth = await requireAuth(event)
  const payload = await readValidatedBody(event, requestCreateInterventionSchema.parse)
  const db = await useDB(event)
  const resp = await dbQueries(db).interventions.patch(payload)
  return resp
})
