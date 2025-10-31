import type { H3Event } from 'h3'
import { GetObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { v4 } from 'uuid'
import { storageRepo } from './repo'

// type S3BucketNames = 'attachments' | 'avatars'

export const storageService = () => {
  const uploadAttachments = async (event: H3Event) => {
    const bucket = getRouterParam(event, 'bucket')

    if (!bucket || !['attachments', 'avatars'].includes(bucket)) {
      throw createError({
        statusCode: 400,
        message: 'Bad request: bucket does not exist'
      })
    }

    const files = await readMultipartFormData(event)
    if (!files || files.length === 0) {
      throw createError({
        status: 400,
        message: 'Bad request: No files provided'
      })
    }

    const db = await useDB(event)
    const repo = storageRepo({ db })
    const uploadedFiles = []

    for (let index = 0; index < files.length; index++) {
      const element = files[index]
      const fileId = v4()
      const fileName = element.filename || `upload-${fileId}`
      const size = element.data.byteLength

      try {
        // Upload to S3
        const command = new PutObjectCommand({
          Bucket: bucket,
          Key: fileId,
          Body: element.data,
          ContentType: element.type
        })

        await s3Client.send(command)

        // Save metadata to database
        const record = await repo.create({
          id: fileId,
          name: fileName,
          path: `${bucket}/${fileId}`,
          size,
          bucket,
          mime_type: element.type
        })

        uploadedFiles.push({
          id: record.data.id,
          fileName: record.data.name,
          size: record.data.size
        })
      } catch (error) {
        console.error(`Failed to upload file ${fileName}:`, error)
        throw createError({
          status: 500,
          message: `Failed to upload file: ${fileName}`
        })
      }
    }

    return uploadedFiles
  }

  const getById = async (event: H3Event, id: string) => {
    const db = await useDB(event)
    const repo = storageRepo({ db })
    const file = await repo.read({ id })
    if (!file) {
      throw createError({
        statusCode: 404,
        message: 'Attachment not found'
      })
    }
    const command = new GetObjectCommand({
      Bucket: file.bucket,
      Key: file.id

    })

    const presignedUrl = await getSignedUrl(s3Client, command, {
      expiresIn: 3600
    })

    return { url: presignedUrl, type: file.mime_type }// Add this line
  }
  return {
    uploadAttachments,
    getById
  }
}
