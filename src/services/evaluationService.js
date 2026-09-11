import api from './api'
import { decodeId } from '@/utils/idMasker'

/**
 * Poster une évaluation pour une réservation (Client)
 * POST /api/reservations/{reservation_id}/evaluations
 * Body: { note: number (1-5), commentaire: string }
 */
export const postReservationEvaluation = async (reservationId, payload) => {
  try {
    const rawId = decodeId(reservationId)
    return await api.post(`/reservations/${rawId}/evaluations`, payload)
  } catch (error) {
    throw error
  }
}

/**
 * Consulter les évaluations et la note moyenne d'un voyageur
 * GET /api/voyageurs/{voyageur_id}/evaluations
 */
export const fetchVoyageurEvaluations = async (voyageurId) => {
  try {
    const rawId = decodeId(voyageurId)
    return await api.get(`/voyageurs/${rawId}/evaluations`)
  } catch (error) {
    throw error
  }
}

/**
 * Consulter mes évaluations (Envoyées ou Reçues) pour l'utilisateur connecté
 * GET /api/evaluations
 */
export const fetchMyEvaluations = async () => {
  try {
    return await api.get('/evaluations')
  } catch (error) {
    throw error
  }
}

export default {
  postReservationEvaluation,
  fetchVoyageurEvaluations,
  fetchMyEvaluations
}
