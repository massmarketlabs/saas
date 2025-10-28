import { programRepo } from '~~/server/internal/program/repo'

const ERR_MISSING_ID = 'ID param is required'

export default defineEventHandler(async (event) => {
  const __user = await requireAuth(event)

  const db = await useDB(event)
  const id = getRouterParam(event, 'id')

  if (!id) {
    throw createError({
      statusCode: 400,
      message: ERR_MISSING_ID
    })
  }

  const resp = await programRepo(db).getById(id)
  return resp
})
