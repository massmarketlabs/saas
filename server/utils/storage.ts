import { S3Client } from '@aws-sdk/client-s3'
import { runtimeConfig } from './runtimeConfig'

export const s3Client = new S3Client({
  region: 'auto',
  endpoint: runtimeConfig.s3_endpoint,
  credentials: {
    accessKeyId: runtimeConfig.s3_access_key_id,
    secretAccessKey: runtimeConfig.s3_secret_key
  }
})
