<template>
  <div class="space-y-6">
    
    <!-- Hero Banner Card (RahmaGP Navy #053754) -->
    <div class="bg-[#053754] text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden space-y-4">
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
        <div>
          <span class="inline-block px-3 py-1 rounded-full bg-white/15 text-xs font-extrabold text-white border border-white/20 uppercase tracking-wider">
            Supervision Centrale Rahma GP
          </span>
          <h1 class="text-2xl sm:text-3xl font-black text-white tracking-tight mt-2">
            Tableau de Bord Administrateur
          </h1>
        </div>

        <div class="flex items-center gap-3 shrink-0">
          <router-link to="/admin/users" class="px-5 py-3 rounded-2xl bg-[#B50302] hover:bg-[#870202] text-white font-extrabold text-xs uppercase tracking-wider shadow-lg transition-all transform active:scale-95 cursor-pointer">
            👥 Utilisateurs
          </router-link>
          <router-link to="/admin/signalements" class="px-5 py-3 rounded-2xl bg-white/15 hover:bg-white/25 text-white font-extrabold text-xs uppercase tracking-wider border border-white/20 transition cursor-pointer">
            🚩 Signalements
          </router-link>
        </div>
      </div>
    </div>

    <!-- Loading Spinner -->
    <div v-if="loading" class="bg-white rounded-3xl p-12 text-center border border-gray-200 shadow-2xs space-y-3">
      <div class="w-10 h-10 border-4 border-[#053754] border-t-transparent rounded-full animate-spin mx-auto"></div>
      <p class="text-xs font-bold text-[#074C72]">Chargement des données d'administration...</p>
    </div>

    <template v-else>
      <!-- KPI Stats Grid -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <!-- Total Utilisateurs -->
        <div class="bg-white border border-gray-200 rounded-3xl p-5 shadow-2xs space-y-3">
          <div class="flex items-center justify-between">
            <span class="text-xs font-extrabold uppercase tracking-wider text-gray-400">Total Utilisateurs</span>
            <div class="w-10 h-10 rounded-2xl bg-[#D8ECF8] text-[#074C72] flex items-center justify-center font-bold">
              👥
            </div>
          </div>
          <div>
            <h3 class="text-3xl font-black text-[#053754]">{{ stats.users?.total || 0 }}</h3>
            <div class="flex items-center gap-2 mt-2 text-xs font-bold text-gray-500">
              <span class="text-[#074C72]">{{ stats.users?.clients || 0 }} Clients</span>
              <span>•</span>
              <span class="text-emerald-700">{{ stats.users?.voyageurs || 0 }} Voyageurs</span>
            </div>
          </div>
        </div>

        <!-- Voyageurs en attente -->
        <div class="bg-white border border-amber-200 rounded-3xl p-5 shadow-2xs space-y-3">
          <div class="flex items-center justify-between">
            <span class="text-xs font-extrabold uppercase tracking-wider text-amber-600">Vérifications Voyageur</span>
            <div class="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
              ✈️
            </div>
          </div>
          <div>
            <h3 class="text-3xl font-black text-amber-600">{{ stats.voyageurs?.en_attente || 0 }}</h3>
            <p class="text-xs text-gray-500 font-semibold mt-2">
              Demandes de vérification en attente
            </p>
          </div>
        </div>

        <!-- Signalements -->
        <div class="bg-white border border-red-200 rounded-3xl p-5 shadow-2xs space-y-3">
          <div class="flex items-center justify-between">
            <span class="text-xs font-extrabold uppercase tracking-wider text-[#B50302]">Signalements</span>
            <div class="w-10 h-10 rounded-2xl bg-red-50 text-[#B50302] flex items-center justify-center font-bold">
              🚩
            </div>
          </div>
          <div>
            <h3 class="text-3xl font-black text-[#B50302]">{{ stats.signalements?.en_attente || 0 }}</h3>
            <p class="text-xs text-gray-500 font-semibold mt-2">
              {{ stats.signalements?.total || 0 }} signalement(s) au total
            </p>
          </div>
        </div>

        <!-- Partenariats -->
        <div class="bg-white border border-teal-200 rounded-3xl p-5 shadow-2xs space-y-3">
          <div class="flex items-center justify-between">
            <span class="text-xs font-extrabold uppercase tracking-wider text-teal-700">Demandes Partenariat</span>
            <div class="w-10 h-10 rounded-2xl bg-teal-50 text-teal-700 flex items-center justify-center font-bold">
              💼
            </div>
          </div>
          <div>
            <h3 class="text-3xl font-black text-teal-700">{{ stats.partenariats?.en_attente || 0 }}</h3>
            <p class="text-xs text-gray-500 font-semibold mt-2">
              Formulaires soumis depuis le portail
            </p>
          </div>
        </div>

      </div>

      <!-- Activity & DB Footprint Grid -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        <!-- Activity Metrics Card -->
        <div class="lg:col-span-2 bg-white border border-gray-200 rounded-3xl p-6 shadow-2xs space-y-5">
          <div class="flex items-center justify-between border-b border-gray-100 pb-3">
            <h2 class="font-extrabold text-base text-[#053754]">Activité & Volumes de la Plateforme</h2>
            <span class="text-xs text-emerald-700 font-bold bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100">En Direct</span>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div class="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-1">
              <span class="text-xs font-bold text-gray-400 uppercase">Voyages Publiés</span>
              <p class="text-2xl font-black text-[#053754]">{{ stats.activite?.voyages || 0 }}</p>
            </div>

            <div class="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-1">
              <span class="text-xs font-bold text-gray-400 uppercase">Réservations Colis</span>
              <p class="text-2xl font-black text-[#053754]">{{ stats.activite?.reservations || 0 }}</p>
            </div>

            <div class="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-1">
              <span class="text-xs font-bold text-gray-400 uppercase">Messages Échangés</span>
              <p class="text-2xl font-black text-[#053754]">{{ stats.activite?.messages || 0 }}</p>
            </div>
          </div>

          <div class="bg-[#FAF7F2] border border-gray-200 rounded-2xl p-5 flex items-center justify-between">
            <div>
              <span class="text-xs font-extrabold uppercase tracking-wider text-[#074C72]">Volume Total de Paiements Enregistrés</span>
              <h3 class="text-2xl sm:text-3xl font-black text-[#053754] mt-1">{{ formatMoney(stats.activite?.volume_paiements || 0) }} FCFA</h3>
            </div>
            <div class="w-12 h-12 rounded-2xl bg-[#053754] text-white font-black text-lg flex items-center justify-center shadow-md">
              FCFA
            </div>
          </div>
        </div>

        <!-- DB Footprint Card -->
        <div class="bg-white border border-gray-200 rounded-3xl p-6 shadow-2xs flex flex-col justify-between space-y-4">
          <div>
            <div class="flex items-center justify-between border-b border-gray-100 pb-3">
              <h2 class="font-extrabold text-base text-[#053754]">Capacité Base de Données</h2>
              <span class="text-xs text-indigo-700 font-bold bg-indigo-50 px-2.5 py-1 rounded-full">MySQL</span>
            </div>

            <div class="text-center py-6 space-y-1">
              <span class="text-4xl font-black text-[#053754]">
                {{ stats.base_de_donnees?.taille_estimee_mo || 0 }} Mo
              </span>
              <p class="text-xs text-gray-500 font-semibold">Taille estimée des données stockées</p>
            </div>

            <div class="space-y-2 text-xs pt-4 border-t border-gray-100">
              <div class="flex justify-between text-gray-600">
                <span>Total octets :</span>
                <span class="font-mono font-bold text-gray-800">{{ stats.base_de_donnees?.taille_estimee_octets || 0 }} octets</span>
              </div>
              <div class="flex justify-between text-gray-600">
                <span>Base locale :</span>
                <span class="font-bold text-emerald-600">rahma_delivery</span>
              </div>
            </div>
          </div>

          <router-link to="/admin/voyages" class="w-full py-3 px-4 rounded-2xl bg-[#053754] hover:bg-[#074C72] text-white font-extrabold text-xs text-center shadow-md transition block">
            Analyser Capacité BD par Voyageur →
          </router-link>
        </div>

      </div>
    </template>

  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { adminService } from '@/services/adminService'

const stats = ref({})
const loading = ref(true)

onMounted(async () => {
  try {
    const res = await adminService.getDashboardStats()
    if (res && res.data) {
      stats.value = res.data
    }
  } catch (err) {
    console.error('Erreur chargement dashboard stats admin:', err)
  } finally {
    loading.value = false
  }
})

const formatMoney = (val) => {
  return new Intl.NumberFormat('fr-FR').format(val || 0)
}
</script>
