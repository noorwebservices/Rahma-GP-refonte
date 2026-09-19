// Identifiant anonyme et stable du visiteur (pour le comptage des visiteurs uniques).
// Persisté en localStorage ; un identifiant de session (onglet) en sessionStorage.

const VISITOR_KEY = 'rahma_visitor_id'
const SESSION_KEY = 'rahma_session_id'

function uuid() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID()
  }
  return 'xxxxxxxxxxxx4xxxyxxxxxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0
    const v = c === 'x' ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}

export function getVisitorId() {
  try {
    let id = localStorage.getItem(VISITOR_KEY)
    if (!id) {
      id = uuid()
      localStorage.setItem(VISITOR_KEY, id)
    }
    return id
  } catch {
    return uuid()
  }
}

export function getSessionId() {
  try {
    let id = sessionStorage.getItem(SESSION_KEY)
    if (!id) {
      id = uuid()
      sessionStorage.setItem(SESSION_KEY, id)
    }
    return id
  } catch {
    return uuid()
  }
}

// Détecte si l'app tourne en mode PWA installée (standalone) plutôt que dans le navigateur.
export function getPlatform() {
  try {
    const standalone =
      window.matchMedia?.('(display-mode: standalone)')?.matches ||
      window.navigator.standalone === true
    return standalone ? 'pwa' : 'web'
  } catch {
    return 'web'
  }
}
