<script setup>
import { ref, computed, onMounted } from 'vue'
import { fetchMyEvaluations } from '@/services/evaluationService'
import { formatVoyageDate } from '@/utils/flagHelper'

const isLoading = ref(true)
const errorMsg = ref('')
const rawEvaluations = ref([])

const currentPage = ref(1)
const itemsPerPage = 20

const loadEvaluations = async () => {
  isLoading.value = true
  errorMsg.value = ''
  try {
    const res = await fetchMyEvaluations()
    if (res) {
      const items = Array.isArray(res.data) ? res.data : (res.data?.data || (Array.isArray(res) ? res : []))
      rawEvaluations.value = items.map(e => {
        const author = e.evaluateur || {}
        const name = `${author.prenom || ''} ${author.nom || ''}`.trim() || 'Client Rahma'
        return {
          id: e.id,
          clientName: name,
          avatar: name.slice(0, 2).toUpperCase(),
          date: formatVoyageDate(e.created_at),
          note: Number(e.note) || 0,
          commentaire: e.commentaire || 'Aucun commentaire rédigé.'
        }
      })
    }
  } catch (err) {
    errorMsg.value = err?.message || 'Erreur lors du chargement de vos évaluations.'
  } finally {
    isLoading.value = false
  }
}

onMounted(loadEvaluations)

const totalReviews = computed(() => rawEvaluations.value.length)

const averageRating = computed(() => {
  if (totalReviews.value === 0) return '0.0'
  const sum = rawEvaluations.value.reduce((acc, curr) => acc + curr.note, 0)
  return (sum / totalReviews.value).toFixed(1)
})

const totalPages = computed(() => Math.ceil(rawEvaluations.value.length / itemsPerPage) || 1)

const paginatedEvaluations = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage
  return rawEvaluations.value.slice(start, start + itemsPerPage)
})
</script>

<template>
  <div class="space-y-6 pb-16">
    <!-- Header Title -->
    <div class="space-y-1">
      <h1 class="text-xl sm:text-2xl font-serif font-bold text-principal-dark dark:text-sky-300">Avis & Évaluations</h1>
      <p class="text-xs sm:text-sm text-gray-500 dark:text-slate-400">Consultez les notes et avis déposés par vos clients</p>
    </div>

    <!-- Loading State -->
    <div v-if="isLoading" class="bg-white dark:bg-slate-900 rounded-3xl p-12 text-center border border-gray-100 dark:border-slate-800 shadow-sm space-y-4">
      <div class="w-10 h-10 border-4 border-[#053754] dark:border-sky-400 border-t-transparent rounded-full animate-spin mx-auto"></div>
      <p class="text-sm font-bold text-gray-600 dark:text-slate-300">Chargement de vos avis...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="errorMsg" class="bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 rounded-3xl p-8 text-center space-y-3">
      <p class="text-sm font-bold text-red-800 dark:text-red-300">{{ errorMsg }}</p>
      <button @click="loadEvaluations" class="px-4 py-2 bg-red-600 text-white font-bold text-xs rounded-xl cursor-pointer">Réessayer</button>
    </div>

    <template v-else>
      <!-- Rating Summary Banner Card -->
      <div class="bg-[#053754] dark:bg-slate-900 text-white rounded-3xl p-6 shadow-md flex flex-col sm:flex-row items-center justify-between gap-6 dark:border dark:border-slate-800">
        <div class="text-center sm:text-left space-y-1">
          <span class="text-xs text-sky-200 dark:text-sky-300 uppercase font-extrabold tracking-wider">Note globale Voyageur</span>
          <div class="flex items-center justify-center sm:justify-start gap-3">
            <span class="text-4xl sm:text-5xl font-black text-amber-400">{{ averageRating }}</span>
            <div class="space-y-0.5">
              <div class="text-amber-400 text-lg">
                {{ totalReviews > 0 ? '⭐'.repeat(Math.max(1, Math.round(Number(averageRating)))) : '⭐ (Aucune note)' }}
              </div>
              <p class="text-xs text-sky-200 dark:text-slate-400 font-semibold">Basé sur {{ totalReviews }} avis vérifiés</p>
            </div>
          </div>
        </div>

        <div class="bg-white/10 dark:bg-slate-800/80 backdrop-blur-md p-4 rounded-2xl border border-white/10 dark:border-slate-700 text-xs space-y-1.5 w-full sm:max-w-xs text-sky-100 dark:text-slate-200">
          <div class="flex items-center justify-between">
            <span>Notes reçues</span>
            <span class="font-extrabold text-amber-300 text-sm">{{ totalReviews }} évaluations</span>
          </div>
          <div class="flex items-center justify-between text-[11px] text-sky-200 dark:text-slate-400">
            <span>Moyenne générale</span>
            <span class="font-bold text-white dark:text-slate-100">{{ averageRating }} / 5</span>
          </div>
        </div>
      </div>

      <!-- Reviews Grid List (2 items per row on md: screens) -->
      <div class="space-y-4">
        <h3 class="text-base font-extrabold text-[#053754] dark:text-sky-300 flex items-center justify-between">
          <span>Avis des clients ({{ totalReviews }})</span>
        </h3>

        <div v-if="rawEvaluations.length > 0" class="space-y-4">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div
              v-for="evalItem in paginatedEvaluations"
              :key="evalItem.id"
              class="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-gray-200 dark:border-slate-800 shadow-2xs space-y-3 flex flex-col justify-between"
            >
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-3">
                  <div class="w-10 h-10 rounded-full bg-[#B50302] dark:bg-red-700 text-white font-extrabold text-xs flex items-center justify-center">
                    {{ evalItem.avatar }}
                  </div>
                  <div>
                    <h4 class="text-sm font-extrabold text-gray-900 dark:text-slate-100">{{ evalItem.clientName }}</h4>
                    <p class="text-[11px] text-gray-400 dark:text-slate-400 font-medium">{{ evalItem.date }}</p>
                  </div>
                </div>

                <div class="text-amber-500 font-bold text-sm">
                  {{ evalItem.note > 0 ? '⭐'.repeat(evalItem.note) : 'Non noté' }}
                </div>
              </div>

              <p class="text-xs sm:text-sm text-gray-600 dark:text-slate-200 leading-relaxed italic bg-gray-50 dark:bg-slate-800/80 p-3 rounded-xl border border-gray-100 dark:border-slate-700 flex-1">
                "{{ evalItem.commentaire }}"
              </p>
            </div>
          </div>

          <!-- Pagination Bar (20 per page) -->
          <div v-if="totalPages > 1" class="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-slate-800">
            <button
              @click="currentPage = Math.max(1, currentPage - 1)"
              :disabled="currentPage === 1"
              class="px-4 py-2 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-xl text-xs font-bold text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-800 disabled:opacity-40 cursor-pointer shadow-2xs"
            >
              ← Précédent
            </button>
            <span class="text-xs font-bold text-gray-600 dark:text-slate-400">Page {{ currentPage }} sur {{ totalPages }}</span>
            <button
              @click="currentPage = Math.min(totalPages, currentPage + 1)"
              :disabled="currentPage === totalPages"
              class="px-4 py-2 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-xl text-xs font-bold text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-800 disabled:opacity-40 cursor-pointer shadow-2xs"
            >
              Suivant →
            </button>
          </div>
        </div>

        <!-- Empty State -->
        <div v-else class="bg-white dark:bg-slate-900 rounded-3xl p-10 text-center border border-gray-200 dark:border-slate-800 space-y-2">
          <div class="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-400 flex items-center justify-center text-xl mx-auto font-bold">
            ⭐
          </div>
          <p class="text-sm font-bold text-gray-700 dark:text-slate-200">Aucune évaluation enregistrée pour le moment.</p>
          <p class="text-xs text-gray-400 dark:text-slate-400">Les avis déposés par vos clients apparaîtront ici.</p>
        </div>
      </div>
    </template>
  </div>
</template>
