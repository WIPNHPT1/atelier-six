import { fileURLToPath, URL } from 'node:url'
import { defineConfig, mergeConfig } from 'vitest/config'
import viteConfig from './vite.config.ts'

export default mergeConfig(
  viteConfig,
  defineConfig({
    test: {
      environment: 'jsdom',
      setupFiles: ['src/test/setup.ts'],
      exclude: ['**/node_modules/**', '**/dist/**', '**/._*', 'tests/e2e/**'],
      coverage: {
        provider: 'v8',
        thresholds: {
          'src/core/**': {
            lines: 100,
            functions: 100,
            branches: 100,
            statements: 100,
          },
        },
      },
    },
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },
  }),
)
