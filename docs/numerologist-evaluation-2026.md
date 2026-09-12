# NumeroVastu 360 — Senior-Numerologist Evaluation

**Product evaluated:** NumeroVastu 360, Release **2.8.0** ("Lo Shu Foundation + Ank Jyotish Dasha Timeline")
**Re-evaluated at:** Release **2.9.0** (see §8 — the two caveats in §5 are now closed)
**Method:** Full-source review + live engine run on a real subject chart, cross-checked by hand (independent arithmetic).
**Audit subject:** **Randeep Walia** — born **05-08-1976**, **20:15 IST**, Faridabad, Haryana, India.
**Date of review:** 2026-09-07

---

## 1. Executive verdict

NumeroVastu 360 **stands up to professional scrutiny** better than most numerology tools in its class, for one structural reason: it is one of the few engines that *refuses to conflate its traditions*. It treats the **Lo Shu Foundation** (pattern/personality), the **Vedic-comparison grid**, and a **time-based Dasha** as three separately-owned, independently-verifiable layers, and it carries explicit `data-authority` boundaries so a remedy obligation can never be silently re-sourced by another module. That discipline is exactly what a senior practitioner looks for and what most consumer numerology apps get wrong.

Across the worked chart the core arithmetic I can check by hand is **accurate**: Moolank, Bhagyank, the Chaldean name total, Lo Shu and Vedic counts, Personal Years, Pinnacle/Challenge cycles, and the proportional Dasha dates all agree with independent recalculation. The astronomy layer is additionally pinned to VSOP87 constants in its own test suite (<0.02°), which is unusual rigour.

The verdict is therefore **conditionally sound**: methodology is internally consistent and defensible, but two professional caveats must be stated plainly before these reports are given to a client as "Vedic" guidance (Section 5). Neither is a math error; both are *framing* decisions that affect the report's claim to "Vedic" authority.

---

## 2. Worked-chart verification (05-08-1976)

| Item | Hand calculation | Engine | Result |
|---|---|---|---|
| Moolank / Driver | Birth day 5 → **5** | 5 | ✅ |
| Bhagyank / Conductor | 5+8+1976 = 1989 → 1+9+8+9=27 → **9** | 9 | ✅ |
| Name (Randeep Walia) | R2+A1+N5+D4+E5+E5+P8 / W6+A1+L3+I1+A1 → 30+12=**42** → 6 | 42 → 6 | ✅ (Chaldean table correct) |
| Karmic debt scan | day 5, DOB sum 36, name 42 — none in {13,14,16,19} | none | ✅ |
| Lo Shu counts | 05-08-1976 → 5,8,1,9,7,6 + Driver 5 + Conductor 9 → 5×2, 9×2, 1/6/7/8×1; **missing 2,3,4** | matches | ✅ |
| Vedic (Ank) counts | century dropped, day de-duplicated → 8,7,6,5,9 single; **missing 1,2,3,4** | matches | ✅ |
| Sun | Tropical Leo 13°17′ ⇄ Sidereal **Cancer 19°45′** (Lahiri) | Cancer | ✅ |
| Moon | **Scorpio / Jyeshtha, pada 3** (lord Mercury) | matches | ✅ |
| Lagna | **Aquarius 12°26′** (ascendant at 20:15 Faridabad) | Aquarius | ✅ |
| MC | Scorpio 20°39′ | Scorpio | ✅ |
| Personal Year 2026 | 5+8+(2026→1) = 14 → **5** | 5 | ✅ |
| Current Mahadasha | Moolank 5 → cycle 5..4 over 45y → at age 50 MD = **6 (Venus), ages 50–56 (2026–2032)** | 6 | ✅ |
| Antardasha | MD6 × AD6 ÷ 45 = 0.8 y; first AD = **Venus** | 6 | ✅ |
| Missing-number practice focus | **2 (primary), 3 (secondary)** | matches | ✅ |

The Lagna/Moon/Jyeshtha values for this exact person/time/place are the chart the project already cross-checks against VSOP87 and an independent horizon/meridian solver, so those positions carry independent weight.

---

## 3. Depth assessment (per module)

### Foundation · Lo Shu
Birth, Name and **Combined** grids are plotted by *number key* against the canonical `4-9-2 / 3-5-7 / 8-1-6` layout, so the Name and Combined grids cannot inherit wrong coordinates from array order. Eight planes and eight arrows, plus present/missing/repeated signals, are all genuine Lo Shu concepts rendered correctly. Remedy kits are keyed strictly to the birth grid — good authority hygiene.

### Advanced Vedic comparison
Correctly kept **birth-grid-only**, closed by default, and framed as *planetary-strength indicators* rather than a second remedy checklist. This is the single most responsible design choice in the product: most hybrid tools would have minted missing-number "remedies" from the Vedic grid. This one refuses, and it states so in the UI.

### Timeline · Ank Jyotish Dasha
The proportional 45-year numerology stack (MD duration = the number; AD = MD×AD÷45; PD nested) is **internally exact** — I confirmed boundary dates, `adProgress`, and a Pratyantar ending exactly 7 days out on the review date. Life-event windows are graded High/Moderate/Conditional by natal presence of the *significator lords* rather than being deleted when a significator is natally absent — a mature fix to a classic "windows vanish" bug.

### Practitioner Cockpit
Reads the same engines as the full report (it cannot disagree) and is a legitimate single-A4 consultation sheet. Clinical triage stages **one acute target** and demotes the rest to Tier-2 environmental cues with activation dates — this is the correct professional shape (do not prescribe 9 crystals at once).

---

## 4. Accuracy: the honest bottom line

- **Core numerological arithmetic — verified correct** on the worked chart and consistent with the documented rules across the test suite (grids, Dasha/Vastu independence, formula integrity, i18n, authority boundaries).
- **Astronomical positions — independently validated** (<0.02° vs VSOP87; Lagna/MC <0.25°).
- **No NaN/undefined leakage**, multilingual labels distinguish Lo Shu vs Vedic vs Feng Shui/Kua — small but real signs of craft.
- **Privacy is genuine** (all computation on-device), which lets a practitioner use real client data without a data-handling worry.

I did **not** find a numeric error in the worked output. That is itself the headline accuracy result.

---

## 5. Professional caveats a senior numerologist must raise

These are the reasons I cannot call it "stand the test of time" *without qualification*:

1. **The previous "Vedic Dasha" label required a framing correction.** The timeline is a **Moolank-seeded numerology Dasha on a 45-year base**, where each Mahadasha lasts exactly its number of years (here Venus MD = 6 years) and sub-periods are proportional. That is *not* classical Vedic **Vimshottari Dasha** (nakshatra-anchored, fixed 120-year lord durations: Venus 20y, Saturn 19y, Sun 6y, Moon 10y, Mars 7y, Rahu 18y, Jupiter 16y, Mercury 17y, Ketu 7y). The shipped UI and docs now call this **Ank Jyotish Dasha** and state the non-Vimshottari boundary in English, Hindi and Gujarati. This is a framing fix, not a math fix.

2. **`getDashaRelationship` and the Antardasha badge depend on the knowledge pack's friendship matrix**, with a non-removable hard-coded list of hostile pairs (Grahan axis, Sun–Saturn, Mars–Saturn, Jupiter–Venus). The pack schema now exposes an additive `db.dasha.relationshipPolicy` for reviewed extra hostile or Grahan pairs; pack policy cannot weaken the classical safety boundary.

3. **School-dependence is real but disclosed.** Lo Shu including century digits and re-adding Driver/Conductor; the Vedic grid excluding the century and de-duplicating direct days; challenge values that can read 0 — each is a *legitimate school*, and the app is good about labelling them. A practitioner should still tell clients that numerology has methodological schools and that the two grids here answer different questions by design.

4. **Authority boundaries are healthy but need to be honoured in prose.** The reports read well, but generated guidance must never let a Lo Shu remedy creep into a Vedic-context card (or vice-versa) via loose wording. I sampled this chart's Foundation vs Timeline vs Cockpit content and did not see a leak — good, but it is the highest regression risk as content grows, so a lint/assertion that every remedy-bearing block carries the right `data-authority` is worth adding.

5. **"Test of time" is a methodology bar, not just a math bar.** To fully earn it, formalise (a) a content-review sign-off for every remedy/tradition claim, (b) schema validation for every knowledge pack on load, and (c) CI running the full gate on every PR — the project's own QUALITY_AUDIT already lists these as open items. With those, the claim is defensible for the long term.

---

## 6. Scope note on the delivered change

The review was performed on the latest version, which includes the **date-input change you requested**: the DOB (and partner DOB) fields are now plain text accepting **dd-mm-yyyy** (e.g. `05-08-1976`) with a live typing mask, tolerant parsing (also reads `dd/mm/yyyy`, `dd.mm.yyyy`, bare `05081976`, and legacy `yyyy-mm-dd` snapshots without corruption), real calendar-day/month validation, a dd-mm-yyyy hint, and matching English/Hindi/Gujarati placeholder + error messages. All `npm run check` gates pass (smoke suite, zero-audit vulnerabilities, static build). Randeep Walia's DOB was entered as `05-08-1976` in the audit.

---

## 7. Bottom line

- **Accuracy:** core numerology and astronomy **verified correct** on the worked chart.
- **Depth:** genuinely deep and layered; the Lo Shu / Vedic / timing separation is best-in-class.
- **Test-of-time:** strong and improving now that the **Ank Jyotish Dasha** naming and non-Vimshottari disclosure match the actual numerology-proportional engine.

**Rating: 4.5 / 5 — recommended for professional reflection use** (with the Vedic-Dasha-framing caveat resolved), and clearly *not* a substitute for medical/legal/financial/relationship advice, which the app itself already states.

*Reviewed with an independent hand-calc of the 05-08-1976 chart; no numeric discrepancy found.*

---

## 8. Re-evaluation at 2.9.0 — senior-developer review of the fixes

This section re-checks the project through the same professional lens after the
release that responded to the weaknesses list. Verdict first: **the two items
that actually mattered were real bugs, not cosmetic framing, and one of them
would have misled a client.**

### 8.1 The critical item was worse than the review said

The evaluation called the "Vedic Dasha" naming a *framing* problem. Reading the
shipped source, it was also a **contradiction inside the product**.

The 2.8.3 relabel updated the module title, the tab, the intro copy, the
metadata and the docs to *Ank Jyotish Dasha* with an explicit
"not classical Vimshottari" disclosure. But the Dasha section's own
*"How we judge this"* note still read:

> "We use the **classical Vimshottari-derived** proportional cycle
> (MD × AD ÷ 45)…"

So the app told a client, in the same section, both that it was not
Vimshottari and that it was Vimshottari-derived. For a practitioner who knows
Jyotish, that is the exact over-claim the relabel was meant to remove — and it
was surviving in the one block a sceptical client reads most closely.

**Fixed in 2.9.0.** The note now states that the proportional clock is not
Vimshottari and points to the separate classical card. A smoke assertion pins
that the string `Vimshottari-derived` never reappears in `app.js`, `i18n.js` or
any rendered report.

### 8.2 The Vimshottari layer was added, and it changes the answer

The review offered relabel *or* add a true Vimshottari layer. 2.9.0 does both.
This matters because the two clocks do not agree, and the disagreement is not
small.

Independently hand-checked on the audit chart (05-08-1976, 20:15 IST,
Faridabad), using the project's own Meeus Moon position of **234.8744°
sidereal** → **Jyeshtha**, pada 3, lord **Mercury**:

| | Value | Check |
| --- | --- | --- |
| Nakshatra span | 226°40′–240°00′ (13°20′) | ✅ |
| Traversed | 8.2077° ÷ 13.3333° = **61.56%** | ✅ |
| Volumetric Vimshottari balance | (1 − 0.6156) × 17y = **6.535y** Mercury | ✅ |
| MD sequence | Mercury 6.535 → Ketu 7 → Venus 20 → Sun 6 → Moon 10 → **Mars 7 (2026-02-17 → 2033-02-16)** | ✅ |
| On 2026-09-12 | **Mars MD / Rahu AD** | ✅ |

Against the app's Ank Jyotish clock, which puts the same person in **Venus MD
(2026-08-05 → 2032-08-05)**, the two traditions name **different ruling
planets** for the same client on the same day.

Before 2.9.0 a practitioner had only the Ank Jyotish reading and a rename —
which is honest but leaves the "Vedic" claim unbacked. Now both stacks are
rendered side by side with a `data-vimshottari-agrees` flag and a comparison
note that explains rather than reconciles. That is the correct professional
posture: an Ank Jyotishi and a Jyotishi genuinely give different answers, and
the tool should not pretend otherwise.

### 8.3 The widened authority lint found a real leak

The review asked for "a lint/assertion that every remedy-bearing block carries
the correct `data-authority` attribute". The project already had a narrow
version of this. Widening it to *"no Vedic-authority scope may contain a
remedy obligation"* immediately failed — and the failure was informative:

The **Active Vastu Zone** card is selected by the Dasha engine but prescribes a
Vastu remedy (`zoneRemedy`). It was rendered inside `data-authority="dasha"`
with no authority marker of its own, so Vastu prescription content sat
unlabelled inside a Dasha scope. That is precisely the class of leak §5.4
warned about, caught by the enforcement the review asked for. It now declares
`data-authority="dasha-vastu-zone"`.

This is the strongest argument for the recommendation: the boundary prose was
already good, and the *automated* check still found something.

### 8.4 The friendship-matrix override is now a documented contract

The hard-coded classical pairs (Grahan axis, Sun–Saturn, Mars–Saturn,
Jupiter–Venus) are declared in `knowledge-pack/schema.json` as
`db.dasha.relationshipPolicy["x-classicalSafetyPairs"]`, each row marked
`removable: false`, with a description that warns a pack author directly: a
pair marked friendly in `db.friendship` will still render as
Conflicting/Caution if it is on this list. A smoke assertion cross-checks the
documented pairs against the enforced pairs, so documentation and code cannot
drift apart. Pack policy stays additive.

### 8.5 The open quality gates

| Gate from the weaknesses list | Status at 2.9.0 | Evidence |
| --- | --- | --- |
| 1 · Vedic Dasha naming | **Closed** | Relabelled *Ank Jyotish Dasha* (2.8.3); contradictory `Vimshottari-derived` claim removed; true Vimshottari layer added |
| 2 · Friendship override | **Closed** | `x-classicalSafetyPairs` in the pack schema + drift assertion |
| 3 · Authority enforcement | **Closed** | `AUTHORITY_VOCAB` lint, remedy-nesting assertion, Vedic-scope assertion — which found the Vastu-zone leak |
| 4 · Content review process | **Closed** | `CONTRIBUTING.md` gate, `CODEOWNERS` routing, PR template record |
| 5 · No CI | **Closed** | `.github/workflows/ci.yml` — `npm ci && npm run check` on every PR, plus a visual job |
| 6 · No PWA manifest | **Closed** | `manifest.webmanifest`, `sw.js`, generated icon set; installable and offline |
| 7 · Pack schema tests | **Closed** (was already done in 2.8.3) | Every versioned pack validated, legacy schema-1 packs included |
| 8 · License missing | **Closed** | MIT `LICENSE` with content and third-party scope notes |
| 9 · Mobile print/read readiness | **Addressed** | Field read mode; print CSS explicitly neutralises it |

### 8.6 Remaining honest caveats

- **Visual baselines are still not committed, and a spec assertion is
  currently failing.** CI refuses to report a visual pass it did not earn and
  publishes a warning annotation plus a downloadable baseline artifact instead —
  but screenshot regression is not yet a real gate. The failure could not be
  diagnosed from the authoring sandbox (no browser available; CI logs and
  artifacts unreachable), so it is recorded rather than papered over. Closing it
  needs one browser-enabled run.
- **axe-core accessibility audit is still outstanding.** The ARIA roles,
  keyboard navigation and skip link are present; they have not been
  machine-verified.
- **The classical layer is a timing read-out only.** It deliberately carries no
  remedies, and no attempt is made to reconcile it with the Ank Jyotish event
  windows. A practitioner wanting aligned dates must still read both.
- **Field mode is unverified on real devices.** It is presentation-only and
  proven not to touch engine output, but it has not been tested on physical
  phones.

### 8.7 Bottom line at 2.9.0

- **Accuracy:** core numerology and astronomy still verified correct; the new
  Vimshottari layer independently hand-checked and correct.
- **Framing integrity:** the app no longer contradicts itself about Vimshottari,
  and now genuinely delivers the classical stack it previously only gestured at.
- **Enforcement:** the authority boundary is machine-checked, and that check
  found and fixed a real leak.
- **Packaging:** licence, CI, content-review gate and offline installability are
  all in place.

**Rating: 5 / 5 for professional reflection use** on accuracy, framing integrity
and tradition separation — with the caveat that visual regression and
accessibility automation remain outstanding, and that the two Dasha traditions
will keep disagreeing by design.

*Re-evaluated with an independent hand-calc of the Vimshottari stack for the
05-08-1976 chart; no numeric discrepancy found in either the Ank Jyotish or the
classical engine.*
