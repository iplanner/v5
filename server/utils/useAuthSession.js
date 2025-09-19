// server/utils/useAuthSession.js
export async function useAuthSession(event) {
  
    // 1) Schon durch Middleware validiert?
  if (event.context?.session) {
    return event.context.session
  }

  // 2) Fallback: Cookie-User lesen
  const { user } = await getUserSession(event)
  if (!user?.sessionId || !user?.kid) {
    
    throw createError({ statusCode: 401, statusMessage: '[useAuthSession] unauthorized' })
  }

  // 3) DB-Session per SID prüfen
  try {
    const db = usePostgres()
    const [row] = await db`
      SELECT *
      FROM users_session
      WHERE id = ${user.sessionId} AND kid = ${user.kid}
      LIMIT 1
    `
    if (!row) {
      console.warn(`[useAuthSession] SID ${user.sessionId} für kid ${user.kid} nicht gefunden`)
      throw createError({ statusCode: 401, statusMessage: 'session-revoked' })
    }

    event.context.session = row;
    return row;

  } catch (e) {
    console.error('[useAuthSession] DB error:', e)
    throw createError({ statusCode: 500, statusMessage: 'session-lookup-failed' })
  }
}