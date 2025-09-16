// middleware/auth.global.ts
export default defineNuxtRouteMiddleware(async (to) => {
  const { loggedIn, fetch } = useUserSession()

  // Session laden, falls noch nicht bekannt
  if (!loggedIn.value) {
    try { await fetch() } catch {}
  }

  // Root → Login nur, wenn nicht eingeloggt
  if (to.path === '/' && !loggedIn.value) {
    return navigateTo('/login', { replace: true })
  }

  // Wenn Route Auth braucht und User nicht eingeloggt ist → Login mit Redirect
  if (to.meta?.requiresAuth && !loggedIn.value) {
    if (to.path !== '/login') {
      return navigateTo({ path: '/login', query: { redirect: to.fullPath } }, { replace: true })
    }
    return
  }

  // Debug nur im Client + Dev
  if (import.meta.client) {
    console.debug('[Auth]', { path: to.fullPath, requiresAuth: !!to.meta?.requiresAuth, loggedIn: loggedIn.value })
  }
})