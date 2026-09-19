// Rahma GP Service Worker for PWA Offline Caching & Web Push Notifications
// v2 : correctifs SPA (assets hashés) + réponses toujours valides
const CACHE_NAME = 'rahma-gp-v2'
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

// Détection d'une requête de navigation / document HTML
function isNavigationRequest(request) {
  return (
    request.mode === 'navigate' ||
    request.destination === 'document' ||
    (request.headers.get('accept') || '').includes('text/html')
  )
}

// Assets qui peuvent être servis depuis le cache sans risque (immuables / non critiques)
function isImageOrFont(url) {
  return /\.(png|jpe?g|gif|svg|webp|ico|woff2?|ttf|eot)$/i.test(url.pathname)
}

self.addEventListener('fetch', (event) => {
  const { request } = event
  let url
  try {
    url = new URL(request.url)
  } catch {
    return
  }

  // Ne traiter que le GET en http(s)
  if (request.method !== 'GET' || !url.protocol.startsWith('http')) {
    return
  }

  // Laisser le navigateur gérer les requêtes cross-origin (API, CDN, images distantes).
  // Évite de mettre en cache l'API et les réponses opaques.
  if (url.origin !== self.location.origin) {
    return
  }

  // 1) Navigation / HTML : Network-First (toujours l'index.html frais), fallback cache hors-ligne.
  //    Empêche de servir un shell obsolète qui référencerait d'anciens chunks.
  if (isNavigationRequest(request)) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response && response.status === 200) {
            const clone = response.clone()
            caches.open(CACHE_NAME).then((cache) => cache.put(request, clone))
          }
          return response
        })
        .catch(async () => {
          const cached = await caches.match(request)
          if (cached) return cached
          const shell = await caches.match('/index.html')
          if (shell) return shell
          const root = await caches.match('/')
          if (root) return root
          return new Response(
            '<h1>Hors ligne</h1><p>Contenu indisponible sans connexion.</p>',
            { status: 503, headers: { 'Content-Type': 'text/html; charset=utf-8' } }
          )
        })
    )
    return
  }

  // 2) JS / CSS (chunks hashés Vite) : Network-First, fallback cache hors-ligne.
  //    Garantit que chaque déploiement récupère les nouveaux chunks et évite
  //    les "Failed to fetch dynamically imported module".
  if (request.destination === 'script' || request.destination === 'style' ||
      /\.(js|css)$/i.test(url.pathname)) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response && response.status === 200) {
            const clone = response.clone()
            caches.open(CACHE_NAME).then((cache) => cache.put(request, clone))
          }
          return response
        })
        .catch(async () => {
          const cached = await caches.match(request)
          return cached || Response.error()
        })
    )
    return
  }

  // 3) Images / polices : Cache-First avec revalidation en arrière-plan.
  if (isImageOrFont(url)) {
    event.respondWith(
      caches.match(request).then((cached) => {
        const network = fetch(request)
          .then((response) => {
            if (response && response.status === 200) {
              const clone = response.clone()
              caches.open(CACHE_NAME).then((cache) => cache.put(request, clone))
            }
            return response
          })
          .catch(() => cached || Response.error())
        return cached || network
      })
    )
    return
  }

  // 4) Tout le reste (même origine) : network, fallback cache, sinon erreur propre.
  event.respondWith(
    fetch(request)
      .then((response) => {
        if (response && response.status === 200 && response.type === 'basic') {
          const clone = response.clone()
          caches.open(CACHE_NAME).then((cache) => cache.put(request, clone))
        }
        return response
      })
      .catch(async () => {
        const cached = await caches.match(request)
        return cached || Response.error()
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
