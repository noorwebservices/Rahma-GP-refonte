<script setup>
import { ref, computed, onMounted } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import { monitoringService } from '@/services/monitoringService'
import { formatImageUrl } from '@/utils/imageUrl'
import { decodeId, encodeId } from '@/utils/idMasker'
import { useTheme } from '@/composables/useTheme'
import PeriodFilter from '@/components/admin/PeriodFilter.vue'
import VueApexCharts from 'vue3-apexcharts'

const route = useRoute()
const { isDark } = useTheme()
const userId = computed(() => decodeId(String(route.params.id || '')))

const filter = ref({ period: '30d' })
const loading = ref(true)
const detail = ref(null)

async function load() {
  loading.value = true
  try {
    const res = await monitoringService.getUserActivity(userId.value, filter.value)
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
function fmtDate(d) {
  if (!d) return '—'
  return new Date(d).toLocaleString('fr-FR', { dateStyle: 'medium', timeStyle: 'short' })
}

const chartTheme = computed(() => (isDark.value ? 'dark' : 'light'))
const series = computed(() => [{ name: 'Pages vues', data: (detail.value?.series || []).map((p) => p.visites) }])
const options = computed(() => ({
  chart: { type: 'area', toolbar: { show: false }, background: 'transparent', fontFamily: 'inherit' },
  theme: { mode: chartTheme.value },
  colors: ['#053754'],
  dataLabels: { enabled: false },
  stroke: { curve: 'smooth', width: 2 },
  fill: { type: 'gradient', gradient: { opacityFrom: 0.35, opacityTo: 0.05 } },
  grid: { borderColor: isDark.value ? '#1e293b' : '#f1f5f9', strokeDashArray: 4 },
  xaxis: { categories: (detail.value?.series || []).map((p) => p.date), labels: { rotate: -35, style: { fontSize: '10px' } }, tickAmount: 8 },
  tooltip: { theme: chartTheme.value },
}))

onMounted(load)
</script>

<template>
  <div class="space-y-6">
    <div class="flex items-center gap-3">
      <RouterLink to="/admin/monitoring/active-users" class="w-10 h-10 rounded-xl bg-gray-100 dark:bg-slate-800 flex items-center justify-center text-gray-500 hover:bg-gray-200 dark:hover:bg-slate-700 transition">←</RouterLink>
      <h1 class="text-2xl font-black text-[#053754] dark:text-white">Activité utilisateur</h1>
    </div>

    <div class="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-2xl p-4 shadow-2xs">
      <PeriodFilter v-model="filter" @change="load" />
    </div>

    <div v-if="loading" class="bg-white dark:bg-slate-900 rounded-3xl p-12 text-center border border-gray-200 dark:border-slate-800">
      <div class="w-10 h-10 border-4 border-[#053754] dark:border-sky-400 border-t-transparent rounded-full animate-spin mx-auto"></div>
    </div>

    <template v-else-if="detail">
      <!-- Profil -->
      <div class="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-3xl p-5 shadow-2xs flex items-center gap-4">
        <span v-if="detail.utilisateur.avatar" class="w-16 h-16 rounded-full overflow-hidden shrink-0 border border-gray-200 dark:border-slate-700">
          <img :src="formatImageUrl(detail.utilisateur.avatar)" class="w-full h-full object-cover" />
        </span>
        <span v-else class="w-16 h-16 rounded-full bg-[#053754] text-white flex items-center justify-center text-lg font-black shrink-0">
          {{ (detail.utilisateur.prenom || '?').charAt(0) }}{{ (detail.utilisateur.nom || '').charAt(0) }}
        </span>
        <div class="flex-1 min-w-0">
          <h2 class="text-xl font-black text-[#053754] dark:text-white truncate">{{ detail.utilisateur.prenom }} {{ detail.utilisateur.nom }}</h2>
          <p class="text-sm text-gray-500 dark:text-slate-400 truncate">{{ detail.utilisateur.email || '—' }}</p>
          <div class="flex gap-1.5 mt-1">
            <span v-for="r in detail.utilisateur.roles" :key="r" class="px-2 py-0.5 rounded-full bg-gray-100 dark:bg-slate-800 text-[10px] font-bold uppercase text-gray-500 dark:text-slate-300">{{ r }}</span>
          </div>
        </div>
        <RouterLink :to="`/admin/users/${encodeId(detail.utilisateur.id)}`" class="px-4 py-2 rounded-xl bg-[#053754] dark:bg-sky-600 text-white text-xs font-extrabold uppercase tracking-wider shrink-0">Fiche complète</RouterLink>
      </div>

      <!-- KPIs -->
      <div class="grid grid-cols-3 gap-4">
        <div class="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-3xl p-5 shadow-2xs">
          <span class="text-xs font-extrabold uppercase tracking-wider text-gray-400">Pages vues</span>
          <p class="text-3xl font-black text-[#053754] dark:text-white mt-2">{{ nf(detail.kpis.visites) }}</p>
        </div>
        <div class="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-3xl p-5 shadow-2xs">
          <span class="text-xs font-extrabold uppercase tracking-wider text-gray-400">Jours actifs</span>
          <p class="text-3xl font-black text-emerald-600 dark:text-emerald-400 mt-2">{{ nf(detail.kpis.jours_actifs) }}</p>
        </div>
        <div class="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-3xl p-5 shadow-2xs">
          <span class="text-xs font-extrabold uppercase tracking-wider text-gray-400">Dernière activité</span>
          <p class="text-sm font-black text-gray-700 dark:text-slate-200 mt-3">{{ fmtDate(detail.kpis.derniere_activite) }}</p>
        </div>
      </div>

      <div class="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-3xl p-5 shadow-2xs">
        <h2 class="text-sm font-black uppercase tracking-wider text-[#053754] dark:text-sky-300 mb-3">Activité dans le temps</h2>
        <VueApexCharts type="area" height="280" :options="options" :series="series" />
      </div>

      <div class="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-3xl p-5 shadow-2xs">
        <h2 class="text-sm font-black uppercase tracking-wider text-[#053754] dark:text-sky-300 mb-3">Pages les plus consultées</h2>
        <div v-if="!detail.pages || detail.pages.length === 0" class="text-sm text-gray-400 py-4 text-center">Aucune page enregistrée.</div>
        <ul v-else class="divide-y divide-gray-100 dark:divide-slate-800">
          <li v-for="p in detail.pages" :key="p.path" class="flex items-center justify-between py-2.5 gap-3">
            <span class="font-mono text-xs text-gray-600 dark:text-slate-300 truncate">{{ p.path }}</span>
            <span class="text-sm font-black text-[#053754] dark:text-white shrink-0">{{ nf(p.vues) }}</span>
          </li>
        </ul>
      </div>
    </template>
  </div>
</template>
