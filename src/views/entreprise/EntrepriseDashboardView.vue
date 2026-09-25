<script setup>
import { ref, computed, onMounted } from 'vue'
import { entrepriseService } from '@/services/entrepriseService'
import { formatCurrency } from '@/utils/currencyState'
import { useTheme } from '@/composables/useTheme'
import VueApexCharts from 'vue3-apexcharts'

const { isDark } = useTheme()

const isLoading = ref(true)
const dashboard = ref(null)
const error = ref('')

const chartTheme = computed(() => (isDark.value ? 'dark' : 'light'))

onMounted(async () => {
  try {
    const res = await entrepriseService.getDashboard()
    dashboard.value = res.dashboard
  } catch (err) {
    console.error('Erreur chargement dashboard:', err)
    error.value = 'Impossible de charger le tableau de bord entreprise.'
  } finally {
    isLoading.value = false
  }
})

// ---- Graphique 1 : Voyages ----
const voyagesSeries = computed(() => {
  const a = dashboard.value?.activite
  if (!a) return [0, 0, 0]
  return [Number(a.a_venir || 0), Number(a.en_cours || 0), Number(a.termines || 0)]
})

const voyagesOptions = computed(() => ({
  chart: { type: 'donut', background: 'transparent', fontFamily: 'inherit' },
  theme: { mode: chartTheme.value },
  labels: ['À venir', 'En cours', 'Terminés'],
  colors: ['#0ea5e9', '#f59e0b', '#10b981'],
  legend: { position: 'bottom', labels: { colors: isDark.value ? '#cbd5e1' : '#475569' } },
  dataLabels: {
    enabled: true,
    formatter: (val, opts) => {
      const v = opts.w.globals.series[opts.seriesIndex]
      return v > 0 ? `${v}` : ''
    }
  },
  stroke: { width: 2, colors: [isDark.value ? '#0f172a' : '#ffffff'] },
  noData: {
    text: 'Aucune donnée voyage',
    align: 'center',
    verticalAlign: 'middle',
    style: { color: isDark.value ? '#94a3b8' : '#64748b', fontSize: '12px' }
  },
  plotOptions: {
    pie: {
      donut: {
        size: '68%',
        labels: {
          show: true,
          total: {
            show: true,
            label: 'Total Voyages',
            color: isDark.value ? '#94a3b8' : '#64748b',
            formatter: () => `${dashboard.value?.activite?.total_voyages || 0}`
          }
        }
      }
    }
  }
}))

// ---- Graphique 2 : Colis ----
const colisSeries = computed(() => {
  const c = dashboard.value?.colis
  if (!c) return [0, 0, 0]
  return [Number(c.en_attente || 0), Number(c.en_transit || 0), Number(c.livres || 0)]
})

const colisOptions = computed(() => ({
  chart: { type: 'donut', background: 'transparent', fontFamily: 'inherit' },
  theme: { mode: chartTheme.value },
  labels: ['En attente', 'En transit', 'Livrés'],
  colors: ['#f59e0b', '#3b82f6', '#10b981'],
  legend: { position: 'bottom', labels: { colors: isDark.value ? '#cbd5e1' : '#475569' } },
  dataLabels: {
    enabled: true,
    formatter: (val, opts) => {
      const v = opts.w.globals.series[opts.seriesIndex]
      return v > 0 ? `${v}` : ''
    }
  },
  stroke: { width: 2, colors: [isDark.value ? '#0f172a' : '#ffffff'] },
  noData: {
    text: 'Aucun colis',
    align: 'center',
    verticalAlign: 'middle',
    style: { color: isDark.value ? '#94a3b8' : '#64748b', fontSize: '12px' }
  },
  plotOptions: {
    pie: {
      donut: {
        size: '68%',
        labels: {
          show: true,
          total: {
            show: true,
            label: 'Total Colis',
            color: isDark.value ? '#94a3b8' : '#64748b',
            formatter: () => `${dashboard.value?.colis?.total_colis || 0}`
          }
        }
      }
    }
  }
}))

// ---- Graphique 3 : Agents GP ----
const agentsSeries = computed(() => {
  const ag = dashboard.value?.agents
  return [{
    name: 'Nombre d\'agents',
    data: [Number(ag?.actifs || 0), Number(ag?.en_voyage || 0), Number(ag?.indisponibles || 0)]
  }]
})

const agentsOptions = computed(() => ({
  chart: { type: 'bar', toolbar: { show: false }, background: 'transparent', fontFamily: 'inherit' },
  theme: { mode: chartTheme.value },
  colors: ['#10b981', '#0ea5e9', '#94a3b8'],
  plotOptions: { bar: { borderRadius: 8, columnWidth: '48%', distributed: true } },
  dataLabels: { enabled: true, style: { colors: ['#ffffff'], fontWeight: 'bold' } },
  legend: { show: false },
  grid: { borderColor: isDark.value ? '#1e293b' : '#f1f5f9', strokeDashArray: 4 },
  xaxis: {
    categories: ['Actifs', 'En voyage', 'Indisponibles'],
    labels: { style: { colors: isDark.value ? '#94a3b8' : '#64748b', fontWeight: 'bold' } }
  },
  yaxis: { labels: { formatter: (val) => Math.round(val) } }
}))

// ---- Graphique 4 : Réservations ----
const reservationsSeries = computed(() => {
  const r = dashboard.value?.reservations
  return [{
    name: 'Réservations',
    data: [Number(r?.en_attente || 0), Number(r?.confirmees || 0), Number(r?.annulees || 0)]
  }]
})

const reservationsOptions = computed(() => ({
  chart: { type: 'bar', toolbar: { show: false }, background: 'transparent', fontFamily: 'inherit' },
  theme: { mode: chartTheme.value },
  colors: ['#f59e0b', '#10b981', '#ef4444'],
  plotOptions: { bar: { borderRadius: 8, columnWidth: '48%', distributed: true } },
  dataLabels: { enabled: true, style: { colors: ['#ffffff'], fontWeight: 'bold' } },
  legend: { show: false },
  grid: { borderColor: isDark.value ? '#1e293b' : '#f1f5f9', strokeDashArray: 4 },
  xaxis: {
    categories: ['En attente', 'Confirmées', 'Annulées'],
    labels: { style: { colors: isDark.value ? '#94a3b8' : '#64748b', fontWeight: 'bold' } }
  },
  yaxis: { labels: { formatter: (val) => Math.round(val) } }
}))
</script>

<template>
  <div class="space-y-6">
    
    <!-- Top Welcome Banner -->
    <div class="bg-linear-to-r from-[#053754] to-[#074C72] text-white p-6 sm:p-8 rounded-3xl shadow-lg relative overflow-hidden">
      <div class="relative z-10 space-y-2">
        <span class="px-3 py-1 bg-white/20 backdrop-blur-xs text-white text-xs font-black rounded-full uppercase tracking-wider">
          Compte Entreprise GP
        </span>
        <h1 class="text-2xl sm:text-3xl font-serif font-bold">
          Tableau de Bord de l'Entreprise
        </h1>
        <p class="text-xs sm:text-sm text-sky-100 max-w-2xl">
          Suivez l'activité de vos agents, gérez l'affectation de vos trajets et contrôlez la rentabilité de vos livraisons.
        </p>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="isLoading" class="py-12 text-center space-y-3">
      <div class="w-10 h-10 border-4 border-[#053754] border-t-transparent rounded-full animate-spin mx-auto"></div>
      <p class="text-xs font-bold text-gray-500">Chargement des données analytiques...</p>
    </div>

    <!-- Error -->
    <div v-else-if="error" class="p-4 bg-red-50 text-red-700 rounded-2xl text-xs sm:text-sm font-semibold">
      {{ error }}
    </div>

    <div v-else class="space-y-6">
      
      <!-- Financial Overview Cards (Maintenues en cartes comme demandé) -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <!-- Revenus Jour -->
        <div class="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 p-5 rounded-3xl shadow-2xs space-y-2">
          <div class="flex items-center justify-between text-gray-400">
            <span class="text-xs font-extrabold uppercase tracking-wider text-gray-500">Revenus du Jour</span>
            <span class="p-2 bg-emerald-50 text-emerald-600 rounded-xl">💰</span>
          </div>
          <p class="text-2xl font-black text-[#053754] dark:text-sky-300">
            {{ formatCurrency(dashboard?.finances?.revenus_jour || 0) }}
          </p>
          <span class="text-[11px] text-emerald-600 font-semibold">Recettes enregistrées aujourd'hui</span>
        </div>

        <!-- Revenus Mois -->
        <div class="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 p-5 rounded-3xl shadow-2xs space-y-2">
          <div class="flex items-center justify-between text-gray-400">
            <span class="text-xs font-extrabold uppercase tracking-wider text-gray-500">Revenus du Mois</span>
            <span class="p-2 bg-sky-50 text-sky-600 rounded-xl">📊</span>
          </div>
          <p class="text-2xl font-black text-[#053754] dark:text-sky-300">
            {{ formatCurrency(dashboard?.finances?.revenus_mois || 0) }}
          </p>
          <span class="text-[11px] text-sky-600 font-semibold">Total cumulé ce mois-ci</span>
        </div>

        <!-- Total Encaissé -->
        <div class="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 p-5 rounded-3xl shadow-2xs space-y-2">
          <div class="flex items-center justify-between text-gray-400">
            <span class="text-xs font-extrabold uppercase tracking-wider text-gray-500">Total Encaissé</span>
            <span class="p-2 bg-indigo-50 text-indigo-600 rounded-xl">🏦</span>
          </div>
          <p class="text-2xl font-black text-[#053754] dark:text-sky-300">
            {{ formatCurrency(dashboard?.finances?.total_encaisse || 0) }}
          </p>
          <span class="text-[11px] text-indigo-600 font-semibold">Total des paiements validés</span>
        </div>

        <!-- Paiements en attente -->
        <div class="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 p-5 rounded-3xl shadow-2xs space-y-2">
          <div class="flex items-center justify-between text-gray-400">
            <span class="text-xs font-extrabold uppercase tracking-wider text-gray-500">En Attente</span>
            <span class="p-2 bg-amber-50 text-amber-600 rounded-xl">⏳</span>
          </div>
          <p class="text-2xl font-black text-amber-600 dark:text-amber-400">
            {{ formatCurrency(dashboard?.finances?.paiements_en_attente || 0) }}
          </p>
          <span class="text-[11px] text-amber-600 font-semibold">Montants à encaisser</span>
        </div>

      </div>

      <!-- Section des Graphiques Analytiques (Transformée en graphiques interactifs ApexCharts) -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        <!-- Graphique 1 : Voyages Entreprise -->
        <div class="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 p-6 rounded-3xl shadow-2xs space-y-4">
          <div class="flex items-center justify-between border-b border-gray-100 dark:border-slate-800 pb-3">
            <div>
              <h3 class="font-extrabold text-sm text-[#053754] dark:text-sky-300 flex items-center gap-2">
                <span>✈️</span>
                <span>Statut des Voyages Entreprise</span>
              </h3>
              <p class="text-xs text-gray-400 dark:text-slate-400">Répartition par état de disponibilité</p>
            </div>
            <span class="text-xs font-black bg-sky-100 dark:bg-sky-950 text-sky-800 dark:text-sky-300 px-3 py-1 rounded-full">
              {{ dashboard?.activite?.total_voyages || 0 }} au total
            </span>
          </div>

          <div class="pt-2">
            <VueApexCharts type="donut" height="260" :options="voyagesOptions" :series="voyagesSeries" />
          </div>

          <div class="pt-2 border-t border-gray-100 dark:border-slate-800 flex justify-between items-center text-xs">
            <span class="text-gray-400">À venir : <strong class="text-sky-600 font-bold">{{ dashboard?.activite?.a_venir || 0 }}</strong></span>
            <span class="text-gray-400">En cours : <strong class="text-amber-600 font-bold">{{ dashboard?.activite?.en_cours || 0 }}</strong></span>
            <router-link to="/entreprise/voyages" class="font-bold text-[#053754] dark:text-sky-300 hover:underline">
              Gérer les voyages →
            </router-link>
          </div>
        </div>

        <!-- Graphique 2 : Colis Pris en Charge -->
        <div class="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 p-6 rounded-3xl shadow-2xs space-y-4">
          <div class="flex items-center justify-between border-b border-gray-100 dark:border-slate-800 pb-3">
            <div>
              <h3 class="font-extrabold text-sm text-[#053754] dark:text-sky-300 flex items-center gap-2">
                <span>📦</span>
                <span>État & Suivi des Colis</span>
              </h3>
              <p class="text-xs text-gray-400 dark:text-slate-400">Progression des livraisons en cours</p>
            </div>
            <span class="text-xs font-black bg-indigo-100 dark:bg-indigo-950 text-indigo-800 dark:text-indigo-300 px-3 py-1 rounded-full">
              {{ dashboard?.colis?.total_colis || 0 }} au total
            </span>
          </div>

          <div class="pt-2">
            <VueApexCharts type="donut" height="260" :options="colisOptions" :series="colisSeries" />
          </div>

          <div class="pt-2 border-t border-gray-100 dark:border-slate-800 flex justify-between items-center text-xs">
            <span class="text-gray-400">En attente : <strong class="text-amber-600 font-bold">{{ dashboard?.colis?.en_attente || 0 }}</strong></span>
            <span class="text-gray-400">Livrés : <strong class="text-emerald-600 font-bold">{{ dashboard?.colis?.livres || 0 }}</strong></span>
            <router-link to="/entreprise/voyages" class="font-bold text-[#053754] dark:text-sky-300 hover:underline">
              Voir le suivi des colis →
            </router-link>
          </div>
        </div>

        <!-- Graphique 3 : Effectif Agents GP -->
        <div class="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 p-6 rounded-3xl shadow-2xs space-y-4">
          <div class="flex items-center justify-between border-b border-gray-100 dark:border-slate-800 pb-3">
            <div>
              <h3 class="font-extrabold text-sm text-[#053754] dark:text-sky-300 flex items-center gap-2">
                <span>👥</span>
                <span>Effectif & Disponibilité des Agents GP</span>
              </h3>
              <p class="text-xs text-gray-400 dark:text-slate-400">Répartition par statut de service</p>
            </div>
            <span class="text-xs font-black bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 px-3 py-1 rounded-full">
              {{ dashboard?.agents?.total_agents || 0 }} au total
            </span>
          </div>

          <div class="pt-2">
            <VueApexCharts type="bar" height="260" :options="agentsOptions" :series="agentsSeries" />
          </div>

          <div class="pt-2 border-t border-gray-100 dark:border-slate-800 flex justify-between items-center text-xs">
            <span class="text-gray-400">Actifs : <strong class="text-emerald-600 font-bold">{{ dashboard?.agents?.actifs || 0 }}</strong></span>
            <span class="text-gray-400">En voyage : <strong class="text-sky-600 font-bold">{{ dashboard?.agents?.en_voyage || 0 }}</strong></span>
            <router-link to="/entreprise/agents" class="font-bold text-[#053754] dark:text-sky-300 hover:underline">
              Gérer mes agents →
            </router-link>
          </div>
        </div>

        <!-- Graphique 4 : Réservations Clients -->
        <div class="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 p-6 rounded-3xl shadow-2xs space-y-4">
          <div class="flex items-center justify-between border-b border-gray-100 dark:border-slate-800 pb-3">
            <div>
              <h3 class="font-extrabold text-sm text-[#053754] dark:text-sky-300 flex items-center gap-2">
                <span>📝</span>
                <span>Statut des Réservations Clients</span>
              </h3>
              <p class="text-xs text-gray-400 dark:text-slate-400">Répartition des demandes de réservation</p>
            </div>
            <span class="text-xs font-black bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 px-3 py-1 rounded-full">
              {{ dashboard?.reservations?.total || 0 }} au total
            </span>
          </div>

          <div class="pt-2">
            <VueApexCharts type="bar" height="260" :options="reservationsOptions" :series="reservationsSeries" />
          </div>

          <div class="pt-2 border-t border-gray-100 dark:border-slate-800 flex justify-between items-center text-xs">
            <span class="text-gray-400">Confirmées : <strong class="text-emerald-600 font-bold">{{ dashboard?.reservations?.confirmees || 0 }}</strong></span>
            <span class="text-gray-400">En attente : <strong class="text-amber-600 font-bold">{{ dashboard?.reservations?.en_attente || 0 }}</strong></span>
            <router-link to="/entreprise/discussions" class="font-bold text-[#053754] dark:text-sky-300 hover:underline">
              Superviser les échanges →
            </router-link>
          </div>
        </div>

      </div>

    </div>
  </div>
</template>

