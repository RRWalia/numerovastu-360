# Hybrid Numerology Architecture: Foundation + Timeline

> **Status: implemented in release 2.8.0.**
>
> This document is the operating contract for the shipped hybrid experience.
> It replaces the earlier proposed-design notes.

## 1. Product contract

NumeroVastu 360 separates stable pattern reading from time-based reading.
Neither grid is allowed to silently change the other system's result.

| Surface | User question | System of record | Primary output |
| --- | --- | --- | --- |
| **Foundation · Lo Shu** | “What patterns and practices support me?” | Classic Lo Shu | Personality blueprint, Name/Combined mapping, planes, arrows, missing/repeated signals and 40-day practice |
| **Timeline · Vedic Dasha** | “What is active now and when does it change?” | Deterministic Ank Jyotish Dasha | Current MD/AD/PD, dates, event windows and active Vastu zone |
| **Advanced Vedic Comparison** | “What does the Vedic birth matrix show?” | Vedic Ank Kundali | Birth-only planetary-strength indicators |
| **Kua** | “What are my Feng Shui directions?” | Feng Shui | Separate Chinese-direction reference |

Foundation is the post-onboarding default. Timeline is selected for `#timeline`,
`#timing-section`, `#dasha-section` and `#vastu-section` routes.

## 2. Authority model

This table is both a product decision and a regression boundary.

| Output | Authority | Non-authorities |
| --- | --- | --- |
| Ayurvedic constitution / baseline | Driver + Conductor | Lo Shu, Vedic comparison |
| Ishta Devta / guardian deity | Driver + Conductor | Lo Shu, Vedic comparison |
| Power days | Driver + Conductor | Lo Shu, Vedic comparison |
| Missing/repeated remedies | Lo Shu Birth Grid | Vedic comparison, Dasha, zodiac |
| Crystals, Rudraksha, affirmations and habits for remedies | Lo Shu Birth Grid | Driver/Conductor, Vedic comparison, Dasha, zodiac |
| Bio-energetic Tattva anchors (breath, herbal bath, aroma, water, sunlight) | Vedic birth planes that are Partly Active or Deficient (`data-authority="vedic-tattva"`) | Complete Vedic planes, Lo Shu kits, crystals, Dasha timing |
| 40-day activation target and practice | Lo Shu Birth Grid | Home scan, Dasha, dosha and deity cards |
| Dasha dates and event windows | Dasha engine | Both grids |
| Dynamic Active Vastu Zone | Active Dasha lords + Vedic compass mapping | Both grids, static room scan, Kua |
| Compatibility reflection | Four pairwise Driver/Conductor relations | Lo Shu remedy output, Dasha timing, Vastu activation |
| Kua directions | Feng Shui | Classical Vastu / Dasha |

Compatibility is intentionally relational rather than prescriptive: it makes
mutual strengths, workable watch points, potential blind spots and communication
cues visible across the four Driver/Conductor pairings. It cannot generate
partner-side remedy kits, crystals, Rudraksha, affirmations, lifestyle
obligations or a second 40-day plan.

The UI carries these boundaries with `data-authority` or
`data-remedy-authority` markers where appropriate. Textual guardrails are also
shown because source labels matter to users, not only to code.

## 3. Calculation engines

### 3.1 Classic Lo Shu Foundation

```js
const LO_SHU_GRID_LAYOUT = [
  [4, 9, 2],
  [3, 5, 7],
  [8, 1, 6]
];
```

`generateLoShuGrid(day, month, year)` is a pure engine. It:

1. formats an input as `DD-MM-YYYY`;
2. keeps each non-zero digit across the *full* date, including century digits;
3. adds Moolank/Driver (reduced day);
4. adds Bhagyank/Conductor (reduced complete DOB);
5. returns source-tagged entries, counts keyed by numbers 1–9 and the canonical
   layout.

No Vedic filtering and no direct-date de-duplication are applied here.

The Foundation renderer always plots counts by **number key** against the
layout. That is why Birth, Name and Combined grids share the correct Lo Shu
coordinates rather than inheriting array order from a different system.

### 3.2 Vedic Ank Kundali comparison

```js
const VEDIC_GRID_LAYOUT = [
  [3, 1, 9],
  [6, 7, 5],
  [2, 8, 4]
];
```

`generateVedicGrid(day, month, year)` preserves the older filtered DOB rules:
zeros are excluded; century digits are not plotted; direct inputs `1–9`, `10`,
`20` and `30` are de-duplicated; and Moolank and Bhagyank are added.

The comparison renderer is deliberately constrained to:

- one **Vedic Birth Grid**;
- a closed `<details>` disclosure by default;
- present/single/concentrated/absent **Planetary Strength Indicators**;
- an explanation of its filtered plotting sources.

It must not render Vedic Name/Combined grids or turn absent Vedic indicators
into a Lo Shu-style remedy list (mantras, minerals, mandalas). Section 4A may
add Dinacharya / Aushadhi / Pranayama anchors for planes that are Partly Active
or Deficient; complete planes stay silent.

### 3.3 Dasha engine

`dashaTimeline(profile, now)` does not receive or read grid counts.

- Moolank starts the Mahadasha sequence.
- Mahadasha duration equals the number of years.
- Antardasha duration is `MD × AD ÷ 45`.
- Pratyantar duration is proportionally nested in its Antardasha.
- Event windows are scored only from active Mahadasha/Antardasha significator
  lords.

The Timeline renderer presents the current stack, periods, a lifetime Mahadasha
ladder, opportunity windows and the active Vastu callout. It uses the current
Antardasha lord for the primary zone and exposes the Pratyantar micro-period as
supporting context.

## 4. Vastu and direction rules

The Vedic compass map is semantic data, not a visual grid-position map:

| Number | Planet | Zone |
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

Two Vastu surfaces coexist without conflation:

1. **Active Vastu Zone** — dynamic and Dasha-led. It says, “Active Vastu Zone:
   Prioritise this sector now.”
2. **Home Vastu Context** — a fixed scan of supplied room directions. It lives
   in Timeline beside the Dasha road map and explicitly states that it cannot
   select or alter the active zone.

Kua is visibly marked Feng Shui and is not treated as a classical Vastu remedy
or a Dasha direction.

## 5. Report composition

```text
Report
├── Foundation · Lo Shu (default)
│   ├── Northstar / source-boundary summary
│   ├── Driver + Conductor profile, dosha and deity baseline
│   ├── Lo Shu Birth / Name / Combined grids
│   ├── Lo Shu planes, arrows, missing kits and repeated channeling
│   ├── Advanced Vedic Comparison (open so it prints; birth grid + three plane readings)
│   ├── 4A Vedic Plane Harmonization — Elemental Tattva Balancing (cards only for partial/empty planes)
│   ├── Supporting identity / career / colour / Kua features
│   └── Lo Shu 40-day activation plan + separate Driver/Conductor power-day reference
└── Timeline · Vedic Dasha
    ├── Long-range Personal-Year Context (explicitly non-Dasha)
    ├── Current Dasha stack (MD × AD relationship badge, next Pratyantar)
    ├── Next 90 Days — Pratyantar micro-forecast (crosses the AD boundary)
    ├── MD × AD predictive synthesis (Grahan Yoga when 4 × 2)
    ├── Annual Transit × Dasha synthesis (Personal Year read through the stack)
    ├── Life-event windows with conversion-probability grades
    ├── Dynamic Active Vastu Zone + Dual-Zone pairing (AD primary, MD anchor)
    └── Fixed Home Vastu Context
└── Cockpit · Practitioner (one printable A4 page)
    ├── Identity band (name, DOB, birth time, place + coordinates, Lagna, Nakshatra)
    ├── Core row (Driver/Conductor, name total, Lo Shu missing/excess, Vedic absent/strong)
    ├── Current timing (MD, AD + Sambhandha verdict, PD, Personal Year)
    ├── Clinical triage (active conflict, urgent spatial Rx, single japa target)
    ├── Tier 2 latent leaks with activation dates
    ├── Graded event windows
    └── Consultation notes + disclaimer
```

The broad personal-year material is labelled as a non-Dasha reflection context.
It never changes active Dasha dates, event windows or the active Vastu zone.
The Dasha section separately treats the Personal Year as the *annual transit
engine* the active stack operates through: it phrases guidance, never dates.

### Dasha stack badges — classical Sambhandha

The Mahadasha card is badged against the native (Driver ↔ MD lord). The
Antardasha card is badged against the **Mahadasha lord** (MD × AD sambandha),
because that is the operative relationship of the period: the guest runs inside
the host's house and climate.

`getDashaRelationship(mdLord, adLord, driver)` is the single decision point,
used by the Antardasha badge, the Pratyantar micro-forecast rows (PD judged
inside its AD) and the cockpit:

| Rule | Result |
| --- | --- |
| Grahan pairs 4×2, 2×4, 4×1, 1×4 | `enemy`, `grahan: true`, `badge-conflict` |
| Symmetric hostile pairs 1×8, 9×8, 3×6 (both directions) | `enemy`, `badge-conflict` |
| Pack relation `enemy` | `enemy`, `badge-conflict` |
| Pack relation `friendly` | `friendly`, `badge-friendly` |
| Genuinely neutral MD × AD | falls back to Driver ↔ AD; friendly ⇒ `badge-friendly`, else `badge-neutral` |

A conflicting stack can never render a green badge, so the badge, the
predictive synthesis and the Compatibility table cannot contradict each other.

### Remedial triage

`remedyTriage(profile, timeline, refDate)` stages the prescription:

| Tier | Selection | Prescription |
| --- | --- | --- |
| Tier 1 (acute) | The Lo Shu missing number that is live in the stack — AD (weight 4) > Personal Year (3) > PD (2) > MD (1) | One beej mantra at a completable dose (27× daily), one weekly discipline, one colour, one sector |
| Tier 1 (environmental) | No missing number is live | No japa; work the active AD sector only |
| Tier 2 (latent) | Every other missing number | Colour/habit cue only, plus the exact Antardasha or Personal Year at which it becomes Tier 1 |

The full remedy library is untouched — triage decides only what the client is
asked to do this cycle, and the withheld list states what was intentionally not
prescribed (extra mantras, extra fasts, stacked gemstones).

### Natal strength and event windows

Event windows are found and ranked by the Dasha lords alone. The Vedic birth
grid never adds or removes a window; it only grades how directly each window
is expected to convert:

| Grade | Rule |
| --- | --- |
| High — direct conversion | The triggering Antardasha lord is present in the Vedic birth grid |
| Moderate | AD lord absent, but the Mahadasha lord is a present significator |
| Conditional | Both triggering lords absent; needs the AD lord's Vastu sector activated first |

`qualifyEventWindow(significators, natalCounts, [md, ad])` returns the same
grading as a standalone, testable function (`natalStatus`, `probability`,
`clinicalNote`) and is what the cockpit prints. A natal void never scrubs a
window: it downgrades it to remedy-dependent.

If an event's classical age band has already closed, the next significator
windows (15-year look-ahead) are shown as *late windows* instead of an empty
card.

## 6. Data contract and release safety

The bundled data and serialized pack use schema v2 / pack version 2.8.0.
Relevant data lives in:

```text
KNOWLEDGE_PACK
├── schemaVersion: 2
├── packVersion: "2.8.0"
└── db
    ├── loShuGrid       # canonical layout, planes, arrows and plotting policy
    ├── vedicGrid       # canonical Vedic layout and filtered plotting policy
    ├── dasha           # lord durations, themes, zones and event significators
    └── vastu           # Vedic compass and fixed home-placement rules
```

`validatePack()` rejects malformed or crossed layouts and invalid Dasha/Vastu
mappings. The release JSON pack at `knowledge-pack/packs/2.8.0.json` is derived
from the bundled `KNOWLEDGE_PACK`; it is not maintained as a divergent copy.

The profile model uses namespaced grid state:

```js
profile.loShuGrid;
profile.loShuCounts;
profile.loShuMissing;
profile.loShuRepeated;
profile.loShuNameCounts;
profile.loShuCombinedCounts;

profile.vedicGrid;
profile.vedicCounts;
profile.vedicMissing;
profile.vedicRepeated;
```

There is no generic downstream `profile.counts` or `profile.missing` field.

## 7. Interaction, localisation and print

- Module navigation uses semantic `tablist`, `tab` and `tabpanel` roles.
- Click, arrow-key and hash navigation synchronise selection, hidden panels and
  URL state.
- Anchors activate the owner panel before scrolling.
- The narrow-screen module and Timeline-anchor controls remain horizontally
  scrollable/reachable.
- English, Hindi and Gujarati label Foundation, Timeline, Cockpit and Advanced
  Vedic Comparison separately.
- `@page { size: A4 portrait; margin: 12mm 10mm; }` fixes the sheet geometry for
  client PDF printers; remedy, kit, phase, priority and cockpit cards carry
  `break-inside: avoid` so no prescription card splits across pages.
- The cockpit's "Print this page" button toggles `body.print-cockpit`, which
  limits the print job to the consultation sheet and is always cleared again.
- On screen only, `.rsection` uses `content-visibility: auto` with an intrinsic
  size hint so the 40+ page DOM no longer locks the mobile main thread on first
  render; print media keeps every section laid out.
- Print/PDF CSS exposes all three module panels and expands closed advanced Vedic
  content so exports are complete. Compatibility is allowed to flow between
  meaningful blocks, while its overview/header, reflection intro and each
  relationship row stay together to prevent orphaned headings or blank shells.

## 8. Regression coverage

`smoke.test.js` covers:

- independent canonical Lo Shu and Vedic calculations, including century and
  direct-date filtering differences;
- Lo Shu Name/Combined coordinate mapping;
- advanced Vedic birth-only behavior (printable, with plane readings, no remedy list);
- Section 4A Tattva cards only for partial/empty Vedic planes, with no fasts, crystals or Lo Shu mandala stack;
- Dasha and Vastu timing independence from both grids;
- all authority boundaries, including Lo Shu-only 40-day/crystal selection and
  non-prescriptive Compatibility output;
- schema/pack validation and canonical Vastu mappings;
- English/Hindi/Gujarati labels, tabs/hash handling, mobile CSS and print CSS;
- Compatibility overview/row print-break safeguards and no empty partner-kit
  placeholders;
- the deterministic Bhagyank equation string (`formatConductorBreakdown`), the
  Sambhandha matrix (`getDashaRelationship`), natal-weighted window grading
  (`qualifyEventWindow`), the staged prescription (`remedyTriage`) and the
  one-page cockpit (data, markup, tab wiring and cockpit-only print CSS).

`tests/visual/report-print.visual.spec.js` runs the hybrid report in Chromium
and verifies Foundation defaults, real tab/hash behavior, relational
Compatibility output, mobile Timeline navigation and print expansion.
