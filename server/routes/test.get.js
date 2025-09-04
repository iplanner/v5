
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

async function renderVueComponent(componentName, props) {
  // Komponente dynamisch importieren
  const componentPath = `components/emails/${componentName}.vue`
  const { default: Component } = await import(componentPath);
  
  // SSR App erstellen
  const app = createSSRApp(Component, props)
  
  // Zu HTML String rendern
  const html = await renderToString(app)
  
  // Vollständiges HTML Dokument erstellen
  return `
    <!DOCTYPE html>
    <html lang="de">
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body { 
            font-family: Arial, sans-serif; 
            margin: 0; 
            padding: 0; 
            background-color: #f4f4f4; 
          }
          .email-container { 
            max-width: 600px; 
            margin: 0 auto; 
            background-color: white; 
          }
          /* Globale E-Mail Styles hier */
        </style>
      </head>
      <body>
        <div class="email-container">
          ${html}
        </div>
      </body>
    </html>
  `
}