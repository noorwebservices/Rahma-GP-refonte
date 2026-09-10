<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const activeTab = ref('active') // 'active' | 'delivered'

const parcels = ref([
  {
    id: 1,
    code: '#RS-7729',
    status: 'En attente',
    transporter: 'Rahma Gp',
    routeFrom: 'Dakar',
    countryFrom: 'Sénégal',
    flagFrom: '🇸🇳',
    routeTo: 'Paris',
    countryTo: 'France',
    flagTo: '🇫🇷',
    departureDate: '22 Septembre 2026',
    weight: '6Kg',
    price: '51 000 F CFA'
  },
  {
    id: 2,
    code: '#RS-7729',
    status: 'En attente',
    transporter: 'Rahma Gp',
    routeFrom: 'Dakar',
    countryFrom: 'Sénégal',
    flagFrom: '🇸🇳',
    routeTo: 'Paris',
    countryTo: 'France',
    flagTo: '🇫🇷',
    departureDate: '22 Septembre 2026',
    weight: '6Kg',
    price: '51 000 F CFA'
  },
  {
    id: 3,
    code: '#RS-7729',
    status: 'En attente',
    transporter: 'Rahma Gp',
    routeFrom: 'Dakar',
    countryFrom: 'Sénégal',
    flagFrom: '🇸🇳',
    routeTo: 'Paris',
    countryTo: 'France',
    flagTo: '🇫🇷',
    departureDate: '22 Septembre 2026',
    weight: '6Kg',
    price: '51 000 F CFA'
  }
])

const goToTrackParcel = (id) => {
  router.push(`/client/colis/${id}`)
}
</script>

<template>
  <div class="space-y-5 pb-16">
    <!-- Header Title & Subtitle -->
    <div class="space-y-1">
      <h1 class="text-xl sm:text-2xl font-serif font-bold text-principal-dark">Mes colis</h1>
      <p class="text-xs sm:text-sm text-gray-500">Gérez et suivez vos colis en temps réel</p>
    </div>

    <!-- Filter Tabs (En cours / Livrés) -->
    <div class="bg-[#EAEFF4]/60 p-1.5 rounded-2xl flex items-center gap-2 w-full max-w-sm">
      <button
        @click="activeTab = 'active'"
        class="flex-1 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer flex items-center justify-center gap-1.5"
        :class="activeTab === 'active' ? 'bg-white text-[#053754] shadow-sm' : 'text-gray-500 hover:text-gray-700'"
      >
        <span>En cours</span>
        <span class="w-5 h-5 rounded-full bg-[#053754] text-white text-[10px] flex items-center justify-center font-black">3</span>
      </button>

      <button
        @click="activeTab = 'delivered'"
        class="flex-1 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer flex items-center justify-center gap-1.5"
        :class="activeTab === 'delivered' ? 'bg-white text-[#053754] shadow-sm' : 'text-gray-500 hover:text-gray-700'"
      >
        <span>Livrés</span>
        <span class="w-5 h-5 rounded-full bg-gray-300 text-gray-700 text-[10px] flex items-center justify-center font-bold">1</span>
      </button>
    </div>

    <!-- Parcels Cards List -->
    <div class="space-y-4">
      <div
        v-for="parcel in parcels"
        :key="parcel.id"
        class="bg-white rounded-3xl p-5 border border-gray-200 shadow-sm space-y-4 hover:border-sky-300 transition-all"
      >
        <!-- Card Top Bar: Code + Status Badge + Transporter Tag -->
        <div class="space-y-2">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2">
              <span class="text-lg">📦</span>
              <span class="font-extrabold text-[#053754] text-sm sm:text-base">{{ parcel.code }}</span>
            </div>

            <!-- Status Badge -->
            <span class="bg-amber-50 text-amber-600 border border-amber-300 text-[11px] font-extrabold px-3.5 py-1 rounded-full">
              {{ parcel.status }}
            </span>
          </div>

          <!-- Transporter Badge -->
          <div class="flex justify-end">
            <div class="bg-[#EAEFF4] text-gray-700 text-xs font-semibold px-3 py-1 rounded-full flex items-center gap-1.5 border border-gray-200/80">
              <svg class="w-3.5 h-3.5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <span>{{ parcel.transporter }}</span>
            </div>
          </div>
        </div>

        <!-- Route Graphic -->
        <div class="flex items-center justify-between px-2 pt-1">
          <!-- Departure -->
          <div class="space-y-0.5">
            <span class="text-xl">🇸🇳</span>
            <h4 class="text-sm font-extrabold text-gray-900 leading-tight">{{ parcel.routeFrom }}</h4>
            <p class="text-[11px] text-gray-400 font-medium">{{ parcel.countryFrom }}</p>
          </div>

          <!-- Flight Line -->
          <div class="flex-1 max-w-[160px] sm:max-w-[220px] px-2 flex items-center justify-center">
            <div class="w-full flex items-center gap-1">
              <span class="w-2.5 h-2.5 rounded-full bg-red-500 shrink-0"></span>
              <div class="flex-1 border-t-2 border-dashed border-red-400"></div>
              <div class="bg-white px-1 transform -rotate-12">
                <span class="text-red-500 text-sm font-bold">✈</span>
              </div>
              <div class="flex-1 border-t-2 border-dashed border-amber-400"></div>
              <span class="w-2.5 h-2.5 rounded-full bg-amber-400 shrink-0"></span>
            </div>
          </div>

          <!-- Destination -->
          <div class="space-y-0.5 text-right">
            <span class="text-xl">🇫🇷</span>
            <h4 class="text-sm font-extrabold text-gray-900 leading-tight">{{ parcel.routeTo }}</h4>
            <p class="text-[11px] text-gray-400 font-medium">{{ parcel.countryTo }}</p>
          </div>
        </div>

        <!-- Details Info Grid -->
        <div class="border-t border-gray-100 pt-3 grid grid-cols-2 gap-2 text-xs">
          <div>
            <span class="text-gray-400 block font-medium">Départ</span>
            <span class="font-extrabold text-gray-800 text-xs sm:text-sm">{{ parcel.departureDate }}</span>
          </div>
          <div class="text-right">
            <span class="text-gray-400 block font-medium">Poids du colis</span>
            <span class="font-extrabold text-gray-800 text-xs sm:text-sm">{{ parcel.weight }}</span>
          </div>
        </div>

        <!-- Price & Action Button -->
        <div class="border-t border-gray-100 pt-3 flex items-center justify-between">
          <span class="font-black text-[#053754] text-base sm:text-lg">{{ parcel.price }}</span>

          <button
            @click="goToTrackParcel(parcel.id)"
            type="button"
            class="bg-[#B50302] hover:bg-[#8B0000] text-white font-extrabold px-6 py-2.5 rounded-xl text-xs uppercase shadow-xs transition-colors cursor-pointer tracking-wider"
          >
            SUIVRE
          </button>
        </div>

      </div>
    </div>
  </div>
</template>
