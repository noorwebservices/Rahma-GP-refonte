import api from '../api'

export const authService = {
  /**
   * Connexion utilisateur
   * @param {Object} credentials - { email / telephone, password }
   */
  async login(credentials) {
    return await api.post('/auth/login', credentials)
  },

  /**
   * Inscription nouvel utilisateur (Client ou Voyageur)
   * @param {FormData|Object} userData
   */
  async register(userData) {
    const isFormData = userData instanceof FormData
    const config = isFormData ? { headers: { 'Content-Type': 'multipart/form-data' } } : {}
    return await api.post('/auth/register', userData, config)
  },

  /**
   * Confirmer et vérifier le compte voyageur via le jeton de vérification
   * @param {string} token
   */
  async verifyVoyageur(token) {
    return await api.get(`/auth/verify-voyageur/${token}`)
  },

  /**
   * Renvoyer l'email de confirmation du compte voyageur
   */
  async resendVoyageurVerification() {
    return await api.post('/auth/resend-voyageur-verification')
  },


  /**
   * Obtenir les informations de l'utilisateur connecté
   */
  async getMe() {
    return await api.get('/auth/me')
  },

  /**
   * Mettre à jour les informations du profil utilisateur
   * @param {Object} profileData - { nom, prenom, email, telephone, adresse, avatar }
   */
  async updateProfile(profileData) {
    return await api.put('/profile', profileData)
  },

  /**
   * Créer un profil Voyageur (CNI, type_piece, etc.)
   * @param {FormData|Object} voyageurData
   */
  async createVoyageurProfile(voyageurData) {
    const isFormData = voyageurData instanceof FormData
    const config = isFormData ? { headers: { 'Content-Type': 'multipart/form-data' } } : {}
    return await api.post('/profile/voyageur', voyageurData, config)
  },

  /**
   * Basculer entre le mode Client et le mode Voyageur
   */
  async toggleMode() {
    return await api.post('/profile/toggle-mode')
  },

  /**
   * Déconnexion
   */
  async logout() {
    return await api.post('/auth/logout')
  },

  /**
   * Rafraîchir le token JWT
   */
  async refreshToken() {
    return await api.post('/auth/refresh')
  }
}

export default authService
