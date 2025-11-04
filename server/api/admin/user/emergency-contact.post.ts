import { authRepo } from '~~/server/internal/user/repo'
import { insertUserEmergencyContact } from '~~/server/internal/user/zod-types'

export default defineEventHandler(async (event) => {
  const __auth = await requireAuth(event)
  const payload = await readValidatedBody(event, insertUserEmergencyContact.parse)
  const db = await useDB(event)
  return await authRepo(db).createEmergencyContact(payload)
})
