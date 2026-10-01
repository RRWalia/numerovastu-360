import { expect } from '@playwright/test';

export const FIXED_NOW = Date.UTC(2026, 8, 5, 9, 0, 0); // 2026-09-05 UTC

export async function freezeBrowserTime(page, fixedNow = FIXED_NOW) {
  await page.addInitScript((time) => {
    const RealDate = Date;
    class FixedDate extends RealDate {
      constructor(...args) { super(...(args.length ? args : [time])); }
      static now() { return time; }
      static parse(value) { return RealDate.parse(value); }
      static UTC(...args) { return RealDate.UTC(...args); }
    }
    globalThis.Date = FixedDate;
  }, fixedNow);
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

export async function generateCompleteReport(page) {
  await freezeBrowserTime(page);
  await page.goto('/');
  await stabilizeVisuals(page);

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

  await expect(page.locator('#reportView')).toBeVisible();
}
