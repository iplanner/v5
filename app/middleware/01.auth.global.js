export default defineNuxtRouteMiddleware(async (to) => {
  const { loggedIn, fetch } = useUserSession()

  // Session laden (Server oder beim ersten Client-Hit)
  if (process.server || !loggedIn.value) {
    try { await fetch() } catch {}
  }

  if (import.meta.client) {
    console.log(`[Auth Middleware] -> ${to.fullPath}`)
    console.log(`requiresAuth: ${to.meta.requiresAuth}`)
    console.log(`loggedIn: ${loggedIn.value}`)
  }

  // Wenn Route Auth erfordert und User nicht eingeloggt ist → Login
  if (to.meta?.requiresAuth && !loggedIn.value) {
    // Nur umleiten, wenn Ziel nicht schon /login ist
    if (to.path !== '/login') {
      return navigateTo({
        path: '/login',
        query: { redirect: to.fullPath }
      }, { replace: true })
    }
  }

})