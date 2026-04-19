import { defineVitestConfig } from '@nuxt/test-utils/config'

export default defineVitestConfig({
  test: {
    environment: 'nuxt',
    environmentOptions: {
      nuxt: {
        domEnvironment: 'happy-dom',
      },
    },
    include: ['**/*.test.ts', '**/*.spec.ts'],
      coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov'],
      reportsDirectory: './coverage',
      include: ['app/**/*.ts', 'server/**/*.ts'],
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
