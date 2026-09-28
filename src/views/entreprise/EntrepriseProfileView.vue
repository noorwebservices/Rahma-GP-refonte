<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import Swal from 'sweetalert2'
import entrepriseService from '@/services/entrepriseService'
import { formatImageUrl } from '@/utils/imageUrl'
import { useAuth } from '@/composables/useAuth'

const router = useRouter()
const { user, fetchUser, updateProfile: updateAuthProfile } = useAuth()

const activeTab = ref('entreprise') // 'entreprise' | 'documents' | 'securite'
const isLoading = ref(true)
const saving = ref(false)
const resending = ref(false)
const isVerifie = ref(false)

// Toast Helper
const showToast = (icon, title) => {
  Swal.fire({
    toast: true,
    position: 'top-end',
    icon,
    title,
    showConfirmButton: false,
    timer: 3500
  })
}

// Enterprise & Manager Form State
const form = reactive({
  nom: '',
  email: '',
  ninea: '',
  registre_commerce: '',
  telephone: '',
  adresse: '',
  gerant_prenom: '',
  gerant_nom: '',
  type_piece: 'cni',
  numero_piece: '',
  document_legal: null,
  logo: null,
  cni_recto: null,
  cni_verso: null
})

// Current stored document URLs
const documentLegalUrl = ref(null)
const logoUrl = ref(null)
const cniRectoUrl = ref(null)
const cniVersoUrl = ref(null)

// Password Form State
const passwordForm = reactive({
  mot_de_passe_actuel: '',
  password: '',
  password_confirmation: ''
})

const showCurrentPassword = ref(false)
const showNewPassword = ref(false)
const showConfirmPassword = ref(false)

// Image Preview Modal
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

const userInitials = computed(() => {
  const name = form.nom || user.value?.prenom || 'GP'
  const parts = name.trim().split(' ')
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase()
  }
  return name.slice(0, 2).toUpperCase()
})

// File Inputs
const handleFileChange = (e, field) => {
  const file = e.target.files[0]
  if (file) {
    form[field] = file
  }
}

const loadProfile = async () => {
  isLoading.value = true
  try {
    const res = await entrepriseService.getProfile()
    const ent = res?.data ?? res ?? {}
    
    form.nom = ent.nom || ''
    form.email = ent.email || user.value?.email || ''
    form.ninea = ent.ninea || ''
    form.registre_commerce = ent.registre_commerce || ''
    form.telephone = ent.telephone || user.value?.telephone || ''
    form.adresse = ent.adresse || user.value?.adresse || ''
    form.gerant_prenom = ent.gerant_prenom || user.value?.prenom || ''
    form.gerant_nom = ent.gerant_nom || user.value?.nom || ''
    form.type_piece = ent.type_piece || 'cni'
    form.numero_piece = ent.numero_piece || ''

    documentLegalUrl.value = ent.document_legal || null
    logoUrl.value = ent.logo || null
    cniRectoUrl.value = ent.cni_recto || null
    cniVersoUrl.value = ent.cni_verso || null

    isVerifie.value = ent.statut_verification === 'verifiee' || (ent.statut_verification === 'verifie' && !!ent.email_verifie_at)
  } catch (e) {
    console.error('Erreur chargement profil entreprise:', e)
  } finally {
    isLoading.value = false
  }
}

const handleUpdateProfile = async () => {
  saving.value = true
  try {
    const formData = new FormData()
    formData.append('nom', form.nom)
    formData.append('ninea', form.ninea)
    formData.append('registre_commerce', form.registre_commerce || '')
    formData.append('telephone', form.telephone)
    formData.append('adresse', form.adresse || '')
    formData.append('gerant_prenom', form.gerant_prenom || '')
    formData.append('gerant_nom', form.gerant_nom || '')
    formData.append('type_piece', form.type_piece)
    formData.append('numero_piece', form.numero_piece || '')

    if (form.document_legal instanceof File) {
      formData.append('document_legal', form.document_legal)
    }
    if (form.logo instanceof File) {
      formData.append('logo', form.logo)
    }
    if (form.cni_recto instanceof File) {
      formData.append('cni_recto', form.cni_recto)
    }
    if (form.cni_verso instanceof File) {
      formData.append('cni_verso', form.cni_verso)
    }

    await entrepriseService.updateProfile(formData)
    showToast('success', 'Profil de l\'entreprise mis à jour avec succès !')
    await loadProfile()
    await fetchUser()
  } catch (e) {
    showToast('error', e.response?.data?.message || 'Erreur lors de la mise à jour du profil.')
  } finally {
    saving.value = false
  }
}

const handleUpdatePassword = async () => {
  if (!passwordForm.mot_de_passe_actuel) {
    showToast('warning', 'Veuillez saisir votre mot de passe actuel.')
    return
  }
  if (!passwordForm.password || passwordForm.password.length < 8) {
    showToast('warning', 'Le nouveau mot de passe doit comporter au moins 8 caractères.')
    return
  }
  if (passwordForm.password !== passwordForm.password_confirmation) {
    showToast('warning', 'La confirmation du mot de passe ne correspond pas.')
    return
  }

  saving.value = true
  try {
    await updateAuthProfile({
      mot_de_passe_actuel: passwordForm.mot_de_passe_actuel,
      password: passwordForm.password,
      password_confirmation: passwordForm.password_confirmation
    })
    showToast('success', 'Mot de passe modifié avec succès !')
    passwordForm.mot_de_passe_actuel = ''
    passwordForm.password = ''
    passwordForm.password_confirmation = ''
  } catch (e) {
    showToast('error', e.message || 'Erreur lors du changement de mot de passe.')
  } finally {
    saving.value = false
  }
}

const resendVerification = async () => {
  resending.value = true
  try {
    await entrepriseService.resendVerification()
    showToast('success', 'Un e-mail de confirmation a été envoyé à votre adresse.')
  } catch (e) {
    showToast('error', e.response?.data?.message || 'Erreur lors de l\'envoi de l\'email.')
  } finally {
    resending.value = false
  }
}

onMounted(() => {
  loadProfile()
})
</script>

<template>
  <div class="space-y-6 max-w-5xl mx-auto font-sans pb-16">
    <!-- Unverified Warning Banner -->
    <div v-if="!isVerifie" class="p-5 rounded-3xl bg-amber-50 dark:bg-amber-950/80 border border-amber-200 dark:border-amber-900 flex items-start gap-4 shadow-xs">
      <span class="text-2xl shrink-0">⚠️</span>
      <div class="space-y-1 text-xs text-amber-900 dark:text-amber-200">
        <h4 class="font-bold text-sm">Vérification de votre compte entreprise requise</h4>
        <p>
          Votre entreprise GP est enregistrée. Veuillez consulter votre boîte e-mail (<strong>{{ form.email }}</strong>) et cliquer sur le lien de confirmation de votre compte. 
          Tant que l'adresse n'est pas vérifiée, la création de voyages et l'affectation d'agents restent restreintes.
        </p>
        <button
          @click="resendVerification"
          :disabled="resending"
          class="mt-2 px-3.5 py-2 bg-[#053754] hover:bg-[#074C72] text-white font-extrabold text-xs rounded-xl shadow-xs transition cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
        >
          <span v-if="resending" class="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
          <span>✉️ Renvoyer l'e-mail de confirmation</span>
        </button>
      </div>
    </div>

    <!-- Top Profile Overview Card (Matching ProfileView.vue styling) -->
    <div class="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 shadow-md border border-gray-100 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-6">
      <div class="flex items-center gap-4 sm:gap-6">
        <!-- Logo or Avatar Circle -->
        <div 
          @click="logoUrl ? openImagePreview(logoUrl, 'Logo de l\'entreprise') : null"
          class="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-[#053754] dark:bg-sky-600 text-white font-serif font-bold text-xl sm:text-2xl flex items-center justify-center border-4 border-white dark:border-slate-800 shadow-md shrink-0 overflow-hidden relative group cursor-pointer"
        >
          <img v-if="logoUrl" :src="formatImageUrl(logoUrl)" alt="Logo Enterprise" class="w-full h-full object-cover" />
          <span v-else>{{ userInitials }}</span>
          <div v-if="logoUrl" class="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-xs">🔍</div>
        </div>

        <div class="space-y-1">
          <div class="flex items-center gap-2 flex-wrap">
            <h1 class="text-xl sm:text-2xl font-bold text-principal-dark dark:text-sky-300 font-serif">
              {{ form.nom || 'Entreprise GP' }}
            </h1>
            <span class="bg-[#053754] dark:bg-sky-900 text-white dark:text-sky-200 text-[10px] sm:text-xs px-2.5 py-0.5 rounded-full font-extrabold uppercase tracking-wide">
              Entreprise GP 🏢
            </span>
          </div>

          <p class="text-xs sm:text-sm text-gray-500 dark:text-slate-400 flex items-center gap-2">
            <span>👤 Gérant: <strong>{{ form.gerant_prenom }} {{ form.gerant_nom }}</strong></span>
            <span v-if="form.ninea">• NINEA: <strong>{{ form.ninea }}</strong></span>
          </p>
          <p class="text-xs sm:text-sm text-gray-500 dark:text-slate-400 flex items-center gap-2">
            <span>✉️ {{ form.email }}</span>
            <span v-if="form.telephone">• 📞 {{ form.telephone }}</span>
          </p>
        </div>
      </div>

      <!-- Verification Badge Pill -->
      <div
        class="px-4 py-2.5 rounded-2xl text-xs font-black flex items-center gap-2 shrink-0 border"
        :class="isVerifie ? 'bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800' : 'bg-amber-50 text-amber-900 border-amber-200 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-800'"
      >
        <span class="text-lg">{{ isVerifie ? '✓' : '⏳' }}</span>
        <div>
          <p class="leading-none text-sm">{{ isVerifie ? 'Entreprise Vérifiée' : 'Vérification en cours' }}</p>
          <p class="text-[10px] opacity-80 font-normal mt-0.5">{{ isVerifie ? 'Compte conforme & actif' : 'En cours de validation' }}</p>
        </div>
      </div>
    </div>

    <!-- Navigation Tabs Bar -->
    <div class="flex flex-wrap items-center gap-2 border-b border-gray-200 dark:border-slate-800 pb-3">
      <button
        @click="activeTab = 'entreprise'"
        :class="[
          'px-4 py-2.5 rounded-2xl text-xs font-extrabold transition-all cursor-pointer flex items-center gap-2',
          activeTab === 'entreprise'
            ? 'bg-[#053754] text-white shadow-md dark:bg-sky-600'
            : 'bg-white dark:bg-slate-900 text-gray-600 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-800 border border-gray-200 dark:border-slate-800'
        ]"
      >
        <span>🏢 Informations Générales</span>
      </button>

      <button
        @click="activeTab = 'documents'"
        :class="[
          'px-4 py-2.5 rounded-2xl text-xs font-extrabold transition-all cursor-pointer flex items-center gap-2',
          activeTab === 'documents'
            ? 'bg-[#053754] text-white shadow-md dark:bg-sky-600'
            : 'bg-white dark:bg-slate-900 text-gray-600 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-800 border border-gray-200 dark:border-slate-800'
        ]"
      >
        <span>📄 Documents Légaux & CNI</span>
      </button>

      <button
        @click="activeTab = 'securite'"
        :class="[
          'px-4 py-2.5 rounded-2xl text-xs font-extrabold transition-all cursor-pointer flex items-center gap-2',
          activeTab === 'securite'
            ? 'bg-[#053754] text-white shadow-md dark:bg-sky-600'
            : 'bg-white dark:bg-slate-900 text-gray-600 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-800 border border-gray-200 dark:border-slate-800'
        ]"
      >
        <span>🔐 Sécurité & Mot de Passe</span>
      </button>
    </div>

    <!-- TAB 1: INFORMATIONS GÉNÉRALES ET GÉRANT -->
    <div v-if="activeTab === 'entreprise'" class="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-gray-200 dark:border-slate-800 shadow-sm space-y-6">
      <form @submit.prevent="handleUpdateProfile" class="space-y-6">
        <h3 class="text-base font-extrabold text-[#053754] dark:text-sky-300 border-b border-gray-100 dark:border-slate-800 pb-2">
          🏢 Coordonnées Commerciales & Identité du Gérant
        </h3>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <!-- Nom commercial -->
          <div class="space-y-1.5">
            <label class="block text-xs font-bold text-gray-700 dark:text-slate-300">Nom commercial de l'entreprise *</label>
            <input
              v-model="form.nom"
              type="text"
              required
              class="w-full bg-[#F3F4F6] dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl px-4 py-3 text-xs sm:text-sm text-gray-800 dark:text-slate-100 outline-none focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-[#074C72]/20 font-bold"
            />
          </div>

          <!-- Email pro -->
          <div class="space-y-1.5">
            <label class="block text-xs font-bold text-gray-700 dark:text-slate-300">Adresse e-mail professionnelle *</label>
            <input
              v-model="form.email"
              type="email"
              disabled
              class="w-full bg-gray-100 dark:bg-slate-800/60 border border-gray-200 dark:border-slate-700 rounded-xl px-4 py-3 text-xs sm:text-sm text-gray-500 dark:text-slate-400 cursor-not-allowed font-medium"
            />
          </div>

          <!-- NINEA -->
          <div class="space-y-1.5">
            <label class="block text-xs font-bold text-gray-700 dark:text-slate-300">Numéro NINEA *</label>
            <input
              v-model="form.ninea"
              type="text"
              required
              class="w-full bg-[#F3F4F6] dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl px-4 py-3 text-xs sm:text-sm text-gray-800 dark:text-slate-100 outline-none focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-[#074C72]/20 font-mono font-bold"
            />
          </div>

          <!-- Registre du Commerce -->
          <div class="space-y-1.5">
            <label class="block text-xs font-bold text-gray-700 dark:text-slate-300">Registre du Commerce (RC)</label>
            <input
              v-model="form.registre_commerce"
              type="text"
              class="w-full bg-[#F3F4F6] dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl px-4 py-3 text-xs sm:text-sm text-gray-800 dark:text-slate-100 outline-none focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-[#074C72]/20 font-mono"
            />
          </div>

          <!-- Téléphone pro -->
          <div class="space-y-1.5">
            <label class="block text-xs font-bold text-gray-700 dark:text-slate-300">Téléphone de l'entreprise *</label>
            <input
              v-model="form.telephone"
              type="tel"
              required
              class="w-full bg-[#F3F4F6] dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl px-4 py-3 text-xs sm:text-sm text-gray-800 dark:text-slate-100 outline-none focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-[#074C72]/20 font-bold"
            />
          </div>

          <!-- Adresse Siège social -->
          <div class="space-y-1.5">
            <label class="block text-xs font-bold text-gray-700 dark:text-slate-300">Adresse du siège social</label>
            <input
              v-model="form.adresse"
              type="text"
              class="w-full bg-[#F3F4F6] dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl px-4 py-3 text-xs sm:text-sm text-gray-800 dark:text-slate-100 outline-none focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-[#074C72]/20"
            />
          </div>

          <!-- Prénom du Gérant -->
          <div class="space-y-1.5">
            <label class="block text-xs font-bold text-gray-700 dark:text-slate-300">Prénom du Gérant *</label>
            <input
              v-model="form.gerant_prenom"
              type="text"
              required
              class="w-full bg-[#F3F4F6] dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl px-4 py-3 text-xs sm:text-sm text-gray-800 dark:text-slate-100 outline-none focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-[#074C72]/20"
            />
          </div>

          <!-- Nom du Gérant -->
          <div class="space-y-1.5">
            <label class="block text-xs font-bold text-gray-700 dark:text-slate-300">Nom du Gérant *</label>
            <input
              v-model="form.gerant_nom"
              type="text"
              required
              class="w-full bg-[#F3F4F6] dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl px-4 py-3 text-xs sm:text-sm text-gray-800 dark:text-slate-100 outline-none focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-[#074C72]/20"
            />
          </div>
        </div>

        <div class="flex justify-end pt-2">
          <button
            type="submit"
            :disabled="saving"
            class="px-6 py-3.5 rounded-xl bg-[#053754] hover:bg-[#074C72] text-white text-xs font-extrabold shadow-md transition cursor-pointer disabled:opacity-50 uppercase tracking-wider"
          >
            {{ saving ? 'Enregistrement...' : 'Enregistrer les Modifications' }}
          </button>
        </div>
      </form>
    </div>

    <!-- TAB 2: DOCUMENTS LÉGAUX ET PIÈCES D'IDENTITÉ -->
    <div v-else-if="activeTab === 'documents'" class="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-gray-200 dark:border-slate-800 shadow-sm space-y-6">
      <form @submit.prevent="handleUpdateProfile" class="space-y-6">
        <h3 class="text-base font-extrabold text-[#053754] dark:text-sky-300 border-b border-gray-100 dark:border-slate-800 pb-2">
          📄 Documents d'Immatriculation & Pièce du Gérant
        </h3>

        <!-- Section 1: Documents Entreprise (Logo & NINEA/RC) -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div class="bg-slate-50 dark:bg-slate-800/70 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-3">
            <div class="flex items-center justify-between">
              <span class="text-xs font-extrabold text-[#053754] dark:text-sky-300 uppercase tracking-wider">Document d'immatriculation (NINEA / RC)</span>
              <span v-if="documentLegalUrl" class="text-[10px] bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 px-2 py-0.5 rounded-full font-bold">Fichier existant</span>
            </div>
            <p class="text-[11px] text-gray-500 dark:text-slate-400">Joindre le document légal au format PDF ou Image (Max 5 Mo).</p>
            <input
              type="file"
              @change="handleFileChange($event, 'document_legal')"
              accept=".pdf,.jpg,.jpeg,.png"
              class="w-full text-xs text-slate-600 file:mr-3 file:py-2 file:px-3.5 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-[#053754] file:text-white hover:file:bg-[#074C72] cursor-pointer"
            />
            <div v-if="documentLegalUrl" class="pt-1">
              <button
                @click="openImagePreview(documentLegalUrl, 'Document Légale NINEA / RC')"
                type="button"
                class="text-xs font-bold text-[#074C72] dark:text-sky-400 hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span>🔍 Aperçu du document enregistré</span>
              </button>
            </div>
          </div>

          <div class="bg-slate-50 dark:bg-slate-800/70 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-3">
            <div class="flex items-center justify-between">
              <span class="text-xs font-extrabold text-[#053754] dark:text-sky-300 uppercase tracking-wider">Logo Commercial de l'Entreprise</span>
              <span v-if="logoUrl" class="text-[10px] bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 px-2 py-0.5 rounded-full font-bold">Logo Téléchargé</span>
            </div>
            <p class="text-[11px] text-gray-500 dark:text-slate-400">Format PNG ou JPG recommandé (Max 2 Mo).</p>
            <input
              type="file"
              @change="handleFileChange($event, 'logo')"
              accept="image/*"
              class="w-full text-xs text-slate-600 file:mr-3 file:py-2 file:px-3.5 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-[#053754] file:text-white hover:file:bg-[#074C72] cursor-pointer"
            />
            <div v-if="logoUrl" class="pt-1 flex items-center gap-3">
              <img :src="formatImageUrl(logoUrl)" alt="Logo Preview" class="w-10 h-10 rounded-xl object-cover border border-gray-200" />
              <button
                @click="openImagePreview(logoUrl, 'Logo Entreprise GP')"
                type="button"
                class="text-xs font-bold text-[#074C72] dark:text-sky-400 hover:underline cursor-pointer"
              >
                🔍 Agrgrandir
              </button>
            </div>
          </div>
        </div>

        <!-- Section 2: Pièce d'identité Gérant (CNI / Passeport) -->
        <div class="p-5 rounded-2xl bg-sky-50/60 dark:bg-slate-800/60 border border-sky-100 dark:border-slate-700 space-y-4">
          <h4 class="text-xs font-extrabold text-[#053754] dark:text-sky-300 uppercase tracking-wider">
            🪪 Pièce d'Identité Officielle du Gérant
          </h4>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div class="space-y-1.5">
              <label class="block text-xs font-bold text-gray-700 dark:text-slate-300">Type de Pièce d'Identité *</label>
              <select
                v-model="form.type_piece"
                class="w-full bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl px-4 py-3 text-xs sm:text-sm text-gray-800 dark:text-slate-100 font-bold outline-none"
              >
                <option value="cni">Carte Nationale d'Identité (CNI)</option>
                <option value="passeport">Passeport International</option>
                <option value="permis">Permis de Conduire</option>
              </select>
            </div>

            <div class="space-y-1.5">
              <label class="block text-xs font-bold text-gray-700 dark:text-slate-300">Numéro de la Pièce *</label>
              <input
                v-model="form.numero_piece"
                type="text"
                placeholder="ex: 175919920084"
                class="w-full bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl px-4 py-3 text-xs sm:text-sm text-gray-800 dark:text-slate-100 font-mono font-bold outline-none"
              />
            </div>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div class="space-y-2">
              <label class="block text-xs font-bold text-gray-700 dark:text-slate-300">CNI / Passeport (Recto) *</label>
              <input
                type="file"
                @change="handleFileChange($event, 'cni_recto')"
                accept="image/*,.pdf"
                class="w-full text-xs text-slate-600 file:mr-3 file:py-2 file:px-3.5 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-[#053754] file:text-white hover:file:bg-[#074C72] cursor-pointer"
              />
              <div v-if="cniRectoUrl" class="pt-1">
                <button
                  @click="openImagePreview(cniRectoUrl, 'CNI Recto Gérant')"
                  type="button"
                  class="text-xs font-bold text-[#074C72] dark:text-sky-400 hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <span>🖼️ Voir CNI Recto enregistré</span>
                </button>
              </div>
            </div>

            <div class="space-y-2">
              <label class="block text-xs font-bold text-gray-700 dark:text-slate-300">CNI / Passeport (Verso)</label>
              <input
                type="file"
                @change="handleFileChange($event, 'cni_verso')"
                accept="image/*,.pdf"
                class="w-full text-xs text-slate-600 file:mr-3 file:py-2 file:px-3.5 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-[#053754] file:text-white hover:file:bg-[#074C72] cursor-pointer"
              />
              <div v-if="cniVersoUrl" class="pt-1">
                <button
                  @click="openImagePreview(cniVersoUrl, 'CNI Verso Gérant')"
                  type="button"
                  class="text-xs font-bold text-[#074C72] dark:text-sky-400 hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <span>🖼️ Voir CNI Verso enregistré</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        <div class="flex justify-end pt-2">
          <button
            type="submit"
            :disabled="saving"
            class="px-6 py-3.5 rounded-xl bg-[#053754] hover:bg-[#074C72] text-white text-xs font-extrabold shadow-md transition cursor-pointer disabled:opacity-50 uppercase tracking-wider"
          >
            {{ saving ? 'Mise à jour...' : 'Enregistrer les Documents' }}
          </button>
        </div>
      </form>
    </div>

    <!-- TAB 3: SÉCURITÉ ET MOT DE PASSE -->
    <div v-else-if="activeTab === 'securite'" class="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-gray-200 dark:border-slate-800 shadow-sm space-y-6">
      <form @submit.prevent="handleUpdatePassword" class="space-y-6">
        <h3 class="text-base font-extrabold text-[#053754] dark:text-sky-300 border-b border-gray-100 dark:border-slate-800 pb-2">
          🔐 Modification du Mot de Passe du Gérant
        </h3>

        <div class="space-y-4 max-w-lg">
          <!-- Mot de passe actuel -->
          <div class="space-y-1.5">
            <label class="block text-xs font-bold text-gray-700 dark:text-slate-300">Mot de passe actuel *</label>
            <div class="relative">
              <input
                v-model="passwordForm.mot_de_passe_actuel"
                :type="showCurrentPassword ? 'text' : 'password'"
                required
                placeholder="••••••••"
                class="w-full bg-[#F3F4F6] dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl px-4 py-3 pr-10 text-xs sm:text-sm text-gray-800 dark:text-slate-100 outline-none focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-[#074C72]/20"
              />
              <button
                type="button"
                @click="showCurrentPassword = !showCurrentPassword"
                class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-sm cursor-pointer"
              >
                {{ showCurrentPassword ? '👁️' : '🙈' }}
              </button>
            </div>
          </div>

          <!-- Nouveau mot de passe -->
          <div class="space-y-1.5">
            <label class="block text-xs font-bold text-gray-700 dark:text-slate-300">Nouveau mot de passe *</label>
            <div class="relative">
              <input
                v-model="passwordForm.password"
                :type="showNewPassword ? 'text' : 'password'"
                required
                placeholder="Au moins 8 caractères"
                class="w-full bg-[#F3F4F6] dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl px-4 py-3 pr-10 text-xs sm:text-sm text-gray-800 dark:text-slate-100 outline-none focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-[#074C72]/20"
              />
              <button
                type="button"
                @click="showNewPassword = !showNewPassword"
                class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-sm cursor-pointer"
              >
                {{ showNewPassword ? '👁️' : '🙈' }}
              </button>
            </div>
          </div>

          <!-- Confirmation mot de passe -->
          <div class="space-y-1.5">
            <label class="block text-xs font-bold text-gray-700 dark:text-slate-300">Confirmation du nouveau mot de passe *</label>
            <div class="relative">
              <input
                v-model="passwordForm.password_confirmation"
                :type="showConfirmPassword ? 'text' : 'password'"
                required
                placeholder="Répétez le mot de passe"
                class="w-full bg-[#F3F4F6] dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl px-4 py-3 pr-10 text-xs sm:text-sm text-gray-800 dark:text-slate-100 outline-none focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-[#074C72]/20"
              />
              <button
                type="button"
                @click="showConfirmPassword = !showConfirmPassword"
                class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-sm cursor-pointer"
              >
                {{ showConfirmPassword ? '👁️' : '🙈' }}
              </button>
            </div>
          </div>
        </div>

        <div class="flex justify-end pt-2">
          <button
            type="submit"
            :disabled="saving"
            class="px-6 py-3.5 rounded-xl bg-[#053754] hover:bg-[#074C72] text-white text-xs font-extrabold shadow-md transition cursor-pointer disabled:opacity-50 uppercase tracking-wider"
          >
            {{ saving ? 'Changement...' : 'Mettre à jour le mot de passe' }}
          </button>
        </div>
      </form>
    </div>

    <!-- Document Image Preview Modal -->
    <div v-if="imagePreviewModal.isOpen" class="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div class="bg-white dark:bg-slate-900 rounded-3xl p-6 max-w-2xl w-full space-y-4 border border-gray-200 dark:border-slate-800 shadow-2xl relative">
        <div class="flex items-center justify-between border-b border-gray-100 dark:border-slate-800 pb-3">
          <h3 class="text-sm font-extrabold text-[#053754] dark:text-sky-300">{{ imagePreviewModal.title }}</h3>
          <button @click="closeImagePreview" class="text-gray-400 hover:text-gray-600 dark:hover:text-slate-200 font-bold cursor-pointer">✕</button>
        </div>

        <div class="max-h-[70vh] overflow-auto rounded-2xl flex items-center justify-center bg-gray-50 dark:bg-slate-800 p-2">
          <iframe v-if="imagePreviewModal.url.endsWith('.pdf')" :src="imagePreviewModal.url" class="w-full h-96 rounded-xl border-0"></iframe>
          <img v-else :src="imagePreviewModal.url" :alt="imagePreviewModal.title" class="max-w-full max-h-[65vh] object-contain rounded-xl" />
        </div>

        <div class="flex justify-end pt-2">
          <button @click="closeImagePreview" class="px-5 py-2.5 rounded-xl bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-slate-300 font-bold text-xs cursor-pointer">Fermer</button>
        </div>
      </div>
    </div>
  </div>
</template>
