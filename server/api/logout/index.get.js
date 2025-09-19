// server/api/logout.get.js
export default defineEventHandler(async (event) => {
  
  const session = event.context?.session
  
  const accept = getRequestHeaders(event).accept || ''
  const isHtmlRequest = accept.includes('text/html')
  const redirectTo = '/login'

  // Antworten nicht cachen und von Cookie abhängig machen
  appendHeader(event, 'Cache-Control', 'no-store')
  appendHeader(event, 'Vary', 'Cookie')

  try {
    if (!session) {
      console.warn('[logout] no session in context')
    } else {
      const tasks = [
        (async () => {
          try {
            const db = usePostgres()
            const res = await db`
              DELETE FROM users_session
              WHERE id = ${session.id}
              RETURNING id
            `
            console.info(`[logout] deleted ${Array.isArray(res) ? res.length : 0} row(s)`)
          } catch (e) {
            console.warn('[logout] DB delete failed:', e?.message || e)
          }
        })(),
        (async () => {
          try {
            const { close, hasActiveConnections } = useSocketServer(session.guid)
            if (hasActiveConnections && typeof close === 'function') {
              close()
              console.info('[logout] websocket closed')
            }
          } catch (e) {
            console.warn('[logout] websocket close failed:', e?.message || e)
          }
        })(),
      ]

      const results = await Promise.allSettled(tasks)
      results.forEach((r, i) => {
        if (r.status === 'rejected') {
          console.warn(`[logout] task ${i + 1} rejected:`, r.reason?.message || r.reason)
        }
      })
    }
  } catch (error) {
    console.error('[logout] unexpected error:', error)
  } finally {
    try {
      await clearUserSession(event) // Cookie IMMER löschen
      console.info('[logout] session cookie cleared')
    } catch (e) {
      console.warn('[logout] clearUserSession failed:', e?.message || e)
    }
  }

  // Browser → Redirect, SPA/API → JSON
  return isHtmlRequest
    ? sendRedirect(event, redirectTo, 303)
    : { ok: true, path: redirectTo }
})