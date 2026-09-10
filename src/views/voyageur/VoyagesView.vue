<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const activeTab = ref('upcoming') // 'upcoming' | 'ongoing' | 'completed'

const voyages = ref([
  {
    id: 'voy-1',
    routeFrom: 'Dakar',
    countryFrom: 'Sénégal',
    flagFrom: '🇸🇳',
    routeTo: 'Paris',
    countryTo: 'France',
    flagTo: '🇫🇷',
    departureDate: '22 Septembre 2026',
    arrivalDate: '23 Septembre 2026',
    capaciteTotale: 20,
    capaciteDispo: 14,
    prixKg: '8 500 F CFA',
    reservationsCount: 2,
    statut: 'publie'
  },
  {
    id: 'voy-2',
    routeFrom: 'Paris',
    countryFrom: 'France',
    flagFrom: '🇫🇷',
    routeTo: 'Abidjan',
    countryTo: 'Côte d\'Ivoire',
    flagTo: '🇨🇮',
    departureDate: '05 Octobre 2026',
    arrivalDate: '06 Octobre 2026',
    capaciteTotale: 25,
    capaciteDispo: 25,
    prixKg: '9 000 F CFA',
    reservationsCount: 0,
    statut: 'brouillon'
  }
])

const goToCreateVoyage = () => {
  router.push('/voyageur/voyages/nouveau')
}

const goToEditVoyage = (id) => {
  router.push(`/voyageur/voyages/${id}/edit`)
}

const goToVoyageDetail = (id) => {
  router.push(`/voyageur/voyages/${id}`)
}

const goToRevenus = () => {
  router.push('/voyageur/revenus')
}

const goToDemandes = () => {
  router.push('/voyageur/demandes')
}
</script>

<template>
  <div class="space-y-6 pb-16">
    <!-- Header Title & Action -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h1 class="text-xl sm:text-2xl font-serif font-bold text-principal-dark">Mes voyages GP</h1>
        <p class="text-xs sm:text-sm text-gray-500">Publiez vos trajets et gérez vos capacités de bagages</p>
      </div>

      <button
        @click="goToCreateVoyage"
        type="button"
        class="bg-[#B50302] hover:bg-[#8B0000] text-white font-extrabold text-xs sm:text-sm py-3 px-5 rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer uppercase tracking-wider shrink-0 active:scale-[0.99]"
      >
        <span>➕ PUBLIER UN VOYAGE</span>
      </button>
    </div>

    <!-- Quick Stats Cards Banner (1 per line on mobile, 3 columns on sm) -->
    <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
      <!-- Total Earnings Card -->
      <div @click="goToRevenus" class="bg-white rounded-2xl p-4 border border-gray-200 shadow-2xs hover:border-[#074C72] transition-all cursor-pointer space-y-1">
        <span class="text-[11px] font-bold text-gray-400 block uppercase">Revenus générés</span>
        <div class="text-base sm:text-lg font-black text-[#053754]">350 000 F CFA</div>
        <span class="text-[10px] text-emerald-600 font-bold flex items-center gap-0.5">
          ↗ 3 réservations payées
        </span>
      </div>

      <!-- Pending Requests Card -->
      <div @click="goToDemandes" class="bg-white rounded-2xl p-4 border border-amber-200 bg-amber-50/40 shadow-2xs hover:border-amber-400 transition-all cursor-pointer space-y-1">
        <span class="text-[11px] font-bold text-amber-700 block uppercase">Demandes en attente</span>
        <div class="text-base sm:text-lg font-black text-amber-900">2 demandes</div>
        <span class="text-[10px] text-amber-600 font-bold underline">
          Répondre aux clients ➔
        </span>
      </div>

      <!-- Total Trips Card -->
      <div class="bg-white rounded-2xl p-4 border border-gray-200 shadow-2xs space-y-1">
        <span class="text-[11px] font-bold text-gray-400 block uppercase">Note Voyageur</span>
        <div class="text-base sm:text-lg font-black text-[#053754] flex items-center gap-1.5">
          <span>⭐ 4.9</span>
          <span class="text-xs text-gray-400 font-medium">(32 avis)</span>
        </div>
        <span class="text-[10px] text-gray-500 font-medium">Transports vérifiés</span>
      </div>
    </div>

    <!-- Filter Tabs (À venir / En cours / Terminés) -->
    <div class="bg-[#EAEFF4]/60 p-1.5 rounded-2xl flex items-center gap-2 w-full max-w-md">
      <button
        @click="activeTab = 'upcoming'"
        class="flex-1 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer flex items-center justify-center gap-1.5"
        :class="activeTab === 'upcoming' ? 'bg-white text-[#053754] shadow-sm' : 'text-gray-500 hover:text-gray-700'"
      >
        <span>À venir</span>
        <span class="w-5 h-5 rounded-full bg-[#053754] text-white text-[10px] flex items-center justify-center font-black">2</span>
      </button>

      <button
        @click="activeTab = 'ongoing'"
        class="flex-1 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer flex items-center justify-center gap-1.5"
        :class="activeTab === 'ongoing' ? 'bg-white text-[#053754] shadow-sm' : 'text-gray-500 hover:text-gray-700'"
      >
        <span>En cours</span>
        <span class="w-5 h-5 rounded-full bg-gray-300 text-gray-700 text-[10px] flex items-center justify-center font-bold">1</span>
      </button>

      <button
        @click="activeTab = 'completed'"
        class="flex-1 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer flex items-center justify-center gap-1.5"
        :class="activeTab === 'completed' ? 'bg-white text-[#053754] shadow-sm' : 'text-gray-500 hover:text-gray-700'"
      >
        <span>Terminés</span>
        <span class="w-5 h-5 rounded-full bg-gray-300 text-gray-700 text-[10px] flex items-center justify-center font-bold">4</span>
      </button>
    </div>

    <!-- Voyages List -->
    <div class="space-y-4">
      <div
        v-for="voyage in voyages"
        :key="voyage.id"
        class="bg-white rounded-3xl p-5 border border-gray-200 shadow-sm space-y-4 hover:border-sky-300 transition-all"
      >
        <!-- Top Bar: Status Badge + Reservations Tag -->
        <div class="flex items-center justify-between">
          <span
            class="text-[11px] font-extrabold px-3.5 py-1 rounded-full uppercase tracking-wider border"
            :class="voyage.statut === 'publie' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-gray-100 text-gray-700 border-gray-300'"
          >
            {{ voyage.statut === 'publie' ? 'Publié & Ouvert' : '📝 Brouillon (Non publié)' }}
          </span>

          <span class="bg-sky-50 text-[#074C72] text-xs font-extrabold px-3 py-1 rounded-full border border-sky-100 flex items-center gap-1">
            <span>📦</span> {{ voyage.reservationsCount }} réservation(s)
          </span>
        </div>

        <!-- Route Graphic -->
        <div class="flex items-center justify-between px-2 pt-1">
          <!-- Departure -->
          <div class="space-y-0.5">
            <span class="text-xl">{{ voyage.flagFrom }}</span>
            <h4 class="text-base font-extrabold text-gray-900 leading-tight">{{ voyage.routeFrom }}</h4>
            <p class="text-xs text-gray-400 font-medium">{{ voyage.countryFrom }}</p>
          </div>

          <!-- Flight Line Graphic -->
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
            <span class="text-xl">{{ voyage.flagTo }}</span>
            <h4 class="text-base font-extrabold text-gray-900 leading-tight">{{ voyage.routeTo }}</h4>
            <p class="text-xs text-gray-400 font-medium">{{ voyage.countryTo }}</p>
          </div>
        </div>

        <!-- Capacity Visual Bar -->
        <div class="space-y-1.5 pt-2 border-t border-gray-100">
          <div class="flex justify-between text-xs font-bold">
            <span class="text-gray-500">Capacité disponible :</span>
            <span class="text-[#053754]">{{ voyage.capaciteDispo }} Kg / {{ voyage.capaciteTotale }} Kg</span>
          </div>
          <div class="w-full bg-gray-100 h-2.5 rounded-full overflow-hidden">
            <div
              class="bg-[#053754] h-full rounded-full transition-all"
              :style="{ width: `${((voyage.capaciteTotale - voyage.capaciteDispo) / voyage.capaciteTotale) * 100}%` }"
            ></div>
          </div>
        </div>

        <!-- Details Info Row & Actions (Same horizontal line for Date, Price & Action Button) -->
        <div class="border-t border-gray-100 pt-3 flex items-center justify-between gap-2 text-xs">
          <div class="space-y-0.5">
            <span class="text-gray-400 block font-medium text-[11px]">Départ - Arrivée</span>
            <span class="font-extrabold text-gray-800 text-xs sm:text-sm">{{ voyage.departureDate }}</span>
          </div>

          <div class="space-y-0.5 text-center">
            <span class="text-gray-400 block font-medium text-[11px]">Tarif au Kg</span>
            <span class="font-black text-[#B50302] text-xs sm:text-sm whitespace-nowrap">{{ voyage.prixKg }}</span>
          </div>

          <div class="shrink-0">
            <button
              v-if="voyage.statut === 'brouillon'"
              @click="goToEditVoyage(voyage.id)"
              type="button"
              class="bg-[#B50302] hover:bg-[#8B0000] text-white font-extrabold px-4 py-2.5 rounded-xl text-xs uppercase shadow-xs transition-colors cursor-pointer"
            >
              ÉDITER
            </button>

            <button
              v-else
              @click="goToVoyageDetail(voyage.id)"
              type="button"
              class="bg-[#053754] hover:bg-[#074C72] text-white font-extrabold px-4 py-2.5 rounded-xl text-xs uppercase shadow-xs transition-colors cursor-pointer"
            >
              GÉRER
            </button>
          </div>
        </div>

      </div>
    </div>
  </div>
</template>
