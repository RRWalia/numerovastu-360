# NumeroVastu 360

**Numerology & Vastu Remedy Engine** — a 360° report generator that combines classical Vedic numerology with Vastu principles.

Enter your name, date of birth, mobile and vehicle numbers once, and the app computes your Driver (Moolank) and Conductor (Bhagyank) numbers, builds a live **Loshu Grid**, and generates a complete remedy plan across money, health, career, business and relationships.

---

## What it does

| Area | What's analysed / generated |
| --- | --- |
| **Core profile** | Driver (Moolank) & Conductor (Bhagyank) numbers, Name number (Chaldean), Mobile & vehicle vibrations, Zodiac sun sign |
| **Loshu Grid** | Live 3×3 grid with all **8 planes** fully interpreted (Mental, Emotional, Practical, Thought, Will, Action, Golden Rajyoga, Silver Rajyoga), missing & repeated numbers |
| **Name analysis** | Chaldean total, relationship to birth numbers, and **sound-preserving spelling corrections** (Tripti → Triptii style — never drops letters) |
| **Mobile / Vehicle** | Vibration check vs. Driver & Conductor, plus recommended totals for a change |
| **Remedy kits** | Per-planet mantras, crystals, rudraksha, colours, charity, fasting & lifestyle remedies |
| **Timing** | Personal-year cycle, favourable years, milestone ages |
| **Vastu** | Entrance, kitchen, bedroom & toilet dosh scan with fixes |
| **Watch / wearable** | Personalised metal, dial, geometry & strap spec |
| **Priority plan** | A 40-day, highest-impact action plan ordered by priority |

---

## Privacy

All calculations run **entirely in the visitor's browser** — no name, DOB, phone or Vastu data is ever sent to a server. There is no backend.

---

## Tech stack

- **Vanilla JavaScript** (no framework) — an IIFE-based engine (`app.js`) + a curated content database (`data.js`)
- **Plain CSS** (`styles.css`) with print styles, responsive breakpoints and `prefers-reduced-motion` support
- **[Vite](https://vitejs.dev/)** for local development
- **[jsdom](https://github.com/jsdom/jsdom)** for the headless smoke test

---

## Project structure

```
numerovastu-360/
├── index.html          # Single-page app (intake form + report view)
├── app.js              # Calculation engine + report renderer
├── data.js             # Curated numerology / Vastu / remedy database
├── styles.css          # Styling (light theme, print + mobile)
├── smoke.test.js       # Headless end-to-end smoke test (jsdom)
├── share.bat           # Windows script to share over HTTPS (see below)
├── reference/          # Source tables (table-A/B xlsx) used to curate data.js
└── public/             # Mirror of the static files (see note below)
```

> **Note on `public/`:** this directory currently mirrors the four root files
> (`index.html`, `app.js`, `data.js`, `styles.css`). It exists for the static
> server used by `share.bat`. When editing, keep it in sync with the root files,
> or remove it once a single source of truth is chosen.

---

## Getting started

### Prerequisites

- [Node.js](https://nodejs.org/) 18+ (developed on Node 22)

### Install & run (local development)

```bash
npm install
npm run dev
```

`npm run dev` runs `vite --host`, which serves the app and prints a local URL
(usually `http://localhost:5173`). Open it in a browser.

### Run the tests

```bash
node smoke.test.js
```

The smoke test loads the app in jsdom, submits several profiles (including a
practitioner example and a name-correction case), and asserts every report
section renders with no `undefined`/`NaN` leaks. It exits `0` on success,
`1` on any failure.

---

## Sharing over HTTPS (`share.bat`)

`share.bat` (Windows only) starts a local static server and tunnels it through
Cloudflare so you get a public `https://…trycloudflare.com` URL without
deploying anywhere.

**Requirements (not committed to the repo — see `.gitignore`):**

- `tools/static-server.js` — a small Node static file server that serves the
  app on `http://localhost:8321`
- `tools/cloudflared.exe` — the [Cloudflare Tunnel](https://developers.cloudflare.com/cloudflare-one/connections/connect-networks/downloads/)
  client

Place both files in a `tools/` directory next to `share.bat` before using it.
Keep the terminal window open while sharing; close it to stop the tunnel. All
visitor data still stays in the visitor's browser.

> Cross-platform alternative (no `tools/` needed): run `npm run dev`, then in a
> second terminal run `npx localtunnel --port 5173` for a public URL.

---

## Deployment

The app is a set of static files with **no build step required** — `index.html`
loads `data.js` and `app.js` directly.

### GitHub Pages (simplest)

1. Push the repo to GitHub.
2. In **Settings → Pages**, set the source to the branch and folder containing
   the root files (e.g. `main` / `/ (root)`).
3. The app is served as-is at `https://<user>.github.io/numerovastu-360/`.

> If you prefer a production Vite build, add a `build` script
> (`"build": "vite build"`), run `npm run build`, and publish the generated
> `dist/` folder instead.

### Any static host

Upload `index.html`, `app.js`, `data.js` and `styles.css` to any static host
(Netlify, Vercel, S3, nginx, etc.). No server-side runtime is needed.

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
