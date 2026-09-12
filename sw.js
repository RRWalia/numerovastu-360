/* ============================================================
   NumeroVastu 360 — service worker
   Purpose: make the app installable and genuinely usable offline
   for field consultations. Nothing else.

   Deliberate design rules:

   1. NEVER cache personal data. The app computes everything
      in-page and persists to localStorage, which is not
      intercepted here. This worker only sees static assets.
   2. Stale-while-revalidate for shell assets, so a practitioner
      never waits on a network round trip mid-consultation, but
      the next load always picks up a new deployment.
   3. The knowledge pack is fetched network-first with a cache
      fallback. The app already has a bundled pack and its own
      version negotiation in app.js (refreshKnowledgePack), so
      the worker must not serve a stale pack in preference to a
      newer one that is actually reachable.
   4. Never respond to non-GET, cross-origin, or range requests.
      Offline map tiles and atlas lookups go straight to network.

   Bump CACHE_VERSION on any change to this file or to the
   precache list; the activate handler deletes old caches.
   ============================================================ */
const CACHE_VERSION = "nv360-v2.9.0";
const SHELL_CACHE = `${CACHE_VERSION}-shell`;
const PACK_CACHE = `${CACHE_VERSION}-pack`;

/* Precache list. Paths are relative to the worker scope so the app works when
   deployed at a sub-path (e.g. GitHub Pages project site). */
const SHELL_ASSETS = [
  "./",
  "./index.html",
  "./app.js",
  "./astro.js",
  "./data.js",
  "./i18n.js",
  "./styles.css",
  "./manifest.webmanifest",
  "./icons/icon-192.png",
  "./icons/icon-512.png",
  "./icons/maskable-512.png",
  "./icons/apple-touch-icon.png",
  "./icons/favicon-48.png"
];

/* Physics/geography atlas chunks are large and only used when a birthplace is
   searched, so they are cached on first use rather than at install. */
const ATLAS_PREFIX = "./atlas/";

self.addEventListener("install", (event) => {
  event.waitUntil((async () => {
    const cache = await caches.open(SHELL_CACHE);
    // Individual put() rather than addAll(): one 404 must not abort install.
    await Promise.all(SHELL_ASSETS.map(async (url) => {
      try {
        const res = await fetch(new Request(url, { cache: "reload" }));
        if (res && res.ok) await cache.put(url, res);
      } catch (err) {
        // Offline or missing optional asset — carry on with what we have.
      }
    }));
  })());
});

self.addEventListener("activate", (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(
      keys.filter((key) => key.startsWith("nv360-") && !key.startsWith(CACHE_VERSION))
        .map((key) => caches.delete(key))
    );
    // Serve the freshly installed shell as soon as possible.
    if (self.registration.navigationPreload) {
      try { await self.registration.navigationPreload.disable(); } catch (err) { /* optional */ }
    }
    await self.clients.claim();
  })());
});

const isCacheable = (request, url) =>
  request.method === "GET" &&
  url.origin === self.location.origin &&
  !request.headers.has("range");

/* Network-first: used for the knowledge pack, where a stale response is worse
   than a slow one. Falls back to cache only when the network genuinely fails. */
async function networkFirst(request, cacheName) {
  const cache = await caches.open(cacheName);
  try {
    const res = await fetch(request);
    if (res && res.ok) cache.put(request, res.clone());
    return res;
  } catch (err) {
    const cached = await cache.match(request, { ignoreSearch: true });
    if (cached) return cached;
    throw err;
  }
}

/* Stale-while-revalidate: instant response from cache, background refresh. */
async function staleWhileRevalidate(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request, { ignoreSearch: true });
  const network = fetch(request)
    .then((res) => {
      if (res && res.ok) cache.put(request, res.clone());
      return res;
    })
    .catch(() => null);
  if (cached) return cached;
  const res = await network;
  if (res) return res;
  throw new Error("offline and not cached");
}

self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (!isCacheable(request, new URL(request.url))) return;

  const url = new URL(request.url);

  // Navigations: serve the shell so a cold offline launch still opens the app.
  if (request.mode === "navigate") {
    event.respondWith((async () => {
      try {
        return await staleWhileRevalidate(new Request("./index.html"), SHELL_CACHE);
      } catch (err) {
        const cache = await caches.open(SHELL_CACHE);
        return (await cache.match("./index.html")) || (await cache.match("./")) ||
          new Response("<h1>NumeroVastu 360 is offline</h1><p>Reconnect once to install the offline copy.</p>",
            { status: 503, headers: { "Content-Type": "text/html; charset=utf-8" } });
      }
    })());
    return;
  }

  // Knowledge pack and its manifest: freshness matters more than speed.
  if (url.pathname.includes("/knowledge-pack/")) {
    event.respondWith(networkFirst(request, PACK_CACHE).catch(() =>
      new Response(JSON.stringify({ error: "offline" }), {
        status: 503, headers: { "Content-Type": "application/json" }
      })));
    return;
  }

  // Atlas chunks: cache on first use, then offline-first.
  if (url.pathname.includes("/atlas/")) {
    event.respondWith(staleWhileRevalidate(request, SHELL_CACHE).catch(() =>
      new Response("", { status: 504 })));
    return;
  }

  event.respondWith(staleWhileRevalidate(request, SHELL_CACHE));
});

self.addEventListener("message", (event) => {
  if (event.data === "nv-skip-waiting") self.skipWaiting();
  if (event.data === "nv-cache-version") {
    event.source && event.source.postMessage && event.source.postMessage({ cacheVersion: CACHE_VERSION });
  }
});
