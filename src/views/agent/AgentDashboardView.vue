<template>
  <div class="space-y-6 pb-20 font-sans">
    
    <!-- Hero Banner Card Agent GP -->
    <div class="bg-[#053754] dark:bg-slate-900 border border-transparent dark:border-slate-800 text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden space-y-4">
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
        <div class="space-y-1">
          <div class="flex items-center gap-2 flex-wrap">
            <span class="inline-block px-3 py-1 rounded-full bg-white/15 text-xs font-extrabold text-white border border-white/20 uppercase tracking-wider">
              Espace Agent GP 👥
            </span>
            <span v-if="matricule" class="text-xs font-mono font-bold text-sky-300 bg-white/10 px-2.5 py-0.5 rounded-full border border-white/10">
              Matricule : {{ matricule }}
            </span>
          </div>

          <h1 class="text-2xl sm:text-3xl font-black text-white tracking-tight pt-1 flex items-center gap-2 flex-wrap">
            <span>Bienvenue, {{ agentNom }}</span>
          </h1>
          <p class="text-xs sm:text-sm text-gray-200 font-medium">
            Agent GP rattaché à l'Entreprise : <strong class="text-white font-black">{{ entrepriseNom }}</strong>
          </p>
        </div>

        <div class="flex items-center gap-2.5 flex-wrap">
          <router-link
            to="/agent/demandes"
            class="px-4 py-2.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-extrabold text-xs sm:text-sm border border-white/20 transition-all flex items-center gap-2 cursor-pointer"
          >
            <span>📦 Demandes de transport</span>
          </router-link>
          <router-link
            to="/agent/evaluations"
            class="px-4 py-2.5 rounded-2xl bg-white/10 hover:bg-white/20 text-amber-300 font-extrabold text-xs sm:text-sm border border-white/20 transition-all flex items-center gap-2 cursor-pointer"
          >
            <span>⭐ Avis Clients</span>
          </router-link>
        </div>
      </div>
    </div>

    <!-- 3 Summary KPI Cards (Design aligned with Voyageur) -->
    <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
      <!-- Card 1: Voyages -->
      <div class="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-gray-200 dark:border-slate-800 shadow-2xs space-y-1">
        <span class="text-[11px] font-bold text-gray-400 dark:text-slate-400 block uppercase">Voyages Affectés</span>
        <div class="text-base sm:text-lg font-black text-[#053754] dark:text-sky-300">{{ totalVoyagesCount }}</div>
        <span class="text-[10px] text-sky-600 dark:text-sky-400 font-bold flex items-center gap-0.5">✈️ Voyages attribués</span>
      </div>

      <!-- Card 2: Reservations -->
      <div @click="router.push('/agent/demandes')" class="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-amber-200 dark:border-amber-800/80 bg-amber-50/40 dark:bg-amber-950/20 shadow-2xs hover:border-amber-400 transition-all cursor-pointer space-y-1">
        <span class="text-[11px] font-bold text-amber-700 dark:text-amber-300 block uppercase">Réservations Reçues</span>
        <div class="text-base sm:text-lg font-black text-amber-900 dark:text-amber-200 font-serif">{{ totalReservationsCount }}</div>
        <span class="text-[10px] text-amber-600 dark:text-amber-400 font-bold underline">Gérer les demandes ➔</span>
      </div>

      <!-- Card 3: Capacity -->
      <div class="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-gray-200 dark:border-slate-800 shadow-2xs space-y-1">
        <span class="text-[11px] font-bold text-gray-400 dark:text-slate-400 block uppercase">Kilos Disponibles</span>
        <div class="text-base sm:text-lg font-black text-emerald-600 dark:text-emerald-400">{{ totalKilosDisponibles }} Kg</div>
        <span class="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">Capacité globale disponible</span>
      </div>
    </div>

    <!-- Search Bar & Filter Bar (Design aligned with Voyageur) -->
    <div class="space-y-3 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-gray-200 dark:border-slate-800 shadow-2xs">
      <div class="relative w-full">
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Rechercher par ville de départ, destination ou pays..."
          class="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-xs font-medium text-gray-800 dark:text-slate-100 outline-none focus:border-[#074C72] dark:focus:border-sky-400 focus:ring-2 focus:ring-[#074C72]/20 placeholder-gray-400 dark:placeholder-slate-500"
        />
        <span class="absolute left-3.5 top-2.5 text-gray-400 dark:text-slate-500 text-sm">🔍</span>
      </div>

      <div class="space-y-1.5">
        <label class="block text-[10px] font-extrabold uppercase tracking-wider text-gray-400 dark:text-slate-400">Filtrer par statut :</label>
        <div class="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
          <button
            v-for="opt in statusOptions"
            :key="opt.value"
            @click="selectedStatut = opt.value"
            class="px-3.5 py-1.5 rounded-full text-xs font-extrabold transition-all cursor-pointer whitespace-nowrap shrink-0 border"
            :class="[
              selectedStatut === opt.value
                ? 'bg-[#053754] dark:bg-sky-500 text-white border-[#053754] dark:border-sky-500 shadow-xs'
                : 'bg-white dark:bg-slate-800 text-gray-600 dark:text-slate-300 border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700'
            ]"
          >
            {{ opt.label }}
          </button>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="bg-white dark:bg-slate-900 rounded-3xl p-12 text-center border border-gray-200 dark:border-slate-800 shadow-2xs space-y-3">
      <div class="w-10 h-10 border-4 border-[#053754] dark:border-sky-400 border-t-transparent rounded-full animate-spin mx-auto"></div>
      <p class="text-xs font-bold text-[#074C72] dark:text-sky-300">Chargement de vos voyages affectés...</p>
    </div>

    <!-- Empty State -->
    <div v-else-if="filteredVoyages.length === 0" class="bg-white dark:bg-slate-900 rounded-3xl p-12 text-center border border-gray-200 dark:border-slate-800 shadow-2xs space-y-3">
      <div class="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center text-xl mx-auto font-bold">
        ✈️
      </div>
      <p class="text-sm font-bold text-gray-700 dark:text-slate-200">Aucun voyage affecté trouvé.</p>
      <p class="text-xs text-gray-400 dark:text-slate-400">Votre gérant d'entreprise GP doit vous attribuer des voyages pour qu'ils apparaissent ici.</p>
    </div>

    <!-- Voyages Table View (Desktop & Tablet) - Identical to Voyageur -->
    <div v-else-if="filteredVoyages.length > 0" class="hidden md:block bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-3xl shadow-2xs overflow-hidden">
      <div class="overflow-x-auto min-w-full">
        <table class="min-w-max w-full text-left border-collapse">
          <thead>
            <tr class="bg-slate-50 dark:bg-slate-800/80 border-b border-gray-200 dark:border-slate-800 text-[11px] font-extrabold text-gray-500 dark:text-slate-400 uppercase tracking-wider whitespace-nowrap">
              <th class="py-4 px-5">Trajet</th>
              <th class="py-4 px-5">Date de départ</th>
              <th class="py-4 px-5">Capacité Dispo</th>
              <th class="py-4 px-5">Tarif Kg</th>
              <th class="py-4 px-5">Statut</th>
              <th class="py-4 px-5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100 dark:divide-slate-800 text-xs font-medium whitespace-nowrap">
            <tr
              v-for="voyage in filteredVoyages"
              :key="voyage.id"
              @click="goToVoyageDetail(voyage.id)"
              class="hover:bg-sky-50/50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer group"
            >
              <td class="py-4 px-5">
                <div class="flex items-center gap-2 font-extrabold text-[#053754] dark:text-sky-300 text-sm">
                  <span>{{ truncateText(voyage.ville_depart, 30) }}</span>
                  <span class="text-gray-400 text-xs">➔</span>
                  <span>{{ truncateText(voyage.ville_destination || voyage.ville_arrivee, 30) }}</span>
                </div>
                <div class="text-[11px] text-gray-400 dark:text-slate-500 mt-0.5 flex items-center gap-1">
                  <span>{{ voyage.pays_depart || '' }}</span>
                  <span v-if="voyage.pays_destination">➔ {{ voyage.pays_destination }}</span>
                </div>
              </td>
              <td class="py-4 px-5 font-bold text-gray-800 dark:text-slate-200">
                {{ formatDate(voyage.date_depart) }}
              </td>
              <td class="py-4 px-5 font-bold text-emerald-600 dark:text-emerald-400">
                {{ getKilosDispo(voyage) }} Kg / {{ voyage.capacite_totale || 0 }} Kg
              </td>
              <td class="py-4 px-5 font-extrabold text-[#B50302] dark:text-rose-400">
                {{ formatPrice(voyage.prix_kg, voyage.devise || 'XOF') }}
              </td>
              <td class="py-4 px-5">
                <span
                  class="px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider border"
                  :class="getStatutBadgeClass(voyage.statut)"
                >
                  {{ voyage.statut }}
                </span>
              </td>
              <td class="py-4 px-5 text-right" @click.stop>
                <button
                  @click="goToVoyageDetail(voyage.id)"
                  type="button"
                  class="px-3.5 py-1.5 bg-[#053754] hover:bg-[#074C72] text-white font-extrabold text-xs rounded-xl transition cursor-pointer flex items-center gap-1 shadow-2xs ml-auto"
                >
                  <span>👁️</span>
                  <span>Gérer & Colis</span>
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Voyages Cards View (Mobile) - Identical to Voyageur -->
    <div v-if="filteredVoyages.length > 0" class="grid grid-cols-1 gap-4 md:hidden">
      <div
        v-for="voyage in filteredVoyages"
        :key="voyage.id"
        @click="goToVoyageDetail(voyage.id)"
        class="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-gray-200 dark:border-slate-800 shadow-sm space-y-4 hover:border-sky-300 dark:hover:border-sky-500 transition-all flex flex-col justify-between cursor-pointer"
      >
        <div class="space-y-4">
          <!-- Top Row: Route Flags + Status Badge -->
          <div class="flex items-center justify-between gap-2">
            <div class="flex items-center gap-2 font-black text-[#053754] dark:text-sky-300 text-sm sm:text-base">
              <div class="flex items-center gap-1.5">
                <CountryFlag :city="voyage.ville_depart" :country="voyage.pays_depart" size="w-5 h-3.5" />
                <span>{{ voyage.ville_depart }}</span>
              </div>
              <span class="text-red-500 text-xs">➔</span>
              <div class="flex items-center gap-1.5">
                <CountryFlag :city="voyage.ville_destination || voyage.ville_arrivee" :country="voyage.pays_destination" size="w-5 h-3.5" />
                <span>{{ voyage.ville_destination || voyage.ville_arrivee }}</span>
              </div>
            </div>

            <span
              class="text-[10px] font-extrabold px-3 py-0.5 rounded-full uppercase border shrink-0"
              :class="getStatutBadgeClass(voyage.statut)"
            >
              {{ voyage.statut }}
            </span>
          </div>

          <!-- Departure & Price Row -->
          <div class="bg-slate-50 dark:bg-slate-800/80 p-3 rounded-2xl border border-slate-100 dark:border-slate-700 flex items-center justify-between text-xs">
            <div>
              <span class="text-gray-400 dark:text-slate-400 block text-[10px] uppercase font-bold">Départ</span>
              <span class="font-bold text-gray-900 dark:text-slate-100">{{ formatDate(voyage.date_depart) }}</span>
            </div>
            <div class="text-right">
              <span class="text-gray-400 dark:text-slate-400 block text-[10px] uppercase font-bold">Tarif au Kg</span>
              <span class="font-extrabold text-[#B50302] dark:text-rose-400 text-sm">{{ formatPrice(voyage.prix_kg, voyage.devise || 'XOF') }}</span>
            </div>
          </div>

          <!-- Capacity Bar -->
          <div class="space-y-1.5 bg-gray-50 dark:bg-slate-800/60 p-3 rounded-2xl border border-gray-100 dark:border-slate-700">
            <div class="flex justify-between text-[11px] font-bold">
              <span class="text-gray-700 dark:text-slate-300 flex items-center gap-1">
                <span>⚖️</span>
                <span>Capacité de transport :</span>
              </span>
              <span :class="[getKilosDispo(voyage) === 0 ? 'text-red-600 dark:text-rose-400 font-black' : 'text-[#053754] dark:text-sky-300 font-extrabold']">
                {{ getKilosDispo(voyage) }} Kg / {{ voyage.capacite_totale || 0 }} Kg
              </span>
            </div>
            <div class="w-full bg-gray-200 dark:bg-slate-700 h-2.5 rounded-full overflow-hidden">
              <div
                class="h-full rounded-full transition-all duration-300"
                :class="getKilosDispo(voyage) === 0 ? 'bg-red-500' : 'bg-emerald-500'"
                :style="{ width: `${Math.min(100, Math.max(0, ((Number(voyage.capacite_totale || 0) - getKilosDispo(voyage)) / Number(voyage.capacite_totale || 1)) * 100))}%` }"
              ></div>
            </div>
          </div>
        </div>

        <!-- Action Row -->
        <div class="pt-2 flex justify-end border-t border-gray-100 dark:border-slate-800">
          <button
            @click.stop="goToVoyageDetail(voyage.id)"
            type="button"
            class="px-4 py-2 bg-[#053754] hover:bg-[#074C72] text-white text-xs font-extrabold rounded-xl transition-all shadow-2xs flex items-center gap-1.5 cursor-pointer"
          >
            <span>👁️ Gérer les Colis & Réservations ➔</span>
          </button>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { agentService } from '@/services/agentService'
import CountryFlag from '@/components/common/CountryFlag.vue'
import { encodeId } from '@/utils/idMasker'
import { formatPrice } from '@/utils/currencyState'

const router = useRouter()
const voyages = ref([])
const loading = ref(true)
const selectedStatut = ref('tous')
const searchQuery = ref('')

const userStr = localStorage.getItem('rahma_user')
let userObj = null
try {
  if (userStr) userObj = JSON.parse(userStr)
} catch (e) {}

const agentNom = computed(() => {
  if (!userObj) return 'Agent GP'
  return `${userObj.prenom || ''} ${userObj.nom || ''}`.trim() || 'Agent GP'
})

const matricule = computed(() => {
  return userObj?.agent_gp?.matricule || userObj?.agentGp?.matricule || ''
})

const entrepriseNom = computed(() => {
  return userObj?.agent_gp?.entreprise?.nom || userObj?.agentGp?.entreprise?.nom || 'Entreprise GP'
})

const statusOptions = [
  { label: 'Tous', value: 'tous' },
  { label: 'Publics / Actifs', value: 'publie' },
  { label: 'Brouillons', value: 'brouillon' },
  { label: 'Complets', value: 'complet' },
  { label: 'En cours', value: 'en_cours' },
  { label: 'Terminés', value: 'termine' },
  { label: 'Annulés', value: 'annule' }
]

const fetchAgentVoyages = async () => {
  loading.value = true
  try {
    const res = await agentService.getVoyages()
    const d = res?.data || res
    const list = Array.isArray(d) ? d : (d.voyages || d.data || [])
    voyages.value = list
  } catch (err) {
    console.error('Erreur chargement voyages agent:', err)
  } finally {
    loading.value = false
  }
}

onMounted(fetchAgentVoyages)

const totalVoyagesCount = computed(() => voyages.value.length)

const totalReservationsCount = computed(() => {
  return voyages.value.reduce((acc, v) => acc + (v.reservations ? v.reservations.length : 0), 0)
})

const totalKilosDisponibles = computed(() => {
  return voyages.value.reduce((acc, v) => acc + getKilosDispo(v), 0)
})

const getKilosDispo = (voyage) => {
  if (voyage.capacite_dispo !== undefined && voyage.capacite_dispo !== null) {
    return Math.max(0, Number(voyage.capacite_dispo))
  }
  if (voyage.poids_disponible !== undefined && voyage.poids_disponible !== null) {
    return Math.max(0, Number(voyage.poids_disponible))
  }
  const cap = Number(voyage.capacite_totale || 0)
  let reserved = Number(voyage.poids_reserve || 0)
  if (!reserved && Array.isArray(voyage.reservations)) {
    reserved = voyage.reservations
      .filter(r => r.statut === 'acceptee' || r.statut === 'confirmee' || r.statut === 'en_attente')
      .reduce((sum, r) => sum + Number(r.colis?.poids || r.poids || 0), 0)
  }
  return Math.max(0, cap - reserved)
}

const filteredVoyages = computed(() => {
  return voyages.value.filter(v => {
    if (selectedStatut.value !== 'tous' && v.statut !== selectedStatut.value) {
      return false
    }
    if (searchQuery.value) {
      const q = searchQuery.value.toLowerCase()
      const dep = (v.ville_depart || '').toLowerCase()
      const dest = (v.ville_destination || v.ville_arrivee || '').toLowerCase()
      const pDep = (v.pays_depart || '').toLowerCase()
      const pDest = (v.pays_destination || '').toLowerCase()
      return dep.includes(q) || dest.includes(q) || pDep.includes(q) || pDest.includes(q)
    }
    return true
  })
})

const truncateText = (text, maxLength = 30) => {
  if (!text) return ''
  const str = String(text)
  if (str.length <= maxLength) return str
  return str.slice(0, maxLength) + '...'
}

const getStatutBadgeClass = (statut) => {
  if (statut === 'publie' || statut === 'programme' || statut === 'actif') return 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
  if (statut === 'brouillon') return 'bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-800'
  if (statut === 'complet') return 'bg-purple-50 dark:bg-purple-950/60 text-purple-800 dark:text-purple-300 border-purple-200 dark:border-purple-800'
  if (statut === 'en_cours') return 'bg-sky-50 dark:bg-sky-950/60 text-sky-800 dark:text-sky-300 border-sky-200 dark:border-sky-800'
  if (statut === 'termine') return 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
  if (statut === 'annule') return 'bg-red-50 dark:bg-rose-950/60 text-red-800 dark:text-rose-300 border-red-200 dark:border-rose-800'
  return 'bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-800'
}

const formatDate = (dateStr) => {
  if (!dateStr) return '-'
  return new Date(dateStr).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  })
}

const goToVoyageDetail = (id) => {
  const masked = encodeId(id)
  router.push(`/agent/voyages/${masked}`)
}
</script>
