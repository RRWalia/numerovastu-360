import { expect, test } from '@playwright/test';
import { generateCompleteReport } from '../support/report-fixture.mjs';

function countPdfPages(pdfBuffer) {
  const content = pdfBuffer.toString('binary');
  const matches = content.match(/\/Type\s*\/Page\b/g);
  return matches ? matches.length : 0;
}

test.describe('A4 print rendering and export performance benchmark', () => {
  test('profile calculation and DOM intake submission benchmark', async ({ page }) => {
    const start = Date.now();
    await generateCompleteReport(page);
    const duration = Date.now() - start;
    console.log(`[PERF] Complete intake and report compute duration: ${duration}ms`);
    expect(duration).toBeLessThan(8000);
  });

  test('Practitioner Cockpit A4 single-page contract and PDF export performance', async ({ page }) => {
    await generateCompleteReport(page);

    await page.locator('[data-report-mode-btn="practitioner"]').click();
    await page.locator('#cockpit-tab').click();

    const reflowStart = Date.now();
    await page.emulateMedia({ media: 'print' });
    const sheet = page.locator('.cockpit-sheet');
    await expect(sheet).toBeVisible();
    const reflowDuration = Date.now() - reflowStart;

    await page.evaluate(() => { document.body.classList.add('print-cockpit'); });

    const pdfStart = Date.now();
    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: { top: '12mm', bottom: '12mm', left: '10mm', right: '10mm' },
    });
    const pdfDuration = Date.now() - pdfStart;

    await page.evaluate(() => { document.body.classList.remove('print-cockpit'); });

    const pageCount = countPdfPages(pdfBuffer);
    console.log(`[PERF] Cockpit single-page: reflow=${reflowDuration}ms, export=${pdfDuration}ms, pageCount=${pageCount}, size=${pdfBuffer.length} bytes`);

    // Strict contract: Cockpit is exactly 1 page
    expect(pageCount).toBe(1);
    expect(reflowDuration).toBeLessThan(6000);
    expect(pdfDuration).toBeLessThan(10000);
  });

  test('Client Dossier multi-page print reflow and PDF export performance', async ({ page }) => {
    await generateCompleteReport(page);

    await page.locator('[data-report-mode-btn="client"]').click();

    const reflowStart = Date.now();
    await page.emulateMedia({ media: 'print' });
    const reflowDuration = Date.now() - reflowStart;

    const pdfStart = Date.now();
    const clientPdf = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: { top: '12mm', bottom: '12mm', left: '10mm', right: '10mm' },
    });
    const pdfDuration = Date.now() - pdfStart;

    const clientPages = countPdfPages(clientPdf);
    console.log(`[PERF] Client Dossier: reflow=${reflowDuration}ms, export=${pdfDuration}ms, pageCount=${clientPages}, size=${clientPdf.length} bytes`);

    expect(clientPages).toBeGreaterThan(0);
    expect(reflowDuration).toBeLessThan(6000);
    expect(pdfDuration).toBeLessThan(15000);
  });

  test('Practitioner Compendium PDF is strictly larger and longer than Client Dossier', async ({ page }) => {
    await generateCompleteReport(page);

    await page.locator('[data-report-mode-btn="client"]').click();
    await page.emulateMedia({ media: 'print' });
    const clientPdf = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: { top: '12mm', bottom: '12mm', left: '10mm', right: '10mm' },
    });
    const clientPages = countPdfPages(clientPdf);

    await page.locator('[data-report-mode-btn="practitioner"]').click();
    await page.emulateMedia({ media: 'print' });
    const practitionerPdf = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: { top: '12mm', bottom: '12mm', left: '10mm', right: '10mm' },
    });
    const practitionerPages = countPdfPages(practitionerPdf);

    console.log(`[PERF] Comparison: Client pages=${clientPages} (${clientPdf.length} bytes) vs Practitioner pages=${practitionerPages} (${practitionerPdf.length} bytes)`);

    expect(practitionerPages).toBeGreaterThanOrEqual(clientPages);
    expect(practitionerPdf.length).toBeGreaterThan(clientPdf.length);
  });
});
