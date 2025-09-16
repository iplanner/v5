import { authenticator } from 'otplib'
import jwt from "jsonwebtoken";
import dayjs from "dayjs";

export default defineEventHandler(async (event) => {
  
    const config = useRuntimeConfig(event);
    const { code } = await readBody(event) || {}
    const url = getRequestURL(event)

    // todo ...fehlermeldungen umleiten auf fenster = Post request

    try{

        // 1.) Cookie prüfen
        const signed = getCookie( event, config.IP_PROCESS_ID_COOKIE );
        if (!signed) throw new Error("ERROR_PAGE", { cause: { params : { reason : 'expired-tfa-process'}} });
        const processId = verifyCookie(signed);

        const redis = useRedis();
        const key = `login:tfa:${processId}`;
        const json = await redis.get(key);
        if (!json) throw new Error("ERROR_PAGE", { cause: { params : { reason : 'expired-tfa-process'}} });

        const data = JSON.parse(json);
        const { uid, username, subdomain } = data;

        // 2.) Code prüfen und nach 6 stellen checken
        if (!code || !/^\d{6}$/.test(String(code))) {
             throw new Error("XXXX", { cause: { params : { reason : 'expired-tfa-process'}} });
        }

       

        // 3.) User laden
        const db = usePostgres();

        const [user] = await db`
            SELECT *
            FROM users
            WHERE id = ${uid} AND lower(username) = lower(${username})
            LIMIT 1
        `;
        if (!user) throw new Error("ERROR_PAGE", { cause: { params : { reason : 'user-not-found'}} });

        // 3.) Organisationen des Users
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

        


        // 4.) Secret aus DB laden
        const rows = await db`
            SELECT id, tfa_secret
            FROM users
            WHERE id = ${uid} AND tfa = TRUE
            LIMIT 1
        `
        if (rows.length === 0) {
            throw createError({ statusCode: 404, statusMessage: 'Benutzer oder TFA nicht gefunden' })
        }

        const secret = rows[0].tfa_secret
        // Code prüfen (±30s Toleranz)

        console.log( String(code));
        const ok = authenticator.verify({ token: String(code), secret, window: 1 })
        if (!ok) {
            throw createError({ statusCode: 400, statusMessage: 'Code ungültig' })
        }

        // 5. Geräteprüfung
        const { userAgent, provider, majorBrowserVersion } = await getRequestContext(event);
        const { isKnownDevice, deviceCount } = await checkUserDevice(db, user, userAgent, majorBrowserVersion);

        // Gerät ist bekannt oder nicht ...
        if ( isKnownDevice || deviceCount === 0) {

            const { sessionId }  = await finalizeUserSession(db, { user, userAgent, provider });

            if (!sessionId) {
                throw createError({ statusCode: 400, statusMessage: 'Session konnte nicht gesetzt werden' })
            }

            await replaceUserSession( event,
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

            deleteCookie(event, config.IP_PROCESS_ID_COOKIE, { path: '/' });

            if(subdomain && subdomain !== 'www'){

                const { oid, role, start_url = "" } = organizations.find( o => o.subdomain === subdomain) ?? {};

                if(start_url) return { path: start_url }
                if(role === 'admin') return { path: `/organizations/${oid}` }       
                return { path: `/app` }

            }

            return { path: `/organizations` }

        }else{

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
              dynamicTemplateData: {
                title: "Anmeldeversuch mit einem neuen Gerät",
                primaryColor: "#1a73e8",
                text: `Am ${dayjs().format("DD.MM.YYYY")} um ${dayjs().format("HH:mm")} Uhr wurde versucht, sich mit einem neuen Gerät bei deinem Konto ${username} unter ${subdomain}.i-planner.cloud anzumelden. Aus Sicherheitsgründen haben wir den Zugriff blockiert.`,
                provider: {
                  organization: provider.org,
                  ipAddress: provider.ip, // FIX Schreibweise
                  os: userAgent.osvendor,
                  osName: userAgent.os,
                  osVersion: userAgent.osmodel,
                  osType: userAgent.device,
                  browser: userAgent.browser,
                },
                notice: "Falls du das selbst warst, kannst du das Gerät jetzt zu deiner Liste hinzufügen und den Zugriff freigeben. Du wirst dann automatisch in dein Konto weitergeleitet.",
                authorizeUrl: `${url.origin}/redirect?reason=device-authorization&token=${jwtToken}`,
                username,
                sendReason: `weil sich jemand bei ${subdomain}.i-planner.cloud angemeldet hat. Wenn du die Anmeldung durchgeführt hast, kannst du diese Nachricht ignorieren.`,
                indexUrl: "https://www.i-planner.de",
                dataProtectionUrl: "https://www.i-planner.de/datenschutz",
                imprintUrl: "https://www.i-planner.de/impressum",
              },
            });
                
            return { path: `/login/notice?reason=new-device-detected&username=${encodeURIComponent(username).replace("%40", "@")}`};

        }

    } catch(error){

        console.error(error);
        const response = getLoginErrorHandler(error.message, error.cause);
        throw createError({
        statusCode: 400,
        message: response.title,
        data: response,
        });

    }

})