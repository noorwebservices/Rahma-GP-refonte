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

// Response Interceptor: Extract data & handle global errors
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response) {
      // 401 Unauthorized: token expired or invalid
      if (error.response.status === 401) {
        localStorage.removeItem('rahma_token')
        localStorage.removeItem('token')
        localStorage.removeItem('rahma_user')
      }
      return Promise.reject(error.response.data || error.response)
    }
    return Promise.reject(error)
  }
)

export default api
