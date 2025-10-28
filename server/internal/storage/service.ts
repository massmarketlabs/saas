import type { H3Event } from 'h3'
import { PutObjectCommand } from '@aws-sdk/client-s3'
import { v4 } from 'uuid'
import { storageRepo } from './repo'

export const service = (event: H3Event, bucket: 'attachments' | 'avatars') => {
  const uploadAttachments = async () => {
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

  return {
    uploadAttachments
  }
}
