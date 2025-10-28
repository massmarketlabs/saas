import { interventionRepo } from '~~/server/internal/intervention/repo'
import { requestCreateInterventionSchema } from '~~/server/internal/intervention/zod-types'

export default defineEventHandler(async (event) => {
  const __auth = await requireAuth(event)
  const payload = await readValidatedBody(event, requestCreateInterventionSchema.parse)
  const db = await useDB(event)
  const resp = await interventionRepo(db).patch(payload)
  return resp
})
