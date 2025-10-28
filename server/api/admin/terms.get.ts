import * as schema from '~~/server/internal/schemas'

export default defineEventHandler(async (event) => {
  const __user = await requireAuth(event)
  const db = await useDB(event)
  return await db.select().from(schema.terms)
})
