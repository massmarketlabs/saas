import { interventionRepo } from '~~/server/internal/intervention/repo'
import { insertUserNote } from '~~/server/internal/intervention/zod-types'

export default defineEventHandler(async (event) => {
  const auth = await requireAuth(event)

  const body = await readValidatedBody(event, insertUserNote.omit({ created_by: true }).parse)

  const payload = { ...body, created_by: auth.user.id }
  const db = await useDB(event)
  return await interventionRepo(db).createNote(payload)
})
