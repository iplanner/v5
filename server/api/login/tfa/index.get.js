// server/api/login/tfa/index.get => pages/login/[...slug]
import dayjs from "dayjs";

export default defineEventHandler(async event => {
  
  const config = useRuntimeConfig(event);
  
  try {

    // 1) Cookie prüfen
    const signed = getCookie( event, config.IP_PROCESS_ID_COOKIE );
    if (!signed) throw new Error("ERROR_PAGE", { cause: { params : { reason : 'expired-tfa-process'}} });

    const processId = verifyCookie(signed);

    const redis = useRedis();
    const key = `login:tfa:${processId}`;
    const json = await redis.get(key);
    if (!json) throw new Error("ERROR_PAGE", { cause: { params : { reason : 'expired-tfa-process'}} });
    const data = JSON.parse(json);
    const { uid, username, subdomain, code } = data;
    const attempt = data.attempt ?? 0;


    // 2.) User laden
    const db = usePostgres();
    const [user] = await db`
      SELECT *
      FROM users
      WHERE id = ${uid} AND lower(username) = lower(${username})
      LIMIT 1
    `;
    if (!user) throw new Error("ERROR_PAGE", { cause: { params : { reason : 'user-not-found'}} });


    // 2.) Provider laden
    if(user.tfa_provider === 'sms'){ 

        let to = username;

        // Nur beim ersten Aufruf den Code senden (attempt === 0)
        if(attempt === 0 ){

            // Wenn Mobilnummer vorhanden
            if(String(user.tfa_mobile_number || "").length){
                await useMessageBird({ mobile: user.tfa_mobile_number, code });
                to  = String(user.tfa_mobile_number).slice(-4).padStart(8, '*')
            }else{
                // Fallback e-Mail wenn keine Mobilnummer vorhanden ist.
                await useSendgrid({
                    to: username,
                    templateId: "d-fa11e5a2f1304dcf9a677e2c873dd159",
                    dynamicTemplateData: {
                        title: "Dein einmaliger Sicherheitscode",
                        primaryColor: "#1a73e8",
                        text: `Am ${dayjs().format("DD.MM.YYYY")} um ${dayjs().format("HH:mm")} wurde ein Code für die Zwei-Faktor-Authentifizierung zu deinem Konto angefordert.`,
                        code,
                        notice: "Bitte gib den Code im gleichen Browserfenster ein, in dem du die Anforderung gestartet hast. Der Code ist 15 Minuten gültig. Teile ihn niemals mit anderen Personen – i-Planner fragt dich nie telefonisch oder per SMS nach diesem Code.",
                        username,
                        sendReason: "weil eine zwei Zwei-Faktor-Authentifizierung wurde.",
                        indexUrl: "https://www.i-planner.de",
                        dataProtectionUrl: "https://www.i-planner.de/datenschutz",
                        imprintUrl: "https://www.i-planner.de/impressum"
                    }
                })
            }

            data.attempt = 1;
            data.lastSentAt = Date.now();
            await redis.set(key, JSON.stringify(data), { EX: 15 * 60 });
        }

        return {
            step: "&nbsp;",
            title: "Login-Code",
            subtitle: `Wir haben dir einen Code an <span style="color: var(--color-primary); white-space: nowrap;">${to}</span> gesendet. Trage den Code hier ein, um dich bei <span style="color: var(--color-primary); white-space: nowrap;">${subdomain}.i-planner.cloud</span> anzumelden.`,
            fieldsets: [
                {
                    id: 1,
                    label: "",
                    name: "login",
                    toggled: false,
                    multiple: false,
                    padding: [0, 4],
                    columns: 1,
                    breakpoints: {},
                    fields: [
                        {
                            id: 11,
                            x: 0,
                            y: 0,
                            w: 1,
                            h: 1,
                            input: "code",
                            props: {
                                label: "Code",
                                placeholder: "",
                                name: "code",
                                value: "",
                                validation: [],
                                validationMessages: {},
                                validationErrors: [],
                            },
                            showIf: [],
                            visible: true,
                        },
                        {
                            id: 12,
                            x: 0,
                            y: 2,
                            w: 1,
                            h: 1,
                            input: "text",
                            props: {
                                label: "",
                                name : 'processId',
                                value : processId,
                                validation: [],
                                validationMessages: {},
                                validationErrors: [],
                            },
                            visible: false,
                            isHiddenField : true
                        }
                    ],
                    showIf: [],
                    math: [],
                }
            ],
            submitLabel: "Anmelden",
            submitTimeout: 1000,
            submitUrl: "/api/login/tfa/google/verify",
            navigateTo: ["", "/login", "Zurück zum Login"],
        }

    }
    
    if(user.tfa_provider === 'totp'){
       
        return {
          step: "&nbsp;",
          title: "Zwei-Faktor-Authentifizierung",
          subtitle: `Öffne bitte deine Authenticator-App und gib den aktuellen 6-stelligen Sicherheitscode für <span style="color: var(--color-primary); white-space: nowrap;">i-planner.app: ${user.username}</span> ein.`,
          fieldsets: [
            {
              id: 1,
              label: "",
              name: "login",
              toggled: false,
              multiple: false,
              padding: [0, 4],
              columns: 1,
              breakpoints: {},
              fields: [
                {
                  id: 11,
                  x: 0,
                  y: 0,
                  w: 1,
                  h: 1,
                  input: "code",
                  props: {
                    label: "Code",
                    placeholder: "",
                    name: "code",
                    value: "",
                    validation: [],
                    validationMessages: {},
                    validationErrors: [],
                  },
                  showIf: [],
                  visible: true,
                },
                {
                  id: 12,
                  x: 0,
                  y: 2,
                  w: 1,
                  h: 1,
                  input: "text",
                  props: {
                    label: "",
                    name: "processId",
                    value: processId,
                    validation: [],
                    validationMessages: {},
                    validationErrors: [],
                  },
                  visible: false,
                  isHiddenField: true,
                },
              ],
              showIf: [],
              math: [],
            },
          ],
          submitLabel: "Anmelden",
          submitTimeout: 1000,
          submitUrl: "/api/login/tfa/totp",
          navigateTo: ["", "/login", "Zurück zum Login"],
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

