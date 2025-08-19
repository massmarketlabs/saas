import { asc } from 'drizzle-orm'
import { programs } from '~~/server/database/schema'

export default defineEventHandler(async (event) => {
  const __user = await requireAuth(event)

  const db = await useDB(event)

  const resp = await db
    .select()
    .from(programs)
    .orderBy(p => asc(p.name))

  return resp
})
