/* Satria PWA service worker.
 *
 * Strategy:
 *   - HTML navigation:    network-first, fall back to cached shell.
 *   - Static Next assets: stale-while-revalidate (cache-first + bg refresh).
 *   - API requests:       network-first; cached responses returned offline.
 *   - Other GETs:         stale-while-revalidate.
 *
 * The MSW worker (mockServiceWorker.js) is registered separately in dev
 * builds; this worker only registers in production.
 */
const VERSION = "satria-v2";
const SHELL_CACHE = `${VERSION}-shell`;
const ASSET_CACHE = `${VERSION}-assets`;
const API_CACHE   = `${VERSION}-api`;

// Core app shell — these are pre-fetched on install so the app works offline.
const PRECACHE = [
  "/",
  "/home",
  "/manifest.webmanifest",
  "/icons/icon-192.png",
  "/icons/icon-512.png",
  "/icons/maskable-512.png",
  "/icons/apple-touch-icon.png",
];

// ─── Lifecycle ──────────────────────────────────────────────────────────────

self.addEventListener("install", (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(SHELL_CACHE).then((cache) =>
      Promise.allSettled(PRECACHE.map((url) => cache.add(url))),
    ),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      // Remove all caches from previous versions.
      const keys = await caches.keys();
      await Promise.all(
        keys
          .filter((k) => !k.startsWith(VERSION))
          .map((k) => caches.delete(k)),
      );
      await self.clients.claim();
    })(),
  );
});

// ─── Helpers ────────────────────────────────────────────────────────────────

function isAsset(url) {
  return (
    url.pathname.startsWith("/_next/static/") ||
    url.pathname.startsWith("/icons/") ||
    /\.(?:js|css|woff2?|ttf|png|jpg|jpeg|svg|webp|ico)$/i.test(url.pathname)
  );
}

function isApi(url) {
  return (
    url.pathname.startsWith("/api/") ||
    url.hostname === "api.myquran.com" ||
    url.hostname === "api.bigdatacloud.net" ||
    url.hostname === "api-bdc.io" ||
    url.hostname === "api.ahmadsanusi.com"
  );
}

async function refresh(request, cache) {
  try {
    const response = await fetch(request);
    if (response.ok) cache.put(request, response.clone());
  } catch {
    /* offline – ignore */
  }
}

/** Cache-first with background revalidation (stale-while-revalidate). */
async function cacheFirst(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);
  if (cached) {
    refresh(request, cache); // update in background
    return cached;
  }
  const response = await fetch(request);
  if (response.ok) cache.put(request, response.clone());
  return response;
}

/** Network-first with cache fallback. */
async function networkFirst(request, cacheName, fallbackPath) {
  const cache = await caches.open(cacheName);
  try {
    const response = await fetch(request);
    if (response.ok) cache.put(request, response.clone());
    return response;
  } catch {
    const cached = await cache.match(request);
    if (cached) return cached;
    if (fallbackPath) {
      // Try shell cache first, then asset cache for the fallback path.
      const shellCache = await caches.open(SHELL_CACHE);
      const fallback =
        (await shellCache.match(fallbackPath)) ??
        (await cache.match(fallbackPath));
      if (fallback) return fallback;
    }
    // Last resort: return a minimal offline response so the browser doesn't
    // show a generic "no connection" error page.
    return new Response(
      '<!doctype html><html><head><meta charset="utf-8"><title>Satria</title></head><body><p>Tidak ada koneksi internet. Silakan coba lagi.</p></body></html>',
      { status: 200, headers: { "Content-Type": "text/html; charset=utf-8" } },
    );
  }
}

// ─── Fetch handler ──────────────────────────────────────────────────────────

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  const url = new URL(request.url);

  // HTML navigations — network-first, fall back to /home shell.
  if (request.mode === "navigate") {
    event.respondWith(networkFirst(request, SHELL_CACHE, "/home"));
    return;
  }

  // Same-origin static assets — cache-first.
  if (url.origin === self.location.origin && isAsset(url)) {
    event.respondWith(cacheFirst(request, ASSET_CACHE));
    return;
  }

  // API requests (own + third-party) — network-first.
  if (isApi(url)) {
    event.respondWith(networkFirst(request, API_CACHE));
    return;
  }
});
