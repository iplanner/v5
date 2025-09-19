// server/api/login/index.get => pages login/[...slug]
import dayjs from "dayjs";
import jwt from "jsonwebtoken";
import crypto from 'node:crypto'

export default defineEventHandler(async (event) => {
  
  const config = useRuntimeConfig(event);
  const headers = getRequestHeaders(event);
  const url = getRequestURL(event);

  let { username, password } = await readBody(event);
    username = String(username || "").trim();
    password = String(password || "").trim();
 
  const subdomain = useSubdomain(headers);

  try {
    
    const db = usePostgres();

    // 1.) User Daten (case-insensitive)
    const [user] = await db`
      SELECT *
      FROM users
      WHERE lower(username) = lower(${username})
      ORDER BY id DESC
      LIMIT 1
    `;
    if (!user) throw new Error("USER_NOT_FOUND");

    

    // 2.) Organisationen des Users
    const organizations = await db`
        SELECT
          o.oid,
          o.uid,
          o.role,
          o.start_url,
          org.cid,
          org.subdomain,
          org.name
        FROM organization_users AS o
        INNER JOIN organizations AS org ON org.id = o.oid
        WHERE o.uid = ${user.id}
      `;
    if (!organizations.length) throw new Error("NO_ORGANIZATION_FOUND");


    // 3.) Passwortprüfung
    const isValid = await verifyPassword(user.password, password);
    if (!isValid) throw new Error(`WRONG_PASSWORD`, { cause: { username } });


    // 4.) Two-Factor-Auth
    if( user.tfa ){

      const payload = {
        uid: user.id,
        kid: user.kid,
        username,
        subdomain,
        code : Math.floor( Math.random() * 900000) + 100000
      };

      const redis = useRedis();
      const expiredIn = 15 * 60; // 15 Min
      const processId = crypto.randomUUID?.() ?? crypto.randomBytes(16).toString("hex");
      const ok = await redis.set(`login:tfa:${processId}`, JSON.stringify(payload), { EX: expiredIn });
      if (ok !== 'OK') throw new Error('Could not create login processId')

      const signed = signCookie(String(processId));
      setCookie(event, config.IP_PROCESS_ID_COOKIE, signed, {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === 'production',
        maxAge: expiredIn 
      });

      return { path: `/login/tfa?username=${encodeURIComponent(username).replace('%40','@')}` }

    }


    // 5.) Geräteprüfung
    const { userAgent, provider, majorBrowserVersion } = await getRequestContext(event);
    const { isKnownDevice, deviceCount } = await checkUserDevice(db, user, userAgent, majorBrowserVersion);
    
    // Gerät ist bekannt ODER es ist das erstes Gerät in users_devices
    if (isKnownDevice || deviceCount === 0) {

      const { sessionId } = await finalizeUserSession(db, {
        user,
        userAgent,
        provider
      });

      if (!sessionId) {
        throw createError({
          statusCode: 400,
          statusMessage: "Session konnte nicht gesetzt werden",
        });
      }

      await replaceUserSession(
        event,
        { user: { uid, kid: user.kid, guid: user.guid, sessionId }},
        { maxAge: user.sessiontimeout }
      );

      const { send, hasActiveConnections } = useSocketServer(user.guid);

      if (hasActiveConnections) {
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

      deleteCookie(event, config.IP_PROCESS_ID_COOKIE, { path: "/" });

      return await getStartUrl(db, user, subdomain);

    } else {

      const jwtToken = jwt.sign(
        {
          uid: user.id,
          guid: user.guid,
          subdomain,
          payload: { userAgent, provider },
        },
        config.IP_JWT_SECRET,
        { algorithm: "HS256", expiresIn: "1h" }
      );

      await useSendgrid({
        to: username,
        templateId: "d-b1aa0d9e26074001bf2ff5bc9a1820a8",
        dynamicTemplateData: {
          title: "Anmeldeversuch mit einem unbekannten Gerät",
          primaryColor: "#1a73e8",
          text: `Am ${dayjs().format("DD.MM.YYYY")} um ${dayjs().format("HH:mm")} Uhr wurde versucht, sich mit einem unbekannten Gerät bei deinem Konto ${username} unter ${origin} anzumelden. Aus Sicherheitsgründen haben wir den Zugriff blockiert.`,
          provider: {
            organization: provider.org,
            ipAddress: provider.ip,
            os: userAgent.osvendor,
            osName: userAgent.os,
            osVersion: userAgent.osmodel,
            osType: userAgent.device,
            browser: userAgent.browser,
          },
          notice: "Falls du es selbst warst, kannst du das Gerät jetzt zu deiner Liste hinzufügen und den Zugriff freigeben. Du wirst dann automatisch in dein Konto weitergeleitet.",
          authorizeUrl: `${origin}/login/redirect?reason=new-device-detected&token=${jwtToken}`,
          username,
          sendReason: `weil sich jemand bei ${origin} mit einem neuen Gerät angemeldet hat.`,
          indexUrl: "https://www.i-planner.de",
          dataProtectionUrl: "https://www.i-planner.de/datenschutz",
          imprintUrl: "https://www.i-planner.de/impressum",
        },
      });

      return {
        path: `/login/notice?reason=new-device-detected&username=${encodeURIComponent(username).replace("%40", "@")}`,
      };
    }

    
  } catch (error) {
    console.error(error);
    const response = getLoginErrorHandler(error.message, error.cause);
    throw createError({
      statusCode: 400,
      message: response.title,
      data: response,
    });
  }
});