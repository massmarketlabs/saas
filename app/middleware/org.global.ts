export default defineNuxtRouteMiddleware(async (to) => {
  const localePath = useLocalePath()
  const { loggedIn, organizations } = useAuth()

  // Wait for auth to be fully loaded
  if (!loggedIn.value) {
    return
  }

  // Skip check if already on onboarding page to avoid redirect loop
  if (to.path.startsWith(localePath('/organization/onboarding'))) {
    return
  }

  if (!organizations.value || organizations.value.length === 0) {
    return navigateTo(localePath('/organization/onboarding'))
  }
})
