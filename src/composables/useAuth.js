import { ref, computed } from 'vue'
import authService from '@/services/auth/authService'
import { translateErrorMessage } from '@/utils/errorMessageHelper'

const storedToken = localStorage.getItem('rahma_token') || localStorage.getItem('token') || ''
const storedUser = localStorage.getItem('rahma_user') ? JSON.parse(localStorage.getItem('rahma_user')) : null

const token = ref(storedToken)
const user = ref(storedUser)
const isLoading = ref(false)
const error = ref(null)
const successMessage = ref(null)

export function useAuth() {
  const isAuthenticated = computed(() => !!token.value && !!user.value)
  const isVoyageur = computed(() => {
    if (!user.value) return false
    return user.value.roles?.includes('voyageur') || !!user.value.voyageur
  })
  const modeActuel = computed(() => user.value?.mode_actuel || 'client')

  const setAuthData = (newToken, newUser) => {
    if (newToken) {
      token.value = newToken
      localStorage.setItem('rahma_token', newToken)
      localStorage.setItem('token', newToken)
    }
    if (newUser) {
      user.value = newUser
      localStorage.setItem('rahma_user', JSON.stringify(newUser))
    }
  }

  const clearAuthData = () => {
    token.value = ''
    user.value = null
    localStorage.removeItem('rahma_token')
    localStorage.removeItem('token')
    localStorage.removeItem('rahma_user')
  }

  const login = async (credentials) => {
    isLoading.value = true
    error.value = null
    successMessage.value = null
    try {
      const payload = {
        ...credentials,
        password: credentials.password || credentials.mot_de_passe,
        mot_de_passe: credentials.password || credentials.mot_de_passe
      }
      const res = await authService.login(payload)
      if (res.access_token && res.user) {
        setAuthData(res.access_token, res.user)
        successMessage.value = res.message || 'Connexion réussie'
        return res
      } else {
        throw new Error(res.message || 'Échec de la connexion')
      }
    } catch (err) {
      error.value = translateErrorMessage(err)
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const register = async (userData) => {
    isLoading.value = true
    error.value = null
    successMessage.value = null
    try {
      let payload = userData
      if (!(userData instanceof FormData)) {
        payload = {
          ...userData,
          password: userData.password,
          password_confirmation: userData.password_confirmation,
          mot_de_passe: userData.password,
          mot_de_passe_confirmation: userData.password_confirmation
        }
      }
      const res = await authService.register(payload)
      if (res.require_verification) {
        clearAuthData()
        successMessage.value = res.message || 'Inscription réussie. Veuillez vérifier vos emails.'
        return res
      }
      if (res.access_token && res.user) {
        setAuthData(res.access_token, res.user)
        successMessage.value = res.message || 'Inscription réussie'
        return res
      } else {
        throw new Error(res.message || "Échec de l'inscription")
      }

    } catch (err) {
      error.value = translateErrorMessage(err)
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const verifyVoyageurAccount = async (tokenStr) => {
    isLoading.value = true
    error.value = null
    successMessage.value = null
    try {
      const res = await authService.verifyVoyageur(tokenStr)
      if (res.user) {
        user.value = res.user
        localStorage.setItem('rahma_user', JSON.stringify(res.user))
      }
      successMessage.value = res.message || 'Compte voyageur vérifié avec succès'
      return res
    } catch (err) {
      error.value = translateErrorMessage(err)
      throw err
    } finally {
      isLoading.value = false
    }
  }


  const resendVoyageurVerification = async () => {
    isLoading.value = true
    error.value = null
    successMessage.value = null
    try {
      const res = await authService.resendVoyageurVerification()
      successMessage.value = res.message || 'Email de confirmation renvoyé avec succès.'
      return res
    } catch (err) {
      error.value = translateErrorMessage(err)
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const fetchUser = async () => {

    if (!token.value) return null
    isLoading.value = true
    try {
      const res = await authService.getMe()
      if (res.user) {
        user.value = res.user
        localStorage.setItem('rahma_user', JSON.stringify(res.user))
        return res.user
      }
    } catch (err) {
      clearAuthData()
    } finally {
      isLoading.value = false
    }
  }

  const updateProfile = async (profileData) => {
    isLoading.value = true
    error.value = null
    try {
      const res = await authService.updateProfile(profileData)
      if (res.user) {
        user.value = res.user
        localStorage.setItem('rahma_user', JSON.stringify(res.user))
      }
      successMessage.value = res.message || 'Profil mis à jour'
      return res
    } catch (err) {
      error.value = translateErrorMessage(err)
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const createVoyageurProfile = async (voyageurData) => {
    isLoading.value = true
    error.value = null
    try {
      const res = await authService.createVoyageurProfile(voyageurData)
      if (res.user) {
        user.value = res.user
        localStorage.setItem('rahma_user', JSON.stringify(res.user))
      }
      successMessage.value = res.message || 'Profil Voyageur créé avec succès'
      return res
    } catch (err) {
      error.value = translateErrorMessage(err)
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const toggleMode = async () => {
    isLoading.value = true
    error.value = null
    try {
      const res = await authService.toggleMode()
      if (user.value) {
        user.value.mode_actuel = res.mode_actuel
        localStorage.setItem('rahma_user', JSON.stringify(user.value))
      }
      await fetchUser() // Actualise l'utilisateur complet
      successMessage.value = res.message || 'Mode basculé avec succès'
      return res
    } catch (err) {
      error.value = translateErrorMessage(err)
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const logout = async () => {
    isLoading.value = true
    try {
      await authService.logout().catch(() => {})
    } finally {
      clearAuthData()
      isLoading.value = false
    }
  }

  return {
    user,
    token,
    isLoading,
    error,
    successMessage,
    isAuthenticated,
    isVoyageur,
    modeActuel,
    login,
    register,
    fetchUser,
    updateProfile,
    createVoyageurProfile,
    toggleMode,
    verifyVoyageurAccount,
    resendVoyageurVerification,
    logout

  }
}
