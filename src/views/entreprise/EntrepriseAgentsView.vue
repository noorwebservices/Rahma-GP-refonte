<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { entrepriseService } from '@/services/entrepriseService'
import CountryPhoneInput from '@/components/common/CountryPhoneInput.vue'
import { encodeId } from '@/utils/idMasker'
import Swal from 'sweetalert2'

const router = useRouter()
const isLoading = ref(true)
const agents = ref([])
const activeFilter = ref('')
const searchQuery = ref('')

// Modals state
const showDirectCreateModal = ref(false)
const showInviteModal = ref(false)
const showCredentialsModal = ref(false)
const showTrashModal = ref(false)
const isSubmitting = ref(false)

// Trash agents state
const trashedAgents = ref([])
const isLoadingTrash = ref(false)

// Newly generated credentials modal state
const createdCredentials = reactive({
  nom: '',
  prenom: '',
  telephone: '',
  email: '',
  matricule: '',
  mot_de_passe: '',
})

// Direct Create Form
const directForm = reactive({
  nom: '',
  prenom: '',
  telephone: '',
  email: '',
})

// Invite Form
const inviteForm = reactive({
  canal: 'whatsapp',
  telephone: '',
  email: '',
})

const generatedWhatsappLink = ref('')

const fetchAgents = async () => {
  isLoading.value = true
  try {
    const params = activeFilter.value ? { statut: activeFilter.value } : {}
    const res = await entrepriseService.getAgents(params)
    agents.value = res.agents || []
  } catch (err) {
    console.error('Erreur chargement agents:', err)
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  fetchAgents()
})

const setFilter = (statut) => {
  activeFilter.value = statut
  currentPage.value = 1
  fetchAgents()
}

// Search & Status filtering computed property
const filteredAgents = computed(() => {
  let list = agents.value

  // Filtrage strict sur le statut de la table agent_gp
  if (activeFilter.value) {
    list = list.filter((agent) => agent.statut === activeFilter.value)
  }

  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase().trim()
    list = list.filter((agent) => {
      const nom = (agent.user?.nom || '').toLowerCase()
      const prenom = (agent.user?.prenom || '').toLowerCase()
      const fullNom = `${prenom} ${nom}`.toLowerCase()
      const email = (agent.user?.email || '').toLowerCase()
      const phone = (agent.user?.telephone || '').toLowerCase()
      const matricule = (agent.matricule || '').toLowerCase()

      return fullNom.includes(query) || email.includes(query) || phone.includes(query) || matricule.includes(query)
    })
  }

  return list
})

// Pagination logic
const currentPage = ref(1)
const itemsPerPage = ref(10)

const totalPages = computed(() => {
  return Math.ceil(filteredAgents.value.length / itemsPerPage.value) || 1
})

const paginatedAgents = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value
  return filteredAgents.value.slice(start, start + itemsPerPage.value)
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

// Trash & Restore methods
const fetchTrashAgents = async () => {
  isLoadingTrash.value = true
  try {
    const res = await entrepriseService.getTrashedAgents()
    trashedAgents.value = res.agents || []
  } catch (err) {
    console.error(err)
  } finally {
    isLoadingTrash.value = false
  }
}

const openTrashModal = () => {
  showTrashModal.value = true
  fetchTrashAgents()
}

// Toast Notification Helper
const showToast = (icon, title) => {
  Swal.fire({
    toast: true,
    position: 'top-end',
    icon,
    title,
    showConfirmButton: false,
    timer: 3000
  })
}

const restoreAgent = async (agent) => {
  try {
    await entrepriseService.restoreAgent(agent.id)
    showToast('success', `L'agent ${agent.user?.prenom} ${agent.user?.nom} a été restauré !`)
    fetchTrashAgents()
    fetchAgents()
  } catch (err) {
    console.error(err)
    showToast('error', 'Impossible de restaurer cet agent.')
  }
}

const forceDeleteAgent = async (agent) => {
  const result = await Swal.fire({
    title: 'Suppression définitive ?',
    text: `Attention : cette action supprimera définitivement l'agent ${agent.user?.prenom} ${agent.user?.nom}.`,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#B50302',
    cancelButtonColor: '#64748b',
    confirmButtonText: 'Oui, supprimer définitivement',
    cancelButtonText: 'Annuler',
  })

  if (!result.isConfirmed) return

  try {
    await entrepriseService.forceDeleteAgent(agent.id)
    showToast('success', 'Agent supprimé définitivement !')
    fetchTrashAgents()
  } catch (err) {
    console.error(err)
    showToast('error', 'Erreur lors de la suppression définitive.')
  }
}

// Handle Direct Creation
const handleDirectCreate = async () => {
  if (!directForm.nom || !directForm.prenom || !directForm.telephone) {
    return showToast('warning', 'Veuillez remplir le prénom, le nom et le téléphone.')
  }

  isSubmitting.value = true
  try {
    const payload = {
      nom: directForm.nom,
      prenom: directForm.prenom,
      telephone: directForm.telephone.replace(/\s+/g, ''),
      email: directForm.email ? directForm.email.trim() : null,
    }

    const res = await entrepriseService.createAgentDirect(payload)
    showDirectCreateModal.value = false

    // Stocker les identifiants générés pour affichage
    Object.assign(createdCredentials, {
      nom: directForm.nom,
      prenom: directForm.prenom,
      telephone: directForm.telephone,
      email: directForm.email,
      matricule: res.matricule || res.agent?.matricule || 'N/A',
      mot_de_passe: res.generated_password || 'Non spécifié',
    })

    // Reset Form
    Object.assign(directForm, { nom: '', prenom: '', telephone: '', email: '' })
    showCredentialsModal.value = true

    fetchAgents()
  } catch (err) {
    console.error(err)
    showToast('error', err.message || 'Erreur lors de la création directe de l\'agent.')
  } finally {
    isSubmitting.value = false
  }
}

// Handle Regenerate Password for an Agent
const handleRegeneratePassword = async (agent) => {
  const agentName = `${agent.user?.prenom} ${agent.user?.nom}`
  const result = await Swal.fire({
    title: 'Générer un nouveau mot de passe ?',
    text: `Un nouveau mot de passe provisoire sera créé pour l'agent ${agentName}.`,
    icon: 'question',
    showCancelButton: true,
    confirmButtonColor: '#053754',
    cancelButtonColor: '#64748b',
    confirmButtonText: 'Oui, générer',
    cancelButtonText: 'Annuler',
  })

  if (!result.isConfirmed) return

  try {
    const res = await entrepriseService.regenerateAgentPassword(agent.id)
    const newPwd = res.generated_password

    await Swal.fire({
      title: 'Nouveau mot de passe généré ! 🔑',
      html: `
        <div class="space-y-3 text-left p-3 bg-gray-50 dark:bg-slate-800 rounded-xl text-xs">
          <p><strong>Agent :</strong> ${agentName}</p>
          <p><strong>Matricule :</strong> ${agent.matricule || 'Non spécifié'}</p>
          <div class="p-3 bg-sky-100 dark:bg-sky-950/80 border border-sky-300 dark:border-sky-800 rounded-xl font-mono text-center">
            <span class="text-xs text-sky-700 dark:text-sky-300 font-bold block">Mot de passe provisoire :</span>
            <span class="text-lg font-black text-[#053754] dark:text-sky-200">${newPwd}</span>
          </div>
        </div>
      `,
      icon: 'success',
      confirmButtonColor: '#053754',
      confirmButtonText: 'Fermer',
    })
  } catch (err) {
    console.error(err)
    showToast('error', err.message || 'Impossible de réinitialiser le mot de passe.')
  }
}

// Copy Credentials Helper
const copyText = (text) => {
  navigator.clipboard.writeText(text)
  showToast('success', 'Copié dans le presse-papier !')
}

// Handle Invitation (WhatsApp / Email)
const handleInvite = async () => {
  if (inviteForm.canal === 'whatsapp' && !inviteForm.telephone) {
    return showToast('warning', 'Veuillez saisir un numéro de téléphone WhatsApp.')
  }
  if (inviteForm.canal === 'email' && !inviteForm.email) {
    return showToast('warning', 'Veuillez saisir une adresse email.')
  }

  isSubmitting.value = true
  generatedWhatsappLink.value = ''

  try {
    const payload = {
      canal: inviteForm.canal,
      telephone: inviteForm.telephone ? inviteForm.telephone.replace(/\s+/g, '') : null,
      email: inviteForm.email ? inviteForm.email.trim() : null,
    }

    const res = await entrepriseService.inviteAgent(payload)

    if (inviteForm.canal === 'whatsapp' && res.whatsapp_link) {
      generatedWhatsappLink.value = res.whatsapp_link
      window.open(res.whatsapp_link, '_blank')
    } else {
      showInviteModal.value = false
      showToast('success', 'Invitation envoyée par e-mail avec succès ! 📩')
    }

    inviteForm.telephone = ''
    inviteForm.email = ''
  } catch (err) {
    console.error(err)
    showToast('error', err.message || 'Erreur lors de l\'envoi de l\'invitation.')
  } finally {
    isSubmitting.value = false
  }
}

// Update Agent Status
const toggleAgentStatus = async (agent, newStatut) => {
  try {
    await entrepriseService.updateAgentStatus(agent.id, newStatut)
    showToast('success', `L'agent est maintenant au statut '${newStatut}'.`)
    fetchAgents()
  } catch (err) {
    console.error(err)
    showToast('error', 'Impossible de modifier le statut.')
  }
}

// Soft Delete Agent
const confirmDeleteAgent = async (agent) => {
  const result = await Swal.fire({
    title: 'Retirer cet agent ?',
    text: `Êtes-vous sûr de vouloir placer l'agent ${agent.user.prenom} ${agent.user.nom} dans la corbeille (archive) ?`,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#B50302',
    cancelButtonColor: '#64748b',
    confirmButtonText: 'Oui, placer en corbeille',
    cancelButtonText: 'Annuler',
  })

  if (result.isConfirmed) {
    try {
      await entrepriseService.deleteAgent(agent.id)
      showToast('success', 'Agent placé dans la corbeille !')
      fetchAgents()
    } catch (err) {
      console.error(err)
      showToast('error', 'Impossible de retirer l\'agent.')
    }
  }
}

const goToAgentDetail = (agent) => {
  const maskedId = encodeId(agent.id)
  router.push(`/entreprise/agents/${maskedId}`)
}

const getStatusBadge = (statut) => {
  switch (statut) {
    case 'actif': return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
    case 'en_voyage': return 'bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300'
    case 'indisponible': return 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
    case 'en_attente': return 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300'
    case 'desactive': return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'
    default: return 'bg-gray-100 text-gray-800'
  }
}

const truncateText = (text, maxLength = 30) => {
  if (!text) return ''
  const str = String(text)
  return str.length > maxLength ? str.substring(0, maxLength) + '...' : str
}
</script>

<template>
  <div class="space-y-6">
    
    <!-- Top Actions Header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 p-5 sm:p-6 rounded-3xl shadow-2xs">
      <div>
        <h2 class="text-xl font-extrabold text-[#053754] dark:text-sky-300">Gestion des Agents GP</h2>
        <p class="text-xs text-gray-500 dark:text-slate-400 mt-1">
          Gérez l'effectif de vos agents GP, ajoutez-en directement ou envoyez des invitations.
        </p>
      </div>

      <div class="flex items-center gap-2.5 flex-wrap sm:flex-nowrap">
        <!-- Button Direct Create -->
        <button
          @click="showDirectCreateModal = true"
          class="px-4 py-2.5 bg-[#053754] hover:bg-[#0284c7] text-white font-bold text-xs rounded-2xl transition-all shadow-sm flex items-center gap-2 cursor-pointer"
        >
          <span>➕</span>
          <span>Ajouter un Agent</span>
        </button>

        <!-- Button Invite WhatsApp/Email -->
        <button
          @click="showInviteModal = true"
          class="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-2xl transition-all shadow-sm flex items-center gap-2 cursor-pointer"
        >
          <span>📱</span>
          <span>Inviter</span>
        </button>

        <!-- Button Trash / Archives -->
        <button
          @click="openTrashModal"
          class="px-3.5 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs rounded-2xl transition-all flex items-center gap-1.5 cursor-pointer border border-slate-200 dark:border-slate-700"
          title="Consulter la corbeille des agents archivés"
        >
          <span>🗑️</span>
          <span>Corbeille</span>
        </button>
      </div>
    </div>

    <!-- Search & Filters Section -->
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
      
      <!-- Barre de Recherche -->
      <div class="relative w-full md:w-80">
        <span class="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-gray-400">
          🔍
        </span>
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Rechercher par nom, matricule, téléphone..."
          class="w-full h-11 pl-10 pr-9 text-xs sm:text-sm bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-2xl shadow-2xs focus:ring-2 focus:ring-[#053754] focus:outline-none dark:text-slate-100"
        />
        <button
          v-if="searchQuery"
          @click="searchQuery = ''"
          class="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600 text-xs"
        >
          ✕
        </button>
      </div>

      <!-- Status Filters Bar -->
      <div class="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0">
        <button
          @click="setFilter('')"
          :class="[
            'px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap',
            activeFilter === '' ? 'bg-[#053754] text-white shadow-xs' : 'bg-white dark:bg-slate-900 text-gray-600 dark:text-slate-300 hover:bg-gray-100'
          ]"
        >
          Tous les agents ({{ agents.length }})
        </button>

        <button
          @click="setFilter('actif')"
          :class="[
            'px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap',
            activeFilter === 'actif' ? 'bg-emerald-600 text-white shadow-xs' : 'bg-white dark:bg-slate-900 text-gray-600 dark:text-slate-300 hover:bg-gray-100'
          ]"
        >
          Actifs
        </button>

        <button
          @click="setFilter('en_voyage')"
          :class="[
            'px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap',
            activeFilter === 'en_voyage' ? 'bg-sky-600 text-white shadow-xs' : 'bg-white dark:bg-slate-900 text-gray-600 dark:text-slate-300 hover:bg-gray-100'
          ]"
        >
          En voyage
        </button>

        <button
          @click="setFilter('indisponible')"
          :class="[
            'px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap',
            activeFilter === 'indisponible' ? 'bg-amber-600 text-white shadow-xs' : 'bg-white dark:bg-slate-900 text-gray-600 dark:text-slate-300 hover:bg-gray-100'
          ]"
        >
          Indisponibles
        </button>

        <button
          @click="setFilter('en_attente')"
          :class="[
            'px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap',
            activeFilter === 'en_attente' ? 'bg-purple-600 text-white shadow-xs' : 'bg-white dark:bg-slate-900 text-gray-600 dark:text-slate-300 hover:bg-gray-100'
          ]"
        >
          En attente
        </button>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="isLoading" class="py-12 text-center space-y-3">
      <div class="w-8 h-8 border-4 border-[#053754] border-t-transparent rounded-full animate-spin mx-auto"></div>
      <p class="text-xs font-bold text-gray-500">Chargement de la liste des agents...</p>
    </div>

    <!-- Empty List -->
    <div v-else-if="filteredAgents.length === 0" class="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 p-8 rounded-3xl text-center space-y-3">
      <span class="text-3xl">👥</span>
      <h3 class="text-sm font-bold text-gray-700 dark:text-slate-300">Aucun agent trouvé</h3>
      <p class="text-xs text-gray-500 max-w-md mx-auto">
        <span v-if="searchQuery">Aucun agent ne correspond à la recherche "{{ searchQuery }}".</span>
        <span v-else>Aucun agent GP n'a encore été ajouté ou invité pour cette sélection.</span>
      </p>
    </div>

    <!-- Agents Table Container -->
    <div v-else class="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-3xl shadow-2xs overflow-hidden">
      <div class="overflow-x-auto w-full">
        <table class="w-full text-left text-xs border-collapse min-w-[650px]">
          <thead>
            <tr class="bg-gray-50 dark:bg-slate-800/80 text-gray-500 dark:text-slate-400 uppercase tracking-wider font-extrabold text-[11px] border-b border-gray-100 dark:border-slate-800">
              <th class="py-4 px-5 whitespace-nowrap min-w-[200px]">Agent</th>
              <th class="py-4 px-4 whitespace-nowrap min-w-[130px]">Matricule</th>
              <th class="py-4 px-4 whitespace-nowrap min-w-[140px]">Téléphone</th>
              <th class="py-4 px-4 whitespace-nowrap min-w-[110px]">Statut</th>
              <th class="py-4 px-5 text-right whitespace-nowrap min-w-[130px]">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100 dark:divide-slate-800 text-gray-700 dark:text-slate-200 font-medium">
            <tr
              v-for="agent in paginatedAgents"
              :key="agent.id"
              @click="goToAgentDetail(agent)"
              class="hover:bg-sky-50/50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer group"
            >
              <!-- Agent Profile -->
              <td class="py-3.5 px-5 whitespace-nowrap">
                <div class="flex items-center gap-3">
                  <div class="w-9 h-9 rounded-full bg-[#053754] text-white font-bold text-xs flex items-center justify-center shrink-0">
                    {{ agent.user?.prenom?.charAt(0) || 'A' }}
                  </div>
                  <div>
                    <div class="font-extrabold text-sm text-[#053754] dark:text-sky-300 group-hover:underline" :title="`${agent.user?.prenom} ${agent.user?.nom}`">
                      {{ truncateText(`${agent.user?.prenom || ''} ${agent.user?.nom || ''}`, 30) }}
                    </div>
                  </div>
                </div>
              </td>

              <!-- Matricule -->
              <td class="py-3.5 px-4 whitespace-nowrap">
                <span class="font-mono font-bold px-2.5 py-1 bg-slate-100 dark:bg-slate-800 rounded-lg text-gray-800 dark:text-slate-200 text-[11px]">
                  {{ truncateText(agent.matricule || 'N/A', 30) }}
                </span>
              </td>

              <!-- Téléphone -->
              <td class="py-3.5 px-4 font-semibold text-gray-800 dark:text-slate-200 whitespace-nowrap">
                {{ truncateText(agent.user?.telephone || '', 30) }}
              </td>

              <!-- Statut -->
              <td class="py-3.5 px-4 whitespace-nowrap">
                <span :class="['px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider', getStatusBadge(agent.statut)]">
                  {{ agent.statut }}
                </span>
              </td>

              <!-- Actions -->
              <td class="py-3.5 px-5 text-right whitespace-nowrap" @click.stop>
                <div class="flex items-center justify-end gap-2">
                  <button
                    @click.stop="goToAgentDetail(agent)"
                    class="px-3 py-1.5 bg-[#053754] hover:bg-[#074C72] text-white font-extrabold text-xs rounded-xl transition flex items-center gap-1.5 cursor-pointer shadow-2xs"
                    title="Voir les détails de l'agent"
                  >
                    <span>👁️</span>
                    <span>Détails</span>
                  </button>

                  <button
                    @click.stop="confirmDeleteAgent(agent)"
                    class="p-1.5 bg-red-50 hover:bg-red-100 text-red-600 dark:bg-red-950/40 dark:hover:bg-red-900/60 dark:text-red-400 rounded-xl transition cursor-pointer flex items-center justify-center"
                    title="Placer en corbeille"
                  >
                    🗑️
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination Controls Bar -->
      <div v-if="totalPages > 1" class="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 border-t border-gray-100 dark:border-slate-800 text-xs bg-gray-50/50 dark:bg-slate-800/40">
        <div class="text-gray-500 dark:text-slate-400 font-medium">
          Affichage de <span class="font-bold text-gray-800 dark:text-slate-200">{{ (currentPage - 1) * itemsPerPage + 1 }}</span>
          à <span class="font-bold text-gray-800 dark:text-slate-200">{{ Math.min(currentPage * itemsPerPage, filteredAgents.length) }}</span>
          sur <span class="font-bold text-[#053754] dark:text-sky-300">{{ filteredAgents.length }}</span> agents
        </div>

        <div class="flex items-center gap-2">
          <button
            @click="prevPage"
            :disabled="currentPage === 1"
            class="px-3.5 py-2 rounded-xl bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 font-bold text-gray-700 dark:text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-slate-800 transition cursor-pointer shadow-2xs"
          >
            ◄ Précédent
          </button>

          <div class="flex items-center gap-1">
            <template v-for="(p, index) in visiblePages" :key="index">
              <span v-if="p === '...'" class="px-2 py-1 text-gray-400 dark:text-slate-500 font-extrabold select-none text-xs">...</span>
              <button
                v-else
                @click="currentPage = p"
                :class="[
                  'w-8 h-8 rounded-xl font-extrabold text-xs transition cursor-pointer flex items-center justify-center',
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
            class="px-3.5 py-2 rounded-xl bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 font-bold text-gray-700 dark:text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-slate-800 transition cursor-pointer shadow-2xs"
          >
            Suivant ►
          </button>
        </div>
      </div>
    </div>

    <!-- MODAL 1 : CRÉATION DIRECTE D'AGENT -->
    <div v-if="showDirectCreateModal" class="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div class="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-3xl p-6 w-full max-w-lg shadow-2xl space-y-4">
        <div class="flex items-center justify-between border-b border-gray-100 dark:border-slate-800 pb-3">
          <h3 class="font-extrabold text-base text-[#053754] dark:text-sky-300">Ajouter directement un Agent GP</h3>
          <button @click="showDirectCreateModal = false" class="text-gray-400 hover:text-gray-700">✕</button>
        </div>

        <div class="p-3 bg-sky-50 dark:bg-sky-950/50 border border-sky-200 dark:border-sky-800/50 rounded-2xl text-xs text-sky-800 dark:text-sky-300">
          💡 <strong>Génération automatique :</strong> Le <strong>matricule</strong> et le <strong>mot de passe provisoire</strong> seront créés automatiquement par le serveur et affichés après validation.
        </div>

        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block text-xs font-semibold mb-1">Prénom *</label>
            <input v-model="directForm.prenom" type="text" placeholder="Amadou" class="w-full px-3 py-2 text-xs border rounded-xl dark:bg-slate-800 dark:border-slate-700" />
          </div>
          <div>
            <label class="block text-xs font-semibold mb-1">Nom *</label>
            <input v-model="directForm.nom" type="text" placeholder="Diop" class="w-full px-3 py-2 text-xs border rounded-xl dark:bg-slate-800 dark:border-slate-700" />
          </div>
        </div>

        <div>
          <label class="block text-xs font-semibold mb-1">Téléphone *</label>
          <CountryPhoneInput v-model="directForm.telephone" placeholder="77 888 99 00" />
        </div>

        <div>
          <label class="block text-xs font-semibold mb-1">E-mail (Optionnel)</label>
          <input v-model="directForm.email" type="email" placeholder="agent@dakargp.sn" class="w-full px-3 py-2 text-xs border rounded-xl dark:bg-slate-800 dark:border-slate-700" />
        </div>

        <div class="flex items-center justify-end gap-3 pt-3">
          <button @click="showDirectCreateModal = false" class="px-4 py-2 text-xs font-bold text-gray-500 hover:bg-gray-100 rounded-xl">Annuler</button>
          <button @click="handleDirectCreate" :disabled="isSubmitting" class="px-5 py-2 bg-[#053754] text-white font-bold text-xs rounded-xl hover:bg-[#0284c7] cursor-pointer">
            {{ isSubmitting ? 'Création en cours...' : 'Créer l\'Agent GP' }}
          </button>
        </div>
      </div>
    </div>

    <!-- MODAL 2 : AFFICHAGE DES IDENTIFIANTS GÉNÉRÉS -->
    <div v-if="showCredentialsModal" class="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div class="bg-white dark:bg-slate-900 border border-emerald-500/30 rounded-3xl p-6 w-full max-w-md shadow-2xl space-y-4">
        <div class="text-center space-y-2">
          <span class="text-4xl">🎉</span>
          <h3 class="font-black text-lg text-emerald-600 dark:text-emerald-400">Agent GP créé avec succès !</h3>
          <p class="text-xs text-gray-500 dark:text-slate-400">
            Transmettez ces identifiants à l'agent pour sa première connexion.
          </p>
        </div>

        <div class="bg-gray-50 dark:bg-slate-800 p-4 rounded-2xl space-y-3 border border-gray-200 dark:border-slate-700 text-xs">
          <div class="flex justify-between border-b border-gray-200 dark:border-slate-700 pb-2">
            <span class="text-gray-500 font-semibold">Nom complet :</span>
            <span class="font-bold text-[#053754] dark:text-sky-300">{{ createdCredentials.prenom }} {{ createdCredentials.nom }}</span>
          </div>

          <div class="flex justify-between border-b border-gray-200 dark:border-slate-700 pb-2">
            <span class="text-gray-500 font-semibold">Matricule :</span>
            <span class="font-mono font-bold text-sky-600 dark:text-sky-400">{{ createdCredentials.matricule }}</span>
          </div>

          <div class="flex justify-between border-b border-gray-200 dark:border-slate-700 pb-2">
            <span class="text-gray-500 font-semibold">Téléphone :</span>
            <span class="font-mono font-bold text-gray-800 dark:text-slate-200">{{ createdCredentials.telephone }}</span>
          </div>

          <div class="p-3 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 rounded-xl space-y-1">
            <span class="text-[11px] font-bold text-emerald-800 dark:text-emerald-300 block">Mot de passe provisoire généré :</span>
            <div class="flex items-center justify-between">
              <span class="text-lg font-black font-mono text-emerald-700 dark:text-emerald-200">{{ createdCredentials.mot_de_passe }}</span>
              <button
                @click="copyText(createdCredentials.mot_de_passe)"
                class="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold rounded-lg cursor-pointer"
              >
                Copier
              </button>
            </div>
          </div>
        </div>

        <button
          @click="showCredentialsModal = false"
          class="w-full py-2.5 bg-[#053754] text-white font-bold text-xs rounded-xl hover:bg-[#0284c7] cursor-pointer"
        >
          Compris, Fermer
        </button>
      </div>
    </div>

    <!-- MODAL 3 : INVITATION WHATSAPP / EMAIL -->
    <div v-if="showInviteModal" class="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div class="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-3xl p-6 w-full max-w-md shadow-2xl space-y-4">
        <div class="flex items-center justify-between border-b border-gray-100 dark:border-slate-800 pb-3">
          <h3 class="font-extrabold text-base text-[#053754] dark:text-sky-300">Inviter un Agent GP</h3>
          <button @click="showInviteModal = false" class="text-gray-400 hover:text-gray-700">✕</button>
        </div>

        <!-- Canal selection -->
        <div class="grid grid-cols-2 gap-2">
          <button
            @click="inviteForm.canal = 'whatsapp'"
            :class="['py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer', inviteForm.canal === 'whatsapp' ? 'bg-emerald-600 text-white' : 'bg-gray-100 text-gray-600']"
          >
            <span>💬 WhatsApp</span>
          </button>
          <button
            @click="inviteForm.canal = 'email'"
            :class="['py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer', inviteForm.canal === 'email' ? 'bg-[#053754] text-white' : 'bg-gray-100 text-gray-600']"
          >
            <span>✉️ E-mail</span>
          </button>
        </div>

        <!-- WhatsApp Input -->
        <div v-if="inviteForm.canal === 'whatsapp'">
          <label class="block text-xs font-semibold mb-1">Numéro WhatsApp *</label>
          <CountryPhoneInput v-model="inviteForm.telephone" placeholder="77 555 44 33" />
        </div>

        <!-- Email Input -->
        <div v-else>
          <label class="block text-xs font-semibold mb-1">Adresse E-mail *</label>
          <input v-model="inviteForm.email" type="email" placeholder="agent@example.com" class="w-full px-3 py-2 text-xs border rounded-xl dark:bg-slate-800 dark:border-slate-700" />
        </div>

        <!-- Generated WhatsApp Link Banner -->
        <div v-if="generatedWhatsappLink" class="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-900 space-y-2">
          <p class="font-bold">✓ Lien d'invitation WhatsApp généré !</p>
          <a :href="generatedWhatsappLink" target="_blank" class="block py-2 bg-emerald-600 text-white text-center rounded-lg font-bold">
            Ouvrir dans WhatsApp Web / App →
          </a>
        </div>

        <div class="flex items-center justify-end gap-3 pt-2">
          <button @click="showInviteModal = false" class="px-4 py-2 text-xs font-bold text-gray-500 hover:bg-gray-100 rounded-xl">Fermer</button>
          <button @click="handleInvite" :disabled="isSubmitting" class="px-5 py-2 bg-emerald-600 text-white font-bold text-xs rounded-xl hover:bg-emerald-700 cursor-pointer">
            {{ isSubmitting ? 'Génération...' : 'Envoyer / Partager' }}
          </button>
        </div>
      </div>
    </div>

    <!-- MODAL 4 : CORBEILLE AGENTS -->
    <div v-if="showTrashModal" class="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div class="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-3xl p-6 w-full max-w-3xl shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
        <div class="flex items-center justify-between border-b border-gray-100 dark:border-slate-800 pb-3">
          <div class="flex items-center gap-2">
            <span class="text-xl">🗑️</span>
            <h3 class="font-extrabold text-base text-[#053754] dark:text-sky-300">Corbeille des Agents GP (Archives)</h3>
          </div>
          <button @click="showTrashModal = false" class="text-gray-400 hover:text-gray-700 text-lg cursor-pointer">✕</button>
        </div>

        <div v-if="isLoadingTrash" class="py-8 text-center space-y-2">
          <div class="w-7 h-7 border-3 border-[#053754] border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p class="text-xs text-gray-500 font-semibold">Chargement des archives...</p>
        </div>

        <div v-else-if="trashedAgents.length === 0" class="py-8 text-center text-gray-500 space-y-2">
          <span class="text-3xl block">✨</span>
          <p class="text-xs font-semibold">La corbeille est vide. Aucun agent archivé.</p>
        </div>

        <div v-else class="overflow-x-auto border border-gray-100 dark:border-slate-800 rounded-2xl">
          <table class="w-full text-left text-xs border-collapse">
            <thead>
              <tr class="bg-gray-50 dark:bg-slate-800 text-gray-500 dark:text-slate-400 uppercase font-extrabold text-[10px]">
                <th class="py-3 px-4">Agent</th>
                <th class="py-3 px-3">Matricule</th>
                <th class="py-3 px-3">Téléphone</th>
                <th class="py-3 px-3">Date de suppression</th>
                <th class="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100 dark:divide-slate-800 text-gray-700 dark:text-slate-200">
              <tr v-for="agent in trashedAgents" :key="agent.id" class="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                <td class="py-3 px-4 font-bold text-[#053754] dark:text-sky-300">
                  {{ agent.user?.prenom }} {{ agent.user?.nom }}
                </td>
                <td class="py-3 px-3 font-mono font-bold">{{ agent.matricule || 'N/A' }}</td>
                <td class="py-3 px-3">{{ agent.user?.telephone }}</td>
                <td class="py-3 px-3 text-gray-400 text-[11px]">
                  {{ agent.deleted_at ? new Date(agent.deleted_at).toLocaleString('fr-FR') : '—' }}
                </td>
                <td class="py-3 px-4 text-right">
                  <div class="flex items-center justify-end gap-2">
                    <button
                      @click="restoreAgent(agent)"
                      class="px-2.5 py-1 bg-emerald-100 hover:bg-emerald-200 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-bold rounded-lg transition text-[11px] cursor-pointer flex items-center gap-1"
                    >
                      <span>♻️</span>
                      <span>Restaurer</span>
                    </button>
                    <button
                      @click="forceDeleteAgent(agent)"
                      class="px-2 py-1 bg-red-50 hover:bg-red-100 text-red-700 font-bold rounded-lg transition text-[11px] cursor-pointer"
                      title="Supprimer définitivement"
                    >
                      ✕
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

  </div>
</template>
