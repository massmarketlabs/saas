import { authRepo } from '~~/server/internal/auth/repo'
import { insertUserEmergencyContact } from '~~/server/internal/auth/zod-types'

export default defineEventHandler(async (event) => {
  const __auth = await requireAuth(event)
  const payload = await readValidatedBody(event, insertUserEmergencyContact.parse)
  const db = await useDB(event)
  return await authRepo(db).createEmergencyContact(payload)
})
