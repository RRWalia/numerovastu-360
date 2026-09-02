# NumeroVastu 360

**Numerology & Vastu Remedy Engine** — a 360° report generator that combines classical Vedic numerology with Vastu principles.

Enter your name, date of birth, mobile and vehicle numbers once, and the app computes your Driver (Moolank) and Conductor (Bhagyank) numbers, builds a live **Loshu Grid**, and generates a complete remedy plan across money, health, career, business and relationships.

---

## What it does

| Area | What's analysed / generated |
| --- | --- |
| **Northstar summary** | Plain-language executive summary — headline, chart story, strategy cards, your first three moves and the way forward — with a jump link to the 40-day plan (the two never repeat each other) |
| **Core profile** | Driver (Moolank) & Conductor (Bhagyank) numbers, Name number (Chaldean), Mobile & vehicle vibrations, Vedic Sun Sign (Surya Rashi), plus a **Karmic Debt check** — 13/14/16/19 scanned at the *unreduced* birth-day, full birth-date and Chaldean name totals, each with its repeating lesson and settling remedy routed to the reduced root's planet kit, and an **Ayurvedic Dosha layer** — the classical Jyotish–Ayurveda constitutional map (dominant dosha, nature, aggravation, balancing foods, routine and mantra-link for every number 1–9, in EN/HI/GU), blended from Driver + Conductor with aggravation flagged from repeated 3+ numbers and support gaps from missing-critical numbers. It is framed as traditional wellness guidance, not diagnosis. Also a **Deity Protection layer** — the classical number → ishta devta correspondence (guardian deity, classical mantra, the 11× and 108× chants, offerings and support materials for every number 1–9, in EN/HI/GU), paired from Driver + Conductor, with extra vigilance from repeated 3+ numbers and under-supported (missing-critical) gaps. It is framed as traditional spiritual guidance — the reader's own family tradition and guru take priority. |
| **Vedic precision** | **Tier 1 (ready now):** Vedic Sun Sign (Surya Rashi) — sidereal / Nirayana, Lahiri ayanamsa — computed from date of birth alone, with the Western tropical sign shown as a clearly-labelled reference. **Tier 2 (unlocked):** add your exact birth time + birth city and the **Astro-Identity Snapshot** computes your Moon Sign (Chandra Rashi), Nakshatra with its pada, Lagna (ascendant) and Midheaven — a real in-browser Vedic ephemeris (see below), never sent anywhere. A cross-system harmony note appears when the sign's ruling number overlaps with missing or important Lo Shu numbers. |
| **Loshu Grid** | Live 3×3 grid with all **8 planes** fully interpreted (Mental, Emotional, Practical, Thought, Will, Action, Golden Rajyoga, Silver Rajyoga) plus the **8 classical arrows** (Determination, Intellect, Spirituality, etc.) with strong / partial / frustrated states, and missing-number severity tiers |
| **Name analysis** | Chaldean total, **compound number (1–108) meaning**, **master numbers (11/22/33)**, relationship to birth numbers, and **sound-preserving spelling corrections** (Tripti → Triptii style — never drops letters) |
| **Name & combined grids** | Loshu grids plotted from your **name's Chaldean letter values** and a **combined DOB + name** grid, alongside the birth grid |
| **Business / brand mode** | Chaldean success reading for a brand, shop or venture name — compound number, auspicious roots, and sound-preserving corrections |
| **Mobile / Vehicle** | Vibration check vs. Driver & Conductor, plus recommended totals for a change |
| **Compatibility** | Two-person Driver/Conductor matchmaking (marriage or partnership) using the planetary friendship table, plus a **compatibility remedy plan** — per-clash friction & bridge guidance, couple rituals drawn from both planets' remedy kits, and "bridge numbers" friendly to both charts |
| **Remedy kits** | Per-planet mantras, crystals, rudraksha, yantras, colours, charity, fasting & lifestyle remedies |
| **Timing** | Personal-year cycle, favourable years, milestone ages, and the **four life phases — Pinnacles & Challenges** with classical age boundaries (first phase ends at 36 − Conductor, each next spans 9 years) and per-phase peak energy + recurring lesson |
| **Vastu** | Entrance, kitchen, bedroom, toilet, **study room** & **staircase** dosh scan with fixes, **plot-shape (missing corner/extension) analysis**, plus a clearly-labelled **Kua number** (Feng Shui personal lucky directions) |
| **Watch / wearable** | Personalised metal, dial, geometry & strap spec |
| **40-Day Activation Plan** | The report's operational finale: a daily core ritual, a weekly charity/fast rhythm, a **dosha-aware lifestyle line** (Vata anchors the morning routine; Pitta cools around noon; Kapha adds movement before sunset), an **ishta devta chant line** (the guardian deity of both key numbers with their 11× and 108× chants), the four classical mandala phases (Foundation → Rhythm → Integrate → Review), the single action checklist tagged Daily/Weekly/One-time, and an **interactive 40-day tracker** saved privately per profile |
| **Evolving skill system** | Bundled **Knowledge Pack** with optional self-update, on-device chart memory, private remedy check-ins, and an off-by-default anonymous aggregate contribution scaffold |

---

## Privacy

All calculations run **entirely in the visitor's browser** — no name, DOB, phone, birth time, birth place or Vastu data is ever sent to a server. There is no backend. The optional Vedic-precision fields (exact birth time, birth city/place) are stored only in the browser's local storage and are excluded from the anonymous contribution payload.

The new **Knowledge Pack** updater does **not** change that promise: the pack is public content, not personal data. The app ships with a bundled pack for instant offline use, then can optionally fetch a newer public pack and cache it locally.

The new **on-device memory** also stays local: saved reports, remedy check-ins and evolving-chart notes are stored only in the browser on that device.

An **anonymous contribution** switch is included as a scaffold and is **off by default**. When enabled, it only prepares aggregate counts such as selected goals or missing-number totals. It never includes names, dates of birth, phone numbers, vehicle numbers or private journal notes.

---

## Tech stack

- **Vanilla JavaScript** (no framework) — a stable IIFE-based engine (`app.js`) + a bundled curated knowledge pack (`data.js`)
- **Visible release metadata** — app version, build label and Knowledge Pack version are surfaced as badges on the intake screen
- **In-browser Vedic ephemeris** (`astro.js`) — sidereal (Nirayana) Sun, Moon, Nakshatra + pada, Lagna and Midheaven computed entirely on-device with **Lahiri (Chitrapaksha) ayanamsa** and a **630+-place offline world atlas** (with coordinate + time-zone override entry) — every sovereign world capital including **Hargeisa, Somaliland**, widely-recognised territories, and 350+ Indian cities, all validated by `scripts/validate-atlas.mjs` against IANA time-zone data. The ephemeris is a **fully self-contained port of Jean Meeus' "Astronomical Algorithms"** (Julian day & ΔT, IAU-82 sidereal time, ch. 22 nutation, ch. 25 Sun, ch. 47 Moon) — zero runtime dependencies, validated to < 12″ against VSOP87 (astronomy-engine) on the reference chart
- **Versioned JSON knowledge packs** under `knowledge-pack/` for self-updates, schema validation, caching and fallback
- **Plain CSS** (`styles.css`) with print styles, responsive breakpoints and `prefers-reduced-motion` support
- **[Vite](https://vitejs.dev/)** for local development
- **[jsdom](https://github.com/jsdom/jsdom)** for the headless smoke test (295+ checks, including an independently cross-validated reference chart)

---

## Project structure

```
numerovastu-360/
├── index.html          # Single-page app (intake form + report view)
├── app.js              # Stable engine: calculations, rendering, self-update + local memory
├── astro.js            # In-browser Vedic ephemeris — self-contained Meeus port (Sun/Moon/Nakshatra/Lagna/MC, Lahiri ayanamsa)
├── data.js             # Bundled fallback knowledge pack (instant/offline)
├── knowledge-pack/     # Manifest, schema and versioned JSON packs for silent upgrades
├── styles.css          # Styling (light theme, print + mobile)
├── smoke.test.js       # Headless end-to-end smoke test (jsdom)
├── playwright.config.mjs # Visual regression config (report + print screenshots)
├── tests/              # Playwright visual regression specs and baselines
├── vite.config.mjs     # Local dev / preview server config
├── scripts/            # Repository maintenance scripts (static build)
├── share.bat           # Windows script to share over HTTPS (see below)
└── reference/          # Source tables (table-A/B xlsx) used to curate data.js
```

The root files are the single source of truth — Vite serves them directly
(`index.html` loads `astro.js`, `data.js` and `app.js`), and the `share.bat`
static server should be pointed at the repository root. GitHub Pages deploys
the same root files from `main`.

## Knowledge Pack architecture

The app now has two layers:

1. **Engine (`app.js`)** — calculations, rendering, local caching, update checks and on-device memory.
2. **Knowledge Pack (`data.js` + `knowledge-pack/packs/*.json`)** — the curated numerology/Vastu database, versioned with `packVersion`.

Startup flow:

1. Load the bundled pack from `data.js` immediately.
2. Restore any newer validated pack cached in `localStorage`.
3. Optionally fetch `knowledge-pack/latest.json`.
4. If a newer pack exists, download it, validate it, cache it, and surface a “Knowledge updated…” toast.

This keeps the app usable offline while still allowing content to evolve without touching the core engine.

---

## Getting started

### Prerequisites

- [Node.js](https://nodejs.org/) 18+ (developed on Node 22)

### Install & run (local development)

```bash
npm install
npm run dev
```

`npm run dev` runs `vite --host 0.0.0.0`, which serves the app and prints a local URL
(usually `http://localhost:5173`). Open it in a browser.

### Run quality checks

```bash
npm test
npm run audit
npm run build
# or all together:
npm run check

# optional screenshot regression suite:
npm run browsers:install
npm run test:visual
```

`npm test` runs `node smoke.test.js`.

The smoke test loads the app in jsdom, submits several profiles (including a
practitioner example and a name-correction case), and asserts every report
section renders with no `undefined`/`NaN` leaks. It exits `0` on success,
`1` on any failure.

`npm run audit` fails on moderate-or-higher dependency advisories. `npm run build`
creates a deployable static `dist/` by copying the browser-first app files and the
full `knowledge-pack/` directory exactly as the app expects them at runtime.

The visual regression suite uses Playwright/Chromium to compare the desktop report
viewport and the first print-styled page. Use `npm run test:visual` locally; it
creates any missing baselines and then compares existing ones. Commit the generated
`tests/visual/**-snapshots/*.png` files after reviewing them. Use
`npm run test:visual:update` only when intentionally accepting layout changes, and
`npm run test:visual:ci` for strict CI runs once baselines are committed.

---

## Sharing over HTTPS (`share.bat`)

`share.bat` (Windows only) starts a local static server and tunnels it through
Cloudflare so you get a public `https://…trycloudflare.com` URL without
deploying anywhere.

**Requirements (not committed to the repo — see `.gitignore`):**

- `tools/static-server.js` — a small Node static file server that serves the
  **repository root** (the app files `index.html`, `app.js`, `data.js`,
  `styles.css`) on `http://localhost:8321`
- `tools/cloudflared.exe` — the [Cloudflare Tunnel](https://developers.cloudflare.com/cloudflare-one/connections/connect-networks/downloads/)
  client

Place both files in a `tools/` directory next to `share.bat` before using it.
Keep the terminal window open while sharing; close it to stop the tunnel. All
visitor data still stays in the visitor's browser.

> Cross-platform alternative (no `tools/` needed): run `npm run dev`, then in a
> second terminal run `npx localtunnel --port 5173` for a public URL.

---

## Deployment

The app is a set of static files — `index.html` loads `astro.js`, `data.js` and
`app.js` directly.

For root-file hosting, publish the root files plus the `knowledge-pack/` directory.
For hosts that expect a build output, run `npm run build` and publish `dist/`; the
build script copies every runtime asset, including `knowledge-pack/`, without
changing the browser-only architecture.

### GitHub Pages (simplest)

1. Push the repo to GitHub.
2. In **Settings → Pages**, set the source to the branch and folder containing
   the root files (e.g. `main` / `/ (root)`).
3. The app is served as-is at `https://<user>.github.io/numerovastu-360/`.

> If you prefer a build-output workflow, run `npm run build` and publish the
> generated `dist/` folder.

### Any static host

Upload `index.html`, `astro.js`, `app.js`, `data.js`, `styles.css` and the full
`knowledge-pack/` directory to any static host (Netlify, Vercel, S3, nginx,
etc.). No server-side runtime is needed.

---

## Disclaimer

NumeroVastu 360 provides guidance based on classical Vedic numerology and Vastu
principles. The remedies are **supportive practices, not a substitute** for
professional medical, legal or financial advice. Please consult appropriate
professionals for health, legal or financial decisions.

---

## License

No license file is currently included. Contact the repository owner
(`RRWalia/numerovastu-360`) before reusing or redistributing the code.
