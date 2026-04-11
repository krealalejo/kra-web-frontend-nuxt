export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  modules: ['@nuxtjs/tailwindcss'],
  routeRules: {
    '/admin/**': { ssr: false }
  },
  runtimeConfig: {
    cognitoClientId: process.env.NUXT_COGNITO_CLIENT_ID || '',
    cognitoClientSecret: process.env.NUXT_COGNITO_CLIENT_SECRET || '',
    cognitoRedirectUri: process.env.NUXT_COGNITO_REDIRECT_URI || '',
    public: {
      apiBase: process.env.NUXT_PUBLIC_API_BASE_URL || '',
      cognitoDomain: process.env.NUXT_PUBLIC_COGNITO_DOMAIN || ''
    }
  }
})
