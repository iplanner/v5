// server/api/accounts.post.ts
export default defineEventHandler(async (event) => {
  
  const { EE_API_URL = "", EE_API_TOKEN = ""} = useRuntimeConfig(event);

  if (!EE_API_URL || !EE_API_TOKEN) {
    throw createError({
      statusCode: 500,
      message: "EmailEngine Konfiguration fehlt (BASE_URL / API_TOKEN).",
    });
  }

  // Request-Body (wird unverändert durchgereicht)
  const payload = await readBody(event);

  try {
    // an EmailEngine weiterreichen
    const data = await $fetch(`${EE_API_URL}/v1/account`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${EE_API_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: {
        "account": "example",
        "name": "Nyan Cat",
        "email": "nyan.cat@example.com",
        "imap": {
            "auth": {
                "user": "nyan.cat",
                "pass": "sercretpass"
            },
            "host": "mail.example.com",
            "port": 993,
            "secure": true
        },
        "smtp": {
            "auth": {
            "user": "nyan.cat",
            "pass": "secretpass"
            },
            "host": "mail.example.com",
            "port": 465,
            "secure": true
        }
    }
    });

    // Erfolgsantwort von EmailEngine direkt zurückgeben
    return data;
  } catch (error) {
    console.log(error);
  }
});