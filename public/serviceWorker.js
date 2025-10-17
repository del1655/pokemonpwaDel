// public/service-worker.js

const CACHE_NAME = 'pokepwa-static-v1';
const DATA_CACHE = 'pokepwa-data-v1';

const FILES_TO_CACHE = [
  '/', 
  '/index.html',
  '/favicon.ico',
  '/manifest.json',
];

// Install - precache
self.addEventListener('install', evt => {
  console.log('[SW] Install');
  evt.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(FILES_TO_CACHE);
    })
  );
  self.skipWaiting();
});

// Activate - cleanup old caches
self.addEventListener('activate', evt => {
  console.log('[SW] Activate');
  evt.waitUntil(
    caches.keys().then(keyList =>
      Promise.all(
        keyList.map(key => {
          if (key !== CACHE_NAME && key !== DATA_CACHE) {
            console.log('[SW] Removing old cache', key);
            return caches.delete(key);
          }
        })
      )
    )
  );
  self.clients.claim();
});

// Fetch - estrategia:
// - Para peticiones a la API: network-first (intenta red, si falla devuelve cache)
// - Para archivos estáticos: cache-first
self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);

  // Si es la API de pokeapi.co
  if (url.origin === 'https://pokeapi.co') {
    event.respondWith(
      caches.open(DATA_CACHE).then(async cache => {
        try {
          const response = await fetch(request);
          // guardar copia en cache
          if (response && response.status === 200) {
            cache.put(request, response.clone());
          }
          return response;
        } catch (err) {
          // si falla la red, tratar de devolver cache
          const cached = await cache.match(request);
          if (cached) return cached;
          // fallback simple
          return new Response(JSON.stringify({ error: 'offline' }), {
            status: 503,
            headers: { 'Content-Type': 'application/json' }
          });
        }
      })
    );
    return;
  }

  // Para recursos del mismo dominio (assets)
  event.respondWith(
    caches.match(request).then(response => {
      return response || fetch(request).then(fetchRes => {
        // opcional: cachear nuevos requests
        return caches.open(CACHE_NAME).then(cache => {
          cache.put(request, fetchRes.clone());
          return fetchRes;
        });
      }).catch(() => {
        if (request.destination === 'image') {
          return new Response('', { status: 404 });
        }
      });
    })
  );
});
