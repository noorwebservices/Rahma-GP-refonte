import api from './api'
import { decodeId } from '@/utils/idMasker'

export const fetchVoyages = async (params = {}) => {
  try {
    return await api.get('/voyages', { params })
  } catch (error) {
    throw error
  }
}

export const fetchVoyage = async (id) => {
  try {
    const rawId = decodeId(id)
    return await api.get(`/voyages/${rawId}`)
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
    const rawId = decodeId(id)
    return await api.put(`/voyages/${rawId}`, payload)
  } catch (error) {
    throw error
  }
}

export const deleteVoyage = async (id) => {
  try {
    const rawId = decodeId(id)
    return await api.delete(`/voyages/${rawId}`)
  } catch (error) {
    throw error
  }
}

export const publierVoyage = async (id) => {
  try {
    const rawId = decodeId(id)
    return await api.post(`/voyages/${rawId}/publier`)
  } catch (error) {
    throw error
  }
}

export const annulerVoyage = async (id) => {
  try {
    const rawId = decodeId(id)
    return await api.post(`/voyages/${rawId}/annuler`)
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
