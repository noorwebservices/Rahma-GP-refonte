import api from './api'
import { decodeId } from '@/utils/idMasker'

export const agentService = {
  /**
   * Obtenir la liste des voyages affectés à l'agent GP connecté
   */
  async getVoyages(params = {}) {
    return await api.get('/agent/voyages', { params })
  },

  /**
   * Accepter une réservation par l'agent
   * @param {string} reservationId
   */
  async acceptReservation(reservationId) {
    const rawId = decodeId(reservationId) || reservationId
    return await api.post(`/agent/reservations/${rawId}/accepter`)
  },

  /**
   * Refuser une réservation par l'agent
   * @param {string} reservationId
   */
  async refuseReservation(reservationId) {
    const rawId = decodeId(reservationId) || reservationId
    return await api.post(`/agent/reservations/${rawId}/refuser`)
  },

  /**
   * Mettre à jour le statut d'un colis par l'agent
   * @param {string} colisId
   * @param {string} statut
   */
  async updateColisStatut(colisId, statut) {
    const rawId = decodeId(colisId) || colisId
    return await api.put(`/agent/colis/${rawId}/statut`, { statut })
  },

  /**
   * Obtenir les messages d'une discussion par réservation pour l'agent
   * @param {string} reservationId
   */
  async getMessages(reservationId) {
    const rawId = decodeId(reservationId) || reservationId
    return await api.get(`/agent/messages/${rawId}`)
  },

  /**
   * Envoyer un message dans la discussion agent <-> client
   * @param {string} reservationId
   * @param {string} message
   * @param {File|null} image
   */
  async sendMessage(reservationId, message, image = null) {
    const rawId = decodeId(reservationId) || reservationId
    const formData = new FormData()
    if (message) formData.append('contenu', message)
    if (image) formData.append('image', image)
    return await api.post(`/agent/messages/${rawId}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
  }
}

export default agentService
