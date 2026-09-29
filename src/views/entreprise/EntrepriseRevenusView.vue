<template>
  <div class="space-y-6">
    <!-- Top Header Banner -->
    <div class="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
      <div>
        <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 text-xs font-bold mb-2">
          <span>📊 Analyse Financière & Performance</span>
        </div>
        <h2 class="text-2xl font-black text-[#053754] dark:text-slate-100 tracking-tight">Finances & Revenus de l'Entreprise</h2>
        <p class="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Suivez la rentabilité de vos voyages GP, les revenus générés et les commissions par agent.
        </p>
      </div>

      <!-- Time Filter Buttons -->
      <div class="flex flex-col items-end gap-2 w-full md:w-auto">
        <div class="flex flex-wrap items-center gap-1.5 p-1.5 bg-slate-100 dark:bg-slate-800 rounded-2xl w-full md:w-auto">
          <button
            v-for="p in periodOptions"
            :key="p.id"
            @click="selectPeriod(p.id)"
            class="px-3 py-1.5 rounded-xl text-xs font-extrabold transition cursor-pointer"
            :class="activePeriod === p.id 
              ? 'bg-[#053754] text-white shadow-xs dark:bg-sky-600' 
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'"
          >
            {{ p.label }}
          </button>
        </div>

        <!-- Custom Date Range Inputs -->
        <div v-if="activePeriod === 'personnalise'" class="flex items-center gap-2 p-2 bg-slate-50 dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700 text-xs w-full sm:w-auto mt-1">
          <div class="flex items-center gap-1">
            <span class="text-slate-400 font-bold">Du:</span>
            <input
              v-model="customDateStart"
              type="date"
              class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-2.5 py-1 text-xs text-slate-800 dark:text-slate-200 outline-none font-bold"
            />
          </div>
          <div class="flex items-center gap-1">
            <span class="text-slate-400 font-bold">Au:</span>
            <input
              v-model="customDateEnd"
              type="date"
              class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-2.5 py-1 text-xs text-slate-800 dark:text-slate-200 outline-none font-bold"
            />
          </div>
          <button
            @click="loadRevenus"
            class="px-3 py-1 bg-[#053754] hover:bg-[#074C72] dark:bg-sky-600 dark:hover:bg-sky-500 text-white font-extrabold rounded-xl transition cursor-pointer"
          >
            Filtrer
          </button>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="py-16 text-center">
      <div class="w-10 h-10 border-4 border-[#053754] border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
      <p class="text-xs font-bold text-slate-500">Chargement des données financières...</p>
    </div>

    <template v-else>
      <!-- KPI Financial Summary Cards -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <!-- Chiffre d'Affaires Global -->
        <div class="p-6 rounded-3xl bg-linear-to-br from-[#053754] to-[#074C72] text-white shadow-md">
          <div class="flex items-center justify-between mb-3">
            <span class="text-xs font-bold text-sky-200">Chiffre d'Affaires Global</span>
            <span class="p-2 rounded-xl bg-white/10 text-white text-lg">💰</span>
          </div>
          <h3 class="text-2xl font-black tracking-tight">
            {{ formatAmount(revenusData.total_chiffre_affaires || 0) }}
          </h3>
          <p class="text-[11px] text-sky-200 mt-2 flex items-center gap-1">
            <span class="text-emerald-300 font-bold">↑ Cumul</span> sur la période sélectionnée
          </p>
        </div>

        <!-- Reservations Validées -->
        <div class="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <div class="flex items-center justify-between mb-3">
            <span class="text-xs font-bold text-slate-500 dark:text-slate-400">Réservations Confirmées</span>
            <span class="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950 text-emerald-600 text-lg">📦</span>
          </div>
          <h3 class="text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
            {{ revenusData.total_reservations || 0 }}
          </h3>
          <p class="text-[11px] text-slate-500 dark:text-slate-400 mt-2">
            Colis expédiés avec succès
          </p>
        </div>

        <!-- Total Voyages GP -->
        <div class="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <div class="flex items-center justify-between mb-3">
            <span class="text-xs font-bold text-slate-500 dark:text-slate-400">Voyages Effectués</span>
            <span class="p-2 rounded-xl bg-sky-50 dark:bg-sky-950 text-[#053754] dark:text-sky-300 text-lg">✈️</span>
          </div>
          <h3 class="text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
            {{ revenusData.total_voyages || 0 }}
          </h3>
          <p class="text-[11px] text-slate-500 dark:text-slate-400 mt-2">
            Voyages d'entreprise programmés
          </p>
        </div>

        <!-- Panier Moyen par Colis -->
        <div class="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <div class="flex items-center justify-between mb-3">
            <span class="text-xs font-bold text-slate-500 dark:text-slate-400">Panier Moyen / Colis</span>
            <span class="p-2 rounded-xl bg-amber-50 dark:bg-amber-950 text-amber-600 text-lg">🏷️</span>
          </div>
          <h3 class="text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
            {{ formatAmount(revenusData.panier_moyen || 0) }}
          </h3>
          <p class="text-[11px] text-slate-500 dark:text-slate-400 mt-2">
            Revenu moyen par réservation
          </p>
        </div>
      </div>

      <!-- Breakdown by Agents & Routes -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- Top Agents GP Performance (Sorted & Paginated) -->
        <div class="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col justify-between">
          <div>
            <div class="flex items-center justify-between mb-4 border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 class="text-base font-extrabold text-[#053754] dark:text-slate-100 flex items-center gap-2">
                <span>🏆</span>
                <span>Classement des Agents GP</span>
              </h3>
              <span class="text-xs font-bold text-slate-400">Trié par Revenu</span>
            </div>

            <div v-if="sortedAgents.length === 0" class="py-12 text-center text-xs text-slate-400 font-medium">
              Aucun agent n'a encore de réservations enregistrées pour cette période.
            </div>

            <div v-else class="space-y-3">
              <div
                v-for="(agent, idx) in paginatedAgents"
                :key="agent.id"
                class="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between gap-4 transition hover:border-[#053754]/30"
              >
                <div class="flex items-center gap-3">
                  <span
                    class="w-7 h-7 rounded-full flex items-center justify-center text-xs font-black shrink-0"
                    :class="((agentCurrentPage - 1) * agentPerPage + idx) === 0 ? 'bg-amber-400 text-amber-950' : (((agentCurrentPage - 1) * agentPerPage + idx) === 1 ? 'bg-slate-300 text-slate-800' : 'bg-[#053754] text-white dark:bg-sky-600')"
                  >
                    {{ (agentCurrentPage - 1) * agentPerPage + idx + 1 }}
                  </span>
                  <div>
                    <h4 class="text-xs font-bold text-slate-900 dark:text-slate-100 leading-tight">
                      {{ agent.nom }} {{ agent.prenom }}
                    </h4>
                    <p class="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                      {{ agent.nombre_voyages || 0 }} voyages • {{ agent.nombre_reservations || 0 }} réservations
                    </p>
                  </div>
                </div>

                <div class="text-right">
                  <p class="text-sm font-black text-[#053754] dark:text-sky-300">
                    {{ formatAmount(agent.chiffre_affaires || 0) }}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <!-- Pagination Controls for Agents -->
          <div v-if="totalAgentPages > 1" class="flex items-center justify-between pt-4 mt-4 border-t border-slate-100 dark:border-slate-800 text-xs">
            <span class="text-slate-400 font-medium">Page {{ agentCurrentPage }} / {{ totalAgentPages }}</span>
            <div class="flex items-center gap-2">
              <button
                @click="agentCurrentPage = Math.max(1, agentCurrentPage - 1)"
                :disabled="agentCurrentPage === 1"
                class="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold rounded-xl disabled:opacity-40 cursor-pointer"
              >
                ← Précédent
              </button>
              <button
                @click="agentCurrentPage = Math.min(totalAgentPages, agentCurrentPage + 1)"
                :disabled="agentCurrentPage === totalAgentPages"
                class="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold rounded-xl disabled:opacity-40 cursor-pointer"
              >
                Suivant →
              </button>
            </div>
          </div>
        </div>

        <!-- Revenue by Route / Trajet (Paginated) -->
        <div class="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col justify-between">
          <div>
            <div class="flex items-center justify-between mb-4 border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 class="text-base font-extrabold text-[#053754] dark:text-slate-100 flex items-center gap-2">
                <span>📍</span>
                <span>Revenus par Trajet Principal</span>
              </h3>
              <span class="text-xs font-bold text-slate-400">Axes les plus rentables</span>
            </div>

            <div v-if="!revenusData.par_trajet || revenusData.par_trajet.length === 0" class="py-12 text-center text-xs text-slate-400 font-medium">
              Aucune donnée de trajet disponible pour cette période.
            </div>

            <div v-else class="space-y-4">
              <div
                v-for="route in paginatedRoutes"
                :key="route.trajet"
                class="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200/50 dark:border-slate-700/50 space-y-2"
              >
                <div class="flex items-center justify-between text-xs font-extrabold">
                  <span class="text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                    <span class="text-red-500">✈️</span>
                    <span>{{ route.trajet }}</span>
                  </span>
                  <span class="text-[#053754] dark:text-sky-300 font-black text-sm">{{ formatAmount(route.montant || 0) }}</span>
                </div>
                
                <!-- Progress Bar -->
                <div class="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                  <div
                    class="h-full bg-linear-to-r from-[#053754] to-sky-500 rounded-full transition-all duration-500"
                    :style="{ width: `${route.pourcentage || 0}%` }"
                  ></div>
                </div>
                <div class="flex justify-end text-[10px] text-slate-400 font-bold">
                  {{ route.pourcentage || 0 }}% du chiffre d'affaires
                </div>
              </div>
            </div>
          </div>

          <!-- Pagination Controls for Routes -->
          <div v-if="totalRoutePages > 1" class="flex items-center justify-between pt-4 mt-4 border-t border-slate-100 dark:border-slate-800 text-xs">
            <span class="text-slate-400 font-medium">Page {{ routeCurrentPage }} / {{ totalRoutePages }}</span>
            <div class="flex items-center gap-2">
              <button
                @click="routeCurrentPage = Math.max(1, routeCurrentPage - 1)"
                :disabled="routeCurrentPage === 1"
                class="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold rounded-xl disabled:opacity-40 cursor-pointer"
              >
                ← Précédent
              </button>
              <button
                @click="routeCurrentPage = Math.min(totalRoutePages, routeCurrentPage + 1)"
                :disabled="routeCurrentPage === totalRoutePages"
                class="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold rounded-xl disabled:opacity-40 cursor-pointer"
              >
                Suivant →
              </button>
            </div>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import entrepriseService from '@/services/entrepriseService'
import { formatAmount } from '@/utils/currencyState'

const loading = ref(true)
const activePeriod = ref('mois')
const customDateStart = ref('')
const customDateEnd = ref('')
const revenusData = ref({})

const periodOptions = [
  { id: 'aujourdhui', label: 'Aujourd\'hui' },
  { id: 'hier', label: 'Hier' },
  { id: 'semaine', label: '7 derniers jours' },
  { id: 'mois', label: 'Ce mois-ci' },
  { id: 'annee', label: 'Année 2026' },
  { id: 'personnalise', label: 'Période personnalisée' }
]

// Pagination state
const agentCurrentPage = ref(1)
const agentPerPage = 4

const routeCurrentPage = ref(1)
const routePerPage = 4

const selectPeriod = (periodId) => {
  activePeriod.value = periodId
  if (periodId !== 'personnalise') {
    loadRevenus()
  }
}

const sortedAgents = computed(() => {
  const list = revenusData.value.par_agent || []
  return [...list].sort((a, b) => Number(b.chiffre_affaires || 0) - Number(a.chiffre_affaires || 0))
})

const totalAgentPages = computed(() => {
  return Math.ceil(sortedAgents.value.length / agentPerPage) || 1
})

const paginatedAgents = computed(() => {
  const start = (agentCurrentPage.value - 1) * agentPerPage
  return sortedAgents.value.slice(start, start + agentPerPage)
})

const totalRoutePages = computed(() => {
  const list = revenusData.value.par_trajet || []
  return Math.ceil(list.length / routePerPage) || 1
})

const paginatedRoutes = computed(() => {
  const list = revenusData.value.par_trajet || []
  const start = (routeCurrentPage.value - 1) * routePerPage
  return list.slice(start, start + routePerPage)
})

const loadRevenus = async () => {
  loading.value = true
  agentCurrentPage.value = 1
  routeCurrentPage.value = 1

  try {
    const params = {
      periode: activePeriod.value
    }
    if (activePeriod.value === 'personnalise' && customDateStart.value && customDateEnd.value) {
      params.date_debut = customDateStart.value
      params.date_fin = customDateEnd.value
    }

    const res = await entrepriseService.getRevenus(params)
    revenusData.value = res?.data ?? res?.revenus ?? res ?? {}
  } catch (e) {
    console.error('Erreur chargement revenus:', e)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadRevenus()
})
</script>
