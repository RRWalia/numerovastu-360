import { defineConfig, devices } from '@playwright/test';

/* Separate config from playwright.config.mjs on purpose:
   - the pixel suite runs fullyParallel, which is exactly wrong for timing
     (parallel workers contend for CPU and inflate every number);
   - the pixel suite retries on CI, which would silently hide an intermittent
     perf failure behind a lucky second attempt;
   - this suite takes no screenshots, so it needs no snapshot path template and
     can never produce a baseline diff.

   Run: npm run test:perf   (override sample count with NV_PERF_RUNS=5) */

const PORT = process.env.PORT || 4174;

export default defineConfig({
  testDir: './tests/perf',
  outputDir: './test-results',
  timeout: 180_000,
  expect: { timeout: 15_000 },
  /* One worker, no parallelism, no retries — a timing run must not share the
     machine with another timing run, and a flaky pass is not a pass. */
  fullyParallel: false,
  workers: 1,
  retries: 0,
  forbidOnly: !!process.env.CI,
  reporter: process.env.CI ? [['list'], ['html', { open: 'never', outputFolder: 'playwright-report-perf' }]] : 'list',
  use: {
    baseURL: `http://127.0.0.1:${PORT}`,
    bypassCSP: true,
    colorScheme: 'light',
    reducedMotion: 'reduce',
    trace: 'retain-on-failure',
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
