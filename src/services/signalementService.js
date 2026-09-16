import api from './api'

export const signalementService = {
  envoyerSignalement(payload) {
    return api.post('/signalements', payload)
  }
}
