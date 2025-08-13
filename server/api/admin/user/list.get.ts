import { dbQueries } from '~~/server/database'
import { paginatedSchema } from '~~/server/database/utils'

export default defineEventHandler(async (event) => {
  const __user = await requireAuth(event)
  const db = await useDB(event)

  const query = await getValidatedQuery(event, paginatedSchema.parse)

  return await dbQueries(db).user.list(query)
})
