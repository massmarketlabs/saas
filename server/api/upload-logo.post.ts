// server/api/upload-logo.post.ts
import { PutObjectCommand } from '@aws-sdk/client-s3'
import { readMultipartFormData } from 'h3'
import { v4 as uuidv4 } from 'uuid'
import { s3Client } from '~~/server/utils/storage'

export default defineEventHandler(async (event) => {
  const form = await readMultipartFormData(event)
  const file = form?.find(field => field.name === 'logo')

  if (!file || !file.data || !file.filename) {
    throw createError({ statusCode: 400, message: 'Invalid logo file' })
  }

  const fileExt = file.filename.split('.').pop()
  const objectKey = `org-logos/${uuidv4()}.${fileExt}`

  const payload = new PutObjectCommand({
    Bucket: process.env.R2_BUCKET,
    Key: objectKey,
    Body: file.data,
    ContentType: file.type
  })

  await s3Client.send(payload)

  const publicUrl = `${process.env.R2_PUBLIC_DOMAIN}/${objectKey}`

  return { key: objectKey, url: publicUrl }
})
