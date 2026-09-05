import { expect, test } from '@playwright/test';

const FIXED_NOW = Date.UTC(2026, 8, 5, 9, 0, 0); // 2026-09-05 UTC

async function freezeBrowserTime(page) {
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

test.describe('hybrid report browser regression', () => {
  test('Foundation is the Lo Shu dashboard and the Vedic comparison remains optional', async ({ page }) => {
    await generateCompleteReport(page);

    await expect(page.locator('#foundation-tab')).toHaveAttribute('aria-selected', 'true');
    await expect(page.locator('#foundation-panel')).toBeVisible();
    await expect(page.locator('#timeline-panel')).toBeHidden();
    await expect(page.locator('#foundation-panel')).toContainText('Lo Shu Blueprint');
    await expect(page.locator('#foundation-panel .loshu-grid')).toHaveCount(3);
    await expect(page.locator('#foundation-panel .loshu-cell')).toHaveCount(27);
    await expect(page.locator('#foundation-panel .loshu-grid').nth(0).locator('.loshu-cell')).toHaveAttribute('data-grid-number', '4');

    const advanced = page.locator('details.advanced-vedic-comparison');
    await expect(advanced).not.toHaveAttribute('open', '');
    await advanced.locator('summary').click();
    await expect(advanced).toHaveAttribute('open', '');
    await expect(advanced.locator('.vedic-grid')).toHaveCount(1);
    await expect(advanced.locator('.vedic-cell')).toHaveCount(9);
    await expect(advanced.locator('.vedic-cell').nth(0)).toHaveAttribute('data-grid-number', '3');
    await expect(advanced).toContainText('Planetary Strength Indicators');
    await expect(advanced).not.toContainText('Vedic Name Grid');
    await expect(advanced).not.toContainText('Combined Vedic Grid');
  });

  test('Timeline owns Dasha, active Vastu and the fixed home-context scan', async ({ page }) => {
    await generateCompleteReport(page);

    await page.locator('#timeline-tab').click();
    await expect(page).toHaveURL(/#timeline$/);
    await expect(page.locator('#timeline-tab')).toHaveAttribute('aria-selected', 'true');
    await expect(page.locator('#timeline-panel')).toBeVisible();
    await expect(page.locator('#foundation-panel')).toBeHidden();
    await expect(page.locator('#dasha-section')).toHaveAttribute('data-authority', 'dasha');
    await expect(page.locator('[data-dasha-vastu-zone="active"]')).toContainText('Active Vastu Zone');
    await expect(page.locator('#timeline-panel #vastu-section')).toHaveAttribute('data-authority', 'home-vastu-context');
    await expect(page.locator('#foundation-panel #vastu-section')).toHaveCount(0);
    await expect(page.locator('#timeline-panel #vastu-section')).toContainText('selected only from the current Dasha lords');

    await page.locator('#foundation-tab').focus();
    await page.keyboard.press('ArrowRight');
    await expect(page.locator('#timeline-tab')).toBeFocused();
    await expect(page.locator('#timeline-tab')).toHaveAttribute('aria-selected', 'true');

    await page.evaluate(() => { window.location.hash = '#vastu-section'; });
    await expect(page.locator('#timeline-panel')).toBeVisible();
    await expect(page.locator('#vastu-section')).toBeVisible();
  });

  test('mobile Timeline navigation is keyboard and horizontal-scroll safe', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await generateCompleteReport(page);
    await page.locator('#timeline-tab').click();

    await expect(page.locator('#timeline-panel')).toBeVisible();
    await expect(page.locator('.timeline-anchor-nav')).toBeVisible();
    const mobileNav = await page.locator('.timeline-anchor-nav').evaluate((nav) => {
      const style = getComputedStyle(nav);
      return { overflowX: style.overflowX, whiteSpace: style.whiteSpace, scrollWidth: nav.scrollWidth, clientWidth: nav.clientWidth };
    });
    expect(['auto', 'scroll']).toContain(mobileNav.overflowX);
    expect(mobileNav.scrollWidth).toBeGreaterThanOrEqual(mobileNav.clientWidth);
    await expect(page.locator('.timeline-anchor-nav a[href="#dasha-section"]')).toBeVisible();
    await expect(page.locator('.timeline-anchor-nav a[href="#vastu-section"]')).toBeVisible();
  });

  test('print/PDF exposes both modules and the normally collapsed comparison', async ({ page }) => {
    await generateCompleteReport(page);
    await page.emulateMedia({ media: 'print' });

    const printState = await page.evaluate(() => {
      const foundation = document.querySelector('#foundation-panel');
      const timeline = document.querySelector('#timeline-panel');
      const details = document.querySelector('details.advanced-vedic-comparison');
      const detailBody = details && details.querySelector('.details-body');
      return {
        foundation: getComputedStyle(foundation).display,
        timeline: getComputedStyle(timeline).display,
        detailBody: detailBody && getComputedStyle(detailBody).display,
      };
    });
    expect(printState.foundation).not.toBe('none');
    expect(printState.timeline).not.toBe('none');
    expect(printState.detailBody).not.toBe('none');
  });
});
