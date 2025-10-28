import { GetObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { authRepo } from '~~/server/internal/auth/repo'

export default defineEventHandler(async (event) => {
  const session = await requireAuth(event)
  const id = getRouterParam(event, 'id')
  if (!id) {
    throw createError({ statusCode: 400, message: 'ID param is required.' })
  }
  const db = await useDB(event)
  const resp = await authRepo(db).getById(id)
  const userId = session.user.id
  const auditParams = extractAuditParams(event)

  await logAuditEvent({
    targetId: id,
    userId,
    action: 'Access granted to view user profile',
    category: 'users',
    status: 'success',
    details: 'View full user profile',
    userAgent: auditParams?.userAgent,
    ipAddress: auditParams?.ipAddress,
    targetType: 'user'
  })

  if (!resp) {
    throw createError({ status: 404, message: `User ${id} not found.` })
  }

  if (!resp.image) {
    return { ...resp, imageUrl: null }
  }

  const S3_BUCKET_NAME = 'avatars'

  const getObjectCommand = new GetObjectCommand({
    Bucket: S3_BUCKET_NAME,
    Key: resp.image
  })

  const presignedUrl = await getSignedUrl(s3Client, getObjectCommand, {
    expiresIn: 3600
  })
  const rtn = { ...resp, imageUrl: presignedUrl }
  return rtn
})
