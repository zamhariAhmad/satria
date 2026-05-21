/* Satria PWA service worker.
 *
 * Strategy:
 *   - HTML navigation:    network-first, fall back to cached shell.
 *   - Static Next assets: stale-while-revalidate.
 *   - API requests:       network-first; cached responses returned offline.
 *   - Other GETs:         stale-while-revalidate.
 *
 * The MSW worker (mockServiceWorker.js) is registered separately in dev
 * builds; this worker only registers in production.
 */
const VERSION = "satria-v1";
const SHELL_CACHE = `${VERSION}-shell`;
const ASSET_CACHE = `${VERSION}-assets`;
const API_CACHE = `${VERSION}-api`;

const PRECACHE = ["/", "/home", "/manifest.webmanifest"];

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

async function cacheFirst(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);
  if (cached) {
    refresh(request, cache);
    return cached;
  }
  const response = await fetch(request);
  if (response.ok) cache.put(request, response.clone());
  return response;
}

async function refresh(request, cache) {
  try {
    const response = await fetch(request);
    if (response.ok) cache.put(request, response.clone());
  } catch {
    /* offline */
  }
}

async function networkFirst(request, cacheName, fallbackPath) {
  const cache = await caches.open(cacheName);
  try {
    const response = await fetch(request);
    if (response.ok) cache.put(request, response.clone());
    return response;
  } catch (err) {
    const cached = await cache.match(request);
    if (cached) return cached;
    if (fallbackPath) {
      const fallback = await cache.match(fallbackPath);
      if (fallback) return fallback;
    }
    throw err;
  }
}

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;
  const url = new URL(request.url);

  // Same-origin only for navigation/asset routing; cross-origin GETs go SWR.
  if (request.mode === "navigate") {
    event.respondWith(networkFirst(request, SHELL_CACHE, "/home"));
    return;
  }

  if (url.origin === self.location.origin && isAsset(url)) {
    event.respondWith(cacheFirst(request, ASSET_CACHE));
    return;
  }

  if (isApi(url)) {
    event.respondWith(networkFirst(request, API_CACHE));
    return;
  }
});
