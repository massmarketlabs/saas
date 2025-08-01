import { eq } from 'drizzle-orm'
import { programs } from '~~/server/database/schema'

export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)

  if (!user.session.activeOrganizationId) {
    throw createError({
      message: 'Active Organization ID not set',
      statusCode: 400
    })
  }

  const db = await useDB()

  const resp = await db
    .select()
    .from(programs)
    .where(eq(programs.organization_id, user.session.activeOrganizationId))

  return resp
})
