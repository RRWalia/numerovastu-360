## What changed

<!-- One or two sentences. Link the issue if there is one. -->

## Why

<!-- The user-visible reason. -->

## Tradition & authority impact

- [ ] No `data-authority` scope changed, OR the new scope is added to
      `AUTHORITY_VOCAB` in `smoke.test.js`.
- [ ] No Lo Shu remedy moved into a Vedic / Dasha / Vimshottari card.
- [ ] Ank Jyotish and Classical Vimshottari remain separately computed.

## Content review gate

<!-- Required only if this PR touches remedy / dosha / deity / mantra /
     crystal / charity / fasting / Vastu prescription fields in data.js or
     knowledge-pack/packs/*.json. See CONTRIBUTING.md. -->

- [ ] This PR does **not** touch remedy/dosha/deity content.
- [ ] This PR touches remedy/dosha/deity content and has practitioner sign-off:

```
Content review: <reviewer name / role>
Traditions touched: <Lo Shu | Vedic | Vimshottari | Vastu | none>
Guardrails checked: <moon-cold | dosha-contra | solar-moderation | under-18 | n/a>
Practitioner sign-off: <date>
```

## Numeric changes

- [ ] This PR does not change any core formula.
- [ ] This PR changes a core formula, and I have attached a hand-worked example
      and pinned it with an assertion in `smoke.test.js`.

## Localisation

- [ ] New user-facing strings are added to `en`, `hi` **and** `gu`.
- [ ] No partial translation ships.

## Validation

<!-- Paste the actual command output, not just "passes". -->

```
npm run check
```

- [ ] `npm run check` passes locally.
- [ ] `npm run test:visual` passes, or this PR intentionally changes layout and
      the baselines are updated in this PR.

## Privacy

- [ ] No new network calls touch personal data (birth date, time, birthplace,
      name, mobile, vehicle, home layout).
