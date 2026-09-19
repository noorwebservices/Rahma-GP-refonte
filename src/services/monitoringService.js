import api from './api'

// Service de supervision / monitoring (espace admin).
export const monitoringService = {
  getOverview(params = {}) {
    return api.get('/admin/monitoring/overview', { params })
  },

  getCountries(params = {}) {
    return api.get('/admin/monitoring/countries', { params })
  },

  getCountryDetail(code, params = {}) {
    return api.get(`/admin/monitoring/countries/${code}`, { params })
  },

  getActiveUsers(params = {}) {
    return api.get('/admin/monitoring/active-users', { params })
  },

  getUserActivity(userId, params = {}) {
    return api.get(`/admin/monitoring/users/${userId}/activity`, { params })
  },

  getPages(params = {}) {
    return api.get('/admin/monitoring/pages', { params })
  },

  getRealtime(params = {}) {
    return api.get('/admin/monitoring/realtime', { params })
  },
}
