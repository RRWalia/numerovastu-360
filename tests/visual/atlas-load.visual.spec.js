import { expect, test } from '@playwright/test';

// Regression guard: the production page must wire atlas/atlas-in.js so the
// browser ingests the 7,092-town India atlas. Node smoke tests eval the atlas
// file directly, so they passed while the live page silently fell back to the
// 630-city curated list and short queries flooded with substring noise.
test('India atlas loads in the browser and Etah/Etawah top a short query', async ({ page }) => {
  await page.goto('/');

  // The atlas chunk actually arrived and ingested in the live DOM.
  const atlasSize = await page.evaluate(() =>
    window.NVAstro && typeof window.NVAstro.atlasSize === 'function' ? window.NVAstro.atlasSize() : 0
  );
  expect(atlasSize).toBeGreaterThan(6000);

  // Typing "Et" surfaces Etah/Etawah first, not substring noise like Detroit.
  const input = page.locator('#birthPlace');
  await input.fill('Et');
  const options = page.locator('#birthPlaceList option');
  await expect(options.first()).toHaveValue(/^Etah, /);
  const values = await options.evaluateAll((opts) => opts.map((o) => o.value));
  expect(values.length).toBeGreaterThanOrEqual(3);
  expect(values.slice(0, 3).some((v) => v.startsWith('Etawah, '))).toBe(true);
  expect(values.join(' ')).not.toMatch(/Detroit|Basseterre/);
});
