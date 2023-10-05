const VERSION = 1;
const ASSETS_CACHE_PREFIX = "pwa-assets";
const ASSETS_CACHE_NAME = `${ASSETS_CACHE_PREFIX}-${VERSION}`;
const urlsToCache = [
    "/",
    "/index.js",
    "/output.css",
]

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(ASSETS_CACHE_NAME)
            .then((cache) => {
                return cache.addAll(urlsToCache);
            })
    );
});

self.addEventListener('fetch', (event) => {
    const {request} = event;

    const path = new URL(request.url).pathname;
    console.log('Path: ' + path);

    if (path.includes("/images")) {
        event.respondWith((async function () {
            const cache = await caches.open(ASSETS_CACHE_NAME);
            const cachedResponse = await cache.match(request);

            if (cachedResponse) {
                return cachedResponse;
            }

            const response = await fetch(request);
            await cache.put(request, response.clone());

            return response;
        })());
    }
    if (urlsToCache.includes(path)) {
        event.respondWith(
            caches.open(ASSETS_CACHE_NAME)
                .then((cache) => cache.match(event.request))
        )
    }
});

self.addEventListener('activate', (event) => {
    const cacheWhitelist = [];
    cacheWhitelist.push(ASSETS_CACHE_NAME);

    event.waitUntil(
        caches.keys().then((cacheNames) => Promise.all(
            cacheNames.map((cacheName) => {
                if (!cacheWhitelist.includes(cacheName)) {
                    return caches.delete(cacheName);
                }
            })
        ))
    );
});

