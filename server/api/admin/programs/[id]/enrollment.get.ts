import { dbQueries } from '~~/server/database'

export default defineEventHandler(async (event) => {
  const __auth = requireAuth(event)

  const id = getRouterParam(event, 'id')

  if (!id) {
    throw createError({ status: 400, message: 'ID param is required.' })
  }

  const db = await useDB(event)

  const resp = await dbQueries(db).program.enrollments(id)
  return resp
})
