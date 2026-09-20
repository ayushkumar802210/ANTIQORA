const CACHE_NAME = 'antiqora-v2';
const CORE_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/apple-touch-icon.png',
  '/icon.svg',
  '/pwa-192x192.png',
  '/pwa-512x512.png'
];

// Install Event: Pre-cache core assets resiliently
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(async (cache) => {
      for (const asset of CORE_ASSETS) {
        try {
          await cache.add(asset);
        } catch (err) {
          console.warn(`[SW] Pre-cache skipped for ${asset}:`, err);
        }
      }
    })
  );
  self.skipWaiting();
});

// Activate Event: Clean up legacy caches and claim clients immediately
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      );
    })
  );
  self.clients.claim();
});

// Skip waiting message handler
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// Fetch Event: Smart routing & SPA offline fallback
self.addEventListener('fetch', (event) => {
  const { request } = event;

  // 1. Bypass non-GET requests
  if (request.method !== 'GET') return;

  const url = new URL(request.url);

  // 2. Bypass API requests to allow backend handling
  if (url.pathname.startsWith('/api/')) return;

  // 3. Navigation Requests (SPA pages & home screen launches)
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((networkResponse) => {
          if (!networkResponse || networkResponse.status !== 200) {
            return caches.match('/index.html') || networkResponse;
          }
          // Clone & update index.html in cache
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put('/index.html', responseToCache));
          return networkResponse;
        })
        .catch(async () => {
          // Offline fallback to cached SPA shell
          const cachedIndex = await caches.match('/index.html') || await caches.match('/');
          if (cachedIndex) return cachedIndex;

          return new Response(
            `<!DOCTYPE html><html><body style="font-family:sans-serif;text-align:center;padding:2rem;background:#090a0f;color:#fff;">
              <h2>ANTIQORA Offline</h2>
              <p>Please check your internet connection and reload.</p>
            </body></html>`,
            { headers: { 'Content-Type': 'text/html' } }
          );
        })
    );
    return;
  }

  // 4. Static Assets & Resources: Cache-First with Network Fallback
  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      if (cachedResponse) {
        // Fetch background update for cache freshness
        fetch(request).then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            caches.open(CACHE_NAME).then((cache) => cache.put(request, networkResponse));
          }
        }).catch(() => {});
        return cachedResponse;
      }

      return fetch(request).then((networkResponse) => {
        if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
          return networkResponse;
        }
        const responseToCache = networkResponse.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(request, responseToCache));
        return networkResponse;
      }).catch(() => {
        // Fallback for image requests
        if (request.destination === 'image') {
          return caches.match('/pwa-192x192.png');
        }
      });
    })
  );
});
