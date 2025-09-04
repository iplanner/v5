import tailwindcss from "@tailwindcss/vite";

export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  modules: [
    '@vueuse/nuxt', 
    '@nuxt/image', 
    'nuxt-auth-utils'
  ],
  css: [
    '~/assets/css/main.css'
  ],
  pages : {
    pattern: ['**/*.vue', '!**/components/**'], 
  },
  components: [
    {
      path: '~/components',
      pathPrefix: false,
    },
    {
      path: '~/pages',
      pattern: '**/components/**', 
      pathPrefix: false
    }
  ],
  runtimeConfig: {

    POSTGRES_HOST: process.env.POSTGRES_HOST,
    POSTGRES_USERNAME: process.env.POSTGRES_USERNAME,
    POSTGRES_PASSWORD: process.env.POSTGRES_PASSWORD,
    POSTGRES_DATABASE: process.env.POSTGRES_DATABASE,
    POSTGRES_PORT: process.env.POSTGRES_PORT || '5432',

    PGBOUNCER_HOST: process.env.PGBOUNCER_HOST,
    PGBOUNCER_PORT: process.env.PGBOUNCER_PORT || '5432',

    IP_INFO_DEFAULT_IP : process.env.IP_INFO_DEFAULT_IP,

    session: {
      name: 'iplanner-uid',
      password: process.env.NUXT_SESSION_PASSWORD as string,
      cookie: { secure: process.env.NODE_ENV === 'production' }
    },

    // Public Keys (falls nötig)
    public: {
    }
  },
  imports : {
    dirs : [
      '../shared',
      '../server/models',
      '../stores'
    ]
  },
  nitro: {
    experimental : {
      websocket : true,
    },
    imports : {
      dirs : [
        'shared',
        'server/models',
      ]
    },
  },
  vite: {
    plugins: [
      tailwindcss(),
    ],
  },
})
