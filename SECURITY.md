# Security Policy

## Supported project posture

NumeroVastu 360 is a static, browser-only app. There is no production backend and no server-side storage of visitor names, dates of birth, phone numbers, birth places, Vastu inputs or local journal notes.

## Reporting a vulnerability

Please report security or privacy issues privately to the repository owner instead of opening a public issue with exploit details. Include:

- affected file or feature,
- steps to reproduce,
- expected vs. actual behaviour,
- browser and deployment context, if relevant.

## Baseline checks before release

Run the repository quality gate before publishing:

```bash
npm run check
```

This executes the smoke test, dependency audit and static production build. In browser-enabled CI, also run:

```bash
npm run check:full
```

This adds the Playwright visual regression suite for report and print layouts.

## Dependency policy

- Runtime app code has no npm dependencies.
- Development dependencies are limited to local serving and headless tests.
- `npm run audit` is configured to fail on moderate-or-higher advisories.

## Privacy-sensitive areas

When changing these areas, verify that personal data remains local-only:

- `localStorage` history, practice logs and journal notes,
- Knowledge Pack fetching and caching,
- anonymous contribution payload construction,
- report rendering and print/export flows,
- Vedic precision fields: birth time and birth place.
