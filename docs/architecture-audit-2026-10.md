# NumeroVastu 360 — End-to-End Architecture Audit

**Date:** 2026-10-01
**Scope:** full flow and architecture — computational pipelines, Vastu spatial model, report generation, persistence, security
**Audited revision:** `d7220d3` (branch `arena/01a0f724-numerovastu-360`)
**Method:** static read of the shipped source, execution of the full test suite, dependency and egress inspection

---

## 0. Executive summary — and a correction to the brief

The proposed audit framing assumes a distributed, server-backed platform: FastAPI/Node gateway, Postgres with five relational tables, a Redis/BullMQ broker, Playwright PDF workers, S3 with pre-signed URLs, AES-256 at rest, and RBAC separating consultants from clients.

**None of that infrastructure exists in this repository, and most of it should not be added.** This is a zero-backend, offline-first static PWA. Verified:

| Assumption in the brief | Reality in the repo |
|---|---|
| API gateway (FastAPI / Node) | No server code. `vite` dev server + `scripts/build-static.cjs`. Deployed as static files on Netlify (`netlify.toml`). |
| Postgres schema (5 tables) | No database, no ORM, no driver. Zero dependencies matching `postgres\|prisma\|supabase\|mongoose`. |
| Redis / BullMQ task broker | Not present. No queue, no worker tier. |
| Playwright headless PDF workers | Playwright is a **dev-only visual-regression** tool (`tests/visual/`). Reports print via the browser's own print pipeline. |
| S3 + pre-signed URLs | No object storage. No cloud SDK. |
| Microservice split | Four browser globals in one page: `app.js`, `astro.js`, `insights.js`, `muhurtha.js`. |

The apparent "backend" keyword hits in the source are false positives — `grep` for `express` matches the numerology term **Expression** (Soul Urge / Personality / Expression), not the web framework.

**The single most important architectural finding of this audit is that the privacy posture is the product.** The app computes everything locally, persists no client PII, and makes exactly one outbound network call in its entire runtime. Adopting the proposed architecture would convert a system that *cannot* leak birth data into one that *must be trusted* not to. That is a strict downgrade for a practice handling names, birth times, home addresses and floor plans.

**Verdict: architecture is sound and unusually disciplined for its class. Do not re-platform.** Three genuine gaps are worth engineering effort, listed in §6.

---

## 1. What was actually measured

```
Source (shipped):      app.js 9,807   i18n.js 6,077   data.js 1,957
                       astro.js 1,525  insights.js 951  muhurtha.js 761
                       calendar.js 318
Test suite:            smoke.test.js 2,601 lines — 554 assertions, ALL PASS
Runtime dependencies:  0
Dev dependencies:      4 (playwright, ajv, jsdom, vite)
Network egress:        1 endpoint (photon.komoot.io, geocoding, user-initiated)
Persisted PII:         none
```

`npm test` → **554 PASS, 0 FAIL**. This is a real behavioural suite, not smoke in the trivial sense: it asserts on sunrise roll-over past midnight, UID uniqueness in calendar exports, and that *"the exported file never carries the client's name or date of birth."*

---

## 2. Numerology engine & determinism

### Confirmed strengths

**Determinism is already achieved, by construction.** The calculation layer is pure arithmetic over integers and frozen lookup tables — no `Math.random`, no ambient clock reads inside the scoring path, no network. The same inputs produce the same report on any machine. `insights.js` exposes its logic as plain named functions over frozen constants (`Object.freeze({...})` for `VASTU_ELEMENTS`), which is exactly the "stateless pure function" shape the brief asked for.

**Traceability is enforced as a design rule, not a convention.** From `insights.js`:

> *"NO BLACK-BOX SCORES. Nothing here emits '74% lucky'. Every pair is classified by the SAME one-way Moolank Maitri relation the rest of the app uses — friendly, neutral or enemy — so any verdict can be traced to a row of the shipped friendship chart and argued with."*

For a professional practice this is worth more than any infrastructure item in the brief. A consultant can defend every line of the output to a client. Most commercial competitors cannot.

**Interpretative content is already isolated from algorithms** — the thing the brief wanted the database to enforce. `knowledge-pack/` carries versioned JSON packs (`2.1.0` … `2.10.0`), a `schema.json`, and a `latest.json` manifest, validated with `ajv`. Mutable prose is versioned and swappable without touching calculation code. **This is the correct solution for this architecture and it is already shipped.** A `vastu_remedies` table would add a network dependency to retrieve data the client already holds offline.

### Real finding — F1: `app.js` is a 9,807-line monolithic IIFE

The brief's instinct to "decouple core algorithms from UI rendering" is **partially correct and the one numerology point that survives contact with the code.**

`insights.js`, `muhurtha.js`, `calendar.js` and `astro.js` are cleanly factored. `app.js` is not: inside a single `(function () { "use strict"; ... })()` it mixes DOM helpers (`$`, `$$`, `esc`), calculation, trilingual string assembly and HTML template generation. `renderVastuCompass()` alone interleaves geometry (`pol()`, wedge path math) with SVG emission and three-language label tables.

**Impact:** moderate, not urgent. Correctness is protected by the 554-assertion suite. But geometry that lives inside a render function cannot be unit-tested in isolation, and §6 items need exactly that geometry.

**Recommendation:** extract incrementally, pulling the SVG/polar helpers out of `renderVastuCompass` into `insights.js` alongside `vastuZone`. Do not attempt a big-bang modularisation; the test suite asserts against rendered DOM, so a rewrite risks the asset that makes the codebase trustworthy.

### Assessed and rejected — temporal handling and Zod

**"Standardize all birth date/time to strict UTC."** This would be an active bug. Numerology and Muhurtha operate on *local civil time at the place of birth* — the Lo Shu grid is built from the local calendar date, and `muhurtha.js` divides the day by local sunrise. Forcing UTC would shift a 01:30 IST birth to the previous calendar day and corrupt Mulank, Bhagyank and the entire Dasha ladder. The codebase is correct to treat the birth date as civil-local, and `astro.js` already carries explicit geographic offsets where astronomy genuinely requires them. The suite's *"decimal sunrise hours convert to clock time and roll past midnight correctly"* shows the boundary case is handled deliberately. **No change.**

**"Enforce Zod schema validation."** Zod is a server-input-trust tool. There is no server and no untrusted client. Adding a runtime dependency to a project that ships **zero** would be a meaningful regression in supply-chain surface and PWA payload for no security gain. The underlying concern — **name canonicalisation** — is legitimate and already handled: input is normalised before letter-frequency computation. **Keep the canonicalisation discipline; reject the dependency.**

---

## 3. Vastu spatial & geometric processing

### Confirmed strengths — the 16-zone engine already exists

The brief proposes building a 16-zone Shakti Chakra. **It is shipped**, in `insights.js` (`ZONE16`, `zone16Of`, `sector8Of`, `vastuZone`, `vastuCompass`) and rendered in `app.js:7402`.

The wedge arithmetic is correct and matches the brief's own specification:

```js
function zone16Of(d) { return Math.floor(((d + 11.25) % 360) / 22.5); }
function sector8Of(d) { return Math.floor(((d + 22.5) % 360) / 45); }
```

North is centred on 0°, so N spans 348.75°–11.25° — exactly as specified. All wrap-around is done with the `((x + 540) % 360) - 180` signed-delta idiom, which is the numerically correct way to handle the 0/360 seam and is applied consistently.

Two pieces of engineering here **exceed the brief**:

1. **`boundary` flag** — a reading within a configurable tolerance (default 2°) of a zone edge is marked unreliable. This is honest handling of measurement error that the proposed design does not contemplate.
2. **`sectorFlip` flag** — the governing 45° sector is computed *from the bearing*, never from the zone name, because an intermediate zone straddles two classical sectors. NNE at 20° is governed by North; NNE at 30° by North-East. The flag fires when ordinary compass error would flip the remedy. As the source notes, this is *"the single most consequential thing a degree-based compass can tell a practitioner."*

The output also separates measurement from prescription — the 16-zone reading localises, the classical 45° sector still decides the remedy, and both print side by side. Correct domain modelling.

### Real finding — F2 (highest severity): magnetic declination is advised, not computed

The engine's tolerance flags fire at **2°**. Magnetic declination across India ranges roughly **−1° to +3°**, and globally exceeds **±20°**. The app currently handles this with a prose note:

> *"Take bearings against TRUE north; a phone compass usually shows magnetic north, which in India runs roughly 0°–3° east of true."*

**This is an internal inconsistency, and it is the most defensible finding in this audit.** The system flags a 2° uncertainty as material enough to warn about, while silently accepting an uncorrected input error of the same or larger magnitude. A systematic 3° bias can push a reading across a sector boundary and change the prescribed remedy — the precise failure the `sectorFlip` flag was built to catch, entering through the front door uncorrected.

The brief's `θ_true = (θ_raw + δ_WMM) mod 360` is **correct and should be implemented.** Feasibility is good: the app already geocodes and holds latitude/longitude (`photon.komoot.io` + the `atlas/` bundles), which is the input a magnetic model needs.

**Implementation caution — and this matters for this codebase specifically.** The full World Magnetic Model is a degree-12 spherical-harmonic expansion with a coefficient set that **expires every five years** (the current epoch lapses in 2030). Two non-negotiables, both following the project's own traceability ethos:

- Ship the real coefficients and a **hard expiry check** that degrades to the current prose advisory when the epoch lapses. A silently stale magnetic model is worse than an honest warning, because it produces a confident wrong number.
- Do **not** substitute a simplified dipole approximation. It carries multi-degree error in exactly the regions where declination matters most — which would manufacture the false precision this project explicitly refuses elsewhere.

Surface the correction in the UI: show raw reading, declination applied, and corrected bearing, so the practitioner can audit the adjustment.

### Real finding — F3: floor-plan geometry is greenfield, not a refactor

The brief's centroid/polylabel/ray-casting pipeline assumes an existing floor-plan subsystem. **There is none.** Current Vastu input is four numeric bearings — `entranceDeg`, `kitchenDeg`, `bedroomDeg`, `waterDeg` (`index.html:552`, `type="number" min="0" max="360"`). No polygon, no canvas, no CAD import, no uploads.

This is a **new product capability**, not an architectural correction, and it should be scoped as such.

Technical notes if pursued:
- The shoelace centroid formula in the brief is correct, as is the **Polylabel** fallback for L- and U-shaped plans where the centroid escapes the interior. Guard the degenerate `A = 0` case (collinear/zero-area input) before dividing by `6A`.
- **Sutherland–Hodgman is the wrong clipper here.** It is specified for *convex* clip regions; real floor-plan footprints are frequently non-convex. A 22.5° wedge clipped against an L-shaped room will produce incorrect fractional overlap. Use **Greiner–Hormann** or Weiler–Atherton, or a maintained library (`polygon-clipping`, `martinez`).
- DWG is a closed binary format with no viable browser parser. Scope to **DXF/SVG plus manual tracing**; silently excluding DWG after promising it is a support burden.
- The Web Worker recommendation is sound — but only once polygons exist. For four scalar bearings it would be pure overhead.

**Recommendation:** treat as a roadmap epic with its own design document. Land F2 first; declination correctness benefits every existing user immediately, while floor-plan ingestion benefits none of them until the whole pipeline ships.

---

## 4. Report generation pipeline

### Current design

Reports render synchronously in-page as HTML/SVG and export through the browser's native print-to-PDF. `tests/visual/report-print.visual.spec.js` pins print-layout output against Playwright snapshots — print fidelity is regression-tested, which is more rigorous than most server-rendered pipelines achieve.

Calendar export (`calendar.js`, 318 lines) is exemplary and deserves specific credit. The suite proves: no network access from the writer, no client name or DOB in the exported file, one-way hashed event UIDs so a synced work calendar learns nothing, stable UIDs so re-export updates rather than duplicates 40 entries, and advisory windows written as `FREE` so they cannot block the client's day. That is a privacy threat model worked through to completion.

### Assessment of the proposed pipeline — reject

BullMQ + Redis + headless Chrome + S3 pre-signed URLs solves **server CPU contention under concurrent load**. With rendering on the client, each user supplies their own compute; the pipeline is already perfectly parallel and scales to any number of users at zero marginal cost.

Adopting it would mean: transmitting birth data and floor plans off-device, standing up a queue, broker, worker fleet and object store, and then needing §5's AES-256 and RBAC **to solve problems that only the new architecture created.** This is the clearest example in the brief of infrastructure generating its own justification.

**Hierarchical CDN/Redis caching** is likewise already solved, and better: `sw.js` precaches the knowledge pack and assets for genuine offline operation. A service worker beats a CDN here — it serves with no network at all, which matters for a consultant doing a site visit in a basement.

### Real finding — F4: the knowledge-pack version is stripped from the printed report — **RESOLVED 2026-10-01**

The brief's "relational audit trail / historical reproducibility" concern is legitimate — a practitioner must be able to reproduce a reading given months ago. The versioned `knowledge-pack` already provides the mechanism, and `updateKnowledgeUI()` (`app.js:1500`) surfaces the active version, source and publication date on screen.

**But it never reaches the PDF.** The version pills (`#knowledgeBadge`, `#appBadge`, `#buildBadge`) live in the intake view's `.intro-meta` block (`index.html:259-263`), which is not part of the report view, and `.app-header` is explicitly hidden in print (`styles.css:404`). A delivered client PDF therefore records **no indication of which interpretative content generated it.**

Because remote pack updates are supported (`source: "remote" | "cached" | "bundled"`), two clients can receive materially different readings from identical inputs with nothing in either document to explain the difference. For a professional practice that may need to defend a reading months later, this is the real reproducibility gap — and it is not a database problem.

**Fix shipped.** A print-only `<footer class="report-provenance">` is emitted at the end of every report by `renderReportProvenance()` (`app.js`), rendering:

```
Pack v2.10.0 · schema v2 · bundled · App v2.18.0 · Build 2026-09-19 · Generated 1 Oct 2026, 11:30 am
```

Four decisions worth recording:

- **Sibling, not child, of `.report-closing`.** Investigating the fix surfaced a worse case than the audit originally described: the cockpit print job hides `.report-hero` *and* `.report-closing` (`styles.css:1773`, `:1783`), so the single-page consultation sheet — the page most likely to be filed and produced months later — previously carried **neither a generation date nor a version**. Making the stamp a sibling means suppressing the brand block can never suppress the audit trail.
- **Print-only.** On screen the intake status pills already carry this; repeating it would be noise. `.report-provenance { display: none; }` with a `display: block !important` override inside `@media print`.
- **Pack `source` instead of a content hash.** The schema has no checksum field. `source` (`bundled` / `cached` / `remote`) is the more informative signal anyway — it distinguishes shipped content from a pack fetched after release, which is the actual cause of two clients diverging.
- **No PII, 9px, `break-inside: avoid`.** Version strings and a render timestamp only, so an emailed PDF discloses nothing new; sized to preserve the cockpit's one-A4 contract.

Ten tests added (554 → 564), covering presence, the stamped version/schema/source/build, the civil timestamp, PII absence, print-only CSS, cockpit survival, compactness, and Hindi/Gujarati localisation with Latin-digit version identifiers. Full `npm run check` gate green: tests, `npm audit` (0 vulnerabilities), static build, source-zip parity.

---

## 5. Security & data protection

**This is the strongest area of the system, and the proposed hardening would weaken it.**

Verified storage inventory (`STORAGE_KEYS`, `app.js:903`) — `localStorage` holds **preferences and user-authored notes only**: language, report mode, Dasha engine, field mode, practice/journal/plan entries, a geocode cache, and contribution opt-in. **No name, no date of birth, no birth time, no computed chart is persisted.** Reports are generated in memory and discarded on reload.

| Proposed control | Assessment |
|---|---|
| AES-256 at rest with scoped client keys | **Not applicable.** No server-side data at rest. Browser-side encryption with a key the browser also holds is theatre — it protects against nothing an attacker with DOM access cannot bypass. |
| RBAC separating consultant and client | **Not applicable.** No accounts, no sessions, no server-side authorisation boundary. A client-side "role" is a cosmetic toggle, trivially flipped in devtools. The existing `reportMode` (`client` / `practitioner`) already handles the real requirement — *presentation* scoping — and is honest about being presentational. |
| PII encryption for floor plans / geolocation | Moot today. **Becomes mandatory the moment F3 ships**, if plans ever leave the device. Strong argument for keeping floor-plan processing client-side too. |

**Sole egress — already controlled, no action needed.** `photon.komoot.io` is the only outbound call. I expected to recommend documentation and a CSP allowlist here; **both are already shipped**, and verification is recorded rather than a finding:

- `index.html:28` carries a restrictive CSP meta tag: `default-src 'self'; script-src 'self'; style-src 'self'; connect-src 'self' https://photon.komoot.io; object-src 'none'; base-uri 'self'; form-action 'self'`. The single permitted egress is explicit and machine-enforced, and `object-src 'none'` plus `base-uri 'self'` close the usual injection escapes.
- `SECURITY.md:47` documents it precisely, including the data boundary: *"the request is user-initiated and caches the chosen city string, never lat/lon or the chart."*

The CSP and the documented threat boundary agree with the code. This is the posture the brief's §4 was reaching for, reached without encryption or RBAC.

---

## 6. Prioritised findings

| ID | Finding | Severity | Effort | Recommendation |
|---|---|---|---|---|
| **F2** | Magnetic declination advised in prose, not computed, while the engine flags 2° errors as material | **High** | Medium | **Implement.** WMM with real coefficients + hard epoch-expiry fallback. Never a dipole approximation. |
| **F1** | `app.js` is a 9,807-line IIFE mixing geometry, calculation and rendering | Medium | Medium | Extract incrementally, geometry first. No big-bang rewrite. |
| **F3** | No floor-plan ingestion; polygon/centroid/PIP pipeline does not exist | Medium (feature gap) | Large | Roadmap epic. Separate design doc. Greiner–Hormann, not Sutherland–Hodgman. Drop DWG. |
| ~~**F4**~~ | ~~Knowledge-pack version stripped from the printed report~~ | ~~Medium~~ | ~~Trivial~~ | **✅ Shipped 2026-10-01.** Print-only provenance footer; 10 tests added. |

**Checked and found already correct** (no action): CSP `connect-src` allowlist (`index.html:28`) · Photon egress documented with its data boundary (`SECURITY.md:47`) · no PII persisted · knowledge-pack versioning and `ajv` schema validation · offline precache via `sw.js`.

### Explicitly rejected from the brief

Postgres schema · Redis/BullMQ broker · Playwright PDF worker fleet · S3 + pre-signed URLs · microservice decomposition · AES-256 at rest · RBAC · Zod · UTC normalisation of birth data.

Each either solves a problem this architecture does not have, or — in the cases of UTC normalisation and server-side PII storage — would introduce a correctness or privacy regression.

---

## 7. Closing assessment

This codebase is in materially better shape than the brief assumes. Zero runtime dependencies, 554 passing assertions, a versioned and schema-validated content layer, genuine offline capability, a documented refusal to emit unfalsifiable scores, and a privacy model where client birth data is never persisted or transmitted.

The proposed architecture is a competent description of a *generic* SaaS platform. It is the wrong architecture for *this* product, because it would relocate the most sensitive data a numerology and Vastu practice handles — legal names, birth times, home floor plans — from the client's device onto infrastructure that must then be secured, audited, insured and maintained, in exchange for capabilities the current design already delivers.

The highest-value engineering available is **F2**: make the degree compass correct about true north. The system already tells practitioners that 2° matters. It should stop accepting an uncorrected error of that size through its primary input. **F4** is the cheapest meaningful win — every PDF the practice has delivered so far is unattributable to the content version that produced it.

A note on method: several items I expected to raise as findings turned out to be already solved — the CSP allowlist, the documented egress boundary, content/algorithm separation, and offline caching. They are recorded in §6 as verified rather than dropped, so a future reviewer does not re-litigate them.

**Recommended sequence:** ~~F4 first~~ **(done)** → **F2 next, the substantive win** → F1 geometry extraction as groundwork → F3 as a scoped epic with its own design review.
