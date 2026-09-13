# Contributing to NumeroVastu 360

Thanks for helping. This project makes traditional claims to real people, so the
bar is deliberately higher than "it renders": every numeric change needs
verification, and every remedy/dosha/deity change needs a practitioner review.

## Quick start

```bash
npm ci
npm run dev          # http://localhost:5173
npm run check        # smoke suite + dependency audit + static build
```

Before opening a pull request, `npm run check` must pass locally. CI runs the
same gate on every PR (`.github/workflows/ci.yml`).

## The three traditions — do not merge them

The app keeps three systems deliberately separate, and the boundary is enforced
by tests, not by convention:

| Layer | Authority tag | Owns |
| --- | --- | --- |
| Lo Shu Foundation | `data-authority="lo-shu-overlay"` | Missing/repeated-number remedies, lifestyle practice, crystals, 40-day plan |
| Ank Jyotish Dasha | `data-authority="dasha"` | The proportional 45-year numerology clock, life-event windows, active Vastu sector selection |
| Classical Vimshottari | `data-authority="vimshottari"` | Nakshatra-anchored 120-year timing only — **never** remedies or zones |
| Vedic comparison | `data-authority="vedic-tattva"`, `"zodiac-reference"` | Planetary-strength indicators only — **never** a second remedy list |

Hard rules the smoke suite enforces:

- Every remedy-bearing block carries `data-remedy-authority="lo-shu"`.
- No Vedic-authority scope may contain a Lo Shu remedy obligation.
- Every `data-authority` value must come from the declared vocabulary in
  `smoke.test.js` (`AUTHORITY_VOCAB`).
- The Ank Jyotish clock must never be described as Vimshottari, and the
  Classical Vimshottari card must never be described as Moolank-seeded.

If your change makes one of those true, the tests will fail — that is the
point. Fix the change, not the test.

## Content review gate (required for remedy, dosha and deity changes)

Any pull request that touches a **remedy**, **dosha**, **deity**, **mantra**,
**crystal**, **charity**, **fasting** or **Vastu prescription** field in
`data.js` or `knowledge-pack/packs/*.json` requires a senior-practitioner
review before merge, in addition to code review.

The reviewer confirms, on the record in the PR:

1. **Tradition correctness** — the prescription matches the stated school
   (Lo Shu vs Vedic vs Feng Shui/Kua) and is not a hybrid of two.
2. **Clinical safety** — the change does not contradict an existing guardrail.
   Specifically check the Moon-cold (Number 2), dosha × planet, solar-moderation
   (4× Sun + Pitta) and under-18 gemstone guardrails. A remedy that is fine in
   isolation can still be wrong for a cold/respiratory-sensitive or
   Pitta-loaded chart.
3. **One acute target** — the change must not add a second simultaneous acute
   obligation. Tier-2 items stay conditional on environmental cues.
4. **Canonical text preserved** — guardrails annotate canonical mantra rows;
   they never rewrite or replace them.
5. **Localisation** — `en`, `hi` and `gu` are all updated. No partial
   translation ships; `smoke.test.js` asserts key coverage.

### Review record

Add a line to the PR description using this block:

```
Content review: <reviewer name / role>
Traditions touched: <Lo Shu | Vedic | Vimshottari | Vastu | none>
Guardrails checked: <moon-cold | dosha-contra | solar-moderation | under-18 | n/a>
Practitioner sign-off: <date>
```

`.github/CODEOWNERS` routes these paths to the maintainer automatically.

## Knowledge-pack changes

- Bump `packVersion` and add a **new** file in `knowledge-pack/packs/`.
  Never edit a released pack in place — practitioners may have it cached.
- Update `knowledge-pack/latest.json` to point at the new file.
- Every versioned pack must validate against `knowledge-pack/schema.json`;
  `smoke.test.js` asserts this for every file in `knowledge-pack/packs/`.
- Read `db.dasha.relationshipPolicy` in the schema before touching the
  friendship matrix. The classical Sambhandha safety pairs listed in
  `x-classicalSafetyPairs` are a **non-removable** hard boundary owned by
  `app.js` — a pack can add hostility, never remove it.

## Timing / Dasha changes

- The Ank Jyotish clock (MD = the number of years, AD = MD × AD ÷ 45) and the
  Classical Vimshottari clock (nakshatra-anchored, fixed 120-year lords) must
  stay independently computed. They are allowed — expected — to disagree.
- If you touch `vimshottariTimeline()`, re-verify the balance arithmetic by
  hand for the fixture in `smoke.test.js` (05-08-1976, 20:15, Faridabad →
  Jyeshtha/Mercury, 61.6% elapsed, 6.535-year balance, Mars MD from 2026).

## Numeric changes

Any change to a core formula (Moolank, Bhagyank, Chaldean, Lo Shu/Vedic grid
plotting, Personal Year, Pinnacles) must come with a hand-worked example in the
PR description **and** a pinned assertion in `smoke.test.js`. "The tests still
pass" is not evidence that the new number is right.

## Style

- Plain ES2020, no build step for app source. `app.js`, `data.js`, `i18n.js`
  and `astro.js` run directly in the browser.
- Keep new user-facing copy out of `app.js` where practical — prefer a key in
  `i18n.js` with `en`/`hi`/`gu` and a `t("key", "fallback")` call.
- Never send birth data anywhere. The privacy posture is on-device only, with
  no telemetry; a change that adds a network call to a personal-data path will
  be rejected.
