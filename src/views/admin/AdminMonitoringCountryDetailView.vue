<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import { monitoringService } from '@/services/monitoringService'
import { countryFlag, countryName } from '@/utils/country'
import { useTheme } from '@/composables/useTheme'
import PeriodFilter from '@/components/admin/PeriodFilter.vue'
import VueApexCharts from 'vue3-apexcharts'

const route = useRoute()
const { isDark } = useTheme()
const code = computed(() => String(route.params.code || '').toUpperCase())

const filter = ref({ period: '30d' })
const loading = ref(true)
const detail = ref(null)

async function load() {
  loading.value = true
  try {
    const res = await monitoringService.getCountryDetail(code.value, filter.value)
    detail.value = res.data
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
}

function nf(n) {
  return new Intl.NumberFormat('fr-FR').format(n || 0)
}

const chartTheme = computed(() => (isDark.value ? 'dark' : 'light'))
const series = computed(() => [
  { name: 'Visites', data: (detail.value?.series || []).map((p) => p.visites) },
  { name: 'Visiteurs', data: (detail.value?.series || []).map((p) => p.visiteurs) },
])
const options = computed(() => ({
  chart: { type: 'area', toolbar: { show: false }, background: 'transparent', fontFamily: 'inherit' },
  theme: { mode: chartTheme.value },
  colors: ['#053754', '#B50302'],
  dataLabels: { enabled: false },
  stroke: { curve: 'smooth', width: 2 },
  fill: { type: 'gradient', gradient: { opacityFrom: 0.35, opacityTo: 0.05 } },
  grid: { borderColor: isDark.value ? '#1e293b' : '#f1f5f9', strokeDashArray: 4 },
  xaxis: { categories: (detail.value?.series || []).map((p) => p.date), labels: { rotate: -35, style: { fontSize: '10px' } }, tickAmount: 8 },
  legend: { position: 'top', horizontalAlign: 'right' },
  tooltip: { theme: chartTheme.value },
}))

onMounted(load)
watch(code, load)
</script>

<template>
  <div class="space-y-6">
    <div class="flex items-center gap-3">
      <RouterLink to="/admin/monitoring/countries" class="w-10 h-10 rounded-xl bg-gray-100 dark:bg-slate-800 flex items-center justify-center text-gray-500 hover:bg-gray-200 dark:hover:bg-slate-700 transition">←</RouterLink>
      <div class="flex items-center gap-3">
        <span class="text-4xl">{{ countryFlag(code) }}</span>
        <div>
          <h1 class="text-2xl font-black text-[#053754] dark:text-white">{{ detail?.pays || countryName(code) }}</h1>
          <p class="text-sm text-gray-500 dark:text-slate-400">Détail du trafic — {{ code }}</p>
        </div>
      </div>
    </div>

    <div class="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-2xl p-4 shadow-2xs">
      <PeriodFilter v-model="filter" @change="load" />
    </div>

    <div v-if="loading" class="bg-white dark:bg-slate-900 rounded-3xl p-12 text-center border border-gray-200 dark:border-slate-800">
      <div class="w-10 h-10 border-4 border-[#053754] dark:border-sky-400 border-t-transparent rounded-full animate-spin mx-auto"></div>
    </div>

    <template v-else-if="detail">
      <div class="grid grid-cols-3 gap-4">
        <div class="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-3xl p-5 shadow-2xs">
          <span class="text-xs font-extrabold uppercase tracking-wider text-gray-400">Visites</span>
          <p class="text-3xl font-black text-[#053754] dark:text-white mt-2">{{ nf(detail.kpis.visites) }}</p>
        </div>
        <div class="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-3xl p-5 shadow-2xs">
          <span class="text-xs font-extrabold uppercase tracking-wider text-gray-400">Visiteurs uniques</span>
          <p class="text-3xl font-black text-[#B50302] mt-2">{{ nf(detail.kpis.visiteurs_uniques) }}</p>
        </div>
        <div class="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-3xl p-5 shadow-2xs">
          <span class="text-xs font-extrabold uppercase tracking-wider text-gray-400">Utilisateurs</span>
          <p class="text-3xl font-black text-sky-600 dark:text-sky-400 mt-2">{{ nf(detail.kpis.utilisateurs) }}</p>
        </div>
      </div>

      <div class="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-3xl p-5 shadow-2xs">
        <h2 class="text-sm font-black uppercase tracking-wider text-[#053754] dark:text-sky-300 mb-3">Évolution</h2>
        <VueApexCharts type="area" height="300" :options="options" :series="series" />
      </div>

      <div class="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-3xl p-5 shadow-2xs">
        <h2 class="text-sm font-black uppercase tracking-wider text-[#053754] dark:text-sky-300 mb-3">Villes</h2>
        <div v-if="!detail.villes || detail.villes.length === 0" class="text-sm text-gray-400 py-4 text-center">Aucune donnée de ville.</div>
        <ul v-else class="divide-y divide-gray-100 dark:divide-slate-800">
          <li v-for="v in detail.villes" :key="v.city" class="flex items-center justify-between py-3">
            <span class="font-semibold text-gray-700 dark:text-slate-200 text-sm">{{ v.city }}</span>
            <span class="text-sm font-black text-[#053754] dark:text-white">{{ nf(v.visiteurs) }} <span class="text-[10px] text-gray-400 font-bold">visiteurs</span></span>
          </li>
        </ul>
      </div>
    </template>
  </div>
</template>
