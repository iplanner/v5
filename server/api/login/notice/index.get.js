export default defineEventHandler( async event => {

    const { reason, username } = getQuery(event);

    switch (reason) {
      
/*       case "subdomain-missing":
        return {
          step: "&nbsp;",
          title: "Perfekt, vielen Dank!",
          subtitle: username?.length
            ? `Wir haben Dir eine E-Mail an <span style="color: var(--color-primary); white-space: nowrap;">${username}</span> gesendet. Bitte überprüfe dein Postfach und folge den Anweisungen in dieser E-Mail.`
            : `Wir haben Dir eine E-Mail gesendet. Bitte überprüfe dein Postfach und folge den Anweisungen in dieser <span style="white-space: nowrap;">E-Mail</span>.`,
          fieldsets: [
            {
              id: 1,
              label: "",
              name: "confirm",
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
                  input: "text",
                  props: {
                    label: "E-Mailadresse",
                    placeholder: "",
                    name: "username",
                    value: username,
                    validation: [["required"], ["email"]],
                    validationMessages: {
                      required: "Die E-Mail darf nicht leer sein!",
                      email: "Die E-Mail hat kein gültiges Format!",
                    },
                    validationErrors: [],
                  },
                  showIf: [],
                  visible: false,
                },
              ],
              showIf: [],
              math: [],
            },
          ],
          submitLabel: "",
          submitTimeout: 1000,
          submitUrl: "",
          navigateTo: [],
          resendText: [
            "Keine E-Mail erhalten? Bitte prüfe auch deinen Spam-Ordner.",
            "E-Mail erneut senden?",
          ],
          resendUrl: "/api/login/resend",
        };

      case "password-reset":
        return {
          step: "2 von 3",
          title: "Perfekt, vielen Dank!",
          subtitle: username?.length
            ? `Wir haben eine E-Mail an <span style="color: var(--color-primary); white-space: nowrap;">${username}</span> geschickt – bitte überprüfe dein Postfach und folge den weiteren Schritten.`
            : `Wir haben dir eine E-Mail geschickt – bitte überprüfe dein Postfach und folge den weiteren Schritten`,
          fieldsets: [],
          submitTimeout: 1000,
          submitLabel: "",
          submitUrl: "",
          navigateTo: [],
          resendText: [
            "Keine E-Mail erhalten? Bitte prüfe auch deinen Spam-Ordner.",
            "E-Mail erneut senden?",
          ],
          resendUrl: `/api/login/resend?reason=${reason}&username=${encodeURIComponent(username).replace("%40", "@")}`,
        };

      case "logged-out":
        return {
          step: "&nbsp",
          title: "Auf Wiedersehen!",
          subtitle: "Du wurdest erfolgreich abgemeldet. Kehre zum Login zurück, um dich erneut anzumelden und fortzufahren.",
          fieldsets: [],
          submitTimeout: 0,
          submitLabel: "Zum Login",
          submitUrl: "",
          navigateTo: [
            "",
            "/login"
          ],
          resendText: [],
          resendUrl: "",
        }; */

      case "new-device-detected":
        return {
          step: "&nbsp;",
          title: "Neues Gerät erkannt",
          subtitle: `Zur Bestätigung deiner Anmeldung haben wir dir eine E-Mail an <span style="color: var(--color-primary); white-space: nowrap;">${username}</span> gesendet. Bitte öffne dein Postfach und folge den Anweisungen.`,
          fieldsets: [],
          submitTimeout: 0,
          submitLabel: "",
          submitUrl: "",
          navigateTo: [],
          resendText: [
            "Keine E-Mail erhalten? Bitte prüfe auch deinen Spam-Ordner.",
            "E-Mail erneut senden?",
          ],
          resendUrl: `/api/login/resend?reason=${reason}&username=${encodeURIComponent(username).replace("%40", "@")}`,
        };
      default:
        return {
          step: "&nbsp;",
          title: "Oops...",
          subtitle:
            "Da ist etwas schiefgelaufen. Bitte versuche es noch einmal!",
          fieldsets: [],
          submitTimeout: 0,
          submitLabel: "Zurück zum Login",
          submitUrl: "",
          navigateTo: [],
          resendText: [],
          resendUrl: "",
        };
    }
 
})