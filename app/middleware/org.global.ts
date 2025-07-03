export default defineNuxtRouteMiddleware(async (to) => {
  const localePath = useLocalePath()
  const { client, loggedIn, session } = useAuth()

  // Wait for auth to be fully loaded
  if (!loggedIn.value) {
    return
  }

  // Skip check if already on onboarding page to avoid redirect loop
  if (to.path.startsWith(localePath('/organization/onboarding'))) {
    return
  }

  try {
    const orgs = await client.organization.list()

    if (!orgs.data || orgs.data.length === 0) {
      return navigateTo(localePath('/organization/onboarding'))
    }
  } catch (error) {
    console.error('Failed to fetch organizations:', error)
    // optionally handle error (e.g., show toast, redirect to error page, etc.)
  }
})
