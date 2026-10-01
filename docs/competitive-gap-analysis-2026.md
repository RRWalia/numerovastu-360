# NumeroVastu 360 — Competitive Gap Analysis & Remediation

**Question asked:** *"How are others ahead of us — find and fix the gaps."*
**Baseline:** Release **2.15.0** (commit `09e68a1`)
**Shipped in:** Release **2.16.0**
**Date:** 2026-10-01
**Method:** Feature-by-feature teardown of the Indian numerology hubs, the Western/global
numerology apps and the professional Vastu suites, scored against a full 2.15.0 report run on the
reference chart (Randeep Walia, 05-08-1976, 20:15 IST). Everything marked *Closed* in this document
is implemented in this repository, pinned by `smoke.test.js`, and passes `npm run check`.

---

## 1. Executive summary

NumeroVastu 360 was **not** behind on rigour. Against every competitor surveyed it is ahead on the
things that are hard to fake: a real Meeus ephemeris instead of lookup tables, enforced authority
boundaries between Lo Shu / Ank Jyotish / Vimshottari, clinical guardrails on remedies, trilingual
output, and a full offline PWA with no server round-trip. No rival ships a `data-authority`
discipline or anything like it.

It was behind on **surface area and cadence** — the everyday features a buyer sees in a store
listing and uses weekly:

| Gap class | Where rivals were ahead | Status |
|---|---|---|
| Name decomposition | Soul Urge / Personality split, per-letter values | **Closed** — §6A |
| Personal timing cadence | Personal Day/Month, calendars, favourable dates | **Closed** — §13a |
| Premises numerology | House / flat / plot / office number scoring | **Closed** — §8A |
| Panchang depth | Tithi, nakshatra, yoga, karana, Choghadiya, Abhijit | **Closed** — §13b |
| Western cross-reference | Life Path, Karmic Lessons, Planes of Expression | **Closed** — §17A (optional) |
| Vastu zone resolution | 16/32 zones, 45-devta mandala, Marma | Deferred — §5 |
| Floor-plan tooling | Import, grid overlay, printable plan | Deferred — §5 |
| Notifications / daily hooks | Push, widgets, streaks, mood journal | Deferred — §5 |
| Angel numbers, AI coach, tone selection | 2026 novelty features | Deferred — §5 |

A **P0 shipping defect** surfaced during the audit and is also fixed: `muhurtha.js` was loaded by
`index.html` but was in neither the static build manifest nor the service-worker precache list, so
the production bundle 404'd on it and an installed PWA silently lost the entire Muhurtha section
offline — the exact scenario offline mode exists for.

---

## 2. What the competition actually ships

### 2.1 Indian numerology hubs — *AstroTalk, Dinesh Atrish, PanchangBodh, AstroVed, GaneshaSpeaks*

Breadth is the play. AstroTalk alone fronts roughly twenty-five calculators (Lo Shu Grid, Mulank,
Destiny, Dasha, Nakshatra, Mangal Dosha, Sade Sati, Kaal Sarp, Ishta Devata, Transit, Vehicle,
Mobile, FLAMES, Age). Dinesh Atrish runs a combined Numerology + Astrology mode scoring a number
against the ruling planet of every kundli position, plus a baby-name calculator. PanchangBodh scores
vehicle plates against Mulank and Bhagyank. AstroVed and GaneshaSpeaks monetise at ₹850 per chart
report, ₹1,499 for a remedial package and ₹499/month subscriptions, with month-by-month yearly
forecasts and yantra/puja remedies.

**Where they were ahead of us:** *house and office number numerology*, offered by essentially every
hub and asked for by essentially every walk-in client, and **both** Chaldean and Pythagorean name
systems side by side.

**Where we were already ahead:** our vehicle and mobile scoring is relationship-based against the
actual Maitri chart rather than a flat "lucky total" lookup; our Dasha is a real proportional clock
with dates; our remedies carry clinical guardrails theirs do not have.

### 2.2 Global numerology apps — *Numerologist (mirofox), Mistic, SoulChart, Numerology (iOS)*

These are weekly-habit products. The common inventory is a full Pythagorean chart (Life Path,
Expression, Soul Urge, Personality, Attitude, Day-of-Birth, Maturity), master numbers 11/22/33,
karmic debt, **Personal Day + Month + Year forecasts**, and a **Personal Numerology Calendar**.
Mistic adds **favourable-date finders for specific events** — wedding, business launch. SoulChart
pushes a **daily personal-day notification**, transit alerts, a mood journal correlated with the
personal-day number, and streaks. The iOS *Numerology* app offers **selectable reading styles**, a
home-screen widget and forecast notifications. The 2026 round-ups add an **AI reading coach** that
cross-references numerology with the natal chart and a **28+ entry angel-number library**, sold at
about $9.99/month.

**Where they were ahead of us:** the entire *cadence* layer. We produced one magnificent report and
then went quiet. There was no reason to open the app on a Tuesday.

### 2.3 Professional Vastu suites — *Applied Vastu Compass, Reyansh Vastu Software (₹5,500/yr)*

**16 and 32-zone grids**, the **45-devta Mandala**, GPS compass, **floor-plan capture and
gridding**, 16-zone and 45-devta bar charts, Astro-Vastu / Numero-Vastu / Lal Kitab / Ayadi /
**Marma Sthan** remedies, and printable plan-overlaid reports.

**Where they are ahead of us:** zone resolution and plan tooling. We read 8 directions; they read
32 zones and name the devta in each. This is the one genuinely large remaining gap and it is
deliberately deferred — see §5.

---

## 3. Gaps closed in 2.16.0

Every item below is implemented, rendered in all three languages, and pinned by smoke assertions.
None of them touches `data.js` or `knowledge-pack/packs/*.json`, so the pack stays at **2.10.0** and
the `CONTRIBUTING.md` practitioner sign-off gate for remedy/dosha/deity content was not triggered.
All five new surfaces are **reading surfaces**: the smoke suite asserts that each contains zero
`[data-remedy-authority]` nodes, so none of them can ever quietly become a prescription.

### 3.1 §6A — Name Architecture `data-authority="name-architecture"`

The report gave a single Chaldean name total. Every competitor splits the name.

Now: vowels → **Soul Urge**, consonants → **Personality**, both → **Expression**, with the
arithmetic identity `Soul Urge + Personality = Expression` pinned as an invariant. Adds
**Cornerstone** (first letter), **Capstone** (last letter) and **First Vowel**, plus a per-letter
chip strip showing each letter's Chaldean value, colour-split vowel from consonant, so a client can
audit the total by eye.

Two decisions worth recording:

- **It stays Chaldean.** The house system is Chaldean and §6A re-uses `chaldeanValue`'s exact
  arithmetic, so the Expression printed in §6A is byte-identical to the Name Number in §6. A smoke
  assertion pins that equality. Pythagorean is available but quarantined in §17A (see §3.5).
- **It re-states the existing correction candidates rather than generating new ones.** The
  architecture table reads from `nameSuggestions()`, the same function §6 uses. A smoke assertion
  pins the row count against it, so the two sections can never offer a client different spellings.

The `legal-architecture` layer renders only when a separate legal name was supplied.

### 3.2 §8A — Premises Numerology `data-authority="premises-numerology"`

New optional intake: a house / flat / plot number plus what it is for (home, flat, plot, office,
shop, desk, bank account). Absent, nothing renders and every existing chart is byte-for-byte
unchanged.

The number is read in **two layers**, which is the detail the hubs get wrong by reading only one:

- **Door digits** — `A-402` → `402` → 6. The number you live *inside*.
- **Full token** — `A-402` with the block letter at Chaldean value. Your postal identity.

The operative reading is graded against both birth numbers into four tiers — *excellent*
(harmonious with Driver **and** Conductor), *supportive*, *neutral*, *hostile*. The hostile verdict
deliberately refuses the industry reflex of telling a client to move house; it offers up to four
**nameplate tuning** options (`402` → `402-A`, `402-B` …) with the resulting total and verdict for
each, and states that a nameplate changes nothing legal, nothing postal and nothing structural. A
closing card lists the door totals that suit this chart, for clients who are choosing rather than
rationalising.

### 3.3 §13a — Personal Cycles, Calendar and Favourable Dates `data-authority="personal-cycles"`

The largest gap, and the reason rival apps get opened on a Tuesday.

- **Personal Year / Month / Day**, each with its arithmetic shown (`20 + 8 + 1 → 2`). The Personal
  Year uses the same calendar-year convention §13 already uses, and a smoke assertion pins that the
  cycles card and the Dasha transit card print the *same* Personal Year — the two can never drift.
- **A graded month calendar.** Every day of the current month carries its Personal Day number and a
  four-tier colour grade; today is outlined. Grades come from a transparent weighted model: Personal
  Day against Driver (±3) and Conductor (±2), Personal Day equal to either (+2), date root against
  Driver (+1/−2), the weekday's planetary lord against Driver (±2).
- **A 90-day favourable-date finder**, covering exactly the five life events the knowledge pack
  already defines for the Dasha windows — marriage, abroad, career, property, wealth — using the
  pack's own primary/support significators (+3/+1), so §13a and §14 cannot contradict each other on
  doctrine. A smoke assertion pins the purpose list against `DB.dasha.lifeEvents`.
- **Every recommended date shows its full scoring trail** as a tooltip, in the client's language,
  line by line with points. No unexplained oracle dates.

**Doctrinal guard:** the finder states plainly that a good date is not yet a good hour and that it
does not outrank classical Muhurtha — once a date is chosen, the client is sent to §13b to place the
act inside Abhijit or a Shubh / Amrit / Labh Choghadiya, outside Rahu Kaal and outside Vishti.

### 3.4 §13b — Panchang depth

The Muhurtha section computed sunrise, sunset and Rahu Kaal, then stopped. Indian users expect the
five limbs.

All five now render, each **with the time it ends** — a tithi reported without its boundary is the
most common error in consumer Panchang output, because the Moon moves ~13° a day and "today's tithi"
is false for part of today:

| Limb | Derivation | Flags surfaced |
|---|---|---|
| Tithi | (Moon − Sun) / 12° | Paksha, Nanda/Bhadra/Jaya/Rikta/Purna group, **Rikta** warning |
| Nakshatra | sidereal Moon / 13°20′ | **Pada** (1–4), ruling lord |
| Yoga | (Moon + Sun, sidereal) / 13°20′ | the nine cautioned yogas |
| Karana | elongation / 6° | **Vishti (Bhadra)** warning |
| Vara | sunrise-to-sunrise weekday | planetary lord number |

Plus the **eight daytime Choghadiya** on the standard weekday cycle, each graded auspicious /
neutral / inauspicious, and **Abhijit Muhurta** — the 8th of 15 equal day parts — with its classical
**Wednesday exclusion**, which the smoke suite verifies on a real Wednesday and a real Thursday.

Boundary times come from a bisection solve on the same ephemeris, not from a printed almanac, and
the section says so. If the lunar engine is unavailable the block renders nothing rather than
guessing.

### 3.5 §17A — Optional Western cross-reference `data-authority="western-cross-reference"`

Clients arrive having read a Western site and ask for "their Life Path and Soul Urge". Silence was
not an honest answer; neither was quietly mixing schools.

So this is built as a **cordoned optional module**, structurally identical to the Feng Shui / Kua
treatment: a collapsed `<details>`, labelled as a different school, and forbidden by the authority
tests from choosing a remedy, crystal, deity, Vastu zone or Dasha. Print CSS force-expands it so it
still reaches the PDF.

It reports the Decoz inventory — Life Path, Expression, Soul Urge, Personality, Maturity, Balance,
Rational Thought, Hidden Passion, Karmic Lessons, Subconscious Self (9 − karmic lesson count) and
the four **Planes of Expression** — and states explicitly whether it **agrees** or **differs** with
the Vedic reading. On the reference chart it agrees: Western Life Path 9 = our Conductor 9.

> **Sourcing note on the Planes of Expression.** Four independent sources agree on the Decoz grid
> (columns being creative / vacillating / grounded: Physical `E` / `W` / `D,M`; Mental `A` /
> `H,J,N,P` / `G,L`; Emotional `I,O,R,Z` / `B,S,T,X` / none; Intuitive `K` / `F,Q,U,Y` / `C,V`), covering all 26 letters exactly once, classified by letter *character* not
> by numeric value — E, N and W all total 5 but sit on three different planes. A fifth source gave a
> conflicting table and was rejected as a minority variant. A smoke assertion pins the 26-letter
> partition.

### 3.6 P0 — the build and offline shipping defect

`index.html` loaded `muhurtha.js`; `scripts/build-static.cjs` did not copy it and `sw.js` did not
precache it. Production 404'd on it and installed PWAs lost the Muhurtha section offline.

Fixed, and made **unrepeatable**:

1. `muhurtha.js` and the new `insights.js` added to both the build manifest and the shell precache.
2. The static build now **regex-scans `index.html` for every non-HTTP `<script src>` and throws** if
   any is absent from `dist/`. Verified by removing a script from the manifest: the build fails with
   `index.html loads script(s) the build does not ship: insights.js`.
3. `smoke.test.js` now evaluates **the same script list the page loads**, in the same order. It
   previously omitted `muhurtha.js`, which is why an entire shipped engine was being asserted only
   in its degraded no-engine branch.
4. Three new assertions pin the invariant: page scripts ⊆ build manifest, page scripts ⊆ offline
   shell (precached or runtime-cached), and the guard itself must exist.

---

## 4. Architecture of the fix

New file **`insights.js`** (`window.NVInsights`, v1.0.0) — a pure, dependency-free calculation
engine with no DOM access and no knowledge of the report: letter values for both systems, name
architecture, karmic lessons, hidden passion, planes of expression, the Western profile, personal
cycles, date grading, the calendar, the favourable-date finder and premises numerology.

Three **drift guards** tie it to the engines already shipped, because the failure mode that matters
is two modules disagreeing in front of a paying client:

1. `NVInsights.CHALDEAN_FALLBACK` must deep-equal `DB.chaldean` — one letter table, not two.
2. `NVInsights.relation(a, b)` must equal `__NV.relation(a, b)` for all 81 ordered pairs — one
   friendship chart, not two.
3. The §6A Chaldean Expression must equal `p.nameNum`, and the §13a Personal Year must equal the
   Dasha transit card's Personal Year.

Panchang/Choghadiya/Abhijit live in **`muhurtha.js`** beside the existing sunrise solver, reusing
`NVAstro`'s lunar and solar longitudes.

**Test coverage:** the smoke suite grew from 453 to **497 assertions** (44 new), all passing, with
`npm audit` clean, the static build green and the source zip verified.

---

## 5. Deliberately deferred, with reasons

| Gap | Why not now |
|---|---|
| **16/32-zone Vastu grid, 45-devta Mandala, Marma Sthan** | The single largest remaining gap and the one competitors charge ₹5,500/year for. It is a content project, not a code project: 32 zones × 3 languages × remedy text, plus 45 devta attributions, every line of it inside the `CONTRIBUTING.md` practitioner sign-off gate. It needs a named practitioner and a sourcing pass, not an afternoon. **Recommended as the next release's single theme.** |
| **Floor-plan import and gridding** | Requires image upload, perspective correction and a drawing surface. It also breaks the product's strongest privacy claim — everything on-device, nothing uploaded — unless done entirely in-browser with Canvas. Worth doing, but it is a sub-project with its own threat model. |
| **Push notifications / daily personal-day alerts** | The PWA already has a service worker, so this is reachable. It needs a notification-permission UX, a quiet-hours policy and a decision about what a *daily* numerology nudge does to a client's agency — the opposite of this product's stated stance. A product decision before an engineering one. |
| **Angel-number library (28+ entries)** | Pure content, trivially addable, but it belongs to a different tradition again (New Age repeating-number symbolism). Adding it unlabelled would violate the no-hybrid rule the whole architecture is built on. If added, it must be a cordoned optional module like §17A. |
| **AI reading coach** | Requires a server and a model call. Breaks the on-device guarantee. Defer until there is a deliberate decision about that trade. |
| **Selectable tone of voice, dark mode, home-screen widget** | Real polish gaps. Tone selection means maintaining N copies of every string in 3 languages — a large content multiplier. Dark mode is a genuine quick win (the design-token layer already exists) and is the best candidate for a point release. |

---

## 6. Where we remain ahead

Worth stating, so the next audit does not trade these away for surface area:

- **One ephemeris, honestly computed.** Meeus/VSOP87 pinned to <0.02° in its own suite. Rivals ship
  lookup tables or call a paid API; we compute on-device and show the arithmetic.
- **Enforced authority boundaries.** `data-authority` plus the remedy-nesting assertions make it
  structurally impossible for a Vimshottari card or a Western plane to prescribe a remedy. No
  competitor surveyed has any equivalent, and most freely blend Lo Shu, Vedic and Feng Shui in one
  undifferentiated paragraph.
- **Clinical guardrails.** Moon-cold, dosha × planet, solar-overload moderation, under-18 gemstone
  deferral. Nobody else surveyed defers a gemstone for a minor.
- **Trilingual by construction**, not by machine translation at render time.
- **Offline-first, no account, no upload, no subscription.**
- **Reasoning is always shown.** Every new feature in this release follows the same rule: the
  calendar shows its weights, each favourable date shows its score trail, the Panchang names its
  method, and §17A names the school it is quoting.

---

## 7. Verification

```
npm run check
  ✓ node smoke.test.js            497 assertions, 0 failures
  ✓ npm audit --audit-level=moderate   0 vulnerabilities
  ✓ node scripts/build-static.cjs      dist/ ships every referenced script
  ✓ node scripts/package-source.mjs --check
```

Manually verified in addition: the build guard throws when a script is removed from the manifest;
Abhijit is excluded on Wednesday 2026-10-07 and present on Thursday 2026-10-08; the Panchang for
Delhi on 2026-10-01 returns sunrise 06:14 / sunset 18:07, Krishna Panchami ending 12:36, Rohini pada
1 ending 04:27, yoga Siddhi ending 21:17, karana Taitila ending 12:36, and Abhijit 11:47–12:34.

---

## 8. Addendum — second pass (2.17.0, 2026-10-01)

A follow-up review benchmarked the app against **Occult King**, **Pinnacle Vastu** and the same
class of commercial portal, and scored it ahead on privacy, clinical safety, epistemic honesty and
practitioner utility — and behind on **spatial tooling** and **daily retention**. That reading is
accurate, and it names three things §3 and §5 of this document had either shipped already or
deferred. Here is the disposition of every item.

### 8.1 "Should you add Panchang, Choghadiya and Abhijit?" — already shipped in 2.16.0

Shipped one release earlier: five limbs with bisection-solved end times, eight daytime Choghadiya,
Abhijit with its Wednesday exclusion, tagged `data-authority="panchang"` — the exact tag the review
recommended. What the review correctly identified as *still missing* is now closed:

| Requested | Disposition |
|---|---|
| Choghadiya **night** slots | **Closed.** The engine always computed sixteen; the report printed eight. All sixteen now render, night behind a disclosure that print force-expands. |
| **Yamaganda + Gulika** to complete the triad | **Closed.** Both cut from the same sunrise solve as Rahu Kaal — daylight ÷ 8, one fixed part per weekday. Slot tables cross-checked against five independent almanac sources and pinned in smoke for all seven weekdays. They never overlap, and each is exactly one eighth of *measured* daylight, so they move with latitude and season rather than assuming a 06:00 sunrise. |
| "Timing & horizon readout only" disclosure | **Closed.** A scope card now states in the client's own view — not only in markup — that the module does not alter Lo Shu void remedies, crystal assignments, deity selection or Vastu zone activations. It answers *when*, never *what*. |
| Tier-honesty badge | **Closed.** "Calculated for the local horizon at {City} — date and location only; no birth time required." |

Smoke additionally asserts that no remedy obligation can ever nest inside the Panchang scope.

### 8.2 Interactive 16-zone compass with degree input — **closed**, §16A

§5 deferred this as "a content project, not a code project". That was half right, and the half that
was wrong is now built. Splitting it properly:

- **Geometry is code.** A 0–360° bearing for the main entrance, kitchen burner, master bed and water
  source now resolves to a 22.5° zone (N centred on 0°, so N runs 348.75°–11.25°) **and** to the
  classical 45° sector — with the sector computed from *the same bearing*, not from the zone name.
  That distinction is the entire value: an N-N-E reading at 20° is governed by the North, and the
  same zone at 30° is governed by the North-East.
- **Doctrine is content.** No sixteenth remedy was invented. A dosh found by the compass is answered
  with the **shipped eight-direction remedy, verbatim** — smoke asserts the rendered text matches
  `DB.vastu.directions[sector].fix`. That is what keeps this out of the `CONTRIBUTING.md`
  practitioner gate, and it is also simply honest: the compass found the direction more precisely, it
  did not discover a new prescription.

Two honesty flags that no surveyed competitor ships, and which are the reason to prefer this to a
₹5,500/year suite:

1. **Boundary flag** — a reading within 2° of a zone edge is marked unreliable. A handheld compass is
   not accurate to a quarter of a degree, and a confident zone call at 33.6° is false precision.
2. **Sector-flip flag** — a reading within 2° of an 8-sector boundary warns that ordinary compass
   error would change *which classical direction governs the remedy*. This is the single most
   consequential thing a degree compass can tell a practitioner, and the commercial tools say
   nothing about it.

The section also instructs the client to take bearings against **true** north and names the Indian
magnetic declination (roughly 0°–3° east), because a phone compass reads magnetic.

Still deferred, and still correctly so: the **45-devta Mandala**, **Marma Sthan** and **floor-plan
import/gridding**. The first two are pure remedy doctrine behind the practitioner gate; the third
needs an in-browser drawing surface and must never upload a client's floor plan.

### 8.3 Mobile internal pairing analysis — **closed**, §7

The report scored only the total. It now also reads the number as a sequence: adjacent digit pairs,
digits absent from the string, over-weighted digits, and the longest hostility-free stretch.

Two rules kept this from becoming the thing the review warned against:

- **No invented pair table.** Each pair is classified by the *same one-way Moolank Maitri relation*
  the rest of the report uses, so every label traces to a row of the shipped friendship chart and can
  be argued with. Smoke pins each pair's classification against `__NV.relation`.
- **A pair containing 0 is reported as lordless**, not forced into a relation the system does not
  give it. Zero has no planetary ruler here, and saying so is more useful than inventing one.

### 8.4 What the review said to avoid — held

| Warned against | Held |
|---|---|
| Gemstone / remedy e-commerce bloat | No catalogue, no store, no affiliate link. The under-18 gemstone deferral and the held-japa guardrail remain the product's strongest professional signal. |
| Black-box "luck scores" (e.g. "74% lucky") | **Pinned by test.** A smoke assertion scans the whole rendered report and fails on any `N% lucky / auspicious / compatible` pattern or any "luck score". The digit-flow card reports a *count* of hostile adjacencies you can verify by eye against its own table. The date finder likewise prints its full scoring trail instead of a verdict number. |

### 8.5 Verification

```
npm run check
  ✓ node smoke.test.js            524 assertions, 0 failures
  ✓ npm audit --audit-level=moderate   0 vulnerabilities
  ✓ node scripts/build-static.cjs
  ✓ node scripts/package-source.mjs --check
```

New in this pass: the seven-weekday triad slot table, triad non-overlap and one-eighth-of-daylight
invariants, sixteen Choghadiya, the Panchang scope cordon and tier badge, the 16-zone 22.5° partition
over a full 360° sweep, the bearing-derived sector rule, both honesty flags, the compass reusing
shipped remedy text, the pair classification tying back to `__NV.relation`, and the no-luck-score
scan.

### 8.6 Honest scorecard after this pass

| Dimension | Where it stands |
|---|---|
| Privacy, clinical safety, epistemic honesty, practitioner utility | Ahead, unchanged, and not traded away for any of the above. |
| Daily timing tools | **Closed.** Full Panchang, sixteen Choghadiya, the complete day-division triad, Abhijit, a graded personal calendar and a favourable-date finder. |
| Spatial / Vastu depth | **Materially closed** at the 16-zone degree level, with better error disclosure than the paid suites. Still behind on 45-devta, Marma and floor-plan tooling — all gated on a practitioner, not on engineering. |
| Daily *retention* | Partly closed. The content to open the app daily now exists; the **hook** does not. Push notifications and a home-screen widget remain deferred as a product decision, because a daily nudge sits awkwardly against this product's stance on client agency. That is the honest remaining gap, and it is a choice rather than an omission. |
