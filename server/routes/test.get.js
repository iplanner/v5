
export default defineEventHandler(async () => {
  try {
    
    const db = usePostgres();
    const { send } = useSocketServer('d8b0622f-15c0-4c09-be65-c024d4fae680');

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

    const start = Date.now()
    const rows = await db`select * from organizations`
    const durationSec = (Date.now() - start) / 1000 // Dauer in Sekunden

    return {
      duration: durationSec, // Dauer in Sekunden im JSON
      rows
    }
  } catch (err) {
    console.error('[organisations] query failed:', err)
    throw createError({ statusCode: 500, statusMessage: 'DB query failed' })
  }
})
