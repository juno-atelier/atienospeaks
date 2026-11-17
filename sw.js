/* ============================================================
   sw.js — Service worker (project root so it can control "/").
   Cache-first for static assets, network-first for HTML.
   Bump CACHE_NAME whenever a cached file changes.
   ============================================================ */

const CACHE_NAME = "atieno-v9";

// Every file in main.js's import graph + first-paint assets.
// cache.addAll() is atomic: ONE missing file fails the whole install,
// so every path below must exist in the deploy.
const CACHE_ASSETS = [
  "index.html",
  "css/tokens.css", "css/reset.css", "css/global.css",
  "css/navbar.css", "css/footer.css", "css/home.css",
  "js/utils.js", "js/plugins.js", "js/main.js",
  "js/modules/nav.js", "js/modules/reveal.js",
  "js/modules/parallax.js", "js/modules/journey.js", "js/modules/counters.js",
  "js/modules/library.js", "js/modules/micro.js", "js/modules/fab.js",
  "js/modules/sw.js",
  "vendor/gsap.min.js", "vendor/ScrollTrigger.min.js", "vendor/anime.min.js",
  "assets/img/logo.webp",
  "assets/img/atieno-cutout.webp", "assets/img/atieno-cutout.png",
  "assets/img/cursor-gavel.png", "assets/img/cursor-gavel@2x.png",
  "assets/img/portrait.webp", "assets/img/portrait.jpg",   // #professional
  // Library covers: WebP only (the PNG fallbacks are runtime-cached if ever requested)
  "assets/img/books/adr-african-justice.webp", "assets/img/books/in-his-court.webp",
  "assets/img/books/beyond-the-books.webp", "assets/img/books/365-days-to-success.webp",
  "assets/textures/wood.svg",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(CACHE_ASSETS)).then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys()
      .then((names) => Promise.all(
        names.filter((n) => n.startsWith("atieno-") && n !== CACHE_NAME).map((n) => caches.delete(n))
      ))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;

  const url = new URL(req.url);
  if (url.origin !== location.origin) return; // let the browser handle cross-origin (fonts)

  const isHTML = req.mode === "navigate" || req.headers.get("accept")?.includes("text/html");

  if (isHTML) {
    // Network-first so content updates reach users; fall back to cache offline.
    event.respondWith(
      fetch(req)
        .then((res) => {
          const copy = res.clone();
          caches.open(CACHE_NAME).then((c) => c.put(req, copy));
          return res;
        })
        .catch(() => caches.match(req).then((r) => r || caches.match("index.html")))
    );
    return;
  }

  // Cache-first for static assets.
  event.respondWith(
    caches.match(req).then((cached) =>
      cached ||
      fetch(req).then((res) => {
        if (res.ok && res.status === 200 && res.type === "basic") {
          const copy = res.clone();
          caches.open(CACHE_NAME).then((c) => c.put(req, copy));
        }
        return res;
      }).catch(() => new Response("", { status: 503 }))
    )
  );
});
