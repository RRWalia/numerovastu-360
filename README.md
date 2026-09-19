# NumeroVastu 360

**Release 2.13.0 — Architecture & UX audit: strict grid tagging, Kua segregation, primary Dasha engine, progressive disclosure, Client/Practitioner bundling, layman action framework**

NumeroVastu 360 is a private, browser-only numerology and Vastu guidance app.
It intentionally keeps each tradition separate, and says so in the UI:

- **Foundation · Lo Shu** answers *“What patterns do I work with?”*
- **Timeline · Ank Jyotish Dasha** answers *“What is active now, and when does it change?”*
- **Timeline · Classical Vimshottari** answers *“What does the nakshatra-anchored Vedic stack say?”*
- **Cockpit · Practitioner** answers *“What do I actually do in this consultation?”*

Enter a name, date of birth and optional home details to generate a report. No
personal details are sent to an application server. Installable as an offline
PWA for use in the field.

Licensed under the [MIT Licence](LICENSE). Contributions are welcome — read
[CONTRIBUTING.md](CONTRIBUTING.md) first, especially the content-review gate
for any remedy, dosha or deity change.

> Traditional/spiritual guidance only. It is not medical, legal, financial or
> mental-health advice.

## What changed in 2.13.0

This release implements a full architectural and UX audit (reference chart:
**Amar Sambhvani, 24 Jan 1983, 12:10 AM, Ahmedabad — Money / Business /
Career**). It fixes three methodological contradictions, restructures the
report around progressive disclosure, and adds a layman action framework and
Client/Practitioner bundling. Every pillar is pinned by a smoke assertion built
on the reference chart.

| Area | 2.13.0 behaviour |
| --- | --- |
| **Grid-authority tagging (#1a)** | Every Dasha event window is structurally tagged with the grid it evaluates: `natalConversion()` returns `grid: "vedic"`, window rows carry `data-natal-grid="vedic"`, and the grade names the **Vedic Ank Kundali grid (3–1–9 / 6–7–5 / 2–8–4)** verbatim. A significator present in one grid but not the other is surfaced via a `divergence` disclosure. A Lo Shu-only presence can no longer read as a "Vedic birth grid" presence. |
| **Kua segregation (#1b)** | The Kua number is cordoned into an optional `data-module="feng-shui-optional"` module (`data-authority="feng-shui"`, collapsed by default) and removed from the classical 16-zone Vastu flow. The Vastu section now stands on the **Ashta Dikpalaka** eight direction-rulers (`data-authority="vedic-direction-rulers"`) matched to the birth chart. |
| **Primary Dasha engine (#1c)** | **Ank Jyotish is the primary engine by default** and switchable. The secondary (Vimshottari) is hidden behind a collapsed **"Advanced Astrological Cross-Reference"** appendix for practitioners, and a banner names both current lords so Mercury (Ank) vs Jupiter (Vimshottari) reads as two deliberate clocks, not an error. |
| **Goal aggregation (#2)** | Goals sharing a remedy signature merge into one **Combined Strategic Focus** section (Money, Business & Career → Mercury 5), each remedy kit rendered once — no more copy-paste redundancy. |
| **Leak sanitisation (#2)** | The raw JSON contribution payload, Meeus engine strings and the `h0=-0.8333°` ephemeris constant are gated behind `.practitioner-only` / `[data-technical]` and suppressed for clients on screen **and** in print. |
| **Layman action framework (#3)** | Layer-1 summary gains a **7-Day Micro-Routine** table (Time/Day \| Planetary Anchor \| Action Item) and explicit **DO vs DO-NOT** contrast cards. |
| **Client/Practitioner bundling (#4a)** | A Client/Practitioner mode toggle hides the cockpit, cross-reference appendices and Kua module in client mode (body-class gating that survives print) and force-expands them in practitioner mode. |
| **Name practicality (#4b)** | `namePracticality()` adds a 1–5 **Pronunciation & practicality** rating; `initialCandidates()` generates middle-initial options so the engine is no longer limited to trailing doubles. Internal cluster doubles (e.g. "Sambhhvani") rate low. |
| **Conflict muting (#4c)** | Under solar overload (high-Pitta + 3× Sun) conflicting Sun-activation tips are visually muted (`data-conflict-muted="solar-overload"`) so they never print live beside a solar-load warning. The clinical scaffolding itself is preserved. |
| **Pack / app version** | Knowledge data unchanged, so `latestVersion` stays **2.9.0** and `packUrl` stays `knowledge-pack/packs/2.9.0.json`; `appVersion` bumps to **2.13.0**. `APP_VERSION`, `index.html` meta, `sw.js` cache, `i18n` status pills and `package.json` all move to 2.13.0. The status badge now reads "On-device engine" (the "Meeus engine" name is reserved for the practitioner view). Source archive refreshed. |

## What changed in 2.12.0

The partner intake previously captured only a name and a date, so the partner's
natal Moon — the anchor of Chandra-bala, Tara Bala and Vimshottari — was not
computable at all. The Moon moves ~13°20′ a day (one whole Nakshatra), so a
Rashi, Nakshatra pada or Chandra-bala verdict is **not derivable from a date**;
any chart near a boundary would be silently wrong. Four PRs close that gap
without ever guessing a Moon.

| Area | 2.12.0 behaviour |
| --- | --- |
| **Chandra-bala Rashi axis (new in #46)** | Partner intake now captures optional **partnerBirthTime** and **partnerBirthPlace**, wired to the same offline atlas autocomplete as the primary birthplace so the two intakes cannot drift vocabularies. Both values round-trip through snapshot and form. Engine `chandraBala()` computes the partner's sidereal Moon via the on-device Meeus engine and reports the mutual axis: **1/1 Ekarashi, 2/12 Dwidwadasha, 3/11, 4/10, 5/9 Navapanchama, 6/8 Shadashtaka, 7/7 Samasaptaka**. Where both Moons share a rashi lord — classical cancellation of Shadashtaka / Dwidwadasha — that is reported as a fact, not applied as a score, because schools differ. **Two states only:** Tier 1 (date only) shows Driver/Conductor comparison and a banner *“Chandra-bala not computed — add partner birth time and location”* naming which side is missing; Tier 2 (time + place on both sides) shows the computed verdict. No noon default, no stand-in city, no approximate Moon — `chandraBala()` returns `{ tier: 1, chandraBalaComputed: false, missing, message }` instead. The layer is deliberately **not** a 36-point Ashtakoota score (Gana/Nadi/Yoni/Graha Maitri not computed or implied) and prescribes nothing — no remedy, no muhurtha, no Vastu zone. `data-authority=\"chandra-bala\"`. Localised EN/HI/GU. |
| **Astro-Identity Snapshot (new in #47)** | When partner Tier 2 is reached, Section 18 renders a compact companion card beneath the verdict: **Sun (Surya Rashi), Moon (Chandra Rashi), Nakshatra with pada and Lagna** for both people side-by-side, with the two Moon rows tinted because they are what the axis derives from. Purpose is verification — practitioner can check the verdict against actual longitudes. **Positions only:** no second verdict, no Ashtakoota points, no remedy. There is deliberately **no Tier 1 variant** — a Sun-only column would invite exactly the eyeball Moon comparison that a date alone cannot support. The two charts degrade independently: if primary is Tier 1 its Moon/Nakshatra/Lagna cells read *“not computed — add your birth time & place”* rather than blank. The card repeats birth moment, resolved place, DST caveat and ayanamsa so inputs are auditable; coordinate-entered places print lat/lon once. `data-authority=\"chandra-bala\"`. |
| **Partner Vimshottari anchor (new in #48)** | Once the partner's natal Moon is computable, the partner's own classical Vimshottari stack is computable too — same engine, same method. Section 18 adds a second companion card beneath the snapshot, rendered only when partner reaches Tier 2 (no Tier 1 variant). It shows **anchor** (nakshatra, pada, lord, Moon sign/degree, span, % elapsed), **balance of the birth lord at birth**, and **active Mahadasha / Antardasha / Pratyantar** with dates and ages. A final line reports the two active stacks as a *fact* — same Mahadasha lord or different — mirroring the shared-rashi-lord idiom: reported, never scored. If primary is Tier 1 the card still shows partner's stack (fact of partner's chart) but withholds the comparison rather than half-computing. **Timing read-out only:** never feeds Chandra-bala verdict, Lo Shu remedies, Vastu zones or Ank Jyotish roadmap, prescribes nothing. `data-authority=\"vimshottari\"` (already in vocab) and its own CSS class so the primary card's pixel-regression locator stays single. Localised EN/HI/GU. Hand-verified: 2000-04-04 09:30 Ahmedabad Uttara Bhadrapada p3 / Saturn 74.6% elapsed → 4.822y balance → Ketu MD through 2029-01-29. |
| **Tara Bala Nakshatra layer (new in #49)** | The Chandra-bala card computed the Rashi (Bhakoot) axis; classical matching also reads a **Nakshatra-level** factor — Tara — and both natal nakshatras have been computable since #46/#47. Engine `taraBala()` counts nakshatras **inclusively** from partner's Moon nakshatra to self's and vice versa, takes each count **modulo 9 (0 read as 9)** and applies traditional classification — remainders **3, 5 and 7 inauspicious**, every other remainder (1,2,4,6,8,9) auspicious. Both directions auspicious = favourable, one each way = mixed, both inauspicious = caution. **Janma Tara** (same nakshatra) gives count 1 both ways; schools differ, so card flags it as fact rather than fixed verdict. Card is a labelled sub-block under the computed Chandra-bala verdict (Tier 1 banner untouched — no nakshatras, no Tara), printing **both counts, both remainders and the traditional word for each direction**, overall reading, Janma note where applicable, and a scope line stating Tara is one of eight Ashtakoota factors reported with its own working — **not folded into any 36-point score**, prescribing nothing. Pinned worked examples: Rohini/Anuradha → 14→5 inauspicious / 15→6 auspicious; Jyeshtha/Purva Phalguni → 8 auspicious / 21→3 inauspicious. `taraBala()` returns `{ computed: false, missing, message }` naming which side is short. Localised EN/HI/GU. |
| **Pack / app version** | Knowledge data unchanged, so `latestVersion` stays **2.9.0** and `packUrl` stays `knowledge-pack/packs/2.9.0.json`; `appVersion` bumps to **2.12.0**. `APP_VERSION`, `index.html` meta, `sw.js` cache, `i18n` status pills and `package.json` all move to 2.12.0. Source archive refreshed. |

## What changed in 2.11.0

Wealth & business windows previously stopped at age 70 and the report showed
only the three strongest upcoming windows, so a chart could read as “covered
only till 56” even though later windows existed. Every Dasha horizon now
assumes an 80-year average lifespan, and each event prints its lifetime span.

| Area | 2.11.0 behaviour |
| --- | --- |
| Wealth & business band | Scanned across ages **21–75** (was 21–70); career runs to 70, property to 75, abroad to 60, marriage to 45. Pack v2.9.0. |
| Dasha horizons | Mahadasha ladder, event scan and late-window scan are guaranteed inside an **80-year** coverage window; once a band closes, late significator windows are scanned till age 80 (or 15 years ahead, whichever reaches further). |
| Event display | Five detailed upcoming windows per event (was three), three late windows once a band closes (was two), plus a printed **Lifetime coverage** line per event naming the total windows in band and the furthest one. |

## What changed in 2.10.0

Two practitioner refinements: one makes the prescription survivable in a real
week, the other states the frame before the reader meets any claim.

| Area | 2.10.0 behaviour |
| --- | --- |
| **Scaled Sadhana depth (new)** | The intake form now asks for the consultee's *lifestyle bandwidth* — **Beginner · Minimalist / Corporate**, **Intermediate · Practitioner / Sadhak** and **Classical · Full Sadhana**. The choice is stored as `profile.sadhana` and sizes the daily practice: the japa dose (`11×` / `27×` / `108×`), whether a dedicated mala is used, breathwork minutes (5 / 10 / 20), the aushadhi snan form, the charity cadence (monthly / weekly power-day) and the decluttering cadence. The Practitioner / Sadhak `27×` quarter-mala dose is the default, so a chart that never touches the control keeps the prescription it has always received. |
| **The scale sizes the practice — nothing else** | It never re-sources the Lo Shu remedy target, never re-orders the triage tiers and never overrides a clinical guardrail: a held japa stays held (the scale card says the dose resumes when the target activates), the Moon-cold warm form, the dosha × planet mild form, the solar-load moderation and the under-18 gem deferral all still cap the dose. Classical depth carries an explicit “clear it with a licensed healthcare professional first” line that points back at the upfront notice, and an under-18 chart is routed to guardian supervision with no breath-retention holds. Smoke assertions pin the 11× / 27× / 108× doses, the identical target and tier at every depth, and the guardrails surviving the strongest setting. |
| **Upfront Ethical & Health Notice (new)** | A bordered notice now opens the **Northstar Summary** — the report's page-2 summary card, before the story and the remedy cards: *“Ethical & Health Notice: Numerology, Vedic Dasha timelines, and elemental tattva suggestions are traditional interpretive frameworks for personal reflection and lifestyle harmonization. They do not constitute medical, psychological, legal, or financial diagnoses. Always consult a licensed healthcare professional before initiating new dietary fasts, herbal routines, or intense breathwork regimens.”* It carries `data-authority="framework-note"` (never remedy authority), is localised EN/HI/GU, and is pinned in print as an unbreakable bordered block. It is placed *inside* the summary rather than as a forced page break on purpose: the summary deliberately flows across the page break, and forcing a break reintroduces the near-blank page 1 that the print stylesheet exists to prevent. |
| **Localised practice counts** | Japa counts in the report are rendered in Devanagari (`११ / २७ / १०८`) and Gujarati (`૧૧ / ૨૭ / ૧૦૮`) numerals for Hindi and Gujarati readers, instead of ASCII digits inside localised prose. |

## What changed in 2.9.0

Three framing and delivery fixes, prompted by an independent senior-numerologist
review. Two of them are correctness fixes, not cosmetics.

| Area | 2.9.0 behaviour |
| --- | --- |
| **Classical Vimshottari layer (new)** | A genuine nakshatra-anchored Vimshottari stack now ships alongside the Ank Jyotish roadmap. It is anchored on the natal Moon's nakshatra, uses the fixed 120-year lord durations (Ketu 7, Venus 20, Sun 6, Moon 10, Mars 7, Rahu 18, Jupiter 16, Saturn 19, Mercury 17), and deducts the traversed fraction of the birth nakshatra from the starting lord's balance. Antardasha and Pratyantar subdivide the parent span by the 120-year weights (`MD × AD ÷ 120`). It carries its own `data-authority="vimshottari"` and **never** feeds Lo Shu remedies, Vastu zones or the Ank Jyotish event windows. Requires Vedic Tier 2 (exact birth time + recognised birthplace); without it the card explains the requirement rather than guessing. |
| **The two clocks are allowed to disagree — by design** | For the audit chart (05-08-1976, 20:15, Faridabad) the Ank Jyotish clock reads **Venus MD** while the true Vimshottari stack reads **Mars MD**. Both are now shown side by side, with a `data-vimshottari-agrees` flag and a comparison note. This is the honest answer: they are different traditions from different anchors, and neither overrides the other. |
| **“Vimshottari-derived” claim removed (correctness fix)** | The Dasha card still said *“We use the classical Vimshottari-derived proportional cycle”* after the 2.8.3 relabel — a direct contradiction of the new non-Vimshottari disclosure, and exactly the over-claim the relabel was meant to remove. The note now states plainly that the proportional clock is **not** Vimshottari and points to the separate classical card. A smoke assertion pins that the phrase never returns. |
| **Friendship-matrix override documented (correctness fix)** | `getDashaRelationship()` has always applied a hard-coded hostile-pair list (Grahan axis, Sun–Saturn, Mars–Saturn, Jupiter–Venus) that overrides part of the pack's `friendship` matrix. That boundary is now declared in the pack schema as `x-classicalSafetyPairs` with a “cannot be removed” description, and a smoke assertion keeps the documented pairs and the enforced pairs in sync. Pack policy remains **additive only** — it can add hostility, never remove it. |
| **Authority lint widened** | The smoke suite now asserts every `data-authority` value comes from a declared vocabulary, that every remedy-bearing block nests inside Lo Shu authority, and that no Vedic-authority scope carries a remedy obligation. This caught a real leak: the Dasha-selected Vastu zone card was inheriting the `dasha` scope with no authority marker of its own. It now declares `data-authority="dasha-vastu-zone"`. |
| **Packaging** | MIT `LICENSE` added. CI added (`.github/workflows/ci.yml`) running `npm ci && npm run check` on every PR plus a visual-regression job. `CONTRIBUTING.md`, `CODEOWNERS` and a PR template establish the practitioner content-review gate. PWA manifest + service worker + generated icon set make the app installable and genuinely offline. |
| **Field read mode** | A phone-first reading mode for consultations away from a desk: larger type, single column, reduced clutter, sticky actions. Purely a presentation switch — it changes no engine output and is neutralised in print so the A4 sheet is identical either way. |

### Reading the two Dasha traditions together

For a professional consultation, use them as a Jyotishi and an Ank Jyotishi
would each report from their own shastra:

| | Ank Jyotish Dasha | Classical Vimshottari |
| --- | --- | --- |
| Anchor | Moolank (birth day number) | Natal Moon's nakshatra |
| Cycle | 45 years (1+2+…+9) | 120 years, fixed |
| Mahadasha length | The number itself | Fixed lord years |
| Sub-period | `MD × AD ÷ 45` | `MD × AD ÷ 120` |
| Needs birth time | No (refines boundaries) | **Yes** (Tier 2) |
| Remedies | Owns Lo Shu remedy timing | **Never** — timing read-out only |

## What changed in 2.8.2

Clinical contraindications — additive, clearly-labelled guardrails on top of
the canonical kits (no data-pack change, engines untouched):

| Area | 2.8.2 behaviour |
| --- | --- |
| Moon-cold guardrail (Number 2) | Charts carrying a cold/respiratory sensitivity signal (Vata baseline, Mercury-5 driver, Health focus, or a declared *Allergies / Respiratory / Cold* tag) get a `moon-cold` banner at the head of the Moon kit: raw Moon Beej japa, Monday cold fasts, Pearl/Moonstone and cold or refrigerated milk are paused, with Lord Shiva (Chandrashekhara) japa, lukewarm silver-vessel water and *Nadi Shodhana* substituted. The banner carries a `potential` / `declared` level and reason codes. |
| Dosha × planet overlay (Numbers 1, 3–9) | Each planetary kit checks the constitution against the planet's thermal/kinetic quality (e.g. Sun, Mars and Ketu against Pitta or a declared *Acidity / Inflammation / Heat* tag). Flagged kits render a `dosha-contra` banner with a mild-form instruction (brief sunrise arghya only, morning-only Hanuman practice, no noon heat or over-fasting) while the canonical mantra row stays intact. |
| Health focus and triage | The Health focus section and the Remedy Triage card carry the same guardrails, so the acute japa target is never prescribed without its caution. |
| Cockpit | Both guardrails surface as one-line facts in the practitioner core cell; localised to Hindi and Gujarati. |
| Manifest | `knowledge-pack/latest.json` gains an `appVersion` field (`2.8.2`); `latestVersion` stays `2.8.0` because the knowledge data itself is unchanged. |

## What changed in 2.8.1

Clinical safety overlays — additive, clearly-labelled notes on top of the
canonical kits (no data-pack change, engines untouched):

| Area | 2.8.1 behaviour |
| --- | --- |
| Solar-load moderation | When digit 1 repeats 3+ times against a Pitta constitution, the Ayurvedic baseline carries a practitioner note tempering *Surya arghya* to a brief, calm sunrise offering, the Section 3 channeling card adds a “Cool the surplus” line, and the Section 4A Agni card directs the reader to its mildest form (skip *Surya Bhedana* / midday solar activation; let the Emotional plane’s *Chandra Bhedana* and evening grounding carry the cooling). |
| Under-18 gem guardrail | Profiles compute a completed-years age signal. Under 18, the heavy Saturn/Rahu/Ketu gems (Blue Sapphire/Neelam, Hessonite/Gomed, Cat’s Eye/Lehsunia) are deferred in the remedy kits (“gentle substitute first”), the Crystal Companion Guide swaps those picks to Amethyst / Smoky Quartz / Tiger’s Eye, and parent-facing notes route the remedy to the Section 4A Tattva lifestyle anchors and mild organic stones. |
| Student lens on hostile Dasha stacks | A minor chart running a mutual-enemy MD × AD (e.g. Saturn × Mars) gets an age-aware note in the Annual Transit × Dasha synthesis: authority-versus-independence framing, small reversible steps through academic transitions, and the sub-period closure date. |
| Daily Core Ritual ↔ Triage binding | The 40-day plan's Daily Core Ritual now resolves through `resolvePracticeTargets()`: when a missing Lo Shu number is live in the Dasha stack / Personal Year, the **acute Tier-1 number** leads the sunrise japa (the stack only re-orders Lo Shu missing numbers — it never imports an outside target); when nothing missing is live, japa is held and the ritual states so instead of contradicting the triage card beside it. A 🎯 “Triage sync” row inside the ritual card states the binding, and the Northstar summary's first move follows the same resolved number. |
| Cockpit | The practitioner sheet shows the consultee’s age and surfaces both guardrails as compact facts. |

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
- a **Scaled Sadhana** depth (Beginner / Intermediate / Classical) chosen at
  intake that sizes the daily japa dose, mala, breathwork, aushadhi snan and
  charity cadence without moving the remedy target;
- a Lo Shu-led 40-day activation tracker;
- an **upfront Ethical & Health Notice** inside the Northstar Summary, stating
  what the frameworks are and are not before any remedy copy;
- a Scaled Sadhana card in the 40-day plan that prints the chosen depth and its
  guardrail limits alongside the ritual and the Remedy Triage card.
- an **Advanced Vedic Comparison** for the Vedic birth grid only (expanded so it prints), with one interpretive card per Vedic plane;
- **4A Vedic Plane Harmonization — Elemental Tattva Balancing**: physical, breathwork and herbal anchors for Vedic planes that are Partly Active or Deficient (complete planes are omitted).

The Name and Combined grids use the same Lo Shu coordinates as the Birth Grid.
They do **not** create Vedic Name or Vedic Combined grids.

### Timeline · Ank Jyotish Dasha

This is a proportional numerology (Ank Jyotish) clock seeded from Moolank:
Mahadasha lengths equal the number and sub-periods are proportional on a
45-year cycle. It is intentionally **not classical Vimshottari Dasha** and
does not claim nakshatra-anchored Vimshottari timing.

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
  crystals, or another 40-day checklist;
- Section 4A may add breath, herbal-bath, aroma, water and sunlight anchors for
  those same planes when they are not fully active — never fasts, rings,
  crystals or a second mantra/mandala stack.

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
| Chandra-bala (Moon pairing) | Both natal sidereal Moons, computed from birth time + place on each side | Driver/Conductor numbers, Lo Shu remedies, Dasha timing — and it prescribes nothing in return |
| Tara Bala (Nakshatra-level Moon pairing) | Both natal Moon **nakshatras** (Tier 2 on each side) — inclusive count both ways, remainder on division by 9 | Any 36-point Ashtakoota score, remedies, muhurthas — reported with its own working and traditional classification only |
| Partner Vimshottari (partner's own Dasha) | The partner's natal sidereal Moon, via the same `vimshottariTimeline()` engine and fixed 120-year lord durations | The Chandra-bala verdict, Driver/Conductor comparison, Lo Shu remedies, Vastu zones and the Ank Jyotish roadmap — a timing read-out of the partner's chart only |
| Practice depth (Scaled Sadhana) | Client intake choice | The Lo Shu remedy target, the triage tiers, Dasha/Vastu timing, and every clinical guardrail — a scale sizes the practice, it never selects or re-sources a remedy |
| Kua directions | Feng Shui | Classical Vastu / Dasha guidance |

Compatibility uses the four Driver/Conductor pairings to make mutual strengths,
watch points, potential blind spots and communication cues explicit. It is a
relationship reflection only: it never adds crystals, Rudraksha, affirmations,
lifestyle obligations, partner-side remedy kits or a second 40-day plan.

### Chandra-bala — progressive precision on the partner intake

Section 18 carries a Moon layer with exactly two states, chosen by what the
intake actually holds. The same Tier 1 / Tier 2 idiom that governs your own
chart governs the partner's.

- **Tier 1 (partner date of birth only).** The report shows the Driver /
  Conductor comparison and prints, in plain words, *“Chandra-bala not computed —
  add partner birth time and location”*, naming which side is missing. The Moon
  moves roughly 13°20′ a day — one whole Nakshatra — so a Moon Rashi, a
  Nakshatra pada or a Chandra-bala verdict is **not derivable from a date**. A
  birth near a rashi or nakshatra boundary would be silently wrong.
- **Tier 2 (partner birth time + birthplace).** The partner's sidereal Moon is
  computed by the same on-device Meeus engine, against the same offline atlas,
  and the mutual Rashi axis is reported: 1/1 *Ekarashi*, 2/12 *Dwidwadasha*,
  3/11, 4/10, 5/9 *Navapanchama*, 6/8 *Shadashtaka* or 7/7 *Samasaptaka*.

No intermediate state exists. The engine never substitutes a noon birth, a
default city or an "approximate" Moon — `chandraBala()` returns
`{ tier: 1, chandraBalaComputed: false, message }` instead, and `smoke.test.js`
fails if a default is ever introduced.

The layer is deliberately **not** a 36-point Ashtakoota score: Gana, Nadi, Yoni
and Graha Maitri are not computed and are not implied. Where both Moon signs
share a rashi lord — the classical cancellation of Shadashtaka / Dwidwadasha —
the app reports that as a fact of the chart rather than applying it as a score,
because schools differ on its scope. Chandra-bala prescribes nothing: no remedy,
no muhurtha, no Vastu zone.

#### Tara Bala — the Nakshatra-level layer

Once both natal Moons are computable, the Chandra-bala card carries a deeper,
**Nakshatra-level** read-out beneath the Rashi axis: the classical Tara count.
It is counted in nakshatras (so it needs Tier 2 on *both* sides, not just the
partner), inclusive of both ends, in both directions, and each count is divided
by 9 — remainders **3, 5 and 7** are traditionally inauspicious, every other
remainder (1, 2, 4, 6, 8, 9 — with 0 read as 9) traditionally auspicious. Both
directions auspicious is the favourable reading, one each way is mixed, both
inauspicious is the caution reading. The card prints the actual working — both
counts, both remainders, and the traditional classification of each — rather
than a bare label.

Moons that share one nakshatra give the count 1 in both directions (Janma
Tara); because schools differ on how they read that case, the card flags it as
a fact of the charts rather than a fixed verdict. Like the Rashi axis above it,
Tara Bala is reported with its working, **never folded into a 36-point score**,
and prescribes nothing. `taraBala()` returns
`{ computed: false, missing, message }` when either nakshatra is absent, and
`smoke.test.js` pins the inclusive counting, the 3/5/7 rule, the Janma case,
the two worked examples from the references (14→5 inauspicious / 15→6
auspicious) and the degradation contract.

#### Partner Astro-Identity Snapshot

When the partner chart reaches Tier 2, Section 18 adds a compact companion card
directly beneath the verdict: a four-row side-by-side of **Sun (Surya Rashi)**,
**Moon (Chandra Rashi)**, **Nakshatra with pada** and **Lagna** for both people,
with the two Moon rows tinted because they are what the axis is derived from.
Its purpose is verification — a practitioner can check the Chandra-bala verdict
against the actual longitudes instead of trusting it.

It is **positions only**: no second verdict, no Ashtakoota points, no remedy,
asserted by test. The card is also where the two charts can degrade
independently — if the *primary* chart is Tier 1, its Moon, Nakshatra and Lagna
cells read *“not computed — add your birth time & place”* rather than rendering
blank, which would misread as "no planet there". There is no Tier 1 variant of
the card itself: a Sun-only partner column would invite exactly the eyeball
comparison of Moon positions that a date alone cannot support.

#### Partner Vimshottari anchor

When the partner chart reaches Tier 2, Section 18 adds a second companion card
beneath the snapshot: the partner's **own** classical Vimshottari stack. It is
the same `vimshottariTimeline()` engine as the primary chart's card — anchored
on the partner's natal Moon nakshatra, the fixed 120-year lord durations, and a
balance deducted for the traversed nakshatra fraction — with no second engine
and no rescaled lords, so the two read-outs can never silently diverge in
method.

It shows the partner's **anchor** (nakshatra, pada, lord, Moon sign/degree,
span, % elapsed), the **balance of the birth lord at birth**, and the
**active Mahadasha / Antardasha / Pratyantar** with dates and ages. A final
line lines the two active stacks up as a *fact* — same Mahadasha lord, or
different — mirroring the shared-rashi-lord idiom: the comparison is reported,
never scored. If the *primary* chart is Tier 1 the card still shows the
partner's stack (a fact of the partner's chart) but withholds the comparison
rather than half-computing it.

It is a **timing read-out of the partner's chart only**: it never feeds the
Chandra-bala verdict, Lo Shu remedies, Vastu zones or the Ank Jyotish event
windows, and it prescribes nothing. It carries `data-authority="vimshottari"`
so the authority lint covers it, and `smoke.test.js` pins the anchor, the
balance arithmetic and the degradation contract.

The Driver/Conductor power-day card is a scheduling reference. It does not pick
or replace a Lo Shu remedy target. The Kua card is visibly labelled **Feng
Shui (Chinese)** and remains separate from the Ank Jyotish Dasha/Vastu direction map.

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

Birthplace matching is offline-first. The default India atlas (`atlas/atlas-in.js`,
~7,000 towns from GeoNames cities500) plus the curated world-city list in
`astro.js` never leave the device. Matching is three-tier: packed offline
lookup, then a nearby district within 25 km (Lagna shift under 0.1°) when
coordinates are known, then an optional Photon lookup
(`https://photon.komoot.io/api/?q=`) only when you click **Look up online**.
Only the typed place name is sent, and only that city string is cached in
`localStorage` — never coordinates or the chart. Gulf (`atlas-gcc.js`) and extra
world (`atlas-world.js`, pop ≥ 100k) chunks stay lazy-loaded. Rebuild with
`npm run atlas:build` (falls back to local GeoNames dumps when
`download.geonames.org` is blocked). Packed rows stay well under 250 KB for the
default India chunk.

The public knowledge pack is separate from personal data:

1. `data.js` supplies bundled schema-v2 content for instant/offline use.
2. A newer public JSON pack can be read from `knowledge-pack/latest.json`.
3. A pack is validated before it is cached or used.
4. An older/single-grid pack is rejected rather than mixed into the hybrid UI.

Release 2.13.0 ships `knowledge-pack/packs/2.9.0.json`, generated from the
bundled pack (pack data unchanged since 2.9.0 — app logic only in 2.10.0–2.13.0).
The schema requires canonical `loShuGrid` and `vedicGrid` configuration as well
as the Dasha/Vastu mappings.

## Tech stack and project layout

- Vanilla JavaScript (`app.js`) with a bundled curated knowledge pack (`data.js`)
- Browser-local Vedic ephemeris (`astro.js`) plus compact regional place atlases (`atlas/`)
- Plain CSS with responsive and print rules (`styles.css`)
- Vite for development and static serving
- jsdom for deterministic engine/report smoke coverage
- Playwright/Chromium for browser, mobile-navigation and print checks

```text
numerovastu-360/
├── index.html                         # App shell and intake form
├── app.js                             # Engines, renderers, routing and local state
├── astro.js                           # Browser-local Vedic astronomy helpers
├── atlas/
│   ├── atlas-in.js                    # Default India towns (compact packed rows)
│   ├── atlas-gcc.js                   # Optional Gulf cities (lazy)
│   └── atlas-world.js                 # Optional world cities pop ≥ 100k (lazy)
├── data.js                            # Bundled schema-v2 knowledge pack
├── i18n.js                            # English, Hindi and Gujarati labels
├── styles.css                         # Responsive and print presentation
├── smoke.test.js                      # Hybrid engine and jsdom regression suite
├── tests/visual/                      # Browser/mobile/print Playwright coverage
├── knowledge-pack/
│   ├── schema.json                    # Schema-v2 contract
│   ├── latest.json                    # Current manifest
│   └── packs/2.9.0.json               # Release JSON pack
├── scripts/build-atlas.mjs            # GeoNames → compact atlas chunks
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
npm run atlas:build      # Rebuild compact India / Gulf / world place chunks
npm run audit            # Dependency audit
npm run build            # Rebuilds static dist/ from root sources
npm run check            # test + audit + build

# Browser checks (Chromium required once)
npm run browsers:install
npm run test:visual          # compare against committed baselines (read-only)
npm run test:visual:update   # regenerate baselines after an intentional layout change
```

The smoke suite checks both grid engines, Lo Shu Name/Combined coordinate
mapping, Dasha/Vastu independence, authority boundaries, schema/pack validity,
multilingual labels, accessible tab/hash behavior, and mobile/print CSS hooks.
The Playwright suite verifies the same report behavior in a real browser,
including mobile Timeline navigation and print expansion. Three element-scoped
pixel tests additionally pin the Lo Shu square, the Vimshottari card and the
single-page A4 cockpit — guarantees that cannot be expressed as computed styles.
Those baselines are generated on the CI image: a baseline rendered by a
different Chromium build or font stack diffs against CI, so treat
`npm run test:visual:update` as a deliberate, reviewed act rather than a fixup.

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

MIT — see [LICENSE](LICENSE), which covers the source and the knowledge-pack
content (with a scope note for the Meeus/`astronomia` portions of `astro.js`).
Contact the repository owner
([`RRWalia/numerovastu-360`](https://github.com/RRWalia/numerovastu-360)) before
reusing or redistributing the project.

