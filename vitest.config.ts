import { defineConfig } from 'vitest/config'
import tsconfigPaths from 'vite-tsconfig-paths'

export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    passWithNoTests: true,
    // Exclude Playwright E2E specs — they run under @playwright/test, not Vitest.
    exclude: ['**/node_modules/**', '**/dist/**', '**/.next/**', '**/out/**', 'e2e/**'],
  },
})
