import api from './api'

export const fetchAdresseDepots = async (params = {}) => {
  try {
    return await api.get('/adresse-depots', { params })
  } catch (error) {
    throw error
  }
}

export const createAdresseDepot = async (payload) => {
  try {
    return await api.post('/adresse-depots', payload)
  } catch (error) {
    throw error
  }
}

export const fetchAdresseRecuperations = async (params = {}) => {
  try {
    return await api.get('/adresse-recuperations', { params })
  } catch (error) {
    throw error
  }
}

export const createAdresseRecuperation = async (payload) => {
  try {
    return await api.post('/adresse-recuperations', payload)
  } catch (error) {
    throw error
  }
}

export default {
  fetchAdresseDepots,
  createAdresseDepot,
  fetchAdresseRecuperations,
  createAdresseRecuperation
}
