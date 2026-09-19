<script setup>
import { ref, onMounted } from 'vue'
import { RouterLink } from 'vue-router'
import { monitoringService } from '@/services/monitoringService'
import { formatImageUrl } from '@/utils/imageUrl'
import { encodeId } from '@/utils/idMasker'
import PeriodFilter from '@/components/admin/PeriodFilter.vue'

const filter = ref({ period: '30d' })
const loading = ref(true)
const users = ref([])

async function load() {
  loading.value = true
  try {
    const res = await monitoringService.getActiveUsers({ ...filter.value, limit: 100 })
    users.value = res.data || []
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

onMounted(load)
</script>

<template>
  <div class="space-y-6">
    <div class="flex items-center gap-3">
      <RouterLink to="/admin/monitoring" class="w-10 h-10 rounded-xl bg-gray-100 dark:bg-slate-800 flex items-center justify-center text-gray-500 hover:bg-gray-200 dark:hover:bg-slate-700 transition">←</RouterLink>
      <div>
        <h1 class="text-2xl font-black text-[#053754] dark:text-white">Utilisateurs les plus actifs</h1>
        <p class="text-sm text-gray-500 dark:text-slate-400">Classés par nombre de pages vues</p>
      </div>
    </div>

    <div class="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-2xl p-4 shadow-2xs">
      <PeriodFilter v-model="filter" @change="load" />
    </div>

    <div v-if="loading" class="bg-white dark:bg-slate-900 rounded-3xl p-12 text-center border border-gray-200 dark:border-slate-800">
      <div class="w-10 h-10 border-4 border-[#053754] dark:border-sky-400 border-t-transparent rounded-full animate-spin mx-auto"></div>
    </div>

    <div v-else class="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-3xl p-4 shadow-2xs">
      <div v-if="users.length === 0" class="text-sm text-gray-400 py-8 text-center">Aucune activité sur cette période.</div>
      <ul v-else class="space-y-2">
        <li v-for="(u, i) in users" :key="u.user_id">
          <RouterLink :to="`/admin/monitoring/users/${encodeId(u.user_id)}`" class="flex items-center gap-3 p-3 rounded-2xl hover:bg-gray-50 dark:hover:bg-slate-800 transition">
            <span class="w-6 text-center text-xs font-black text-gray-400">{{ i + 1 }}</span>
            <span v-if="u.avatar" class="w-10 h-10 rounded-full overflow-hidden shrink-0 border border-gray-200 dark:border-slate-700">
              <img :src="formatImageUrl(u.avatar)" class="w-full h-full object-cover" />
            </span>
            <span v-else class="w-10 h-10 rounded-full bg-[#053754] text-white flex items-center justify-center text-xs font-black shrink-0">
              {{ (u.prenom || '?').charAt(0) }}{{ (u.nom || '').charAt(0) }}
            </span>
            <div class="flex-1 min-w-0">
              <p class="font-bold text-gray-700 dark:text-slate-200 text-sm truncate">{{ u.prenom }} {{ u.nom }}</p>
              <p class="text-xs text-gray-400 truncate">Dernière activité : {{ fmtDate(u.derniere_activite) }}</p>
            </div>
            <div class="text-right shrink-0">
              <p class="text-sm font-black text-[#053754] dark:text-white">{{ nf(u.visites) }}</p>
              <p class="text-[10px] text-gray-400 font-bold uppercase">{{ u.jours_actifs }} j. actifs</p>
            </div>
          </RouterLink>
        </li>
      </ul>
    </div>
  </div>
</template>
