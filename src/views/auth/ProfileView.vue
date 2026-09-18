<script setup>
import { ref, reactive, onMounted, computed, watch } from 'vue'
import { useRouter, RouterLink } from 'vue-router'
import { useAuth } from '@/composables/useAuth'
import { fetchRevenus } from '@/services/revenuService'
import { currentCurrency, formatPrice, convertAmount } from '@/utils/currencyState'
import { useI18n } from '@/composables/useI18n'

const router = useRouter()
const { t } = useI18n()
const {
  user,
  modeActuel,
  isLoading,
  error,
  successMessage,
  fetchUser,
  updateProfile,
  createVoyageurProfile,
  toggleMode,
  resendVoyageurVerification,
  logout
} = useAuth()

const isResendingEmail = ref(false)
const handleResendEmail = async () => {
  isResendingEmail.value = true
  try {
    const res = await resendVoyageurVerification()
    Swal.fire({
      title: 'Email Envoyé !',
      text: res.message || 'Un nouvel email de confirmation a été envoyé à votre adresse.',
      icon: 'success',
      confirmButtonColor: '#053754'
    })
  } catch (err) {
    Swal.fire({
      title: 'Erreur',
      text: err.message || 'Erreur lors de l\'envoi de l\'email',
      icon: 'error',
      confirmButtonColor: '#053754'
    })
  } finally {
    isResendingEmail.value = false
  }
}


const activeTab = ref('info') // 'info' | 'voyageur' | 'revenus' | 'edit'

// Reset active tab if client mode is active and user was on revenus tab
watch(modeActuel, (newMode) => {
  if (newMode !== 'voyageur' && activeTab.value === 'revenus') {
    activeTab.value = 'info'
  }
}, { immediate: true })
const showVoyageurModal = ref(false)

// Edit Profile Form State
const editForm = reactive({
  nom: '',
  prenom: '',
  email: '',
  telephone: '',
  adresse: '',
  mot_de_passe_actuel: '',
  password: '',
  password_confirmation: ''
})

const showCurrentPassword = ref(false)
const showNewPassword = ref(false)
const showConfirmPassword = ref(false)

const editErrors = reactive({
  nom: '',
  prenom: '',
  email: '',
  telephone: '',
  password: ''
})

// Voyageur Profile Form State
const voyageurForm = reactive({
  type_piece: 'cni',
  numero_piece: '',
  cni_recto: null,
  cni_verso: null,
  mode_client: false
})

const voyageurErrors = reactive({
  type_piece: '',
  numero_piece: '',
  cni_recto: '',
  cni_verso: ''
})

const rectoFileName = ref('')
const versoFileName = ref('')

const formatImageUrl = (url) => {
  if (!url) return null
  if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:')) {
    return url
  }
  const cleanUrl = url.replace(/^\//, '')
  if (cleanUrl.startsWith('storage/')) {
    return `http://localhost:8000/${cleanUrl}`
  }
  return `http://localhost:8000/storage/${cleanUrl}`
}

const rectoUrl = computed(() => {
  if (!user.value?.voyageur) return null
  const v = user.value.voyageur
  return v.cni_recto || v.piece_recto || v.photo_recto || null
})

const versoUrl = computed(() => {
  if (!user.value?.voyageur) return null
  const v = user.value.voyageur
  return v.cni_verso || v.piece_verso || v.photo_verso || null
})

const imagePreviewModal = reactive({
  isOpen: false,
  url: '',
  title: ''
})

const openImagePreview = (url, title) => {
  if (!url) return
  imagePreviewModal.url = formatImageUrl(url)
  imagePreviewModal.title = title
  imagePreviewModal.isOpen = true
}

const closeImagePreview = () => {
  imagePreviewModal.isOpen = false
  imagePreviewModal.url = ''
  imagePreviewModal.title = ''
}

const profileRevenusList = ref([])

const loadProfileRevenus = async () => {
  try {
    const res = await fetchRevenus()
    if (res) {
      const dataObj = res.data?.data ? res : res
      const rawItems = Array.isArray(dataObj.data) ? dataObj.data : (Array.isArray(res.data) ? res.data : [])
      profileRevenusList.value = rawItems
    }
  } catch (err) {
    profileRevenusList.value = []
  }
}

const isValidPaidStatut = (st) => ['disponible', 'reussi', 'retire', 'paye'].includes(st) || !st

const totalRevenusProfileConverted = computed(() => {
  return profileRevenusList.value
    .filter(item => isValidPaidStatut(item.statut))
    .reduce((sum, item) => {
      const origDevise = item.reservation?.voyage?.devise || 'XOF'
      return sum + convertAmount(item.montant || 0, origDevise, currentCurrency.value)
    }, 0)
})

const revenusDisponiblesProfileConverted = computed(() => {
  return profileRevenusList.value
    .filter(item => isValidPaidStatut(item.statut))
    .reduce((sum, item) => {
      const origDevise = item.reservation?.voyage?.devise || 'XOF'
      return sum + convertAmount(item.montant || 0, origDevise, currentCurrency.value)
    }, 0)
})

const revenusEnAttenteProfileConverted = computed(() => {
  return profileRevenusList.value
    .filter(item => item.statut === 'en_attente' || item.statut === 'non_paye')
    .reduce((sum, item) => {
      const origDevise = item.reservation?.voyage?.devise || 'XOF'
      return sum + convertAmount(item.montant || 0, origDevise, currentCurrency.value)
    }, 0)
})

const paidReservationsProfileCount = computed(() => {
  return profileRevenusList.value.filter(item => isValidPaidStatut(item.statut)).length
})

const recentTransactionsProfile = computed(() => {
  return profileRevenusList.value.slice(0, 5).map(item => {
    const resObj = item.reservation || {}
    const clientObj = resObj.client?.user || resObj.client || {}
    const voyageObj = resObj.voyage || {}

    const clientName = `${clientObj.prenom || ''} ${clientObj.nom || ''}`.trim() || 'Client Rahma'
    const routeText = (voyageObj.ville_depart && voyageObj.ville_destination)
      ? `${voyageObj.ville_depart} ➔ ${voyageObj.ville_destination}`
      : 'Trajet Colis'
    const origDevise = voyageObj.devise || 'XOF'

    return {
      id: item.id,
      code: resObj.numero || `#RS-${item.id.toString().slice(0, 8)}`,
      client: clientName,
      route: routeText,
      montant: formatPrice(item.montant || 0, origDevise, currentCurrency.value),
      isDisponible: item.statut === 'disponible' || item.statut === 'reussi' || !item.statut
    }
  })
})

onMounted(async () => {
  const currentUser = await fetchUser()
  if (currentUser) {
    initEditForm(currentUser)
  }
  await loadProfileRevenus()
})

const initEditForm = (u) => {
  editForm.nom = u.nom || ''
  editForm.prenom = u.prenom || ''
  editForm.email = u.email || ''
  editForm.telephone = u.telephone || ''
  editForm.adresse = u.adresse || ''
}

const userInitials = computed(() => {
  if (!user.value) return 'GP'
  const p = user.value.prenom ? user.value.prenom[0].toUpperCase() : ''
  const n = user.value.nom ? user.value.nom[0].toUpperCase() : ''
  return `${p}${n}` || 'GP'
})

// Mode toggle action
const handleToggleMode = async () => {
  try {
    const res = await toggleMode()
    const targetMode = res?.mode_actuel || (modeActuel.value === 'client' ? 'voyageur' : 'client')
    if (targetMode === 'voyageur') {
      router.push('/voyageur')
    } else {
      router.push('/client')
    }
  } catch (err) {
    // Error state managed by useAuth
  }
}

// Edit profile validation & submit
const validateEditForm = () => {
  let valid = true
  editErrors.nom = ''
  editErrors.prenom = ''
  editErrors.email = ''
  editErrors.telephone = ''
  editErrors.password = ''

  if (!editForm.nom.trim()) { editErrors.nom = 'Le nom est requis'; valid = false }
  if (!editForm.prenom.trim()) { editErrors.prenom = 'Le prénom est requis'; valid = false }
  if (editForm.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(editForm.email.trim())) { editErrors.email = "Adresse email invalide"; valid = false }
  if (!editForm.telephone) { editErrors.telephone = 'Le téléphone est requis'; valid = false }

  if (editForm.password || editForm.mot_de_passe_actuel || editForm.password_confirmation) {
    if (!editForm.mot_de_passe_actuel) {
      editErrors.password = 'Veuillez saisir votre mot de passe actuel.'
      valid = false
    } else if (!editForm.password) {
      editErrors.password = 'Veuillez saisir le nouveau mot de passe.'
      valid = false
    } else if (editForm.password.length < 6) {
      editErrors.password = 'Le nouveau mot de passe doit contenir au moins 6 caractères.'
      valid = false
    } else if (editForm.password !== editForm.password_confirmation) {
      editErrors.password = 'Les nouveaux mots de passe ne correspondent pas.'
      valid = false
    }
  }

  return valid
}

const handleUpdateProfile = async () => {
  if (!validateEditForm()) return
  try {
    const payload = {
      nom: editForm.nom,
      prenom: editForm.prenom,
      email: editForm.email,
      telephone: editForm.telephone,
      adresse: editForm.adresse,
      ...(editForm.password ? {
        mot_de_passe_actuel: editForm.mot_de_passe_actuel,
        current_password: editForm.mot_de_passe_actuel,
        mot_de_passe: editForm.password,
        password: editForm.password,
        mot_de_passe_confirmation: editForm.password_confirmation,
        password_confirmation: editForm.password_confirmation
      } : {})
    }
    await updateProfile(payload)
    editForm.mot_de_passe_actuel = ''
    editForm.password = ''
    editForm.password_confirmation = ''
    activeTab.value = 'info'
  } catch (err) {
    // Error state
  }
}

// Handle File Change for CNI
const handleFileChange = (event, field) => {
  const file = event.target.files[0]
  if (file) {
    voyageurForm[field] = file
    if (field === 'cni_recto') rectoFileName.value = file.name
    if (field === 'cni_verso') versoFileName.value = file.name
  }
}

// Voyageur profile validation & submit
const validateVoyageurForm = () => {
  let valid = true
  voyageurErrors.numero_piece = ''
  voyageurErrors.cni_recto = ''
  voyageurErrors.cni_verso = ''

  if (!voyageurForm.numero_piece.trim()) {
    voyageurErrors.numero_piece = 'Le numéro de pièce est requis'
    valid = false
  }

  if (!voyageurForm.cni_recto && !user.value?.voyageur?.cni_recto) {
    voyageurErrors.cni_recto = 'La photo recto de la pièce est requise'
    valid = false
  }

  if (!voyageurForm.cni_verso && !user.value?.voyageur?.cni_verso) {
    voyageurErrors.cni_verso = 'La photo verso de la pièce est requise'
    valid = false
  }

  return valid
}

const handleCreateVoyageur = async () => {
  if (!validateVoyageurForm()) return

  const formData = new FormData()
  formData.append('type_piece', voyageurForm.type_piece)
  formData.append('numero_piece', voyageurForm.numero_piece)
  formData.append('mode_client', voyageurForm.mode_client ? '1' : '0')

  if (voyageurForm.cni_recto instanceof File) {
    formData.append('cni_recto', voyageurForm.cni_recto)
  } else if (typeof voyageurForm.cni_recto === 'string') {
    formData.append('cni_recto', voyageurForm.cni_recto)
  }

  if (voyageurForm.cni_verso instanceof File) {
    formData.append('cni_verso', voyageurForm.cni_verso)
  } else if (typeof voyageurForm.cni_verso === 'string') {
    formData.append('cni_verso', voyageurForm.cni_verso)
  }

  try {
    await createVoyageurProfile(formData)
    showVoyageurModal.value = false
    await fetchUser()
  } catch (err) {
    // Handled in useAuth state
  }
}

import Swal from 'sweetalert2'
import ClientHeader from '@/components/client/ClientHeader.vue'
import ClientBottomNav from '@/components/client/ClientBottomNav.vue'
import VoyageurBottomNav from '@/components/voyageur/VoyageurBottomNav.vue'

// Logout with SweetAlert confirmation
const handleLogout = async () => {
  const result = await Swal.fire({
    title: t('profile.logoutConfirmTitle'),
    text: t('profile.logoutConfirmText'),
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#053754',
    cancelButtonColor: '#D94132',
    confirmButtonText: t('profile.logoutYes'),
    cancelButtonText: t('common.cancel'),
    customClass: {
      popup: 'rounded-3xl font-sans'
    }
  })

  if (result.isConfirmed) {
    await logout()
    router.push('/auth/login')
  }
}
</script>

<template>
  <div class="min-h-screen bg-[#FAF7F2] dark:bg-slate-950 font-sans pb-24 transition-colors duration-300">
    <!-- Top Client Header -->
    <ClientHeader />

    <!-- Main Container -->
    <main class="max-w-5xl mx-auto px-4 sm:px-6 pt-6">
      <!-- Unverified Voyageur Warning Banner -->
      <div v-if="user?.voyageur && (!user.is_voyageur_verifie || user.voyageur.statut !== 'verifie' || !user.voyageur.email_verifie_at)" class="mb-4 p-4 bg-amber-50 dark:bg-amber-950/80 border border-amber-200 dark:border-amber-900 text-amber-900 dark:text-amber-200 text-sm rounded-2xl flex items-start gap-3 shadow-xs">
        <svg class="w-6 h-6 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
        <div>
          <h4 class="font-bold text-sm">Compte Voyageur non activé</h4>
          <p v-if="user.voyageur.statut === 'en_attente'" class="text-xs text-amber-800 dark:text-amber-300 mt-0.5">
            Votre profil voyageur est actuellement en cours d'examen par notre équipe administrative.
          </p>
          <div v-else-if="user.voyageur.statut === 'verifie' && !user.voyageur.email_verifie_at" class="text-xs text-amber-800 dark:text-amber-300 mt-0.5 space-y-2">
            <p>Votre dossier voyageur a été validé par l'administration ! <strong>Veuillez consulter votre boîte mail ({{ user.email }}) et cliquer sur le lien de vérification</strong> pour activer définitivement votre compte voyageur.</p>
            <button 
              @click="handleResendEmail" 
              :disabled="isResendingEmail" 
              class="px-3.5 py-2 bg-[#053754] hover:bg-[#074C72] text-white font-extrabold text-xs rounded-xl shadow-xs transition cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
            >
              <span v-if="isResendingEmail" class="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
              <span>✉️ Renvoyer l'email de vérification (Port 5173)</span>
            </button>
          </div>

          <p v-else-if="user.voyageur.statut === 'refuse'" class="text-xs text-red-700 dark:text-red-300 mt-0.5">
            Votre demande de compte voyageur a été refusée par l'administration.
          </p>
        </div>
      </div>

      <!-- Global Messages -->
      <div v-if="successMessage" class="mb-4 p-4 bg-green-50 dark:bg-green-950/80 border border-green-200 dark:border-green-800 text-green-800 dark:text-green-300 text-sm rounded-2xl flex items-center justify-between shadow-xs">
        <div class="flex items-center gap-2">
          <svg class="w-5 h-5 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
          </svg>
          <span>{{ successMessage }}</span>
        </div>
      </div>

      <div v-if="error" class="mb-4 p-4 bg-red-50 dark:bg-red-950/80 border border-red-200 dark:border-red-900 text-red-700 dark:text-red-300 text-sm rounded-2xl flex items-center gap-2 shadow-xs">
        <svg class="w-5 h-5 text-red-500 dark:text-red-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span>{{ error }}</span>
      </div>

      <!-- Top Profile Overview Banner Card -->
      <div v-if="user" class="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 shadow-md border border-gray-100 dark:border-slate-800 mb-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div class="flex items-center gap-4 sm:gap-6">
          <!-- Avatar Circle -->
          <div class="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-principal dark:bg-sky-600 text-white font-serif font-bold text-xl sm:text-2xl flex items-center justify-center border-4 border-white dark:border-slate-800 shadow-md shrink-0">
            {{ userInitials }}
          </div>

          <div>
            <div class="flex items-center gap-2 flex-wrap">
              <h1 class="text-xl sm:text-2xl font-bold text-principal-dark dark:text-sky-300 font-serif">
                {{ user.prenom }} {{ user.nom }}
              </h1>
              <span :class="[
                'text-[10px] sm:text-xs px-2.5 py-0.5 rounded-full font-extrabold uppercase tracking-wide',
                modeActuel === 'voyageur' ? 'bg-tertiaire text-principal-dark' : 'bg-principal-light/10 dark:bg-sky-950 text-principal dark:text-sky-300'
              ]">
                Mode {{ modeActuel === 'voyageur' ? t('profile.modeVoyageur') : t('profile.modeClient') }}
              </span>
            </div>

            <p class="text-xs sm:text-sm text-gray-500 dark:text-slate-400 mt-1 flex items-center gap-2">
              <svg class="w-4 h-4 text-gray-400 dark:text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>
              {{ user.email }}
            </p>
            <p class="text-xs sm:text-sm text-gray-500 dark:text-slate-400 mt-0.5 flex items-center gap-2">
              <svg class="w-4 h-4 text-gray-400 dark:text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/></svg>
              {{ user.telephone }}
            </p>
          </div>
        </div>

        <!-- Action Buttons (Mode Switcher & Déconnexion) -->
        <div class="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <button
            v-if="user.roles?.includes('voyageur') || user.voyageur"
            @click="handleToggleMode"
            :disabled="isLoading || (user.voyageur && user.voyageur.statut !== 'verifie')"
            :class="[
              'px-5 py-3 rounded-2xl text-xs sm:text-sm font-semibold transition-all flex items-center justify-center gap-2',
              user.voyageur && user.voyageur.statut !== 'verifie'
                ? 'bg-gray-200 dark:bg-slate-800 text-gray-400 cursor-not-allowed border border-gray-300 dark:border-slate-700'
                : 'bg-principal dark:bg-sky-600 text-white shadow-md hover:bg-principal-dark dark:hover:bg-sky-500 cursor-pointer'
            ]"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
            </svg>
            <span>
              {{ user.voyageur && user.voyageur.statut !== 'verifie' ? 'Voyageur (En attente de vérification)' : `${t('profile.switchModeTo')} ${modeActuel === 'client' ? t('profile.modeVoyageur') : t('profile.modeClient')}` }}
            </span>
          </button>

          <button
            v-else
            @click="showVoyageurModal = true"
            class="px-5 py-3 rounded-2xl bg-secondaire text-white font-semibold text-xs sm:text-sm shadow-md hover:bg-secondaire-dark transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
            </svg>
            <span>{{ t('profile.becomeVoyageur') }}</span>
          </button>

          <!-- Déconnexion Button -->
          <button
            @click="handleLogout"
            class="px-5 py-3 rounded-2xl bg-red-50 dark:bg-red-950/80 hover:bg-red-100 dark:hover:bg-red-900 border border-red-200 dark:border-red-900 text-[#B50302] dark:text-red-300 font-bold text-xs sm:text-sm shadow-2xs transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <svg class="w-4 h-4 text-[#B50302] dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            <span>{{ t('common.logout') }}</span>
          </button>
        </div>
      </div>

      <!-- Navigation Tabs (Horizontally scrollable on mobile) -->
      <div class="flex border-b border-gray-200 dark:border-slate-800 mb-6 text-xs sm:text-sm font-semibold gap-4 sm:gap-6 overflow-x-auto no-scrollbar whitespace-nowrap py-1">
        <button
          @click="activeTab = 'info'"
          :class="[
            'pb-3 border-b-2 transition-colors cursor-pointer shrink-0',
            activeTab === 'info' ? 'border-principal dark:border-sky-400 text-principal-dark dark:text-sky-300 font-bold' : 'border-transparent text-gray-500 dark:text-slate-400 hover:text-gray-800 dark:hover:text-slate-200'
          ]"
        >
          {{ t('profile.accountInfo') }}
        </button>
        <button
          @click="activeTab = 'voyageur'"
          :class="[
            'pb-3 border-b-2 transition-colors cursor-pointer shrink-0',
            activeTab === 'voyageur' ? 'border-principal dark:border-sky-400 text-principal-dark dark:text-sky-300 font-bold' : 'border-transparent text-gray-500 dark:text-slate-400 hover:text-gray-800 dark:hover:text-slate-200'
          ]"
        >
          {{ t('profile.voyageurStatus') }}
        </button>
        <button
          v-if="modeActuel === 'voyageur'"
          @click="activeTab = 'revenus'"
          :class="[
            'pb-3 border-b-2 transition-colors cursor-pointer shrink-0',
            activeTab === 'revenus' ? 'border-principal dark:border-sky-400 text-principal-dark dark:text-sky-300 font-bold' : 'border-transparent text-gray-500 dark:text-slate-400 hover:text-gray-800 dark:hover:text-slate-200'
          ]"
        >
          {{ t('profile.myRevenues') }}
        </button>
        <button
          @click="activeTab = 'edit'"
          :class="[
            'pb-3 border-b-2 transition-colors cursor-pointer shrink-0',
            activeTab === 'edit' ? 'border-principal dark:border-sky-400 text-principal-dark dark:text-sky-300 font-bold' : 'border-transparent text-gray-500 dark:text-slate-400 hover:text-gray-800 dark:hover:text-slate-200'
          ]"
        >
          {{ t('profile.editData') }}
        </button>
      </div>

      <!-- Tab 1: Info Utilisateur -->
      <div v-if="activeTab === 'info'" class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div class="bg-white dark:bg-slate-900 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-slate-800 space-y-4">
          <h3 class="text-base font-bold text-principal-dark dark:text-sky-300 flex items-center gap-2">
            <svg class="w-5 h-5 text-principal dark:text-sky-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>
            {{ t('profile.identity') }}
          </h3>
          <div class="text-xs sm:text-sm space-y-2 text-gray-600 dark:text-slate-300 divide-y divide-gray-100 dark:divide-slate-800">
            <div class="pt-2 flex justify-between"><span class="font-medium text-gray-400 dark:text-slate-400">{{ t('profile.firstName') }}</span> <span class="font-bold text-gray-800 dark:text-slate-100">{{ user?.prenom }}</span></div>
            <div class="pt-2 flex justify-between"><span class="font-medium text-gray-400 dark:text-slate-400">{{ t('profile.lastName') }}</span> <span class="font-bold text-gray-800 dark:text-slate-100">{{ user?.nom }}</span></div>
            <div class="pt-2 flex justify-between"><span class="font-medium text-gray-400 dark:text-slate-400">{{ t('profile.email') }}</span> <span class="font-bold text-gray-800 dark:text-slate-100">{{ user?.email }}</span></div>
            <div class="pt-2 flex justify-between"><span class="font-medium text-gray-400 dark:text-slate-400">{{ t('profile.phone') }}</span> <span class="font-bold text-gray-800 dark:text-slate-100">{{ user?.telephone }}</span></div>
            <div class="pt-2 flex justify-between"><span class="font-medium text-gray-400 dark:text-slate-400">{{ t('profile.address') }}</span> <span class="font-bold text-gray-800 dark:text-slate-100">{{ user?.adresse || t('profile.notSpecified') }}</span></div>
          </div>
        </div>

        <div class="bg-white dark:bg-slate-900 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-slate-800 space-y-4">
          <h3 class="text-base font-bold text-principal-dark dark:text-sky-300 flex items-center gap-2">
            <svg class="w-5 h-5 text-principal dark:text-sky-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/></svg>
            {{ t('profile.statusAndRoles') }}
          </h3>
          <div class="text-xs sm:text-sm space-y-3">
            <div class="flex items-center justify-between">
              <span class="text-gray-400 dark:text-slate-400 font-medium">{{ t('profile.accountStatus') }}</span>
              <span class="bg-green-100 dark:bg-emerald-950/80 text-green-800 dark:text-emerald-300 text-xs font-bold px-3 py-1 rounded-full capitalize">
                {{ user?.statut || 'actif' }}
              </span>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-gray-400 dark:text-slate-400 font-medium">{{ t('profile.assignedRoles') }}</span>
              <div class="flex gap-1.5">
                <span v-for="role in user?.roles" :key="role" class="bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-slate-200 text-xs font-bold px-2.5 py-0.5 rounded-md capitalize">
                  {{ role }}
                </span>
              </div>
            </div>
            <div class="flex items-center justify-between pt-2 border-t border-gray-100 dark:border-slate-800">
              <span class="text-gray-400 dark:text-slate-400 font-medium">{{ t('profile.lastLogin') }}</span>
              <span class="text-gray-600 dark:text-slate-300 font-medium">
                {{ user?.dernier_connexion ? new Date(user.dernier_connexion).toLocaleString() : t('profile.recently') }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Tab 2: Voyageur Details -->
      <div v-else-if="activeTab === 'voyageur'" class="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl shadow-sm border border-gray-100 dark:border-slate-800">
        <div v-if="user?.voyageur" class="space-y-6">
          <div class="flex items-center justify-between border-b border-gray-100 dark:border-slate-800 pb-4">
            <div>
              <h3 class="text-lg font-bold text-principal-dark dark:text-sky-300 font-serif">{{ t('profile.voyageurProfileRegistered') }}</h3>
              <p class="text-xs text-gray-500 dark:text-slate-400">{{ t('profile.idVerificationDesc') }}</p>
            </div>
            <span :class="[
              'px-3 py-1 text-xs font-bold rounded-full uppercase',
              user.voyageur.statut === 'en_attente' ? 'bg-orange-100 dark:bg-amber-950/80 text-orange-800 dark:text-amber-300' : 'bg-green-100 dark:bg-emerald-950/80 text-green-800 dark:text-emerald-300'
            ]">
              {{ user.voyageur.statut === 'en_attente' ? t('profile.awaitingValidation') : t('profile.verified') }}
            </span>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs sm:text-sm">
            <div class="bg-gray-50 dark:bg-slate-800/80 p-4 rounded-2xl">
              <span class="text-gray-400 dark:text-slate-400 font-medium block mb-1">{{ t('profile.idType') }}</span>
              <span class="font-bold text-gray-800 dark:text-slate-100 uppercase">{{ user.voyageur.type_piece }}</span>
            </div>
            <div class="bg-gray-50 dark:bg-slate-800/80 p-4 rounded-2xl">
              <span class="text-gray-400 dark:text-slate-400 font-medium block mb-1">{{ t('profile.idNumber') }}</span>
              <span class="font-bold text-gray-800 dark:text-slate-100">{{ user.voyageur.numero_piece }}</span>
            </div>
          </div>

          <!-- Documents previews section -->
          <div class="space-y-3 pt-2">
            <h4 class="text-xs sm:text-sm font-bold text-principal-dark dark:text-sky-300 flex items-center gap-2">
              <svg class="w-4 h-4 text-principal dark:text-sky-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span>{{ t('profile.uploadedDocuments') }}</span>
            </h4>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <!-- Recto Card -->
              <div class="border border-gray-200 dark:border-slate-700 rounded-2xl p-4 bg-gray-50 dark:bg-slate-800/80 flex flex-col justify-between space-y-3 hover:border-principal/30 dark:hover:border-sky-500/30 transition-all shadow-xs">
                <div class="flex items-center justify-between">
                  <span class="text-xs font-bold text-gray-700 dark:text-slate-200 uppercase tracking-wide flex items-center gap-1.5">
                    <span class="w-2 h-2 rounded-full bg-principal dark:bg-sky-400"></span>
                    {{ t('profile.recto') }} ({{ user.voyageur.type_piece?.toUpperCase() || 'CNI' }})
                  </span>
                  <span v-if="rectoUrl" class="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950 px-2.5 py-0.5 rounded-full border border-emerald-100 dark:border-emerald-800">{{ t('profile.provided') }}</span>
                  <span v-else class="text-[10px] font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950 px-2.5 py-0.5 rounded-full border border-amber-100 dark:border-amber-800">{{ t('profile.notProvided') }}</span>
                </div>

                <div class="relative h-44 sm:h-52 bg-gray-100 dark:bg-slate-900 rounded-xl overflow-hidden group flex items-center justify-center border border-gray-200 dark:border-slate-700">
                  <template v-if="rectoUrl">
                    <img 
                      :src="formatImageUrl(rectoUrl)" 
                      alt="CNI Recto"
                      class="w-full h-full object-contain p-1.5 transition-transform duration-300 group-hover:scale-105"
                      @error="(e) => e.target.style.display = 'none'"
                    />
                    <div 
                      @click="openImagePreview(rectoUrl, `Pièce d'identité - Recto (${user.voyageur.numero_piece})`)"
                      class="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white cursor-pointer gap-1.5"
                    >
                      <svg class="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7"/>
                      </svg>
                      <span class="text-xs font-bold">{{ t('profile.clickToEnlarge') }}</span>
                    </div>
                  </template>
                  <template v-else>
                    <div class="text-center p-4 space-y-1">
                      <svg class="w-10 h-10 mx-auto text-gray-300 dark:text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0" />
                      </svg>
                      <p class="text-xs font-medium text-gray-400 dark:text-slate-500">{{ t('profile.noImageAvailable') }}</p>
                    </div>
                  </template>
                </div>

                <div v-if="rectoUrl" class="flex justify-end pt-1">
                  <button 
                    type="button"
                    @click="openImagePreview(rectoUrl, `Pièce d'identité - Recto (${user.voyageur.numero_piece})`)"
                    class="text-xs font-bold text-principal dark:text-sky-300 hover:text-principal-dark dark:hover:text-sky-200 flex items-center gap-1 cursor-pointer"
                  >
                    <span>{{ t('profile.enlargeImage') }}</span>
                    <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/>
                    </svg>
                  </button>
                </div>
              </div>

              <!-- Verso Card -->
              <div class="border border-gray-200 dark:border-slate-700 rounded-2xl p-4 bg-gray-50 dark:bg-slate-800/80 flex flex-col justify-between space-y-3 hover:border-principal/30 dark:hover:border-sky-500/30 transition-all shadow-xs">
                <div class="flex items-center justify-between">
                  <span class="text-xs font-bold text-gray-700 dark:text-slate-200 uppercase tracking-wide flex items-center gap-1.5">
                    <span class="w-2 h-2 rounded-full bg-principal dark:bg-sky-400"></span>
                    {{ t('profile.verso') }} ({{ user.voyageur.type_piece?.toUpperCase() || 'CNI' }})
                  </span>
                  <span v-if="versoUrl" class="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950 px-2.5 py-0.5 rounded-full border border-emerald-100 dark:border-emerald-800">{{ t('profile.provided') }}</span>
                  <span v-else class="text-[10px] font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950 px-2.5 py-0.5 rounded-full border border-amber-100 dark:border-amber-800">{{ t('profile.notProvided') }}</span>
                </div>

                <div class="relative h-44 sm:h-52 bg-gray-100 dark:bg-slate-900 rounded-xl overflow-hidden group flex items-center justify-center border border-gray-200 dark:border-slate-700">
                  <template v-if="versoUrl">
                    <img 
                      :src="formatImageUrl(versoUrl)" 
                      alt="CNI Verso"
                      class="w-full h-full object-contain p-1.5 transition-transform duration-300 group-hover:scale-105"
                      @error="(e) => e.target.style.display = 'none'"
                    />
                    <div 
                      @click="openImagePreview(versoUrl, `Pièce d'identité - Verso (${user.voyageur.numero_piece})`)"
                      class="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white cursor-pointer gap-1.5"
                    >
                      <svg class="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7"/>
                      </svg>
                      <span class="text-xs font-bold">{{ t('profile.clickToEnlarge') }}</span>
                    </div>
                  </template>
                  <template v-else>
                    <div class="text-center p-4 space-y-1">
                      <svg class="w-10 h-10 mx-auto text-gray-300 dark:text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0" />
                      </svg>
                      <p class="text-xs font-medium text-gray-400 dark:text-slate-500">{{ t('profile.noImageAvailable') }}</p>
                    </div>
                  </template>
                </div>

                <div v-if="versoUrl" class="flex justify-end pt-1">
                  <button 
                    type="button"
                    @click="openImagePreview(versoUrl, `Pièce d'identité - Verso (${user.voyageur.numero_piece})`)"
                    class="text-xs font-bold text-principal dark:text-sky-300 hover:text-principal-dark dark:hover:text-sky-200 flex items-center gap-1 cursor-pointer"
                  >
                    <span>{{ t('profile.enlargeImage') }}</span>
                    <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/>
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div v-else class="text-center py-8">
          <div class="w-16 h-16 bg-tertiaire/20 text-tertiaire-dark dark:text-amber-300 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/></svg>
          </div>
          <h3 class="text-lg font-bold text-principal-dark dark:text-sky-300 font-serif mb-2">{{ t('profile.noVoyageurProfile') }}</h3>
          <p class="text-xs sm:text-sm text-gray-500 dark:text-slate-400 max-w-md mx-auto mb-6">
            {{ t('profile.noVoyageurProfileSub') }}
          </p>
          <button
            @click="showVoyageurModal = true"
            class="bg-secondaire hover:bg-secondaire-dark text-white font-bold px-6 py-3 rounded-2xl text-xs sm:text-sm shadow-md transition-all cursor-pointer"
          >
            {{ t('profile.submitIdDocs') }}
          </button>
        </div>
      </div>

      <!-- Tab: Mes Revenus GP -->
      <div v-else-if="activeTab === 'revenus'" class="space-y-6">
        <!-- Revenue Summary Grid -->
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
          <div class="bg-[#053754] dark:bg-slate-900 border border-transparent dark:border-slate-800 text-white rounded-3xl p-4 sm:p-5 shadow-md space-y-1 relative overflow-hidden">
            <span class="text-[11px] sm:text-xs font-bold text-sky-200 uppercase tracking-wider block">{{ t('voyageur.revenus.totalRevenue') }}</span>
            <div class="text-xl sm:text-2xl font-black text-white">{{ formatPrice(totalRevenusProfileConverted, currentCurrency) }}</div>
            <p class="text-[10px] sm:text-[11px] text-sky-300">Sur {{ paidReservationsProfileCount }} {{ paidReservationsProfileCount > 1 ? t('voyageur.revenus.deliveredParcelsCount', 'réservations transportées') : t('voyageur.revenus.deliveredParcelsCount', 'réservation transportée') }}</p>
          </div>

          <div class="bg-white dark:bg-slate-900 rounded-3xl p-4 sm:p-5 border border-emerald-200 dark:border-emerald-900 shadow-2xs space-y-1">
            <span class="text-[11px] sm:text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider block">{{ t('voyageur.revenus.collectedPayments', 'Revenus Disponibles') }}</span>
            <div class="text-xl sm:text-2xl font-black text-emerald-800 dark:text-emerald-300">{{ formatPrice(revenusDisponiblesProfileConverted, currentCurrency) }}</div>
            <p class="text-[10px] sm:text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">{{ t('voyageur.revenus.paidOnline', 'Paiements validés & reçus') }}</p>
          </div>

          <div class="bg-white dark:bg-slate-900 rounded-3xl p-4 sm:p-5 border border-amber-200 dark:border-amber-900 shadow-2xs space-y-1">
            <span class="text-[11px] sm:text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider block">{{ t('voyageur.revenus.pendingPayout', 'Revenus en Attente') }}</span>
            <div class="text-xl sm:text-2xl font-black text-amber-800 dark:text-amber-300">{{ formatPrice(revenusEnAttenteProfileConverted, currentCurrency) }}</div>
            <p class="text-[10px] sm:text-[11px] text-amber-600 dark:text-amber-400 font-semibold">{{ t('voyageur.revenus.validatedBookings', 'Colis en cours de livraison') }}</p>
          </div>
        </div>

        <!-- Recent Transactions Preview -->
        <div class="bg-white dark:bg-slate-900 p-5 sm:p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-slate-800 space-y-4">
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 class="text-base font-extrabold text-[#053754] dark:text-sky-300">{{ t('voyageur.revenus.historyTitle', 'Derniers revenus perçus') }}</h3>
              <p class="text-xs text-gray-400 dark:text-slate-400 font-medium sm:hidden">Cliquez sur un reçu pour voir l'historique complet</p>
            </div>
            <button
              @click="router.push('/voyageur/revenus')"
              class="text-xs font-bold text-principal dark:text-sky-300 hover:text-principal-dark dark:hover:text-sky-200 flex items-center gap-1 cursor-pointer self-start sm:self-auto"
            >
              <span>{{ t('voyageur.revenus.viewDetailsTitle', 'Voir tout l\'historique') }}</span>
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/></svg>
            </button>
          </div>

          <div v-if="recentTransactionsProfile.length === 0" class="py-6 text-center text-xs text-gray-400 dark:text-slate-400">
            {{ t('voyageur.revenus.noRevenues', 'Aucun revenu enregistré pour le moment.') }}
          </div>

          <div v-else class="divide-y divide-gray-100 dark:divide-slate-800 text-xs">
            <div
              v-for="tx in recentTransactionsProfile"
              :key="tx.id"
              @click="router.push('/voyageur/revenus')"
              class="py-3 flex items-center justify-between gap-3 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 -mx-1 px-2 rounded-xl transition-all"
            >
              <div class="min-w-0 space-y-0.5">
                <div class="flex items-center gap-1.5 flex-wrap">
                  <span class="font-extrabold text-[#053754] dark:text-sky-300 text-xs">{{ tx.code }}</span>
                  <span class="text-xs text-gray-500 dark:text-slate-400 font-medium truncate">• {{ tx.client }}</span>
                </div>
                <p class="text-[11px] text-gray-400 dark:text-slate-400 font-medium truncate">{{ tx.route }}</p>
              </div>
              <div class="text-right shrink-0">
                <div class="font-black text-xs sm:text-sm text-gray-900 dark:text-slate-100">{{ tx.montant }}</div>
                <span
                  class="inline-block text-[9px] font-bold px-2 py-0.5 rounded-full uppercase"
                  :class="tx.isDisponible ? 'text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950' : 'text-amber-700 dark:text-amber-300 bg-amber-100 dark:bg-amber-950'"
                >
                  {{ tx.isDisponible ? t('voyageur.revenus.available', '✓ DISPONIBLE') : t('voyageur.revenus.pending', '⏳ EN ATTENTE') }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Tab 3: Edit Profile Form -->
      <div v-else-if="activeTab === 'edit'" class="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl shadow-sm border border-gray-100 dark:border-slate-800">
        <h3 class="text-lg font-bold text-principal-dark dark:text-sky-300 font-serif mb-4">{{ t('profile.editPersonalTitle') }}</h3>
        <form @submit.prevent="handleUpdateProfile" class="space-y-4" novalidate>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label class="block text-xs font-semibold text-gray-700 dark:text-slate-200 mb-1">
                {{ t('profile.firstName') }} <span class="text-gray-400 dark:text-slate-400 font-normal">(non modifiable)</span>
              </label>
              <input 
                v-model="editForm.prenom" 
                type="text" 
                disabled 
                class="w-full px-3.5 py-2.5 text-xs sm:text-sm border border-gray-200 dark:border-slate-700 bg-gray-100 dark:bg-slate-800 text-gray-500 dark:text-slate-400 rounded-xl outline-none cursor-not-allowed font-medium" 
              />
            </div>
            <div>
              <label class="block text-xs font-semibold text-gray-700 dark:text-slate-200 mb-1">
                {{ t('profile.lastName') }} <span class="text-gray-400 dark:text-slate-400 font-normal">(non modifiable)</span>
              </label>
              <input 
                v-model="editForm.nom" 
                type="text" 
                disabled 
                class="w-full px-3.5 py-2.5 text-xs sm:text-sm border border-gray-200 dark:border-slate-700 bg-gray-100 dark:bg-slate-800 text-gray-500 dark:text-slate-400 rounded-xl outline-none cursor-not-allowed font-medium" 
              />
            </div>
          </div>

          <div>
            <label class="block text-xs font-semibold text-gray-700 dark:text-slate-200 mb-1">
              {{ t('profile.email') }} <span v-if="user?.email" class="text-gray-400 dark:text-slate-400 font-normal">(non modifiable)</span>
            </label>
            <input
              v-model="editForm.email"
              type="email"
              :disabled="!!user?.email"
              :class="[
                'w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl outline-none transition-all font-medium',
                user?.email 
                  ? 'border border-gray-200 dark:border-slate-700 bg-gray-100 dark:bg-slate-800 text-gray-500 dark:text-slate-400 cursor-not-allowed' 
                  : 'border border-gray-300 dark:border-slate-700 focus:border-principal dark:focus:border-sky-400 text-gray-900 dark:text-slate-100 bg-white dark:bg-slate-800'
              ]"
            />
            <p v-if="editErrors.email" class="text-[11px] text-red-600 dark:text-red-400 mt-1 font-medium">{{ editErrors.email }}</p>
          </div>

          <div>
            <label class="block text-xs font-semibold text-gray-700 dark:text-slate-200 mb-1">
              {{ t('profile.phone') }} <span class="text-gray-400 dark:text-slate-400 font-normal">(non modifiable)</span>
            </label>
            <input
              v-model="editForm.telephone"
              type="tel"
              disabled
              class="w-full px-3.5 py-2.5 text-xs sm:text-sm border border-gray-200 dark:border-slate-700 bg-gray-100 dark:bg-slate-800 text-gray-500 dark:text-slate-400 rounded-xl outline-none cursor-not-allowed font-medium"
            />
          </div>

          <div>
            <label class="block text-xs font-semibold text-gray-700 dark:text-slate-200 mb-1">{{ t('profile.address') }}</label>
            <input v-model="editForm.adresse" type="text" class="w-full px-3.5 py-2.5 text-xs sm:text-sm border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100 rounded-xl focus:border-principal dark:focus:border-sky-400 outline-none font-medium" />
          </div>

          <div class="border-t border-gray-100 dark:border-slate-800 pt-4 space-y-4">
            <h4 class="font-extrabold text-sm text-principal-dark dark:text-sky-300">{{ t('profile.newPassword') }}</h4>

            <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <!-- Mot de passe actuel -->
              <div>
                <label class="block text-xs font-semibold text-gray-700 dark:text-slate-200 mb-1">{{ t('profile.currentPassword') }}</label>
                <div class="relative">
                  <input
                    v-model="editForm.mot_de_passe_actuel"
                    :type="showCurrentPassword ? 'text' : 'password'"
                    placeholder="••••••••"
                    class="w-full px-3.5 py-2.5 pr-10 text-xs sm:text-sm border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100 rounded-xl focus:border-principal dark:focus:border-sky-400 outline-none font-medium"
                  />
                  <button
                    type="button"
                    @click="showCurrentPassword = !showCurrentPassword"
                    class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-slate-400 hover:text-gray-600 dark:hover:text-slate-200 transition-colors p-1 cursor-pointer"
                  >
                    <svg v-if="!showCurrentPassword" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                    <svg v-else class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858-5.908a10.016 10.016 0 014.122-.963c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21M3 3l18 18" />
                    </svg>
                  </button>
                </div>
              </div>

              <!-- Nouveau mot de passe -->
              <div>
                <label class="block text-xs font-semibold text-gray-700 dark:text-slate-200 mb-1">{{ t('profile.newPassword') }}</label>
                <div class="relative">
                  <input
                    v-model="editForm.password"
                    :type="showNewPassword ? 'text' : 'password'"
                    placeholder="••••••••"
                    class="w-full px-3.5 py-2.5 pr-10 text-xs sm:text-sm border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100 rounded-xl focus:border-principal dark:focus:border-sky-400 outline-none font-medium"
                  />
                  <button
                    type="button"
                    @click="showNewPassword = !showNewPassword"
                    class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-slate-400 hover:text-gray-600 dark:hover:text-slate-200 transition-colors p-1 cursor-pointer"
                  >
                    <svg v-if="!showNewPassword" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                    <svg v-else class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858-5.908a10.016 10.016 0 014.122-.963c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21M3 3l18 18" />
                    </svg>
                  </button>
                </div>
              </div>

              <!-- Confirmer le mot de passe -->
              <div>
                <label class="block text-xs font-semibold text-gray-700 dark:text-slate-200 mb-1">{{ t('profile.confirmPassword') }}</label>
                <div class="relative">
                  <input
                    v-model="editForm.password_confirmation"
                    :type="showConfirmPassword ? 'text' : 'password'"
                    placeholder="••••••••"
                    class="w-full px-3.5 py-2.5 pr-10 text-xs sm:text-sm border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100 rounded-xl focus:border-principal dark:focus:border-sky-400 outline-none font-medium"
                  />
                  <button
                    type="button"
                    @click="showConfirmPassword = !showConfirmPassword"
                    class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-slate-400 hover:text-gray-600 dark:hover:text-slate-200 transition-colors p-1 cursor-pointer"
                  >
                    <svg v-if="!showConfirmPassword" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                    <svg v-else class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858-5.908a10.016 10.016 0 014.122-.963c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21M3 3l18 18" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
            <p v-if="editErrors.password" class="text-[11px] text-red-600 dark:text-red-400 font-medium">{{ editErrors.password }}</p>
          </div>

          <div class="pt-2 flex justify-end gap-3">
            <button type="button" @click="activeTab = 'info'" class="px-5 py-2.5 text-xs sm:text-sm font-semibold text-gray-600 dark:text-slate-400 hover:text-gray-800 dark:hover:text-slate-200">
              {{ t('common.cancel') }}
            </button>
            <button
              type="submit"
              :disabled="isLoading"
              class="bg-principal-dark hover:bg-principal dark:bg-sky-600 dark:hover:bg-sky-500 text-white text-xs sm:text-sm font-bold px-6 py-2.5 rounded-xl shadow-md transition-all cursor-pointer"
            >
              {{ t('profile.updateBtn') }}
            </button>
          </div>
        </form>
      </div>

    </main>

    <!-- Modal Form: Création de Profil Voyageur -->
    <div v-if="showVoyageurModal" class="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div class="bg-white dark:bg-slate-900 w-full max-w-lg rounded-3xl p-6 sm:p-8 shadow-2xl space-y-5 animate-in fade-in zoom-in duration-200 border border-transparent dark:border-slate-800">
        <div class="flex items-center justify-between border-b border-gray-100 dark:border-slate-800 pb-3">
          <h3 class="text-lg font-bold text-principal-dark dark:text-sky-300 font-serif">Devenir un Voyageur GP</h3>
          <button @click="showVoyageurModal = false" class="text-gray-400 dark:text-slate-400 hover:text-gray-600 dark:hover:text-slate-200 p-1">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
          </button>
        </div>

        <form @submit.prevent="handleCreateVoyageur" class="space-y-4" novalidate>
          <div>
            <label class="block text-xs font-semibold text-gray-700 dark:text-slate-200 mb-1">Type de pièce d'identité</label>
            <select v-model="voyageurForm.type_piece" class="w-full px-3.5 py-2.5 text-xs sm:text-sm border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100 rounded-xl outline-none">
              <option value="cni">Carte Nationale d'Identité (CNI)</option>
              <option value="passeport">Passeport</option>
            </select>
          </div>

          <div>
            <label class="block text-xs font-semibold text-gray-700 dark:text-slate-200 mb-1">Numéro de la pièce</label>
            <input
              v-model="voyageurForm.numero_piece"
              type="text"
              placeholder="1342199800123"
              class="w-full px-3.5 py-2.5 text-xs sm:text-sm border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100 rounded-xl outline-none font-medium placeholder-gray-400 dark:placeholder-slate-500"
            />
            <p v-if="voyageurErrors.numero_piece" class="text-[11px] text-red-600 dark:text-red-400 mt-1 font-medium">{{ voyageurErrors.numero_piece }}</p>
          </div>

          <!-- File upload CNI Recto -->
          <div>
            <label class="block text-xs font-semibold text-gray-700 dark:text-slate-200 mb-1">CNI Recto (Image)</label>
            <input
              type="file"
              accept="image/*"
              @change="(e) => handleFileChange(e, 'cni_recto')"
              class="w-full text-xs text-gray-500 dark:text-slate-400 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-principal/10 dark:file:bg-sky-950 file:text-principal dark:file:text-sky-300 hover:file:bg-principal/20 dark:hover:file:bg-sky-900"
            />
            <p v-if="rectoFileName" class="text-[11px] text-gray-500 dark:text-slate-400 mt-1">Sélectionné: {{ rectoFileName }}</p>
            <p v-if="voyageurErrors.cni_recto" class="text-[11px] text-red-600 dark:text-red-400 mt-1 font-medium">{{ voyageurErrors.cni_recto }}</p>
          </div>

          <!-- File upload CNI Verso -->
          <div>
            <label class="block text-xs font-semibold text-gray-700 dark:text-slate-200 mb-1">CNI Verso (Image)</label>
            <input
              type="file"
              accept="image/*"
              @change="(e) => handleFileChange(e, 'cni_verso')"
              class="w-full text-xs text-gray-500 dark:text-slate-400 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-principal/10 dark:file:bg-sky-950 file:text-principal dark:file:text-sky-300 hover:file:bg-principal/20 dark:hover:file:bg-sky-900"
            />
            <p v-if="versoFileName" class="text-[11px] text-gray-500 dark:text-slate-400 mt-1">Sélectionné: {{ versoFileName }}</p>
            <p v-if="voyageurErrors.cni_verso" class="text-[11px] text-red-600 dark:text-red-400 mt-1 font-medium">{{ voyageurErrors.cni_verso }}</p>
          </div>

          <div class="flex items-center gap-2 pt-2">
            <input id="mode_client" type="checkbox" v-model="voyageurForm.mode_client" class="rounded text-principal border-gray-300 dark:border-slate-700 dark:bg-slate-800" />
            <label for="mode_client" class="text-xs text-gray-600 dark:text-slate-300 font-medium">Rester en mode client pour le moment</label>
          </div>

          <div class="pt-3 flex justify-end gap-3">
            <button type="button" @click="showVoyageurModal = false" class="px-4 py-2 text-xs font-semibold text-gray-600 dark:text-slate-400 hover:text-gray-800 dark:hover:text-slate-200">
              Annuler
            </button>
            <button
              type="submit"
              :disabled="isLoading"
              class="bg-secondaire hover:bg-secondaire-dark text-white text-xs sm:text-sm font-bold px-5 py-2.5 rounded-xl shadow-md transition-all cursor-pointer"
            >
              Soumettre ma demande
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Lightbox Image Preview Modal -->
    <div 
      v-if="imagePreviewModal.isOpen" 
      @click.self="closeImagePreview"
      class="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200"
    >
      <div class="relative max-w-4xl w-full bg-white rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        <!-- Header -->
        <div class="px-6 py-4 bg-principal text-white flex items-center justify-between border-b border-white/10">
          <h3 class="text-sm font-bold truncate pr-4">{{ imagePreviewModal.title }}</h3>
          <button 
            @click="closeImagePreview"
            class="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>

        <!-- Image Body -->
        <div class="p-4 bg-slate-900 flex-1 overflow-auto flex items-center justify-center min-h-[300px]">
          <img 
            :src="imagePreviewModal.url" 
            :alt="imagePreviewModal.title"
            class="max-w-full max-h-[72vh] object-contain rounded-xl shadow-lg border border-white/10"
          />
        </div>

        <!-- Footer -->
        <div class="px-6 py-3 bg-gray-50 flex items-center justify-between text-xs text-gray-500 border-t border-gray-100">
          <span class="font-medium text-gray-600">Prévisualisation Document</span>
          <a 
            :href="imagePreviewModal.url" 
            target="_blank"
            rel="noopener noreferrer"
            class="text-principal font-bold hover:underline flex items-center gap-1"
          >
            <span>Ouvrir l'image dans un nouvel onglet</span>
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/>
            </svg>
          </a>
        </div>
      </div>
    </div>

    <!-- Dynamic Bottom Navigation Bar based on current mode -->
    <VoyageurBottomNav v-if="modeActuel === 'voyageur'" />
    <ClientBottomNav v-else />
  </div>
</template>
