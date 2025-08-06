import { programs } from '~~/server/database/schema'

export default defineEventHandler(async (event) => {
  const __user = await requireAuth(event)

  const db = await useDB()

  const resp = await db
    .select()
    .from(programs)

  return resp
})
