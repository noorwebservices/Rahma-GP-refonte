<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const activeTab = ref('pending') // 'pending' | 'accepted' | 'refused'

const demandes = ref([
  {
    id: 1,
    code: '#RS-7729',
    clientName: 'Mariama Diallo',
    routeFrom: 'Dakar',
    countryFrom: 'Sénégal',
    flagFrom: '🇸🇳',
    routeTo: 'Paris',
    countryTo: 'France',
    flagTo: '🇫🇷',
    departureDate: '22 Septembre 2026',
    parcelType: 'Vêtements & tissus',
    weight: '6Kg',
    price: '51 000 F CFA',
    status: 'pending'
  },
  {
    id: 2,
    code: '#RS-8830',
    clientName: 'Moustapha Ndiaye',
    routeFrom: 'Dakar',
    countryFrom: 'Sénégal',
    flagFrom: '🇸🇳',
    routeTo: 'Paris',
    countryTo: 'France',
    flagTo: '🇫🇷',
    departureDate: '22 Septembre 2026',
    parcelType: 'Documents & Papiers',
    weight: '1Kg',
    price: '15 000 F CFA',
    status: 'pending'
  }
])

const goToDetail = (id) => {
  router.push(`/voyageur/demandes/${id}`)
}
</script>

<template>
  <div class="space-y-5 pb-16">
    <!-- Header Title & Subtitle -->
    <div class="space-y-1">
      <h1 class="text-xl sm:text-2xl font-serif font-bold text-principal-dark">Demandes de réservation</h1>
      <p class="text-xs sm:text-sm text-gray-500">Gérez les demandes reçues de la part des clients</p>
    </div>

    <!-- Filter Tabs (En attente / Acceptées / Refusées) -->
    <div class="bg-[#EAEFF4]/60 p-1.5 rounded-2xl flex items-center gap-2 w-full max-w-md">
      <button
        @click="activeTab = 'pending'"
        class="flex-1 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer flex items-center justify-center gap-1.5"
        :class="activeTab === 'pending' ? 'bg-white text-[#053754] shadow-sm' : 'text-gray-500 hover:text-gray-700'"
      >
        <span>En attente</span>
        <span class="w-5 h-5 rounded-full bg-amber-500 text-white text-[10px] flex items-center justify-center font-black">2</span>
      </button>

      <button
        @click="activeTab = 'accepted'"
        class="flex-1 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer flex items-center justify-center gap-1.5"
        :class="activeTab === 'accepted' ? 'bg-white text-[#053754] shadow-sm' : 'text-gray-500 hover:text-gray-700'"
      >
        <span>Acceptées</span>
        <span class="w-5 h-5 rounded-full bg-emerald-600 text-white text-[10px] flex items-center justify-center font-bold">5</span>
      </button>

      <button
        @click="activeTab = 'refused'"
        class="flex-1 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer flex items-center justify-center gap-1.5"
        :class="activeTab === 'refused' ? 'bg-white text-[#053754] shadow-sm' : 'text-gray-500 hover:text-gray-700'"
      >
        <span>Refusées</span>
        <span class="w-5 h-5 rounded-full bg-gray-300 text-gray-700 text-[10px] flex items-center justify-center font-bold">1</span>
      </button>
    </div>

    <!-- Demandes Cards Grid (2 per row on desktop: grid-cols-1 lg:grid-cols-2) -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <div
        v-for="demande in demandes"
        :key="demande.id"
        class="bg-white rounded-3xl p-5 border border-gray-200 shadow-sm space-y-4 hover:border-sky-300 transition-all cursor-pointer flex flex-col justify-between"
        @click="goToDetail(demande.id)"
      >
        <!-- Top Bar: Code + Client Tag + Status Badge -->
        <div class="space-y-1.5">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2">
              <span class="text-base">📦</span>
              <span class="font-extrabold text-[#053754] text-xs sm:text-sm">{{ demande.code }}</span>
            </div>

            <!-- Status Badge -->
            <span
              class="text-[11px] font-extrabold px-3.5 py-1 rounded-full border"
              :class="{
                'bg-amber-50 text-amber-700 border-amber-300': demande.status === 'pending',
                'bg-emerald-50 text-emerald-700 border-emerald-200': demande.status === 'accepted',
                'bg-red-50 text-red-700 border-red-200': demande.status === 'refused'
              }"
            >
              {{ demande.status === 'pending' ? '⏳ En attente' : demande.status === 'accepted' ? '✓ Acceptée' : '✕ Refusée' }}
            </span>
          </div>

          <!-- Client Tag -->
          <div class="flex justify-end">
            <span class="bg-gray-100 text-gray-700 text-xs font-semibold px-3 py-0.5 rounded-full border border-gray-200">
              👤 Client: {{ demande.clientName }}
            </span>
          </div>
        </div>

        <!-- Route Graphic (Matching Client card styling) -->
        <div class="flex items-center justify-between px-1 pt-1">
          <!-- Departure -->
          <div class="space-y-0.5">
            <span class="text-lg">{{ demande.flagFrom }}</span>
            <h4 class="text-xs sm:text-sm font-extrabold text-gray-900 leading-tight">{{ demande.routeFrom }}</h4>
            <p class="text-[10px] text-gray-400 font-medium">{{ demande.countryFrom }}</p>
          </div>

          <!-- Flight Line Graphic -->
          <div class="flex-1 max-w-[140px] sm:max-w-[200px] px-2 flex items-center justify-center">
            <div class="w-full flex items-center gap-1">
              <span class="w-2 h-2 rounded-full bg-red-500 shrink-0"></span>
              <div class="flex-1 border-t-2 border-dashed border-red-400"></div>
              <div class="bg-white px-1 transform -rotate-12">
                <span class="text-red-500 text-xs font-bold">✈</span>
              </div>
              <div class="flex-1 border-t-2 border-dashed border-amber-400"></div>
              <span class="w-2 h-2 rounded-full bg-amber-400 shrink-0"></span>
            </div>
          </div>

          <!-- Destination -->
          <div class="space-y-0.5 text-right">
            <span class="text-lg">{{ demande.flagTo }}</span>
            <h4 class="text-xs sm:text-sm font-extrabold text-gray-900 leading-tight">{{ demande.routeTo }}</h4>
            <p class="text-[10px] text-gray-400 font-medium">{{ demande.countryTo }}</p>
          </div>
        </div>

        <!-- Details Grid -->
        <div class="border-t border-gray-100 pt-3 grid grid-cols-2 gap-2 text-xs">
          <div>
            <span class="text-gray-400 block font-medium text-[11px]">Départ</span>
            <span class="font-extrabold text-gray-800 text-xs">{{ demande.departureDate }}</span>
          </div>
          <div class="text-right">
            <span class="text-gray-400 block font-medium text-[11px]">Poids colis</span>
            <span class="font-extrabold text-gray-800 text-xs">{{ demande.weight }}</span>
          </div>
        </div>

        <!-- Price & Eye Icon Button Row -->
        <div class="border-t border-gray-100 pt-3 flex items-center justify-between">
          <span class="font-black text-[#053754] text-sm sm:text-base">{{ demande.price }}</span>

          <!-- Eye Icon Button instead of text -->
          <button
            @click.stop="goToDetail(demande.id)"
            type="button"
            title="Voir les détails"
            class="bg-[#053754] hover:bg-[#074C72] text-white p-2.5 rounded-xl transition-all shadow-xs flex items-center justify-center cursor-pointer active:scale-95"
          >
            <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
