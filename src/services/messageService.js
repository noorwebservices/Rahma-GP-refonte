import api from './api'
import { decodeId } from '@/utils/idMasker'

/**
 * Charger le fil de discussion d'une réservation
 * (Marque automatiquement les messages reçus non lus comme lus)
 * GET /api/reservations/{reservation_id}/messages
 */
export const fetchReservationMessages = async (reservationId, options = {}) => {
  try {
    const rawId = decodeId(reservationId)
    const params = {}
    if (options.markRead === false) {
      params.mark_read = 'false'
    }
    return await api.get(`/reservations/${rawId}/messages`, { params })
  } catch (error) {
    throw error
  }
}

/**
 * Envoyer un message pour une réservation
 * POST /api/reservations/{reservation_id}/messages
 * Body: { contenu: string, piece_jointe?: string }
 */
export const sendReservationMessage = async (reservationId, payload) => {
  try {
    const rawId = decodeId(reservationId)
    return await api.post(`/reservations/${rawId}/messages`, payload)
  } catch (error) {
    throw error
  }
}

/**
 * Obtenir le compteur de messages non lus
 * GET /api/messages/non-lus-count
 */
export const fetchUnreadMessagesCount = async () => {
  try {
    return await api.get('/messages/non-lus-count')
  } catch (error) {
    throw error
  }
}

export default {
  fetchReservationMessages,
  sendReservationMessage,
  fetchUnreadMessagesCount
}
