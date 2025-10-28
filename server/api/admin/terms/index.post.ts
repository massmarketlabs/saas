import { interventionRepo } from '~~/server/internal/intervention/repo'
import { insertTerm } from '~~/server/internal/intervention/zod-types'

export default defineEventHandler(async (event) => {
  try {
    const __auth = requireAuth(event)
    const payload = await readValidatedBody(event, insertTerm.parse)
    const db = await useDB(event)
    const resp = await interventionRepo(db).createTerm(payload)
    return resp
  } catch (error: any) {
    return error
  }
})
