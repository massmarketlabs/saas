import type { Subscription } from '@better-auth/stripe'
import type {
  ClientOptions,
  InferSessionFromClient
} from 'better-auth/client'
import type { RouteLocationRaw } from 'vue-router'
// import { stripeClient } from '@better-auth/stripe/client'
import { adminClient } from 'better-auth/client/plugins'
import { createAuthClient } from 'better-auth/vue'

export function useAuth() {
  const url = useRequestURL()
  const headers = import.meta.server ? useRequestHeaders() : undefined

  const client = createAuthClient({
    baseURL: url.origin,
    fetchOptions: {
      headers
    },
    plugins: [
      adminClient()
      // stripeClient({
      //   subscription: true
      // })
    ]
  })

  const session = useState<InferSessionFromClient<ClientOptions> | null>('auth:session', () => null)
  const user = useState<UserWithRole | null>('auth:user', () => null)
  const subscriptions = useState<Subscription[]>('auth:subscriptions', () => [])
  const sessionFetching = import.meta.server ? ref(false) : useState('auth:sessionFetching', () => false)

  const fetchSession = async () => {
    if (sessionFetching.value) {
      return
    }
    sessionFetching.value = true
    const { data } = await client.useSession(useFetch)
    session.value = data.value?.session || null
    user.value = data.value?.user ? { ...data.value.user, role: data.value.user.role ?? undefined } : null
    // if (user.value) {
    //   const { data: subscriptionData } = await client.subscription.list()
    //   subscriptions.value = subscriptionData || []
    // } else {
    //   subscriptions.value = []
    // }
    sessionFetching.value = false
    return data
  }

  if (import.meta.client) {
    client.$store.listen('$sessionSignal', async (signal) => {
      if (!signal)
        return
      await fetchSession()
    })
  }

  return {
    session,
    user,
    // subscription: client.subscription,
    subscriptions,
    loggedIn: computed(() => !!session.value),
    activeSubscription: computed(() => {
      return subscriptions.value.find(
        sub => sub.status === 'active' || sub.status === 'trialing'
      )
    }),
    signIn: client.signIn,
    signUp: client.signUp,
    forgetPassword: client.forgetPassword,
    resetPassword: client.resetPassword,
    sendVerificationEmail: client.sendVerificationEmail,
    errorCodes: client.$ERROR_CODES,
    async signOut({ redirectTo }: { redirectTo?: RouteLocationRaw } = {}) {
      const res = await client.signOut()
      session.value = null
      user.value = null
      if (redirectTo) {
        await navigateTo(redirectTo)
      }
      return res
    },
    fetchSession,
    client
  }
}
