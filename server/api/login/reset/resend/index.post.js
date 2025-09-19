
import dayjs from 'dayjs';

export default defineEventHandler(async event => {

    const config = useRuntimeConfig(event);
    const { username } = await readBody(event);
    const { reason, username : username2} = getQuery(event);

    try{

      const db = await useDatabase();

      const cookie = getCookie(event, config.IP_PROCESS_ID_COOKIE);
      const processId = cookie ? verifyCookie(cookie) : 0;

      if (!processId) {
        console.log('processId');
        //throw new Error(`Kein gültiges Cookie mit processId ${processId} gefunden - invite resend`);
      }

      const { rows: [form = {}] } = await db.query(
        `SELECT data FROM login_process WHERE id = $1;`, 
        [processId]
      );

      const { email, mobile, company } = form?.data || {};

      const code = Math.floor(100000 + Math.random() * 900000).toString();
      const codeExpiration = dayjs().add(15, "minute").format("YYYY-MM-DDTHH:mm:ss.SSS");


      if ([
        "subdomain-missing"
      ].includes(reason)) {

        await event.$fetch('/api/login/welcome', {
          method: 'POST',
          body: { username }
        }).catch(error => {
            throw new Error("Reset fehlgeschlagen: " + error.message);
        });

        return {
          show: true,
          title: `Vielen Dank!`,
          body: `Dein Login-Bereich wurde an die E-Mail-Adresse (${username}) versendet. Bitte überprüfe dein Postfach und folge den Anweisungen in dieser <nobr>E-Mail</nobr>`,
          buttons: [
            {
              value :"",
              display : "OK" 
            }
          ]
        };


      }

    } catch (error) {

        logError(error);
    
        const response = getLoginErrorHandler(error.message, error.cause);

        throw createError({
            statusCode: 400,
            message: response.title,
            data: response
        })

    }
    
  });
  