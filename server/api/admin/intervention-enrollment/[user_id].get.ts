import { interventionRepo } from '~~/server/internal/intervention/repo'

export default defineEventHandler(async (event) => {
  const __session = requireAuth(event)
  const user_id = getRouterParam(event, 'user_id')
  if (!user_id) {
    throw createError({ status: 404, message: `User ${user_id} not found.` })
  }
  const db = await useDB(event)
  const data = await interventionRepo(db).getByUserId(user_id)
  return data
})
