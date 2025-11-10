const CACHE_NAME = 'intermobil-v1.0.0';
const urlsToCache = [
  '/',
  '/static/js/bundle.js',
  '/static/css/main.css',
  '/site.webmanifest',
  '/site.webmanifest?v=2',
  '/icon-192x192.png',
  '/icon-512x512.png'
];

// Installazione del Service Worker
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Cache aperta');
        return cache.addAll(urlsToCache);
      })
  );
  self.skipWaiting();
});

// Attivazione del Service Worker
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('Cancellazione cache vecchia:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Strategia di cache: Network First con fallback alla cache
self.addEventListener('fetch', event => {
  event.respondWith(
    fetch(event.request)
      .then(response => {
        // Clona la risposta perché è uno stream
        const responseClone = response.clone();
        
        // Solo cache le richieste GET con status 200
        if (event.request.method === 'GET' && response.status === 200) {
          caches.open(CACHE_NAME)
            .then(cache => {
              cache.put(event.request, responseClone);
            });
        }
        
        return response;
      })
      .catch(() => {
        // Se la rete fallisce, prova la cache
        return caches.match(event.request)
          .then(response => {
            if (response) {
              return response;
            }
            // Se neanche la cache ha la risorsa, restituisci una pagina offline
            if (event.request.mode === 'navigate') {
              return caches.match('/');
            }
          });
      })
  );
});

// Gestione messaggi dal client
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// Notifiche push (opzionale per future implementazioni)
self.addEventListener('push', event => {
  if (event.data) {
    const data = event.data.json();
    const options = {
      body: data.body,
      icon: '/icon-192x192.png',
      badge: '/icon-192x192.png',
      vibrate: [100, 50, 100],
      data: {
        dateOfArrival: Date.now(),
        primaryKey: '1'
      },
      actions: [
        {
          action: 'explore',
          title: 'Visualizza',
          icon: '/icon-192x192.png'
        },
        {
          action: 'close',
          title: 'Chiudi',
          icon: '/icon-192x192.png'
        }
      ]
    };
    
    event.waitUntil(
      self.registration.showNotification(data.title, options)
    );
  }
});

// Gestione click sulle notifiche
self.addEventListener('notificationclick', event => {
  event.notification.close();
  
  if (event.action === 'explore') {
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});