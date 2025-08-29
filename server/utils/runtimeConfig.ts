import type { NitroRuntimeConfig } from 'nitropack/types'
import { config } from 'dotenv'

let runtimeConfigInstance: NitroRuntimeConfig

export const generateRuntimeConfig = () => ({
  preset: process.env.NUXT_NITRO_PRESET,
  betterAuthSecret: process.env.NUXT_BETTER_AUTH_SECRET,
  // Stripe
  // stripeSecretKey: process.env.NUXT_STRIPE_SECRET_KEY,
  // stripeWebhookSecret: process.env.NUXT_STRIPE_WEBHOOK_SECRET,
  // stripePriceIdProMonth: process.env.NUXT_STRIPE_PRICE_ID_PRO_MONTH,
  // stripePriceIdProYear: process.env.NUXT_STRIPE_PRICE_ID_PRO_YEAR,
  // Resend
  resendApiKey: process.env.NUXT_RESEND_API_KEY,
  // Github
  // githubClientId: process.env.NUXT_GH_CLIENT_ID,
  // githubClientSecret: process.env.NUXT_GH_CLIENT_SECRET,
  // Google
  googleClientId: process.env.NUXT_GOOGLE_CLIENT_ID,
  googleClientSecret: process.env.NUXT_GOOGLE_CLIENT_SECRET,
  // DB
  redisUrl: process.env.NUXT_REDIS_URL,
  databaseUrl: process.env.NUXT_DATABASE_URL,
  // S3 Storage
  s3_endpoint: process.env.S3_ENDPOINT,
  s3_access_key_id: process.env.S3_ACCESS_KEY_ID,
  s3_secret_key: process.env.S3_SECRET_KEY,
  public: {
    baseURL: process.env.NUXT_APP_URL,
    appName: process.env.NUXT_APP_NAME,
    companyName: process.env.NUXT_COMPANY_NAME,
    appEnv: process.env.NODE_ENV,
    appRepo: process.env.NUXT_APP_REPO,
    appNotifyEmail: process.env.NUXT_APP_NOTIFY_EMAIL,
    appContactEmail: process.env.NUXT_APP_CONTACT_EMAIL,
    auth: {
      redirectUserTo: '/',
      redirectGuestTo: '/signin'
    }
  }
})

if (typeof useRuntimeConfig !== 'undefined') {
  runtimeConfigInstance = useRuntimeConfig()
} else {
  // for cli: npm run auth:schema
  config()
  runtimeConfigInstance = generateRuntimeConfig() as NitroRuntimeConfig
}

export const runtimeConfig = runtimeConfigInstance
