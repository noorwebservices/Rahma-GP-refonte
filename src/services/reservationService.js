import api from './api'
import { decodeId } from '@/utils/idMasker'

export const createReservation = async (payload) => {
  try {
    return await api.post('/reservations', payload)
  } catch (error) {
    throw error
  }
}

export const fetchReservations = async (params = {}) => {
  try {
    return await api.get('/reservations', { params })
  } catch (error) {
    throw error
  }
}

export const fetchReservation = async (id) => {
  try {
    const rawId = decodeId(id)
    return await api.get(`/reservations/${rawId}`)
  } catch (error) {
    throw error
  }
}

export const accepterReservation = async (id) => {
  try {
    const rawId = decodeId(id)
    return await api.post(`/reservations/${rawId}/accepter`)
  } catch (error) {
    throw error
  }
}

export const refuserReservation = async (id) => {
  try {
    const rawId = decodeId(id)
    return await api.post(`/reservations/${rawId}/refuser`)
  } catch (error) {
    throw error
  }
}

export const annulerReservation = async (id) => {
  try {
    const rawId = decodeId(id)
    return await api.post(`/reservations/${rawId}/annuler`)
  } catch (error) {
    throw error
  }
}

export const updateColisStatut = async (colisId, payload) => {
  try {
    const rawId = decodeId(colisId)
    return await api.patch(`/colis/${rawId}/statut`, payload)
  } catch (error) {
    throw error
  }
}

export default {
  createReservation,
  fetchReservations,
  fetchReservation,
  accepterReservation,
  refuserReservation,
  annulerReservation,
  updateColisStatut
}
