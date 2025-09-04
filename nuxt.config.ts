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
  runtimeConfig : extendRuntimeConfig({

    session: {
      name: "iplanner-uid",
      cookie: {
        secure : process.env.NODE_ENV === 'production'
      }
    },
    PGBOUNCER_HOST : 'v5-pgbouncer',
    POSTGRES_HOST: process.env.POSTGRES_HOST,
  }),
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