export default defineEventHandler(async (event) => {
  const path = event.path

  if (path?.startsWith('/api/admin')) {
    const __session = await requireAuth(event)
    const auth = useServerAuth()

    const hasPermission = await auth.api.userHasPermission({
      headers: event.headers,
      body: {
        role: 'admin',
        permissions: { administration: ['full'] }
      }
    })

    console.log({ 'server-middleware': hasPermission })

    if (!hasPermission.success || hasPermission.error) {
      throw createError({
        statusCode: 403,
        statusMessage: 'Forbidden',
        message: 'Admin access required.'
      })
    }
  }
})
