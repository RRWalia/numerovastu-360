# NumeroVastu 360 Quality Audit

Last reviewed: 2026-09-12

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
| Knowledge-pack schema coverage | Pass | Smoke tests validate the schema contract and semantic pack invariants for every versioned file under `knowledge-pack/packs/`. |
| Formula integrity | Pass | `formatConductorBreakdown()` derives the printed equation from raw DOB digits; smoke tests assert the 31/01/1978 string exactly. |
| Practitioner workflow | Added | One-page printable Practitioner Cockpit module (`#practitioner-cockpit`) with its own cockpit-only print mode. |
| Clinical contraindications | Added (2.8.2) | Moon-cold guardrail for Number 2 (cold/respiratory-sensitive charts run a warm lunar kit: Shiva japa, lukewarm silver water, Nadi Shodhana; raw Beej japa, cold fasts, Pearl/Moonstone and cold milk paused) and a dosha × planet overlay for Numbers 1 and 3–9 (flagged kits carry a mild-form banner; canonical mantra rows untouched). Health-focus section, triage card and cockpit facts carry the same flags in EN/HI/GU; smoke suite pins the levels, reason codes and banner placement. |
| Clinical safety overlays | Added (2.8.1) | 4× Sun + Pitta charts get labelled solar-moderation notes (baseline ritual tempered; cooling channeling emphasised in Sections 3/4A); under-18 charts defer heavy planetary gems (Neelam/Gomed/Lehsunia) to gentle substitutes and route parents to Tattva lifestyle anchors; hostile-stacked minor charts get a student-age note in the transit synthesis. Engine outputs and the data pack are unchanged — overlays only. |
| Plan ↔ triage coherence | Fixed (2.8.1) | The Daily Core Ritual previously chanted the first critical missing number (`missing[0]`) while the Remedy Triage card beside it prescribed a different acute Tier-1 target. `resolvePracticeTargets()` now binds the 40-day ritual, its sync note and the Northstar first move to the triage verdict (acute number leads; japa held when nothing missing is live); smoke tests pin Simardeep's chart to *Om Mangalaya Namah* (Mars 9), never *Om Ketave Namah* (Ketu 7). |
| Print resilience | Improved | Explicit `@page { size: A4 portrait; margin: 12mm 10mm; }` and `break-inside: avoid` on remedy, kit and cockpit cards; the cockpit section now breaks before itself onto a dedicated page, drops its screen-only panel heading and compacts to 8.5pt/1.2 (7.5pt tables) so the whole sheet — including the graded windows table — prints on one A4 page; the off-screen skip link no longer leaks onto printed page 1. |
| Report render performance | Improved | Off-viewport report sections use `content-visibility: auto` on screen (never in print), removing the mobile main-thread lock on first render. |
| Visual regression | Added, **not yet gating** | Playwright specs cover desktop report and print-media first-page layouts, plus a print-pagination guard that keeps the Northstar Summary breakable across pages. No reviewed baselines are committed and the specs have not yet been validated in a browser-enabled environment, so CI deliberately refuses to report a visual pass: it raises a `::warning::` annotation and uploads freshly generated baselines as an artifact instead. One or more assertions in `tests/visual/report-print.visual.spec.js` fail in CI. **Diagnosis so far:** every DOM-level assertion the spec makes was replayed in jsdom against the audit chart and all pass (grid counts, `data-authority` scopes, compatibility reflection row count, cockpit block visibility targets, `details.advanced-vedic-comparison` presence); the atlas spec's expectations also hold (`atlasSize()` = 7314 > 6000, `Et` → Etah first, no Detroit/Basseterre). The residual failure is therefore browser-layout- or screenshot-specific. Reproduce with `npm run browsers:install && npm run test:visual` and read the first failing assertion. Note `retries: 1` is active in CI, so an auto-generated baseline written on attempt 1 can be compared on attempt 2 — run with `--retries=0` to rule that out. |
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
npm run test:visual
```

Use `npm run check:full` in CI environments where the Playwright browser is
already installed. The CI `visual` job runs the strict form automatically once
baselines are committed, and raises a `::warning::` annotation when they are
not — it never reports a pass it did not earn.

## Content review gate

Any change to a remedy, dosha, deity, mantra, crystal, charity, fasting or
Vastu prescription field in `data.js` or `knowledge-pack/packs/*.json` requires
a senior-practitioner sign-off before merge, in addition to code review. The
five-point checklist and the required review-record block are in
[CONTRIBUTING.md](CONTRIBUTING.md); `.github/CODEOWNERS` routes those paths and
the PR template requires the record.

## Remaining high-value enhancements

1. **Diagnose the failing Playwright assertion** and commit reviewed baselines
   after running `npm run test:visual:update` in a browser-enabled environment.
   CI generates the baselines as a downloadable artifact when they are absent,
   but a warning is not a gate — treat this as the top open item.
2. Add automated browser accessibility checks with Playwright + axe-core.
3. Promote the visual-regression CI job to a required status check once
   baselines are committed.
4. Sign the static build with Subresource Integrity when deployed behind a CDN.
5. Consider a Vimshottari Pratyantar-level event-window cross-reference, so a
   practitioner can see where the two timing traditions align on a date.
