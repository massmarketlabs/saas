import { interventionService } from '~~/server/internal/intervention'

export default defineEventHandler(async (event) => {
  const service = interventionService(event)
  return await service.updateSyllabusId()
})
