import api from './api'

export const fetchVoyages = async (params = {}) => {
  try {
    return await api.get('/voyages', { params })
  } catch (error) {
    throw error
  }
}

export const fetchVoyage = async (id) => {
  try {
    return await api.get(`/voyages/${id}`)
  } catch (error) {
    throw error
  }
}

export const createVoyage = async (payload) => {
  try {
    return await api.post('/voyages', payload)
  } catch (error) {
    throw error
  }
}

export const updateVoyage = async (id, payload) => {
  try {
    return await api.put(`/voyages/${id}`, payload)
  } catch (error) {
    throw error
  }
}

export const deleteVoyage = async (id) => {
  try {
    return await api.delete(`/voyages/${id}`)
  } catch (error) {
    throw error
  }
}

export const publierVoyage = async (id) => {
  try {
    return await api.post(`/voyages/${id}/publier`)
  } catch (error) {
    throw error
  }
}

export const annulerVoyage = async (id) => {
  try {
    return await api.post(`/voyages/${id}/annuler`)
  } catch (error) {
    throw error
  }
}

export default {
  fetchVoyages,
  fetchVoyage,
  createVoyage,
  updateVoyage,
  deleteVoyage,
  publierVoyage,
  annulerVoyage
}
