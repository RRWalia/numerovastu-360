# NumeroVastu 360 Quality Audit

Last reviewed: 2026-09-13

## Current status

| Area | Status | Evidence |
| --- | --- | --- |
| Core functionality | Pass | `npm test` passes the full jsdom smoke suite. |
| Dependency security | Pass | `npm run audit` reports zero vulnerabilities after updating dev tooling. |
| Static deployability | Pass | `npm run build` creates a deployable `dist/` with app scripts and `knowledge-pack/`. |
| Privacy posture | Strong | Calculations run in browser; no backend; anonymous contribution excludes personal fields. |
| Vedic precision | Strong | Self-contained Meeus engine with reference-chart and brute-force cross-checks in tests. |
| Content architecture | Strong | Versioned Knowledge Pack with schema, manifest and bundled fallback. |
| Deity protection layer | Pass | Ishta devta mapping for numbers 1–9 (EN/HI/GU) in knowledge pack v2.5.0; smoke suite covers the card, excess-energy cross-ref and 40-day plan line. |
| Accessibility baseline | Improved | Added keyboard skip link; form labels and aria-live regions already present. |
| Clinical viability | Improved | Remedy triage stages the prescription (one acute japa target, Tier 2 held on environmental cues with activation dates); the 40-Day Plan opens with the triage card and flags each checklist row Tier 1 / Tier 2. |
| Predictive rigour | Strong | The proportional Ank Jyotish Dasha clock is explicitly distinguished from classical Vimshottari, and a **true nakshatra-anchored Vimshottari stack now ships beside it** (`vimshottariTimeline()`), anchored on the natal Moon nakshatra with the fixed 120-year lord durations and a balance deducted for the traversed nakshatra fraction. The two clocks are independently computed, are allowed to disagree, and are labelled as such. `getDashaRelationship()` applies the non-removable classical Sambhandha safety boundary plus additive pack-reviewed hostile pairs; conflicting stacks can never render green. |
| Dasha framing integrity | Fixed (2.9.0) | The Dasha card's judge-note still claimed a "classical Vimshottari-derived proportional cycle" after the 2.8.3 relabel — a direct contradiction of the app's own non-Vimshottari disclosure. It now states plainly that the proportional clock is not Vimshottari and points at the separate classical card. Smoke assertions pin both directions: the string `Vimshottari-derived` must never reappear in `app.js`, `i18n.js` or the rendered report, and the classical card must stay free of remedy and Vastu content. |
| Classical Vimshottari layer | Added (2.9.0) | `data-authority="vimshottari"` card inside the Timeline module: nakshatra anchor (name, pada, lord, deity, Moon sign/degree, span, % elapsed), balance of the birth lord, active MD/AD/PD, the lifetime Mahadasha ladder with the balance row flagged, and an explicit comparison against the Ank Jyotish roadmap. Localised EN/HI/GU. Hand-verified against an independent calculation for the audit chart (Jyeshtha/Mercury, 61.56% elapsed → 6.535y balance → Mars MD from 2026-02-17). Degrades to an explanatory card, never a guess, when Vedic Tier 2 data is absent. |
| Friendship-matrix override | Documented (2.9.0) | The non-removable classical hostile pairs enforced in `getDashaRelationship()` are now declared in the pack schema as `db.dasha.relationshipPolicy["x-classicalSafetyPairs"]`, each marked `removable: false`, with a schema description that tells pack authors the boundary is owned by the application. A smoke assertion cross-checks the documented pairs against the pairs the engine actually enforces, so the two cannot drift. |
| Authority lint | Widened (2.9.0) | Beyond "every remedy block declares Lo Shu", the suite now asserts that every `data-authority` value comes from a declared vocabulary (`AUTHORITY_VOCAB`), that no Vedic-authority scope contains a remedy obligation, and that the Dasha-selected Vastu zone declares its own scope. The widened lint caught a genuine leak: the active-Vastu-zone card inherited `data-authority="dasha"` with no marker of its own, so Vastu prescription content was sitting unlabelled inside a Dasha scope. It now carries `data-authority="dasha-vastu-zone"`. |
| Content review process | Added (2.9.0) | `CONTRIBUTING.md` defines a mandatory practitioner sign-off gate for any change touching remedy, dosha, deity, mantra, crystal, charity, fasting or Vastu prescription fields, with a five-point reviewer checklist (tradition correctness, clinical guardrail safety, single acute target, canonical text preserved, EN/HI/GU completeness) and a required review-record block. `.github/CODEOWNERS` routes those paths; the PR template enforces the record. |
| CI pipeline | Added (2.9.0) | `.github/workflows/ci.yml` runs `npm ci && npm run check` on every pull request and push to `main`, verifies the deployable `dist/`, then runs a second visual-regression job that fails loudly with a GitHub warning annotation when reviewed baselines are not committed instead of silently passing. Failure traces are uploaded as artifacts. |
| PWA / offline installability | Added (2.9.0) | `manifest.webmanifest`, `sw.js` and a generated icon set (192/512 any, 512 maskable, 180 Apple touch, 48 favicon). The worker is network-first for the knowledge pack (freshness beats speed), stale-while-revalidate for the shell and atlas chunks, ignores non-GET/cross-origin/range requests, and caches only static assets — never personal data. Registration lives in `app.js` rather than an inline script because the page ships a strict `script-src 'self'` CSP, and `?sw=off` unregisters without clearing storage. Icons are reproducible from `scripts/build-icons.mjs` (dependency-free PNG encoder) rather than being mystery binaries. |
| Field read mode | Added (2.9.0) | Phone-first reading mode for consultations away from a desk: larger type, single column, sticky actions, reduced chrome. Presentation-only — a smoke assertion proves every engine output is byte-identical with it on or off, and the print media block neutralises it so the A4 report and cockpit sheet do not change. |
| Licensing | Added (2.9.0) | MIT `LICENSE` covering both the source and the knowledge-pack content, with an explicit scope note for the Meeus/`astronomia` portions of `astro.js`. |
| Scaled Sadhana depth | Added (2.10.0) | The intake now captures the consultee's lifestyle bandwidth (`profile.sadhana`): **Beginner · Minimalist / Corporate** (11× short mantra *or* the 11× wish-paper affirmation, 5-minute breathwork, colour cue, spatial decluttering, no mala, monthly charity), **Intermediate · Practitioner / Sadhak** (27× quarter-mala japa on a dedicated mala, aushadhi snan on the power day, weekly power-day charity — the default, so no existing chart's prescription changes silently) and **Classical · Full Sadhana** (108× full mala, aushadhi snan on every practice day, weekly power-day charity). The depth scales the daily practice only: the Lo Shu remedy target and the triage tier are provably identical at all three depths (`same` assertions on `targetN` and `tier1.n`/`mode`), the triage dose string is generated per depth, and the scale card sits under `data-remedy-authority="lo-shu"` in the 40-day plan. Counts localise to `११ / २७ / १०८` and `૧૧ / ૨૭ / ૧૦૮`. |
| Scale vs clinical guardrail | Enforced (2.10.0) | The scale can never outrank a guardrail: a held japa stays held at every depth (the card reports the dose it resumes), the Moon-cold warm form, dosha × planet mild form, solar-load moderation and under-18 gem deferral still cap the dose, and the Classical depth adds an explicit “clear it with a licensed healthcare professional first” line tied to the upfront notice. An under-18 chart is routed to guardian supervision with no breath-retention holds. Assertions pin the held-japa case at all three depths, the classical-depth guardrail note, and the Moon-cold guardrail surviving a 108× chart. |
| Upfront Ethical & Health Notice | Added (2.10.0) | A bordered `data-authority="framework-note"` notice opens the Northstar Summary, ahead of the story and every remedy card: the frameworks are traditional interpretive aids and are not medical, psychological, legal or financial diagnoses, with a licensed-professional instruction before new fasts, herbal routines or intense breathwork. Localised EN/HI/GU, carries no `data-remedy-authority`, `data-solar-moderation` or `data-clinical-guardrail` descendant, stays out of the Section 4A Tattva scope, and is pinned as an unbreakable bordered block in print. It sits inside the summary rather than on a forced page break because the summary is deliberately allowed to flow across the page break — forcing one reintroduces the near-blank page 1 the print stylesheet exists to prevent. |
| Knowledge-pack schema coverage | Pass | Smoke tests validate the schema contract and semantic pack invariants for every versioned file under `knowledge-pack/packs/`. |
| Formula integrity | Pass | `formatConductorBreakdown()` derives the printed equation from raw DOB digits; smoke tests assert the 31/01/1978 string exactly. |
| Practitioner workflow | Added | One-page printable Practitioner Cockpit module (`#practitioner-cockpit`) with its own cockpit-only print mode. |
| Clinical contraindications | Added (2.8.2) | Moon-cold guardrail for Number 2 (cold/respiratory-sensitive charts run a warm lunar kit: Shiva japa, lukewarm silver water, Nadi Shodhana; raw Beej japa, cold fasts, Pearl/Moonstone and cold milk paused) and a dosha × planet overlay for Numbers 1 and 3–9 (flagged kits carry a mild-form banner; canonical mantra rows untouched). Health-focus section, triage card and cockpit facts carry the same flags in EN/HI/GU; smoke suite pins the levels, reason codes and banner placement. |
| Clinical safety overlays | Added (2.8.1) | 4× Sun + Pitta charts get labelled solar-moderation notes (baseline ritual tempered; cooling channeling emphasised in Sections 3/4A); under-18 charts defer heavy planetary gems (Neelam/Gomed/Lehsunia) to gentle substitutes and route parents to Tattva lifestyle anchors; hostile-stacked minor charts get a student-age note in the transit synthesis. Engine outputs and the data pack are unchanged — overlays only. |
| Plan ↔ triage coherence | Fixed (2.8.1) | The Daily Core Ritual previously chanted the first critical missing number (`missing[0]`) while the Remedy Triage card beside it prescribed a different acute Tier-1 target. `resolvePracticeTargets()` now binds the 40-day ritual, its sync note and the Northstar first move to the triage verdict (acute number leads; japa held when nothing missing is live); smoke tests pin Simardeep's chart to *Om Mangalaya Namah* (Mars 9), never *Om Ketave Namah* (Ketu 7). |
| Print resilience | Improved | Explicit `@page { size: A4 portrait; margin: 12mm 10mm; }` and `break-inside: avoid` on remedy, kit and cockpit cards; the cockpit section now breaks before itself onto a dedicated page, drops its screen-only panel heading and compacts to 8.5pt/1.2 (7.5pt tables) so the whole sheet — including the graded windows table — prints on one A4 page; the off-screen skip link no longer leaks onto printed page 1. |
| Report render performance | Improved | Off-viewport report sections use `content-visibility: auto` on screen (never in print), removing the mobile main-thread lock on first render. |
| Visual regression | **Fixed and real (2.9.0)** | Three separate defects were found by running the suite in an actual browser and by reading the CI job's own annotations, and all three are now closed. **(a) The suite had no screenshots at all.** `toHaveScreenshot` appeared nowhere in the repo, so "visual regression baselines" were an aspiration, not an outstanding artefact to commit — the CI warning about missing baselines was chasing something that never existed. Three element-scoped pixel tests now cover the guarantees that genuinely cannot be expressed as computed styles: the canonical Lo Shu square (4-9-2 / 3-5-7 / 8-1-6 read in DOM order), the Classical Vimshottari card layout, and the Practitioner Cockpit printing as a single A4 page with its graded-windows table intact. **(b) The failing assertion was a test bug, not a layout bug.** Line 74 used `toHaveAttribute` on a locator matching all 9 `.loshu-cell` nodes — a Playwright strict-mode violation, since element assertions must resolve to exactly one node. It now reads the whole grid via `evaluateAll` and asserts the full canonical sequence, which is a *stronger* check than the single-cell form it replaced. The atlas spec had the same class of bug: `toHaveValue` on an `<option>`, which is not an input element. **(c) The baseline-generation step could never exit 0.** The CI job produced baselines with `--update-snapshots=missing`. That mode does write a missing baseline, but it still reports the assertion as failed — `A snapshot doesn't exist at ..., writing actual` — so a step whose entire purpose is to run *when baselines are absent* was guaranteed to fail. Because the step carried `continue-on-error`, GitHub then masked the failure: the step's `conclusion` read `success` while its `outcome` stayed `failure`, which is why the job looked green while its own annotation said the specs had errored. (`steps.<id>.outcome` is the pre-`continue-on-error` result and is the honest signal; `.conclusion` is always `success` once the error is absorbed.) The generation step now uses `--update-snapshots=all`, and the job immediately re-runs the suite strictly against what it just produced so a maintainer never commits a baseline that does not reproduce. Reproduced and fixed with a real browser: missing → exit 1, all → exit 0 (10 passed), none → exit 0 (10 passed). |
| Advanced Vedic comparison disclosure | **Regression fixed (2.9.0)** | Running the suite in a browser surfaced a genuine application defect that the previously-failing assertion had been masking. `README.md` documents the comparison as "closed by default", and the print stylesheet carries a dedicated `.advanced-vedic-comparison:not([open]) > .details-body` rule whose only purpose is to force it open for the PDF — but `app.js` rendered the `<details>` element with a hard-coded `open` attribute. The disclosure was therefore always expanded on screen, the print rule was dead code, and `smoke.test.js` had pinned the wrong behaviour with the assertion "advanced Vedic comparison is expanded so the birth grid prints in the PDF". The markup is now collapsed, the smoke assertion pins the documented contract (collapsed on screen **and** force-expanded by print CSS), and the Playwright spec exercises the real expand-on-click interaction. |
| SEO/share metadata | Improved | Added robots, theme colour, Open Graph and Twitter summary metadata. |
| Security headers | Improved | Added conservative CSP meta tag for same-origin scripts/styles/connects and data images. |

## Recommended release gate

Run this before publishing:

```bash
npm run check
```

The gate covers smoke tests, dependency audit and static build verification.
CI enforces it on every pull request (`.github/workflows/ci.yml`).

For screenshot regression checks, install Chromium once and run:

```bash
npm run browsers:install
npm run test:visual          # compare against committed baselines (read-only)
npm run test:visual:update   # regenerate baselines after an intentional layout change
```

Use `npm run check:full` in CI environments where the Playwright browser is
already installed. The CI `visual` job reports one of three honest outcomes and
never claims a pass it did not earn: with baselines committed it compares
strictly and fails the job on any diff; with none committed it generates them,
re-runs the suite strictly against the fresh files to prove the render
reproduces, and raises a `::warning::` annotation stating that the gate did not
run; and if the specs genuinely fail — or the newly generated baselines fail to
reproduce — it raises an `::error::` naming the first failure.

## Content review gate

Any change to a remedy, dosha, deity, mantra, crystal, charity, fasting or
Vastu prescription field in `data.js` or `knowledge-pack/packs/*.json` requires
a senior-practitioner sign-off before merge, in addition to code review. The
five-point checklist and the required review-record block are in
[CONTRIBUTING.md](CONTRIBUTING.md); `.github/CODEOWNERS` routes those paths and
the PR template requires the record.

## Remaining high-value enhancements

1. **Commit reviewed pixel baselines.** The three pixel tests exist and the
   generation path is now proven end-to-end: `--update-snapshots=all` writes the
   baselines, and the job re-runs strictly against them on the same runner to
   confirm they reproduce. They must still be *generated on the CI image*
   (Playwright's Chromium on `ubuntu-latest`), never on a developer machine — a
   different Chromium build or font stack diffs against the runner and would
   poison the gate permanently. Run the
   `.github/workflows/visual-baselines.yml` (`workflow_dispatch`) workflow once;
   it generates them, uploads them as the `playwright-baselines` artifact and
   opens a PR containing them. Until that PR is merged the visual job warns
   instead of comparing. **Note:** `workflow_dispatch` only becomes available
   once the workflow file is on the default branch, so that workflow cannot be
   run until this PR is merged; before then, download the
   `playwright-baselines` artifact from the pull-request run (it has already
   been re-verified strictly on that same runner) and commit it.
2. Add automated browser accessibility checks with Playwright + axe-core.
3. Promote the visual-regression CI job to a required status check once
   baselines are committed.
4. Sign the static build with Subresource Integrity when deployed behind a CDN.
5. Consider a Vimshottari Pratyantar-level event-window cross-reference, so a
   practitioner can see where the two timing traditions align on a date.
