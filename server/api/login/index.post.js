import { createSSRApp } from 'vue'
import { renderToString } from 'vue/server-renderer'
import dayjs from "dayjs";
import jwt from "jsonwebtoken";

export default defineEventHandler(async (event) => {
  
  const config = useRuntimeConfig(event);
  const headers = getRequestHeaders(event);
  let { username, password, subdomain = "" } = await readBody(event);

  if (!subdomain.length) {
    subdomain = headers.host.split(".")[0];
  }

  const htmlContent = await renderVueComponent(componentName, props)

 
  try {

    const db = usePostgres();

    const { browser, os, device } = useUserAgent(event);
    const provider = await getIpInfo(event);

    // 1. select user by username & subdomain

    const user = await UserModel.getByUsername(username, subdomain);
    if (!user) throw new Error("USER_NOT_FOUND");

    const { cid, kid, guid, start_url } = user;

    // 2.Verify password && check if password is skipped by login cookie === one time password
    let isValid = false;
    if (password === config.IP_PROCESS_ID_COOKIE) {
      const cookie = getCookie(event, config.IP_PROCESS_ID_COOKIE);
      const processId = cookie ? verifyCookie(cookie) : 0;

      if (!processId) {
        throw new Error(
          `Kein gültiges Cookie mit processId ${processId} gefunden - /login/post`
        );
      }

      const {
        rows: [form],
      } = await db.query(
        `
              SELECT data 
              FROM login_process 
              WHERE id = $1;
              `,
        [processId]
      );
      const process = form?.data || {};

      if (
        process.cid === cid &&
        process.kid === kid &&
        process.email === username &&
        process.subdomain === subdomain
      ) {
        isValid = true;

        await db.query(`DELETE FROM login_process WHERE id = $1;`, [processId]);

        deleteCookie(event, config.IP_PROCESS_ID_COOKIE);
      }
    }

    if (!isValid) {
      isValid = await verifyPassword(user.password, password);
    }
    if (!isValid) throw new Error(`WRONG_PASSWORD`, { cause: { username } });

    // 3. check user_devices
    const currentDevice = await selectCurrentDevice(db, {
      cid,
      kid,
      device,
      os,
      browser,
    });
    const countDevices = await countUserDevices(db, cid, kid);

    if (currentDevice.length || countDevices === 0) {
      if (user.twofactorauth) {
        const code = Math.floor(Math.random() * (999999 - 100000 + 1)) + 100000;
        await sendCode({ mobile: user.twofactormobile, code });

        return {
          path: `/login/notice?reason=two-factor-auth&username=${encodeURIComponent(
            username
          ).replace("%40", "@")}`,
        };
      } else {
        await SessionModel.delete(user);

        const success = await SessionModel.insert({
          cid: cid,
          kid: kid,
          guid: guid,
          osvendor: device.vendor,
          osmodel: device.model,
          os: os.name,
          osversion: os.version,
          device: device.type,
          browser: browser.name,
          browserversion: browser.version,
          ip: provider.ip,
          ipcity: provider.city,
          ipregion: provider.region,
          ipcountry: provider.country,
          iploc: provider.loc,
          ipprovider: provider.org,
          ippostal: provider.postal,
          iptimezone: provider.timezone,
        });

        if (!success) {
          throw new Error(`INSERT_USER_SESSION_FAILED`);
        }

        // check if more than 3 devices exist in table
        if (countDevices > 3) {
          const { rowCount: deleted } = await db.query(
            `
                  DELETE FROM users_devices
                  WHERE ctid IN (
                    SELECT ctid
                    FROM users_devices
                    WHERE cid = $1 AND kid = $2
                    ORDER BY inserted_at ASC
                    LIMIT $3
                  )
                  `,
            [cid, kid, countDevices - 3]
          );

          if (deleted > 0) {
            logSuccess(
              `Deleted ${deleted} oldest devices for cid: ${cid}, kid: ${kid}`
            );
          }
        }

        await setUserSession(
          event,
          { user: { cid, kid, guid } },
          { maxAge: user.sessiontimeout }
        );

        const { send } = websocket(guid);
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

        return { path: start_url };
      }
    } else {
      logSuccess(
        `Login : Device ${device.vendor} über  ${browser.name} - ${browser.version} is not known...`
      );

      const jwtToken = jwt.sign(
        { cid, kid, guid, payload: { device, os, browser } },
        config.JWT_SECRET,
        {
          algorithm: "HS256",
          expiresIn: "1h",
        }
      );

      const authorizeUrl = getBaseUrl(
        subdomain,
        `/redirect?reason=device-authorization&token=${jwtToken}`
      );

      const title = "Anmeldeversuch mit einem neuen Gerät";
      const template = await useCompiler("login-new-device.vue", {
        props: {
          title,
          text: `Am ${dayjs().format("DD.MM.YYYY")} um ${dayjs().format(
            "HH.mm"
          )} Uhr wurde ein Versuch unternommen, mit dem folgenden Gerät auf dein Konto ${username} unter der Adresse ${subdomain}.i-planner.cloud zuzugreifen. Aus Sicherheitsgründen wurde der Zugriff von uns blockiert.`,
          ipAdress: provider.ip,
          provider: provider.org,
          vendor: device.vendor,
          type: ucFirst(device.type),
          osName: os.name,
          osVersion: os.version,
          browser: browser.name,
          authorizeUrl,
          username: username,
          subdomain: `${subdomain}.i-planner.cloud`,
        },
      });

      sendMail(username, title, template.html);

      return {
        path: `/login/notice?reason=new-device-detected&username=${encodeURIComponent(
          username
        ).replace("%40", "@")}`,
      };
    }
  } catch (error) {
    logError(error);

    const response = getLoginErrorHandler(error.message, error.cause);

    throw createError({
      statusCode: 400,
      message: response.title,
      data: response,
    });
  }
});

async function selectCurrentDevice(db, { cid, kid, device, os, browser }) {
  const query = `
    SELECT *
    FROM users_devices
    WHERE cid = $1 AND kid = $2
    AND osvendor = $3 AND osmodel = $4 AND os = $5 AND device = $6 AND browser = $7
    AND split_part(browserversion, '.', 1) = $8
  `;

  const params = [
    cid,
    kid,
    device.vendor,
    device.model,
    os.name,
    device.type,
    browser.name,
    browser.version.split(".")[0] || "unknown",
  ];

  const { rows } = await db.query(query, params);
  return rows;
}

async function countUserDevices(db, cid, kid) {
  const query = `
    SELECT COUNT(*)::int AS count
    FROM users_devices
    WHERE cid = $1 AND kid = $2;
 `;

  const {
    rows: [{ count }],
  } = await db.query(query, [cid, kid]);
  return count;
}

async function renderVueComponent(componentName, props) {
  // Komponente dynamisch importieren
  const componentPath = `../../emails/${componentName}.vue`
  const { default: Component } = await import(componentPath);
  
  // SSR App erstellen
  const app = createSSRApp(Component, props)
  
  // Zu HTML String rendern
  const html = await renderToString(app)
  
  // Vollständiges HTML Dokument erstellen
  return `
    <!DOCTYPE html>
    <html lang="de">
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body { 
            font-family: Arial, sans-serif; 
            margin: 0; 
            padding: 0; 
            background-color: #f4f4f4; 
          }
          .email-container { 
            max-width: 600px; 
            margin: 0 auto; 
            background-color: white; 
          }
          /* Globale E-Mail Styles hier */
        </style>
      </head>
      <body>
        <div class="email-container">
          ${html}
        </div>
      </body>
    </html>
  `
}
