export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  sourcemap: {
    client: 'hidden',
    server: true
  },
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
  nitro: {
    routeRules: {
      '/api/**': { proxy: `${process.env.NUXT_PUBLIC_API_BASE_URL || 'http://localhost:8080'}/**` }
    }
  },
  runtimeConfig: {
    apiBase: process.env.NUXT_PUBLIC_API_BASE_URL || 'http://localhost:8080',
    cognitoClientSecret: process.env.NUXT_COGNITO_CLIENT_SECRET || '',
    s3BucketUrl: process.env.NUXT_S3_BUCKET_URL || process.env.NUXT_PUBLIC_S3_BUCKET_URL || '',
    public: {
      apiBase: process.env.NODE_ENV === 'production' ? '/api' : (process.env.NUXT_PUBLIC_API_BASE_URL || 'http://localhost:8080'),
      cognitoDomain: process.env.NUXT_PUBLIC_COGNITO_DOMAIN || '',
      cognitoClientId: process.env.NUXT_COGNITO_CLIENT_ID || '',
      cognitoRedirectUri: process.env.NUXT_COGNITO_REDIRECT_URI || '',
      cognitoLogoutUri: process.env.NUXT_COGNITO_LOGOUT_URI || '',
      s3PublicBucketUrl: process.env.NUXT_PUBLIC_S3_BUCKET_URL || process.env.NUXT_S3_BUCKET_URL || '',
    }
  }
})
