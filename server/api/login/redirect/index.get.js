//login/redirect
import jwt from "jsonwebtoken";

export default defineEventHandler(async (event) => {
  
  const config = useRuntimeConfig(event);
  const { reason, token } = getQuery(event);

  try {

    switch (reason) {
      case "new-device-detected":

        let payloadDecoded
        try {
          payloadDecoded = jwt.verify(token, config.IP_JWT_SECRET)
        } catch (e) {
          console.error('[authorize] invalid jwt:', e?.message)
          return sendRedirect(event, '/login/error?reason=invalid-token', 303)
        }

        // 1. validate token
        const { uid, subdomain, payload } = payloadDecoded;
        const { userAgent, provider } = payload;

        // 2. select user...
        const db = await usePostgres();
        const [user] = await db`
            SELECT *
            FROM users
            WHERE id = ${uid}
            LIMIT 1
        `;
        if (!user) {
          return sendRedirect( event, "/login/error", 302);
        }

        // 3. Geräteprüfung
        const majorBrowserVersion = String(userAgent.browserversion).split('.')[0] || 'unknown';
        const { isKnownDevice } = await checkUserDevice(db, user, userAgent, majorBrowserVersion);

        if (isKnownDevice) {
          const startUrl = await getStartUrl( db, user, subdomain);
          return sendRedirect(event, startUrl.path, 302);
        }

        const { sessionId }  = await finalizeUserSession(db, { user, userAgent, provider });

        if (!sessionId) {
            throw createError({ statusCode: 400, statusMessage: 'Session konnte nicht gesetzt werden' })
        }

        await replaceUserSession( event,
            { user: { uid, kid : user.kid, guid : user.guid, sessionId } },
            { maxAge: user.sessiontimeout }
        );

        const { send, hasActiveConnections } = useSocketServer(user.guid);

        if(hasActiveConnections){

                send({
                    action: "SESSION_LOGOUT",
                    payload: {
                        show: true,
                        title: "Sitzung beendet!",
                        body: "Du hast dich auf einem anderen Gerät angemeldet. Aus Sicherheitsgründen wurde deine Sitzung auf diesem Gerät beendet.",
                        error: true,
                        closeOnOutsideClick: false,
                        buttons: [{ value: "/login", display: "Zurück zum Login" }],
                    },
                });

        }

        const startUrl = await getStartUrl( db, user, subdomain)

        return sendRedirect(event, startUrl.path, 302);

      default:
        return sendRedirect(event, "/login/error", 302);
    }
  } catch (error) {
    console.log(error);
    return sendRedirect(event, "/login/error", 302);
  }

});