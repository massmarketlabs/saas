// app/composables/useAuth
// import type { Subscription } from '@better-auth/stripe'
import type {
  BetterAuthClientPlugin
} from 'better-auth/client'
import type { RouteLocationRaw } from 'vue-router'
// import { stripeClient } from '@better-auth/stripe/client'
import { adminClient, inferAdditionalFields } from 'better-auth/client/plugins'
import { createAuthClient } from 'better-auth/vue'
import { ac, admin, beneficiary, instructor } from '~~/server/utils/permissions'

export function useAuth() {
  const url = useRequestURL()
  const toast = useToast()

  const headers = import.meta.server ? useRequestHeaders() : undefined
  // Add Origin header on server
  const client = createAuthClient({
    baseURL: url.origin,
    fetchOptions: {
      headers: { ...headers, origin: url.origin }
    },
    plugins: [
      inferAdditionalFields<typeof auth>(),
      adminClient({
        ac,
        roles: {
          admin,
          beneficiary,
          instructor
        }
      })
      // stripeClient({
      //   subscription: true
      // })
    ]
  })
  const session = useState<BetterAuthClientPlugin | null>('auth:session', () => null)
  const user = useState<UserWithRole | null>('auth:user', () => null)
  const isAdmin = useState('auth:isAdmin', () => false)
  // const subscriptions = useState<Subscription[]>('auth:subscriptions', () => [])
  const sessionFetching = import.meta.server ? ref(false) : useState('auth:sessionFetching', () => false)
  const fetchSession = async () => {
    if (sessionFetching.value) {
      return
    }
    // console.log({ headers })
    sessionFetching.value = true

    try {
      // Fetch all data concurrently instead of sequentially
      const sessionReq = await client.getSession()
      // Update state with fetched data
      if (sessionReq.error) {
        console.error('sessionReq ', sessionReq.error)
      } else {
        session.value = sessionReq.data?.session || null
        user.value = sessionReq.data?.user ? { ...sessionReq.data.user, role: sessionReq.data.user.role ?? undefined } : null

        const adminStatus = await client.admin.hasPermission({ userId: user.value?.id, permission: { administration: ['full'] } })
        // console.log({ adminStatus })
        if (adminStatus.data?.success) {
          isAdmin.value = true
        }
      }

      // if (user.value) {
      //   const { data: subscriptionData } = await client.subscription.list()
      //   subscriptions.value = subscriptionData || []
      // } else {
      //   subscriptions.value = []
      // }

      // return data
    } finally {
      sessionFetching.value = false
    }
  }

  const signOut = async ({ redirectTo }: { redirectTo?: RouteLocationRaw } = {}) => {
    try {
      sessionFetching.value = true
      const res = await client.signOut({
        fetchOptions: {
          onSuccess: async () => {
            session.value = null
            user.value = null

            clearNuxtState([
              'auth:session',
              'auth:user',
              'auth:sessionFetching'
            ])
            if (redirectTo) {
              await navigateTo(redirectTo)
            }
          },
          onError: (res) => {
            toast.add({
              color: 'error',
              title: res.error.message
            })
          }
        }
      })

      return res
    } catch (err) {
      console.error('error signing out', err)
    } finally {
      sessionFetching.value = false
    }
  }

  // if (import.meta.client) {
  //   client.$store.listen('$sessionSignal', async (signal) => {
  //     if (!signal || sessionFetching.value)
  //       return
  //     await fetchSession()
  //   })
  // }

  return {
    session,
    user,
    isAdmin,
    // subscription: client.subscription,
    // subscriptions,
    loggedIn: computed(() => !!session.value),
    // activeSubscription: computed(() => {
    //   return subscriptions.value.find(
    //     sub => sub.status === 'active' || sub.status === 'trialing'
    //   )
    // }),
    signIn: client.signIn,
    signUp: client.signUp,
    forgetPassword: client.forgetPassword,
    resetPassword: client.resetPassword,
    sendVerificationEmail: client.sendVerificationEmail,
    errorCodes: client.$ERROR_CODES,
    client,
    sessionFetching,
    signOut,
    fetchSession
  }
}
