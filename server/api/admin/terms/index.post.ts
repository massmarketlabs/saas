import { dbQueries, insertTerm } from '~~/server/database'

export default defineEventHandler(async (event) => {
  try {
    const __auth = requireAuth(event)
    const payload = await readValidatedBody(event, insertTerm.parse)
    const db = await useDB(event)
    const resp = dbQueries(db).terms.insert(payload)
    return resp
  } catch (error: any) {
    return error
  }
})
