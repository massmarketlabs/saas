import { dbQueries } from '~~/server/database'
// import * as schema from '~~/server/database/schema'

export default defineEventHandler(async (event) => {
  const __session = requireAuth(event)
  const user_id = getRouterParam(event, 'user_id')
  if (!user_id) {
    throw createError({ status: 404, message: `User ${user_id} not found.` })
  }
  const db = await useDB(event)
  const data = await dbQueries(db).interventions.getByUserId(user_id)
  return data
})
