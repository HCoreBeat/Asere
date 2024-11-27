const CACHE_NAME = 'slider-cache-v1';
const urlsToCache = [
    'img/fondo_promo_1.jpg',
    'img/fondo_promo_2.jpg',
    'img/fondo_promo_3.jpg'
];

self.addEventListener('install', function(event) {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(function(cache) {
                console.log('Opened cache');
                return cache.addAll(urlsToCache);
            })
            .catch(function(error) {
                console.error('Failed to open cache:', error);
            })
    );
});

self.addEventListener('fetch', function(event) {
    event.respondWith(
        caches.match(event.request)
            .then(function(response) {
                if (response) {
                    return response;
                }
                return fetch(event.request).catch(function() {
                    return new Response('Network error occurred');
                });
            })
    );
});

