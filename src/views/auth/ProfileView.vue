<script setup>
import { ref, reactive, onMounted, computed, watch } from 'vue'
import { useRouter, RouterLink } from 'vue-router'
import { useAuth } from '@/composables/useAuth'

const router = useRouter()
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
  logout
} = useAuth()

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
  adresse: ''
})

const editErrors = reactive({
  nom: '',
  prenom: '',
  email: '',
  telephone: ''
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

onMounted(async () => {
  const currentUser = await fetchUser()
  if (currentUser) {
    initEditForm(currentUser)
  }
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

  if (!editForm.nom.trim()) { editErrors.nom = 'Le nom est requis'; valid = false }
  if (!editForm.prenom.trim()) { editErrors.prenom = 'Le prénom est requis'; valid = false }
  if (!editForm.email) { editErrors.email = "L'email est requis"; valid = false }
  if (!editForm.telephone) { editErrors.telephone = 'Le téléphone est requis'; valid = false }

  return valid
}

const handleUpdateProfile = async () => {
  if (!validateEditForm()) return
  try {
    await updateProfile({ ...editForm })
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
    title: 'Déconnexion',
    text: 'Voulez-vous vraiment vous déconnecter de votre compte Rahma GP ?',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#053754',
    cancelButtonColor: '#D94132',
    confirmButtonText: 'Oui, se déconnecter',
    cancelButtonText: 'Annuler',
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
  <div class="min-h-screen bg-[#FAF7F2] font-sans pb-24">
    <!-- Top Client Header (Identical to all other pages) -->
    <ClientHeader />

    <!-- Main Container -->
    <main class="max-w-5xl mx-auto px-4 sm:px-6 pt-6">
      
      <!-- Global Messages -->
      <div v-if="successMessage" class="mb-4 p-4 bg-green-50 border border-green-200 text-green-800 text-sm rounded-2xl flex items-center justify-between shadow-xs">
        <div class="flex items-center gap-2">
          <svg class="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
          </svg>
          <span>{{ successMessage }}</span>
        </div>
      </div>

      <div v-if="error" class="mb-4 p-4 bg-red-50 border border-red-200 text-red-700 text-sm rounded-2xl flex items-center gap-2 shadow-xs">
        <svg class="w-5 h-5 text-red-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span>{{ error }}</span>
      </div>

      <!-- Top Profile Overview Banner Card -->
      <div v-if="user" class="bg-white rounded-3xl p-6 sm:p-8 shadow-md border border-gray-100 mb-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div class="flex items-center gap-4 sm:gap-6">
          <!-- Avatar Circle -->
          <div class="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-principal text-white font-serif font-bold text-xl sm:text-2xl flex items-center justify-center border-4 border-white shadow-md shrink-0">
            {{ userInitials }}
          </div>

          <div>
            <div class="flex items-center gap-2 flex-wrap">
              <h1 class="text-xl sm:text-2xl font-bold text-principal-dark font-serif">
                {{ user.prenom }} {{ user.nom }}
              </h1>
              <span :class="[
                'text-[10px] sm:text-xs px-2.5 py-0.5 rounded-full font-extrabold uppercase tracking-wide',
                modeActuel === 'voyageur' ? 'bg-tertiaire text-principal-dark' : 'bg-principal-light/10 text-principal'
              ]">
                Mode {{ modeActuel }}
              </span>
            </div>

            <p class="text-xs sm:text-sm text-gray-500 mt-1 flex items-center gap-2">
              <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>
              {{ user.email }}
            </p>
            <p class="text-xs sm:text-sm text-gray-500 mt-0.5 flex items-center gap-2">
              <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/></svg>
              {{ user.telephone }}
            </p>
          </div>
        </div>

        <!-- Action Buttons (Mode Switcher & Déconnexion) -->
        <div class="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <button
            v-if="user.roles?.includes('voyageur') || user.voyageur"
            @click="handleToggleMode"
            :disabled="isLoading"
            class="px-5 py-3 rounded-2xl bg-principal text-white font-semibold text-xs sm:text-sm shadow-md hover:bg-principal-dark transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
            </svg>
            <span>Basculer vers le mode {{ modeActuel === 'client' ? 'Voyageur' : 'Client' }}</span>
          </button>

          <button
            v-else
            @click="showVoyageurModal = true"
            class="px-5 py-3 rounded-2xl bg-secondaire text-white font-semibold text-xs sm:text-sm shadow-md hover:bg-secondaire-dark transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
            </svg>
            <span>Devenir un Voyageur GP</span>
          </button>

          <!-- Déconnexion Button -->
          <button
            @click="handleLogout"
            class="px-5 py-3 rounded-2xl bg-red-50 hover:bg-red-100 border border-red-200 text-[#B50302] font-bold text-xs sm:text-sm shadow-2xs transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <svg class="w-4 h-4 text-[#B50302]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            <span>Déconnexion</span>
          </button>
        </div>
      </div>

      <!-- Navigation Tabs (Horizontally scrollable on mobile) -->
      <div class="flex border-b border-gray-200 mb-6 text-xs sm:text-sm font-semibold gap-4 sm:gap-6 overflow-x-auto no-scrollbar whitespace-nowrap py-1">
        <button
          @click="activeTab = 'info'"
          :class="[
            'pb-3 border-b-2 transition-colors cursor-pointer shrink-0',
            activeTab === 'info' ? 'border-principal text-principal-dark font-bold' : 'border-transparent text-gray-500 hover:text-gray-800'
          ]"
        >
          Informations du Compte
        </button>
        <button
          @click="activeTab = 'voyageur'"
          :class="[
            'pb-3 border-b-2 transition-colors cursor-pointer shrink-0',
            activeTab === 'voyageur' ? 'border-principal text-principal-dark font-bold' : 'border-transparent text-gray-500 hover:text-gray-800'
          ]"
        >
          Statut & Profil Voyageur
        </button>
        <button
          v-if="modeActuel === 'voyageur'"
          @click="activeTab = 'revenus'"
          :class="[
            'pb-3 border-b-2 transition-colors cursor-pointer shrink-0',
            activeTab === 'revenus' ? 'border-principal text-principal-dark font-bold' : 'border-transparent text-gray-500 hover:text-gray-800'
          ]"
        >
          Mes Revenus GP
        </button>
        <button
          @click="activeTab = 'edit'"
          :class="[
            'pb-3 border-b-2 transition-colors cursor-pointer shrink-0',
            activeTab === 'edit' ? 'border-principal text-principal-dark font-bold' : 'border-transparent text-gray-500 hover:text-gray-800'
          ]"
        >
          Modifier mes données
        </button>
      </div>

      <!-- Tab 1: Info Utilisateur -->
      <div v-if="activeTab === 'info'" class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div class="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 space-y-4">
          <h3 class="text-base font-bold text-principal-dark flex items-center gap-2">
            <svg class="w-5 h-5 text-principal" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>
            Identité
          </h3>
          <div class="text-xs sm:text-sm space-y-2 text-gray-600 divide-y divide-gray-100">
            <div class="pt-2 flex justify-between"><span class="font-medium text-gray-400">Prénom:</span> <span class="font-bold text-gray-800">{{ user?.prenom }}</span></div>
            <div class="pt-2 flex justify-between"><span class="font-medium text-gray-400">Nom:</span> <span class="font-bold text-gray-800">{{ user?.nom }}</span></div>
            <div class="pt-2 flex justify-between"><span class="font-medium text-gray-400">Email:</span> <span class="font-bold text-gray-800">{{ user?.email }}</span></div>
            <div class="pt-2 flex justify-between"><span class="font-medium text-gray-400">Téléphone:</span> <span class="font-bold text-gray-800">{{ user?.telephone }}</span></div>
            <div class="pt-2 flex justify-between"><span class="font-medium text-gray-400">Adresse:</span> <span class="font-bold text-gray-800">{{ user?.adresse || 'Non renseignée' }}</span></div>
          </div>
        </div>

        <div class="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 space-y-4">
          <h3 class="text-base font-bold text-principal-dark flex items-center gap-2">
            <svg class="w-5 h-5 text-principal" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/></svg>
            Statut & Rôles
          </h3>
          <div class="text-xs sm:text-sm space-y-3">
            <div class="flex items-center justify-between">
              <span class="text-gray-400 font-medium">Statut du compte:</span>
              <span class="bg-green-100 text-green-800 text-xs font-bold px-3 py-1 rounded-full capitalize">
                {{ user?.statut || 'actif' }}
              </span>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-gray-400 font-medium">Rôles attribués:</span>
              <div class="flex gap-1.5">
                <span v-for="role in user?.roles" :key="role" class="bg-gray-100 text-gray-700 text-xs font-bold px-2.5 py-0.5 rounded-md capitalize">
                  {{ role }}
                </span>
              </div>
            </div>
            <div class="flex items-center justify-between pt-2 border-t border-gray-100">
              <span class="text-gray-400 font-medium">Dernière connexion:</span>
              <span class="text-gray-600 font-medium">
                {{ user?.dernier_connexion ? new Date(user.dernier_connexion).toLocaleString() : 'Récemment' }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Tab 2: Voyageur Details -->
      <div v-else-if="activeTab === 'voyageur'" class="bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-gray-100">
        <div v-if="user?.voyageur" class="space-y-6">
          <div class="flex items-center justify-between border-b border-gray-100 pb-4">
            <div>
              <h3 class="text-lg font-bold text-principal-dark font-serif">Profil Voyageur Enregistré</h3>
              <p class="text-xs text-gray-500">Informations de vérification d'identité pour le transport de colis</p>
            </div>
            <span :class="[
              'px-3 py-1 text-xs font-bold rounded-full uppercase',
              user.voyageur.statut === 'en_attente' ? 'bg-orange-100 text-orange-800' : 'bg-green-100 text-green-800'
            ]">
              {{ user.voyageur.statut === 'en_attente' ? 'En attente de validation' : 'Vérifié' }}
            </span>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs sm:text-sm">
            <div class="bg-gray-50 p-4 rounded-2xl">
              <span class="text-gray-400 font-medium block mb-1">Type de pièce d'identité</span>
              <span class="font-bold text-gray-800 uppercase">{{ user.voyageur.type_piece }}</span>
            </div>
            <div class="bg-gray-50 p-4 rounded-2xl">
              <span class="text-gray-400 font-medium block mb-1">Numéro de la pièce</span>
              <span class="font-bold text-gray-800">{{ user.voyageur.numero_piece }}</span>
            </div>
          </div>

          <!-- Documents previews -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div class="border border-gray-200 rounded-2xl p-4 text-center bg-gray-50">
              <p class="text-xs font-semibold text-gray-600 mb-2">Pièce CNI Recto</p>
              <div class="h-28 bg-gray-200 rounded-xl flex items-center justify-center text-xs text-gray-500 font-medium overflow-hidden">
                <span v-if="user.voyageur.cni_recto" class="text-principal-dark truncate px-2 font-mono text-[11px]">{{ user.voyageur.cni_recto }}</span>
                <span v-else>Non disponible</span>
              </div>
            </div>
            <div class="border border-gray-200 rounded-2xl p-4 text-center bg-gray-50">
              <p class="text-xs font-semibold text-gray-600 mb-2">Pièce CNI Verso</p>
              <div class="h-28 bg-gray-200 rounded-xl flex items-center justify-center text-xs text-gray-500 font-medium overflow-hidden">
                <span v-if="user.voyageur.cni_verso" class="text-principal-dark truncate px-2 font-mono text-[11px]">{{ user.voyageur.cni_verso }}</span>
                <span v-else>Non disponible</span>
              </div>
            </div>
          </div>
        </div>

        <div v-else class="text-center py-8">
          <div class="w-16 h-16 bg-tertiaire/20 text-tertiaire-dark rounded-full flex items-center justify-center mx-auto mb-4">
            <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/></svg>
          </div>
          <h3 class="text-lg font-bold text-principal-dark font-serif mb-2">Vous n'avez pas encore de profil Voyageur</h3>
          <p class="text-xs sm:text-sm text-gray-500 max-w-md mx-auto mb-6">
            Devenez un voyageur vérifié pour rentabiliser vos trajets (Dakar ✈️ Paris, etc.) et transporter des colis en toute sécurité.
          </p>
          <button
            @click="showVoyageurModal = true"
            class="bg-secondaire hover:bg-secondaire-dark text-white font-bold px-6 py-3 rounded-2xl text-xs sm:text-sm shadow-md transition-all cursor-pointer"
          >
            Soumettre mes pièces d'identité
          </button>
        </div>
      </div>

      <!-- Tab: Mes Revenus GP -->
      <div v-else-if="activeTab === 'revenus'" class="space-y-6">
        <!-- Revenue Summary Grid -->
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
          <div class="bg-[#053754] text-white rounded-3xl p-4 sm:p-5 shadow-md space-y-1 relative overflow-hidden">
            <span class="text-[11px] sm:text-xs font-bold text-sky-200 uppercase tracking-wider block">Total Revenus Générés</span>
            <div class="text-xl sm:text-2xl font-black text-white">170 000 F CFA</div>
            <p class="text-[10px] sm:text-[11px] text-sky-300">Sur 3 réservations transportées</p>
          </div>

          <div class="bg-white rounded-3xl p-4 sm:p-5 border border-emerald-200 shadow-2xs space-y-1">
            <span class="text-[11px] sm:text-xs font-bold text-emerald-600 uppercase tracking-wider block">Revenus Disponibles</span>
            <div class="text-xl sm:text-2xl font-black text-emerald-800">136 000 F CFA</div>
            <p class="text-[10px] sm:text-[11px] text-emerald-600 font-semibold">Paiements validés & reçus</p>
          </div>

          <div class="bg-white rounded-3xl p-4 sm:p-5 border border-amber-200 shadow-2xs space-y-1">
            <span class="text-[11px] sm:text-xs font-bold text-amber-600 uppercase tracking-wider block">Revenus en Attente</span>
            <div class="text-xl sm:text-2xl font-black text-amber-800">34 000 F CFA</div>
            <p class="text-[10px] sm:text-[11px] text-amber-600 font-semibold">Colis en cours de livraison</p>
          </div>
        </div>

        <!-- Payout Method Configured Card -->
        <div class="bg-white p-5 rounded-3xl shadow-sm border border-gray-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-2xl bg-sky-50 text-principal flex items-center justify-center font-bold text-lg">
              💳
            </div>
            <div>
              <h4 class="text-xs sm:text-sm font-bold text-gray-900">Mode de versement principal</h4>
              <p class="text-[11px] sm:text-xs text-gray-500">Wave Mobile Money (+221 77 *** ** 10)</p>
            </div>
          </div>
          <span class="bg-green-100 text-green-800 text-[10px] sm:text-xs font-extrabold px-3 py-1 rounded-full uppercase">Actif</span>
        </div>

        <!-- Recent Transactions Preview -->
        <div class="bg-white p-5 sm:p-6 rounded-3xl shadow-sm border border-gray-100 space-y-4">
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 class="text-base font-extrabold text-[#053754]">Derniers revenus perçus</h3>
              <p class="text-xs text-gray-400 font-medium sm:hidden">Cliquez sur un reçu pour voir l'historique complet</p>
            </div>
            <button
              @click="router.push('/voyageur/revenus')"
              class="text-xs font-bold text-principal hover:text-principal-dark flex items-center gap-1 cursor-pointer self-start sm:self-auto"
            >
              <span>Voir tout l'historique</span>
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/></svg>
            </button>
          </div>

          <div class="divide-y divide-gray-100 text-xs">
            <div
              @click="router.push('/voyageur/revenus')"
              class="py-3 flex items-center justify-between gap-3 cursor-pointer hover:bg-slate-50 -mx-1 px-2 rounded-xl transition-all"
            >
              <div class="min-w-0 space-y-0.5">
                <div class="flex items-center gap-1.5 flex-wrap">
                  <span class="font-extrabold text-[#053754] text-xs">{{ '#RS-7729' }}</span>
                  <span class="text-xs text-gray-500 font-medium truncate">• Mariama Diallo</span>
                </div>
                <p class="text-[11px] text-gray-400 font-medium truncate">Dakar ➔ Paris</p>
              </div>
              <div class="text-right shrink-0">
                <div class="font-black text-xs sm:text-sm text-gray-900">51 000 F CFA</div>
                <span class="inline-block text-[9px] text-emerald-700 font-bold bg-emerald-100 px-2 py-0.5 rounded-full uppercase">✓ DISPONIBLE</span>
              </div>
            </div>

            <div
              @click="router.push('/voyageur/revenus')"
              class="py-3 flex items-center justify-between gap-3 cursor-pointer hover:bg-slate-50 -mx-1 px-2 rounded-xl transition-all"
            >
              <div class="min-w-0 space-y-0.5">
                <div class="flex items-center gap-1.5 flex-wrap">
                  <span class="font-extrabold text-[#053754] text-xs">{{ '#RS-6640' }}</span>
                  <span class="text-xs text-gray-500 font-medium truncate">• Abdoulaye Faye</span>
                </div>
                <p class="text-[11px] text-gray-400 font-medium truncate">Dakar ➔ Paris</p>
              </div>
              <div class="text-right shrink-0">
                <div class="font-black text-xs sm:text-sm text-gray-900">85 000 F CFA</div>
                <span class="inline-block text-[9px] text-emerald-700 font-bold bg-emerald-100 px-2 py-0.5 rounded-full uppercase">✓ DISPONIBLE</span>
              </div>
            </div>

            <div
              @click="router.push('/voyageur/revenus')"
              class="py-3 flex items-center justify-between gap-3 cursor-pointer hover:bg-slate-50 -mx-1 px-2 rounded-xl transition-all"
            >
              <div class="min-w-0 space-y-0.5">
                <div class="flex items-center gap-1.5 flex-wrap">
                  <span class="font-extrabold text-[#053754] text-xs">{{ '#RS-5510' }}</span>
                  <span class="text-xs text-gray-500 font-medium truncate">• Aïssatou Ba</span>
                </div>
                <p class="text-[11px] text-gray-400 font-medium truncate">Dakar ➔ Paris</p>
              </div>
              <div class="text-right shrink-0">
                <div class="font-black text-xs sm:text-sm text-gray-900">34 000 F CFA</div>
                <span class="inline-block text-[9px] text-amber-700 font-bold bg-amber-100 px-2 py-0.5 rounded-full uppercase">⏳ EN ATTENTE</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Tab 3: Edit Profile Form -->
      <div v-else-if="activeTab === 'edit'" class="bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-gray-100">
        <h3 class="text-lg font-bold text-principal-dark font-serif mb-4">Modifier mes informations personnelles</h3>
        <form @submit.prevent="handleUpdateProfile" class="space-y-4" novalidate>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label class="block text-xs font-semibold text-gray-700 mb-1">Prénom</label>
              <input v-model="editForm.prenom" type="text" class="w-full px-3.5 py-2.5 text-xs sm:text-sm border border-gray-300 rounded-xl focus:border-principal outline-none" />
              <p v-if="editErrors.prenom" class="text-[11px] text-red-600 mt-1 font-medium">{{ editErrors.prenom }}</p>
            </div>
            <div>
              <label class="block text-xs font-semibold text-gray-700 mb-1">Nom</label>
              <input v-model="editForm.nom" type="text" class="w-full px-3.5 py-2.5 text-xs sm:text-sm border border-gray-300 rounded-xl focus:border-principal outline-none" />
              <p v-if="editErrors.nom" class="text-[11px] text-red-600 mt-1 font-medium">{{ editErrors.nom }}</p>
            </div>
          </div>

          <div>
            <label class="block text-xs font-semibold text-gray-700 mb-1">
              Adresse email <span class="text-gray-400 font-normal">(non modifiable)</span>
            </label>
            <input
              v-model="editForm.email"
              type="email"
              disabled
              class="w-full px-3.5 py-2.5 text-xs sm:text-sm border border-gray-200 bg-gray-100 text-gray-500 rounded-xl outline-none cursor-not-allowed font-medium"
            />
          </div>

          <div>
            <label class="block text-xs font-semibold text-gray-700 mb-1">
              Téléphone <span class="text-gray-400 font-normal">(non modifiable)</span>
            </label>
            <input
              v-model="editForm.telephone"
              type="tel"
              disabled
              class="w-full px-3.5 py-2.5 text-xs sm:text-sm border border-gray-200 bg-gray-100 text-gray-500 rounded-xl outline-none cursor-not-allowed font-medium"
            />
          </div>

          <div>
            <label class="block text-xs font-semibold text-gray-700 mb-1">Adresse physique</label>
            <input v-model="editForm.adresse" type="text" class="w-full px-3.5 py-2.5 text-xs sm:text-sm border border-gray-300 rounded-xl focus:border-principal outline-none" />
          </div>

          <div class="pt-2 flex justify-end gap-3">
            <button type="button" @click="activeTab = 'info'" class="px-5 py-2.5 text-xs sm:text-sm font-semibold text-gray-600 hover:text-gray-800">
              Annuler
            </button>
            <button
              type="submit"
              :disabled="isLoading"
              class="bg-principal-dark hover:bg-principal text-white text-xs sm:text-sm font-bold px-6 py-2.5 rounded-xl shadow-md transition-all cursor-pointer"
            >
              Enregistrer les modifications
            </button>
          </div>
        </form>
      </div>

    </main>

    <!-- Modal Form: Création de Profil Voyageur -->
    <div v-if="showVoyageurModal" class="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div class="bg-white w-full max-w-lg rounded-3xl p-6 sm:p-8 shadow-2xl space-y-5 animate-in fade-in zoom-in duration-200">
        <div class="flex items-center justify-between border-b border-gray-100 pb-3">
          <h3 class="text-lg font-bold text-principal-dark font-serif">Devenir un Voyageur GP</h3>
          <button @click="showVoyageurModal = false" class="text-gray-400 hover:text-gray-600 p-1">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
          </button>
        </div>

        <form @submit.prevent="handleCreateVoyageur" class="space-y-4" novalidate>
          <div>
            <label class="block text-xs font-semibold text-gray-700 mb-1">Type de pièce d'identité</label>
            <select v-model="voyageurForm.type_piece" class="w-full px-3.5 py-2.5 text-xs sm:text-sm border border-gray-300 rounded-xl outline-none">
              <option value="cni">Carte Nationale d'Identité (CNI)</option>
              <option value="passeport">Passeport</option>
            </select>
          </div>

          <div>
            <label class="block text-xs font-semibold text-gray-700 mb-1">Numéro de la pièce</label>
            <input
              v-model="voyageurForm.numero_piece"
              type="text"
              placeholder="1342199800123"
              class="w-full px-3.5 py-2.5 text-xs sm:text-sm border border-gray-300 rounded-xl outline-none"
            />
            <p v-if="voyageurErrors.numero_piece" class="text-[11px] text-red-600 mt-1 font-medium">{{ voyageurErrors.numero_piece }}</p>
          </div>

          <!-- File upload CNI Recto -->
          <div>
            <label class="block text-xs font-semibold text-gray-700 mb-1">CNI Recto (Image)</label>
            <input
              type="file"
              accept="image/*"
              @change="(e) => handleFileChange(e, 'cni_recto')"
              class="w-full text-xs text-gray-500 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-principal/10 file:text-principal hover:file:bg-principal/20"
            />
            <p v-if="rectoFileName" class="text-[11px] text-gray-500 mt-1">Sélectionné: {{ rectoFileName }}</p>
            <p v-if="voyageurErrors.cni_recto" class="text-[11px] text-red-600 mt-1 font-medium">{{ voyageurErrors.cni_recto }}</p>
          </div>

          <!-- File upload CNI Verso -->
          <div>
            <label class="block text-xs font-semibold text-gray-700 mb-1">CNI Verso (Image)</label>
            <input
              type="file"
              accept="image/*"
              @change="(e) => handleFileChange(e, 'cni_verso')"
              class="w-full text-xs text-gray-500 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-principal/10 file:text-principal hover:file:bg-principal/20"
            />
            <p v-if="versoFileName" class="text-[11px] text-gray-500 mt-1">Sélectionné: {{ versoFileName }}</p>
            <p v-if="voyageurErrors.cni_verso" class="text-[11px] text-red-600 mt-1 font-medium">{{ voyageurErrors.cni_verso }}</p>
          </div>

          <div class="flex items-center gap-2 pt-2">
            <input id="mode_client" type="checkbox" v-model="voyageurForm.mode_client" class="rounded text-principal" />
            <label for="mode_client" class="text-xs text-gray-600 font-medium">Rester en mode client pour le moment</label>
          </div>

          <div class="pt-3 flex justify-end gap-3">
            <button type="button" @click="showVoyageurModal = false" class="px-4 py-2 text-xs font-semibold text-gray-600">
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
    <!-- Dynamic Bottom Navigation Bar based on current mode -->
    <VoyageurBottomNav v-if="modeActuel === 'voyageur'" />
    <ClientBottomNav v-else />
  </div>
</template>
