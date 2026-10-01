import { defineConfig, devices } from '@playwright/test';

const PORT = process.env.PORT || 4174;

export default defineConfig({
  testDir: './tests/perf',
  outputDir: './test-results-perf',
  timeout: 90_000,
  expect: {
    timeout: 15_000,
  },
  fullyParallel: false,
  workers: 1,
  retries: 0,
  reporter: process.env.CI ? [['list'], ['html', { open: 'never', outputFolder: 'playwright-perf-report' }]] : 'list',
  use: {
    baseURL: `http://127.0.0.1:${PORT}`,
    bypassCSP: true,
    colorScheme: 'light',
    reducedMotion: 'reduce',
  },
  webServer: {
    command: `npm run dev -- --port ${PORT}`,
    url: `http://127.0.0.1:${PORT}`,
    reuseExistingServer: !process.env.CI,
    timeout: 30_000,
  },
  projects: [
    {
      name: 'chromium-desktop',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1280, height: 1440 },
        deviceScaleFactor: 1,
      },
    },
  ],
});
