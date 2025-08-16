import { dbQueries, insertInterventionEnrollment } from '~~/server/database'

export default defineEventHandler(async (event) => {
  try {
    const __user = await requireAuth(event)
    const body = await readValidatedBody(event, insertInterventionEnrollment.parse)
    const db = await useDB(event)
    return await dbQueries(db).interventions.toggleEnrollment({ user_id: body.user_id, intervention_id: body.intervention_id })
  } catch (error) {
    console.log('Validation error:', error)
    throw createError({
      statusCode: 400,
      message: `Validation failed: ${error}`
    })
  }
})
