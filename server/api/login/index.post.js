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

    // 1) User Daten (case-insensitive)
    const [user] = await db`
      SELECT *
      FROM users
      WHERE lower(username) = lower(${username})
      ORDER BY id DESC
      LIMIT 1
    `;
    if (!user) throw new Error("USER_NOT_FOUND");

    
    // 2) Organisationen des Users
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

    // 3) Passwortprüfung
    const isValid = await verifyPassword(user.password, password);
    if (!isValid) throw new Error(`WRONG_PASSWORD`, { cause: { username } });

    // 4) Two-Factor-Auth
    if(user.tfa){

      // create ProcessId
      const redis = useRedis();
      const processId = crypto.randomUUID?.() ?? crypto.randomBytes(16).toString("hex");
      const expiredIn = 15 * 60; // 15 Min

      const payload = {
        uid: user.id,
        kid: user.kid,
        username,
        subdomain,
        code : Math.floor( Math.random() * 900000) + 100000
      };

      const ok = await redis.set(`login:tfa:${processId}`,
        JSON.stringify(payload),
        {
          EX: expiredIn, 
        }
      );
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

    // 4) Geräteprüfung

    const { userAgent, provider, majorBrowserVersion } = await getRequestContext(event);
    const { isKnownDevice, deviceCount } = await checkUserDevice(db, user, userAgent, majorBrowserVersion);
    
    if (isKnownDevice || deviceCount === 0) {
      // Gerät ist bekannt ODER es ist das erstes Gerät in der Tabelle
      if (user.tfa) {
        
        const code = Math.floor(Math.random() * 900000) + 100000;
        await useMessageBird({ mobile: user.tfa_mobile_number, code });

        return {
          path: `/login/notice?reason=two-factor-auth&username=${encodeURIComponent(
            username
          ).replace("%40", "@")}`,
        };

      } else {
        // Sessions neu setzen
        if( deviceCount > 0){
          await UsersSession.delete(user.kid);
        }
        
        const insertedSession = await UsersSession.insert({
          kid,
          guid,
          osvendor: userAgent.osvendor,
          osmodel: userAgent.osmodel,
          os: userAgent.os,
          osversion: userAgent.osversion,
          device: userAgent.device,
          browser: userAgent.browser,
          browserversion: userAgent.browserversion, // FIX
          ip: provider.ip,
          ipcity: provider.city,
          ipregion: provider.region,
          ipcountry: provider.country,
          iploc: provider.loc,
          ipprovider: provider.org,
          ippostal: provider.postal,
          iptimezone: provider.timezone,
        });

        console.log('3. INSERT TO USER SESSION', insertedSession );

        if (!insertedSession) {
          throw new Error(`INSERT_USER_SESSION_FAILED`);
        }

        // insert 
        if( deviceCount === 0){
          
         const [insertedDevice] = await db`
            INSERT INTO users_devices (
              kid, guid, osvendor, osmodel, os, osversion,
              device, browser, browserversion
            ) VALUES (
              ${user.kid}, ${user.guid}, ${userAgent.osvendor}, ${userAgent.osmodel}, ${userAgent.os}, ${userAgent.osversion},
              ${userAgent.device}, ${userAgent.browser}, ${userAgent.browserversion}
            )
            RETURNING *
          `

        }

        // Geräte auf max. 3 trimmen
        if (deviceCount > 3) {
          const deleted = await db`
            DELETE FROM users_devices
            WHERE ctid IN (
              SELECT ctid
              FROM users_devices
              WHERE kid = ${kid}
              ORDER BY inserted_at ASC
              LIMIT ${userDeviceCount - 3}
            )
            RETURNING ctid
          `;
          if (deleted.length > 0) {
            console.log(
              `Deleted ${deleted.length} oldest devices for kid=${kid}`
            );
          }
        }

        // Session setzten 
        await replaceUserSession(
          event,
          { user: { uid, kid, guid } },
          { maxAge: user.sessiontimeout }
        );

        const { send, hasActiveConnections } = useSocketServer(guid);

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

      
        // Redirect to....

        if(subdomain.length && subdomain != 'www'){

          const { oid, role, start_url = "" } = organizations.find( o => o.subdomain === subdomain) ?? {};

          if(start_url){
             return { path: start_url }
          }else{
            if(role === 'admin'){
               return { path: `/organizations/${oid}` }
            }else{
               return { path: `/app` }
            }
          }

        }else{

          return { path: 'organizations'};

        }

      }



    } else {

      // Unbekanntes Gerät → E-Mail zur Freigabe
      if (!config.IP_JWT_SECRET) {
        console.warn("IP_JWT_SECRET is missing!");
      }

      const jwtToken = jwt.sign(
        {
          cid,
          kid,
          guid,
          payload: { device: userAgent.device, os: userAgent.os, browser: userAgent.browser },
        },
        config.IP_JWT_SECRET,
        { algorithm: "HS256", expiresIn: "1h" }
      );

      await useSendgrid({
        to: username,
        templateId: "d-b1aa0d9e26074001bf2ff5bc9a1820a8",
        dynamicTemplateData: {
          title: "Anmeldeversuch mit einem neuen Gerät",
          primaryColor: "#1a73e8",
          text: `Am ${dayjs().format("DD.MM.YYYY")} um ${dayjs().format(
            "HH:mm"
          )} Uhr wurde versucht, sich mit einem neuen Gerät bei deinem Konto ${username} unter ${subdomain}.i-planner.cloud anzumelden. Aus Sicherheitsgründen haben wir den Zugriff blockiert.`,
          provider: {
            organization: provider.org,
            ipAddress: provider.ip,   // FIX Schreibweise
            os: userAgent.osvendor,
            osName: userAgent.os,
            osVersion: userAgent.osmodel,
            osType: userAgent.device,
            browser: userAgent.browser,
          },
          notice:
            "Falls du das selbst warst, kannst du das Gerät jetzt zu deiner Liste hinzufügen und den Zugriff freigeben. Du wirst dann automatisch in dein Konto weitergeleitet.",
          authorizeUrl: `${url.origin}/redirect?reason=device-authorization&token=${jwtToken}`, // FIX hostname
          username,
          sendReason:
            `weil sich jemand bei ${subdomain}.i-planner.cloud angemeldet hat. Wenn du die Anmeldung durchgeführt hast, kannst du diese Nachricht ignorieren.`,
          indexUrl: "https://www.i-planner.de",
          dataProtectionUrl: "https://www.i-planner.de/datenschutz",
          imprintUrl: "https://www.i-planner.de/impressum",
        },
      });

      return {
        path: `/login/notice?reason=new-device-detected&username=${encodeURIComponent(
          username
        ).replace("%40", "@")}`,
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