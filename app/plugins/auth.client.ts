// plugins/auth.client.ts
export default defineNuxtPlugin({
  enforce: 'pre',
  async setup(nuxtApp) {
    if (!nuxtApp.payload.serverRendered) {
      await useAuth().fetchSession()
    }
    else if (Boolean(nuxtApp.payload.prerenderedAt) || Boolean(nuxtApp.payload.isCached)) {
      // To avoid hydration mismatch
      nuxtApp.hook('app:mounted', async () => {
        await useAuth().fetchSession()
      })
    }
  }
})
