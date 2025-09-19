
import { authenticator } from 'otplib'

export default defineEventHandler(async (event) => {
  
  const { userId, code } = await readBody(event) || {}

  if (!userId || !code) {
    throw createError({ statusCode: 400, statusMessage: 'userId und code erforderlich' })
  }

  // Optional: 6-stellig + nur Ziffern prüfen (verhindert Unsinn)
  if (!/^\d{6}$/.test(String(code))) {
    throw createError({ statusCode: 400, statusMessage: 'Code-Format ungültig' })
  }

  // Secret aus transientem Setup holen
  const redis = useRedis();
  const cache = await redis.get(`tfa:totp-setup:${userId}`)
  if (!cache) {
    throw createError({ statusCode: 400, statusMessage: 'Setup abgelaufen oder nicht gefunden' })
  }
  const { secret } = JSON.parse(cache)

  // TOTP prüfen (kleine Toleranz gegen Zeitdrift)
  const ok = authenticator.verify({ token: String(code), secret, window: 1 }) 
  if (!ok) {
    throw createError({ statusCode: 400, statusMessage: 'Code ungültig' })
  }

  // DB: Secret persistieren (+ Provider & enabled setzen)
  const db = usePostgres()
  const rows = await db`
    UPDATE users
    SET
      tfa_secret   = ${secret},
      tfa_provider = 'totp',
      updated_at   = NOW()
    WHERE id = ${userId}
    RETURNING id
  `
  if (rows.length !== 1) {
    // falls kein User aktualisiert wurde: als Fehler behandeln
    throw createError({ statusCode: 404, statusMessage: 'Benutzer nicht gefunden' })
  }

  // Transienten Setup-Key entfernen
  await redis.del(`tfa:totp-setup:${userId}`)

  return { success: true }
})