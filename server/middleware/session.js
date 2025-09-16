export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig(event);
  const { pathname } = getRequestURL(event);

  const allowedRoutes = [
    "/api/app",
    "/api/webapp",
    "/api/webform", 
    "/logout",
    "/download",
  ];

  
  if (!allowedRoutes.some(route => pathname.startsWith(route))) return;

  const { user } = await getUserSession(event);

  if (!user) {
    event.context.session = null;
    return;
  }

  try {

    const db = usePostgres();
    const { osvendor, os, osversion, device, browser, browserversion } = useUserAgent(event);

    const [session] = await db`
      SELECT *
      FROM users_session
      WHERE kid        = ${user.kid}
        AND osvendor   = ${osvendor}
        AND os         = ${os}
        AND osversion  = ${osversion}
        AND device     = ${device}
        AND browser    = ${browser}
        AND browserversion = ${browserversion}
      LIMIT 1
    `
    event.context.session = session || null;
    
  } catch (error) {
    console.error(error)
    event.context.session = null;
  } 
});
