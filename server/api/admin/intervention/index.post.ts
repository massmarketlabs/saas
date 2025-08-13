import { dbQueries, requestCreateInterventionSchema } from '~~/server/database'

export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)
  const body = await readValidatedBody(event, requestCreateInterventionSchema.safeParse)

  if (body.error) {
    throw createError({ statusCode: 400, ...body.error })
  }
  const payload = { ...body.data, created_by: user.user.id }

  const db = await useDB(event)
  return await dbQueries(db).interventions.insert(payload)
})
