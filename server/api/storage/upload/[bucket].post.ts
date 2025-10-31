import { storageService } from '~~/server/internal/storage/service'

export default defineEventHandler(async (event) => {
  const __session = await requireAuth(event)

  const service = storageService()

  const uploadedFiles = await service.uploadAttachments(event)

  return uploadedFiles
})
