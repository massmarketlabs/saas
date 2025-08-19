import * as schema from '~~/server/database/schema'

export default defineEventHandler(async (event) => {
  const __user = await requireAuth(event)
  const db = await useDB(event)
  return await db.select().from(schema.terms)
})
