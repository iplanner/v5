export default defineEventHandler(async (event) => {

  const query = getQuery(event);
  const url = getRequestURL(event);

  return {
    step: "1 von 3",
    title: "Passwort vergessen?",
    subtitle: `Kein Problem! Gib einfach die E-Mail Adresse ein, die du für die Anmeldung bei <span style="color: var(--color-primary); white-space: nowrap;">${url.hostname}</span> verwendest.`,
    fieldsets: [
      {
        id: 1,
        label: "",
        name: "login",
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
              value: query?.username || "",
              validation: [
                ["required"],
                ["email"]
              ],
              validationMessages: {
                required: "Die E-Mail darf nicht leer sein!",
                email: "Die E-Mail hat kein gültiges Format!",
              },
              validationErrors: [],
            },
            showIf: [],
            visible: true,
          },
        ],
        showIf: [],
        math: [],
      }
    ],
    submitLabel: "Weiter",
    submitTimeout: 1000,
    submitUrl: "/api/login/reset",
    navigateTo:  ["", "/login", "Zurück zum Login"],
  };
});
