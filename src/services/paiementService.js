import api from './api'
import { decodeId } from '@/utils/idMasker'

/**
 * Enregistrer un paiement manuel pour une réservation
 * POST /api/reservations/{reservation_id}/paiements
 * Body: { mode_paiement: 'wave'|'espece_depot'|'livraison', montant?: number, statut?: 'reussi'|'en_attente'|'echoue', reference?: string }
 */
export const postReservationPaiement = async (reservationId, payload) => {
  try {
    const rawId = decodeId(reservationId)
    return await api.post(`/reservations/${rawId}/paiements`, payload)
  } catch (error) {
    throw error
  }
}

/**
 * Consulter l'historique des paiements
 * GET /api/paiements
 */
export const fetchPaiements = async () => {
  try {
    return await api.get('/paiements')
  } catch (error) {
    throw error
  }
}

/**
 * Consulter le détail d'un paiement
 * GET /api/paiements/{id}
 */
export const fetchPaiementDetail = async (paiementId) => {
  try {
    const rawId = decodeId(paiementId)
    return await api.get(`/paiements/${rawId}`)
  } catch (error) {
    throw error
  }
}

/**
 * Initialiser un paiement automatique via l'API Wave Checkout
 * POST /api/reservations/{reservation_id}/pay-wave
 */
export const initiateWavePayment = async (reservationId) => {
  try {
    const rawId = decodeId(reservationId)
    return await api.post(`/reservations/${rawId}/pay-wave`)
  } catch (error) {
    throw error
  }
}

/**
 * Vérifier l'état d'un paiement Wave en temps réel
 * GET /api/reservations/{reservation_id}/wave-status
 */
export const checkWavePaymentStatus = async (reservationId) => {
  try {
    const rawId = decodeId(reservationId)
    return await api.get(`/reservations/${rawId}/wave-status`)
  } catch (error) {
    throw error
  }
}

export default {
  postReservationPaiement,
  fetchPaiements,
  fetchPaiementDetail,
  initiateWavePayment,
  checkWavePaymentStatus
}
