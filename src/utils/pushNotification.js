import { fetchNotifications } from '@/services/notificationService'
import Swal from 'sweetalert2'

let notificationTimer = null
const SEEN_NOTIFS_KEY = 'rahma_seen_notifications'

function getSeenNotifications() {
  try {
    const raw = localStorage.getItem(SEEN_NOTIFS_KEY)
    return raw ? new Set(JSON.parse(raw)) : new Set()
  } catch (e) {
    return new Set()
  }
}

function saveSeenNotifications(seenSet) {
  try {
    const arr = Array.from(seenSet).slice(-200)
    localStorage.setItem(SEEN_NOTIFS_KEY, JSON.stringify(arr))
  } catch (e) {}
}

export async function requestPushPermission() {
  if (!('Notification' in window)) {
    console.warn('Browser does not support desktop notifications')
    return false
  }

  if (Notification.permission === 'granted') {
    return true
  }

  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission()
    return permission === 'granted'
  }

  return false
}

export async function triggerSystemNotification(title, options = {}) {
  // Always display in-app Toast banner on top-right of screen
  try {
    Swal.fire({
      toast: true,
      position: 'top-end',
      icon: 'info',
      title: title,
      text: options.body || '',
      showConfirmButton: false,
      timer: 6000,
      timerProgressBar: true,
      customClass: {
        popup: 'rounded-2xl shadow-2xl border border-sky-100 font-sans z-[9999]'
      }
    })
  } catch (e) {
    // Ignore swal error
  }

  if (!('Notification' in window) || Notification.permission !== 'granted') {
    return true
  }

  try {
    const notifOptions = {
      icon: '/logo-rouge.svg',
      badge: '/logo-rouge.svg',
      vibrate: [200, 100, 200],
      requireInteraction: true,
      ...options
    }

    // Try ServiceWorker notification first
    if ('serviceWorker' in navigator) {
      try {
        const reg = await navigator.serviceWorker.ready
        if (reg && reg.showNotification) {
          await reg.showNotification(title, notifOptions)
          console.log('[PushNotification] Triggered via ServiceWorker:', title)
          return true
        }
      } catch (e) {
        // Fallback to standard Notification
      }
    }

    // Fallback to standard Notification API
    const notif = new Notification(title, notifOptions)
    console.log('[PushNotification] Triggered via Notification API:', title)

    notif.onclick = () => {
      window.focus()
      if (options.url) {
        window.location.href = options.url
      }
      notif.close()
    }
    return true
  } catch (err) {
    console.error('[PushNotification] Error triggering system notification:', err)
    return true
  }
}

export async function checkAndTriggerPushNotifications() {
  const token = localStorage.getItem('rahma_token') || localStorage.getItem('token')
  if (!token) return

  try {
    const res = await fetchNotifications({ unread: 'true' })
    let rawItems = res.data?.data || res.data?.notifications || res.data || []
    let items = Array.isArray(rawItems) ? rawItems : []

    if (items.length === 0) {
      // Fallback: fetch all and filter unread items locally
      const resAll = await fetchNotifications()
      const allRaw = resAll.data?.data || resAll.data?.notifications || resAll.data || []
      const allItems = Array.isArray(allRaw) ? allRaw : []
      items = allItems.filter(n => !n.lu && !n.read_at && !n.is_read)
    }

    if (items.length > 0) {
      const seenSet = getSeenNotifications()
      let updated = false

      for (const n of items) {
        const id = n.id
        if (!seenSet.has(id)) {
          seenSet.add(id)
          updated = true

          console.log('[PushNotification] New unread notification found:', n)

          if ('Notification' in window && Notification.permission === 'granted') {
            await triggerSystemNotification(
              n.titre || n.title || n.data?.titre || n.data?.title || 'Rahma GP',
              {
                body: n.contenu || n.message || n.body || n.data?.message || 'Vous avez reçu une nouvelle notification sur Rahma GP.',
                tag: String(id),
                url: '/notifications'
              }
            )
          }
        }
      }

      if (updated) {
        saveSeenNotifications(seenSet)
      }
    }
  } catch (err) {
    console.error('[PushNotification] Error polling notifications:', err)
  }
}

export function startPushNotificationPoller(intervalMs = 8000) {
  if (notificationTimer) clearInterval(notificationTimer)

  requestPushPermission().then(granted => {
    if (granted) {
      checkAndTriggerPushNotifications()
    }
  })

  notificationTimer = setInterval(() => {
    checkAndTriggerPushNotifications()
  }, intervalMs)
}

export function stopPushNotificationPoller() {
  if (notificationTimer) {
    clearInterval(notificationTimer)
    notificationTimer = null
  }
}

// Global window helper for testing
if (typeof window !== 'undefined') {
  window.testPushNotification = async () => {
    const granted = await requestPushPermission()
    if (!granted) {
      alert('La permission de notification est refusée ou non accordée dans votre navigateur.')
      return
    }
    const success = await triggerSystemNotification('Test Rahma GP', {
      body: 'Ceci est une notification de test sur votre ordinateur !'
    })
    if (success) {
      alert('Notification envoyée ! Si vous ne voyez pas la bannière en haut/droite de l\'écran, vérifiez le mode "Ne pas déranger" de votre ordinateur.')
    } else {
      alert('Erreur lors du déclenchement de la notification.')
    }
  }
}


