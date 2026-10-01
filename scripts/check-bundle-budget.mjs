#!/usr/bin/env node
/* ============================================================
   NumeroVastu 360 — bundle size & gzip budget gate

   Verifies client assets in dist/ against size ceilings to prevent
   geographic atlas expansions or feature inflation from degrading
   initial PWA load performance.

   Gates:
     1. Declared eager asset set matches index.html imports exactly
     2. Per-asset gzip and raw size limits
     3. Total initial-load gzip budget
     4. Total dist/ raw uncompressed distribution ceiling

   Usage:
     node scripts/check-bundle-budget.mjs
     node scripts/check-bundle-budget.mjs --summary
   ============================================================ */

import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DIST_DIR = path.join(ROOT, 'dist');
const BUDGET_FILE = path.join(ROOT, 'bundle-budget.json');

function formatKb(bytes) {
  return (bytes / 1024).toFixed(1) + ' KB';
}

function scanDist(dir) {
  let results = [];
  if (!fs.existsSync(dir)) return results;
  const entries = fs.readdirSync(dir);
  for (const entry of entries) {
    const fullPath = path.join(dir, entry);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      results = results.concat(scanDist(fullPath));
    } else {
      const rel = path.relative(DIST_DIR, fullPath).replace(/\\/g, '/');
      const content = fs.readFileSync(fullPath);
      const gz = zlib.gzipSync(content);
      results.push({
        relPath: rel,
        fullPath,
        rawSize: content.length,
        gzipSize: gz.length,
      });
    }
  }
  return results;
}

function extractIndexEagerAssets(indexHtmlPath) {
  if (!fs.existsSync(indexHtmlPath)) return [];
  const html = fs.readFileSync(indexHtmlPath, 'utf8');
  const eager = ['index.html'];

  // Match stylesheets <link rel="stylesheet" href="...">
  const linkMatches = html.matchAll(/<link\s+[^>]*rel=["']stylesheet["'][^>]*href=["']([^"']+)["'][^>]*>/gi);
  for (const match of linkMatches) {
    const href = match[1].replace(/^\.?\//, '').trim();
    if (href && !href.startsWith('http') && !eager.includes(href)) {
      eager.push(href);
    }
  }

  // Also catch <link href="..." rel="stylesheet">
  const linkMatchesReversed = html.matchAll(/<link\s+[^>]*href=["']([^"']+)["'][^>]*rel=["']stylesheet["'][^>]*>/gi);
  for (const match of linkMatchesReversed) {
    const href = match[1].replace(/^\.?\//, '').trim();
    if (href && !href.startsWith('http') && !eager.includes(href)) {
      eager.push(href);
    }
  }

  // Match script tags <script src="...">
  const scriptMatches = html.matchAll(/<script\s+[^>]*src=["']([^"']+)["'][^>]*>/gi);
  for (const match of scriptMatches) {
    const src = match[1].replace(/^\.?\//, '').trim();
    if (src && !src.startsWith('http') && !eager.includes(src)) {
      eager.push(src);
    }
  }

  return eager;
}

function main() {
  if (!fs.existsSync(BUDGET_FILE)) {
    console.error(`FATAL: Budget file not found at ${BUDGET_FILE}`);
    process.exit(1);
  }

  const budget = JSON.parse(fs.readFileSync(BUDGET_FILE, 'utf8'));
  const distFiles = scanDist(DIST_DIR);

  if (distFiles.length === 0) {
    console.error('FATAL: dist/ directory is missing or empty. Run `npm run build` first.');
    process.exit(1);
  }

  const fileMap = new Map();
  let totalDistRawBytes = 0;
  for (const f of distFiles) {
    fileMap.set(f.relPath, f);
    totalDistRawBytes += f.rawSize;
  }

  const indexHtmlPath = path.join(DIST_DIR, 'index.html');
  const actualEagerAssets = extractIndexEagerAssets(indexHtmlPath);
  const declaredEagerAssets = budget.eagerAssets || [];

  const violations = [];
  const rows = [];

  // Gate 1: Check declared eager asset set vs actual index.html set
  const undeclaredEager = actualEagerAssets.filter((a) => !declaredEagerAssets.includes(a));
  const staleDeclared = declaredEagerAssets.filter((a) => !actualEagerAssets.includes(a));

  if (undeclaredEager.length > 0) {
    violations.push(`Eager assets loaded by index.html but not in budget.eagerAssets: ${undeclaredEager.join(', ')}`);
  }
  if (staleDeclared.length > 0) {
    violations.push(`Budget eagerAssets declared but not loaded in index.html: ${staleDeclared.join(', ')}`);
  }

  // Gate 2: Per-asset checks
  let totalInitialLoadGzipBytes = 0;
  for (const assetKey of Object.keys(budget.assets)) {
    const assetLimit = budget.assets[assetKey];
    const file = fileMap.get(assetKey);

    if (!file) {
      violations.push(`Budgeted asset "${assetKey}" not found in dist/`);
      rows.push({
        asset: assetKey,
        raw: 'MISSING',
        gzip: 'MISSING',
        budgetGz: formatKb(assetLimit.maxGzipKb * 1024),
        percent: 'N/A',
        status: 'FAIL (missing)',
      });
      continue;
    }

    const maxGzipBytes = assetLimit.maxGzipKb * 1024;
    const maxRawBytes = assetLimit.maxRawKb ? assetLimit.maxRawKb * 1024 : null;
    const gzPercent = ((file.gzipSize / maxGzipBytes) * 100).toFixed(1);
    let assetOk = true;

    if (file.gzipSize > maxGzipBytes) {
      violations.push(`Asset "${assetKey}" gzip size ${formatKb(file.gzipSize)} exceeds budget ${formatKb(maxGzipBytes)} (${gzPercent}%)`);
      assetOk = false;
    }

    if (maxRawBytes && file.rawSize > maxRawBytes) {
      violations.push(`Asset "${assetKey}" raw size ${formatKb(file.rawSize)} exceeds budget ${formatKb(maxRawBytes)}`);
      assetOk = false;
    }

    rows.push({
      asset: assetKey,
      raw: formatKb(file.rawSize),
      gzip: formatKb(file.gzipSize),
      budgetGz: formatKb(maxGzipBytes),
      percent: `${gzPercent}%`,
      status: assetOk ? 'PASS' : 'FAIL',
    });
  }

  // Gate 3: Initial-load total gzip budget
  for (const eagerAsset of actualEagerAssets) {
    const file = fileMap.get(eagerAsset);
    if (file) {
      totalInitialLoadGzipBytes += file.gzipSize;
    }
  }

  const initialLoadMaxBytes = budget.limits.initialLoadGzipMaxKb * 1024;
  const initialLoadPercent = ((totalInitialLoadGzipBytes / initialLoadMaxBytes) * 100).toFixed(1);
  if (totalInitialLoadGzipBytes > initialLoadMaxBytes) {
    violations.push(`Initial load total gzip ${formatKb(totalInitialLoadGzipBytes)} exceeds budget ${formatKb(initialLoadMaxBytes)} (${initialLoadPercent}%)`);
  }

  // Gate 4: Total dist/ raw size budget
  const distTotalMaxBytes = budget.limits.distTotalRawMaxKb * 1024;
  const distTotalPercent = ((totalDistRawBytes / distTotalMaxBytes) * 100).toFixed(1);
  if (totalDistRawBytes > distTotalMaxBytes) {
    violations.push(`Total dist/ raw size ${formatKb(totalDistRawBytes)} exceeds budget ${formatKb(distTotalMaxBytes)} (${distTotalPercent}%)`);
  }

  // Print results table
  console.log('\n=== Bundle Size & Gzip Budget Gate ===\n');
  console.log(
    'Asset'.padEnd(25) +
    'Raw Size'.padEnd(12) +
    'Gzip Size'.padEnd(12) +
    'Gzip Budget'.padEnd(14) +
    '% Used'.padEnd(10) +
    'Status'
  );
  console.log('-'.repeat(80));

  for (const r of rows) {
    console.log(
      r.asset.padEnd(25) +
      r.raw.padEnd(12) +
      r.gzip.padEnd(12) +
      r.budgetGz.padEnd(14) +
      r.percent.padEnd(10) +
      r.status
    );
  }

  console.log('-'.repeat(80));
  console.log(
    `Initial Load Gzip: ${formatKb(totalInitialLoadGzipBytes)} / ${formatKb(initialLoadMaxBytes)} (${initialLoadPercent}%) -> ${totalInitialLoadGzipBytes <= initialLoadMaxBytes ? 'PASS' : 'FAIL'}`
  );
  console.log(
    `Total dist/ Raw:   ${formatKb(totalDistRawBytes)} / ${formatKb(distTotalMaxBytes)} (${distTotalPercent}%) -> ${totalDistRawBytes <= distTotalMaxBytes ? 'PASS' : 'FAIL'}`
  );
  console.log(`Eager Set Parity:  ${actualEagerAssets.length} assets declared & verified -> ${undeclaredEager.length === 0 && staleDeclared.length === 0 ? 'PASS' : 'FAIL'}\n`);

  // Write GitHub Step Summary if in CI or summary requested
  const summaryFile = process.env.GITHUB_STEP_SUMMARY;
  const shouldWriteSummary = summaryFile || process.argv.includes('--summary');

  const summaryMarkdown = `### Bundle Size & Gzip Budget Report

| Asset | Raw Size | Gzip Size | Gzip Budget | % Used | Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
${rows.map((r) => `| \`${r.asset}\` | ${r.raw} | ${r.gzip} | ${r.budgetGz} | ${r.percent} | ${r.status === 'PASS' ? '✅ PASS' : '❌ FAIL'} |`).join('\n')}
| **Initial Load Total (gz)** | - | **${formatKb(totalInitialLoadGzipBytes)}** | **${formatKb(initialLoadMaxBytes)}** | **${initialLoadPercent}%** | **${totalInitialLoadGzipBytes <= initialLoadMaxBytes ? '✅ PASS' : '❌ FAIL'}** |
| **Dist Raw Total** | **${formatKb(totalDistRawBytes)}** | - | **${formatKb(distTotalMaxBytes)}** | **${distTotalPercent}%** | **${totalDistRawBytes <= distTotalMaxBytes ? '✅ PASS' : '❌ FAIL'}** |

${violations.length === 0 ? '✨ **All bundle budget gates passed within limits.**' : '⚠️ **Bundle budget violations detected:**\n' + violations.map((v) => `- ${v}`).join('\n')}
`;

  if (summaryFile) {
    try {
      fs.appendFileSync(summaryFile, summaryMarkdown + '\n', 'utf8');
    } catch (err) {
      console.warn('Could not write to GITHUB_STEP_SUMMARY:', err.message);
    }
  }

  if (violations.length > 0) {
    console.error('BUNDLE BUDGET FAILED WITH VIOLATIONS:');
    for (const v of violations) {
      console.error(`  - ❌ ${v}`);
    }
    process.exit(1);
  }

  console.log('✅ Bundle budget verification succeeded with zero violations.');
  process.exit(0);
}

main();
