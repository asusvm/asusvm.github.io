const CACHE_NAME = 'app-v7'

self.addEventListener('install', (event) => {
    self.skipWaiting()
})

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then(keys =>
            Promise.all(
                keys.filter(key => key !== CACHE_NAME)
                    .map(key => caches.delete(key))
            )
        )
    )
    self.clients.claim()
})

self.addEventListener('fetch', (event) => {
    const url = event.request.url

    // assets (js/css/font)
    if (url.includes('/assets/')) {
        event.respondWith(cacheFirst(event.request))
        return
    }

    // images
    if (url.match(/\.(png|jpg|jpeg|svg|webp)$/)) {
        event.respondWith(staleWhileRevalidate(event.request))
        return
    }

    // index.html
    if (event.request.mode === 'navigate') {
        event.respondWith(networkFirst(event.request))
        return
    }

    // manifest + favicon
    if (url.includes('manifest') || url.includes('favicon')) {
        event.respondWith(staleWhileRevalidate(event.request))
        return
    }
})

async function cacheFirst(request) {
    const cache = await caches.open(CACHE_NAME)
    const cached = await cache.match(request)
    if (cached) return cached

    const response = await fetch(request)
    cache.put(request, response.clone())
    return response
}

async function networkFirst(request) {
    const cache = await caches.open(CACHE_NAME)
    try {
        const response = await fetch(request)
        cache.put(request, response.clone())
        return response
    } catch (err) {
        return await cache.match(request)
    }
}

async function staleWhileRevalidate(request) {
    const cache = await caches.open(CACHE_NAME)
    const cached = await cache.match(request)

    const fetchPromise = fetch(request).then(response => {
        cache.put(request, response.clone())
        return response
    })

    return cached || fetchPromise
}

self.addEventListener("push", (event) => {
    const data = event.data?.json() || {}

    self.registration.showNotification(data.title || "Bildirim", {
        body: data.body || "Mesaj yok",
        icon: "/favicon.png",
    });
});

self.addEventListener("notificationclick", (event) => {
    event.notification.close()
    event.waitUntil(clients.openWindow("/#/odeme"))
});