import jwt from "jsonwebtoken";

export default defineEventHandler(async (event) => {
  
  const config = useRuntimeConfig(event);
  const { token } = getQuery(event);
  const url = getRequestURL(event);

  try {
    
    if (!token.length) {
      throw new Error("RESET_TOKEN_NOT_FOUND");
    }

    const { uid } = jwt.verify( token, config.IP_JWT_SECRET);
  
    return {
      step: "3 von 3",
      title: "Neues Passwort",
      subtitle: `Gib Dein neues Passwort für die Anmeldung bei <span style="color: var(--color-primary); white-space: nowrap;">${url.hostname}</span> ein.`,
      fieldsets: [
        {
          id: 1,
          label: "",
          name: "password-reset",
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
                label: "Neues Passwort",
                placeholder: "",
                name: "password",
                type: "password",
                value: "",
                validation: [
                  ["required"],
                  ["length", 8],
                  ["length[1]", 0, 24],
                  ["containsUppercase"],
                ],
                validationMessages: {
                  required: "Das Passwort darf nicht leer sein!",
                  length: "Das Passwort muss min. 8 Zeichen lang sein!",
                  "length[1]": "Das Passwort darf nicht mehr als 24 Zeichen haben!",
                  containsUppercase: "Das Passwort muss min. einen Großbuchstaben (A-Z) enthalten!",
                },
                validationErrors: [],
              },
              showIf: [],
              visible: true,
            },
            {
              id: 12,
              x: 0,
              y: 1,
              w: 1,
              h: 1,
              input: "text",
              props: {
                label: "Passwort bestätigen",
                placeholder: "",
                name: "password2",
                type: "password",
                value: "",
                validation: [
                  ["required"],
                  ["length", 8],
                  ["length[1]", 0, 24],
                  ["containsUppercase"],
                ],
                validationMessages: {
                  required: "Die Bestätigung darf nicht leer sein!",
                  length: "Das Passwort muss min. 8 Zeichen lang sein!",
                  "length[1]":
                    "Das Passwort darf nicht mehr als 24 Zeichen haben!",
                  containsUppercase:
                    "Das Passwort muss min. einen Großbuchstaben (A-Z) enthalten!",
                },
                validationErrors: [],
              },
              showIf: [],
              visible: true,
            },
            {
              id: 12,
              x: 0,
              y: 2,
              w: 1,
              h: 1,
              input: "text",
              props: {
                label: "",
                name: "uid",
                value: uid,
                validation: [],
                validationMessages: {},
                validationErrors: [],
              },
              visible: false,
              isHiddenField: true,
            },
          ],
          showIf: [],
          math: [],
        },
      ],
      submitLabel: "Weiter",
      submitTimeout: 1000,
      submitUrl: "/api/login/reset/confirm",
      navigateTo: ["", "/login", "Zurück zum Login"],
    };

  } catch (error) {

    console.error(error);

    throw createError({
        statusCode: 400,
        message: response.title,
        data: response
    })

  }
});
