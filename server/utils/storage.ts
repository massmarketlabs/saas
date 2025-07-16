import { S3Client } from '@aws-sdk/client-s3'
import { runtimeConfig } from './runtimeConfig'

export const s3Client = new S3Client({
  region: 'auto',
  endpoint: runtimeConfig.r2_endpoint,
  credentials: {
    accessKeyId: runtimeConfig.r2_access_key_id,
    secretAccessKey: runtimeConfig.r2_secret_access_key

  }
})
