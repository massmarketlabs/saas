import { interventionRepo } from '~~/server/internal/intervention/repo'
import { requestCreateInterventionSchema } from '~~/server/internal/intervention/zod-types'

export default defineEventHandler(async (event) => {
  const auth = await requireAuth(event)
  const body = await readValidatedBody(event, requestCreateInterventionSchema.omit({ created_by: true }).safeParse)

  if (body.error) {
    throw createError({ statusCode: 400, ...body.error })
  }
  const payload = { ...body.data, created_by: auth.user.id }

  const db = await useDB(event)
  return await interventionRepo(db).create(payload)
})
