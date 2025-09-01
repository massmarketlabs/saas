import type { MultiPartData } from 'h3'
import { GetObjectCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { v4 as uuidv4 } from 'uuid'
import { runtimeConfig } from './runtimeConfig'

export const s3Client = new S3Client({
  region: 'us-west-1',
  endpoint: runtimeConfig.s3_endpoint,
  tls: false, // TODO: Remove for production
  forcePathStyle: true, // TODO: Remove for production
  credentials: {
    accessKeyId: runtimeConfig.s3_access_key_id,
    secretAccessKey: runtimeConfig.s3_secret_key
  }
})

const S3_BUCKET_NAME = 'avatars'

export const getSignedAvatarUrl = async (key: string, expiry = 3600) => {
  const getObjectCommand = new GetObjectCommand({
    Bucket: S3_BUCKET_NAME,
    Key: key
  })

  try {
    // First check if object exists (optional)
    await s3Client.send(new GetObjectCommand({
      Bucket: S3_BUCKET_NAME,
      Key: key,
      Range: 'bytes=0-0' // Just check if it exists without downloading
    }))

    // Generate presigned URL
    const presignedUrl = await getSignedUrl(s3Client, getObjectCommand, {
      expiresIn: expiry
    })

    return {
      success: true,
      url: presignedUrl,
      key
    }
  } catch (error: any) {
    console.error('S3 Presigned URL Error:', error)

    // Handle specific S3 errors
    if (error.name === 'NoSuchKey') {
      throw createError({
        statusCode: 404,
        statusMessage: 'File not found'
      })
    }

    if (error.name === 'AccessDenied') {
      throw createError({
        statusCode: 403,
        statusMessage: 'Access denied'
      })
    }

    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to generate download URL'
    })
  }
}

export const createAvatarObject = async (files: MultiPartData[]) => {
  const file = files[0] // Assuming single file upload
  const uniqueKey = `${uuidv4()}-${file.filename}`

  const uploadCommand = new PutObjectCommand({
    Bucket: S3_BUCKET_NAME,
    Key: uniqueKey,
    Body: file.data, // file.data is a Buffer
    ContentType: file.type
    // Remove ACL since we're using presigned URLs for access control
  })

  try {
    // Upload the file to S3
    await s3Client.send(uploadCommand)

    // Create a presigned URL for downloading the file (valid for 1 week)
    const presignedUrl = await getSignedAvatarUrl(uniqueKey)

    return presignedUrl
  } catch (error) {
    console.error('S3 Upload Error:', error)
    throw createError({ statusCode: 500, statusMessage: 'File upload failed' })
  }
}
