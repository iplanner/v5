import tailwindcss from "@tailwindcss/vite";
import * as dotenv from 'dotenv'

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
    // Server-only (kommen von Render als process.env)
    POSTGRES_HOST: process.env.POSTGRES_HOST,
    POSTGRES_USERNAME: process.env.POSTGRES_USERNAME,
    POSTGRES_PASSWORD: process.env.POSTGRES_PASSWORD,
    POSTGRES_DATABASE: process.env.POSTGRES_DATABASE,
    POSTGRES_PORT: process.env.POSTGRES_PORT || '5432',

    PGBOUNCER_HOST: process.env.PGBOUNCER_HOST,   // bei dir: v5-pgbouncer
    PGBOUNCER_PORT: process.env.PGBOUNCER_PORT || '5432',

    session: {
      name: 'iplanner-uid',
      password: process.env.NUXT_SESSION_PASSWORD as string,
      cookie: { secure: process.env.NODE_ENV === 'production' }
    },

    // Public Keys (falls nötig)
    public: {}
  },
  vite: {
    plugins: [
      tailwindcss(),
    ],
  },
})

function extendRuntimeConfig( existingRuntimeConfig: any ) {
  
  const envConfig = dotenv.config({ path: '.env' }).parsed || {};

  const runtimeConfig = {
    ...existingRuntimeConfig,
    public: {
      ...existingRuntimeConfig.public,
    },
  };

  Object.entries(envConfig).forEach(([key, value]) => {
    
    const isPublic = key.startsWith("PUBLIC_");
    const target = isPublic ? runtimeConfig.public : runtimeConfig;
    
    target[key.replace("PUBLIC_", "")] = value;

  });

  return runtimeConfig;
}