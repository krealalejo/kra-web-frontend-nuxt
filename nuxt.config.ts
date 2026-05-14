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
      { name: 'Roboto Flex', provider: 'google', weights: ['300..700'], display: 'block', preload: true },
      { name: 'Inter', provider: 'google', weights: [400, 500, 600], display: 'optional', preload: false },
      { name: 'JetBrains Mono', provider: 'google', weights: [400, 500], display: 'optional', preload: false },
    ],
    defaults: {
      display: 'swap',
    },
  },
  site: {
    url: 'https://krealalejo.dev',
  },
  sitemap: {
    exclude: ['/admin/**'],
    sources: ['/api/_sitemap/posts'],
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
    },
    head: {
      link: [
        { rel: 'icon', href: '/favicon.ico', sizes: 'any' },
        { rel: 'icon', href: '/icon.svg', type: 'image/svg+xml' },
        { rel: 'apple-touch-icon', href: '/apple-touch-icon.png' },
        { rel: 'manifest', href: '/site.webmanifest' }
      ]
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
    '/admin/**': { ssr: false },
    '/admin/login': { ssr: true },
  },
  nitro: {
    routeRules: {
      '/api/posts': { proxy: `${process.env.NUXT_PUBLIC_API_BASE_URL || 'http://localhost:8080'}/posts` },
      '/api/posts/**': { proxy: `${process.env.NUXT_PUBLIC_API_BASE_URL || 'http://localhost:8080'}/posts/**` },
      '/api/portfolio/**': { proxy: `${process.env.NUXT_PUBLIC_API_BASE_URL || 'http://localhost:8080'}/portfolio/**`, cache: { maxAge: 300 } },
      '/api/contact': { proxy: `${process.env.NUXT_PUBLIC_API_BASE_URL || 'http://localhost:8080'}/contact` },
      '/api/config/**': { proxy: `${process.env.NUXT_PUBLIC_API_BASE_URL || 'http://localhost:8080'}/config/**`, cache: { maxAge: 300 } },
      '/api/activity': { proxy: `${process.env.NUXT_PUBLIC_API_BASE_URL || 'http://localhost:8080'}/activity`, cache: { maxAge: 60 } },
      '/api/activity/**': { proxy: `${process.env.NUXT_PUBLIC_API_BASE_URL || 'http://localhost:8080'}/activity/**` },
      '/api/cv/**': { proxy: `${process.env.NUXT_PUBLIC_API_BASE_URL || 'http://localhost:8080'}/cv/**`, cache: { maxAge: 300 } },
      '/api/skills/**': { proxy: `${process.env.NUXT_PUBLIC_API_BASE_URL || 'http://localhost:8080'}/skills/**` },
      '/api/upload': { proxy: `${process.env.NUXT_PUBLIC_API_BASE_URL || 'http://localhost:8080'}/upload` },
      '/api/projects/**': { proxy: `${process.env.NUXT_PUBLIC_API_BASE_URL || 'http://localhost:8080'}/projects/**` },
      '/api/images/**': { proxy: `${process.env.NUXT_PUBLIC_API_BASE_URL || 'http://localhost:8080'}/images/**`, cache: { maxAge: 86400 } },
    }
  },
  runtimeConfig: {
    apiBase: process.env.NUXT_PUBLIC_API_BASE_URL || 'http://localhost:8080',
    cognitoClientSecret: process.env.NUXT_COGNITO_CLIENT_SECRET || '',
public: {
      apiBase: process.env.NODE_ENV === 'production' ? '/api' : (process.env.NUXT_PUBLIC_API_BASE_URL || 'http://localhost:8080'),
      cognitoDomain: process.env.NUXT_PUBLIC_COGNITO_DOMAIN || '',
      cognitoClientId: process.env.NUXT_COGNITO_CLIENT_ID || '',
      cognitoRedirectUri: process.env.NUXT_COGNITO_REDIRECT_URI || '',
      cognitoLogoutUri: process.env.NUXT_COGNITO_LOGOUT_URI || '',
    }
  }
})
