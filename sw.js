const CACHE_NAME = 'apexon-vault-v3';
const ASSETS = [
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
    })
  );
});

// Resilient request interception
self.addEventListener('fetch', (e) => {
  e.respondWith(
    caches.match(e.request).then((cachedResponse) => {
      // Serve cached file if available, otherwise fetch from network
      return cachedResponse || fetch(e.request).catch(() => {
        // Fallback safety so the user doesn't get a browser crash screen
        console.log('Network request failed and asset not in cache.');
      });
    })
  );
});
