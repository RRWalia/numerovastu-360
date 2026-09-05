# NumeroVastu 360 Quality Audit

Last reviewed: 2026-09-05

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
| Predictive rigour | Improved | `getDashaRelationship()` applies classical Sambhandha (MD hosts AD, symmetric Grahan/hostile pairs) to the Antardasha badge, the Pratyantar rows and the cockpit; conflicting stacks can never render green. |
| Formula integrity | Pass | `formatConductorBreakdown()` derives the printed equation from raw DOB digits; smoke tests assert the 31/01/1978 string exactly. |
| Practitioner workflow | Added | One-page printable Practitioner Cockpit module (`#practitioner-cockpit`) with its own cockpit-only print mode. |
| Print resilience | Improved | Explicit `@page { size: A4 portrait; margin: 12mm 10mm; }` and `break-inside: avoid` on remedy, kit and cockpit cards. |
| Report render performance | Improved | Off-viewport report sections use `content-visibility: auto` on screen (never in print), removing the mobile main-thread lock on first render. |
| Visual regression | Added | Playwright specs cover desktop report and print-media first-page layouts, plus a print-pagination guard that keeps the Northstar Summary breakable across pages. |
| SEO/share metadata | Improved | Added robots, theme colour, Open Graph and Twitter summary metadata. |
| Security headers | Improved | Added conservative CSP meta tag for same-origin scripts/styles/connects and data images. |

## Recommended release gate

Run this before publishing:

```bash
npm run check
```

The gate covers smoke tests, dependency audit and static build verification.

For screenshot regression checks, install Chromium once and run:

```bash
npm run browsers:install
npm run test:visual
```

Use `npm run check:full` in CI environments where the Playwright browser is already installed.

## Remaining high-value enhancements

1. Add automated browser accessibility checks with Playwright + axe-core.
2. Add JSON Schema validation tests for every Knowledge Pack file.
3. Commit reviewed Playwright screenshot baselines after running `npm run test:visual` in a browser-enabled environment.
4. Add CI workflow for `npm ci && npm run check:full` on every pull request.
5. Add a formal content review process for numerology/Vastu remedy updates.
6. Add optional PWA manifest/service worker only if offline installability becomes a product goal.
