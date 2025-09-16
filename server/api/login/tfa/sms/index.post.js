
import dayjs from "dayjs";
import jwt from "jsonwebtoken";

export default defineEventHandler(async (event) => {


  const config = useRuntimeConfig(event);
  const { processId : userProcessId, code : usercode } = await readBody(event);
  const url = getRequestURL(event);


  try {

    // 1) Cookie prüfen
    const signed = getCookie(event, config.IP_PROCESS_ID_COOKIE)
    if (!signed) throw new Error(`Process Cookie Missing`, { cause: { username } });

    const processId = verifyCookie(signed);
    if(!processId) throw createError('Invalid process cookie')
  
    const redis = useRedis();
    const json = await redis.get(`login:tfa:${processId}`);
    if (!json) throw createError(`EMAIL_CODE_EXPIRED_ERROR`);

    const { uid, username, code } = JSON.parse(json);


    // 2.) User laden
    const db = usePostgres();
    const [user] = await db`
      SELECT *
      FROM users
      WHERE id = ${uid} AND lower(username) = lower(${username})
      LIMIT 1
    `;
    if (!user) throw new Error("USER_NOT_FOUND");

    if (!isEqual(usercode.toString(), code.toString())) {
      throw new Error(`SMS_CODE_COMPARE_ERROR`);
    }

    await redis.del(`login:tfa:${processId}`);
    deleteCookie(event, config.IP_PROCESS_ID_COOKIE, { path: '/' });



    // 3) Geräteprüfung
    const userAgent = useUserAgent(event); 
    const provider = await useIPInfo(event);
    const majorBrowserVersion = String(userAgent.browserversion).split(".")[0] || "unknown";

    // Ist Gerät bekannt?
    const knownDevices = await db`
      SELECT *
      FROM users_devices
      WHERE kid = ${user.kid}
        AND osvendor = ${userAgent.osvendor}
        AND osmodel = ${userAgent.osmodel}
        AND os = ${userAgent.os}
        AND device = ${userAgent.device}
        AND browser = ${userAgent.browser}
        AND split_part(browserversion, '.', 1) = ${majorBrowserVersion}
    `;
    const isKnownDevice = knownDevices.length > 0;

    // Anzahl Geräte
    const [{ count: deviceCount }] = await db`
      SELECT COUNT(*)::int AS count
      FROM users_devices
      WHERE kid = ${user.kid}
    `;

    // Gerät ist bekannt ODER es ist das erstes Gerät in der Tabelle
    if (isKnownDevice || deviceCount === 0) {
          
        if( deviceCount > 0){
            await UsersSession.delete(user.kid);
        }else{
            await db`
                INSERT INTO users_devices (
                  kid, guid, osvendor, osmodel, os, osversion,
                  device, browser, browserversion
                ) VALUES (
                  ${user.kid}, ${user.guid}, ${userAgent.osvendor}, ${userAgent.osmodel}, ${userAgent.os}, ${userAgent.osversion},
                  ${userAgent.device}, ${userAgent.browser}, ${userAgent.browserversion}
                )
                RETURNING *
            `;
        }

        // Seesion ID noch speichern vom COOKIE ....

        const insertedSession = await UsersSession.insert({
              kid : user.kid,
              guid : user.guid,
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
        if (!insertedSession) throw new Error(`INSERT_USER_SESSION_FAILED`);
        
        // Geräte auf max. 3 trimmen
        if (deviceCount > 3) {
            await db`
                DELETE FROM users_devices
                WHERE ctid IN (
                  SELECT ctid
                  FROM users_devices
                  WHERE kid = ${user.kid}
                  ORDER BY inserted_at ASC
                  LIMIT ${deviceCount - 3}
                )
                RETURNING ctid
            `;
        }
    
        // Session setzten 
        await replaceUserSession(
            event,
            { user: { uid, kid : user.kid, guid : user.guid, organizations : organizations.map( o => ({ oid : o.oid, cid : o.cid})) } },
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
    else {
    // Unbekanntes Gerät → E-Mail zur Freigabe
    
    const jwtToken = jwt.sign(
        {
            kid : user.kid,
            guid : user.guid,
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
              authorizeUrl: `${url.origin}/redirect?reason=device-authorization&token=${jwtToken}`,
              username,
              sendReason:
                `weil sich jemand bei ${subdomain}.i-planner.cloud angemeldet hat. Wenn du die Anmeldung durchgeführt hast, kannst du diese Nachricht ignorieren.`,
              indexUrl: "https://www.i-planner.de",
              dataProtectionUrl: "https://www.i-planner.de/datenschutz",
              imprintUrl: "https://www.i-planner.de/impressum",
            },
    });
    
    return { path: `/login/notice?reason=new-device-detected&username=${encodeURIComponent(username).replace("%40", "@")}`};

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
