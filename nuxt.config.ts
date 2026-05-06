export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  sourcemap: {
    client: 'hidden',
    server: true
  },
  css: ['~/assets/css/design-system.css'],
  modules: ['@nuxtjs/tailwindcss', '@pinia/nuxt', '@nuxt/icon', '@nuxtjs/sitemap', '@vercel/speed-insights', '@vercel/analytics', '@nuxt/fonts'],
  fonts: {
    families: [
      { name: 'Roboto Flex', provider: 'google', weights: ['300..700'] },
      { name: 'Inter', provider: 'google', weights: [400, 500, 600] },
      { name: 'JetBrains Mono', provider: 'google', weights: [400, 500] },
    ],
    defaults: {
      preload: true,
    },
  },
  site: {
    url: 'https://krealalejo.dev',
  },
  sitemap: {
    exclude: ['/admin/**'],
    zeroRuntime: true,
  },
  vite: {
    optimizeDeps: {
      include: [
        '@vue/devtools-core',
        '@vue/devtools-kit',
        '@headlessui/vue',
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
      '/api/posts': { proxy: `${process.env.NUXT_PUBLIC_API_BASE_URL || 'http://localhost:8080'}/posts` },
      '/api/posts/**': { proxy: `${process.env.NUXT_PUBLIC_API_BASE_URL || 'http://localhost:8080'}/posts/**` },
      '/api/portfolio/**': { proxy: `${process.env.NUXT_PUBLIC_API_BASE_URL || 'http://localhost:8080'}/portfolio/**`, cache: { maxAge: 300 } },
      '/api/contact': { proxy: `${process.env.NUXT_PUBLIC_API_BASE_URL || 'http://localhost:8080'}/contact` },
      '/api/config/**': { proxy: `${process.env.NUXT_PUBLIC_API_BASE_URL || 'http://localhost:8080'}/config/**` },
      '/api/activity': { proxy: `${process.env.NUXT_PUBLIC_API_BASE_URL || 'http://localhost:8080'}/activity`, cache: { maxAge: 60 } },
      '/api/activity/**': { proxy: `${process.env.NUXT_PUBLIC_API_BASE_URL || 'http://localhost:8080'}/activity/**` },
      '/api/cv/**': { proxy: `${process.env.NUXT_PUBLIC_API_BASE_URL || 'http://localhost:8080'}/cv/**` },
      '/api/skills/**': { proxy: `${process.env.NUXT_PUBLIC_API_BASE_URL || 'http://localhost:8080'}/skills/**` },
      '/api/upload': { proxy: `${process.env.NUXT_PUBLIC_API_BASE_URL || 'http://localhost:8080'}/upload` },
      '/api/projects/**': { proxy: `${process.env.NUXT_PUBLIC_API_BASE_URL || 'http://localhost:8080'}/projects/**` },
      '/api/admin/metrics': { proxy: `${process.env.NUXT_PUBLIC_API_BASE_URL || 'http://localhost:8080'}/admin/metrics` },
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
      s3PublicBucketUrl: process.env.NUXT_PUBLIC_S3_BUCKET_URL || '',
    }
  }
})
