import { createInsertSchema } from 'drizzle-zod'
import { interventions } from '~~/server/database/schema'

export type RequestCreateIntervention = typeof interventions.$inferInsert

export const requestCreateInterventionSchema = createInsertSchema(interventions).omit({ created_by: true })

export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)
  const body = await readValidatedBody(event, requestCreateInterventionSchema.safeParse)

  if (body.error) {
    throw createError({ statusCode: 400, ...body.error })
  }
  const payload = { ...body.data, created_by: user.user.id }

  const db = await useDB()
  const resp = await db.insert(interventions).values(payload).returning()

  return resp
})
