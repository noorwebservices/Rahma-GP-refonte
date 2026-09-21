import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://app.rahmadelivery.com/api'

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  },
  timeout: 15000
})

// Request Interceptor: Attach JWT token if stored
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('rahma_token') || localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Rafraîchissement automatique du token : sur 401, on tente un refresh une seule
// fois puis on rejoue la requête. Un seul refresh est mutualisé entre requêtes
// concurrentes. Si le refresh échoue, on nettoie la session.
let isRefreshing = false
let refreshPromise = null

function clearSession() {
  localStorage.removeItem('rahma_token')
  localStorage.removeItem('token')
  localStorage.removeItem('rahma_user')
}

function getStoredToken() {
  return localStorage.getItem('rahma_token') || localStorage.getItem('token')
}

// Response Interceptor: Extract data & handle global errors
api.interceptors.response.use(
  (response) => response.data,
  async (error) => {
    const original = error.config
    const status = error.response?.status
    const url = original?.url || ''
    const isAuthEndpoint = url.includes('/auth/refresh') || url.includes('/auth/login')

    if (status === 401 && original && !original._retry && !isAuthEndpoint && getStoredToken()) {
      original._retry = true
      try {
        if (!isRefreshing) {
          isRefreshing = true
          refreshPromise = axios
            .post(`${API_BASE_URL}/auth/refresh`, {}, {
              headers: { Authorization: `Bearer ${getStoredToken()}` },
            })
            .then((r) => r.data)
            .finally(() => {
              isRefreshing = false
            })
        }

        const data = await refreshPromise
        const newToken = data?.access_token || data?.token
        if (newToken) {
          localStorage.setItem('rahma_token', newToken)
          localStorage.setItem('token', newToken)
          original.headers = original.headers || {}
          original.headers.Authorization = `Bearer ${newToken}`
          return api(original)
        }
      } catch (e) {
        // refresh échoué : on tombe dans le nettoyage ci-dessous
      }
      clearSession()
    }

    if (error.response) {
      return Promise.reject(error.response.data || error.response)
    }
    return Promise.reject(error)
  }
)

export default api
