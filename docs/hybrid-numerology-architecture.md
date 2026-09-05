# Hybrid Numerology Architecture: Foundation + Timeline

> **Status:** proposed design — no production UI behavior changes are included in this planning document.
>
> **Confirmed product choices:**
> - The primary **Foundation** experience uses a classic Lo Shu Grid.
> - The current Vedic Ank Kundali remains available as an advanced comparison view.
> - Lo Shu plotting uses every non-zero `DD-MM-YYYY` digit, then adds Moolank/Driver and Bhagyank/Conductor.
> - The first implementation pass is design/specification first.

## 1. Product promise

The product separates two complementary questions without blending their
methods:

| Module | User question | System of record | Output |
| --- | --- | --- | --- |
| **Foundation** | “Who am I?” | Classic Lo Shu | Static personality blueprint, planes, arrows, strengths, gaps and name resonance |
| **Timeline** | “When is the energy changing?” | Vedic Ank Jyotish Dasha | Active Mahadasha/Antardasha, upcoming transitions and readable opportunity windows |
| **Advanced comparison** | “What does the Vedic birth matrix add?” | Vedic Ank Kundali | A clearly labelled optional planetary comparison, never presented as Lo Shu |

This avoids implying that Lo Shu is a predictive dasha model or that the Vedic
Dasha timeline is derived from a Chinese magic square.

## 2. Information architecture

### 2.1 Primary report tabs

Place a persistent two-tab switcher directly under the report hero:

```text
[ Foundation · Lo Shu Blueprint ]   [ Timeline · Vedic Dasha ]
```

- **Foundation** is selected by default after onboarding.
- **Timeline** preserves its scroll position while a user switches away and
  back.
- Each tab has a meaningful hash route (`#foundation`, `#timeline`) so a report
  link can open the right module.
- Existing anchors inside a panel should activate the owning tab first. For
  example, `#dasha-section` opens Timeline before scrolling to the Dasha stack.

On small screens the tabs become a full-width segmented control, remain
sticky while reading, and retain a visible selected state.

### 2.2 Foundation tab structure

```text
Foundation · Lo Shu Blueprint
├── Blueprint overview
│   ├── Driver / Conductor and one-sentence chart story
│   ├── Classic 3 × 3 Lo Shu Grid
│   ├── Present / repeated / absent legend
│   └── “How this grid was plotted” disclosure
├── Personality patterns
│   ├── 8 Lo Shu planes
│   └── 8 Lo Shu arrows
├── Support signals
│   ├── Missing and repeated-number guidance
│   ├── Core traits, strengths and shadows
│   └── Name, mobile, vehicle and colour resonance
├── Name resonance
│   ├── Name Lo Shu Grid
│   └── Combined DOB + name Lo Shu Grid
└── Advanced comparison (collapsed by default)
    └── Vedic Ank Kundali birth grid, rules and planetary-plane reading
```

The advanced Vedic comparison opens in the Foundation tab rather than becoming
a competing top-level destination. It must use explicit **Vedic Ank Kundali**
labels and the `3–1–9 / 6–7–5 / 2–8–4` template at all times.

### 2.3 Timeline tab structure

```text
Timeline · Vedic Dasha
├── Current energy card
│   ├── Active Mahadasha, Antardasha and Pratyantar Dasha
│   ├── Current period dates, progress and “days remaining”
│   └── Plain-language theme, opportunity and caution
├── Scrollable Dasha rail
│   ├── Past segments (muted)
│   ├── Current segment (prominent marker)
│   └── Upcoming segments (next 12–24 months surfaced first)
├── Energy windows
│   ├── Career
│   ├── Relationship
│   ├── Property / home
│   ├── Wealth
│   └── Travel / abroad
├── Active Vedic Vastu zone
│   └── Planet-aligned, time-bound room/space action
└── Action bridge
    └── “Bring this period into your Foundation” cross-system note
```

The timeline should read like a roadmap rather than a dense astrological table:
use a horizontal rail on desktop and vertically stacked period cards on mobile.
The current Antardasha should be the primary visual focal point; the Mahadasha
is the contextual band behind it.

## 3. Calculation boundaries

### 3.1 Classic Lo Shu Foundation engine

Implement a separate, pure engine:

```js
const LO_SHU_LAYOUT = [
  [4, 9, 2],
  [3, 5, 7],
  [8, 1, 6]
];

function generateLoShuGrid(day, month, year) {
  // 1. Format DD, MM and YYYY.
  // 2. Take every non-zero digit from the complete date, including century.
  // 3. Add Moolank/Driver (reduced day) and Bhagyank/Conductor (full DOB).
  // 4. Return source-tagged entries and counts keyed by number 1–9.
}
```

The Foundation engine deliberately differs from the Vedic Ank Kundali engine:

| Rule | Foundation Lo Shu | Advanced Vedic Ank Kundali |
| --- | --- | --- |
| Layout | `4–9–2 / 3–5–7 / 8–1–6` | `3–1–9 / 6–7–5 / 2–8–4` |
| Year digits | Complete non-zero `YYYY`, including century digits | Final two non-zero year digits only |
| Zeros | Excluded | Excluded |
| Moolank / Bhagyank | Both added | Both added |
| Direct-date de-duplication | No; the classic selected rule counts raw DOB digits and roots | Yes, for 1–9, 10, 20 and 30 |
| Primary use | Psychological/personality blueprint | Vedic planetary comparison |

For example, `30-06-1986` in the Foundation grid has raw non-zero DOB digits
`3, 6, 1, 9, 8, 6`, then adds Moolank `3` and Bhagyank `6`. It therefore must
not reuse the Vedic Ank Kundali’s filtered count of `3×1, 6×3, 8×1`.

### 3.2 Dasha engine

The existing Dasha calculation remains independent of both matrices:

- Moolank starts the Mahadasha sequence.
- Mahadasha / Antardasha / Pratyantar duration calculations stay unchanged.
- Life-event windows remain period calculations, not Lo Shu arrow predictions.
- The timeline may *contextualize* a period with Foundation signals, but must
  label that as a cross-system insight rather than change the Dasha result.

### 3.3 No generic `counts` field

The hybrid model must avoid a single ambiguous `profile.counts` object. Use
system-scoped fields instead:

```js
profile.loShuGrid;      // entries, counts, sources, layout
profile.loShuCounts;
profile.vedicGrid;      // existing filtered Vedic engine output
profile.vedicCounts;
```

This is important because an absent Lo Shu number and an absent Vedic-grid
number have different calculation rules and should not silently drive the same
recommendation.

## 4. Recommendation and Vastu authority

### 4.1 Recommendation ownership

Recommended product policy:

| Recommendation | Authority | Required label |
| --- | --- | --- |
| Personality planes, arrows and psychological gaps | Lo Shu Foundation | `Lo Shu Foundation signal` |
| Period theme, transition dates and event windows | Vedic Dasha Timeline | `Vedic Dasha timing` |
| Planetary Vastu direction and current sector action | Vedic planetary map / Dasha | `Vedic Vastu alignment` |
| Vedic planetary comparison | Advanced Ank Kundali | `Vedic Ank Kundali comparison` |

A final remedy/action card may combine a Foundation signal with an active Dasha
period, but should show the two sources separately. For example:

```text
Foundation signal: Arrow of Determination is incomplete.
Timeline signal: Mercury Antardasha is active until 14 May 2027.
This week: write and review a three-step decision plan every Wednesday.
```

### 4.2 Vastu is never inferred from Lo Shu placement

The Lo Shu cell position must not become a Vastu compass direction. Vastu room
guidance and Dasha zone callouts retain the Vedic planetary mapping:

| Number | Planet | Vedic Vastu direction |
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

The optional Kua feature continues to be explicitly presented as a separate
Feng Shui system and must not change Vedic room recommendations.

## 5. Data and implementation plan

### 5.1 Knowledge-pack shape

Version the systems independently in the curated pack rather than reusing
legacy top-level fields:

```js
DB.gridSystems = {
  loShu: {
    layout: [[4, 9, 2], [3, 5, 7], [8, 1, 6]],
    planes: [...],
    arrows: [...],
    plotting: {...}
  },
  vedicAnk: {
    layout: [[3, 1, 9], [6, 7, 5], [2, 8, 4]],
    planes: [...],
    filtering: {...}
  }
};
```

A pack-schema and runtime validator should require both canonical layouts and
reject:

- a Lo Shu renderer fed Vedic layout data;
- an Ank Kundali renderer fed Lo Shu layout data;
- a Vastu compass map derived from either grid’s visual positions.

### 5.2 Renderer components

Keep engines and renderers separate:

```text
calculate/
  generateLoShuGrid()
  generateVedicGrid()
  dashaTimeline()
render/
  renderModuleTabs()
  renderLoShuFoundation()
  renderVedicComparison()
  renderDashaTimeline()
```

Every rendered grid cell should be selected by its **number key**, not an array
index. The layout controls a cell’s coordinate only; `counts[number]` controls
its content. This preserves correct name and combined-grid mapping across both
layouts.

### 5.3 Compatibility and migration

- Persist `gridSystemVersion` with saved charts so an old report can be
  regenerated transparently.
- Do not reinterpret a saved Vedic count as a Lo Shu count.
- If a cached pack only contains the retired single-grid shape, fall back to the
  bundled hybrid pack rather than mixing old plane/arrow data with new layouts.
- Release the hybrid pack under a new semantic version; a changed grid rule is
  not a content-only patch.

## 6. Interaction, accessibility and print requirements

- Use semantic `role="tablist"`, `role="tab"` and `role="tabpanel"`, with
  arrow-key navigation, visible focus rings and correct `aria-selected` state.
- Preserve the active tab in the URL hash and restore it on reload.
- Keep inactive panels out of sequential keyboard navigation (`hidden` or
  `inert` as appropriate).
- Do not rely on color alone for present/missing/repeated grid states.
- In print/PDF mode, expand both modules sequentially with a clear module
  heading; tabs must not hide the Timeline from the exported report.
- On mobile, ensure the Dasha rail has an accessible non-drag alternative:
  next/previous period buttons and a readable vertical list.

## 7. Acceptance criteria for implementation

### Foundation / Lo Shu

1. The primary grid renders exactly `4–9–2 / 3–5–7 / 8–1–6`.
2. It includes every non-zero digit from the full `DD-MM-YYYY` and then
   separately includes Moolank and Bhagyank.
3. It has independent source-tagged entries and counts; no Vedic filtering or
   direct-date de-duplication leaks into it.
4. Planes, arrows, name grid and combined grid all use Lo Shu coordinates.
5. The advanced Ank Kundali remains visibly and mathematically separate.

### Timeline / Dasha

1. Current Mahadasha, Antardasha and Pratyantar values match the existing
   deterministic engine tests.
2. Current, next and completed periods are visually distinguishable.
3. Period windows retain date ranges and explain their confidence/disclaimer.
4. Dasha Vastu callouts follow the Vedic planetary compass table above.

### Cross-system and release safety

1. No generic ambiguous grid count is used downstream.
2. Lo Shu coordinates are never used as Vastu directions.
3. English, Hindi and Gujarati labels distinguish Lo Shu, Vedic Ank Kundali,
   Vedic Dasha and Feng Shui/Kua.
4. Smoke tests cover separate Lo Shu and Vedic fixture counts, name/combined
   coordinate mapping, Dasha dates, tabs, mobile semantics and print output.
5. The serialized knowledge pack exactly matches the bundled fallback data.

## 8. Decisions still needed before implementation

The confirmed choices establish the module architecture. These two policy
choices determine how much existing report content moves or changes:

1. **Remedy authority:** Should missing/repeated-number remedies, dosha and
   deity cards be driven by Lo Shu counts, Vedic Ank counts, or presented as
   explicitly separate signals? The recommended default is separate sources:
   Lo Shu for psychological support; Vedic Ank/Dasha for planetary/timing
   guidance.
2. **Advanced comparison depth:** Should the optional Ank Kundali show only the
   birth grid at launch, or retain its current birth, name and combined grids?
   The recommended launch scope is birth-grid comparison first, then add name
   and combined Vedic grids only if users find the distinction clear.
