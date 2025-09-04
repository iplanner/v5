export default defineEventHandler(async event => {
  
  const config = useRuntimeConfig(event);
  const { username, reason } = getQuery(event);
  const headers = getRequestHeaders(event);

  const url = getRequestURL(event)
  const { session } = event.context;

  event.$fetch("/logout");

  const res = {
    step: '&nbsp;',
    title: 'Login',
    subtitle: `Melde dich bei <span style="color: var(--color-primary); white-space: nowrap;">${url.hostname}</span> ${ (reason === 'password-reset') ? 'mit deinem neuen Passwort' : '' } an.`,
    fieldsets: [
      {
        id: 1,
        label: "",
        name: "login",
        toggled: false,
        multiple: false,
        padding: [0,4],
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
              label: "E-Mail",
              placeholder: "",
              name: "username",
              value: username,
              validation: [["required"], ['email']],
              validationMessages: {
                required: "Die E-Mail darf nicht leer sein!",
                email: "Die E-Mail hat kein gültiges Format!",
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
              label: "Passwort",
              placeholder: "",
              type: 'password',
              name: "password",
              value: '',
              validation: [["required"]],
              validationMessages: {
                required: "Das Passwort darf nicht leer sein!",
              },
              validationErrors: [],
            },
            showIf: [],
            visible: true,
          },
          {
            id: 13,
            x: 0,
            y: 2,
            w: 1,
            h: 1,
            input: "text",
            props: {
              label: "",
              name : 'subdomain',
              value : url.hostname.split(".")[0] || "",
              validation: [],
              validationMessages: {},
              validationErrors: [],
            },
            visible: false,
            isHiddenField : true
          }
              ],
              showIf: [],
              math: [],
            },
      
    ],
    submitLabel: 'Anmelden',
    submitTimeout: 1000,
    submitUrl: '/api/login',
    navigateTo: ['', `/login/reset?username=${username?encodeURIComponent(username).replace("%40", "@"):''}`, 'Passwort vergessen?'],
  };

  return res;
});
