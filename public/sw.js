// Rahma GP Service Worker for Web Push & Offline System Notifications
self.addEventListener('install', (event) => {
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim())
})

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

self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  event.waitUntil(
    clients.openWindow(event.notification.data || '/')
  )
})
