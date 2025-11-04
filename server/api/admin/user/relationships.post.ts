import { authRepo } from '~~/server/internal/user/repo'
import { insertUserRelationship } from '~~/server/internal/user/zod-types'

export default defineEventHandler(async (event) => {
  const __auth = await requireAuth(event)
  const db = await useDB(event)

  const payload = await readValidatedBody(event, insertUserRelationship.parse)
  return await authRepo(db).createRelationship(payload)
})
