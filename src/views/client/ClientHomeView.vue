<script setup>
import { ref, computed } from 'vue'
import VoyageCard from '@/components/client/VoyageCard.vue'
import CitySelect from '@/components/client/CitySelect.vue'

const departCity = ref('Dakar')
const destinationCity = ref('Paris')
const activeFilter = ref('all') // 'all' | 'recommande' | 'urgent'
const isSearchActive = ref(false)

const currentPage = ref(1)
const itemsPerPage = 3

const staticVoyages = ref([
  {
    id: 1,
    recommande: true,
    depart: 'Dakar',
    destination: 'Paris',
    date: '18 Septembre 2026',
    type_transporteur: 'Entreprise GP',
    poids_disponible: 15,
    poids_total: 25,
    point_collecte: 'Parcelle unité 26',
    transporteur_nom: 'Rahma Gp Express',
    note: '4.9',
    prix: '5 500'
  },
  {
    id: 2,
    recommande: false,
    badge: 'Entreprise GP',
    depart: 'Dakar',
    destination: 'Paris',
    date: '20 Septembre 2026',
    type_transporteur: 'Entreprise GP',
    poids_disponible: 18,
    poids_total: 30,
    point_collecte: 'Mariste 2, Dakar',
    transporteur_nom: 'Rahma Gp Express',
    note: '4.9',
    prix: '6 000'
  },
  {
    id: 3,
    recommande: false,
    badge: 'Particulier Vérifié',
    depart: 'Dakar',
    destination: 'Paris',
    date: '22 Septembre 2026',
    type_transporteur: 'Voyageur GP',
    poids_disponible: 10,
    poids_total: 20,
    point_collecte: 'Aéroport Blaise Diagne',
    transporteur_nom: 'Fatou Ndiaye GP',
    note: '5.0',
    prix: '5 000'
  },
  {
    id: 4,
    recommande: true,
    depart: 'Thiès',
    destination: 'Lyon',
    date: '24 Septembre 2026',
    type_transporteur: 'Entreprise GP',
    poids_disponible: 12,
    poids_total: 25,
    point_collecte: 'Gare routière Thiès',
    transporteur_nom: 'Thiès Fret GP',
    note: '4.8',
    prix: '5 800'
  },
  {
    id: 5,
    recommande: false,
    badge: 'Entreprise GP',
    depart: 'Dakar',
    destination: 'Marseille',
    date: '25 Septembre 2026',
    type_transporteur: 'Entreprise GP',
    poids_disponible: 22,
    poids_total: 40,
    point_collecte: 'Point E, Dakar',
    transporteur_nom: 'Dakar Cargo GP',
    note: '4.9',
    prix: '5 500'
  }
])

const filteredVoyages = computed(() => {
  return staticVoyages.value.filter(v => {
    // City Search Filter (when search button is triggered or cities are selected)
    if (isSearchActive.value) {
      const matchDepart = !departCity.value || v.depart.toLowerCase().includes(departCity.value.toLowerCase())
      const matchDest = !destinationCity.value || v.destination.toLowerCase().includes(destinationCity.value.toLowerCase())
      if (!matchDepart || !matchDest) return false
    }

    // Category Filter Pills
    if (activeFilter.value === 'recommande') return v.recommande
    if (activeFilter.value === 'urgent') return v.poids_disponible < 15
    return true
  })
})

const totalPages = computed(() => Math.ceil(filteredVoyages.value.length / itemsPerPage) || 1)

const paginatedVoyages = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage
  return filteredVoyages.value.slice(start, start + itemsPerPage)
})

const handleSearch = () => {
  isSearchActive.value = true
  currentPage.value = 1
}

const resetSearch = () => {
  isSearchActive.value = false
  departCity.value = 'Dakar'
  destinationCity.value = 'Paris'
  activeFilter.value = 'all'
  currentPage.value = 1
}
</script>

<template>
  <div class="space-y-6">
    
    <!-- Responsive Desktop / Mobile Layout Container -->
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      
      <!-- Search Card (Full width on mobile, 5 cols on Desktop) -->
      <div class="lg:col-span-5 bg-[#053754] text-white rounded-3xl p-6 sm:p-7 shadow-xl relative overflow-hidden space-y-5 lg:sticky lg:top-20">
        <!-- Background texture overlay -->
        <div class="absolute inset-0 opacity-10 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none"></div>

        <div class="relative z-10 space-y-2">
          <span class="inline-block bg-white/15 backdrop-blur-md px-3.5 py-1 rounded-full text-[10px] sm:text-xs font-bold uppercase tracking-wider text-[#FF9F02] border border-white/10">
            Transport international de colis
          </span>
          <h1 class="text-xl sm:text-2xl font-serif font-bold text-white leading-tight">
            Où souhaitez-vous envoyer votre colis ?
          </h1>
        </div>

        <!-- Search Form Box (White box inside hero) -->
        <div class="bg-white rounded-2xl p-4 sm:p-5 text-gray-800 shadow-lg space-y-4 relative z-10">
          
          <!-- Ville Départ avec Recherche -->
          <CitySelect
            id="depart"
            label="DÉPART"
            v-model="departCity"
            @change="handleSearch"
          />

          <!-- Ville Destination avec Recherche -->
          <CitySelect
            id="destination"
            label="DESTINATION"
            v-model="destinationCity"
            @change="handleSearch"
          />

          <!-- Red Search Button (#B50302) -->
          <button
            type="button"
            @click="handleSearch"
            class="w-full bg-[#B50302] hover:bg-[#870202] text-white font-extrabold text-xs sm:text-sm py-3.5 rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99]"
          >
            <svg class="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <span>Rechercher les trajets disponible</span>
          </button>
        </div>
      </div>

      <!-- Main Results Column (Full width on mobile, 7 cols on Desktop) -->
      <div class="lg:col-span-7 space-y-5">
        
        <!-- Filter Pills Navigation & Search Reset Indicator -->
        <div class="flex items-center justify-between gap-3">
          <div class="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
            <button
              @click="activeFilter = 'all'; currentPage = 1"
              :class="[
                'px-4 py-2.5 rounded-full text-xs font-extrabold whitespace-nowrap transition-all cursor-pointer shadow-2xs',
                activeFilter === 'all'
                  ? 'bg-[#074C72] text-white shadow-md'
                  : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
              ]"
            >
              Tout ({{ filteredVoyages.length }})
            </button>

            <button
              @click="activeFilter = 'recommande'; currentPage = 1"
              :class="[
                'px-4 py-2.5 rounded-full text-xs font-extrabold whitespace-nowrap transition-all cursor-pointer shadow-2xs',
                activeFilter === 'recommande'
                  ? 'bg-[#074C72] text-white shadow-md'
                  : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
              ]"
            >
              Recommandés
            </button>

            <button
              @click="activeFilter = 'urgent'; currentPage = 1"
              :class="[
                'px-4 py-2.5 rounded-full text-xs font-extrabold whitespace-nowrap transition-all cursor-pointer shadow-2xs',
                activeFilter === 'urgent'
                  ? 'bg-[#074C72] text-white shadow-md'
                  : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
              ]"
            >
              Urgents
            </button>
          </div>

          <button
            v-if="isSearchActive"
            @click="resetSearch"
            class="text-xs text-[#B50302] font-bold underline hover:text-[#870202] shrink-0"
          >
            Réinitialiser
          </button>
        </div>

        <!-- Voyages List -->
        <div class="space-y-4">
          <VoyageCard
            v-for="v in paginatedVoyages"
            :key="v.id"
            :voyage="v"
          />

          <!-- Empty Search State -->
          <div v-if="paginatedVoyages.length === 0" class="bg-white rounded-3xl p-8 text-center space-y-3 border border-gray-200 shadow-sm">
            <div class="w-12 h-12 rounded-full bg-red-50 text-[#B50302] flex items-center justify-center mx-auto text-xl font-bold">
              🔍
            </div>
            <h3 class="text-base font-bold text-[#074C72]">Aucun trajet disponible</h3>
            <p class="text-xs text-gray-500 max-w-sm mx-auto">
              Aucun voyage ne correspond à la recherche <span class="font-bold text-gray-700">{{ departCity }} ➔ {{ destinationCity }}</span>.
            </p>
            <button
              @click="resetSearch"
              class="px-5 py-2.5 rounded-xl bg-[#074C72] text-white text-xs font-bold shadow-md hover:bg-[#053754] transition-all cursor-pointer"
            >
              Voir tous les trajets disponibles
            </button>
          </div>
        </div>

        <!-- Dynamic Pagination -->
        <div v-if="totalPages > 1" class="flex items-center justify-center gap-2 pt-4 pb-6">
          <button
            @click="currentPage > 1 && currentPage--"
            :disabled="currentPage === 1"
            class="w-10 h-10 rounded-full border border-gray-300 bg-white text-gray-600 flex items-center justify-center hover:bg-gray-100 font-bold transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            ‹
          </button>

          <button
            v-for="p in totalPages"
            :key="p"
            @click="currentPage = p"
            :class="[
              'w-10 h-10 rounded-full font-bold text-xs flex items-center justify-center transition-colors cursor-pointer',
              currentPage === p
                ? 'bg-[#074C72] text-white font-extrabold shadow-md'
                : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
            ]"
          >
            {{ p }}
          </button>

          <button
            @click="currentPage < totalPages && currentPage++"
            :disabled="currentPage === totalPages"
            class="w-10 h-10 rounded-full border border-gray-300 bg-white text-gray-600 flex items-center justify-center hover:bg-gray-100 font-bold transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            ›
          </button>
        </div>

      </div>
    </div>

  </div>
</template>
