import { defineEventHandler, readMultipartFormData } from 'h3'
import { createAvatarObject } from '~~/server/utils/storage'

export default defineEventHandler(async (event) => {
  const __session = await requireAuth(event)
  const formData = await readMultipartFormData(event)

  if (!formData || formData.length === 0) {
    throw createError({ statusCode: 400, statusMessage: 'No files uploaded' })
  }

  return await createAvatarObject(formData)
})
