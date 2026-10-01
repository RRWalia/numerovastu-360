#!/usr/bin/env node
/* ============================================================
   NumeroVastu 360 — bundle-size budget gate

   Why this exists
   ---------------
   The app ships as plain browser scripts with no bundler and no
   code splitting, so every byte added to a file listed in
   index.html is a byte on the critical path of the very first
   paint — including on a 3G handset in the field, which is the
   deployment this PWA actually targets. The geographic atlas is
   the fastest-growing data in the repo (atlas-in.js alone is
   already the second-heaviest initial asset after app.js once
   gzipped), and atlas growth is exactly the kind of change that
   looks innocuous in review.

   What it checks
   --------------
   1. Per-asset gzip ceilings, for both the initial-load set and
      the named deferred assets.
   2. A ceiling on the TOTAL initial-load gzip transfer.
   3. A ceiling on the total raw weight of dist/, which is what a
      fully warmed offline cache costs a user's device.
   4. That the initial-load set discovered in dist/index.html
      matches the set the budget file declares. A new <script> on
      the critical path therefore cannot land without someone
      writing its budget down, and an asset that stops being
      eagerly loaded cannot leave a stale ceiling behind.

   Sizes are measured gzipped at level 9 because that is the
   transfer cost Netlify and GitHub Pages actually bill the user's
   connection for; raw bytes are reported alongside for context
   but only gate via the dist/ total.

   Run:     node scripts/check-bundle-budget.mjs
   Rebase:  node scripts/check-bundle-budget.mjs --update [--headroom=10]
   ============================================================ */
import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dist = path.join(root, 'dist');
const budgetPath = path.join(root, 'bundle-budget.json');

const args = process.argv.slice(2);
const UPDATE = args.includes('--update');
const headroomArg = args.find((a) => a.startsWith('--headroom='));
const HEADROOM = headroomArg ? Number(headroomArg.split('=')[1]) : 10;

if (!Number.isFinite(HEADROOM) || HEADROOM < 0) {
  console.error(`FATAL: --headroom must be a non-negative number, got "${headroomArg}"`);
  process.exit(2);
}

const KB = 1024;

function fail(message) {
  console.error(`FATAL: ${message}`);
  process.exit(2);
}

if (!fs.existsSync(dist)) {
  fail('dist/ not found. Run `npm run build` first — the budget is measured against the deployable output, not the source tree.');
}
if (!fs.existsSync(budgetPath)) {
  fail('bundle-budget.json not found. Generate it with `node scripts/check-bundle-budget.mjs --update`.');
}

let budget;
try {
  budget = JSON.parse(fs.readFileSync(budgetPath, 'utf8'));
} catch (err) {
  fail(`bundle-budget.json is not valid JSON: ${err.message}`);
}

/* ---------- measurement ---------- */

const measured = new Map();
function measure(rel) {
  if (measured.has(rel)) return measured.get(rel);
  const abs = path.join(dist, rel);
  if (!fs.existsSync(abs)) return null;
  const raw = fs.readFileSync(abs);
  const entry = { raw: raw.length, gzip: zlib.gzipSync(raw, { level: 9 }).length };
  measured.set(rel, entry);
  return entry;
}

function distRawTotal() {
  let total = 0;
  const walk = (dir) => {
    for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
      const p = path.join(dir, e.name);
      if (e.isDirectory()) walk(p);
      else if (e.isFile()) total += fs.statSync(p).size;
    }
  };
  walk(dist);
  return total;
}

/* ---------- discover the initial-load set from dist/index.html ----------
   Derived from the shipped HTML rather than hard-coded, so the budget tracks
   what the browser is really told to fetch before the app is interactive. */
const indexHtml = fs.readFileSync(path.join(dist, 'index.html'), 'utf8');
const isLocal = (href) => href && !/^(https?:)?\/\//i.test(href) && !href.startsWith('data:');
const normalise = (href) => href.replace(/^\.?\//, '').split(/[?#]/)[0];

const scriptSrcs = [...indexHtml.matchAll(/<script\b[^>]*\bsrc="([^"]+)"[^>]*>/gi)]
  /* defer/async still occupy the initial transfer, so they count; type="module"
     likewise. Only a genuinely absent src (inline JSON-LD) is skipped. */
  .map((m) => m[1]);
const styleHrefs = [...indexHtml.matchAll(/<link\b[^>]*>/gi)]
  .map((m) => m[0])
  .filter((tag) => /\brel="stylesheet"/i.test(tag))
  .map((tag) => (tag.match(/\bhref="([^"]+)"/i) || [])[1]);

const discovered = ['index.html', ...styleHrefs, ...scriptSrcs]
  .filter(isLocal)
  .map(normalise)
  .filter((v, i, a) => a.indexOf(v) === i);

/* ---------- --update: rebase the ceilings ---------- */
if (UPDATE) {
  const ceil = (bytes) => Math.ceil((bytes * (1 + HEADROOM / 100)) / KB);
  const initial = {};
  let initialGzip = 0;
  for (const rel of discovered) {
    const m = measure(rel);
    if (!m) fail(`index.html references "${rel}" but dist/${rel} does not exist.`);
    initial[rel] = ceil(m.gzip);
    initialGzip += m.gzip;
  }
  const deferred = {};
  for (const rel of Object.keys(budget.deferred?.files || {})) {
    const m = measure(rel);
    if (!m) fail(`budgeted deferred asset "${rel}" is missing from dist/.`);
    deferred[rel] = ceil(m.gzip);
  }
  const next = {
    $comment: budget.$comment,
    headroomPercent: HEADROOM,
    generated: new Date().toISOString().slice(0, 10),
    initial: { totalGzipKB: ceil(initialGzip), files: initial },
    deferred: { files: deferred },
    dist: { totalRawKB: ceil(distRawTotal()) },
  };
  fs.writeFileSync(budgetPath, `${JSON.stringify(next, null, 2)}\n`);
  console.log(`Rebased bundle-budget.json at +${HEADROOM}% headroom.`);
  process.exit(0);
}

/* ---------- the gate ---------- */

const violations = [];
const rows = [];
const fmt = (bytes) => `${(bytes / KB).toFixed(1)} KB`;

function checkFile(rel, limitKB, scope) {
  const m = measure(rel);
  if (!m) {
    violations.push(`${rel} — budgeted (${scope}) but missing from dist/. Either the build stopped emitting it or the budget entry is stale.`);
    return 0;
  }
  const limit = limitKB * KB;
  const over = m.gzip > limit;
  const pct = ((m.gzip / limit) * 100).toFixed(0);
  rows.push([scope, rel, fmt(m.raw), fmt(m.gzip), `${limitKB} KB`, `${pct}%`, over ? '❌' : '✅']);
  if (over) {
    violations.push(
      `${rel} — ${fmt(m.gzip)} gzipped exceeds its ${limitKB} KB ceiling by ${fmt(m.gzip - limit)}.`
    );
  }
  return m.gzip;
}

const budgetedInitial = Object.keys(budget.initial?.files || {});

/* Rule 4: the declared set and the real set must agree, in both directions. */
for (const rel of discovered) {
  if (!budgetedInitial.includes(rel)) {
    violations.push(
      `${rel} — loaded eagerly by index.html but absent from bundle-budget.json. Anything on the critical path must carry an explicit ceiling: add one (or rebase with \`node scripts/check-bundle-budget.mjs --update\`) in the same PR that adds the asset.`
    );
  }
}
for (const rel of budgetedInitial) {
  if (!discovered.includes(rel)) {
    violations.push(
      `${rel} — has an initial-load budget but index.html no longer loads it eagerly. Move it under "deferred" or drop the entry so the budget keeps describing reality.`
    );
  }
}

let initialGzip = 0;
for (const rel of discovered) {
  const limitKB = budget.initial?.files?.[rel];
  if (limitKB == null) {
    const m = measure(rel);
    if (m) {
      initialGzip += m.gzip;
      rows.push(['initial', rel, fmt(m.raw), fmt(m.gzip), '— unbudgeted —', '—', '❌']);
    }
    continue;
  }
  initialGzip += checkFile(rel, limitKB, 'initial');
}

for (const [rel, limitKB] of Object.entries(budget.deferred?.files || {})) {
  checkFile(rel, limitKB, 'deferred');
}

/* Totals. The per-file ceilings alone would let ten small assets each grow 9%
   without anything turning red, so the aggregate is gated separately. */
const initialLimitKB = budget.initial?.totalGzipKB;
if (initialLimitKB == null) {
  violations.push('bundle-budget.json is missing initial.totalGzipKB.');
} else {
  const over = initialGzip > initialLimitKB * KB;
  rows.push([
    'initial',
    '**total (gzip)**',
    '—',
    fmt(initialGzip),
    `${initialLimitKB} KB`,
    `${((initialGzip / (initialLimitKB * KB)) * 100).toFixed(0)}%`,
    over ? '❌' : '✅',
  ]);
  if (over) {
    violations.push(
      `initial-load total — ${fmt(initialGzip)} gzipped exceeds the ${initialLimitKB} KB ceiling by ${fmt(initialGzip - initialLimitKB * KB)}.`
    );
  }
}

const distLimitKB = budget.dist?.totalRawKB;
if (distLimitKB == null) {
  violations.push('bundle-budget.json is missing dist.totalRawKB.');
} else {
  const total = distRawTotal();
  const over = total > distLimitKB * KB;
  rows.push([
    'dist',
    '**total (raw, offline cache)**',
    fmt(total),
    '—',
    `${distLimitKB} KB`,
    `${((total / (distLimitKB * KB)) * 100).toFixed(0)}%`,
    over ? '❌' : '✅',
  ]);
  if (over) {
    violations.push(
      `dist/ total — ${fmt(total)} raw exceeds the ${distLimitKB} KB ceiling by ${fmt(total - distLimitKB * KB)}.`
    );
  }
}

/* ---------- reporting ---------- */

const header = ['scope', 'asset', 'raw', 'gzip', 'ceiling', 'used', ''];
const widths = header.map((h, i) => Math.max(h.length, ...rows.map((r) => String(r[i]).length)));
const line = (cells) => cells.map((c, i) => String(c).padEnd(widths[i])).join('  ').trimEnd();

console.log('\nBundle budget (gzip level 9, measured against dist/)\n');
console.log(line(header));
console.log(widths.map((w) => '-'.repeat(w)).join('  '));
for (const r of rows) console.log(line(r));

if (process.env.GITHUB_STEP_SUMMARY) {
  const md = [
    '### Bundle budget',
    '',
    `| ${header.map((h) => h || 'ok').join(' | ')} |`,
    `|${header.map(() => '---').join('|')}|`,
    ...rows.map((r) => `| ${r.join(' | ')} |`),
    '',
  ];
  if (violations.length) {
    md.push('**Over budget:**', '', ...violations.map((v) => `- ${v}`), '');
    md.push(
      'If the growth is intended, rebase the ceilings with `node scripts/check-bundle-budget.mjs --update` and commit `bundle-budget.json` as part of the same PR, so the increase is reviewed rather than absorbed.',
      ''
    );
  }
  fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY, `${md.join('\n')}\n`);
}

if (violations.length) {
  console.error(`\n${violations.length} budget violation(s):\n`);
  for (const v of violations) console.error(`  • ${v}`);
  console.error(
    '\nIf this growth is intended, run `node scripts/check-bundle-budget.mjs --update` and commit bundle-budget.json in the same PR so the new ceiling is reviewed.\n'
  );
  if (process.env.GITHUB_ACTIONS) {
    console.error(
      `::error title=Bundle budget exceeded::${violations[0].replace(/\n/g, ' ').slice(0, 300)}`
    );
  }
  process.exit(1);
}

console.log('\nAll assets are within budget.\n');
