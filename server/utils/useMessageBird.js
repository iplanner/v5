export async function useMessageBird({ mobile, code }) {
  const config = useRuntimeConfig();

  const body = new URLSearchParams({
    recipients: mobile,
    originator: "iPlanner",
    body: `Hallo, der Bestätigungscode lautet: ${code}. Trage den Code ein, um deine Mobilnummer zu bestätigen.`,
  });

  try {
    return await $fetch(config.MESSAGE_BIRD_API_URL, {
      method: "POST",
      headers: {
        Authorization: `AccessKey ${config.MESSAGE_BIRD_API_KEY}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body,
      timeout: 5000,
    });
  } catch (err) {
    console.error("MessageBird error:", err?.response || err.message || err);
    throw err;
  }
}