export default defineEventHandler(async (event) => {
  const { reason } = getQuery(event)

  let title = "Fehler"
  let subtitle = "Es ist ein Fehler bei der Verarbeitung deiner Anfrage aufgetreten. Bitte kehre zum Login zurück und versuche es erneut."

  switch (reason) {
    case "expired-tfa-process":
        title = "Zwei-Faktor-Code abgelaufen",
        subtitle = "Der angeforderte Zwei-Faktor-Code ist älter als 15 Minuten. Danach wird er automatisch ungültig und die Sitzung wird beendet. Bitte kehre zum Login zurück und versuche es erneut."
      break;
      case "user-not-found":
        title = "Fehler",
        subtitle = "Für die Zwei-Faktor-Authentifizierung konnte kein User gefunden werden. Bitte kehre zum Login zurück und versuche es erneut."
      break;

  }

  return {
    step: "&nbsp; ",
    title,
    subtitle,
    fieldsets: [],
    submitLabel: "Zurück zum Login",
    submitTimeout: 0,
    submitUrl: "/login",
    navigateTo: ["", "/login"],
  }
})