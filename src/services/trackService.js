import api from './api'
import { getVisitorId, getSessionId, getPlatform } from '@/utils/visitorId'

// Envoie une visite / page vue au backend (analytics maison). Silencieux en cas d'échec.
export function trackPageView(path, referrer = document.referrer || null) {
  try {
    return api
      .post('/track', {
        visitor_id: getVisitorId(),
        session_id: getSessionId(),
        path: path || window.location.pathname,
        referrer,
        platform: getPlatform(),
      })
      .catch(() => {})
  } catch {
    return Promise.resolve()
  }
}
