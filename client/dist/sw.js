const VERSION = 1;
const ASSETS_CACHE_PREFIX = "pwa-assets";
const INDEXDB_NAME = "pwa-chat-data";
const ASSETS_CACHE_NAME = `${ASSETS_CACHE_PREFIX}-${VERSION}`;
const urlsToCache = [
    "/",
    "/index.js",
    "/history.js",
    "/output.css",
]

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(ASSETS_CACHE_NAME)
            .then((cache) => {
                return cache.addAll(urlsToCache);
            })
    );

    let openRequest = indexedDB.open(INDEXDB_NAME, 1);
    openRequest.onupgradeneeded = (event) => {
        let db = event.target.result;
        db.createObjectStore("users", {keyPath: "username"});
        db.createObjectStore("conversations", {keyPath: "id"});
        db.createObjectStore("messages", {keyPath: "id"});
    }
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
    else if (path.includes("/users") || path.includes("/conversations")){
        event.respondWith(async function() {
            let response;
            try {
                response = await fetch(event.request);

                lazyUpdateIndexDB(response.clone());
                return response;
            } catch (error){
                let url = new URL(request.url);

                if(url.pathname.includes("/messages")){
                    let messageId = url.pathname.split("/")[2];
                    const payload = await new Promise((resolve, reject) => {
                        let openRequest = indexedDB.open(INDEXDB_NAME, 1);
                        openRequest.onsuccess = () => {
                            let db = openRequest.result;
                            let transaction = db.transaction("messages", "readonly");
                            let store = transaction.objectStore("messages");
                            let getRequest = store.get(messageId);
                            getRequest.onsuccess = () => resolve(getRequest.result);
                            getRequest.onerror = () => reject("error");
                        }
                    })
                    return createResponseFromIndexDB(payload.messages);
                }

                if(url.pathname.includes("/users")){
                    const payload = await new Promise((resolve, reject) => {
                        let openRequest = indexedDB.open(INDEXDB_NAME, 1);
                        openRequest.onsuccess = () => {
                            let db = openRequest.result;
                            let transaction = db.transaction("users", "readonly");
                            let store = transaction.objectStore("users");
                            let getRequest = store.getAll();
                            getRequest.onsuccess = () => resolve(getRequest.result);
                            getRequest.onerror = () => reject("error");
                        }
                    })
                    return createResponseFromIndexDB(payload);
                } else if(url.pathname.includes("/conversations") && url.pathname.split("/")[2] === undefined){
                    const payload = await new Promise((resolve, reject) => {
                        let openRequest = indexedDB.open(INDEXDB_NAME, 1);
                        openRequest.onsuccess = () => {
                            let db = openRequest.result;
                            let transaction = db.transaction("conversations", "readonly");
                            let store = transaction.objectStore("conversations");
                            let getRequest = store.getAll();
                            getRequest.onsuccess = () => resolve(getRequest.result);
                            getRequest.onerror = () => reject("error");
                        }
                    })
                    return createResponseFromIndexDB(payload);
                }
            }
        }())
    }
    if (urlsToCache.includes(path)) {
        event.respondWith(
            caches.open(ASSETS_CACHE_NAME)
                .then((cache) => cache.match(event.request))
        )
    }
});

function createResponseFromIndexDB(data){
    let response = new Response(JSON.stringify(data), {
        headers: {"Content-Type": "application/json"},
        status: 200
    })
    return response;
}

async function lazyUpdateIndexDB(response){
    let url = new URL(response.url);

    if(url.pathname.includes("/messages")){
        let messages = await response.json();
        let messageId = url.pathname.split("/")[2];
        let wrapper = {
            id: messageId,
            messages: messages
        }

        let openRequest = indexedDB.open(INDEXDB_NAME, 1);
        openRequest.onsuccess = () => {
            let db = openRequest.result;
            let transaction = db.transaction("messages", "readwrite");
            let store = transaction.objectStore("messages");
            store.put(wrapper);

        }
    }

    if(url.pathname.includes("/users")){
        let users = await response.json();
        let openRequest = indexedDB.open(INDEXDB_NAME, 1);
        openRequest.onsuccess = () => {
            let db = openRequest.result;
            let transaction = db.transaction("users", "readwrite");
            let store = transaction.objectStore("users");
            users.forEach((user) => {
                store.put(user);
            })
        }
    }
    if (url.pathname.includes("/conversations") && url.pathname.split("/")[2] === undefined){
        let conversations = await response.json();
        let openRequest = indexedDB.open(INDEXDB_NAME, 1);
        openRequest.onsuccess = () => {
            let db = openRequest.result;
            let transaction = db.transaction("conversations", "readwrite");
            let store = transaction.objectStore("conversations");
            conversations.forEach((user) => {
                store.put(user);
            })
        }
    }

}

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