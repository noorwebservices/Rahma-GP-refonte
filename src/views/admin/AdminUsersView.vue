<template>
  <div class="space-y-6">
    
    <!-- Header with 2 Tabs (Clients / Voyageurs) & Filters -->
    <div class="bg-white border border-gray-200 rounded-3xl p-5 shadow-2xs space-y-4">
      
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        
        <!-- Tab Selector: Clients / Voyageurs -->
        <div class="bg-[#FAF7F2] p-1 rounded-2xl flex items-center border border-gray-200">
          <button
            @click="activeTab = 'client'; fetchUsers()"
            class="px-5 py-2.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer flex items-center gap-2"
            :class="activeTab === 'client' ? 'bg-[#053754] text-white shadow-2xs' : 'text-gray-600 hover:text-gray-900'"
          >
            <span>👤</span>
            <span>Clients</span>
          </button>
          
          <button
            @click="activeTab = 'voyageur'; fetchUsers()"
            class="px-5 py-2.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer flex items-center gap-2"
            :class="activeTab === 'voyageur' ? 'bg-[#053754] text-white shadow-2xs' : 'text-gray-600 hover:text-gray-900'"
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
              class="w-full bg-[#FAF7F2] border border-gray-200 rounded-2xl pl-9 pr-4 py-2 text-xs text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#074C72]"
            />
          </div>

          <select v-model="filters.statut" @change="fetchUsers" class="bg-[#FAF7F2] border border-gray-200 rounded-2xl px-3 py-2 text-xs font-bold text-[#053754] outline-none cursor-pointer">
            <option value="">Tous Statuts</option>
            <option value="actif">Actif</option>
            <option value="suspendu">Bloqué</option>
          </select>
        </div>

      </div>

    </div>

    <!-- Table Container -->
    <div class="bg-white border border-gray-200 rounded-3xl shadow-2xs overflow-hidden">
      
      <!-- Loading State -->
      <div v-if="loading" class="p-12 text-center space-y-3">
        <div class="w-10 h-10 border-4 border-[#053754] border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p class="text-xs font-bold text-[#074C72]">Chargement de la liste des {{ activeTab === 'client' ? 'clients' : 'voyageurs' }}...</p>
      </div>

      <!-- Empty State -->
      <div v-else-if="filteredUsers.length === 0" class="text-center py-16 text-gray-400 font-semibold text-sm">
        Aucun {{ activeTab === 'client' ? 'client' : 'voyageur' }} trouvé.
      </div>

      <div v-else class="overflow-x-auto">
        <table class="w-full min-w-[850px] text-left text-xs sm:text-sm">
          <thead class="bg-slate-50 text-[#053754] uppercase tracking-wider font-extrabold border-b border-gray-200 text-[11px] whitespace-nowrap">
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
          <tbody class="divide-y divide-gray-100">
            <tr v-for="user in paginatedUsers" :key="user.id" class="hover:bg-slate-50/80 transition-colors">
              
              <!-- User Info -->
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center gap-3">
                  <div v-if="user.avatar" class="w-10 h-10 rounded-full overflow-hidden shrink-0 border border-gray-200">
                    <img :src="user.avatar" class="w-full h-full object-cover" />
                  </div>
                  <div v-else class="w-10 h-10 rounded-full bg-[#053754] text-white font-extrabold text-xs flex items-center justify-center shrink-0 border border-gray-200 shadow-2xs">
                    {{ getInitials(user.prenom, user.nom) }}
                  </div>
                  <div>
                    <p class="font-extrabold text-[#053754] text-xs sm:text-sm whitespace-nowrap">{{ user.prenom }} {{ user.nom }}</p>
                  </div>
                </div>
              </td>

              <!-- Contact -->
              <td class="px-6 py-4 font-medium text-xs whitespace-nowrap">
                <p class="text-[#074C72] font-bold whitespace-nowrap">{{ user.email || 'Email non renseigné' }}</p>
                <p class="text-gray-500 font-mono whitespace-nowrap">{{ user.telephone }}</p>
              </td>

              <!-- Dernière Connexion -->
              <td class="px-6 py-4 text-xs font-mono font-bold text-gray-500 whitespace-nowrap">
                {{ user.dernier_connexion ? formatDate(user.dernier_connexion) : 'Jamais' }}
              </td>

              <!-- Statut Compte -->
              <td class="px-6 py-4 whitespace-nowrap">
                <span class="px-3 py-1 rounded-full text-xs font-extrabold capitalize border whitespace-nowrap" :class="user.statut === 'actif' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-red-50 text-[#B50302] border-red-200'">
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
              <td class="px-6 py-4 text-xs font-extrabold text-[#074C72] whitespace-nowrap">
                {{ user.capacite_donnees?.formatted || '0 Ko' }}
              </td>

              <!-- Actions -->
              <td class="px-6 py-4 text-right whitespace-nowrap">
                <div class="flex items-center justify-end gap-2">
                  
                  <!-- Dedicated User Details Page Button -->
                  <router-link 
                    :to="`/admin/users/${user.id}`" 
                    class="px-3 py-1.5 rounded-xl text-xs font-extrabold bg-[#053754] hover:bg-[#074C72] text-white transition-all shadow-xs flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
                  >
                    <span>👁️ Fiche Complète</span>
                  </router-link>

                  <!-- Block / Unblock Button -->
                  <button 
                    @click="toggleBlock(user)" 
                    class="px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer border whitespace-nowrap"
                    :class="user.statut === 'suspendu' ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100' : 'bg-red-50 text-[#B50302] border-red-200 hover:bg-red-100'"
                  >
                    {{ user.statut === 'suspendu' ? 'Débloquer' : 'Bloquer' }}
                  </button>

                </div>
              </td>

            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination Footer (5 items per page) -->
      <div v-if="totalPages > 1" class="p-4 border-t border-gray-100 bg-slate-50 flex items-center justify-between text-xs font-bold text-gray-600">
        <span>Page {{ currentPage }} sur {{ totalPages }} ({{ filteredUsers.length }} résultats)</span>

        <div class="flex items-center gap-1.5">
          <button 
            @click="currentPage > 1 && currentPage--" 
            :disabled="currentPage === 1"
            class="px-3 py-1.5 rounded-xl border border-gray-200 bg-white hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
          >
            ← Précédent
          </button>

          <button 
            v-for="p in totalPages" 
            :key="p" 
            @click="currentPage = p"
            class="w-8 h-8 rounded-xl border text-xs font-extrabold transition-colors cursor-pointer"
            :class="currentPage === p ? 'bg-[#053754] text-white border-[#053754]' : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-100'"
          >
            {{ p }}
          </button>

          <button 
            @click="currentPage < totalPages && currentPage++" 
            :disabled="currentPage === totalPages"
            class="px-3 py-1.5 rounded-xl border border-gray-200 bg-white hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
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
import Swal from 'sweetalert2'

const activeTab = ref('client') // 'client' | 'voyageur'
const users = ref([])
const loading = ref(true)
const currentPage = ref(1)
const perPage = 5

const filters = reactive({
  search: '',
  statut: ''
})

onMounted(() => {
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
