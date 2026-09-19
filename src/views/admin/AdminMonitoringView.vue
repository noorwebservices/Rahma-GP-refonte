<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { RouterLink } from 'vue-router'
import { monitoringService } from '@/services/monitoringService'
import { formatImageUrl } from '@/utils/imageUrl'
import { countryFlag, countryName } from '@/utils/country'
import { encodeId } from '@/utils/idMasker'
import { useTheme } from '@/composables/useTheme'
import PeriodFilter from '@/components/admin/PeriodFilter.vue'
import VueApexCharts from 'vue3-apexcharts'

const { isDark } = useTheme()

const filter = ref({ period: '30d' })
const loading = ref(true)
const overview = ref(null)
const topCountries = ref([])
const activeUsers = ref([])
const realtime = ref(null)
let realtimeTimer = null

async function loadAll() {
  loading.value = true
  try {
    const [ov, ct, au, rt] = await Promise.all([
      monitoringService.getOverview(filter.value),
      monitoringService.getCountries({ ...filter.value, limit: 6 }),
      monitoringService.getActiveUsers({ ...filter.value, limit: 6 }),
      monitoringService.getRealtime({ minutes: 15 }),
    ])
    overview.value = ov.data
    topCountries.value = ct.data || []
    activeUsers.value = au.data || []
    realtime.value = rt.data
  } catch (e) {
    console.error('Monitoring load error', e)
  } finally {
    loading.value = false
  }
}

async function refreshRealtime() {
  try {
    const rt = await monitoringService.getRealtime({ minutes: 15 })
    realtime.value = rt.data
  } catch { /* silencieux */ }
}

function onPeriodChange() {
  loadAll()
}

onMounted(() => {
  loadAll()
  realtimeTimer = setInterval(refreshRealtime, 30000)
})
onUnmounted(() => clearInterval(realtimeTimer))

const kpis = computed(() => overview.value?.kpis || {})

function nf(n) {
  return new Intl.NumberFormat('fr-FR').format(n || 0)
}

// ---- Graphiques ----
const chartTheme = computed(() => (isDark.value ? 'dark' : 'light'))

const trafficSeries = computed(() => {
  const s = overview.value?.series || []
  return [
    { name: 'Visites', data: s.map((p) => p.visites) },
    { name: 'Visiteurs uniques', data: s.map((p) => p.visiteurs) },
  ]
})
const trafficOptions = computed(() => ({
  chart: { type: 'area', toolbar: { show: false }, background: 'transparent', fontFamily: 'inherit' },
  theme: { mode: chartTheme.value },
  colors: ['#053754', '#B50302'],
  dataLabels: { enabled: false },
  stroke: { curve: 'smooth', width: 2 },
  fill: { type: 'gradient', gradient: { opacityFrom: 0.35, opacityTo: 0.05 } },
  grid: { borderColor: isDark.value ? '#1e293b' : '#f1f5f9', strokeDashArray: 4 },
  xaxis: {
    categories: (overview.value?.series || []).map((p) => p.date),
    labels: { rotate: -35, style: { fontSize: '10px' }, hideOverlappingLabels: true },
    tickAmount: 8,
  },
  yaxis: { labels: { formatter: (v) => Math.round(v) } },
  legend: { position: 'top', horizontalAlign: 'right' },
  tooltip: { theme: chartTheme.value },
}))

const platformSeries = computed(() => {
  const p = overview.value?.plateformes
  return p ? [p.web.visiteurs, p.pwa.visiteurs] : [0, 0]
})
const platformOptions = computed(() => ({
  chart: { type: 'donut', background: 'transparent', fontFamily: 'inherit' },
  theme: { mode: chartTheme.value },
  labels: ['Site web', 'Application (PWA)'],
  colors: ['#053754', '#0ea5e9'],
  legend: { position: 'bottom' },
  dataLabels: { enabled: true, formatter: (val) => `${Math.round(val)}%` },
  stroke: { width: 0 },
  plotOptions: { pie: { donut: { size: '68%' } } },
}))

const deviceSeries = computed(() => [
  { name: 'Visites', data: (overview.value?.appareils || []).map((d) => d.visites) },
])
const deviceOptions = computed(() => ({
  chart: { type: 'bar', toolbar: { show: false }, background: 'transparent', fontFamily: 'inherit' },
  theme: { mode: chartTheme.value },
  colors: ['#7c3aed'],
  plotOptions: { bar: { borderRadius: 6, columnWidth: '45%', distributed: true } },
  dataLabels: { enabled: false },
  legend: { show: false },
  grid: { borderColor: isDark.value ? '#1e293b' : '#f1f5f9', strokeDashArray: 4 },
  xaxis: { categories: (overview.value?.appareils || []).map((d) => d.type) },
}))
</script>

<template>
  <div class="space-y-6">
    <!-- En-tête -->
    <div class="bg-[#053754] dark:bg-slate-900 border border-transparent dark:border-slate-800 text-white rounded-3xl p-6 sm:p-8 shadow-xl">
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span class="inline-block px-3 py-1 rounded-full bg-white/15 text-xs font-extrabold uppercase tracking-wider border border-white/20">
            Supervision & Monitoring
          </span>
          <h1 class="text-2xl sm:text-3xl font-black tracking-tight mt-2">Analyse du trafic</h1>
          <p class="text-white/70 text-sm mt-1">Visiteurs, pays, appareils et utilisateurs actifs — en temps réel.</p>
        </div>
        <div v-if="realtime" class="flex items-center gap-4 shrink-0">
          <div class="text-center">
            <div class="flex items-center gap-2 justify-center">
              <span class="w-2.5 h-2.5 rounded-full bg-green-400 animate-pulse"></span>
              <span class="text-3xl font-black">{{ nf(realtime.visiteurs_en_ligne) }}</span>
            </div>
            <span class="text-[10px] uppercase tracking-wider text-white/70 font-bold">En ligne</span>
          </div>
          <div class="text-center border-l border-white/20 pl-4">
            <span class="text-3xl font-black">{{ nf(realtime.utilisateurs_connectes) }}</span>
            <div class="text-[10px] uppercase tracking-wider text-white/70 font-bold">Connectés</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Filtre période -->
    <div class="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-2xl p-4 shadow-2xs">
      <PeriodFilter v-model="filter" @change="onPeriodChange" />
    </div>

    <!-- Loading -->
    <div v-if="loading" class="bg-white dark:bg-slate-900 rounded-3xl p-12 text-center border border-gray-200 dark:border-slate-800 space-y-3">
      <div class="w-10 h-10 border-4 border-[#053754] dark:border-sky-400 border-t-transparent rounded-full animate-spin mx-auto"></div>
      <p class="text-xs font-bold text-[#074C72] dark:text-sky-300">Chargement des statistiques...</p>
    </div>

    <template v-else>
      <!-- KPIs -->
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div class="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-3xl p-5 shadow-2xs">
          <span class="text-xs font-extrabold uppercase tracking-wider text-gray-400">Visites</span>
          <p class="text-3xl font-black text-[#053754] dark:text-white mt-2">{{ nf(kpis.visites) }}</p>
        </div>
        <div class="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-3xl p-5 shadow-2xs">
          <span class="text-xs font-extrabold uppercase tracking-wider text-gray-400">Visiteurs uniques</span>
          <p class="text-3xl font-black text-[#B50302] mt-2">{{ nf(kpis.visiteurs_uniques) }}</p>
        </div>
        <div class="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-3xl p-5 shadow-2xs">
          <span class="text-xs font-extrabold uppercase tracking-wider text-gray-400">Nouveaux inscrits</span>
          <p class="text-3xl font-black text-emerald-600 dark:text-emerald-400 mt-2">{{ nf(kpis.nouveaux_utilisateurs) }}</p>
        </div>
        <div class="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-3xl p-5 shadow-2xs">
          <span class="text-xs font-extrabold uppercase tracking-wider text-gray-400">Total utilisateurs</span>
          <p class="text-3xl font-black text-sky-600 dark:text-sky-400 mt-2">{{ nf(kpis.total_utilisateurs) }}</p>
        </div>
      </div>

      <!-- Graphique trafic -->
      <div class="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-3xl p-5 shadow-2xs">
        <h2 class="text-sm font-black uppercase tracking-wider text-[#053754] dark:text-sky-300 mb-3">Évolution du trafic</h2>
        <VueApexCharts type="area" height="320" :options="trafficOptions" :series="trafficSeries" />
      </div>

      <!-- Répartition -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div class="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-3xl p-5 shadow-2xs">
          <h2 class="text-sm font-black uppercase tracking-wider text-[#053754] dark:text-sky-300 mb-3">Site vs Application</h2>
          <VueApexCharts type="donut" height="300" :options="platformOptions" :series="platformSeries" />
        </div>
        <div class="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-3xl p-5 shadow-2xs">
          <h2 class="text-sm font-black uppercase tracking-wider text-[#053754] dark:text-sky-300 mb-3">Appareils</h2>
          <VueApexCharts type="bar" height="300" :options="deviceOptions" :series="deviceSeries" />
        </div>
      </div>

      <!-- Pays + Utilisateurs actifs -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <!-- Top pays -->
        <div class="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-3xl p-5 shadow-2xs">
          <div class="flex items-center justify-between mb-4">
            <h2 class="text-sm font-black uppercase tracking-wider text-[#053754] dark:text-sky-300">Pays les plus fréquents</h2>
            <RouterLink to="/admin/monitoring/countries" class="text-xs font-bold text-[#B50302] hover:underline">Voir tout →</RouterLink>
          </div>
          <div v-if="topCountries.length === 0" class="text-xs text-gray-400 py-6 text-center">Aucune donnée</div>
          <ul class="space-y-2">
            <li v-for="c in topCountries" :key="c.country_code">
              <RouterLink :to="`/admin/monitoring/countries/${c.country_code}`" class="flex items-center justify-between p-3 rounded-2xl hover:bg-gray-50 dark:hover:bg-slate-800 transition">
                <span class="flex items-center gap-3 font-semibold text-gray-700 dark:text-slate-200 text-sm">
                  <span class="text-xl">{{ countryFlag(c.country_code) }}</span>
                  {{ c.country || countryName(c.country_code) }}
                </span>
                <span class="text-sm font-black text-[#053754] dark:text-white">{{ nf(c.visiteurs) }}</span>
              </RouterLink>
            </li>
          </ul>
        </div>

        <!-- Utilisateurs actifs -->
        <div class="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-3xl p-5 shadow-2xs">
          <div class="flex items-center justify-between mb-4">
            <h2 class="text-sm font-black uppercase tracking-wider text-[#053754] dark:text-sky-300">Utilisateurs les plus actifs</h2>
            <RouterLink to="/admin/monitoring/active-users" class="text-xs font-bold text-[#B50302] hover:underline">Voir tout →</RouterLink>
          </div>
          <div v-if="activeUsers.length === 0" class="text-xs text-gray-400 py-6 text-center">Aucune donnée</div>
          <ul class="space-y-2">
            <li v-for="u in activeUsers" :key="u.user_id">
              <RouterLink :to="`/admin/monitoring/users/${encodeId(u.user_id)}`" class="flex items-center justify-between p-3 rounded-2xl hover:bg-gray-50 dark:hover:bg-slate-800 transition">
                <span class="flex items-center gap-3">
                  <span v-if="u.avatar" class="w-9 h-9 rounded-full overflow-hidden shrink-0 border border-gray-200 dark:border-slate-700">
                    <img :src="formatImageUrl(u.avatar)" class="w-full h-full object-cover" />
                  </span>
                  <span v-else class="w-9 h-9 rounded-full bg-[#053754] text-white flex items-center justify-center text-xs font-black shrink-0">
                    {{ (u.prenom || '?').charAt(0) }}{{ (u.nom || '').charAt(0) }}
                  </span>
                  <span class="font-semibold text-gray-700 dark:text-slate-200 text-sm">{{ u.prenom }} {{ u.nom }}</span>
                </span>
                <span class="text-sm font-black text-[#053754] dark:text-white">{{ nf(u.visites) }} <span class="text-[10px] text-gray-400 font-bold">vues</span></span>
              </RouterLink>
            </li>
          </ul>
        </div>
      </div>
    </template>
  </div>
</template>
