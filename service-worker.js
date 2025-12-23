/* =========================================================
   SERVICE WORKER
   Sitemap Generator PWA
   Frontend-only | Future-ready
========================================================= */

/* ===============================
   VERSIONING
   (Change version to trigger update)
=============================== */
const SW_VERSION = "v1.0.0";
const CACHE_NAME = `sitemap-generator-${SW_VERSION}`;

/* ===============================
   CORE FILES (APP SHELL)
   Add/remove carefully
=============================== */
const APP_SHELL = [
  "./",
  "/SitemapGeneratorXml/index.htm",
  "/SitemapGeneratorXml/index.css",
  "/SitemapGeneratorXml/index.js",
  "/SitemapGeneratorXml/manifest.json",
  "/SitemapGeneratorXml/seo.js",
  "/SitemapGeneratorXml/pwa.js",
  "/SitemapGeneratorXml/README.md",
  "/SitemapGeneratorXml/LICENSE",
  "/SitemapGeneratorXml/AccountSetUp.htm",
  "/SitemapGeneratorXml/Assets/icon-192.png",
  "/SitemapGeneratorXml/Assets/icon-72.png",
  "/SitemapGeneratorXml/Assets/icon-96.png",
  "/SitemapGeneratorXml/Assets/icon-128.png",
  "/SitemapGeneratorXml/Assets/icon-144.png",
  "/SitemapGeneratorXml/Assets/icon-256.png",
  "/SitemapGeneratorXml/Assets/icon-384.png",
  "/SitemapGeneratorXml/Assets/icon-512.png",

  // External CDN files (cached after first load)
  "https://cdn.jsdelivr.net/npm/bootstrap-icons/font/bootstrap-icons.css",
  "https://cdn.jsdelivr.net/npm/jszip@3.10.1/dist/jszip.min.js",
  "https://cdn.jsdelivr.net/npm/jspdf@2.5.1/dist/jspdf.umd.min.js"
];

/* =========================================================
   INSTALL
   - Cache core files
========================================================= */
self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(APP_SHELL);
    })
  );

  // Activate immediately (important for updates)
  self.skipWaiting();
});

/* =========================================================
   ACTIVATE
   - Clean old caches
   - Notify clients about update
========================================================= */
self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.map(key => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      )
    )
  );

  // Take control immediately
  self.clients.claim();

  // Notify open tabs that SW is updated
  notifyClients({ type: "SW_UPDATED", version: SW_VERSION });
});

/* =========================================================
   FETCH STRATEGY
   - Cache First for App Shell
   - Network First for everything else
========================================================= */
self.addEventListener("fetch", event => {
  const req = event.request;

  // Ignore non-GET
  if (req.method !== "GET") return;

  event.respondWith(
    caches.match(req).then(cacheRes => {
      if (cacheRes) {
        return cacheRes;
      }

      return fetch(req)
        .then(networkRes => {
          return caches.open(CACHE_NAME).then(cache => {
            cache.put(req, networkRes.clone());
            return networkRes;
          });
        })
        .catch(() => offlineFallback(req));
    })
  );
});

/* =========================================================
   OFFLINE FALLBACK
   (Extendable in future)
========================================================= */
function offlineFallback(request) {
  if (request.destination === "document") {
    return caches.match("/SitemapGeneratorXml/index.htm");
  }
  return new Response("", { status: 503, statusText: "Offline" });
}

/* =========================================================
   UPDATE / MESSAGE CHANNEL
   Used by future pwa.js
========================================================= */
self.addEventListener("message", event => {
  if (!event.data) return;

  if (event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});

/* =========================================================
   CLIENT NOTIFICATION HELPER
========================================================= */
function notifyClients(message) {
  self.clients.matchAll({ includeUncontrolled: true }).then(clients => {
    clients.forEach(client => {
      client.postMessage(message);
    });
  });
}