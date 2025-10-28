import { service } from '~~/server/internal/storage/service'

export default defineEventHandler(async (event) => {
  const session = await requireAuth(event)

  const data = await readMultipartFormData(event)

  if (!data) {
    throw createError({
      status: 400,
      message: 'No attachments found'
    })
  }

  const storageService = service(event, 'attachments')

  const uploadedFiles = await storageService.uploadAttachments()

  console.log({ uploadedFiles, session: session.user })

  return uploadedFiles
})
