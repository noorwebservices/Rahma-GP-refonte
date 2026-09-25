import api from './api'

export const adminService = {
  getDashboardStats() {
    return api.get('/admin/dashboard-stats')
  },

  getUsers(params = {}) {
    return api.get('/admin/users', { params })
  },

  getUserDetail(userId) {
    return api.get(`/admin/users/${userId}`)
  },

  toggleBlockUser(userId, statut, motif = '') {
    return api.patch(`/admin/users/${userId}/block`, { statut, motif })
  },

  updateStatutVoyageur(voyageurId, statut, motif_refus = '') {
    return api.patch(`/admin/voyageurs/${voyageurId}/statut`, { statut, motif_refus })
  },

  updateStatutEntreprise(entrepriseId, statut, motif_refus = '') {
    return api.patch(`/admin/entreprises/${entrepriseId}/statut`, { statut, motif_refus })
  },

  getSignalements(params = {}) {
    return api.get('/admin/signalements', { params })
  },

  updateSignalementStatut(signalementId, statut, decision = null) {
    return api.patch(`/admin/signalements/${signalementId}/statut`, { statut, decision })
  },

  getDemandesPartenariat(params = {}) {
    return api.get('/admin/demandes-partenariat', { params })
  },

  updateDemandePartenariatStatut(demandeId, statut, notes_admin = '') {
    return api.patch(`/admin/demandes-partenariat/${demandeId}/statut`, { statut, notes_admin })
  },

  getVoyageursStats(params = {}) {
    return api.get('/admin/voyageurs-stats', { params })
  }
}
