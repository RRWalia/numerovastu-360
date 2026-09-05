# NumeroVastu 360

**Release 2.8.0 — Lo Shu Foundation + Vedic Dasha Timeline**

NumeroVastu 360 is a private, browser-only numerology and Vastu guidance app.
It intentionally keeps two traditions separate:

- **Foundation · Lo Shu** answers *“What patterns do I work with?”*
- **Timeline · Vedic Dasha** answers *“What is active now, and when does it change?”*
- **Cockpit · Practitioner** answers *“What do I actually do in this consultation?”*

Enter a name, date of birth and optional home details to generate a report. No
personal details are sent to an application server.

> Traditional/spiritual guidance only. It is not medical, legal, financial or
> mental-health advice.

## What changed in 2.8.0

This release makes the hybrid model explicit rather than treating one grid as a
catch-all source of truth.

| Area | 2.8.0 behaviour |
| --- | --- |
| Default report | Opens on **Foundation · Lo Shu** after onboarding |
| Foundation grid | Classic Lo Shu `4–9–2 / 3–5–7 / 8–1–6` |
| Grid plotting | Every non-zero digit from the full `DD-MM-YYYY`, including century digits, then Moolank and Bhagyank |
| Lo Shu views | Birth, Name and Combined grids; eight planes; eight arrows; present, repeated and missing signals |
| Vedic Ank Kundali | A **birth-grid-only** advanced comparison using `3–1–9 / 6–7–5 / 2–8–4`, with qualitative readings of the three Vedic planes |
| Timeline | Independent proportional Dasha stack, dates, current/next periods, life-event windows and active Vastu zone |
| Release data | Schema v2 / knowledge pack v2.8.0 |

### Clinical release additions

| Area | Behaviour |
| --- | --- |
| Bhagyank formula | `formatConductorBreakdown()` builds the printed equation from the raw DOB digits (no regex surgery on a formatted label), so no digit can be dropped or replaced by an artifact. Zeros are filtered for the classical display; the sum is unchanged. |
| Dasha relationship | `getDashaRelationship(md, ad, driver)` judges the Antardasha against its **host Mahadasha** (classical *Sambhandha*). Grahan pairs (Rahu–Moon, Rahu–Sun) and Sun–Saturn, Mars–Saturn, Jupiter–Venus are hostile in both directions and can never render a green badge. Only a genuinely neutral MD × AD falls back to Driver compatibility. |
| Remedy triage | `remedyTriage()` prescribes **one acute target** — the missing number that is live in the Dasha stack or Personal Year — and demotes the rest to Tier 2 environmental cues with the date they activate. |
| Event windows | `qualifyEventWindow()` grades windows High / Moderate / Conditional instead of hiding them when a significator is natally absent. |
| Practitioner Cockpit | A third report module: one printable A4 consultation sheet with identity, both grids, the live stack, triage and graded windows. |
| Print resilience | `@page { size: A4 portrait; margin: 12mm 10mm; }` plus `break-inside: avoid` on every remedy/kit/cockpit card; the cockpit forces its own page in print (`break-before: page`, marketing intro stripped, 8.5pt/1.2 sheet type, 7.5pt tables) so it stays a single quick-reference sheet; “Print this page” narrows the job to the cockpit alone. |

## Product map

### Foundation · Lo Shu Blueprint

Foundation is the initial personality and practice dashboard. It includes:

- Driver / Moolank and Conductor / Bhagyank as core identity context;
- classic Lo Shu **Birth**, **Name**, and **Combined** grids;
- Lo Shu planes, arrows, present/missing/repeated signals;
- missing-number remedy kits and repeated-number channeling;
- Lo Shu-led mantras, affirmations, crystals, Rudraksha and habits;
- a Lo Shu-led 40-day activation tracker;
- an **Advanced Vedic Comparison** for the Vedic birth grid only (expanded so it prints), with one interpretive card per Vedic plane.

The Name and Combined grids use the same Lo Shu coordinates as the Birth Grid.
They do **not** create Vedic Name or Vedic Combined grids.

### Timeline · Vedic Dasha

Timeline is the time-based roadmap. It contains:

- active Mahadasha, Antardasha and Pratyantar Dasha, with the Antardasha badged
  by its relationship to the Mahadasha lord;
- a rolling 90-day Pratyantar micro-forecast (including the next Antardasha);
- an Annual Transit × Dasha synthesis reading the Personal Year through the stack;
- current-period dates, progress and upcoming transitions;
- Dasha-led life-event opportunity windows, each graded High / Moderate /
  Conditional by whether its significators are present in the Vedic birth grid
  (natal strength grades conversion; it never deletes a window);
- the exact callout **“Active Vastu Zone: Prioritise this sector now”**;
- a fixed home-placement context scan, clearly distinguished from the dynamic
  Dasha zone.

The Active Vastu Zone is chosen from the active Dasha lords and the Vedic
planetary compass map. It is never inferred from a Lo Shu cell position.

### Cockpit · Practitioner

A single printable page (`#practitioner-cockpit`) for use during a consultation:

- identity band — name, DOB, birth time, place with coordinates, Lagna and
  Nakshatra when Tier 2 is unlocked;
- core row — Driver/Conductor, name total, Lo Shu missing/excess, Vedic
  absent/strong;
- current timing — Mahadasha, Antardasha (with the Sambhandha verdict and any
  Grahan Yoga), Pratyantar and the Personal-Year transit;
- clinical triage — the active planetary conflict, the urgent spatial
  prescription (primary sub-zone plus anchor zone) and the single japa target
  with a completable dose;
- Tier 2 latent leaks, each with its hold instruction and activation date;
- graded event windows;
- ruled consultation-notes space.

The cockpit recalculates nothing. It reads the same engines as the full report,
so the two can never disagree.

In print the sheet is a dedicated page: the section breaks before itself, the
module’s explanatory heading is screen-only copy and is dropped, and the sheet
compacts to 8.5pt/1.2 (7.5pt tables) so identity, grids, timing, triage,
Tier 2, windows and the notes rules all share one A4 page. The sheet header
carries a print-only title line (module name plus generation date) because the
toolbar stamp that shows it on screen is also hidden in print.

### Advanced Vedic comparison

The optional Foundation disclosure is a comparison lens, not a second remedy
engine:

- it is closed by default;
- it renders only the **Vedic Birth Grid**;
- its count differences are labelled **Planetary Strength Indicators**;
- absent/repeated Vedic indicators do not create missing-number remedies,
  crystals, or another 40-day checklist.

## Authority boundaries

The report intentionally shows the source of each kind of guidance.

| Output | Sole authority | What does **not** change it |
| --- | --- | --- |
| Ayurvedic constitution / baseline | Driver + Conductor | Either grid |
| Ishta Devta / guardian deities | Driver + Conductor | Either grid |
| Power days | Driver + Conductor | Either grid |
| Missing/repeated remedies, crystals, Rudraksha, affirmations, habits and 40-day practice | Lo Shu Birth Grid | Vedic comparison, zodiac and Dasha |
| Current Dasha, dates, event windows and Active Vastu Zone | Dasha engine | Either grid |
| Compatibility reflection | Pairwise Driver + Conductor relations | Lo Shu remedies, Dasha timing and Vastu activation |
| Kua directions | Feng Shui | Classical Vastu / Dasha guidance |

Compatibility uses the four Driver/Conductor pairings to make mutual strengths,
watch points, potential blind spots and communication cues explicit. It is a
relationship reflection only: it never adds crystals, Rudraksha, affirmations,
lifestyle obligations, partner-side remedy kits or a second 40-day plan.

The Driver/Conductor power-day card is a scheduling reference. It does not pick
or replace a Lo Shu remedy target. The Kua card is visibly labelled **Feng
Shui (Chinese)** and remains separate from the Vedic Dasha/Vastu direction map.

## Grid calculations

### Primary classic Lo Shu engine

The Foundation grid is fixed as:

```text
4 | 9 | 2
3 | 5 | 7
8 | 1 | 6
```

For a date of birth, the engine:

1. formats the date as `DD-MM-YYYY`;
2. keeps every non-zero digit, including the century digits in `YYYY`;
3. adds Moolank / Driver (reduced birth day);
4. adds Bhagyank / Conductor (reduced full DOB);
5. counts each number in the Lo Shu layout.

For example, `30-06-1986` contributes raw digits `3, 6, 1, 9, 8, 6`, then
Driver `3` and Conductor `6`. Its Lo Shu result therefore differs intentionally
from the advanced Vedic comparison.

### Advanced Vedic Ank Kundali engine

The comparison grid is fixed as:

```text
3 | 1 | 9
6 | 7 | 5
2 | 8 | 4
```

It preserves the app's existing filtered-DOB rules:

- zeros are removed;
- century digits are excluded from plotted year digits;
- direct date input is de-duplicated for `1–9`, `10`, `20` and `30`;
- Moolank and Bhagyank are still added.

For `30-06-1986`, the Vedic plotted counts are `3×1`, `6×3`, `8×1`.
Those counts must never be used as Lo Shu counts or as a remedy checklist.

### Dasha and Vastu timing

The Dasha engine is deterministic and independent of both grid engines:

- Moolank begins the Mahadasha sequence;
- a Mahadasha has a duration equal to its number of years;
- Antardasha is proportional: `MD × AD ÷ 45`;
- Pratyantar Dasha is proportional within its parent Antardasha;
- event windows use active Dasha-lord significators only.

The Dasha/Vastu bridge uses the Vedic planetary direction map:

| Number | Planet | Vedic Vastu zone |
| --- | --- | --- |
| 3 | Jupiter / Guru | North-East / Ishanya |
| 1 | Sun / Surya | East / Purva |
| 9 | Mars / Mangal | South / Dakshin |
| 6 | Venus / Shukra | South-East / Agneya |
| 7 | Ketu | North-East / Center Axis |
| 5 | Mercury / Budh | Center / Brahmasthan and North |
| 2 | Moon / Chandra | North-West / Vayavya |
| 8 | Saturn / Shani | West / Paschim |
| 4 | Rahu | South-West / Nairutya |

The optional room-direction scan is a fixed assessment of entered home details.
It is displayed in Timeline beside the Dasha road map and explicitly cannot
replace the current Dasha-selected active zone.

## Accessibility, URL state and print

- The module switcher uses `tablist`, `tab` and `tabpanel` semantics.
- Arrow keys move between the Foundation, Timeline and Cockpit tabs.
- `#foundation`, `#timeline`, `#cockpit`, `#dasha-section`, `#timing-section`,
  `#vastu-section` and `#practitioner-cockpit` activate the owning module
  before scrolling.
- On narrow screens, module and Timeline anchor navigation remain horizontally
  reachable rather than wrapping into inaccessible controls.
- In print/PDF media, all three report modules and the normally closed advanced
  comparison are expanded in report order, on A4 portrait with 12mm/10mm
  margins; remedy, kit and cockpit cards never split across a page.
- The cockpit’s “Print this page” button adds `body.print-cockpit`, which
  narrows the print job to the single consultation sheet and is always removed
  afterwards. In that mode the forced page break is lifted again (the sheet is
  already the first box of the job, so keeping it would emit a blank page).
- The skip link is stripped in print: its off-screen transform parks it inside
  page 1 of the paginated output otherwise.
- On screen only, report sections use `content-visibility: auto` so mobile
  devices no longer lay out all 40+ pages on first render; print media keeps
  full layout.
- English, Hindi and Gujarati distinguish Lo Shu, Vedic comparison, Vedic
  Dasha and Feng Shui/Kua labels.

## Privacy and knowledge packs

All profile calculations run in the browser. Names, DOBs, phones, vehicles,
birth time/place and entered home details are not posted to an app backend.
Local report history, the practice tracker and journal remain in browser local
storage for that device.

The public knowledge pack is separate from personal data:

1. `data.js` supplies bundled schema-v2 content for instant/offline use.
2. A newer public JSON pack can be read from `knowledge-pack/latest.json`.
3. A pack is validated before it is cached or used.
4. An older/single-grid pack is rejected rather than mixed into the hybrid UI.

Release 2.8.0 ships `knowledge-pack/packs/2.8.0.json`, generated from the
bundled pack. The schema requires canonical `loShuGrid` and `vedicGrid`
configuration as well as the Dasha/Vastu mappings.

## Tech stack and project layout

- Vanilla JavaScript (`app.js`) with a bundled curated knowledge pack (`data.js`)
- Browser-local Vedic ephemeris (`astro.js`)
- Plain CSS with responsive and print rules (`styles.css`)
- Vite for development and static serving
- jsdom for deterministic engine/report smoke coverage
- Playwright/Chromium for browser, mobile-navigation and print checks

```text
numerovastu-360/
├── index.html                         # App shell and intake form
├── app.js                             # Engines, renderers, routing and local state
├── astro.js                           # Browser-local Vedic astronomy helpers
├── data.js                            # Bundled schema-v2 knowledge pack
├── i18n.js                            # English, Hindi and Gujarati labels
├── styles.css                         # Responsive and print presentation
├── smoke.test.js                      # Hybrid engine and jsdom regression suite
├── tests/visual/                      # Browser/mobile/print Playwright coverage
├── knowledge-pack/
│   ├── schema.json                    # Schema-v2 contract
│   ├── latest.json                    # Current manifest
│   └── packs/2.8.0.json               # Release JSON pack
└── scripts/build-static.cjs           # Static distribution builder
```

## Development

### Prerequisites

- Node.js 18+ (Node 22 is supported)

### Run locally

```bash
npm install
npm run dev
```

Vite binds to `0.0.0.0`; open the URL it prints (normally
`http://localhost:5173`).

### Quality checks

```bash
npm test                 # Grid, authority, pack, localisation and tab regression suite
npm run audit            # Dependency audit
npm run build            # Rebuilds static dist/ from root sources
npm run check            # test + audit + build

# Browser checks (Chromium required once)
npm run browsers:install
npm run test:visual
```

The smoke suite checks both grid engines, Lo Shu Name/Combined coordinate
mapping, Dasha/Vastu independence, authority boundaries, schema/pack validity,
multilingual labels, accessible tab/hash behavior, and mobile/print CSS hooks.
The Playwright suite verifies the same report behavior in a real browser,
including mobile Timeline navigation and print expansion.

### Deploy

The application is static. Publish either:

- the repository root files and the full `knowledge-pack/` directory; or
- the generated `dist/` directory after `npm run build`.

No server-side runtime is required.

## Disclaimer

NumeroVastu 360 presents traditional numerology, Vastu and spiritual wellness
content for reflection. It does not diagnose health conditions or guarantee
outcomes. Seek qualified professional advice for medical, legal, financial,
relationship or property decisions.

## License

No license file is included. Contact the repository owner
([`RRWalia/numerovastu-360`](https://github.com/RRWalia/numerovastu-360)) before
reusing or redistributing the project.
