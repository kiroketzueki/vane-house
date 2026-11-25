/* Vane House service worker.
   Strategy: precache the whole game (it is small) so it works fully offline, then serve
   cache-first with background revalidation. BUMP `VERSION` WHENEVER ANY FILE CHANGES —
   that creates a fresh cache and removes the old one on activate. */
const VERSION = '2.1.0';
const CACHE = 'vane-house-v' + VERSION;

const PRECACHE = [
  './',
  './index.html',
  './styles.css',
  './story.js',
  './story-extra.js',
  './audio.js',
  './engine.js',
  './app.js',
  './manifest.json',
  './privacy.html',
  './icon-180.png',
  './icon-192.png',
  './icon-512.png',
  './icon-maskable-192.png',
  './icon-maskable-512.png',
  './icon-192.svg',
  './icon-512.svg',
  './img/victor.jpg',
  './img/camille.jpg',
  './img/julian.jpg',
  './img/clara.jpg'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) =>
      // cache:'reload' bypasses the browser HTTP cache so a new version never precaches stale files
      cache.addAll(PRECACHE.map((url) => new Request(url, { cache: 'reload' })))
    ).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k.startsWith('vane-house-') && k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('message', (event) => {
  if (event.data === 'SKIP_WAITING') self.skipWaiting();
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;          // never touch cross-origin requests
  if (url.pathname.includes('/.well-known/')) return;       // let Digital Asset Links go straight to the network

  event.respondWith((async () => {
    const cache = await caches.open(CACHE);
    const cached = await cache.match(req, { ignoreSearch: true });

    const refresh = fetch(req).then((resp) => {
      if (resp && resp.ok && resp.type === 'basic') cache.put(req, resp.clone());
      return resp;
    });

    if (cached) {
      refresh.catch(() => {});                              // revalidate quietly; ignore offline errors
      return cached;
    }
    try {
      return await refresh;
    } catch (err) {
      if (req.mode === 'navigate') {
        const fallback = await cache.match('./index.html');
        if (fallback) return fallback;
      }
      return new Response('Offline', { status: 503, statusText: 'Offline', headers: { 'Content-Type': 'text/plain' } });
    }
  })());
});
