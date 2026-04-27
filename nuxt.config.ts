export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  sourcemap: {
    client: 'hidden',
    server: true
  },
  css: ['~/assets/css/design-system.css'],
  modules: ['@nuxtjs/tailwindcss', '@pinia/nuxt', '@vee-validate/nuxt', '@nuxt/icon'],
  vite: {
    optimizeDeps: {
      include: [
        '@vue/devtools-core',
        '@vue/devtools-kit',
        'gsap',
        'mermaid',
        'marked',
        'dompurify',
        'sanitize-html',
        '@headlessui/vue',
        'zod',
        '@vee-validate/zod',
      ]
    },
    build: {
      chunkSizeWarningLimit: 1000,
    }
  },
  icon: {
    serverBundle: 'local'
  },
  app: {
    head: {
      link: [
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
        { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Roboto+Flex:opsz,wght,wdth@8..144,300..700,75..125&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap' },
      ]
    },
    pageTransition: {
      name: 'page',
      mode: 'out-in',
    }
  },
  hooks: {
    'nitro:config'(nitroConfig) {
      if (nitroConfig.imports) {
        nitroConfig.imports.imports = (nitroConfig.imports.imports || []).filter(
          (i) => typeof i === 'object' && i.name !== 'useAppConfig'
        );
      }
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
