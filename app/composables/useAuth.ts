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
      const sessionReq = await client.useSession(useFetch)

      // Update state with fetched data
      if (sessionReq.error.value) {
        console.error('sessionReq ', sessionReq.error.value)
      } else {
        session.value = sessionReq.data.value?.session || null
        user.value = sessionReq.data.value?.user ? { ...sessionReq.data.value.user, role: sessionReq.data.value.user.role ?? undefined } : null
      }

      await Promise.all([
        client.organization.getFullOrganization({
          fetchOptions: {
            onSuccess: (activeOrgReq) => {
              activeOrganization.value = activeOrgReq.data
            },
            onError: (activeOrgReq) => {
              console.error('activeOrgReq: ', activeOrgReq.error)
            }
          }
        }),
        client.organization.list({
          fetchOptions: {
            onSuccess: (orgsReq) => {
              organizations.value = orgsReq.data
            },
            onError: (orgsReq) => {
              console.error('organizations: ', orgsReq.error)
            }
          }
        }),
        client.organization.getActiveMember({
          fetchOptions: {
            onSuccess: (activeMemberReq) => {
              activeMember.value = activeMemberReq.data
            },
            onError: (activeMemberReq) => {
              console.error('activeMember: ', activeMemberReq.error)
            }
          }
        })
      ])

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
    try {
      sessionFetching.value = true
      const res = await client.signOut({
        fetchOptions: {
          onSuccess: () => {
            session.value = null
            user.value = null
            activeOrganization.value = null
            organizations.value = null
            activeMember.value = null

            clearNuxtState([
              'auth:session',
              'auth:user',
              'auth:activeOrganization', // This was missing
              'auth:organizations',
              'auth:member',
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
