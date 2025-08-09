// PWA Service Worker for LukaMath Student App
const CACHE_NAME = 'lukamath-pwa-v1';
const urlsToCache = [
  '/pwa',
  '/pwa/login',
  '/pwa/register',
  '/pwa/dashboard',
  '/pwa/homework',
  '/pwa/progress',
  '/static/js/bundle.js',
  '/static/css/main.css',
  'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap'
];

// Install event
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('PWA: Caching app shell');
        return cache.addAll(urlsToCache);
      })
  );
});

// Fetch event - Network first strategy for API calls, Cache first for static assets
self.addEventListener('fetch', (event) => {
  const { request } = event;
  
  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Network first for API calls
  if (request.url.includes('/api/')) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Clone response for cache
          const responseClone = response.clone();
          if (response.status === 200) {
            caches.open(CACHE_NAME)
              .then((cache) => cache.put(request, responseClone));
          }
          return response;
        })
        .catch(() => {
          // Return cached version if network fails
          return caches.match(request);
        })
    );
    return;
  }

  // Cache first for static assets
  event.respondWith(
    caches.match(request)
      .then((response) => {
        // Return cached version or fetch from network
        return response || fetch(request)
          .then((fetchResponse) => {
            // Cache successful responses
            if (fetchResponse.status === 200) {
              const responseClone = fetchResponse.clone();
              caches.open(CACHE_NAME)
                .then((cache) => cache.put(request, responseClone));
            }
            return fetchResponse;
          });
      })
  );
});

// Activate event - Clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('PWA: Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Background sync for offline homework submissions
self.addEventListener('sync', (event) => {
  if (event.tag === 'homework-submission') {
    event.waitUntil(syncHomeworkSubmissions());
  }
});

async function syncHomeworkSubmissions() {
  try {
    // Get pending submissions from IndexedDB
    const submissions = await getPendingSubmissions();
    
    for (const submission of submissions) {
      try {
        const response = await fetch('/api/homework/submit', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(submission.data)
        });
        
        if (response.ok) {
          // Remove from pending submissions
          await removePendingSubmission(submission.id);
        }
      } catch (error) {
        console.log('PWA: Failed to sync submission:', error);
      }
    }
  } catch (error) {
    console.log('PWA: Background sync failed:', error);
  }
}

// IndexedDB helpers for offline storage
async function getPendingSubmissions() {
  // Implementation would use IndexedDB
  return [];
}

async function removePendingSubmission(id) {
  // Implementation would use IndexedDB
  console.log('PWA: Removing pending submission:', id);
}