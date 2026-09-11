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

export default {
  postReservationPaiement,
  fetchPaiements,
  fetchPaiementDetail
}
