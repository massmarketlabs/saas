import { dbQueries, insertUserNote } from '~~/server/database'

export default defineEventHandler(async (event) => {
  const auth = await requireAuth(event)

  const body = await readValidatedBody(event, insertUserNote.omit({ created_by: true }).parse)

  const payload = { ...body, created_by: auth.user.id }
  const db = await useDB(event)
  return await dbQueries(db).user.insertNote(payload)
})
