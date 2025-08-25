import { dbQueries, insertUserEmergencyContact } from '~~/server/database'

export default defineEventHandler(async (event) => {
  const __auth = await requireAuth(event)
  const payload = await readValidatedBody(event, insertUserEmergencyContact.parse)
  const db = await useDB(event)
  return await dbQueries(db).user.insertEmergencyContact(payload)
})
