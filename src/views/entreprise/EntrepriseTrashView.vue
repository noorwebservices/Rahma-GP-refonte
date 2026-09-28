<template>
  <div class="space-y-6">
    <!-- Header Banner -->
    <div class="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
      <div>
        <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-100 dark:bg-rose-950/80 text-rose-800 dark:text-rose-300 text-xs font-bold mb-2">
          <span>🗑️ Restauration & Corbeille</span>
        </div>
        <h2 class="text-2xl font-black text-[#053754] dark:text-slate-100 tracking-tight">Corbeille de l'Entreprise</h2>
        <p class="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Visualisez, restaurez ou supprimez définitivement les comptes et agents GP temporairement supprimés.
        </p>
      </div>

      <button
        @click="loadTrash"
        :disabled="loading"
        class="px-4 py-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 transition cursor-pointer flex items-center gap-2 disabled:opacity-50"
      >
        <span :class="{ 'animate-spin': loading }">🔄</span>
        <span>Actualiser</span>
      </button>
    </div>

    <!-- Category Filter Tabs -->
    <div class="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
      <button
        v-for="tab in filterTabs"
        :key="tab.id"
        @click="selectedTab = tab.id"
        :class="[
          'px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2',
          selectedTab === tab.id
            ? 'bg-[#053754] text-white shadow-xs'
            : 'bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
        ]"
      >
        <span>{{ tab.icon }}</span>
        <span>{{ tab.label }}</span>
        <span
          class="px-2 py-0.5 rounded-full text-[10px] font-extrabold"
          :class="selectedTab === tab.id ? 'bg-white/20 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'"
        >
          {{ tab.count }}
        </span>
      </button>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="py-16 text-center">
      <div class="w-10 h-10 border-4 border-[#053754] border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
      <p class="text-xs font-bold text-slate-500 dark:text-slate-400">Chargement des éléments supprimés...</p>
    </div>

    <!-- Empty State -->
    <div v-else-if="filteredTrashItems.length === 0" class="bg-white dark:bg-slate-900 rounded-3xl p-12 text-center border border-slate-200/80 dark:border-slate-800">
      <div class="w-16 h-16 rounded-full bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto mb-4 text-2xl">
        🌱
      </div>
      <h3 class="text-base font-bold text-slate-800 dark:text-slate-200">La corbeille est vide</h3>
      <p class="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto mt-1">
        Aucun compte ni enregistrement supprimé n'a été trouvé. Les éléments retirés apparaîtront ici pour être restaurés ou supprimés définitivement.
      </p>
    </div>

    <!-- Trash List Table -->
    <div v-else class="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 overflow-hidden shadow-xs">
      <div class="overflow-x-auto">
        <table class="w-full text-left text-xs">
          <thead class="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">
            <tr>
              <th class="px-6 py-4">Nom / Entité</th>
              <th class="px-6 py-4">Contact / Détails</th>
              <th class="px-6 py-4">Type</th>
              <th class="px-6 py-4">Date de Suppression</th>
              <th class="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-200 font-medium">
            <tr v-for="item in filteredTrashItems" :key="`${item.item_type}-${item.id}`" class="hover:bg-slate-50/60 dark:hover:bg-slate-800/50 transition">
              <td class="px-6 py-4 font-bold text-slate-900 dark:text-slate-100">
                <div class="flex items-center gap-2">
                  <div class="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-sm font-black text-[#053754] dark:text-slate-300">
                    {{ item.name.charAt(0).toUpperCase() }}
                  </div>
                  <div>
                    <div class="font-bold text-slate-900 dark:text-slate-100">{{ item.name }}</div>
                    <div v-if="item.matricule" class="text-[10px] text-slate-400">Matricule: {{ item.matricule }}</div>
                  </div>
                </div>
              </td>

              <td class="px-6 py-4 text-slate-500 dark:text-slate-400">
                <div>{{ item.sub_text || '—' }}</div>
              </td>

              <td class="px-6 py-4">
                <span :class="['px-2.5 py-1 rounded-md font-extrabold text-[10px] border', item.badge_color]">
                  {{ item.type_label }}
                </span>
              </td>

              <td class="px-6 py-4 text-slate-400">
                {{ formatDate(item.deleted_at) }}
              </td>

              <td class="px-6 py-4 text-right space-x-2">
                <button
                  @click="restoreItem(item)"
                  :disabled="actionId === item.id"
                  class="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition cursor-pointer disabled:opacity-50 inline-flex items-center gap-1.5"
                  title="Restaurer cet élément"
                >
                  <span>♻️</span>
                  <span>{{ actionId === item.id && actionType === 'restore' ? 'Restauration...' : 'Restaurer' }}</span>
                </button>

                <button
                  v-if="item.item_type === 'agent'"
                  @click="forceDeleteItem(item)"
                  :disabled="actionId === item.id"
                  class="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-xs transition cursor-pointer disabled:opacity-50 inline-flex items-center gap-1.5"
                  title="Supprimer définitivement"
                >
                  <span>❌</span>
                  <span>{{ actionId === item.id && actionType === 'delete' ? 'Suppression...' : 'Supprimer' }}</span>
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import entrepriseService from '@/services/entrepriseService'
import Swal from 'sweetalert2'

const Toast = Swal.mixin({
  toast: true,
  position: 'top-end',
  showConfirmButton: false,
  timer: 3000,
  timerProgressBar: true
})

const loading = ref(true)
const actionId = ref(null)
const actionType = ref(null)
const trashItems = ref([])
const selectedTab = ref('all')

const loadTrash = async () => {
  loading.value = true
  trashItems.value = []

  try {
    const [agentsRes, entrepriseRes] = await Promise.allSettled([
      entrepriseService.getTrashedAgents(),
      entrepriseService.getTrash()
    ])

    const formattedItems = []

    // Process trashed agents
    if (agentsRes.status === 'fulfilled') {
      const agents = agentsRes.value?.data?.agents ?? agentsRes.value?.agents ?? []
      agents.forEach(a => {
        const u = a.user || {}
        const fullName = `${u.prenom || ''} ${u.nom || ''}`.trim() || u.name || `Agent GP #${a.id}`
        formattedItems.push({
          id: a.id,
          item_type: 'agent',
          name: fullName,
          sub_text: u.email || u.telephone || 'Aucun contact',
          matricule: a.matricule,
          type_label: 'Agent GP',
          badge_color: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800',
          deleted_at: a.deleted_at
        })
      })
    }

    // Process trashed entreprises (if any)
    if (entrepriseRes.status === 'fulfilled') {
      const list = entrepriseRes.value?.data?.data ?? entrepriseRes.value?.data ?? entrepriseRes.value ?? []
      if (Array.isArray(list)) {
        list.forEach(e => {
          formattedItems.push({
            id: e.id,
            item_type: 'entreprise',
            name: e.nom_entreprise || e.nom || 'Entreprise Archivée',
            sub_text: e.email || e.telephone || 'Aucun contact',
            matricule: null,
            type_label: 'Entreprise GP',
            badge_color: 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 border-rose-200 dark:border-rose-800',
            deleted_at: e.deleted_at
          })
        })
      }
    }

    trashItems.value = formattedItems
  } catch (e) {
    console.error('Erreur chargement corbeille:', e)
    Toast.fire({
      icon: 'error',
      title: 'Impossible de charger la corbeille.'
    })
  } finally {
    loading.value = false
  }
}

const filterTabs = computed(() => {
  const agentCount = trashItems.value.filter(i => i.item_type === 'agent').length
  const entrepriseCount = trashItems.value.filter(i => i.item_type === 'entreprise').length

  return [
    { id: 'all', label: 'Tous les éléments', icon: '📁', count: trashItems.value.length },
    { id: 'agent', label: 'Agents GP', icon: '👤', count: agentCount },
    { id: 'entreprise', label: 'Entreprises', icon: '🏢', count: entrepriseCount }
  ]
})

const filteredTrashItems = computed(() => {
  if (selectedTab.value === 'all') return trashItems.value
  return trashItems.value.filter(i => i.item_type === selectedTab.value)
})

const formatDate = (dateStr) => {
  if (!dateStr) return 'Récemment'
  try {
    const date = new Date(dateStr)
    return new Intl.DateTimeFormat('fr-FR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date)
  } catch {
    return dateStr
  }
}

const restoreItem = async (item) => {
  const confirmResult = await Swal.fire({
    title: 'Restaurer cet élément ?',
    text: `Voulez-vous vraiment restaurer "${item.name}" ? Il sera de nouveau actif dans votre système.`,
    icon: 'question',
    showCancelButton: true,
    confirmButtonColor: '#053754',
    cancelButtonColor: '#64748b',
    confirmButtonText: 'Oui, restaurer',
    cancelButtonText: 'Annuler'
  })

  if (!confirmResult.isConfirmed) return

  actionId.value = item.id
  actionType.value = 'restore'

  try {
    if (item.item_type === 'agent') {
      await entrepriseService.restoreAgent(item.id)
    } else {
      await entrepriseService.restoreEntreprise(item.id)
    }

    Toast.fire({
      icon: 'success',
      title: `"${item.name}" a été restauré(e) avec succès.`
    })
    await loadTrash()
  } catch (e) {
    const msg = e.response?.data?.message || 'Erreur lors de la restauration.'
    Swal.fire({
      icon: 'error',
      title: 'Échec de la restauration',
      text: msg,
      confirmButtonColor: '#053754'
    })
  } finally {
    actionId.value = null
    actionType.value = null
  }
}

const forceDeleteItem = async (item) => {
  const confirmResult = await Swal.fire({
    title: 'Supprimer définitivement ?',
    text: `Attention ! Cette action est définitive. "${item.name}" sera supprimé(e) sans possibilité de récupération.`,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#ef4444',
    cancelButtonColor: '#64748b',
    confirmButtonText: 'Oui, supprimer définitivement',
    cancelButtonText: 'Annuler'
  })

  if (!confirmResult.isConfirmed) return

  actionId.value = item.id
  actionType.value = 'delete'

  try {
    if (item.item_type === 'agent') {
      await entrepriseService.forceDeleteAgent(item.id)
    }

    Toast.fire({
      icon: 'success',
      title: `"${item.name}" a été supprimé(e) définitivement.`
    })
    await loadTrash()
  } catch (e) {
    const msg = e.response?.data?.message || 'Erreur lors de la suppression définitive.'
    Swal.fire({
      icon: 'error',
      title: 'Échec de la suppression',
      text: msg,
      confirmButtonColor: '#053754'
    })
  } finally {
    actionId.value = null
    actionType.value = null
  }
}

onMounted(() => {
  loadTrash()
})
</script>

