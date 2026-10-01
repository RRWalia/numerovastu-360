/* ============================================================
   Shared browser fixture: drive the intake form to a complete,
   deterministic report.

   Extracted from report-print.visual.spec.js so the pixel suite
   and the print-performance suite exercise the SAME input. A
   benchmark measured against a different report than the one the
   baselines pin would drift silently: a timing regression could
   then be explained away as "different data" and a layout change
   would move the numbers without anyone noticing.

   Lives outside testDir on purpose — Playwright only collects
   *.spec.js under tests/visual and tests/perf, so this file is a
   plain module, never a test.
   ============================================================ */

export const FIXED_NOW = Date.UTC(2026, 8, 5, 9, 0, 0); // 2026-09-05 UTC

export async function freezeBrowserTime(page) {
  await page.addInitScript((fixedNow) => {
    const RealDate = Date;
    class FixedDate extends RealDate {
      constructor(...args) { super(...(args.length ? args : [fixedNow])); }
      static now() { return fixedNow; }
      static parse(value) { return RealDate.parse(value); }
      static UTC(...args) { return RealDate.UTC(...args); }
    }
    globalThis.Date = FixedDate;
  }, FIXED_NOW);
}

export async function stabilizeVisuals(page) {
  await page.addStyleTag({
    content: `
      *, *::before, *::after {
        animation-duration: 0s !important;
        animation-delay: 0s !important;
        animation-iteration-count: 1 !important;
        scroll-behavior: auto !important;
        transition-duration: 0s !important;
        transition-delay: 0s !important;
        caret-color: transparent !important;
      }
      .toast-viewport, .skip-link { display: none !important; }
    `,
  });
}

/* Fills the intake form and submits it. Returns once #reportView is visible.
   The caller supplies `expect` so this module stays free of a Playwright
   import and can be reused from any config/project. */
export async function fillIntakeForm(page) {
  await page.locator('#fullName').fill('Priya Sharma');
  await page.locator('#dob').fill('20-08-2005'); // dd-mm-yyyy
  await page.locator('#mobile').fill('9876543210');
  await page.locator('#gender').selectOption('female');
  await page.locator('#vehicle').fill('HR51AB1234');
  await page.locator('#birthTime').fill('14:05');
  await page.locator('#birthPlace').fill('New Delhi, India');
  await page.locator('#partnerName').fill('Arjun Patel');
  await page.locator('#partnerDob').fill('04-04-2000'); // dd-mm-yyyy
  await page.locator("#goalChips .chip[data-goal='Money']").click();
  await page.locator("#goalChips .chip[data-goal='Career']").click();
  await page.locator('#entrance').selectOption('SW');
  await page.locator('#kitchen').selectOption('NE');
  await page.locator('#bedroom').selectOption('SW');
  await page.locator('#toilet').selectOption('NW');
  await page.locator('#study').selectOption('E');
  await page.locator('#staircase').selectOption('NE');
  await page.locator('#plotShape').selectOption('missing-northeast');
  await page.locator('#watchType').selectOption('smart');
  await page.locator('#intakeForm').evaluate((form) => form.requestSubmit());
}

export async function generateCompleteReport(page, expect) {
  await freezeBrowserTime(page);
  await page.goto('/');
  await stabilizeVisuals(page);
  await fillIntakeForm(page);
  await expect(page.locator('#reportView')).toBeVisible();
}
