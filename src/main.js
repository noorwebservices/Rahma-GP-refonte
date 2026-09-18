import './assets/main.css'

import { createApp } from 'vue'
import App from './App.vue'
import router from './router'

const app = createApp(App)

app.use(router)
app.mount('#app')

// Register Service Worker for PWA & Push Notifications
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js', { scope: '/' })
      .then((reg) => {
        // Check for SW updates periodically
        reg.onupdatefound = () => {
          const installingWorker = reg.installing
          if (installingWorker) {
            installingWorker.onstatechange = () => {
              if (installingWorker.state === 'installed' && navigator.serviceWorker.controller) {
                console.log('Nouveau contenu PWA disponible ; rafraîchissement prêt.')
              }
            }
          }
        }
      })
      .catch((err) => {
        console.warn('Erreur lors de l\'enregistrement du Service Worker:', err)
      })
  })
}

