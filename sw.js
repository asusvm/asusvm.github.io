self.addEventListener('push', event => {
    const data = event.data.json();

    self.registration.showNotification(data.title, {
        body: data.body,
        icon: '/route-64.png'
    });
});

const CACHE_NAME = 'cache-202509161600';
const CACHE_ASSETS = [
    '/assets/index-DMmwRdCv.js',
    '/assets/index-Cl6_3Zk7.css',
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
            return cachedResponse || fetch(event.request);
        })
    );
});