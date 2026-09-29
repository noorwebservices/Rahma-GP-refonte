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
const totalAgentsCount = ref(0)

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

// Stored URLs
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
    const ent = res?.entreprise || res?.data?.entreprise || res?.data || res || {}
    const grantUser = ent.gerant || user.value || {}

    form.nom = ent.nom || ''
    form.email = ent.email || grantUser.email || ''
    form.ninea = ent.ninea || ''
    form.registre_commerce = ent.registre_commerce || ''
    form.telephone = ent.telephone || grantUser.telephone || ''
    form.adresse = ent.adresse || grantUser.adresse || ''
    form.gerant_prenom = ent.gerant_prenom || grantUser.prenom || ''
    form.gerant_nom = ent.gerant_nom || grantUser.nom || ''
    form.type_piece = ent.type_piece || 'cni'
    form.numero_piece = ent.numero_piece || ''

    documentLegalUrl.value = ent.document_legal || ent.ninea_doc || null
    logoUrl.value = ent.logo || null
    cniRectoUrl.value = ent.cni_recto || null
    cniVersoUrl.value = ent.cni_verso || null

    isVerifie.value = ent.statut_verification === 'verifiee' || (ent.statut_verification === 'verifie' && !!ent.email_verifie_at)
    
    // Agent count calculation
    totalAgentsCount.value = ent.agents_count ?? ent.agents_g_p_count ?? (Array.isArray(ent.agents) ? ent.agents.length : 0)

    try {
      const agRes = await entrepriseService.getAgents()
      const raw = agRes?.data ?? agRes
      const list = Array.isArray(raw) ? raw : (Array.isArray(raw?.data) ? raw.data : (Array.isArray(raw?.agents) ? raw.agents : []))
      const total = raw?.total ?? list.length
      if (total > 0 || totalAgentsCount.value === 0) {
        totalAgentsCount.value = total
      }
    } catch(e) {}
  } catch (e) {
    console.error('Erreur chargement profil entreprise:', e)
  } finally {
    isLoading.value = false
  }
}

const handleUpdateProfile = async () => {
  // Read-only mode
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
  <div class="space-y-6 font-sans pb-16">
    <!-- Unverified Warning Banner -->
    <div v-if="!isVerifie" class="p-5 rounded-3xl bg-linear-to-r from-amber-500/10 via-amber-500/5 to-transparent dark:from-amber-950/80 dark:to-slate-900 border border-amber-300/70 dark:border-amber-900/60 flex items-start gap-4 shadow-sm relative overflow-hidden backdrop-blur-md">
      <div class="p-2.5 bg-amber-500 text-white rounded-2xl text-xl shrink-0 shadow-sm">
        ⚠️
      </div>
      <div class="space-y-1.5 text-xs text-amber-900 dark:text-amber-200 flex-1">
        <h4 class="font-extrabold text-sm tracking-tight">Vérification du Compte Entreprise Requise</h4>
        <p class="leading-relaxed">
          Votre entreprise GP est enregistrée. Un lien de confirmation a été transmis à l'adresse <strong>{{ form.email }}</strong>. 
          Tant que l'adresse e-mail et vos documents légaux ne sont pas validés, la publication de nouveaux trajets d'entreprise reste temporairement restreinte.
        </p>
        <div class="pt-1">
          <button
            @click="resendVerification"
            :disabled="resending"
            class="px-4 py-2 bg-[#053754] hover:bg-[#074C72] dark:bg-amber-600 dark:hover:bg-amber-500 text-white font-extrabold text-xs rounded-xl shadow-xs transition cursor-pointer flex items-center gap-2 disabled:opacity-50"
          >
            <span v-if="resending" class="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
            <span>✉️ Renvoyer l'e-mail de confirmation</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Main Hero Profile Header Card -->
    <div class="bg-linear-to-r from-[#053754] via-[#074C72] to-[#085a87] text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden border border-sky-900/50">
      <!-- Background Ambient Glow Shapes -->
      <div class="absolute -right-16 -top-16 w-64 h-64 bg-sky-400/10 rounded-full blur-3xl pointer-events-none"></div>
      <div class="absolute -left-16 -bottom-16 w-64 h-64 bg-emerald-400/10 rounded-full blur-3xl pointer-events-none"></div>

      <div class="relative z-10 flex flex-col md:flex-row items-center md:items-start justify-between gap-6">
        
        <!-- Left Avatar & Enterprise Info -->
        <div class="flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-5">
          <!-- Logo Circle with Lightbox Trigger -->
          <div 
            @click="logoUrl ? openImagePreview(logoUrl, 'Logo de l\'entreprise') : null"
            class="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl bg-white/10 backdrop-blur-md text-white font-serif font-black text-3xl flex items-center justify-center border-2 border-white/20 shadow-2xl shrink-0 overflow-hidden relative group cursor-pointer"
          >
            <img v-if="logoUrl" :src="formatImageUrl(logoUrl)" alt="Logo Enterprise" class="w-full h-full object-cover" />
            <span v-else class="text-white drop-shadow-md">{{ userInitials }}</span>
            <div v-if="logoUrl" class="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-xs font-bold gap-1 text-white backdrop-blur-[2px]">
              <span>🔍 Agrandir</span>
            </div>
          </div>

          <!-- Enterprise Details -->
          <div class="space-y-2">
            <div class="flex items-center gap-2 flex-wrap justify-center sm:justify-start">
              <h1 class="text-2xl sm:text-3xl font-serif font-extrabold tracking-tight">
                {{ form.nom || 'Entreprise GP' }}
              </h1>
              <span class="bg-white/20 backdrop-blur-xs text-sky-100 text-[10px] sm:text-xs px-3 py-1 rounded-full font-black uppercase tracking-wider border border-white/20">
                🏢 Compte Entreprise GP
              </span>
            </div>

            <p class="text-xs sm:text-sm text-sky-100 font-medium flex items-center gap-2 flex-wrap justify-center sm:justify-start">
              <span>👤 Gérant: <strong class="text-white font-bold">{{ form.gerant_prenom }} {{ form.gerant_nom }}</strong></span>
              <span v-if="form.ninea" class="opacity-70">•</span>
              <span v-if="form.ninea">NINEA: <strong class="font-mono text-white">{{ form.ninea }}</strong></span>
            </p>

            <div class="flex items-center gap-4 text-xs text-sky-200 pt-1 flex-wrap justify-center sm:justify-start">
              <span class="flex items-center gap-1.5 bg-black/20 px-3 py-1 rounded-xl border border-white/10 font-mono">
                ✉️ {{ form.email }}
              </span>
              <span v-if="form.telephone" class="flex items-center gap-1.5 bg-black/20 px-3 py-1 rounded-xl border border-white/10 font-bold">
                📞 {{ form.telephone }}
              </span>
            </div>
          </div>
        </div>

        <!-- Right Side Verification Status Pill & Navigation -->
        <div class="shrink-0 flex flex-col items-center md:items-end space-y-2">
          <router-link
            to="/entreprise"
            class="px-4 py-2.5 rounded-2xl bg-white text-[#053754] hover:bg-sky-50 font-black text-xs shadow-lg transition-all flex items-center gap-2 cursor-pointer active:scale-95 border border-white/40"
          >
            <span>📊 Dashboard Entreprise</span>
            <span>➔</span>
          </router-link>

          <div
            class="px-5 py-3 rounded-2xl text-xs font-black flex items-center gap-3 backdrop-blur-md border shadow-lg"
            :class="isVerifie 
              ? 'bg-emerald-500/20 text-emerald-100 border-emerald-400/30' 
              : 'bg-amber-500/20 text-amber-100 border-amber-400/30'"
          >
            <span class="text-xl">{{ isVerifie ? '✓' : '⏳' }}</span>
            <div>
              <p class="leading-tight text-sm uppercase tracking-wide">{{ isVerifie ? 'Entreprise Certifiée' : 'Vérification en cours' }}</p>
              <p class="text-[10px] text-sky-200 font-normal mt-0.5">{{ isVerifie ? 'Compte conforme et activé' : 'Documents en cours d\'examen' }}</p>
            </div>
          </div>
        </div>

      </div>
    </div>

    <!-- Quick Enterprise Metrics Bar -->
    <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <div class="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-4.5 rounded-2xl shadow-2xs flex items-center gap-3">
        <div class="p-3 bg-sky-50 dark:bg-sky-950 text-[#053754] dark:text-sky-300 rounded-xl text-lg font-bold">🏢</div>
        <div>
          <span class="text-[11px] text-slate-400 dark:text-slate-400 font-extrabold uppercase tracking-wider block">Forme Juridique</span>
          <span class="text-xs font-black text-slate-900 dark:text-slate-100">Société GP Enregistrée</span>
        </div>
      </div>

      <div class="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-4.5 rounded-2xl shadow-2xs flex items-center gap-3">
        <div class="p-3 bg-emerald-50 dark:bg-emerald-950 text-emerald-600 rounded-xl text-lg font-bold">👥</div>
        <div>
          <span class="text-[11px] text-slate-400 dark:text-slate-400 font-extrabold uppercase tracking-wider block">Effectif Agents GP</span>
          <span class="text-xs font-black text-slate-900 dark:text-slate-100">{{ totalAgentsCount }} Agent(s) affilié(s)</span>
        </div>
      </div>

      <div class="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-4.5 rounded-2xl shadow-2xs flex items-center gap-3">
        <div class="p-3 bg-indigo-50 dark:bg-indigo-950 text-indigo-600 rounded-xl text-lg font-bold">📑</div>
        <div>
          <span class="text-[11px] text-slate-400 dark:text-slate-400 font-extrabold uppercase tracking-wider block">Immatriculation NINEA</span>
          <span class="text-xs font-mono font-black text-slate-900 dark:text-slate-100">{{ form.ninea || 'En cours' }}</span>
        </div>
      </div>
    </div>

    <!-- Navigation Tabs Bar -->
    <div class="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3 overflow-x-auto no-scrollbar">
      <button
        @click="activeTab = 'entreprise'"
        :class="[
          'px-5 py-3 rounded-2xl text-xs font-extrabold transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap',
          activeTab === 'entreprise'
            ? 'bg-[#053754] text-white shadow-md dark:bg-sky-600'
            : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800'
        ]"
      >
        <span>🏢 Informations Générales</span>
      </button>

      <button
        @click="activeTab = 'documents'"
        :class="[
          'px-5 py-3 rounded-2xl text-xs font-extrabold transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap',
          activeTab === 'documents'
            ? 'bg-[#053754] text-white shadow-md dark:bg-sky-600'
            : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800'
        ]"
      >
        <span>📄 Documents Légaux & CNI</span>
      </button>

      <button
        @click="activeTab = 'securite'"
        :class="[
          'px-5 py-3 rounded-2xl text-xs font-extrabold transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap',
          activeTab === 'securite'
            ? 'bg-[#053754] text-white shadow-md dark:bg-sky-600'
            : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800'
        ]"
      >
        <span>🔐 Sécurité & Mot de Passe</span>
      </button>
    </div>

    <!-- TAB 1: INFORMATIONS GÉNÉRALES ET GÉRANT (READ ONLY) -->
    <div v-if="activeTab === 'entreprise'" class="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-6">
      <div class="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
        <h3 class="text-sm font-extrabold text-[#053754] dark:text-sky-300 flex items-center gap-2">
          <span>🏢</span>
          <span>Coordonnées Commerciales & Identité du Gérant</span>
        </h3>
        <span class="text-xs text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-50 dark:bg-emerald-950/60 px-3 py-1 rounded-full border border-emerald-200/60 dark:border-emerald-800/60">🔒 Informations enregistrées</span>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <!-- Nom commercial -->
        <div class="space-y-1.5">
          <label class="block text-xs font-bold text-slate-700 dark:text-slate-300">Nom commercial de l'entreprise</label>
          <input
            v-model="form.nom"
            type="text"
            disabled
            class="w-full bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-xs sm:text-sm text-slate-700 dark:text-slate-300 cursor-not-allowed font-bold"
          />
        </div>

        <!-- Email pro -->
        <div class="space-y-1.5">
          <label class="block text-xs font-bold text-slate-700 dark:text-slate-300">Adresse e-mail professionnelle</label>
          <input
            v-model="form.email"
            type="email"
            disabled
            class="w-full bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-xs sm:text-sm text-slate-700 dark:text-slate-300 cursor-not-allowed font-medium"
          />
        </div>

        <!-- NINEA -->
        <div class="space-y-1.5">
          <label class="block text-xs font-bold text-slate-700 dark:text-slate-300">Numéro NINEA</label>
          <input
            v-model="form.ninea"
            type="text"
            disabled
            class="w-full bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-xs sm:text-sm text-slate-700 dark:text-slate-300 cursor-not-allowed font-mono font-bold"
          />
        </div>

        <!-- Registre du Commerce -->
        <div class="space-y-1.5">
          <label class="block text-xs font-bold text-slate-700 dark:text-slate-300">Registre du Commerce (RC)</label>
          <input
            v-model="form.registre_commerce"
            type="text"
            disabled
            class="w-full bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-xs sm:text-sm text-slate-700 dark:text-slate-300 cursor-not-allowed font-mono"
          />
        </div>

        <!-- Téléphone pro -->
        <div class="space-y-1.5">
          <label class="block text-xs font-bold text-slate-700 dark:text-slate-300">Téléphone de l'entreprise</label>
          <input
            v-model="form.telephone"
            type="tel"
            disabled
            class="w-full bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-xs sm:text-sm text-slate-700 dark:text-slate-300 cursor-not-allowed font-bold"
          />
        </div>

        <!-- Adresse Siège social -->
        <div class="space-y-1.5">
          <label class="block text-xs font-bold text-slate-700 dark:text-slate-300">Adresse du siège social</label>
          <input
            v-model="form.adresse"
            type="text"
            disabled
            class="w-full bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-xs sm:text-sm text-slate-700 dark:text-slate-300 cursor-not-allowed font-medium"
          />
        </div>

        <!-- Prénom du Gérant -->
        <div class="space-y-1.5">
          <label class="block text-xs font-bold text-slate-700 dark:text-slate-300">Prénom du Gérant</label>
          <input
            v-model="form.gerant_prenom"
            type="text"
            disabled
            class="w-full bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-xs sm:text-sm text-slate-700 dark:text-slate-300 cursor-not-allowed font-medium"
          />
        </div>

        <!-- Nom du Gérant -->
        <div class="space-y-1.5">
          <label class="block text-xs font-bold text-slate-700 dark:text-slate-300">Nom du Gérant</label>
          <input
            v-model="form.gerant_nom"
            type="text"
            disabled
            class="w-full bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-xs sm:text-sm text-slate-700 dark:text-slate-300 cursor-not-allowed font-medium"
          />
        </div>
      </div>
    </div>

    <!-- TAB 2: DOCUMENTS LÉGAUX ET PIÈCES D'IDENTITÉ (PREVIEWS ONLY) -->
    <div v-else-if="activeTab === 'documents'" class="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-6">
      <div class="border-b border-slate-100 dark:border-slate-800 pb-3 flex items-center justify-between">
        <div>
          <h3 class="text-sm font-extrabold text-[#053754] dark:text-sky-300 flex items-center gap-2">
            <span>📄</span>
            <span>Aperçu des Documents Légaux & Pièces Justificatives</span>
          </h3>
          <p class="text-xs text-slate-400 mt-1">Consultez les aperçus des pièces administratives et d'identité enregistrées.</p>
        </div>
        <span class="text-xs text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-50 dark:bg-emerald-950/60 px-3 py-1 rounded-full border border-emerald-200/60 dark:border-emerald-800/60">🔒 Documents enregistrés</span>
      </div>

      <!-- Identity Details Header -->
      <div class="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200/60 dark:border-slate-700 grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <span class="text-[11px] text-slate-400 dark:text-slate-400 font-bold uppercase tracking-wider block">Type de Pièce d'Identité</span>
          <span class="text-xs font-black text-slate-800 dark:text-slate-200 uppercase">
            {{ form.type_piece === 'cni' ? 'Carte Nationale d\'Identité (CNI)' : (form.type_piece === 'passeport' ? 'Passeport International' : 'Permis de Conduire') }}
          </span>
        </div>
        <div>
          <span class="text-[11px] text-slate-400 dark:text-slate-400 font-bold uppercase tracking-wider block">Numéro de la Pièce</span>
          <span class="text-xs font-mono font-black text-slate-800 dark:text-slate-200">
            {{ form.numero_piece || 'Non renseigné' }}
          </span>
        </div>
      </div>

      <!-- Grid of Document Previews -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <!-- Document Légal (NINEA / RC) -->
        <div class="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700 flex flex-col justify-between space-y-3">
          <div class="space-y-1">
            <span class="text-[11px] font-extrabold text-[#053754] dark:text-sky-300 uppercase tracking-wider block">NINEA / Registre</span>
            <p class="text-[10px] text-slate-400">Document Légulation</p>
          </div>

          <div class="h-36 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 overflow-hidden flex items-center justify-center p-2">
            <iframe v-if="documentLegalUrl && documentLegalUrl.endsWith('.pdf')" :src="formatImageUrl(documentLegalUrl)" class="w-full h-full pointer-events-none rounded-lg"></iframe>
            <img v-else-if="documentLegalUrl" :src="formatImageUrl(documentLegalUrl)" alt="Document Légal" class="w-full h-full object-cover rounded-lg" />
            <div v-else class="text-center p-3 text-slate-400">
              <span class="text-2xl block mb-1">📑</span>
              <span class="text-[10px] font-bold">Aucun document</span>
            </div>
          </div>

          <button
            v-if="documentLegalUrl"
            @click="openImagePreview(documentLegalUrl, 'Document Légal NINEA / RC')"
            type="button"
            class="w-full py-2 bg-[#053754] hover:bg-[#074C72] text-white rounded-xl text-xs font-extrabold transition cursor-pointer flex items-center justify-center gap-1.5"
          >
            <span>🔍 Agrandir</span>
          </button>
        </div>

        <!-- Logo Commercial -->
        <div class="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700 flex flex-col justify-between space-y-3">
          <div class="space-y-1">
            <span class="text-[11px] font-extrabold text-[#053754] dark:text-sky-300 uppercase tracking-wider block">Logo Entreprise</span>
            <p class="text-[10px] text-slate-400">Identité Visuelle</p>
          </div>

          <div class="h-36 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 overflow-hidden flex items-center justify-center p-2">
            <img v-if="logoUrl" :src="formatImageUrl(logoUrl)" alt="Logo" class="w-full h-full object-contain rounded-lg" />
            <div v-else class="text-center p-3 text-slate-400">
              <span class="text-2xl block mb-1">🖼️</span>
              <span class="text-[10px] font-bold">Aucun logo</span>
            </div>
          </div>

          <button
            v-if="logoUrl"
            @click="openImagePreview(logoUrl, 'Logo Entreprise')"
            type="button"
            class="w-full py-2 bg-[#053754] hover:bg-[#074C72] text-white rounded-xl text-xs font-extrabold transition cursor-pointer flex items-center justify-center gap-1.5"
          >
            <span>🔍 Agrandir</span>
          </button>
        </div>

        <!-- CNI Recto -->
        <div class="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700 flex flex-col justify-between space-y-3">
          <div class="space-y-1">
            <span class="text-[11px] font-extrabold text-[#053754] dark:text-sky-300 uppercase tracking-wider block">CNI / Pièce (Recto)</span>
            <p class="text-[10px] text-slate-400">Face Avant</p>
          </div>

          <div class="h-36 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 overflow-hidden flex items-center justify-center p-2">
            <img v-if="cniRectoUrl" :src="formatImageUrl(cniRectoUrl)" alt="CNI Recto" class="w-full h-full object-cover rounded-lg" />
            <div v-else class="text-center p-3 text-slate-400">
              <span class="text-2xl block mb-1">🪪</span>
              <span class="text-[10px] font-bold">Non fourni</span>
            </div>
          </div>

          <button
            v-if="cniRectoUrl"
            @click="openImagePreview(cniRectoUrl, 'CNI / Pièce Recto')"
            type="button"
            class="w-full py-2 bg-[#053754] hover:bg-[#074C72] text-white rounded-xl text-xs font-extrabold transition cursor-pointer flex items-center justify-center gap-1.5"
          >
            <span>🔍 Agrandir</span>
          </button>
        </div>

        <!-- CNI Verso -->
        <div class="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700 flex flex-col justify-between space-y-3">
          <div class="space-y-1">
            <span class="text-[11px] font-extrabold text-[#053754] dark:text-sky-300 uppercase tracking-wider block">CNI / Pièce (Verso)</span>
            <p class="text-[10px] text-slate-400">Face Arrière</p>
          </div>

          <div class="h-36 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 overflow-hidden flex items-center justify-center p-2">
            <img v-if="cniVersoUrl" :src="formatImageUrl(cniVersoUrl)" alt="CNI Verso" class="w-full h-full object-cover rounded-lg" />
            <div v-else class="text-center p-3 text-slate-400">
              <span class="text-2xl block mb-1">🪪</span>
              <span class="text-[10px] font-bold">Non fourni</span>
            </div>
          </div>

          <button
            v-if="cniVersoUrl"
            @click="openImagePreview(cniVersoUrl, 'CNI / Pièce Verso')"
            type="button"
            class="w-full py-2 bg-[#053754] hover:bg-[#074C72] text-white rounded-xl text-xs font-extrabold transition cursor-pointer flex items-center justify-center gap-1.5"
          >
            <span>🔍 Agrandir</span>
          </button>
        </div>

      </div>
    </div>

    <!-- TAB 3: SÉCURITÉ ET MOT DE PASSE -->
    <div v-else-if="activeTab === 'securite'" class="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-6">
      <form @submit.prevent="handleUpdatePassword" class="space-y-6">
        <div class="border-b border-slate-100 dark:border-slate-800 pb-3">
          <h3 class="text-sm font-extrabold text-[#053754] dark:text-sky-300 flex items-center gap-2">
            <span>🔐</span>
            <span>Modification du Mot de Passe du Gérant</span>
          </h3>
          <p class="text-xs text-slate-400 mt-1">Sécurisez l'accès à votre compte d'administration entreprise GP.</p>
        </div>

        <div class="space-y-4 max-w-lg">
          <!-- Mot de passe actuel -->
          <div class="space-y-1.5">
            <label class="block text-xs font-bold text-slate-700 dark:text-slate-300">Mot de passe actuel *</label>
            <div class="relative">
              <input
                v-model="passwordForm.mot_de_passe_actuel"
                :type="showCurrentPassword ? 'text' : 'password'"
                required
                placeholder="••••••••"
                class="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 pr-10 text-xs sm:text-sm text-slate-800 dark:text-slate-100 outline-none focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-[#074C72]/20 font-bold"
              />
              <button
                type="button"
                @click="showCurrentPassword = !showCurrentPassword"
                class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-sm cursor-pointer"
              >
                {{ showCurrentPassword ? '👁️' : '🙈' }}
              </button>
            </div>
          </div>

          <!-- Nouveau mot de passe -->
          <div class="space-y-1.5">
            <label class="block text-xs font-bold text-slate-700 dark:text-slate-300">Nouveau mot de passe *</label>
            <div class="relative">
              <input
                v-model="passwordForm.password"
                :type="showNewPassword ? 'text' : 'password'"
                required
                placeholder="Au moins 8 caractères"
                class="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 pr-10 text-xs sm:text-sm text-slate-800 dark:text-slate-100 outline-none focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-[#074C72]/20 font-bold"
              />
              <button
                type="button"
                @click="showNewPassword = !showNewPassword"
                class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-sm cursor-pointer"
              >
                {{ showNewPassword ? '👁️' : '🙈' }}
              </button>
            </div>
          </div>

          <!-- Confirmation mot de passe -->
          <div class="space-y-1.5">
            <label class="block text-xs font-bold text-slate-700 dark:text-slate-300">Confirmation du nouveau mot de passe *</label>
            <div class="relative">
              <input
                v-model="passwordForm.password_confirmation"
                :type="showConfirmPassword ? 'text' : 'password'"
                required
                placeholder="Répétez le mot de passe"
                class="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 pr-10 text-xs sm:text-sm text-slate-800 dark:text-slate-100 outline-none focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-[#074C72]/20 font-bold"
              />
              <button
                type="button"
                @click="showConfirmPassword = !showConfirmPassword"
                class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-sm cursor-pointer"
              >
                {{ showConfirmPassword ? '👁️' : '🙈' }}
              </button>
            </div>
          </div>
        </div>

        <div class="flex justify-end pt-3">
          <button
            type="submit"
            :disabled="saving"
            class="px-6 py-3.5 rounded-xl bg-[#053754] hover:bg-[#074C72] text-white text-xs font-extrabold shadow-md transition cursor-pointer disabled:opacity-50 uppercase tracking-wider flex items-center gap-2"
          >
            <span v-if="saving" class="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
            <span>{{ saving ? 'Changement...' : 'Mettre à jour le mot de passe' }}</span>
          </button>
        </div>
      </form>
    </div>

    <!-- Document Image Preview Modal -->
    <div v-if="imagePreviewModal.isOpen" class="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4">
      <div class="bg-white dark:bg-slate-900 rounded-3xl p-6 max-w-2xl w-full space-y-4 border border-slate-200 dark:border-slate-800 shadow-2xl relative">
        <div class="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <h3 class="text-sm font-extrabold text-[#053754] dark:text-sky-300">{{ imagePreviewModal.title }}</h3>
          <button @click="closeImagePreview" class="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 font-bold cursor-pointer text-lg">✕</button>
        </div>

        <div class="max-h-[70vh] overflow-auto rounded-2xl flex items-center justify-center bg-slate-50 dark:bg-slate-800 p-2 border border-slate-100 dark:border-slate-700">
          <iframe v-if="imagePreviewModal.url.endsWith('.pdf')" :src="imagePreviewModal.url" class="w-full h-96 rounded-xl border-0"></iframe>
          <img v-else :src="imagePreviewModal.url" :alt="imagePreviewModal.title" class="max-w-full max-h-[65vh] object-contain rounded-xl" />
        </div>

        <div class="flex justify-end pt-2">
          <button @click="closeImagePreview" class="px-5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">Fermer</button>
        </div>
      </div>
    </div>
  </div>
</template>
