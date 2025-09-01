import { createError, defineEventHandler, getQuery } from 'h3'
import { getSignedAvatarUrl } from '~~/server/utils/storage'

export default defineEventHandler(async (event) => {
  // Optional: Add authentication if needed
  const __session = await requireAuth(event)

  // Get the key from query parameters or route params
  const { key, expiresIn = '3600' } = getQuery<{ key: string, expiresIn: string }>(event)
  console.log({ key })
  if (!key) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Object key is required'
    })
  }

  // Validate expiresIn (max 7 days for presigned URLs)
  const maxExpiry = 604800 // 7 days in seconds
  const expiry = Math.min(Number.parseInt(expiresIn) || 3600, maxExpiry)

  return await getSignedAvatarUrl(key, expiry)
})
