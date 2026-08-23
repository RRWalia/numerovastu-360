import { expect, test } from '@playwright/test';

const FIXED_NOW = Date.UTC(2026, 7, 23, 9, 0, 0); // 2026-08-23 09:00:00 UTC

async function freezeBrowserTime(page) {
  await page.addInitScript((fixedNow) => {
    const RealDate = Date;
    class FixedDate extends RealDate {
      constructor(...args) {
        super(...(args.length ? args : [fixedNow]));
      }
      static now() { return fixedNow; }
      static parse(value) { return RealDate.parse(value); }
      static UTC(...args) { return RealDate.UTC(...args); }
    }
    globalThis.Date = FixedDate;
  }, FIXED_NOW);
}

async function stabilizeVisuals(page) {
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

async function generateCompleteReport(page) {
  await freezeBrowserTime(page);
  await page.goto('/');
  await stabilizeVisuals(page);

  await page.locator('#fullName').fill('Priya Sharma');
  await page.locator('#dob').fill('2005-08-20');
  await page.locator('#mobile').fill('9876543210');
  await page.locator('#gender').selectOption('female');
  await page.locator('#vehicle').fill('HR51AB1234');
  await page.locator('#birthTime').fill('14:05');
  await page.locator('#birthPlace').fill('New Delhi, India');

  await page.locator("#goalChips .chip[data-goal='Money']").click();
  await page.locator("#goalChips .chip[data-goal='Career']").click();
  await page.locator("#goalChips .chip[data-goal='Relationship']").click();

  await page.locator('#entrance').selectOption('SW');
  await page.locator('#kitchen').selectOption('NE');
  await page.locator('#bedroom').selectOption('SW');
  await page.locator('#toilet').selectOption('NW');
  await page.locator('#study').selectOption('E');
  await page.locator('#staircase').selectOption('NE');
  await page.locator('#plotShape').selectOption('missing-northeast');
  await page.locator('#watchType').selectOption('smart');

  await page.locator('#brand').fill('Shree Balaji Textiles');
  await page.locator('#partnerName').fill('Anjali Verma');
  await page.locator('#partnerDob').fill('1990-04-15');

  await page.locator('#intakeForm').evaluate((form) => form.requestSubmit());

  await expect(page.locator('#reportView')).toBeVisible();
  await expect(page.locator('#reportRoot')).toContainText('Northstar Summary');
  await expect(page.locator('#reportRoot')).toContainText('Key action points');
  await expect(page.locator('#reportRoot')).toContainText('Core Numerology Profile');
  await expect(page.locator('#reportRoot')).toContainText('Astro-Identity Snapshot');
  await expect(page.locator('#reportRoot')).toContainText('Vastu Dosh Scan');
  await page.evaluate(() => window.scrollTo(0, 0));
}

test.describe('visual regression: report and print layouts', () => {
  test('desktop report layout', async ({ page }) => {
    await generateCompleteReport(page);

    await expect(page).toHaveScreenshot('desktop-report-layout.png', {
      fullPage: false,
      mask: [page.locator('.toast-viewport')],
    });
  });

  test('print layout first page', async ({ page }) => {
    await page.setViewportSize({ width: 794, height: 1123 });
    await generateCompleteReport(page);
    await page.emulateMedia({ media: 'print' });
    await page.evaluate(() => window.scrollTo(0, 0));

    await expect(page).toHaveScreenshot('print-layout-first-page.png', {
      fullPage: false,
      mask: [page.locator('.toast-viewport')],
    });
  });
});
