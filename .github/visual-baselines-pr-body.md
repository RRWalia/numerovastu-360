## Why

Screenshot baselines are renderer- and font-stack-specific. These were generated
on `ubuntu-latest` with the exact Chromium that `.github/workflows/ci.yml` uses,
so once merged the **Visual regression** job flips from "generate and warn" to a
strict, blocking comparison.

Do not hand-edit or regenerate these on a developer machine. A different
Chromium build or system font stack will diff against the CI runner and produce
failures nobody can fix. Re-run the **Generate visual baselines** workflow
instead.

## Reviewing this PR

Pixel baselines cannot be reviewed as a text diff. Download the
`playwright-baselines-*` artifact from the workflow run and eyeball the three
images:

| Baseline | What it guarantees |
| --- | --- |
| `loshu-birth-grid` | The Lo Shu square is plotted 4-9-2 / 3-5-7 / 8-1-6, readable, with no collapsed or overlapping cells |
| `vimshottari-card` | The Classical Vimshottari card keeps its anchor, balance, active stack and ladder layout |
| `cockpit-a4-sheet` | The Practitioner Cockpit still fits one printed A4 page, graded-windows table included |

## After merging

`tests/visual/*-snapshots/` will be populated, so the baseline check in `ci.yml`
takes its strict branch automatically. Any future layout change that alters one
of these three surfaces fails the PR until the baseline is deliberately updated —
which is the point.

Local regeneration, when a browser is available:

```bash
npm run browsers:install
npm run test:visual:update
```
