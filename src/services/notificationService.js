import api from './api'
import { decodeId } from '@/utils/idMasker'

/**
 * Lister les notifications de l'utilisateur connecté
 * GET /api/notifications (Optionnel: ?unread=true)
 */
export const fetchNotifications = async (params = {}) => {
  try {
    return await api.get('/notifications', { params })
  } catch (error) {
    throw error
  }
}

/**
 * Obtenir le nombre de notifications non lues
 * GET /api/notifications/non-lus-count ou fallback /api/notifications/unread-count
 */
export const fetchUnreadNotificationsCount = async () => {
  try {
    return await api.get('/notifications/non-lus-count')
  } catch (error) {
    try {
      return await api.get('/notifications/unread-count')
    } catch (e2) {
      try {
        const res = await api.get('/notifications')
        const rawData = res.data?.data || res.data?.notifications || res.data || res.notifications || res
        const items = Array.isArray(rawData) ? rawData : (Array.isArray(res.data) ? res.data : [])
        const count = items.filter(n => !(n.lu || n.read_at || n.is_read)).length
        return { unread_count: count }
      } catch (e3) {
        return { unread_count: 0 }
      }
    }
  }
}

/**
 * Marquer une notification comme lue
 * PATCH /api/notifications/{id}/lue
 */
export const markNotificationAsRead = async (notificationId) => {
  const rawId = decodeId(notificationId) || notificationId
  try {
    return await api.patch(`/notifications/${rawId}/lue`)
  } catch (error) {
    try {
      return await api.post(`/notifications/${rawId}/lue`)
    } catch (err2) {
      try {
        return await api.patch(`/notifications/${rawId}/read`)
      } catch (err3) {
        throw error
      }
    }
  }
}

/**
 * Marquer toutes les notifications comme lues
 * PATCH /api/notifications/toutes-lues
 */
export const markAllNotificationsAsRead = async () => {
  try {
    return await api.patch('/notifications/toutes-lues')
  } catch (error) {
    try {
      return await api.post('/notifications/toutes-lues')
    } catch (e2) {
      throw error
    }
  }
}

export default {
  fetchNotifications,
  fetchUnreadNotificationsCount,
  markNotificationAsRead,
  markAllNotificationsAsRead
}
