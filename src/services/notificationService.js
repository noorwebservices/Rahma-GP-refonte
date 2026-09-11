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
 * GET /api/notifications/non-lus-count
 */
export const fetchUnreadNotificationsCount = async () => {
  try {
    return await api.get('/notifications/non-lus-count')
  } catch (error) {
    throw error
  }
}

/**
 * Marquer une notification comme lue
 * PATCH /api/notifications/{id}/lue
 */
export const markNotificationAsRead = async (notificationId) => {
  try {
    const rawId = decodeId(notificationId)
    return await api.patch(`/notifications/${rawId}/lue`)
  } catch (error) {
    throw error
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
    throw error
  }
}

export default {
  fetchNotifications,
  fetchUnreadNotificationsCount,
  markNotificationAsRead,
  markAllNotificationsAsRead
}
