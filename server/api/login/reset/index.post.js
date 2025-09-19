import jwt from 'jsonwebtoken'
import dayjs from 'dayjs';

export default defineEventHandler( async (event) => {
    
    const config = useRuntimeConfig(event);
    const url = getRequestURL(event);

    let { username } = await readBody(event);
    username = String(username || "").trim();

    try {

       // 1.) User Daten (case-insensitive)
       const db  = usePostgres();
       const [user] = await db`
        SELECT *
        FROM users
        WHERE lower(username) = lower(${username})
        ORDER BY id DESC
        LIMIT 1
        `;
        if (!user) {
          throw new Error("USER_NOT_FOUND", { cause : { username }});
        }

        // 2.) create resetURL
        const jwtToken = jwt.sign({ uid : user.id }, config.IP_JWT_SECRET, {
            algorithm: 'HS256',
            expiresIn: "1h"
        });
        const resetURL = `${url.origin}/login/reset/confirm?token=${jwtToken}`;

        console.log('resetURL',resetURL);

        // 2.) Email versenden
        await useSendgrid({
            to: username,
            templateId: "d-cd98348861a546d0a8c736dd8d53fa7e",
            dynamicTemplateData: {
                title: "Passwort zurücksetzen",
                primaryColor: "#1a73e8",
                text: `Am ${dayjs().format("DD.MM.YYYY")} um ${dayjs().format("HH:mm")} Uhr hast du die Zurücksetzung deines Passworts angefordert. Klicke innerhalb von 60 Minuten auf den folgenden Link, um ein neues Passwort festzulegen.`,
                resetURL,
                username,
                sendReason: `weil ein Passwort-Reset angefordert wurde.`,
                indexUrl: "https://www.i-planner.de",
                dataProtectionUrl: "https://www.i-planner.de/datenschutz",
                imprintUrl: "https://www.i-planner.de/impressum",
            },
        });

        return {
           path: `/login/notice?reason=password-reset&username=${encodeURIComponent(username).replace("%40", "@")}`,
        };

    } catch (error) {

      console.error( error)

      const response = getLoginErrorHandler(error.message, error.cause);

      throw createError({
          statusCode: 400,
          message: response.title,
          data: response
      })

    }

})
