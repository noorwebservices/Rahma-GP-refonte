<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import Swal from 'sweetalert2'
import { entrepriseService } from '@/services/entrepriseService'
import { getCountryFlag, formatVoyageDate } from '@/utils/flagHelper'
import CountryFlag from '@/components/common/CountryFlag.vue'
import { decodeId, encodeId } from '@/utils/idMasker'
import { formatCurrency } from '@/utils/currencyState'

const route = useRoute()
const router = useRouter()
const agentId = decodeId(route.params.id)

const isLoading = ref(true)
const errorMsg = ref('')
const agent = ref(null)
const voyages = ref([])
const stats = ref({})
const isSubmitting = ref(false)
const searchQuery = ref('')
const showStatusModal = ref(false)
const selectedStatut = ref('actif')

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

const getAgentStatusBadge = (statut) => {
  switch (statut) {
    case 'actif':
      return { text: '● Actif en service', cls: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800' }
    case 'en_voyage':
      return { text: '✈️ En voyage', cls: 'bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-950/60 dark:text-sky-300 dark:border-sky-800' }
    case 'indisponible':
      return { text: '⏳ Indisponible', cls: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800' }
    case 'desactive':
      return { text: '🚫 Désactivé', cls: 'bg-red-50 text-red-700 border-red-200 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800' }
    default:
      return { text: statut || 'En attente', cls: 'bg-gray-100 text-gray-700 border-gray-200 dark:bg-slate-800 dark:text-slate-300' }
  }
}

const getVoyageStatusBadge = (statut) => {
  switch (statut) {
    case 'publie':
      return { text: 'Publié', cls: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300' }
    case 'brouillon':
      return { text: 'Brouillon', cls: 'bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-950/60 dark:text-amber-300' }
    case 'complet':
      return { text: 'Complet', cls: 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/60 dark:text-purple-300' }
    case 'en_cours':
      return { text: 'En cours', cls: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/60 dark:text-blue-300' }
    case 'termine':
      return { text: 'Terminé', cls: 'bg-slate-100 text-slate-700 border-slate-300 dark:bg-slate-800 dark:text-slate-300' }
    case 'annule':
      return { text: 'Annulé', cls: 'bg-red-50 text-red-700 border-red-200 dark:bg-rose-950/60 dark:text-rose-300' }
    default:
      return { text: statut || 'Inconnu', cls: 'bg-gray-50 text-gray-600 border-gray-200' }
  }
}

const truncateText = (text, maxLength = 30) => {
  if (!text) return ''
  const str = String(text)
  if (str.length <= maxLength) return str
  return str.slice(0, maxLength) + '...'
}

const filteredVoyages = computed(() => {
  if (!searchQuery.value.trim()) return voyages.value
  const q = searchQuery.value.toLowerCase().trim()
  return voyages.value.filter(v => {
    return (
      (v.ville_depart && v.ville_depart.toLowerCase().includes(q)) ||
      (v.ville_destination && v.ville_destination.toLowerCase().includes(q)) ||
      (v.pays_depart && v.pays_depart.toLowerCase().includes(q)) ||
      (v.pays_destination && v.pays_destination.toLowerCase().includes(q)) ||
      (v.statut && v.statut.toLowerCase().includes(q))
    )
  })
})

// Pagination logic
const currentPage = ref(1)
const itemsPerPage = ref(5)

const totalPages = computed(() => {
  return Math.ceil(filteredVoyages.value.length / itemsPerPage.value) || 1
})

const paginatedVoyages = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value
  return filteredVoyages.value.slice(start, start + itemsPerPage.value)
})

const nextPage = () => {
  if (currentPage.value < totalPages.value) currentPage.value++
}

const prevPage = () => {
  if (currentPage.value > 1) currentPage.value--
}

const visiblePages = computed(() => {
  const total = totalPages.value
  const current = currentPage.value

  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1)
  }

  if (current <= 4) {
    return [1, 2, 3, 4, 5, '...', total]
  }

  if (current >= total - 3) {
    return [1, '...', total - 4, total - 3, total - 2, total - 1, total]
  }

  return [1, '...', current - 1, current, current + 1, '...', total]
})

const loadAgentData = async () => {
  if (!agentId) {
    errorMsg.value = 'Identifiant de l\'agent manquant.'
    isLoading.value = false
    return
  }

  isLoading.value = true
  errorMsg.value = ''

  try {
    const res = await entrepriseService.getAgent(agentId)
    if (res && res.agent) {
      agent.value = res.agent
      selectedStatut.value = res.agent.statut || 'actif'
      voyages.value = res.voyages || []
      stats.value = res.stats || {}
    } else {
      errorMsg.value = 'Agent introuvable.'
    }
  } catch (err) {
    console.error('Erreur chargement agent:', err)
    errorMsg.value = err?.message || 'Erreur lors du chargement de l\'agent.'
  } finally {
    isLoading.value = false
  }
}

onMounted(loadAgentData)

const handleUpdateStatus = async () => {
  isSubmitting.value = true
  try {
    await entrepriseService.updateAgentStatus(agent.value.id, selectedStatut.value)
    showToast('success', 'Statut de l\'agent mis à jour avec succès !')
    showStatusModal.value = false
    await loadAgentData()
  } catch (err) {
    showToast('error', err?.message || 'Impossible de mettre à jour le statut.')
  } finally {
    isSubmitting.value = false
  }
}

const handleRegeneratePassword = async () => {
  const result = await Swal.fire({
    title: 'Réinitialiser le mot de passe ?',
    text: `Un nouveau mot de passe sera généré pour l'agent ${agent.value.user?.prenom} ${agent.value.user?.nom}.`,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Oui, générer',
    cancelButtonText: 'Annuler',
    confirmButtonColor: '#053754'
  })

  if (!result.isConfirmed) return

  isSubmitting.value = true
  try {
    const res = await entrepriseService.regenerateAgentPassword(agent.value.id)
    Swal.fire({
      icon: 'success',
      title: 'Mot de passe généré !',
      html: `Mot de passe temporaire : <strong class="text-[#B50302] font-mono text-lg">${res.generated_password}</strong><br><br>Veuillez transmettre ce code à l'agent.`,
      confirmButtonColor: '#053754'
    })
    await loadAgentData()
  } catch (err) {
    showToast('error', err?.message || 'Erreur lors de la réinitialisation.')
  } finally {
    isSubmitting.value = false
  }
}

const goToVoyageDetail = (voyage) => {
  const maskedId = encodeId(voyage.id)
  router.push(`/entreprise/voyages/${maskedId}`)
}

const goBack = () => {
  router.push('/entreprise/agents')
}
</script>

<template>
  <div class="space-y-6 pb-16 font-sans">
    
    <!-- Top Action Bar -->
    <div class="flex items-center justify-between gap-2 border-b border-gray-200/60 dark:border-slate-800 pb-3">
      <button
        @click="goBack"
        type="button"
        class="inline-flex items-center gap-1.5 text-xs font-bold text-gray-700 dark:text-slate-200 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 px-3 py-2 rounded-xl hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors shadow-2xs cursor-pointer shrink"
      >
        <span>←</span>
        <span>Retour aux agents</span>
      </button>

      <span
        v-if="agent"
        class="text-[11px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider border shrink-0"
        :class="getAgentStatusBadge(agent.statut).cls"
      >
        {{ getAgentStatusBadge(agent.statut).text }}
      </span>
    </div>

    <!-- Loading State -->
    <div v-if="isLoading" class="bg-white dark:bg-slate-900 rounded-3xl p-12 text-center border border-gray-100 dark:border-slate-800 shadow-sm space-y-4">
      <div class="w-10 h-10 border-4 border-[#053754] dark:border-sky-400 border-t-transparent rounded-full animate-spin mx-auto"></div>
      <p class="text-sm font-bold text-gray-600 dark:text-slate-300">Chargement du profil de l'agent GP...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="errorMsg" class="bg-red-50 dark:bg-rose-950/40 border border-red-200 dark:border-rose-900 rounded-3xl p-8 text-center space-y-3">
      <p class="text-sm font-bold text-red-800 dark:text-rose-300">{{ errorMsg }}</p>
      <button @click="goBack" class="px-4 py-2 bg-red-600 text-white font-bold text-xs rounded-xl cursor-pointer">Retour</button>
    </div>

    <!-- Main Content when loaded -->
    <template v-else-if="agent">
      
      <!-- Title Header -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 class="text-xl sm:text-2xl font-serif font-bold text-principal-dark dark:text-sky-300 flex items-center gap-2">
            <span>👤 Agent GP :</span>
            <span>{{ agent.user?.prenom }} {{ agent.user?.nom }}</span>
          </h1>
          <p class="text-xs sm:text-sm text-gray-500 dark:text-slate-400">
            Fiche détaillée et historique des trajets affectés
          </p>
        </div>

        <span class="inline-flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 text-gray-800 dark:text-slate-200 text-xs font-mono font-extrabold px-3 py-1.5 rounded-xl border border-gray-200 dark:border-slate-700">
          Matricule : {{ agent.matricule || 'N/A' }}
        </span>
      </div>

      <!-- Hero Summary Dark Blue Card -->
      <div class="bg-[#053754] text-white rounded-3xl p-6 sm:p-7 shadow-xl space-y-6 relative overflow-hidden">
        
        <div class="flex flex-col md:flex-row md:items-center justify-between gap-6">
          
          <!-- Agent Info Row -->
          <div class="flex items-center gap-4">
            <div class="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-white/10 border-2 border-white/20 text-white font-black text-xl sm:text-2xl flex items-center justify-center shrink-0 shadow-md">
              {{ (agent.user?.prenom?.slice(0, 1) || 'A') + (agent.user?.nom?.slice(0, 1) || 'G') }}
            </div>
            
            <div class="space-y-1">
              <h2 class="text-lg sm:text-xl font-extrabold text-white leading-tight">
                {{ agent.user?.prenom }} {{ agent.user?.nom }}
              </h2>
              <p class="text-xs text-sky-200 font-medium flex items-center gap-2">
                <span>📞 {{ agent.user?.telephone || 'Non renseigné' }}</span>
              </p>
              <p v-if="agent.user?.email" class="text-xs text-sky-300 font-medium">
                ✉️ {{ agent.user.email }}
              </p>
            </div>
          </div>

          <!-- Quick Metrics Cards -->
          <div class="grid grid-cols-3 gap-3 text-center bg-white/10 p-3.5 rounded-2xl border border-white/10 shrink-0">
            <div class="px-2">
              <span class="text-xs text-sky-200 font-medium block">Voyages</span>
              <span class="text-lg sm:text-xl font-black text-white block mt-0.5">{{ stats.total_voyages || 0 }}</span>
            </div>
            <div class="px-2 border-x border-white/10">
              <span class="text-xs text-sky-200 font-medium block">En cours</span>
              <span class="text-lg sm:text-xl font-black text-amber-300 block mt-0.5">{{ stats.voyages_en_cours || 0 }}</span>
            </div>
            <div class="px-2">
              <span class="text-xs text-sky-200 font-medium block">Livraisons</span>
              <span class="text-lg sm:text-xl font-black text-emerald-400 block mt-0.5">{{ stats.total_colis || 0 }}</span>
            </div>
          </div>

        </div>

      </div>

      <!-- Agent Detailed Specifications (2 Columns Layout) -->
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        <!-- Left Column: Informations personnelles & Contact (lg:col-span-7) -->
        <div class="lg:col-span-7 space-y-5">
          
          <div class="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-gray-200 dark:border-slate-800 shadow-2xs space-y-4">
            <h3 class="text-xs font-bold text-gray-400 dark:text-slate-400 uppercase tracking-wider border-b border-gray-100 dark:border-slate-800 pb-2">
              Informations Personnelles
            </h3>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div class="bg-slate-50 dark:bg-slate-800/80 p-3.5 rounded-2xl border border-slate-100 dark:border-slate-700 space-y-0.5">
                <span class="text-gray-400 dark:text-slate-400 font-medium block">Prénom & Nom</span>
                <span class="font-extrabold text-gray-900 dark:text-slate-100 text-sm block">{{ agent.user?.prenom }} {{ agent.user?.nom }}</span>
              </div>

              <div class="bg-slate-50 dark:bg-slate-800/80 p-3.5 rounded-2xl border border-slate-100 dark:border-slate-700 space-y-0.5">
                <span class="text-gray-400 dark:text-slate-400 font-medium block">Téléphone</span>
                <span class="font-extrabold text-[#053754] dark:text-sky-300 text-sm block">{{ agent.user?.telephone || '—' }}</span>
              </div>

              <div class="bg-slate-50 dark:bg-slate-800/80 p-3.5 rounded-2xl border border-slate-100 dark:border-slate-700 space-y-0.5">
                <span class="text-gray-400 dark:text-slate-400 font-medium block">Adresse E-mail</span>
                <span class="font-extrabold text-gray-900 dark:text-slate-100 text-xs block truncate">{{ agent.user?.email || 'Non renseigné' }}</span>
              </div>

              <div class="bg-slate-50 dark:bg-slate-800/80 p-3.5 rounded-2xl border border-slate-100 dark:border-slate-700 space-y-0.5">
                <span class="text-gray-400 dark:text-slate-400 font-medium block">Matricule Officiel</span>
                <span class="font-extrabold text-[#B50302] dark:text-rose-400 font-mono text-sm block">{{ agent.matricule || '—' }}</span>
              </div>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs pt-2">
              <div class="space-y-0.5">
                <span class="text-gray-400 dark:text-slate-400 font-medium block">Date d'adhésion</span>
                <span class="font-bold text-gray-800 dark:text-slate-200 block">
                  {{ agent.date_adhesion ? new Date(agent.date_adhesion).toLocaleDateString('fr-FR', { dateStyle: 'long' }) : 'Non renseignée' }}
                </span>
              </div>

              <div class="space-y-0.5">
                <span class="text-gray-400 dark:text-slate-400 font-medium block">Dernière activation</span>
                <span class="font-bold text-gray-800 dark:text-slate-200 block">
                  {{ agent.date_activation ? new Date(agent.date_activation).toLocaleDateString('fr-FR', { dateStyle: 'long' }) : 'En attente' }}
                </span>
              </div>
            </div>
          </div>

        </div>

        <!-- Right Column: Operational Controls & Management (lg:col-span-5) -->
        <div class="lg:col-span-5 space-y-5 lg:sticky lg:top-20">
          
          <div class="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-gray-200 dark:border-slate-800 shadow-2xs space-y-4">
            <h3 class="text-xs font-bold text-gray-400 dark:text-slate-400 uppercase tracking-wider border-b border-gray-100 dark:border-slate-800 pb-2">
              Actions de Gestion Gérant
            </h3>

            <div class="space-y-3">
              <button
                @click="showStatusModal = true"
                type="button"
                class="w-full py-3 px-4 bg-[#053754] hover:bg-[#074C72] text-white font-extrabold text-xs rounded-2xl transition cursor-pointer flex items-center justify-between shadow-xs"
              >
                <span>Changer le statut de service</span>
                <span>⚙️</span>
              </button>

              <button
                @click="handleRegeneratePassword"
                :disabled="isSubmitting"
                type="button"
                class="w-full py-3 px-4 bg-amber-50 dark:bg-amber-950/60 hover:bg-amber-100 text-amber-900 dark:text-amber-200 border border-amber-200 dark:border-amber-800 font-extrabold text-xs rounded-2xl transition cursor-pointer flex items-center justify-between"
              >
                <span>Réinitialiser le mot de passe</span>
                <span>🔑</span>
              </button>
            </div>
          </div>

        </div>

      </div>

      <!-- Voyages Assigned Section (List of voyages assigned to this Agent GP) -->
      <div class="space-y-4 pt-4 border-t border-gray-200 dark:border-slate-800">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h2 class="text-base sm:text-lg font-bold text-principal-dark dark:text-sky-300 flex items-center gap-2">
            <span>Trajets affectés à l'Agent</span>
            <span class="bg-sky-100 dark:bg-sky-950 text-[#074C72] dark:text-sky-300 text-xs px-2.5 py-0.5 rounded-full font-black">{{ filteredVoyages.length }}</span>
          </h2>
          
          <!-- Search Bar Input -->
          <div class="relative w-full sm:w-72">
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Rechercher par ville, pays, statut..."
              class="w-full bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-2xl pl-9 pr-8 py-2 text-xs font-medium text-gray-900 dark:text-slate-100 outline-none focus:border-[#074C72] dark:focus:border-sky-400 shadow-2xs"
            />
            <span class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs">🔍</span>
            <button
              v-if="searchQuery"
              @click="searchQuery = ''"
              type="button"
              class="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-xs font-bold p-1 cursor-pointer"
            >
              ✕
            </button>
          </div>
        </div>

        <template v-if="filteredVoyages.length > 0">
          
          <!-- Desktop Table View -->
          <div class="hidden md:block overflow-x-auto w-full bg-white dark:bg-slate-900 rounded-3xl border border-gray-200 dark:border-slate-800 shadow-sm p-4">
            <table class="min-w-max w-full text-left border-collapse">
              <thead>
                <tr class="border-b border-gray-100 dark:border-slate-800 text-[11px] font-extrabold text-gray-400 dark:text-slate-400 uppercase tracking-wider whitespace-nowrap">
                  <th class="pb-3 px-3">Trajet</th>
                  <th class="pb-3 px-3">Dates (Départ ➔ Arrivée)</th>
                  <th class="pb-3 px-3">Capacité</th>
                  <th class="pb-3 px-3">Statut</th>
                  <th class="pb-3 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-100 dark:divide-slate-800/60 text-xs">
                <tr
                  v-for="v in paginatedVoyages"
                  :key="v.id"
                  @click="goToVoyageDetail(v)"
                  class="hover:bg-sky-50/50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer group"
                >
                  <td class="py-3.5 px-3 whitespace-nowrap">
                    <div class="flex items-center gap-2 font-extrabold text-[#053754] dark:text-sky-300 text-sm">
                      <span>{{ truncateText(v.ville_depart, 30) }}</span>
                      <span class="text-gray-400 text-xs">➔</span>
                      <span>{{ truncateText(v.ville_destination, 30) }}</span>
                    </div>
                    <div class="text-[10px] text-gray-400 dark:text-slate-400 mt-0.5">
                      {{ truncateText(v.pays_depart, 30) }} ➔ {{ truncateText(v.pays_destination, 30) }}
                    </div>
                  </td>
                  <td class="py-3.5 px-3">
                    <div class="font-bold text-gray-800 dark:text-slate-200">
                      {{ v.date_depart ? new Date(v.date_depart).toLocaleString('fr-FR', { dateStyle: 'short', timeStyle: 'short' }) : '—' }}
                    </div>
                    <div class="text-[10px] text-gray-400">
                      ➔ {{ v.date_arrivee ? new Date(v.date_arrivee).toLocaleString('fr-FR', { dateStyle: 'short', timeStyle: 'short' }) : '—' }}
                    </div>
                  </td>
                  <td class="py-3.5 px-3 font-bold text-emerald-600 dark:text-emerald-400">
                    {{ v.capacite_dispo ?? v.capacite_totale }} / {{ v.capacite_totale }} Kg
                  </td>
                  <td class="py-3.5 px-3">
                    <span
                      class="text-[10px] font-extrabold px-2.5 py-1 rounded-full border whitespace-nowrap"
                      :class="getVoyageStatusBadge(v.statut).cls"
                    >
                      {{ getVoyageStatusBadge(v.statut).text }}
                    </span>
                  </td>
                  <td class="py-3.5 px-3 text-right" @click.stop>
                    <button
                      @click="goToVoyageDetail(v)"
                      type="button"
                      class="bg-[#053754] hover:bg-[#074C72] text-white font-extrabold text-[11px] px-3 py-1.5 rounded-lg transition-colors cursor-pointer flex items-center gap-1 shadow-2xs ml-auto"
                    >
                      <span>Détails</span>
                      <span>➔</span>
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Mobile Cards View -->
          <div class="grid grid-cols-1 gap-4 md:hidden">
            <div
              v-for="v in paginatedVoyages"
              :key="v.id"
              @click="goToVoyageDetail(v)"
              class="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-gray-200 dark:border-slate-800 shadow-sm space-y-3 cursor-pointer group"
            >
              <div class="flex items-center justify-between">
                <div class="font-extrabold text-[#053754] dark:text-sky-300 text-sm flex items-center gap-1.5">
                  <span>{{ v.ville_depart }}</span>
                  <span>➔</span>
                  <span>{{ v.ville_destination }}</span>
                </div>
                <span
                  class="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border"
                  :class="getVoyageStatusBadge(v.statut).cls"
                >
                  {{ getVoyageStatusBadge(v.statut).text }}
                </span>
              </div>

              <div class="text-xs text-gray-500 space-y-1">
                <p>Départ : <strong class="text-gray-800 dark:text-slate-200">{{ formatVoyageDate(v.date_depart) }}</strong></p>
                <p>Arrivée : <strong class="text-gray-800 dark:text-slate-200">{{ formatVoyageDate(v.date_arrivee) }}</strong></p>
              </div>

              <div class="pt-2 border-t border-gray-100 dark:border-slate-800 flex items-center justify-between">
                <span class="text-xs font-bold text-emerald-600">{{ v.capacite_dispo }} Kg dispo</span>
                <button
                  @click="goToVoyageDetail(v)"
                  type="button"
                  class="px-3 py-1 bg-[#053754] text-white font-bold text-xs rounded-xl"
                >
                  Voir détails →
                </button>
              </div>
            </div>
          </div>

          <!-- Pagination Controls Bar -->
          <div v-if="totalPages > 1" class="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 text-xs">
            <div class="text-gray-500 dark:text-slate-400 font-medium">
              Affichage de <span class="font-bold text-gray-800 dark:text-slate-200">{{ (currentPage - 1) * itemsPerPage + 1 }}</span>
              à <span class="font-bold text-gray-800 dark:text-slate-200">{{ Math.min(currentPage * itemsPerPage, filteredVoyages.length) }}</span>
              sur <span class="font-bold text-[#053754] dark:text-sky-300">{{ filteredVoyages.length }}</span> voyages
            </div>

            <div class="flex items-center gap-2">
              <button
                @click="prevPage"
                :disabled="currentPage === 1"
                class="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 font-bold text-gray-700 dark:text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-slate-800 transition cursor-pointer shadow-2xs"
              >
                ◄ Précédent
              </button>

              <div class="flex items-center gap-1">
                <template v-for="(p, index) in visiblePages" :key="index">
                  <span v-if="p === '...'" class="px-1.5 py-1 text-gray-400 dark:text-slate-500 font-extrabold select-none text-xs">...</span>
                  <button
                    v-else
                    @click="currentPage = p"
                    :class="[
                      'w-7 h-7 rounded-xl font-extrabold text-xs transition cursor-pointer flex items-center justify-center',
                      currentPage === p ? 'bg-[#053754] text-white shadow-xs' : 'bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 text-gray-600 dark:text-slate-300 hover:bg-gray-100'
                    ]"
                  >
                    {{ p }}
                  </button>
                </template>
              </div>

              <button
                @click="nextPage"
                :disabled="currentPage === totalPages"
                class="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 font-bold text-gray-700 dark:text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-slate-800 transition cursor-pointer shadow-2xs"
              >
                Suivant ►
              </button>
            </div>
          </div>

        </template>

        <!-- Empty state -->
        <div v-else class="bg-white dark:bg-slate-900 rounded-3xl p-10 text-center border border-gray-200 dark:border-slate-800 space-y-2">
          <div class="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center text-xl mx-auto">
            ✈️
          </div>
          <p class="text-sm font-bold text-gray-700 dark:text-slate-200">Aucun voyage affecté à cet agent</p>
          <p class="text-xs text-gray-400">Les trajets attribués à cet Agent GP apparaîtront ici.</p>
        </div>
      </div>

      <!-- MODAL CHANGER STATUT AGENT -->
      <div v-if="showStatusModal" class="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
        <div class="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 w-full max-w-md rounded-3xl p-6 shadow-2xl space-y-4">
          <div class="flex items-center justify-between border-b border-gray-100 dark:border-slate-800 pb-3">
            <h3 class="text-base font-bold text-[#053754] dark:text-sky-300 font-serif">Modifier le statut de service</h3>
            <button @click="showStatusModal = false" class="text-gray-400 hover:text-gray-600 font-bold cursor-pointer">✕</button>
          </div>

          <div class="space-y-3">
            <label class="block text-xs font-bold text-gray-700 dark:text-slate-300">Nouveau statut de l'agent GP</label>
            <select
              v-model="selectedStatut"
              class="w-full bg-[#F3F4F6] dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl px-4 py-3 text-xs font-bold text-gray-800 dark:text-slate-100 outline-none"
            >
              <option value="actif">Actif en service</option>
              <option value="en_voyage">En voyage</option>
              <option value="indisponible">Indisponible</option>
              <option value="desactive">Désactivé</option>
            </select>
          </div>

          <div class="flex items-center justify-end gap-2 pt-2 border-t border-gray-100 dark:border-slate-800">
            <button @click="showStatusModal = false" type="button" class="px-4 py-2.5 bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-slate-200 text-xs font-bold rounded-xl cursor-pointer">Annuler</button>
            <button @click="handleUpdateStatus" :disabled="isSubmitting" type="button" class="px-5 py-2.5 bg-[#053754] text-white text-xs font-bold rounded-xl cursor-pointer shadow-md">Enregistrer</button>
          </div>
        </div>
      </div>

    </template>
  </div>
</template>
