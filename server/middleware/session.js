// middleware/session
export default defineEventHandler(async (event) => {

  const { pathname } = getRequestURL(event);

  const allowedRoutes = [
    "/api/account",
    "/api/app",
    "/api/organizations",
    "/api/logout",
    "/download",
  ];

  if (!allowedRoutes.some(route => pathname.startsWith(route))) return;

  const { user } = await getUserSession(event);
  if (!user?.sessionId || !user?.kid) {
    event.context.session = null
    return
  }

  try {

    const db = usePostgres();

    const [session] = await db`
      SELECT *
      FROM users_session
      WHERE id = ${user.sessionId} AND kid = ${user.kid}
      LIMIT 1
    `
    if (!session) {
      event.context.session = null
      return
    }

    event.context.session = session
    
  } catch (error) {
    console.error(error)
    event.context.session = null;
  } 
});
