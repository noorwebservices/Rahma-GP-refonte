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
          Visualisez et restaurez les entités ou sous-comptes de votre entreprise qui ont été supprimés temporairement.
        </p>
      </div>

      <button
        @click="loadTrash"
        class="px-4 py-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 transition cursor-pointer flex items-center gap-2"
      >
        <span>🔄 Actualiser</span>
      </button>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="py-16 text-center">
      <div class="w-10 h-10 border-4 border-[#053754] border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
      <p class="text-xs font-bold text-slate-500">Chargement des éléments supprimés...</p>
    </div>

    <!-- Empty State -->
    <div v-else-if="trashItems.length === 0" class="bg-white dark:bg-slate-900 rounded-3xl p-12 text-center border border-slate-200/80 dark:border-slate-800">
      <div class="w-16 h-16 rounded-full bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 flex items-center justify-center mx-auto mb-4 text-2xl">
        🌱
      </div>
      <h3 class="text-base font-bold text-slate-800 dark:text-slate-200">La corbeille est vide</h3>
      <p class="text-xs text-slate-500 max-w-md mx-auto mt-1">
        Aucun compte ni enregistrement supprimé n'a été trouvé. Les éléments désactivés ou supprimés apparaîtront ici pour restauration.
      </p>
    </div>

    <!-- Trash List Table -->
    <div v-else class="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 overflow-hidden shadow-xs">
      <div class="overflow-x-auto">
        <table class="w-full text-left text-xs">
          <thead class="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">
            <tr>
              <th class="px-6 py-4">Nom / Entité</th>
              <th class="px-6 py-4">Type</th>
              <th class="px-6 py-4">Date de Suppression</th>
              <th class="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-200 font-medium">
            <tr v-for="item in trashItems" :key="item.id" class="hover:bg-slate-50/60 dark:hover:bg-slate-800/50 transition">
              <td class="px-6 py-4 font-bold text-slate-900 dark:text-slate-100">
                {{ item.nom || item.name || 'Entreprise Archivée' }}
              </td>
              <td class="px-6 py-4">
                <span class="px-2.5 py-1 rounded-md bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 font-extrabold text-[10px]">
                  {{ item.type || 'Entreprise GP' }}
                </span>
              </td>
              <td class="px-6 py-4 text-slate-400">
                {{ item.deleted_at || 'Récemment' }}
              </td>
              <td class="px-6 py-4 text-right">
                <button
                  @click="restoreItem(item)"
                  :disabled="restoringId === item.id"
                  class="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition cursor-pointer disabled:opacity-50 inline-flex items-center gap-1.5"
                >
                  <span>♻️</span>
                  <span>{{ restoringId === item.id ? 'Restauration...' : 'Restaurer' }}</span>
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
import { ref, onMounted } from 'vue'
import entrepriseService from '@/services/entrepriseService'

const loading = ref(true)
const restoringId = ref(null)
const trashItems = ref([])

const loadTrash = async () => {
  loading.value = true
  try {
    const res = await entrepriseService.getTrash()
    trashItems.value = res?.data ?? res ?? []
  } catch (e) {
    console.error('Erreur chargement corbeille:', e)
  } finally {
    loading.value = false
  }
}

const restoreItem = async (item) => {
  if (!confirm(`Voulez-vous vraiment restaurer "${item.nom || item.name || 'cet élément'}" ?`)) return
  restoringId.value = item.id
  try {
    await entrepriseService.restoreEntreprise(item.id)
    alert('Élément restauré avec succès !')
    await loadTrash()
  } catch (e) {
    alert(e.response?.data?.message || 'Erreur lors de la restauration.')
  } finally {
    restoringId.value = null
  }
}

onMounted(() => {
  loadTrash()
})
</script>
