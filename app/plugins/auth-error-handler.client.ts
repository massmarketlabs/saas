// plugins/auth-error-handler.client.ts
export default defineNuxtPlugin((nuxtApp) => {
  // Handle unhandled promise rejections (for fetch errors)
  if (import.meta.client) {
    window.addEventListener('unhandledrejection', async (event) => {
      const error = event.reason

      // Check if it's a fetch error with 401 status
      if (error?.response?.status === 401 || error?.status === 401) {
        event.preventDefault()
        await handleAuthError()
      }
    })
  }

  // Handle Nuxt errors
  nuxtApp.hook('app:error', async (error) => {
    // Check for 401 errors
    if (error?.statusCode === 401 || error?.response?.status === 401) {
      await handleAuthError()
    }
  })
})

async function handleAuthError() {
  // const { $auth } = useNuxtApp()
  const auth = useAuth()
  const localePath = useLocalePath()

  try {
    // Clear better-auth session
    await auth.signOut({ redirectTo: localePath('/signin') })

    // Clear any additional client-side storage if needed
    // if (import.meta.client) {
    //   localStorage.clear()
    //   sessionStorage.clear()
    // }

    // Redirect to sign in page
    // await navigateTo(localePath('/signin'))

    // Optional: Show a toast notification
    // useToast().add({ title: 'Session expired', description: 'Please sign in again' })
  } catch (error) {
    console.error('Error during auth cleanup:', error)
    // Force redirect even if cleanup fails
    // await navigateTo(localePath('/signin'))
  }
}
