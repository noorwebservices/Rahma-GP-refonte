<template>
  <div class="space-y-6">
    <!-- Top Header Banner -->
    <div class="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
      <div>
        <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 text-xs font-bold mb-2">
          <span>📊 Analyse Financière & performance</span>
        </div>
        <h2 class="text-2xl font-black text-[#053754] dark:text-slate-100 tracking-tight">Finances & Revenus de l'Entreprise</h2>
        <p class="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Suivez la rentabilité de vos voyages GP, les revenus générés et les commissions par agent.
        </p>
      </div>

      <!-- Time Filter Buttons -->
      <div class="flex items-center gap-1.5 p-1.5 bg-slate-100 dark:bg-slate-800 rounded-2xl">
        <button
          v-for="p in periodOptions"
          :key="p.id"
          @click="activePeriod = p.id"
          class="px-3 py-1.5 rounded-xl text-xs font-extrabold transition cursor-pointer"
          :class="activePeriod === p.id 
            ? 'bg-[#053754] text-white shadow-xs' 
            : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'"
        >
          {{ p.label }}
        </button>
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
        <div class="p-6 rounded-3xl bg-gradient-to-br from-[#053754] to-[#074C72] text-white shadow-md">
          <div class="flex items-center justify-between mb-3">
            <span class="text-xs font-bold text-sky-200">Chiffre d'Affaires Global</span>
            <span class="p-2 rounded-xl bg-white/10 text-white text-lg">💰</span>
          </div>
          <h3 class="text-2xl font-black tracking-tight">
            {{ formatAmount(revenusData.total_chiffre_affaires || 0) }}
          </h3>
          <p class="text-[11px] text-sky-200 mt-2 flex items-center gap-1">
            <span class="text-emerald-300 font-bold">↑ +14.2%</span> par rapport au mois dernier
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
            Revenu moyen par kilo / réservation
          </p>
        </div>
      </div>

      <!-- Breakdown by Agents & Routes -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- Top Agents GP Performance -->
        <div class="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <h3 class="text-base font-extrabold text-[#053754] dark:text-slate-100 mb-4 flex items-center justify-between">
            <span>🏆 Classement des Agents GP</span>
            <span class="text-xs font-bold text-slate-400">Revenus générés</span>
          </h3>

          <div v-if="!revenusData.par_agent || revenusData.par_agent.length === 0" class="py-8 text-center text-xs text-slate-400">
            Aucun agent n'a encore de réservations enregistrées.
          </div>

          <div v-else class="space-y-4">
            <div
              v-for="(agent, idx) in revenusData.par_agent"
              :key="agent.id"
              class="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between gap-4"
            >
              <div class="flex items-center gap-3">
                <span
                  class="w-7 h-7 rounded-full flex items-center justify-center text-xs font-black"
                  :class="idx === 0 ? 'bg-amber-400 text-amber-950' : idx === 1 ? 'bg-slate-300 text-slate-800' : 'bg-amber-700 text-white'"
                >
                  {{ idx + 1 }}
                </span>
                <div>
                  <h4 class="text-xs font-bold text-slate-900 dark:text-slate-100">
                    {{ agent.nom }} {{ agent.prenom }}
                  </h4>
                  <p class="text-[11px] text-slate-500 dark:text-slate-400">
                    {{ agent.nombre_voyages || 0 }} voyages • {{ agent.nombre_reservations || 0 }} réservations
                  </p>
                </div>
              </div>

              <div class="text-right">
                <p class="text-sm font-black text-[#053754] dark:text-sky-300">
                  {{ formatAmount(agent.chiffre_affaires || 0) }}
                </p>
                <span class="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                  Comm: {{ formatAmount(agent.commission || 0) }}
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- Revenue by Route / Trajet -->
        <div class="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <h3 class="text-base font-extrabold text-[#053754] dark:text-slate-100 mb-4 flex items-center justify-between">
            <span>📍 Revenus par Trajet Principal</span>
            <span class="text-xs font-bold text-slate-400">Axes les plus rentables</span>
          </h3>

          <div v-if="!revenusData.par_trajet || revenusData.par_trajet.length === 0" class="py-8 text-center text-xs text-slate-400">
            Aucune donnée de trajet disponible.
          </div>

          <div v-else class="space-y-4">
            <div
              v-for="route in revenusData.par_trajet"
              :key="route.trajet"
              class="space-y-1.5"
            >
              <div class="flex items-center justify-between text-xs font-bold">
                <span class="text-slate-800 dark:text-slate-200">✈️ {{ route.trajet }}</span>
                <span class="text-[#053754] dark:text-sky-300 font-black">{{ formatAmount(route.montant || 0) }}</span>
              </div>
              
              <!-- Progress Bar -->
              <div class="w-full h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div
                  class="h-full bg-gradient-to-r from-[#053754] to-sky-500 rounded-full transition-all duration-500"
                  :style="{ width: `${route.pourcentage || 45}%` }"
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import entrepriseService from '@/services/entrepriseService'
import { formatAmount } from '@/utils/currencyState'

const loading = ref(true)
const activePeriod = ref('mois')
const revenusData = ref({})

const periodOptions = [
  { id: 'semaine', label: '7 derniers jours' },
  { id: 'mois', label: 'Ce mois-ci' },
  { id: 'annee', label: 'Année 2026' }
]

const loadRevenus = async () => {
  loading.value = true
  try {
    const res = await entrepriseService.getRevenus()
    revenusData.value = res?.data ?? res ?? {}
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
