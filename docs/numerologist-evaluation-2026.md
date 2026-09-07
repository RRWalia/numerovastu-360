# NumeroVastu 360 — Senior-Numerologist Evaluation

**Product evaluated:** NumeroVastu 360, Release **2.8.0** ("Lo Shu Foundation + Vedic Dasha Timeline")
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

### Timeline · Vedic Dasha
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

1. **The "Vedic Dasha" label is the weakest claim in the product.** The timeline is a **Moolank-seeded numerology Dasha on a 45-year base**, where each Mahadasha lasts exactly its number of years (here Venus MD = 6 years) and sub-periods are proportional. That is *not* classical Vedic **Vimshottari Dasha** (nakshatra-anchored, fixed 120-year lord durations: Venus 20y, Saturn 19y, Sun 6y, Moon 10y, Mars 7y, Rahu 18y, Jupiter 16y, Mercury 17y, Ketu 7y). This engine computes Jyeshtha (Moon nakshatra) yet does not use it to anchor a Vimshottari balance — so a client told they are in "Venus Mahadasha" from a moolank-proportional clock could be given a different (and, to a Jyotisha, more authoritative) period from their true Vimshottari stack. **Recommendation:** relabel the module *"Numerology (Ank Jyotish) Dasha Timeline"*, and/or add an optional true Vimshottari layer now that Moon-nakshatra is computed. This is a framing fix, not a math fix, but it materially strengthens the "Vedic" authority claim.

2. **`getDashaRelationship` and the Antardasha badge depend on the knowledge pack's friendship matrix**, with a small hard-coded list of hostile pairs (Grahan axis, Sun–Saturn, Mars–Saturn, Jupiter–Venus). The intent (never show green on a hostile sub-period) is sound, but the hard-coded override list means any future custom pack's friendship edits are partly overridden by code. Keep this, but document it in the pack schema so a pack author isn't surprised.

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
- **Test-of-time:** strong and improving, provided the **"Vedic Dasha" naming** is reconciled with the actual (numerology-proportional) engine and the project ships its already-scoped quality gates.

**Rating: 4.5 / 5 — recommended for professional reflection use** (with the Vedic-Dasha-framing caveat resolved), and clearly *not* a substitute for medical/legal/financial/relationship advice, which the app itself already states.

*Reviewed with an independent hand-calc of the 05-08-1976 chart; no numeric discrepancy found.*
