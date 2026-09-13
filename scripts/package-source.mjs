#!/usr/bin/env node
/* ============================================================
   NumeroVastu 360 — source archive builder

   Regenerates numerovastu-360-full-source.zip from the files git
   actually tracks, so the downloadable archive can never drift
   from the release it claims to be.

   Why this exists: the committed zip had silently gone six
   releases stale — it still carried a `vite.config.js` that no
   longer exists, a knowledge pack two majors old, and none of
   `i18n.js`, `tests/`, `atlas/` or `icons/`. A "full source"
   download that is wrong is worse than no download.

   Usage:
     node scripts/package-source.mjs           # write the zip
     node scripts/package-source.mjs --check   # verify, don't write

   --check is run in CI; it fails loudly if the archive does not
   match HEAD.
   ============================================================ */
import { execFileSync } from "node:child_process";
import { existsSync, statSync } from "node:fs";
import { createHash } from "node:crypto";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const ZIP_NAME = "numerovastu-360-full-source.zip";
const PREFIX = "numerovastu-360/";
const checkOnly = process.argv.includes("--check");

const git = (args) => execFileSync("git", args, { cwd: ROOT, encoding: "utf8", maxBuffer: 64 * 1024 * 1024 });

/* Tracked files, minus the archive itself (which cannot contain itself) and
   minus anything the repo deliberately keeps out of distribution. */
const tracked = git(["ls-files"])
  .split("\n")
  .map((line) => line.trim())
  .filter(Boolean)
  .filter((file) => file !== ZIP_NAME)
  .filter((file) => !file.startsWith("node_modules/"))
  .filter((file) => !file.startsWith("dist/"));

if (!tracked.length) {
  console.error("No tracked files found — is this a git checkout?");
  process.exit(1);
}

if (checkOnly) {
  const zipPath = join(ROOT, ZIP_NAME);
  if (!existsSync(zipPath)) {
    console.error(`FAIL  ${ZIP_NAME} is missing. Run: node scripts/package-source.mjs`);
    process.exit(1);
  }
  // Compare the archive's entry list and per-file content hashes against the
  // working tree. Zip byte equality is unusable (timestamps differ), so we
  // compare content instead.
  const listing = execFileSync("unzip", ["-Z1", zipPath], { encoding: "utf8" })
    .split("\n").map((l) => l.trim()).filter(Boolean);
  const inZip = new Set(
    listing
      .map((entry) => (entry.startsWith(PREFIX) ? entry.slice(PREFIX.length) : entry))
      .filter((entry) => entry.length > 0 && !entry.endsWith("/"))
  );
  const expected = new Set(tracked);

  const missing = tracked.filter((file) => !inZip.has(file));
  const stale = [...inZip].filter((file) => !expected.has(file));

  // Content check for every file that should be there.
  const mismatched = [];
  for (const file of tracked) {
    if (!inZip.has(file)) continue;
    let zipHash;
    try {
      zipHash = createHash("sha256")
        .update(execFileSync("unzip", ["-p", zipPath, PREFIX + file], { maxBuffer: 64 * 1024 * 1024 }))
        .digest("hex");
    } catch (err) {
      mismatched.push(`${file} (unreadable from archive)`);
      continue;
    }
    const treeHash = createHash("sha256")
      .update(execFileSync("git", ["show", `HEAD:${file}`], { cwd: ROOT, maxBuffer: 64 * 1024 * 1024 }))
      .digest("hex");
    if (zipHash !== treeHash) mismatched.push(file);
  }

  if (missing.length || stale.length || mismatched.length) {
    console.error(`FAIL  ${ZIP_NAME} does not match HEAD:`);
    if (missing.length) console.error(`  missing from archive (${missing.length}): ${missing.slice(0, 10).join(", ")}${missing.length > 10 ? " …" : ""}`);
    if (stale.length) console.error(`  stale entries in archive (${stale.length}): ${stale.slice(0, 10).join(", ")}${stale.length > 10 ? " …" : ""}`);
    if (mismatched.length) console.error(`  content differs (${mismatched.length}): ${mismatched.slice(0, 10).join(", ")}${mismatched.length > 10 ? " …" : ""}`);
    console.error("\nRegenerate with: node scripts/package-source.mjs");
    process.exit(1);
  }
  console.log(`PASS  ${ZIP_NAME} matches HEAD (${tracked.length} files)`);

  /* The check validates the committed state, which is what CI gates on. If the
     working tree has moved on, say so — the archive will need regenerating
     before the next commit or CI will fail on it. */
  const pending = git(["status", "--porcelain"])
    .split("\n").map((line) => line.trim()).filter(Boolean)
    .filter((line) => !line.endsWith(ZIP_NAME));
  if (pending.length) {
    console.log(`      note: ${pending.length} uncommitted path${pending.length === 1 ? "" : "s"} — run \`npm run package:source\` after committing, or CI will fail on the archive.`);
  }
  process.exit(0);
}

/* --- build --- */
/* Refuse to build from a dirty working tree: the archive is generated from
   HEAD, so uncommitted edits would silently produce a zip that does not match
   what the developer thinks they are packaging. */
const dirty = git(["status", "--porcelain"])
  .split("\n")
  .map((line) => line.trim())
  .filter(Boolean)
  .filter((line) => !line.endsWith(ZIP_NAME));
if (dirty.length) {
  console.error(`FAIL  working tree has uncommitted changes (${dirty.length} paths).`);
  console.error("      Commit them first — the archive is built from HEAD, so it would not match your work.");
  dirty.slice(0, 8).forEach((line) => console.error(`        ${line}`));
  process.exit(1);
}

execFileSync("git", [
  "archive",
  "--format=zip",
  `--prefix=${PREFIX}`,
  "-o", join(ROOT, ZIP_NAME),
  "HEAD",
  "--",
  ...tracked
], { cwd: ROOT, stdio: "inherit" });

const size = statSync(join(ROOT, ZIP_NAME)).size;
console.log(`\nWrote ${ZIP_NAME} — ${tracked.length} files, ${(size / 1024).toFixed(1)} kB`);
