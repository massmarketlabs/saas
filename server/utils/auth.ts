import type { H3Event } from 'h3'
import { betterAuth } from 'better-auth'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import { APIError, createAuthMiddleware } from 'better-auth/api'
import { admin as adminPlugin, openAPI, organization } from 'better-auth/plugins'
import { eq } from 'drizzle-orm'
import { v7 as uuidv7 } from 'uuid'
import { getDefaultOrganization } from '../database/repository/organization'
import * as schema from '../database/schema'
import { user as userSchema } from '../database/schema'
import { logAuditEvent } from './auditLogger'
import { getDB } from './db'
import {
  // cacheClient,
  resendInstance
} from './drivers'
import { ac, admin, owner, project_manager, user } from './permissions'
import { runtimeConfig } from './runtimeConfig'

// import { setupStripe } from './stripe'

console.log(`Base URL is ${runtimeConfig.public.baseURL}`)

const createBetterAuth = () => betterAuth({
  baseURL: runtimeConfig.public.baseURL,
  secret: runtimeConfig.betterAuthSecret,
  trustedOrigins: ['http://localhost:3000', 'https://tyo.massmarketlabs.com'],
  database: drizzleAdapter(
    getDB(),
    {
      provider: 'pg',
      schema
    }
  ),
  advanced: {
    database: {
      generateId: () => {
        return uuidv7()
      }
    }
  },
  // secondaryStorage: cacheClient,
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
    sendResetPassword: async ({ user, url }) => {
      const response = await resendInstance.emails.send({
        from: `${runtimeConfig.public.appName} <${runtimeConfig.public.appNotifyEmail}>`,
        to: user.email,
        subject: 'Reset your password',
        text: `Click the link to reset your password: ${url}`
      })
      await logAuditEvent({
        userId: user.id,
        category: 'email',
        action: 'reset_password',
        targetType: 'email',
        targetId: user.email,
        status: response.error ? 'failure' : 'success',
        details: response.error?.message
      })
      if (response.error) {
        console.error(`Failed to send reset password email: ${response.error.message}`)
        throw createError({
          statusCode: 500,
          statusMessage: 'Internal Server Error'
        })
      }
    }
  },
  emailVerification: {
    sendOnSignUp: true,
    autoSignInAfterVerification: true,
    sendVerificationEmail: async ({ user, url }) => {
      const response = await resendInstance.emails.send({
        from: `${runtimeConfig.public.appName} <${runtimeConfig.public.appNotifyEmail}>`,
        to: user.email,
        subject: 'Verify your email address',
        text: `Click the link to verify your email: ${url}`
      })
      await logAuditEvent({
        userId: user.id,
        category: 'email',
        action: 'verification',
        targetType: 'email',
        targetId: user.email,
        status: response.error ? 'failure' : 'success',
        details: response.error?.message
      })
      if (response.error) {
        console.error(`Failed to send verification email: ${response.error.message}`)
        throw createError({
          statusCode: 500,
          statusMessage: 'Internal Server Error'
        })
      }
    }
  },
  socialProviders: {
    google: {
      clientId: runtimeConfig.googleClientId!,
      clientSecret: runtimeConfig.googleClientSecret!
    }
  },
  account: {
    accountLinking: {
      enabled: true
    },
    updateAccountOnSignIn: true
  },
  databaseHooks: {
    session: {
      create: {
        before: async (session) => {
          const org = await getDefaultOrganization(session.userId)
          return {
            data: {
              ...session,
              activeOrganizationId: org?.id
            }
          }
        }
      }
    }
  },
  hooks: {
    after: createAuthMiddleware(async (ctx) => {
      const ipAddress = ctx.getHeader('x-forwarded-for')
        || ctx.getHeader('remoteAddress') || undefined
      const userAgent = ctx.getHeader('user-agent') || undefined

      let targetType
      let targetId
      if (ctx.context.session) {
        targetType = 'user'
        targetId = ctx.context.session.user.id
      } else if (['/sign-in/email', '/sign-up/email', 'forget-password'].includes(ctx.path)) {
        targetType = 'email'
        targetId = ctx.body.email || ''
      }

      if (ctx.context.returned && ctx.context.returned instanceof APIError) {
        await logAuditEvent({
          userId: ctx.context.session?.user.id,
          category: 'auth',
          action: ctx.path,
          targetType,
          targetId,
          ipAddress,
          userAgent,
          status: 'failure',
          details: ctx.context.returned.body?.message
        })
      } else {
        if (['/sign-in/email', '/sign-up/email', '/forget-password', '/reset-password'].includes(ctx.path)) {
          let userId: string | undefined
          if (['/sign-in/email', '/sign-up/email'].includes(ctx.path)) {
            userId = ctx.context.newSession?.user.id
          } else {
            userId = ctx.context.session?.user.id
          }
          await logAuditEvent({
            userId,
            category: 'auth',
            action: ctx.path,
            targetType,
            targetId,
            ipAddress,
            userAgent,
            status: 'success'
          })
        }
      }
    })
  },
  plugins: [
    ...(runtimeConfig.public.appEnv === 'development' ? [openAPI()] : []),
    adminPlugin(),
    organization({
      ac,
      roles: {
        admin,
        user,
        project_manager,
        owner
      },
      organizationCreation: {
        afterCreate: async ({ user: activeUser, organization }) => {
          // Assign the creator the 'admin' role for the newly created organization
          const db = getDB()

          await db.update(userSchema)
            .set({ role: 'admin' })
            .where(eq(userSchema.id, activeUser.id))

          // Optionally log this as an audit event
          await logAuditEvent({
            userId: activeUser.id,
            category: 'organization',
            action: 'assign_admin_role',
            targetType: 'organization',
            targetId: organization.id,
            status: 'success',
            details: `User ${activeUser.id} assigned as admin to organization ${organization.id}`
          })
        }
      }
    })
    // setupStripe()
  ]
})

let _auth: ReturnType<typeof createBetterAuth>

// Used by npm run auth:schema only.
const isAuthSchemaCommand = process.argv.some(arg => arg.includes('server/database/schema/auth.ts'))
if (isAuthSchemaCommand) {
  _auth = createBetterAuth()
}
export const auth = _auth!

export const useServerAuth = () => {
  if (runtimeConfig.preset == 'node-server') {
    if (!_auth) {
      _auth = createBetterAuth()
    }
    return _auth
  } else {
    return createBetterAuth()
  }
}

export const getAuthSession = async (event: H3Event) => {
  const headers = event.headers
  const serverAuth = useServerAuth()
  const session = await serverAuth.api.getSession({
    headers
  })
  return session
}

export const requireAuth = async (event: H3Event) => {
  const session = await getAuthSession(event)
  if (!session) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthorized'
    })
  }
  // Save the session to the event context for later use
  event.context.auth = session!
  return session!
}
