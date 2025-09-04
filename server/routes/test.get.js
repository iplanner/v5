
export default defineEventHandler(async () => {
  try {
    
    const db = usePostgres();

    const start = Date.now()
    const rows = await db`select * from organisations`
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