self.addEventListener('push', event => {
    const data = event.data.json();

    self.registration.showNotification(data.title, {
        body: data.body,
        icon: '/icon.png' // isteğe bağlı ikon
    });
});

const CACHE_NAME = 'cache-202509161302';
const CACHE_ASSETS = [
    '/assets/index-C0cFjg1D.js',
    '/assets/index-54UNzwDZ.css',
    '/route-64.png',
    '/route-192.png',
    '/route-512.png'
];

self.addEventListener('install', (event) => {
    console.log('Service Worker: Install');

    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => {
            console.log('Caching files...');
            return cache.addAll(CACHE_ASSETS);
        })
    );
});

self.addEventListener('activate', (event) => {
    console.log('Service Worker: Activate');

    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(name => {
                    if (name !== CACHE_NAME) {
                        console.log('Deleting old cache:', name);
                        return caches.delete(name);
                    }
                })
            );
        })
    );
});

self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request).then(cachedResponse => {
            // Cache'de varsa onu döndür, yoksa ağdan iste
            return cachedResponse || fetch(event.request);
        })
    );
});