import { expect, test } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';
import { generateCompleteReport } from '../support/report-fixture.mjs';

/* ============================================================
   A4 print-rendering benchmark

   What it measures, and why each number matters to a user:

     compute      intake submit → #reportView visible. Everything
                  in this app is client-side, so this is the whole
                  numerology + Vedic + Dasha pipeline on the user's
                  own CPU. It is the number that regresses when an
                  engine gains work.
     printReflow  screen media → print media, forced to completion
                  by reading layout. This is the pause a
                  practitioner sees between hitting Print and the
                  preview appearing, and it is pure CSS cost — the
                  print stylesheet re-lays-out the entire document.
     pdf          Chromium's A4 PDF export, the actual deliverable.
     pages        page count of that PDF.

   How it avoids being flaky
   -------------------------
   CI runners are noisy and shared, so wall-clock assertions are
   deliberately loose and taken as the MEDIAN of several runs; the
   thresholds below are ceilings for "something is badly wrong",
   not precision targets. Treat the reported table as the signal
   and the assertions as the alarm.

   The page-count assertions are the opposite: they are exact,
   because page count is a deterministic function of layout, not
   of machine speed. A cockpit that silently becomes two A4 pages
   is a real product regression — that sheet is designed to be
   handed to a client as one page — and this is the cheapest place
   to catch it.
   ============================================================ */

const RUNS = Number(process.env.NV_PERF_RUNS || 3);

/* Ceilings in milliseconds. Generous on purpose: a 2x slowdown should fail,
   normal runner jitter should not. Override locally with env vars when
   profiling a specific change. */
const BUDGET_MS = {
  compute: Number(process.env.NV_PERF_COMPUTE_MS || 9000),
  printReflow: Number(process.env.NV_PERF_REFLOW_MS || 2500),
  pdf: Number(process.env.NV_PERF_PDF_MS || 15000),
};

const A4 = { format: 'A4', printBackground: true, margin: { top: '10mm', bottom: '10mm', left: '10mm', right: '10mm' } };

const results = [];

function median(values) {
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}

function record(row) {
  results.push(row);
}

/* Chromium emits one "/Type /Page" object per page (and "/Type /Pages" for the
   tree node — the \b and the negative lookahead keep the tree node out of the
   count). Good enough to catch a sheet spilling onto a second page without
   pulling in a PDF parsing dependency. */
function pdfPageCount(buffer) {
  const matches = buffer.toString('latin1').match(/\/Type\s*\/Page(?![s])/g);
  return matches ? matches.length : 0;
}

/* Switching media only queues a style recalculation; reading an offset forces
   layout to actually run, so the timing covers the reflow rather than just the
   API call. */
async function timePrintReflow(page) {
  const started = Date.now();
  await page.emulateMedia({ media: 'print' });
  await page.evaluate(() => {
    document.body.getBoundingClientRect();
    return document.body.offsetHeight;
  });
  return Date.now() - started;
}

test.describe('A4 print rendering performance', () => {
  test('report compute and print reflow stay within budget', async ({ page }) => {
    const compute = [];
    const reflow = [];

    for (let i = 0; i < RUNS; i += 1) {
      const started = Date.now();
      await generateCompleteReport(page, expect);
      compute.push(Date.now() - started);
      reflow.push(await timePrintReflow(page));
      await page.emulateMedia({ media: 'screen' });
    }

    const computeMedian = median(compute);
    const reflowMedian = median(reflow);
    record({ metric: 'compute (submit → report visible)', median: computeMedian, budget: BUDGET_MS.compute, samples: compute });
    record({ metric: 'print reflow (screen → print)', median: reflowMedian, budget: BUDGET_MS.printReflow, samples: reflow });

    expect(computeMedian, `report compute median ${computeMedian}ms exceeded ${BUDGET_MS.compute}ms`)
      .toBeLessThanOrEqual(BUDGET_MS.compute);
    expect(reflowMedian, `print reflow median ${reflowMedian}ms exceeded ${BUDGET_MS.printReflow}ms`)
      .toBeLessThanOrEqual(BUDGET_MS.printReflow);
  });

  test('Practitioner A4 export completes in budget and is reported', async ({ page }, testInfo) => {
    test.skip(testInfo.project.use.headless === false, 'page.pdf() requires headless Chromium');
    await generateCompleteReport(page, expect);
    await page.locator('[data-report-mode-btn="practitioner"]').click();
    await page.emulateMedia({ media: 'print' });

    const durations = [];
    let pdf;
    for (let i = 0; i < RUNS; i += 1) {
      const started = Date.now();
      pdf = await page.pdf(A4);
      durations.push(Date.now() - started);
    }

    const ms = median(durations);
    const pages = pdfPageCount(pdf);
    record({ metric: 'A4 PDF export · Practitioner', median: ms, budget: BUDGET_MS.pdf, samples: durations, note: `${pages} pages, ${(pdf.length / 1024).toFixed(0)} KB` });

    expect(pdf.length, 'practitioner PDF is suspiciously small — the export likely produced an empty document').toBeGreaterThan(20_000);
    // The practitioner compendium is inherently multi-page; assert only that
    // it produced a real document, since its length legitimately grows with
    // content.
    expect(pages).toBeGreaterThan(1);
    expect(ms, `practitioner A4 export median ${ms}ms exceeded ${BUDGET_MS.pdf}ms`).toBeLessThanOrEqual(BUDGET_MS.pdf);

    await testInfo.attach('practitioner-a4.pdf', { body: pdf, contentType: 'application/pdf' });
  });

  test('Client dossier A4 export stays leaner than the Practitioner compendium', async ({ page }, testInfo) => {
    test.skip(testInfo.project.use.headless === false, 'page.pdf() requires headless Chromium');
    await generateCompleteReport(page, expect);

    await page.locator('[data-report-mode-btn="practitioner"]').click();
    await page.emulateMedia({ media: 'print' });
    const practitionerPages = pdfPageCount(await page.pdf(A4));

    await page.emulateMedia({ media: 'screen' });
    await page.locator('[data-report-mode-btn="client"]').click();
    await expect(page.locator('body')).toHaveClass(/report-mode-client/);
    await page.emulateMedia({ media: 'print' });

    const started = Date.now();
    const pdf = await page.pdf(A4);
    const ms = Date.now() - started;
    const clientPages = pdfPageCount(pdf);

    record({ metric: 'A4 PDF export · Client dossier', median: ms, budget: BUDGET_MS.pdf, samples: [ms], note: `${clientPages} pages vs ${practitionerPages} practitioner` });

    // Client mode withholds the cockpit and the cross-reference appendices, so
    // its dossier must be strictly shorter. If these ever match, a mode switch
    // has stopped taking effect in print — which the computed-style tests in
    // the visual suite can miss, because an element can be display:none and
    // still have left its page break behind.
    expect(clientPages).toBeGreaterThan(0);
    expect(clientPages).toBeLessThan(practitionerPages);
    expect(ms, `client A4 export ${ms}ms exceeded ${BUDGET_MS.pdf}ms`).toBeLessThanOrEqual(BUDGET_MS.pdf);

    await testInfo.attach('client-a4.pdf', { body: pdf, contentType: 'application/pdf' });
  });

  test('Practitioner Cockpit print job is exactly one A4 page', async ({ page }, testInfo) => {
    test.skip(testInfo.project.use.headless === false, 'page.pdf() requires headless Chromium');
    await generateCompleteReport(page, expect);
    await page.locator('[data-report-mode-btn="practitioner"]').click();
    await page.locator('#cockpit-tab').click();
    // `print-cockpit` is the dedicated one-sheet job the cockpit toolbar fires.
    await page.evaluate(() => document.body.classList.add('print-cockpit'));
    await page.emulateMedia({ media: 'print' });

    const started = Date.now();
    const pdf = await page.pdf(A4);
    const ms = Date.now() - started;
    const pages = pdfPageCount(pdf);

    record({ metric: 'A4 PDF export · Cockpit sheet', median: ms, budget: BUDGET_MS.pdf, samples: [ms], note: `${pages} page(s) — contract: exactly 1` });
    await testInfo.attach('cockpit-a4.pdf', { body: pdf, contentType: 'application/pdf' });

    // The headline contract of this sheet: one page, handed to a client.
    expect(pages, 'the cockpit sheet must print as exactly one A4 page — a nested card has grown or lost its break-inside:avoid').toBe(1);
  });
});

/* Emit the table once, after every spec has contributed. Written to the job
   summary in CI and always to test-results/print-perf.json so a run can be
   compared against an earlier one. */
test.afterAll(async () => {
  if (!results.length) return;

  const rows = results.map((r) => [
    r.metric,
    `${Math.round(r.median)} ms`,
    `${r.budget} ms`,
    `${((r.median / r.budget) * 100).toFixed(0)}%`,
    r.samples.map((s) => Math.round(s)).join(', '),
    r.note || '',
  ]);
  const header = ['metric', 'median', 'budget', 'used', 'samples (ms)', 'notes'];
  const widths = header.map((h, i) => Math.max(h.length, ...rows.map((r) => r[i].length)));
  const line = (cells) => cells.map((c, i) => c.padEnd(widths[i])).join('  ').trimEnd();

  const plain = [
    '',
    `A4 print rendering benchmark (median of ${RUNS} run(s))`,
    '',
    line(header),
    widths.map((w) => '-'.repeat(w)).join('  '),
    ...rows.map(line),
    '',
  ].join('\n');
  console.log(plain);

  const outDir = path.resolve('test-results');
  fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(
    path.join(outDir, 'print-perf.json'),
    `${JSON.stringify({ generated: new Date().toISOString(), runs: RUNS, budgetMs: BUDGET_MS, results }, null, 2)}\n`
  );

  if (process.env.GITHUB_STEP_SUMMARY) {
    const md = [
      '### A4 print rendering benchmark',
      '',
      `Median of ${RUNS} run(s) on this runner. Timings are indicative — shared CI hardware is noisy; the budgets are alarms for a gross regression, while the page counts are exact contracts.`,
      '',
      `| ${header.join(' | ')} |`,
      `|${header.map(() => '---').join('|')}|`,
      ...rows.map((r) => `| ${r.join(' | ')} |`),
      '',
    ].join('\n');
    fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY, `${md}\n`);
  }
});
