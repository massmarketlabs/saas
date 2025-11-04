import { interventionService } from '~~/server/internal/intervention'

export default defineEventHandler(async (event) => {
  const __session = await requireAuth(event)

  const service = interventionService(event)

  return await service.createSubject()
})
