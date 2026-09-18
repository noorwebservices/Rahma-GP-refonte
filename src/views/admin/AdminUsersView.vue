<template>
  <div class="space-y-6">

    <!-- 2 Summary Cards: Clients & Voyageurs -->
    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <!-- Card Clients -->
      <div class="bg-white dark:bg-slate-900 border border-sky-200/70 dark:border-slate-800 rounded-3xl p-5 shadow-2xs flex items-center justify-between">
        <div>
          <span class="text-xs font-extrabold text-[#074C72] dark:text-sky-300 uppercase tracking-wider block">Total Clients (Uniquement)</span>
          <h3 class="text-2xl sm:text-3xl font-black text-[#053754] dark:text-white mt-1">{{ totalClientsCount }}</h3>
          <p class="text-[11px] font-medium text-gray-400 dark:text-gray-400">Comptes avec le rôle Client seulement</p>
        </div>
        <div class="w-12 h-12 rounded-2xl bg-sky-50 dark:bg-sky-950 text-[#074C72] dark:text-sky-300 flex items-center justify-center font-bold text-xl shrink-0 border border-sky-100 dark:border-sky-900">
          👤
        </div>
      </div>

      <!-- Card Voyageurs -->
      <div class="bg-white dark:bg-slate-900 border border-emerald-200/70 dark:border-slate-800 rounded-3xl p-5 shadow-2xs flex items-center justify-between">
        <div>
          <span class="text-xs font-extrabold text-emerald-800 dark:text-emerald-400 uppercase tracking-wider block">Total Voyageurs (GP)</span>
          <h3 class="text-2xl sm:text-3xl font-black text-emerald-950 dark:text-white mt-1">{{ totalVoyageursCount }}</h3>
          <p class="text-[11px] font-medium text-gray-400 dark:text-gray-400">Comptes avec le rôle Voyageur</p>
        </div>
        <div class="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 flex items-center justify-center font-bold text-xl shrink-0 border border-emerald-100 dark:border-emerald-900">
          ✈️
        </div>
      </div>
    </div>
    
    <!-- Header with 2 Tabs (Clients / Voyageurs) & Filters -->
    <div class="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-3xl p-5 shadow-2xs space-y-4">
      
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        
        <!-- Tab Selector: Clients / Voyageurs -->
        <div class="bg-[#FAF7F2] dark:bg-slate-800 p-1 rounded-2xl flex items-center border border-gray-200 dark:border-slate-700">
          <button
            @click="activeTab = 'client'; fetchUsers()"
            class="px-5 py-2.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer flex items-center gap-2"
            :class="activeTab === 'client' ? 'bg-[#053754] text-white shadow-2xs' : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'"
          >
            <span>👤</span>
            <span>Clients</span>
          </button>
          
          <button
            @click="activeTab = 'voyageur'; fetchUsers()"
            class="px-5 py-2.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer flex items-center gap-2"
            :class="activeTab === 'voyageur' ? 'bg-[#053754] text-white shadow-2xs' : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'"
          >
            <span>✈️</span>
            <span>Voyageurs</span>
          </button>
        </div>

        <!-- Search Input & Status Filter -->
        <div class="flex items-center gap-3 w-full sm:w-auto">
          <div class="relative flex-1 sm:w-72">
            <svg class="w-4 h-4 absolute left-3.5 top-3 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input 
              v-model="filters.search"
              @input="fetchUsers"
              type="text" 
              placeholder="Rechercher par nom, email, téléphone..."
              class="w-full bg-[#FAF7F2] dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-2xl pl-9 pr-4 py-2 text-xs text-gray-800 dark:text-slate-100 placeholder-gray-400 focus:outline-none focus:border-[#074C72]"
            />
          </div>

          <select v-model="filters.statut" @change="fetchUsers" class="bg-[#FAF7F2] dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-2xl px-3 py-2 text-xs font-bold text-[#053754] dark:text-sky-300 outline-none cursor-pointer">
            <option value="" class="dark:bg-slate-800 dark:text-slate-100">Tous Statuts</option>
            <option value="actif" class="dark:bg-slate-800 dark:text-slate-100">Actif</option>
            <option value="suspendu" class="dark:bg-slate-800 dark:text-slate-100">Bloqué</option>
          </select>
        </div>

      </div>

    </div>

    <!-- Table Container -->
    <div class="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-3xl shadow-2xs overflow-hidden">
      
      <!-- Loading State -->
      <div v-if="loading" class="p-12 text-center space-y-3">
        <div class="w-10 h-10 border-4 border-[#053754] dark:border-sky-400 border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p class="text-xs font-bold text-[#074C72] dark:text-sky-300">Chargement de la liste des {{ activeTab === 'client' ? 'clients' : 'voyageurs' }}...</p>
      </div>

      <!-- Empty State -->
      <div v-else-if="filteredUsers.length === 0" class="text-center py-16 text-gray-400 font-semibold text-sm">
        Aucun {{ activeTab === 'client' ? 'client' : 'voyageur' }} trouvé.
      </div>

      <div v-else class="overflow-x-auto">
        <table class="w-full min-w-[850px] text-left text-xs sm:text-sm">
          <thead class="bg-slate-50 dark:bg-slate-800/80 text-[#053754] dark:text-sky-300 uppercase tracking-wider font-extrabold border-b border-gray-200 dark:border-slate-800 text-[11px] whitespace-nowrap">
            <tr>
              <th class="px-6 py-4">Utilisateur</th>
              <th class="px-6 py-4">Contact</th>
              <th class="px-6 py-4">Dernière Connexion</th>
              <th class="px-6 py-4">Statut Compte</th>
              <th v-if="activeTab === 'voyageur'" class="px-6 py-4">Vérification KYC</th>
              <th class="px-6 py-4">Empreinte BD</th>
              <th class="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100 dark:divide-slate-800">
            <tr v-for="user in paginatedUsers" :key="user.id" class="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors">
              
              <!-- User Info -->
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center gap-3">
                  <div v-if="user.avatar" class="w-10 h-10 rounded-full overflow-hidden shrink-0 border border-gray-200 dark:border-slate-700">
                    <img :src="user.avatar" class="w-full h-full object-cover" />
                  </div>
                  <div v-else class="w-10 h-10 rounded-full bg-[#053754] text-white font-extrabold text-xs flex items-center justify-center shrink-0 border border-gray-200 dark:border-slate-700 shadow-2xs">
                    {{ getInitials(user.prenom, user.nom) }}
                  </div>
                  <div>
                    <p class="font-extrabold text-[#053754] dark:text-slate-100 text-xs sm:text-sm whitespace-nowrap">{{ user.prenom }} {{ user.nom }}</p>
                  </div>
                </div>
              </td>

              <!-- Contact -->
              <td class="px-6 py-4 font-medium text-xs whitespace-nowrap">
                <p class="text-[#074C72] dark:text-sky-300 font-bold whitespace-nowrap">{{ user.email || 'Email non renseigné' }}</p>
                <p class="text-gray-500 dark:text-gray-400 font-mono whitespace-nowrap">{{ user.telephone }}</p>
              </td>

              <!-- Dernière Connexion -->
              <td class="px-6 py-4 text-xs font-mono font-bold text-gray-500 dark:text-gray-400 whitespace-nowrap">
                {{ user.dernier_connexion ? formatDate(user.dernier_connexion) : 'Jamais' }}
              </td>

              <!-- Statut Compte -->
              <td class="px-6 py-4 whitespace-nowrap">
                <span class="px-3 py-1 rounded-full text-xs font-extrabold capitalize border whitespace-nowrap" :class="user.statut === 'actif' ? 'bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800' : 'bg-red-50 dark:bg-red-950/80 text-[#B50302] dark:text-red-400 border-red-200 dark:border-red-800'">
                  {{ user.statut === 'suspendu' ? 'Bloqué' : user.statut }}
                </span>
              </td>

              <!-- Vérification Voyageur (if voyageur tab) -->
              <td v-if="activeTab === 'voyageur'" class="px-6 py-4 whitespace-nowrap">
                <span v-if="user.voyageur" class="px-3 py-1 rounded-full text-xs font-extrabold capitalize border whitespace-nowrap" :class="getVoyageurStatutBadge(user.voyageur.statut)">
                  {{ user.voyageur.statut }}
                </span>
                <span v-else class="text-xs text-gray-400">-</span>
              </td>

              <!-- Données BD -->
              <td class="px-6 py-4 text-xs font-extrabold text-[#074C72] dark:text-sky-300 whitespace-nowrap">
                {{ user.capacite_donnees?.formatted || '0 Ko' }}
              </td>

              <!-- Actions -->
              <td class="px-6 py-4 text-right whitespace-nowrap">
                <div class="flex items-center justify-end gap-2">
                  
                  <!-- Dedicated User Details Page Button -->
                  <router-link 
                    :to="`/admin/users/${encodeId(user.id)}`" 
                    class="px-3 py-1.5 rounded-xl text-xs font-extrabold bg-[#053754] hover:bg-[#074C72] text-white transition-all shadow-xs flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
                  >
                    <span>👁️ Fiche Complète</span>
                  </router-link>

                  <!-- Block / Unblock Button -->
                  <button 
                    @click="toggleBlock(user)" 
                    :disabled="actionLoadingId === user.id"
                    class="px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer border whitespace-nowrap flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
                    :class="user.statut === 'suspendu' ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100' : 'bg-red-50 text-[#B50302] border-red-200 hover:bg-red-100'"
                  >
                    <span v-if="actionLoadingId === user.id" class="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin"></span>
                    <span>{{ user.statut === 'suspendu' ? 'Débloquer' : 'Bloquer' }}</span>
                  </button>

                </div>
              </td>

            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination Footer (5 items per page) -->
      <div v-if="totalPages > 1" class="p-4 border-t border-gray-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 flex items-center justify-between text-xs font-bold text-gray-600 dark:text-gray-300">
        <span>Page {{ currentPage }} sur {{ totalPages }} ({{ filteredUsers.length }} résultats)</span>

        <div class="flex items-center gap-1.5">
          <button 
            @click="currentPage > 1 && currentPage--" 
            :disabled="currentPage === 1"
            class="px-3 py-1.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-700 dark:text-slate-200 hover:bg-gray-100 dark:hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
          >
            ← Précédent
          </button>

          <button 
            v-for="p in totalPages" 
            :key="p" 
            @click="currentPage = p"
            class="w-8 h-8 rounded-xl border text-xs font-extrabold transition-colors cursor-pointer"
            :class="currentPage === p ? 'bg-[#053754] dark:bg-sky-600 text-white border-[#053754] dark:border-sky-600' : 'bg-white dark:bg-slate-800 text-gray-700 dark:text-gray-200 border-gray-200 dark:border-slate-700 hover:bg-gray-100 dark:hover:bg-slate-700'"
          >
            {{ p }}
          </button>

          <button 
            @click="currentPage < totalPages && currentPage++" 
            :disabled="currentPage === totalPages"
            class="px-3 py-1.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-700 dark:text-slate-200 hover:bg-gray-100 dark:hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
          >
            Suivant →
          </button>
        </div>
      </div>

    </div>

  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { adminService } from '@/services/adminService'
import { encodeId } from '@/utils/idMasker'
import Swal from 'sweetalert2'

const activeTab = ref('client') // 'client' | 'voyageur'
const users = ref([])
const loading = ref(true)
const actionLoadingId = ref(null)
const currentPage = ref(1)
const perPage = 5

const totalClientsCount = ref(0)
const totalVoyageursCount = ref(0)

const filters = reactive({
  search: '',
  statut: ''
})

const fetchStats = async () => {
  try {
    const res = await adminService.getDashboardStats()
    const d = res?.data?.data || res?.data || res
    if (d && d.users) {
      totalClientsCount.value = d.users.clients || 0
      totalVoyageursCount.value = d.users.voyageurs || 0
    }
  } catch (e) {
    console.error('Erreur fetch stats users:', e)
  }
}

onMounted(() => {
  fetchStats()
  fetchUsers()
})

const fetchUsers = async () => {
  loading.value = true
  currentPage.value = 1
  try {
    const res = await adminService.getUsers({
      ...filters,
      role: activeTab.value,
      per_page: 100
    })
    if (res && res.data) {
      users.value = res.data.data || []
    }
  } catch (err) {
    console.error('Erreur chargement liste utilisateurs:', err)
  } finally {
    loading.value = false
  }
}

// Filter out admin users from the display list!
const filteredUsers = computed(() => {
  return users.value.filter(u => {
    const roles = u.roles || []
    const isUserAdmin = Array.isArray(roles) 
      ? roles.some(r => (typeof r === 'string' ? r === 'admin' : r.name === 'admin'))
      : false
    return !isUserAdmin
  })
})

const totalPages = computed(() => {
  return Math.ceil(filteredUsers.value.length / perPage) || 1
})

const paginatedUsers = computed(() => {
  const start = (currentPage.value - 1) * perPage
  return filteredUsers.value.slice(start, start + perPage)
})

const getInitials = (prenom, nom) => {
  const p = (prenom || '').charAt(0).toUpperCase()
  const n = (nom || '').charAt(0).toUpperCase()
  return (p + n) || 'U'
}

const toggleBlock = async (user) => {
  if (actionLoadingId.value) return
  const isBlocking = user.statut !== 'suspendu'
  const nextStatut = isBlocking ? 'suspendu' : 'actif'

  const result = await Swal.fire({
    title: isBlocking ? 'Bloquer le compte' : 'Débloquer le compte',
    text: `Voulez-vous vraiment ${isBlocking ? 'bloquer' : 'débloquer'} le compte de ${user.prenom} ${user.nom} ?`,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: isBlocking ? '#B50302' : '#053754',
    cancelButtonColor: '#6B7280',
    confirmButtonText: 'Oui, confirmer',
    cancelButtonText: 'Annuler'
  })

  if (!result.isConfirmed) return

  actionLoadingId.value = user.id
  try {
    await adminService.toggleBlockUser(user.id, nextStatut)
    await Swal.fire({
      title: 'Succès !',
      text: `Le compte a été ${isBlocking ? 'bloqué' : 'débloqué'} avec succès.`,
      icon: 'success',
      confirmButtonColor: '#053754'
    })
    fetchUsers()
  } catch (err) {
    Swal.fire({
      title: 'Erreur',
      text: err.message || 'Erreur lors de la modification du statut',
      icon: 'error',
      confirmButtonColor: '#053754'
    })
  } finally {
    actionLoadingId.value = null
  }
}


const getVoyageurStatutBadge = (statut) => {
  if (statut === 'verifie') return 'bg-emerald-50 text-emerald-700 border-emerald-200'
  if (statut === 'refuse') return 'bg-red-50 text-[#B50302] border-red-200'
  return 'bg-amber-50 text-amber-700 border-amber-200'
}

const formatDate = (dateStr) => {
  if (!dateStr) return '-'
  return new Date(dateStr).toLocaleString('fr-FR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}
</script>
