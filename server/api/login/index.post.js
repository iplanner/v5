import dayjs from "dayjs";
import jwt from "jsonwebtoken";

export default defineEventHandler(async (event) => {
  
  const config = useRuntimeConfig(event);
  const headers = getRequestHeaders(event);
  const url = getRequestURL(event);

  let { username, password, subdomain = "" } = await readBody(event);
  username = String(username || "").trim();

  if (!subdomain) {
    const host = headers["x-forwarded-host"] || headers.host || "";
    const bareHost = host.split(":")[0];
    const parts = bareHost.split(".");
    subdomain = parts.length > 2 ? parts[0] : "";
  }

  try {
    
    const db = usePostgres();

    // 1) User laden
    const [user] = await db`
      SELECT *
      FROM users
      WHERE username = ${username}
      ORDER BY id DESC
      LIMIT 1
    `;
    if (!user) {
      throw new Error("USER_NOT_FOUND");
    }

    const { id : uid, kid, guid } = user;

    const organizations = await db`
        SELECT 
          uo.oid,
          uo.role,
          uo.start_url,
          o.cid,
          o.subdomain,
          o.name
        FROM users_organizations uo
        INNER JOIN organizations o ON uo.oid = o.id
        WHERE uo.uid = ${user.id}
      `;

    if (!organizations.length) {
      throw new Error("NO_ORGANIZATION_FOUND");
    }
  

    // 2) Passwort prüfen ODER One-Time-Login via Prozess-Cookie
    let isValid = false;

    if (password === config.IP_PROCESS_ID_COOKIE) {
      const signedCookie = getCookie(event, config.IP_PROCESS_ID_COOKIE);
      const processId = signedCookie ? verifyCookie(signedCookie) : 0;

      if (!processId) {
        throw new Error(
          `Kein gültiges Cookie mit processId ${processId} gefunden - /login/post`
        );
      }

      const [form] = await db`
        SELECT data
        FROM users_login_process
        WHERE id = ${processId}
      `;
      const processData = form?.data || {};

      if (
        Number(processData.kid) === Number(kid) &&
        String(processData.email).trim() === username &&
        String(processData.subdomain).trim() === subdomain
      ) {
        isValid = true;

        await db`DELETE FROM users_login_process WHERE id = ${processId}`;
        deleteCookie(event, config.IP_PROCESS_ID_COOKIE);
      }
    }

    if (!isValid) {
      isValid = await verifyPassword(user.password, password);
    }
    if (!isValid) {
      throw new Error(`WRONG_PASSWORD`, { cause: { username } });
    }

    // 3) Geräteprüfung
    const userAgent = useUserAgent(event); // muss osvendor, osmodel, os, device, browser, browserversion liefern
    const provider = await useIPInfo(event); // ip, city, region, country, loc, org, postal, timezone

    console.log('3. userAgent', userAgent);
    console.log('3. provider', provider);

    const deviceRows = await db`
      SELECT *
      FROM users_devices
      WHERE kid = ${kid}
        AND osvendor = ${userAgent.osvendor}
        AND osmodel = ${userAgent.osmodel}
        AND os = ${userAgent.os}
        AND device = ${userAgent.device}
        AND browser = ${userAgent.browser}
        AND split_part(browserversion, '.', 1) = ${String(userAgent.browserversion).split(".")[0] || "unknown"}
    `;

     console.log('3. deviceRows', deviceRows);

    const [{ count: userDeviceCount }] = await db`
      SELECT COUNT(*)::int AS count
      FROM users_devices
      WHERE kid = ${kid}
    `;

    console.log('3. userDeviceCount', userDeviceCount);

    if (deviceRows.length > 0 || userDeviceCount === 0) {
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
        if( userDeviceCount > 0){
          await UsersSession.delete(kid);
        }
        
        const inserted = await UsersSession.insert({
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

         console.log('3. inserted',inserted);

        if (!inserted) {
          throw new Error(`INSERT_USER_SESSION_FAILED`);
        }

        // Geräte auf max. 3 trimmen
        if (userDeviceCount > 3) {
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

        await replaceUserSession(
          event,
          { user: { uid, kid, guid, organizations : organizations.map( o => ({ oid : o.oid, cid : o.cid})) } },
          { maxAge: user.sessiontimeout }
        );

        const { send } = useSocketServer(guid);
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


        // Redirect to....

        const u = await getUserSession(event) ;
        console.log( 'user', JSON.stringify(u, null, 2))
        console.log( 'subdomain', subdomain)

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
        templateData: {
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