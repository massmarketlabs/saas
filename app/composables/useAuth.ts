// app/composables/useAuth
// import type { Subscription } from '@better-auth/stripe'
import type {
  ClientOptions,
  InferSessionFromClient
} from 'better-auth/client'
import type { RouteLocationRaw } from 'vue-router'
// import { stripeClient } from '@better-auth/stripe/client'
import { adminClient } from 'better-auth/client/plugins'
import { createAuthClient } from 'better-auth/vue'
import { ac, admin, beneficiary, instructor } from '~~/server/utils/permissions'

export function useAuth() {
  const url = useRequestURL()
  const toast = useToast()

  const headers = import.meta.server ? useRequestHeaders() : undefined

  const client = createAuthClient({
    baseURL: url.origin,
    fetchOptions: {
      headers
    },
    plugins: [
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

  const session = useState<InferSessionFromClient<ClientOptions> | null>('auth:session', () => null)
  const user = useState<UserWithRole | null>('auth:user', () => null)
  // const subscriptions = useState<Subscription[]>('auth:subscriptions', () => [])
  const sessionFetching = import.meta.server ? ref(false) : useState('auth:sessionFetching', () => false)

  const fetchSession = async () => {
    if (sessionFetching.value) {
      return
    }
    sessionFetching.value = true

    try {
      // Fetch all data concurrently instead of sequentially
      const sessionReq = await client.useSession(useFetch)

      // Update state with fetched data
      if (sessionReq.error.value) {
        console.error('sessionReq ', sessionReq.error.value)
      } else {
        session.value = sessionReq.data.value?.session || null
        user.value = sessionReq.data.value?.user ? { ...sessionReq.data.value.user, role: sessionReq.data.value.user.role ?? undefined } : null
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
          onSuccess: () => {
            session.value = null
            user.value = null

            clearNuxtState([
              'auth:session',
              'auth:user',
              'auth:sessionFetching' // Consider clearing this too
            ])
          },
          onError: (res) => {
            toast.add({
              color: 'error',
              title: res.error.message
            })
          }
        }
      })

      if (redirectTo) {
        await navigateTo(redirectTo)
      }

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
