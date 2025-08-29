export default defineEventHandler(async (event) => {
  const path = event.path

  if (path?.startsWith('/api/admin')) {
    const __session = await requireAuth(event)
    const auth = useServerAuth()

    // console.log('1.auth.ts', session.user.id)

    const hasPermission = await auth.api.userHasPermission({
      headers: event.headers,
      body: {
        role: 'admin',
        permissions: { administration: ['full'] }
      }
    })

    if (!hasPermission.success || hasPermission.error) {
      throw createError({
        statusCode: 403,
        statusMessage: 'Forbidden',
        message: 'Admin access required.'
      })
    }
  }
})
