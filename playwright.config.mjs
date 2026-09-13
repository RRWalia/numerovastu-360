import { defineConfig, devices } from '@playwright/test';

const PORT = process.env.PORT || 4173;

export default defineConfig({
  testDir: './tests/visual',
  outputDir: './test-results',
  /* Baselines are addressed by spec + project + platform, e.g.
     tests/visual/report-print.visual.spec.js-snapshots/loshu-birth-grid-chromium-desktop-linux.png
     Keeping the platform suffix means a baseline generated on ubuntu-latest is
     never accidentally compared against one from macOS or Windows. */
  snapshotPathTemplate: '{testDir}/{testFilePath}-snapshots/{arg}-{projectName}-{platform}{ext}',
  timeout: 60_000,
  expect: {
    timeout: 10_000,
    toHaveScreenshot: {
      animations: 'disabled',
      caret: 'hide',
      maxDiffPixelRatio: 0.015,
      threshold: 0.2,
    },
  },
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: process.env.CI ? [['html', { open: 'never' }], ['list']] : 'list',
  use: {
    baseURL: `http://127.0.0.1:${PORT}`,
    bypassCSP: true,
    colorScheme: 'light',
    reducedMotion: 'reduce',
    trace: 'on-first-retry',
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
