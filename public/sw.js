// Bulldog Planner - Service Worker
const CACHE_NAME = 'bulldog-planner-v1';
const OFFLINE_URL = '/offline';

const CACHED_URLS = [
  '/',
  '/agenda',
  '/evenementen',
  '/offline',
  '/manifest.json',
];

// Install
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(CACHED_URLS);
    })
  );
  self.skipWaiting();
});

// Activate
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    })
  );
  self.clients.claim();
});

// Fetch - Network first, fallback to cache
self.addEventListener('fetch', (event) => {
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request).catch(() => {
        return caches.match(OFFLINE_URL);
      })
    );
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        if (response.ok) {
          const cloned = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, cloned);
          });
        }
        return response;
      })
      .catch(() => caches.match(event.request))
  );
});

// Push notificaties ontvangen
self.addEventListener('push', (event) => {
  let data = {
    title: 'Bulldog Planner',
    body: 'Je hebt een nieuwe melding',
    icon: '/icons/icon-192.png',
    badge: '/icons/badge-72.png',
    url: '/',
  };

  if (event.data) {
    try {
      data = { ...data, ...event.data.json() };
    } catch (e) {
      data.body = event.data.text();
    }
  }

  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: data.icon,
      badge: data.badge,
      data: { url: data.url },
      vibrate: [200, 100, 200],
      tag: 'bulldog-planner',
      renotify: true,
    })
  );
});

// Notificatie klik
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const url = event.notification.data?.url || '/';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url === url && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(url);
      }
    })
  );
});

// Background sync voor offline acties
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-agenda') {
    event.waitUntil(syncAgenda());
  }
});

async function syncAgenda() {
  // Sync offline agenda items wanneer weer online
  const db = await openIndexedDB();
  const offlineItems = await db.getAll('offline-agenda');
  
  for (const item of offlineItems) {
    try {
      await fetch('/api/agenda', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(item),
      });
      await db.delete('offline-agenda', item.id);
    } catch (e) {
      console.error('Sync failed for item:', item.id);
    }
  }
}

function openIndexedDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('bulldog-planner', 1);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains('offline-agenda')) {
        db.createObjectStore('offline-agenda', { keyPath: 'id' });
      }
    };
  });
}
