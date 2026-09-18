<template>
  <div class="space-y-6">
    
    <!-- Header & Filter Card -->
    <div class="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-3xl p-5 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h2 class="font-extrabold text-base sm:text-lg text-[#053754] dark:text-sky-300">Signalements de Comptes Utilisateurs</h2>
        <p class="text-xs text-gray-500 dark:text-slate-400 font-medium">Modérez les comptes dénoncés par les clients ou les voyageurs</p>
      </div>

      <select v-model="filterStatut" @change="fetchSignalements" class="w-full sm:w-auto bg-[#FAF7F2] dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-2xl px-4 py-2.5 text-xs font-bold text-[#053754] dark:text-slate-100 outline-none cursor-pointer">
        <option value="">Tous les Signalements</option>
        <option value="en_attente">En Attente de Traitement</option>
        <option value="traite">Traités</option>
        <option value="rejete">Rejetés / Sans suite</option>
      </select>
    </div>

    <!-- Table Container -->
    <div class="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-3xl shadow-2xs overflow-hidden">
      
      <!-- Loading State -->
      <div v-if="loading" class="p-12 text-center space-y-3">
        <div class="w-10 h-10 border-4 border-[#053754] dark:border-sky-400 border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p class="text-xs font-bold text-[#074C72] dark:text-sky-300">Chargement des signalements...</p>
      </div>

      <!-- Empty State -->
      <div v-else-if="signalements.length === 0" class="text-center py-16 text-gray-400 dark:text-slate-400 font-semibold text-sm">
        Aucun signalement trouvé.
      </div>

      <div v-else class="overflow-x-auto">
        <table class="w-full min-w-[850px] text-left text-xs sm:text-sm">
          <thead class="bg-slate-50 dark:bg-slate-800/80 text-[#053754] dark:text-sky-300 uppercase tracking-wider font-extrabold border-b border-gray-200 dark:border-slate-800 text-[11px] whitespace-nowrap">
            <tr>
              <th class="px-6 py-4">Compte Signalé</th>
              <th class="px-6 py-4">Signaleur</th>
              <th class="px-6 py-4">Motif & Description</th>
              <th class="px-6 py-4">Date</th>
              <th class="px-6 py-4">Statut</th>
              <th class="px-6 py-4 text-right">Décision / Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100 dark:divide-slate-800">
            <tr v-for="sig in paginatedSignalements" :key="sig.id" class="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors">
              
              <!-- Compte Signalé -->
              <td class="px-6 py-4 whitespace-nowrap">
                <div v-if="sig.signale" class="flex items-center gap-3">
                  <div v-if="sig.signale.avatar" class="w-10 h-10 rounded-full overflow-hidden shrink-0 border border-red-300">
                    <img :src="sig.signale.avatar" class="w-full h-full object-cover" />
                  </div>
                  <div v-else class="w-10 h-10 rounded-full bg-[#B50302] text-white font-extrabold text-xs flex items-center justify-center shrink-0 border border-red-300 shadow-2xs">
                    {{ getInitials(sig.signale.prenom, sig.signale.nom) }}
                  </div>
                  <div>
                    <p class="font-extrabold text-[#053754] dark:text-slate-100 text-xs sm:text-sm whitespace-nowrap">{{ sig.signale.prenom }} {{ sig.signale.nom }}</p>
                    <p class="text-xs text-gray-400 dark:text-slate-400 font-medium whitespace-nowrap">{{ sig.signale.email || sig.signale.telephone }}</p>
                  </div>
                </div>
                <span v-else class="text-gray-400 dark:text-slate-500">Inconnu</span>
              </td>

              <!-- Signaleur -->
              <td class="px-6 py-4 font-semibold text-gray-700 dark:text-slate-300 whitespace-nowrap">
                <div v-if="sig.signaleur" class="whitespace-nowrap">
                  {{ sig.signaleur.prenom }} {{ sig.signaleur.nom }}
                </div>
                <span v-else class="text-gray-400 dark:text-slate-500">Anonyme</span>
              </td>

              <!-- Motif & Description -->
              <td class="px-6 py-4 max-w-sm">
                <span class="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-red-50 dark:bg-red-950/80 text-[#B50302] dark:text-red-300 border border-red-200 dark:border-red-900 mb-1 whitespace-nowrap">
                  {{ sig.motif }}
                </span>
                <p class="text-xs text-gray-600 dark:text-slate-300 line-clamp-2 font-medium">{{ sig.description || 'Aucune description fournie.' }}</p>
              </td>

              <!-- Date -->
              <td class="px-6 py-4 text-xs font-mono font-bold text-gray-500 dark:text-slate-400 whitespace-nowrap">
                {{ formatDate(sig.created_at) }}
              </td>

              <!-- Statut -->
              <td class="px-6 py-4 whitespace-nowrap">
                <span class="px-3 py-1 rounded-full text-xs font-extrabold capitalize border whitespace-nowrap" :class="getStatutBadge(sig.statut)">
                  {{ sig.statut }}
                </span>
              </td>

              <!-- Actions -->
              <td class="px-6 py-4 text-right whitespace-nowrap">
                <div class="flex items-center justify-end gap-2">
                  <button 
                    v-if="sig.signale?.statut !== 'suspendu'"
                    @click="processSignalement(sig, 'traite', 'bloque')" 
                    :disabled="actionLoadingId === sig.id"
                    class="px-3 py-1.5 rounded-xl text-xs font-extrabold bg-[#B50302] hover:bg-[#870202] text-white transition-all shadow-xs cursor-pointer whitespace-nowrap flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Bloquer immédiatement le compte signalé"
                  >
                    <span v-if="actionLoadingId === sig.id" class="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    <span>Bloquer le Compte</span>
                  </button>

                  <button 
                    v-if="sig.statut === 'en_attente'"
                    @click="processSignalement(sig, 'traite', 'avertissement')" 
                    :disabled="actionLoadingId === sig.id"
                    class="px-3 py-1.5 rounded-xl text-xs font-extrabold bg-[#053754] hover:bg-[#074C72] dark:bg-sky-600 dark:hover:bg-sky-500 text-white transition-all shadow-xs cursor-pointer whitespace-nowrap flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span v-if="actionLoadingId === sig.id" class="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    <span>Marquer Traité</span>
                  </button>

                  <button 
                    v-if="sig.statut === 'en_attente'"
                    @click="processSignalement(sig, 'rejete', 'sans_suite')" 
                    :disabled="actionLoadingId === sig.id"
                    class="px-3 py-1.5 rounded-xl text-xs font-extrabold bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 text-gray-700 dark:text-slate-200 transition-all border border-gray-200 dark:border-slate-700 cursor-pointer whitespace-nowrap flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span v-if="actionLoadingId === sig.id" class="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin"></span>
                    <span>Rejeter</span>
                  </button>

                  <span v-if="sig.statut !== 'en_attente' && sig.signale?.statut === 'suspendu'" class="text-[11px] font-extrabold text-red-700 dark:text-red-300 bg-red-50 dark:bg-red-950/80 border border-red-200 dark:border-red-900 px-3 py-1 rounded-full whitespace-nowrap">
                    Compte Bloqué & Traité
                  </span>
                  <span v-else-if="sig.statut === 'traite'" class="text-[11px] font-extrabold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-200 dark:border-emerald-800 px-3 py-1 rounded-full whitespace-nowrap">
                    Signalement Traité
                  </span>
                  <span v-else-if="sig.statut === 'rejete'" class="text-[11px] font-extrabold text-gray-500 dark:text-slate-400 bg-gray-100 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 px-3 py-1 rounded-full whitespace-nowrap">
                    Rejeté / Sans suite
                  </span>
                </div>
              </td>


            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination Footer (5 items per page) -->
      <div v-if="totalPages > 1" class="p-4 border-t border-gray-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 flex items-center justify-between text-xs font-bold text-gray-600 dark:text-slate-300">
        <span>Page {{ currentPage }} sur {{ totalPages }} ({{ signalements.length }} signalements)</span>

        <div class="flex items-center gap-1.5">
          <button 
            @click="currentPage > 1 && currentPage--" 
            :disabled="currentPage === 1"
            class="px-3 py-1.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-gray-700 dark:text-slate-200 hover:bg-gray-100 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
          >
            ← Précédent
          </button>

          <button 
            v-for="p in totalPages" 
            :key="p" 
            @click="currentPage = p"
            class="w-8 h-8 rounded-xl border text-xs font-extrabold transition-colors cursor-pointer"
            :class="currentPage === p ? 'bg-[#053754] dark:bg-sky-500 text-white dark:text-slate-950 border-[#053754] dark:border-sky-500' : 'bg-white dark:bg-slate-900 text-gray-700 dark:text-slate-200 border-gray-200 dark:border-slate-700 hover:bg-gray-100 dark:hover:bg-slate-800'"
          >
            {{ p }}
          </button>

          <button 
            @click="currentPage < totalPages && currentPage++" 
            :disabled="currentPage === totalPages"
            class="px-3 py-1.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-gray-700 dark:text-slate-200 hover:bg-gray-100 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
          >
            Suivant →
          </button>
        </div>
      </div>

    </div>

  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { adminService } from '@/services/adminService'
import Swal from 'sweetalert2'

const signalements = ref([])
const loading = ref(true)
const actionLoadingId = ref(null)
const filterStatut = ref('')
const currentPage = ref(1)
const perPage = 5

onMounted(() => {
  fetchSignalements()
})

const fetchSignalements = async () => {
  loading.value = true
  currentPage.value = 1
  try {
    const res = await adminService.getSignalements({ statut: filterStatut.value, per_page: 100 })
    if (res && res.data) {
      signalements.value = res.data.data || []
    }
  } catch (err) {
    console.error('Erreur chargement signalements:', err)
  } finally {
    loading.value = false
  }
}

const totalPages = computed(() => {
  return Math.ceil(signalements.value.length / perPage) || 1
})

const paginatedSignalements = computed(() => {
  const start = (currentPage.value - 1) * perPage
  return signalements.value.slice(start, start + perPage)
})

const getInitials = (prenom, nom) => {
  const p = (prenom || '').charAt(0).toUpperCase()
  const n = (nom || '').charAt(0).toUpperCase()
  return (p + n) || 'S'
}

const processSignalement = async (sig, statut, decision) => {
  if (actionLoadingId.value) return
  let title = 'Traitement du signalement'
  let text = 'Que souhaitez-vous faire pour ce signalement ?'
  let icon = 'question'

  if (decision === 'bloque') {
    title = 'Bloquer le compte'
    text = `Voulez-vous vraiment bloquer le compte de ${sig.signale?.prenom || ''} ${sig.signale?.nom || ''} ?`
    icon = 'warning'
  } else if (decision === 'avertissement') {
    title = 'Marquer comme Traité'
    text = `Confirmer la prise en charge de ce signalement ?`
    icon = 'info'
  } else if (decision === 'sans_suite') {
    title = 'Rejeter le signalement'
    text = `Marquer ce signalement comme sans suite ?`
    icon = 'question'
  }

  const result = await Swal.fire({
    title,
    text,
    icon,
    showCancelButton: true,
    confirmButtonColor: decision === 'bloque' ? '#B50302' : '#053754',
    cancelButtonColor: '#6B7280',
    confirmButtonText: 'Oui, confirmer',
    cancelButtonText: 'Annuler'
  })

  if (!result.isConfirmed) return

  actionLoadingId.value = sig.id
  try {
    await adminService.updateSignalementStatut(sig.id, statut, decision)
    await Swal.fire('Succès !', 'Le signalement a été mis à jour avec succès.', 'success')
    fetchSignalements()
  } catch (err) {
    Swal.fire('Erreur', err.message || 'Erreur lors de la mise à jour', 'error')
  } finally {
    actionLoadingId.value = null
  }
}


const getStatutBadge = (statut) => {
  if (statut === 'traite') return 'bg-emerald-50 text-emerald-700 border-emerald-200'
  if (statut === 'rejete') return 'bg-gray-100 text-[#053754] border-gray-200'
  return 'bg-amber-50 text-amber-700 border-amber-200'
}

const formatDate = (dateStr) => {
  if (!dateStr) return '-'
  return new Date(dateStr).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })
}
</script>
