import { defineVitestConfig } from '@nuxt/test-utils/config'

export default defineVitestConfig({
  test: {
    environment: 'nuxt',
    environmentOptions: {
      nuxt: {
        domEnvironment: 'happy-dom',
        overrides: {
          runtimeConfig: {
            public: {
              apiBase: 'http://localhost:8080/api',
              cognitoClientId: 'test-client-id',
              cognitoDomain: 'https://test.auth.example.com',
              cognitoRedirectUri: 'http://localhost:3000/api/auth/callback',
            },
          },
        },
      },
    },
    include: ['**/*.test.ts', '**/*.spec.ts'],
    setupFiles: ['./app/tests/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov'],
      reportsDirectory: './coverage',
      include: ['app/**/*.ts', 'app/pages/**/*.vue', 'server/**/*.ts'],
      exclude: ['**/*.test.ts', '**/*.spec.ts', '**/*.d.ts', '.nuxt/**', '.output/**', 'app/types/**'],
      thresholds: {
        lines: 80,
        statements: 80,
        functions: 80,
        branches: 80,
      },
    },
  },
})
