import './assets/main.css'

import { createApp } from 'vue'
import App from './App.vue'
import router from './router'

const app = createApp(App)

app.use(router)
app.mount('#app')

// Filet de sécurité : après un déploiement, les chunks hashés changent de nom.
// Si un import dynamique échoue (module supprimé côté serveur), on recharge une
// seule fois pour récupérer le nouvel index.html et ses nouveaux chunks.
function reloadOnStaleChunk(reason) {
  const KEY = 'rahma_chunk_reloaded_at'
  const now = Date.now()
  const last = Number(sessionStorage.getItem(KEY) || 0)
  // Anti-boucle : au plus un rechargement toutes les 10 s
  if (now - last < 10000) return
  console.warn('Chunk obsolète détecté, rechargement de la page :', reason)
  try { sessionStorage.setItem(KEY, String(now)) } catch { /* private mode */ }
  window.location.reload()
}

window.addEventListener('vite:preloadError', (event) => {
  event.preventDefault()
  reloadOnStaleChunk('vite:preloadError')
})

router.onError((error) => {
  const msg = String(error && error.message)
  if (/dynamically imported module|Importing a module script failed|Failed to fetch/i.test(msg)) {
    reloadOnStaleChunk(msg)
  }
})

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

