// app/composables/useAuth
// import type { Subscription } from '@better-auth/stripe'
import type {
  ClientOptions,
  InferSessionFromClient
} from 'better-auth/client'
import type { Member, Organization } from 'better-auth/plugins'
import type { RouteLocationRaw } from 'vue-router'
// import { stripeClient } from '@better-auth/stripe/client'
import { adminClient, organizationClient } from 'better-auth/client/plugins'
import { createAuthClient } from 'better-auth/vue'
import { ac, admin, project_manager, user as userPermission } from '~~/server/utils/permissions'

export function useAuth() {
  const url = useRequestURL()
  const localePath = useLocalePath()
  const toast = useToast()

  const headers = import.meta.server ? useRequestHeaders() : undefined

  const client = createAuthClient({
    baseURL: url.origin,
    fetchOptions: {
      headers
    },
    plugins: [
      adminClient(),
      organizationClient({
        ac,
        roles: {
          admin,
          user: userPermission,
          project_manager
        }
      })
      // stripeClient({
      //   subscription: true
      // })
    ]
  })

  const session = useState<InferSessionFromClient<ClientOptions> | null>('auth:session', () => null)
  const user = useState<UserWithRole | null>('auth:user', () => null)
  const activeOrganization = useState<Organization | null>('auth:activeOrganization', () => null)
  const organizations = useState<Organization[] | null>('auth:organizations', () => null)
  const activeMember = useState<Member | null>('auth:member', () => null)
  // const subscriptions = useState<Subscription[]>('auth:subscriptions', () => [])
  const sessionFetching = import.meta.server ? ref(false) : useState('auth:sessionFetching', () => false)

  const fetchSession = async () => {
    if (sessionFetching.value) {
      return
    }
    sessionFetching.value = true

    try {
      // Fetch all data concurrently instead of sequentially
      const [
        sessionReq,
        activeOrgReq,
        orgsReq,
        activeMemberReq
      ] = await Promise.all([
        client.useSession(useFetch),
        client.organization.getFullOrganization(),
        client.organization.list(),
        client.organization.getActiveMember()
      ])

      // Update state with fetched data
      const { data } = sessionReq
      session.value = data.value?.session || null
      user.value = data.value?.user ? { ...data.value.user, role: data.value.user.role ?? undefined } : null
      activeOrganization.value = activeOrgReq.data
      organizations.value = orgsReq.data
      activeMember.value = activeMemberReq.data

      // if (user.value) {
      //   const { data: subscriptionData } = await client.subscription.list()
      //   subscriptions.value = subscriptionData || []
      // } else {
      //   subscriptions.value = []
      // }

      return data
    } finally {
      sessionFetching.value = false
    }
  }

  const handleChangeActiveOrganization = async (payload: string) => {
    try {
      sessionFetching.value = true
      // Set the active organization using the selected ID
      const resp = await client.organization.setActive({ organizationId: payload })
      if (resp.data) {
        activeOrganization.value = resp.data
        await navigateTo(localePath(`/${resp.data.slug}/admin/dashboard`))
      }
    } catch (error) {
      console.error('Failed to change active organization:', error)
      // Optionally show an error toast/notification here
    } finally {
      sessionFetching.value = false
    }
  }

  const signOut = async ({ redirectTo }: { redirectTo?: RouteLocationRaw } = {}) => {
    const res = await client.signOut()
    if (res.error) {
      toast.add({
        color: 'error',
        title: res.error.message
      })
      return res
    }

    session.value = null
    user.value = null
    activeOrganization.value = null
    organizations.value = null
    activeMember.value = null

    if (redirectTo) {
      await navigateTo(redirectTo)
    }
    return res
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
    organization: client.organization,
    errorCodes: client.$ERROR_CODES,
    client,
    activeOrganization,
    organizations,
    activeMember,
    sessionFetching,
    signOut,
    fetchSession,
    handleChangeActiveOrganization
  }
}
