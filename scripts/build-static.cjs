#!/usr/bin/env node
/*
 * Static production build for NumeroVastu 360.
 * The app intentionally uses plain browser scripts rather than bundled modules,
 * so we copy the deployable public assets into dist/ exactly as they run locally.
 */
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const dist = path.join(root, 'dist');
const files = ['index.html', 'app.js', 'astro.js', 'data.js', 'styles.css'];
const dirs = ['knowledge-pack'];

function rm(target) {
  fs.rmSync(target, { recursive: true, force: true });
}

function copyFile(from, to) {
  fs.mkdirSync(path.dirname(to), { recursive: true });
  fs.copyFileSync(from, to);
}

function copyDir(from, to) {
  fs.mkdirSync(to, { recursive: true });
  for (const entry of fs.readdirSync(from, { withFileTypes: true })) {
    const src = path.join(from, entry.name);
    const dest = path.join(to, entry.name);
    if (entry.isDirectory()) copyDir(src, dest);
    else if (entry.isFile()) copyFile(src, dest);
  }
}

rm(dist);
fs.mkdirSync(dist, { recursive: true });

for (const file of files) {
  const src = path.join(root, file);
  if (!fs.existsSync(src)) throw new Error(`Required asset missing: ${file}`);
  copyFile(src, path.join(dist, file));
}

for (const dir of dirs) {
  const src = path.join(root, dir);
  if (!fs.existsSync(src)) throw new Error(`Required directory missing: ${dir}`);
  copyDir(src, path.join(dist, dir));
}

const buildLabel = process.env.NV_BUILD_LABEL || `Build ${new Date().toISOString().slice(0, 10)}`;
const distIndex = path.join(dist, 'index.html');
const html = fs.readFileSync(distIndex, 'utf8').replace(
  /<meta name="nv-build-label" content="[^"]*" \/>/,
  `<meta name="nv-build-label" content="${buildLabel.replace(/"/g, '&quot;')}" />`
);
fs.writeFileSync(distIndex, html);

const outputs = [];
function collect(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) collect(p);
    else outputs.push(path.relative(dist, p));
  }
}
collect(dist);
console.log(`Static build ready in dist/ (${outputs.length} files)`);
outputs.sort().forEach((file) => console.log(`  ${file}`));
