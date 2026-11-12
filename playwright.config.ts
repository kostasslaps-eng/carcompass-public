import { defineConfig } from '@playwright/test'

// E2E on the PUBLIC production build, served under a sub-path like GitHub Pages.
export const BASE = '/carcompass-demo/'
const PORT = 4174

export default defineConfig({
  testDir: 'tests/e2e',
  testMatch: '**/*.spec.ts',
  fullyParallel: false,
  retries: 0,
  reporter: 'list',
  use: {
    baseURL: `http://localhost:${PORT}${BASE}`,
    viewport: { width: 390, height: 844 },
    trace: 'retain-on-failure',
  },
  webServer: {
    // Plain commands (not an npm script) so this config works unchanged in the exported public repo.
    command: `npx tsc -b && npx vite build && npx vite preview --port ${PORT} --strictPort`,
    url: `http://localhost:${PORT}${BASE}`,
    env: { BASE_PATH: BASE, VITE_EDITION: 'public' },
    reuseExistingServer: false,
    timeout: 180_000,
  },
})
