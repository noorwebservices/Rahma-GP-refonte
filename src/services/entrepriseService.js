import api from './api'
import { decodeId } from '@/utils/idMasker'

export const entrepriseService = {
  /**
   * Inscription d'un gérant et de son entreprise GP
   * @param {FormData|Object} data
   */
  async register(data) {
    const isFormData = data instanceof FormData
    const config = isFormData ? { headers: { 'Content-Type': 'multipart/form-data' } } : {}
    return await api.post('/auth/entreprise/register', data, config)
  },

  /**
   * Vérifier l'adresse e-mail de l'entreprise via le jeton
   * @param {string} token
   */
  async verifyEmail(token) {
    return await api.get(`/auth/verify-entreprise/${token}`)
  },

  /**
   * Renvoyer l'e-mail de confirmation à l'entreprise
   */
  async resendVerification() {
    return await api.post('/entreprise/resend-verification')
  },

  /**
   * Obtenir le profil de l'entreprise connectée
   */
  async getProfile() {
    return await api.get('/entreprise/profile')
  },

  /**
   * Mettre à jour les informations du profil entreprise
   * @param {FormData|Object} data
   */
  async updateProfile(data) {
    const isFormData = data instanceof FormData
    const config = isFormData ? { headers: { 'Content-Type': 'multipart/form-data' } } : {}
    return await api.put('/entreprise/profile', data, config)
  },

  /**
   * Obtenir la liste des agents de l'entreprise
   * @param {Object} params - { statut }
   */
  async getAgents(params = {}) {
    return await api.get('/entreprise/agents', { params })
  },

  /**
   * Obtenir les détails complets d'un agent GP et ses activités
   * @param {string} id
   */
  async getAgent(id) {
    const rawId = decodeId(id)
    return await api.get(`/entreprise/agents/${rawId}`)
  },

  /**
   * Créer directement un agent par le gérant
   * @param {Object} agentData
   */
  async createAgentDirect(agentData) {
    return await api.post('/entreprise/agents/direct-create', agentData)
  },

  /**
   * Inviter un agent via WhatsApp ou Email
   * @param {Object} inviteData - { canal: 'whatsapp'|'email', telephone, email }
   */
  async inviteAgent(inviteData) {
    return await api.post('/entreprise/agents/invite', inviteData)
  },

  /**
   * Mettre à jour le statut d'un agent
   * @param {string} id
   * @param {string} statut
   */
  async updateAgentStatus(id, statut) {
    return await api.put(`/entreprise/agents/${id}/statut`, { statut })
  },

  /**
   * Supprimer (soft delete) un agent
   * @param {string} id
   */
  async deleteAgent(id) {
    return await api.delete(`/entreprise/agents/${id}`)
  },

  /**
   * Générer / réinitialiser un mot de passe pour un agent GP
   * @param {string} id
   */
  async regenerateAgentPassword(id) {
    return await api.post(`/entreprise/agents/${id}/regenerate-password`)
  },

  /**
   * Obtenir la corbeille des agents GP supprimés
   */
  async getTrashedAgents() {
    return await api.get('/entreprise/agents/trash')
  },

  /**
   * Restaurer un agent GP depuis la corbeille
   * @param {string} id
   */
  async restoreAgent(id) {
    return await api.post(`/entreprise/agents/${id}/restore`)
  },

  /**
   * Supprimer définitivement un agent GP de la corbeille
   * @param {string} id
   */
  async forceDeleteAgent(id) {
    return await api.delete(`/entreprise/agents/${id}/force-delete`)
  },

  /**
   * Obtenir la liste des voyages de l'entreprise GP
   * @param {Object} params
   */
  async getVoyages(params = {}) {
    return await api.get('/entreprise/voyages', { params })
  },

  /**
   * Créer un voyage d'entreprise avec affectation facultative d'un agent
   * @param {Object} voyageData
   */
  async createVoyage(voyageData) {
    return await api.post('/entreprise/voyages', voyageData)
  },

  /**
   * Affecter ou réaffecter un voyage à un agent GP
   * @param {string} voyageId
   * @param {string} agentGpId
   */
  async assignAgentToVoyage(voyageId, agentGpId) {
    return await api.put(`/entreprise/voyages/${voyageId}/assign-agent`, { agent_gp_id: agentGpId })
  },

  /**
   * Obtenir la supervision des discussions entreprise
   */
  async getDiscussions() {
    return await api.get('/entreprise/discussions')
  },

  /**
   * Obtenir les messages d'une discussion par réservation
   * @param {string} reservationId
   */
  async getDiscussionMessages(reservationId) {
    return await api.get(`/entreprise/discussions/${reservationId}/messages`)
  },

  /**
   * Obtenir le tableau de bord consolidé de l'entreprise
   */
  async getDashboard() {
    return await api.get('/entreprise/dashboard')
  },

  /**
   * Obtenir l'analyse des revenus entreprise
   */
  async getRevenus() {
    return await api.get('/entreprise/revenus')
  },

  /**
   * Obtenir l'historique des activités (Audit logs)
   * @param {Object} params
   */
  async getActivites(params = {}) {
    return await api.get('/entreprise/activites', { params })
  },

  /**
   * Obtenir la corbeille (entreprises supprimées)
   */
  async getTrash() {
    return await api.get('/entreprise/trash')
  },

  /**
   * Restaurer une entreprise depuis la corbeille
   * @param {string} id
   */
  async restoreEntreprise(id) {
    return await api.post(`/entreprise/${id}/restore`)
  }
}

export default entrepriseService
