// Offline support: the app shell and static files are cached on first use; API
// responses are cached each time they load, and served when the network is down.
const CACHE = 'thiruppugazh-v1';
const SHELL = ['/', '/icon.svg', '/logo.svg'];

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(SHELL)));
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (event) => {
  const request = event.request;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  const isStatic =
    url.pathname.startsWith('/_next/static/') ||
    url.pathname.startsWith('/images/') ||
    url.pathname.startsWith('/audio/');

  event.respondWith(
    (async () => {
      const cache = await caches.open(CACHE);
      if (isStatic) {
        const cached = await cache.match(request);
        if (cached) return cached;
      }
      try {
        const response = await fetch(request);
        if (response.ok) cache.put(request, response.clone());
        return response;
      } catch (error) {
        const cached = await cache.match(request);
        if (cached) return cached;
        if (request.mode === 'navigate') return (await cache.match('/')) || Response.error();
        throw error;
      }
    })()
  );
});
