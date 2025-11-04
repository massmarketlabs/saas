import { authRepo } from '~~/server/internal/user/repo'

export default defineEventHandler(async (event) => {
  const __user = await requireAuth(event)
  const db = await useDB(event)

  const query = await getValidatedQuery(event, paginatedSchema.parse)

  return await authRepo(db).list(query)
})
