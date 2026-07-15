const CACHE_NAME = 'apexon-vault-v3';
const ASSETS = [
  '/',
  '/index.html',
  '/user-dashboard.html',
  '/cryptocurrency.html',
  '/loans.html',
  '/card.html',
  '/profile.html',
  '/settings.html'
];

// Safe install that skips missing files instead of breaking
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return Promise.allSettled(
        ASSETS.map(asset => {
          return cache.add(asset).catch(err => {
            console.warn(`Asset skipped (not found on server): ${asset}`);
          });
        })
      );
    }).then(() => self.skipWaiting())
  );
});

// Activate event: Clean up old caches if CACHE_NAME changes
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            console.log(`Clearing old cache: ${key}`);
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Resilient Network-First / Cache-Fallback interception
self.addEventListener('fetch', (e) => {
  e.respondWith(
    // Always try the network first so the user gets real-time data
    fetch(e.request)
      .then((networkResponse) => {
        // If the request is successful, clone it and save it to cache
        if (networkResponse && networkResponse.status === 200 && e.request.method === 'GET') {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(e.request, responseToCache);
          });
        }
        return networkResponse;
      })
      .catch(() => {
        // If network fails, try to serve from Cache
        return caches.match(e.request).then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse;
          }
          // If BOTH network and cache fail, return a fallback response (prevents browser crash)
          return new Response('Network connection lost. Please check your internet.', {
            status: 503,
            headers: { 'Content-Type': 'text/plain' }
          });
        });
      })
  );
});
