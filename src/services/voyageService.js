import api from './api'
import { decodeId } from '@/utils/idMasker'

export const fetchPublicVoyages = async (params = {}) => {
  try {
    return await api.get('/voyages/public', { params })
  } catch (error) {
    throw error
  }
}

export const fetchPublicVoyage = async (id) => {
  try {
    const rawId = decodeId(id)
    return await api.get(`/voyages/public/${rawId}`)
  } catch (error) {
    throw error
  }
}

export const fetchVoyages = async (params = {}) => {
  try {
    const token = localStorage.getItem('rahma_token') || localStorage.getItem('token')
    if (!token || params.statut === 'publie') {
      return await fetchPublicVoyages(params)
    }
    return await api.get('/voyages', { params })
  } catch (error) {
    if (error?.status === 401 || error?.response?.status === 401 || error?.message === 'Unauthenticated.') {
      return await fetchPublicVoyages(params)
    }
    throw error
  }
}

export const fetchVoyage = async (id) => {
  try {
    const token = localStorage.getItem('rahma_token') || localStorage.getItem('token')
    const rawId = decodeId(id)
    if (!token) {
      return await fetchPublicVoyage(id)
    }
    return await api.get(`/voyages/${rawId}`)
  } catch (error) {
    if (error?.status === 401 || error?.response?.status === 401 || error?.message === 'Unauthenticated.') {
      return await fetchPublicVoyage(id)
    }
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

export const fetchVoyagesVoyageur = fetchVoyages

export default {
  fetchVoyages,
  fetchPublicVoyages,
  fetchPublicVoyage,
  fetchVoyagesVoyageur,
  fetchVoyage,
  createVoyage,
  updateVoyage,
  deleteVoyage,
  publierVoyage,
  annulerVoyage
}


