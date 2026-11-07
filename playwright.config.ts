import { defineConfig, devices } from '@playwright/test';

// Not Vite's default 4173: a preview left running there would serve a stale build.
const PORT = 4317;
const isCI = Boolean(process.env.CI);

// Seam 2 (spec.md): one user flow on desktop Chromium and WebKit iPhone (D21, D28).
export default defineConfig({
  testDir: 'e2e',
  fullyParallel: true,
  forbidOnly: isCI,
  retries: isCI ? 2 : 0,
  workers: isCI ? 1 : undefined,
  reporter: isCI ? [['github'], ['html', { open: 'never' }]] : 'list',
  use: {
    // Vite `base` (ADR-0003): specs navigate with relative URLs such as `#/?mode=zen`.
    baseURL: `http://localhost:${PORT}/piano-quest/`,
    trace: 'on-first-retry',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'iphone', use: { ...devices['iPhone 15'] } },
  ],
  // The production build, as GitHub Pages serves it (testing rules).
  webServer: {
    command: `npm run build && npm run preview -- --port ${PORT} --strictPort`,
    url: `http://localhost:${PORT}/piano-quest/`,
    // Always build fresh, so a test never passes against old code.
    reuseExistingServer: false,
    // Build plus preview can pass the 60 s default on a cold CI runner.
    timeout: 120_000,
  },
});
