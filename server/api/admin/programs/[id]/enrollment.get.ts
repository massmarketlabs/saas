import { programRepo } from '~~/server/internal/program/repo'

export default defineEventHandler(async (event) => {
  const __auth = requireAuth(event)

  const id = getRouterParam(event, 'id')

  if (!id) {
    throw createError({ status: 400, message: 'ID param is required.' })
  }

  const db = await useDB(event)

  const resp = await programRepo(db).enrollments(id)
  return resp
})
