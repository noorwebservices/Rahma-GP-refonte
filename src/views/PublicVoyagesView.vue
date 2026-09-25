<script setup>
import { ref, computed, onMounted } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import { fetchPublicVoyages } from '@/services/voyageService'
import { formatImageUrl } from '@/utils/imageUrl'
import logoRouge from '@/assets/images/logo-rouge.svg'

const router = useRouter()

const loading = ref(true)
const voyages = ref([])
const villeDepart = ref('')
const villeDestination = ref('')

function isAuthenticated() {
  return !!(localStorage.getItem('rahma_token') || localStorage.getItem('token'))
}

async function load() {
  loading.value = true
  try {
    const params = {}
    if (villeDepart.value) params.ville_depart = villeDepart.value
    if (villeDestination.value) params.ville_destination = villeDestination.value
    const res = await fetchPublicVoyages(params)
    voyages.value = res.data || []
  } catch (e) {
    console.error('Erreur chargement voyages publics', e)
    voyages.value = []
  } finally {
    loading.value = false
  }
}

// Réserver : si connecté -> espace client ; sinon -> connexion puis retour.
function reserver() {
  if (isAuthenticated()) {
    router.push('/client')
  } else {
    router.push({ name: 'login', query: { redirect: '/client' } })
  }
}

function fmtDate(d) {
  if (!d) return ''
  return new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })
}
function nf(n) {
  return new Intl.NumberFormat('fr-FR').format(n || 0)
}

const hasResults = computed(() => voyages.value.length > 0)

onMounted(load)
</script>

<template>
  <div class="min-h-screen bg-gray-50 dark:bg-slate-950">
    <!-- Barre supérieure -->
    <header class="sticky top-0 z-30 bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-800">
      <div class="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <RouterLink to="/" class="flex items-center gap-2">
          <img :src="logoRouge" alt="Rahma Delivery" class="h-8 w-auto object-contain" />
        </RouterLink>
        <RouterLink
          to="/auth/login"
          class="bg-[#053754] hover:bg-[#074C72] text-white text-xs font-extrabold px-4 py-2 rounded-full transition"
        >
          Connexion
        </RouterLink>
      </div>
    </header>

    <main class="max-w-6xl mx-auto px-4 py-8 space-y-6">
      <!-- Titre -->
      <div class="text-center space-y-2">
        <h1 class="text-3xl sm:text-4xl font-black text-[#053754] dark:text-white">Voyages disponibles</h1>
        <p class="text-gray-500 dark:text-slate-400 text-sm max-w-2xl mx-auto">
          Trouvez un voyageur de confiance pour acheminer votre colis. Consultez librement les annonces —
          la réservation se fait après création de votre compte.
        </p>
      </div>

      <!-- Recherche -->
      <div class="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-2xl p-4 shadow-2xs flex flex-col sm:flex-row gap-3">
        <input
          v-model="villeDepart"
          @keyup.enter="load"
          type="text"
          placeholder="Ville de départ (ex. Paris)"
          class="flex-1 px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-sm text-gray-700 dark:text-slate-200 outline-none focus:border-[#053754]"
        />
        <input
          v-model="villeDestination"
          @keyup.enter="load"
          type="text"
          placeholder="Ville d'arrivée (ex. Dakar)"
          class="flex-1 px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-sm text-gray-700 dark:text-slate-200 outline-none focus:border-[#053754]"
        />
        <button
          @click="load"
          class="px-6 py-2.5 rounded-xl bg-[#B50302] hover:bg-[#870202] text-white text-sm font-extrabold uppercase tracking-wider transition active:scale-95"
        >
          Rechercher
        </button>
      </div>

      <!-- Chargement -->
      <div v-if="loading" class="bg-white dark:bg-slate-900 rounded-3xl p-12 text-center border border-gray-200 dark:border-slate-800">
        <div class="w-10 h-10 border-4 border-[#053754] dark:border-sky-400 border-t-transparent rounded-full animate-spin mx-auto"></div>
      </div>

      <!-- Résultats -->
      <div v-else-if="hasResults" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <article
          v-for="v in voyages"
          :key="v.id"
          class="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-3xl p-5 shadow-2xs flex flex-col gap-3"
        >
          <!-- Trajet -->
          <div class="flex items-center gap-2 text-[#053754] dark:text-white font-black">
            <span>{{ v.ville_depart }}</span>
            <span class="text-[#B50302]">→</span>
            <span>{{ v.ville_destination }}</span>
          </div>
          <p class="text-xs text-gray-400 -mt-2">{{ v.pays_depart }} → {{ v.pays_destination }}</p>

          <!-- Dates & prix -->
          <div class="flex items-center justify-between text-sm">
            <span class="text-gray-600 dark:text-slate-300">📅 {{ fmtDate(v.date_depart) }}</span>
            <span class="font-black text-[#053754] dark:text-sky-300">{{ nf(v.prix_kg) }} {{ v.devise }}<span class="text-xs text-gray-400 font-bold">/kg</span></span>
          </div>

          <div class="flex items-center justify-between text-xs text-gray-500 dark:text-slate-400">
            <span>Capacité dispo : <strong class="text-gray-700 dark:text-slate-200">{{ nf(v.capacite_dispo) }} kg</strong></span>
            <span v-if="v.total_evaluations > 0">⭐ {{ v.moyenne_notes }} ({{ v.total_evaluations }})</span>
          </div>

          <!-- Voyageur (GP) -->
          <div class="flex items-center gap-2 pt-2 border-t border-gray-100 dark:border-slate-800">
            <span v-if="v.voyageur?.avatar" class="w-8 h-8 rounded-full overflow-hidden shrink-0 border border-gray-200 dark:border-slate-700">
              <img :src="formatImageUrl(v.voyageur.avatar)" class="w-full h-full object-cover" />
            </span>
            <span v-else class="w-8 h-8 rounded-full bg-[#053754] text-white flex items-center justify-center text-xs font-black shrink-0">
              {{ (v.voyageur?.prenom || '?').charAt(0) }}
            </span>
            <span class="text-sm font-semibold text-gray-700 dark:text-slate-200">{{ v.voyageur?.prenom }} {{ v.voyageur?.nom_initial }}</span>
          </div>

          <button
            @click="reserver"
            class="mt-1 w-full py-2.5 rounded-xl bg-[#053754] hover:bg-[#074C72] text-white text-xs font-extrabold uppercase tracking-wider transition active:scale-95"
          >
            Réserver / Envoyer un colis
          </button>
        </article>
      </div>

      <!-- Vide -->
      <div v-else class="bg-white dark:bg-slate-900 rounded-3xl p-12 text-center border border-gray-200 dark:border-slate-800 space-y-2">
        <p class="text-4xl">🧳</p>
        <p class="text-sm font-bold text-gray-600 dark:text-slate-300">Aucun voyage disponible pour cette recherche.</p>
        <p class="text-xs text-gray-400">Revenez bientôt, de nouveaux voyages sont publiés régulièrement.</p>
      </div>
    </main>
  </div>
</template>
