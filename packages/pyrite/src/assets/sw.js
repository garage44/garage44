const workerVersion = 'pyrite-2'

self.addEventListener('install', function(event) {
    event.waitUntil(
        caches.open(workerVersion).then(function(cache) {
            return cache.addAll([])
        }),
    )
})

self.addEventListener('fetch', function(event) {
    event.respondWith(
        caches.match(event.request).then(function(response) {
            return response || fetch(event.request)
        }),
    )
})

self.addEventListener('activate', function(event) {
    event.waitUntil(
        caches.keys().then((keys) => {
            return Promise.all(
                keys.filter((key) => {
                    if (key !== workerVersion) {
                        return true
                    }
                    return false
                }).map((key) => caches.delete(key)),
            )
        }),
    )
})
