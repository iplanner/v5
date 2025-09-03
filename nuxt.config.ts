import tailwindcss from "@tailwindcss/vite";

export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  modules: [
    '@vueuse/nuxt', 
    '@nuxt/image'
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
  vite: {
    plugins: [
      tailwindcss(),
    ],
  },
})