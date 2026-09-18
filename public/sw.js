// Rahma GP Service Worker for PWA Offline Caching & Web Push Notifications
const CACHE_NAME = 'rahma-gp-v1'
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.webmanifest',
  '/logo-rouge.svg',
  '/favicon.ico',
  '/pwa-192x192.png',
  '/pwa-512x512.png',
  '/apple-touch-icon.png'
]

// Installation - Precaching static shell
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS).catch((err) => {
        console.warn('Pre-caching error:', err)
      })
    })
  )
  self.skipWaiting()
})

// Activation - Clean old caches & claim clients
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      )
    }).then(() => self.clients.claim())
  )
})

// Fetch strategy: Network first with Cache fallback for navigation/API, Cache first for assets
self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)

  // Ignore non-GET requests and browser extensions
  if (request.method !== 'GET' || !url.protocol.startsWith('http')) {
    return
  }

  // Network-First strategy for HTML / navigation requests and API requests
  if (request.mode === 'navigate' || request.headers.get('accept')?.includes('text/html')) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response && response.status === 200) {
            const responseClone = response.clone()
            caches.open(CACHE_NAME).then((cache) => cache.put(request, responseClone))
          }
          return response
        })
        .catch(() => {
          return caches.match(request).then((cachedResponse) => {
            return cachedResponse || caches.match('/')
          })
        })
    )
    return
  }

  // Cache-First strategy for static assets (images, js, css, fonts)
  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      if (cachedResponse) {
        // Stale-while-revalidate in background for updated assets
        fetch(request).then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            caches.open(CACHE_NAME).then((cache) => cache.put(request, networkResponse))
          }
        }).catch(() => {})
        return cachedResponse
      }

      return fetch(request).then((response) => {
        if (response && response.status === 200 && response.type === 'basic') {
          const responseClone = response.clone()
          caches.open(CACHE_NAME).then((cache) => cache.put(request, responseClone))
        }
        return response
      }).catch((err) => {
        console.warn('Fetch failed and not in cache:', request.url, err)
      })
    })
  )
})

// Push Notifications Listener
self.addEventListener('push', (event) => {
  let data = { title: 'Rahma GP', body: 'Nouvelle notification reçue' }
  if (event.data) {
    try {
      data = event.data.json()
    } catch (e) {
      data.body = event.data.text()
    }
  }

  const options = {
    body: data.body,
    icon: '/logo-rouge.svg',
    badge: '/logo-rouge.svg',
    data: data.url || '/'
  }

  event.waitUntil(
    self.registration.showNotification(data.title || 'Rahma GP', options)
  )
})

// Notification Click Listener
self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  event.waitUntil(
    clients.openWindow(event.notification.data || '/')
  )
})
