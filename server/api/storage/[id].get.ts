// api/storage/[id].get.ts
import { storageService } from '~~/server/internal/storage/service'

export default defineEventHandler(async (event) => {
  const __session = await requireAuth(event)
  const service = storageService()

  const id = getRouterParam(event, 'id')
  if (!id) {
    throw createError({ statusCode: 400, message: 'ID is required param.' })
  }
  return await service.getById(event, id)
})
