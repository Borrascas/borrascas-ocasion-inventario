const CACHE_NAME = 'borrascas-v4';
const urlsToCache = [
  '/',
  '/index.html',
  '/icon.png',
  '/manifest.json'
];

// Install event - forzar activación inmediata
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        return cache.addAll(urlsToCache);
      })
      .then(() => {
        // Forzar que el nuevo service worker tome control inmediatamente
        return self.skipWaiting();
      })
  );
});

// Activate event - limpiar caches antiguos
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          // Borrar todos los caches que no sean el actual
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      // Tomar control de todas las pestañas abiertas
      return self.clients.claim();
    })
  );
});

// Fetch event - estrategia "Network First" para HTML y API, "Cache First" para assets
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);
  
  // Para archivos HTML y API: siempre intentar la red primero
  if (event.request.destination === 'document' || 
      url.pathname.includes('/api/') ||
      url.pathname.endsWith('.js') ||
      url.pathname.endsWith('.tsx') ||
      url.pathname.endsWith('.ts')) {
    
    event.respondWith(
      fetch(event.request)
        .then(response => {
          // Si la red funciona, actualizar cache y devolver respuesta
          if (response.status === 200) {
            const responseToCache = response.clone();
            caches.open(CACHE_NAME)
              .then(cache => {
                cache.put(event.request, responseToCache);
              });
          }
          return response;
        })
        .catch(() => {
          // Si la red falla, intentar cache
          return caches.match(event.request);
        })
    );
  } 
  // Para otros recursos (imágenes, fonts, etc.): cache first
  else {
    event.respondWith(
      caches.match(event.request)
        .then(response => {
          return response || fetch(event.request);
        })
    );
  }
});
