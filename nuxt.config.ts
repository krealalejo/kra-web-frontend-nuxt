export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  modules: ['@nuxtjs/tailwindcss', '@pinia/nuxt', '@vee-validate/nuxt', '@nuxt/icon'],
  app: {
    pageTransition: {
      name: 'page',
      mode: 'out-in',
    }
  },
  routeRules: {
    '/admin/**': { ssr: false }
  },
  runtimeConfig: {
    cognitoClientSecret: process.env.NUXT_COGNITO_CLIENT_SECRET || '',
    public: {
      apiBase: process.env.NUXT_PUBLIC_API_BASE_URL || '',
      cognitoDomain: process.env.NUXT_PUBLIC_COGNITO_DOMAIN || '',
      cognitoClientId: process.env.NUXT_COGNITO_CLIENT_ID || '',
      cognitoRedirectUri: process.env.NUXT_COGNITO_REDIRECT_URI || '',
      cognitoLogoutUri: process.env.NUXT_COGNITO_LOGOUT_URI || '',
    }
  }
})
