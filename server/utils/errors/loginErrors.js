const LOGIN_ERRORS = {
  USER_NOT_FOUND: {
    title: "Benutzer nicht gefunden!",
    body: "Bitte überprüfe deine E-Mail-Adresse, die Subdomain, oder versuche es erneut.",
    buttons: [
      { value: "/login", display: "Subdomain prüfen" },
      { value: "", display: "Erneut versuchen" }
    ]
  },

  USERNAME_NOT_FOUND_ERROR: {
    title: "Falsche E-Mail-Adresse",
    body: "Bitte überprüfe deine E-Mail-Adresse oder versuche es erneut.",
    buttons: [
      { value: "", display: "E-Mail-Adresse prüfen" },
      { value: "", display: "Abbrechen" }
    ]
  },

  USER_NOT_FOUND_BY_TOKEN: {
    title: "Benutzer nicht gefunden!",
    body: "Die hinterlegten Benutzerdaten sind falsch oder nicht mehr gültig!",
    buttons: [
      { value: "/login", display: "Zurück zum Login" },
      { value: "", display: "Erneut versuchen" }
    ]
  },

  PASSWORDS_EQUAL: {
    title: "Achtung Fehler",
    body: "Das neue Passwort ist unzulässig! Bitte korrigiere die Eingabe.",
    buttons: [{ value: "", display: "Verstanden" }]
  },

  WRONG_PASSWORD: ({ username = "" } = {}) => ({
    title: `Falsches Passwort${username ? ` für ${username}` : ""}`,
    body: "Du kannst einen Login-Code verwenden, das Passwort zurücksetzen oder es erneut versuchen.",
    buttons: [
      { value: `/login/code?username=${encodeURIComponent(username)}`, display: "Login-Code verwenden" },
      { value: `/login/reset?username=${encodeURIComponent(username)}`, display: "Passwort zurücksetzen" },
      { value: "", display: "Erneut versuchen" }
    ]
  }),

  EMAIL_CODE_SEND_ERROR: ({ email = "" } = {}) => ({
    title: "Achtung, ein Fehler ist aufgetreten!",
    body: `Der Bestätigungscode konnte nicht an deine E-Mail-Adresse (${email}) gesendet werden. Bitte überprüfe, ob die E-Mail-Adresse korrekt ist.`,
    buttons: [
      { value: "/login", display: "Eingabe ändern" },
      { value: "", display: "Abbrechen" }
    ]
  }),

  EMAIL_LOGIN_SEND_ERROR: ({ email = "" } = {}) => ({
    title: "Achtung, ein Fehler ist aufgetreten!",
    body: `Der Login-Bereich konnte nicht an deine E-Mail-Adresse (${email}) gesendet werden. Bitte überprüfe, ob die E-Mail-Adresse korrekt ist.`,
    buttons: [
      { value: "/login", display: "Eingabe ändern" },
      { value: "", display: "Abbrechen" }
    ]
  }),

  EMAIL_CODE_USER_ERROR: {
    title: "Falsche E-Mail-Adresse",
    body: "Bitte überprüfe deine E-Mail-Adresse, die Subdomain, oder versuche es erneut.",
    buttons: [
      { value: "/login/code", display: "Subdomain prüfen" },
      { value: "", display: "Erneut versuchen" }
    ]
  },

  EMAIL_CODE_COMPARE_ERROR: {
    title: "Achtung, ein Fehler ist aufgetreten!",
    body: "Der eingetragene Code ist falsch. Bitte überprüfe deine Eingabe oder fordere einen neuen Bestätigungscode an.",
    buttons: [
      { value: "", display: "Eingabe prüfen" },
      { action: "resend", value: "/api/login/resend", display: "Bestätigungscode anfordern" },
      { value: "", display: "Abbrechen" }
    ]
  },

  EMAIL_CODE_EXPIRED_ERROR: {
    title: "Achtung, ein Fehler ist aufgetreten!",
    body: "Der eingetragene Code ist abgelaufen. Bitte fordere einen neuen Bestätigungscode an.",
    buttons: [
      { action: "resend", value: "/api/login/resend", display: "Bestätigungscode anfordern" },
      { value: "", display: "Abbrechen" }
    ]
  },

  TFA_CODE_EXPIRED_ERROR: {
    title: "Achtung, ein Fehler ist aufgetreten!",
    body: "Der eingetragene Code ist bereits abgelaufen. Bitte kehre zum Login zurück und .",
    buttons: [
      { action: "resend", value: "/api/login/resend", display: "Bestätigungscode anfordern" },
      { value: "", display: "Abbrechen" }
    ]
  },

  PASSWORD_NOT_EQUAL: {
    title: "Achtung Fehler",
    body: "Das neue Passwort und die Bestätigung des Passworts müssen identisch sein. Bitte überprüfe deine Eingabe und versuche es erneut.",
    buttons: [{ value: "", display: "OK" }]
  },

  ERROR_PAGE: ({ params } = {}) => ({
    params
  }),
}

export function getLoginErrorHandler(code, context = {}, overrides = {}) {

  const error = LOGIN_ERRORS[code] || {
    title: "Ein Fehler ist aufgetreten!",
    body: "Bitte versuche es später erneut.",
    buttons: [{ value: "/login", display: "Zurück zum Login" }]
  }

  const resolved = typeof error === 'function' ? error(context) : error

  return {
    show: true,
    error: true,
    inline: false,
    ...resolved,
    ...overrides
  }
}