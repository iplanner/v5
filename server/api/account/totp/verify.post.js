
import { authenticator } from 'otplib'

export default defineEventHandler(async (event) => {

    const { code } = await readBody(event) || {}

    try{

        if (!/^\d{6}$/.test(String(code))) throw new Error("CODE_FORMAT_INVALID")
            
        const session = await useAuthSession(event)
        if (!session?.uid) throw new Error('UNAUTHORIZED')

        const db = usePostgres()
        const [user] = await db`
        SELECT id, username
        FROM users
        WHERE id = ${session.uid}
        LIMIT 1
        `
        if (!user) throw new Error('USER_NOT_FOUND')
        
        // Secret aus transientem Setup holen
        const redis = useRedis();
        const cache = await redis.get(`account:totp-setup:${session.uid}`)
        if (!cache) {
            throw createError({ statusCode: 400, statusMessage: 'Setup abgelaufen oder nicht gefunden' })
        }
        const { secret, provider, name } = JSON.parse(cache) || {};
        if (!secret) {
           throw createError({ statusCode: 400, statusMessage: 'Secret fehlt im Setup' })
        }

        // TOTP prüfen (kleine Toleranz gegen Zeitdrift)
        const ok = authenticator.verify({ token: String(code), secret, window: 1 }) 
        if (!ok) {
            throw createError({ statusCode: 400, statusMessage: 'Code ungültig' })
        }

        // DB: Secret persistieren (+ Provider & enabled setzen)
        const rows = await db`
            INSERT INTO users_auth_provider (
                uid, provider, "type", name, secret, inserted_at
            ) VALUES (
                ${session.uid}, ${provider}, 'totp', ${name}, ${secret}, NOW()
            )
            ON CONFLICT (uid, provider, type)
            DO UPDATE SET
                name       = EXCLUDED.name,
                secret     = EXCLUDED.secret,
                inserted_at = NOW()
            RETURNING id
        `

        if (rows.length !== 1) {
            // falls kein User aktualisiert wurde: als Fehler behandeln
            throw createError({ statusCode: 404, statusMessage: 'Persistierung fehlgeschlagen' })
        }

        // Transienten Setup-Key entfernen
        await redis.del(`account:totp-setup:${session.uid}`)

        return { success: true }    

    } catch(error){

        console.error(error);
        const response = getLoginErrorHandler(error.message, error.cause);
        throw createError({
        statusCode: error?.statusCode,
        message: response.title,
        data: response,
        });

    }
 

  
})