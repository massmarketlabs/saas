import { dbQueries, insertUserRelationship } from '~~/server/database'

export default defineEventHandler(async (event) => {
  const __auth = await requireAuth(event)
  const db = await useDB(event)

  const payload = await readValidatedBody(event, insertUserRelationship.parse)
  return await dbQueries(db).user.insertRelationship(payload)
})
