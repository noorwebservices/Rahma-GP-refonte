import api from './api'

export const partenariatService = {
  envoyerDemande(payload) {
    return api.post('/demandes-partenariat', payload)
  }
}
