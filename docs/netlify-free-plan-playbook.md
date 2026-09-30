# Netlify free-plan playbook — making 300 credits a month enough

> Written 30 Sept 2026, the day the Aug 31 – Sep 29 billing cycle ran dry and
> production deploys were skipped for ~3 weeks while `main` kept moving. This
> file is the operating manual so that never hurts again. Note: edits to this
> file never trigger a Netlify build (see `netlify.toml`), so maintaining it is
> free.

## What the free plan actually charges

The site runs on Netlify's credit-based Free plan (the model Netlify has used
since Sept 2025): **300 credits per month, one shared pool, hard limit** — no
overage billing, no auto-recharge. When the pool is empty, **new production
builds are skipped**; the already-published site stays live and online.

| Action | Credit cost | Notes |
| --- | --- | --- |
| Production deploy (merge/push to `main`) | **15 each** | Flat rate — build *duration is not metered* |
| Deploy Preview (PR builds) | **0** | Unlimited — iterate on PRs freely |
| Branch deploys | **0** | Unlimited |
| Failed or skipped deploys | **0** | |
| Bandwidth | 20 per GB | ≈ 15 GB/month if credits were spent on nothing else |
| Web requests | 2 per 10,000 | Roughly 1.5 M requests/month |

Practical ceiling: **~20 production deploys a month** if every credit went to
deploys. Budget for ~8–12 deploys to leave headroom for real traffic.

## What happened in September 2026 (so the symptoms stay recognisable)

- PRs were merged to `main` one at a time; each merge spent 15 credits.
- On 19 Sept the pool hit zero. Merges kept landing on GitHub, but Netlify
  skipped their production deploys with *"account credit usage exceeded"*
  (PRs #55, #56 and #57 were all affected).
- The live site stayed on the early-September publish (**v2.8.1**, build
  2026-09-05) while `main` advanced to **v2.15.0** — GitHub and the live site
  disagreed for three weeks.
- Credits reset on 30 Sept. **Skipped deploys never auto-retry**: the pending
  work ships with the *next* production deploy (or manually via
  *Deploys → Trigger deploy → Deploy existing commit*).

## The four rules

1. **Batch merges to `main`.** This is the only build-side lever that matters.
   Deploy Previews are free, so agents and collaborators can open PRs and
   iterate all day — but each *merge* to `main` is one 15-credit production
   deploy. Merge in batches (e.g. when a meaningful set of PRs is green, or
   weekly) instead of one PR at a time. The arena workflow merged several PRs
   per day in September; at 15 credits each, that exhausts the month in ~10 days.
2. **Let non-site changes ride along.** The `ignore` command in `netlify.toml`
   skips the build (0 credits) when a push only touches `tests/`, `docs/`,
   `reference/`, `.github/`, `*.md`, `LICENSE`, the source archive or dev
   scripts. Site files (`index.html`, `*.js`, `styles.css`, `sw.js`, `icons/`,
   `atlas/`, `knowledge-pack/`, `manifest.webmanifest`, …) always build
   normally. When adding a new non-site path to the repo, add it to that
   exclude list so it stays free.
3. **Say `[skip netlify]` when a merge must not deploy.** Any commit message
   on `main` containing `[skip netlify]`, `[skip netlify deploy]` or
   `[skip ci]` skips the build — useful for merges that are pure bookkeeping.
4. **Verify what is live before assuming.** The site self-reports its release:
   the *App v…* badge and `<meta name="nv-version">` in `index.html`, the
   `<meta name="nv-build-label">` stamp (set at build time), and
   `CACHE_VERSION` in `sw.js`. After any deploy, load the site and check the
   badge — if GitHub is ahead of the badge, the deploy was skipped.

## Guardrails already in place (keep them true)

- `netlify.toml` `ignore` command — non-site pushes build nothing (rule 2).
- The full quality gate (smoke suite, dependency audit, static build, source
  archive freshness, visual regression) runs on **GitHub Actions**, which is
  free — never move checks onto the Netlify build to "save time"; Netlify
  build duration doesn't affect credits anyway (flat 15 per deploy).
- The service worker keeps repeat visitor traffic off the network
  (stale-while-revalidate shell, cached knowledge pack), which protects the
  bandwidth line of the credit budget.

## If credits run out again

- The published site stays live; only new builds are skipped. Don't panic.
- After the cycle resets, publish the backlog in **one** deploy: merge to
  `main` (preferred), or use *Deploys → Trigger deploy → Deploy existing
  commit* → pick the latest `main`.
- A manual `netlify deploy --prod --dir=dist` (or dragging `dist/` onto the
  Deploys page) skips the Netlify build, but on credit plans a production
  deploy may still be charged — batching merges remains the real lever.
- Watch the meter: *Netlify → team → Billing*. Netlify emails usage alerts at
  50 %, 75 % and 100 % of the monthly allowance — read them.

## When to upgrade

Personal ($9/month, 1,000 credits) is only worth it if you routinely need
more than ~20 production deploys a month or see real bandwidth pressure
(> 15 GB/month). At the current cadence — batched merges, free previews,
tests on GitHub Actions — the free plan is comfortably enough.
