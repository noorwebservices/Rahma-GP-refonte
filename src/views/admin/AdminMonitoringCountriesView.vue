<script setup>
import { ref, computed, onMounted } from 'vue'
import { RouterLink } from 'vue-router'
import { monitoringService } from '@/services/monitoringService'
import { countryFlag, countryName } from '@/utils/country'
import PeriodFilter from '@/components/admin/PeriodFilter.vue'

const filter = ref({ period: '30d' })
const loading = ref(true)
const countries = ref([])

async function load() {
  loading.value = true
  try {
    const res = await monitoringService.getCountries({ ...filter.value, limit: 100 })
    countries.value = res.data || []
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
}

const totalVisitors = computed(() => countries.value.reduce((s, c) => s + Number(c.visiteurs || 0), 0))

function pct(v) {
  if (!totalVisitors.value) return 0
  return Math.round((Number(v) / totalVisitors.value) * 100)
}
function nf(n) {
  return new Intl.NumberFormat('fr-FR').format(n || 0)
}

onMounted(load)
</script>

<template>
  <div class="space-y-6">
    <div class="flex items-center gap-3">
      <RouterLink to="/admin/monitoring" class="w-10 h-10 rounded-xl bg-gray-100 dark:bg-slate-800 flex items-center justify-center text-gray-500 hover:bg-gray-200 dark:hover:bg-slate-700 transition">←</RouterLink>
      <div>
        <h1 class="text-2xl font-black text-[#053754] dark:text-white">Pays des visiteurs</h1>
        <p class="text-sm text-gray-500 dark:text-slate-400">Répartition géographique du trafic</p>
      </div>
    </div>

    <div class="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-2xl p-4 shadow-2xs">
      <PeriodFilter v-model="filter" @change="load" />
    </div>

    <div v-if="loading" class="bg-white dark:bg-slate-900 rounded-3xl p-12 text-center border border-gray-200 dark:border-slate-800">
      <div class="w-10 h-10 border-4 border-[#053754] dark:border-sky-400 border-t-transparent rounded-full animate-spin mx-auto"></div>
    </div>

    <div v-else class="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-3xl p-5 shadow-2xs">
      <div v-if="countries.length === 0" class="text-sm text-gray-400 py-8 text-center">Aucune donnée sur cette période.</div>
      <ul v-else class="space-y-3">
        <li v-for="c in countries" :key="c.country_code">
          <RouterLink :to="`/admin/monitoring/countries/${c.country_code}`" class="block p-3 rounded-2xl hover:bg-gray-50 dark:hover:bg-slate-800 transition">
            <div class="flex items-center justify-between mb-1.5">
              <span class="flex items-center gap-3 font-bold text-gray-700 dark:text-slate-200 text-sm">
                <span class="text-2xl">{{ countryFlag(c.country_code) }}</span>
                {{ c.country || countryName(c.country_code) }}
              </span>
              <span class="text-sm font-black text-[#053754] dark:text-white">
                {{ nf(c.visiteurs) }} <span class="text-[10px] text-gray-400 font-bold">visiteurs · {{ nf(c.visites) }} visites</span>
              </span>
            </div>
            <div class="h-2 rounded-full bg-gray-100 dark:bg-slate-800 overflow-hidden">
              <div class="h-full bg-[#053754] dark:bg-sky-500 rounded-full" :style="{ width: pct(c.visiteurs) + '%' }"></div>
            </div>
          </RouterLink>
        </li>
      </ul>
    </div>
  </div>
</template>
