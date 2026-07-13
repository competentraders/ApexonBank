const CACHE_NAME = 'apexon-vault-v1';
const ASSETS = [
  '/user-dashboard.html',
  '/cryptocurrency.html',
  '/loans.html',
  '/card.html',
  '/profile.html',
  '/settings.html'
];

// Install the Service Worker and cache essential interfaces
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS);
    })
  );
});

// Intercept network requests for instant asset delivery
self.addEventListener('fetch', (e) => {
  e.respondWith(
    caches.match(e.request).then((cachedResponse) => {
      return cachedResponse || fetch(e.request);
    })
  );
});
