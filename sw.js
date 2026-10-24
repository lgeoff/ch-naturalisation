// Network-first service worker: always tries to fetch the latest questions/news,
// falls back to the cached copy when offline.
const CACHE = 'natge-v5';
const CORE = ['./', 'index.html', 'styles.css', 'unlock.js', 'app.js', 'data/content.enc',
  'manifest.webmanifest', 'assets/icon.svg', 'assets/icon-180.png', 'assets/icon-192.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(CORE)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  if (e.request.method !== 'GET') return;
  const sameOrigin = url.origin === location.origin;
  const isImg = /upload\.wikimedia\.org$/.test(url.hostname);
  if (!sameOrigin && !isImg && !/fonts\.(googleapis|gstatic)\.com$/.test(url.hostname)) return;
  if (sameOrigin) {
    e.respondWith(fetch(e.request).then(r => {
      const copy = r.clone(); caches.open(CACHE).then(c => c.put(e.request, copy)); return r;
    }).catch(() => caches.match(e.request, { ignoreSearch: true })));
  } else {
    // images and fonts: cache-first
    e.respondWith(caches.match(e.request).then(hit => hit || fetch(e.request).then(r => {
      const copy = r.clone(); caches.open(CACHE).then(c => c.put(e.request, copy)); return r;
    })));
  }
});
