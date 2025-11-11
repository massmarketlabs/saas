import { interventionService } from '~~/server/internal/intervention/service'

export default defineEventHandler(async (event) => {
  const intervention_id = getRouterParam(event, 'id')

  if (!intervention_id)
    throw createError({ statusCode: 400, message: 'Intervention ID required' })

  const s = interventionService(event)
  const resp = await s.getInterventionClasslist(intervention_id)
  return resp
})
