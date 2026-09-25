<template>
  <div class="space-y-6">
    <!-- Header Banner -->
    <div class="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
      <div>
        <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-100 dark:bg-indigo-950/80 text-indigo-800 dark:text-indigo-300 text-xs font-bold mb-2">
          <span>📜 Traçabilité & Conformité</span>
        </div>
        <h2 class="text-2xl font-black text-[#053754] dark:text-slate-100 tracking-tight">Journal d'Activités & Audit</h2>
        <p class="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Historique détaillé de toutes les opérations effectuées par le gérant et les agents de votre entreprise.
        </p>
      </div>

      <!-- Quick Search & Filters -->
      <div class="flex flex-wrap items-center gap-2 w-full md:w-auto">
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Rechercher action, agent..."
          class="px-4 py-2 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#053754]"
        />
        <select
          v-model="selectedCategory"
          class="px-4 py-2 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#053754]"
        >
          <option value="tous">Toutes les catégories</option>
          <option value="agent">Agents GP</option>
          <option value="voyage">Voyages</option>
          <option value="auth">Connexions</option>
          <option value="modification">Modifications</option>
        </select>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="py-16 text-center">
      <div class="w-10 h-10 border-4 border-[#053754] border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
      <p class="text-xs font-bold text-slate-500">Chargement de l'historique d'activités...</p>
    </div>

    <!-- Empty State -->
    <div v-else-if="filteredActivites.length === 0" class="bg-white dark:bg-slate-900 rounded-3xl p-12 text-center border border-slate-200/80 dark:border-slate-800">
      <div class="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center mx-auto mb-4 text-2xl">
        🔍
      </div>
      <h3 class="text-base font-bold text-slate-800 dark:text-slate-200">Aucune activité enregistrée</h3>
      <p class="text-xs text-slate-500 max-w-md mx-auto mt-1">
        Les actions réalisées sur votre compte entreprise apparaîtront automatiquement ici dans le fil d'audit.
      </p>
    </div>

    <!-- Activity Timeline List -->
    <div v-else class="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-6">
      <div class="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200 dark:before:bg-slate-800">
        <div
          v-for="act in paginatedActivites"
          :key="act.id || act.created_at"
          class="relative flex items-start justify-between gap-4 group"
        >
          <!-- Timeline Indicator Icon -->
          <div
            class="absolute -left-6 top-1 w-5 h-5 rounded-full border-2 border-white dark:border-slate-900 flex items-center justify-center text-[10px] font-bold shadow-xs"
            :class="getActionBadgeClass(act.action)"
          >
            {{ getActionIcon(act.action) }}
          </div>

          <div class="space-y-1 overflow-hidden">
            <div class="flex items-center gap-2 flex-wrap">
              <span class="text-xs font-extrabold text-slate-900 dark:text-slate-100">
                {{ act.titre || act.action }}
              </span>
              <span
                class="px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider"
                :class="getCategoryPillClass(act.categorie || act.action)"
              >
                {{ act.categorie || 'SYSTEME' }}
              </span>
            </div>

            <p class="text-xs text-slate-600 dark:text-slate-300">
              {{ act.description || 'Action réalisée sur le compte entreprise' }}
            </p>

            <div class="flex items-center gap-3 text-[11px] text-slate-400 dark:text-slate-500">
              <span>👤 Effectué par: <strong class="text-slate-700 dark:text-slate-300 font-semibold">{{ act.user ? (act.user.prenom + ' ' + act.user.nom) : (act.auteur_nom || 'Gérant') }}</strong></span>
              <span v-if="act.ip_address">• IP: {{ act.ip_address }}</span>
            </div>
          </div>

          <!-- Timestamp -->
          <div class="text-right whitespace-nowrap shrink-0">
            <span class="text-[11px] font-bold text-slate-400">
              {{ act.created_at ? new Date(act.created_at).toLocaleString('fr-FR', { dateStyle: 'short', timeStyle: 'short' }) : 'Récemment' }}
            </span>
          </div>
        </div>
      </div>

      <!-- Pagination Controls -->
      <div v-if="totalPages > 1" class="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-slate-100 dark:border-slate-800 text-xs">
        <div class="text-slate-500 dark:text-slate-400 font-medium">
          Affichage de <span class="font-bold text-slate-800 dark:text-slate-200">{{ (currentPage - 1) * itemsPerPage + 1 }}</span>
          à <span class="font-bold text-slate-800 dark:text-slate-200">{{ Math.min(currentPage * itemsPerPage, filteredActivites.length) }}</span>
          sur <span class="font-bold text-[#053754] dark:text-sky-300">{{ filteredActivites.length }}</span> activités
        </div>

        <div class="flex items-center gap-2">
          <button
            @click="prevPage"
            :disabled="currentPage === 1"
            class="px-3.5 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 font-bold text-slate-700 dark:text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 dark:hover:bg-slate-800 transition cursor-pointer shadow-2xs"
          >
            ◄ Précédent
          </button>

          <div class="flex items-center gap-1">
            <template v-for="(p, index) in visiblePages" :key="index">
              <span v-if="p === '...'" class="px-1.5 py-1 text-slate-400 dark:text-slate-500 font-extrabold select-none text-xs">...</span>
              <button
                v-else
                @click="currentPage = p"
                :class="[
                  'w-7 h-7 rounded-xl font-extrabold text-xs transition cursor-pointer flex items-center justify-center',
                  currentPage === p ? 'bg-[#053754] text-white shadow-xs' : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100'
                ]"
              >
                {{ p }}
              </button>
            </template>
          </div>

          <button
            @click="nextPage"
            :disabled="currentPage === totalPages"
            class="px-3.5 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 font-bold text-slate-700 dark:text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 dark:hover:bg-slate-800 transition cursor-pointer shadow-2xs"
          >
            Suivant ►
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { entrepriseService } from '@/services/entrepriseService'

const loading = ref(true)
const searchQuery = ref('')
const selectedCategory = ref('tous')
const activites = ref([])

// Pagination state
const currentPage = ref(1)
const itemsPerPage = ref(10)

watch([searchQuery, selectedCategory], () => {
  currentPage.value = 1
})

const loadActivites = async () => {
  loading.value = true
  try {
    const res = await entrepriseService.getActivites()
    const rawList = res?.activites?.data || res?.activites || res?.data?.activites || res?.data || (Array.isArray(res) ? res : [])
    activites.value = Array.isArray(rawList) ? rawList : []
  } catch (e) {
    console.error('Erreur chargement activites:', e)
    activites.value = []
  } finally {
    loading.value = false
  }
}

const filteredActivites = computed(() => {
  const list = Array.isArray(activites.value) ? activites.value : []
  return list.filter(act => {
    if (!act) return false
    const matchSearch = !searchQuery.value || 
      act.description?.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      act.action?.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      act.titre?.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      act.user?.nom?.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      act.auteur_nom?.toLowerCase().includes(searchQuery.value.toLowerCase())

    const matchCat = selectedCategory.value === 'tous' || 
      act.categorie?.toLowerCase() === selectedCategory.value ||
      act.action?.toLowerCase().includes(selectedCategory.value)

    return matchSearch && matchCat
  })
})

const totalPages = computed(() => {
  return Math.ceil(filteredActivites.value.length / itemsPerPage.value) || 1
})

const paginatedActivites = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value
  return filteredActivites.value.slice(start, start + itemsPerPage.value)
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

const getActionIcon = (action = '') => {
  const a = String(action).toLowerCase()
  if (a.includes('agent')) return '👥'
  if (a.includes('voyage')) return '✈️'
  if (a.includes('login') || a.includes('auth')) return '🔐'
  if (a.includes('suppr') || a.includes('delete')) return '🗑️'
  return '⚡'
}

const getActionBadgeClass = (action = '') => {
  const a = String(action).toLowerCase()
  if (a.includes('suppr') || a.includes('delete')) return 'bg-rose-500 text-white'
  if (a.includes('agent')) return 'bg-sky-500 text-white'
  if (a.includes('voyage')) return 'bg-indigo-500 text-white'
  return 'bg-emerald-500 text-white'
}

const getCategoryPillClass = (cat = '') => {
  const c = String(cat).toLowerCase()
  if (c.includes('agent')) return 'bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300'
  if (c.includes('voyage')) return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300'
  if (c.includes('delete')) return 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
  return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
}

onMounted(() => {
  loadActivites()
})
</script>
