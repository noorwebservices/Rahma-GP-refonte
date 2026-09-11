import api from './api'

/**
 * Consulter son solde et l'historique des revenus (Voyageurs & Admins)
 * GET /api/revenus
 */
export const fetchRevenus = async () => {
  try {
    return await api.get('/revenus')
  } catch (error) {
    throw error
  }
}

/**
 * Demander un retrait de ses revenus (Retire tout le solde disponible)
 * POST /api/revenus/retrait
 */
export const requestRetraitRevenus = async () => {
  try {
    return await api.post('/revenus/retrait')
  } catch (error) {
    throw error
  }
}

export default {
  fetchRevenus,
  requestRetraitRevenus
}
