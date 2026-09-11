<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { fetchReservations } from '@/services/reservationService'
import { formatVoyageDate } from '@/utils/flagHelper'
import CountryFlag from '@/components/common/CountryFlag.vue'
import { encodeId } from '@/utils/idMasker'

const router = useRouter()
const activeTab = ref('active') // 'active' | 'delivered'
const isLoading = ref(true)
const errorMsg = ref('')

const reservationsList = ref([])

const loadReservations = async () => {
  isLoading.value = true
  errorMsg.value = ''
  try {
    const res = await fetchReservations()
    if (res && res.data) {
      const rawArr = Array.isArray(res.data) ? res.data : (res.data.data || [])
      reservationsList.value = rawArr.map(r => {
        const v = r.voyage || {}
        const c = r.colis || {}
        const vUser = v.voyageur?.user || v.voyageur || {}
        const transporteurName = `${vUser.prenom || ''} ${vUser.nom || ''}`.trim() || 'Voyageur GP'

        return {
          id: r.id,
          code: r.numero || (c.numero_suivi ? `#${c.numero_suivi}` : `#RS-${r.id.slice(0, 8)}`),
          tracking: c.numero_suivi || r.code_tracking || 'TRK-EN-ATTENTE',
          status: r.statut || 'en_attente',
          transporter: transporteurName,
          routeFrom: v.ville_depart || 'Départ',
          countryFrom: v.pays_depart || '',
          routeTo: v.ville_destination || 'Destination',
          countryTo: v.pays_destination || '',
          departureDate: v.date_depart || r.date_demande || r.created_at,
          weight: c.poids ? `${c.poids} Kg` : (r.poids ? `${r.poids} Kg` : 'Forfait Objet'),
          price: `${r.montant_total || r.prix_total || 0} ${v.devise || 'XOF'}`,
          destinataire: `${c.destinataire_prenom || ''} ${c.destinataire_nom || ''}`.trim() || 'Non renseigné'
        }
      })
    }
  } catch (err) {
    errorMsg.value = err?.message || 'Erreur lors du chargement de vos colis.'
  } finally {
    isLoading.value = false
  }
}

onMounted(loadReservations)

const activeParcels = computed(() => {
  return reservationsList.value.filter(r => !['livree', 'livre', 'refusee', 'annulee', 'annule'].includes(r.status))
})

const deliveredParcels = computed(() => {
  return reservationsList.value.filter(r => ['livree', 'livre', 'refusee', 'annulee', 'annule'].includes(r.status))
})

const displayedParcels = computed(() => {
  return activeTab.value === 'active' ? activeParcels.value : deliveredParcels.value
})

const getStatusBadge = (statut) => {
  switch (statut) {
    case 'en_attente':
      return { text: 'En Attente', cls: 'bg-amber-50 text-amber-700 border-amber-300' }
    case 'acceptee':
      return { text: 'Acceptée', cls: 'bg-emerald-50 text-emerald-700 border-emerald-300' }
    case 'refusee':
      return { text: 'Refusée', cls: 'bg-red-50 text-red-700 border-red-300' }
    case 'annulee':
    case 'annule':
      return { text: 'Annulée', cls: 'bg-red-50 text-red-800 border-red-300' }
    case 'livree':
    case 'livre':
      return { text: 'Livré', cls: 'bg-blue-50 text-blue-700 border-blue-300' }
    default:
      return { text: statut || 'Inconnu', cls: 'bg-slate-100 text-slate-700 border-slate-200' }
  }
}

const goToTrackParcel = (id) => {
  const masked = encodeId(id)
  router.push(`/client/colis/${masked}`)
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
        <span class="w-5 h-5 rounded-full bg-[#053754] text-white text-[10px] flex items-center justify-center font-black">
          {{ activeParcels.length }}
        </span>
      </button>

      <button
        @click="activeTab = 'delivered'"
        class="flex-1 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer flex items-center justify-center gap-1.5"
        :class="activeTab === 'delivered' ? 'bg-white text-[#053754] shadow-sm' : 'text-gray-500 hover:text-gray-700'"
      >
        <span>Historique / Livrés</span>
        <span class="w-5 h-5 rounded-full bg-gray-300 text-gray-700 text-[10px] flex items-center justify-center font-bold">
          {{ deliveredParcels.length }}
        </span>
      </button>
    </div>

    <!-- Loading State -->
    <div v-if="isLoading" class="bg-white rounded-3xl p-12 text-center border border-gray-100 shadow-sm space-y-4">
      <div class="w-10 h-10 border-4 border-[#053754] border-t-transparent rounded-full animate-spin mx-auto"></div>
      <p class="text-sm font-bold text-gray-600">Chargement de vos réservations...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="errorMsg" class="bg-red-50 border border-red-200 rounded-3xl p-8 text-center space-y-3">
      <p class="text-sm font-bold text-red-800">{{ errorMsg }}</p>
      <button @click="loadReservations" class="px-4 py-2 bg-red-600 text-white font-bold text-xs rounded-xl cursor-pointer">Réessayer</button>
    </div>

    <!-- Parcels Cards List (2 per line on desktop) -->
    <div v-else-if="displayedParcels.length > 0" class="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <div
        v-for="parcel in displayedParcels"
        :key="parcel.id"
        class="bg-white rounded-3xl p-5 border border-gray-200 shadow-sm space-y-4 hover:border-sky-300 transition-all"
      >
        <!-- Card Top Bar: Code + Status Badge + Transporter Tag -->
        <div class="space-y-2">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2">
              <span class="text-lg">📦</span>
              <div>
                <span class="font-extrabold text-[#053754] text-sm sm:text-base block">{{ parcel.code }}</span>
                <span class="text-[11px] text-gray-400 font-mono block">{{ parcel.tracking }}</span>
              </div>
            </div>

            <!-- Status Badge -->
            <span
              class="text-[11px] font-extrabold px-3.5 py-1 rounded-full border uppercase tracking-wider"
              :class="getStatusBadge(parcel.status).cls"
            >
              {{ getStatusBadge(parcel.status).text }}
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
            <CountryFlag :city="parcel.routeFrom" :country="parcel.countryFrom" size="w-6 h-4" />
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
            <CountryFlag :city="parcel.routeTo" :country="parcel.countryTo" size="w-6 h-4" />
            <h4 class="text-sm font-extrabold text-gray-900 leading-tight">{{ parcel.routeTo }}</h4>
            <p class="text-[11px] text-gray-400 font-medium">{{ parcel.countryTo }}</p>
          </div>
        </div>

        <!-- Details Info Grid -->
        <div class="border-t border-gray-100 pt-3 grid grid-cols-2 gap-2 text-xs">
          <div>
            <span class="text-gray-400 block font-medium">Départ prévu</span>
            <span class="font-extrabold text-gray-800 text-xs sm:text-sm">{{ formatVoyageDate(parcel.departureDate) }}</span>
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
            v-if="!['annulee', 'annule'].includes(parcel.status)"
            @click="goToTrackParcel(parcel.id)"
            type="button"
            class="bg-[#B50302] hover:bg-[#8B0000] text-white font-extrabold px-6 py-2.5 rounded-xl text-xs uppercase shadow-xs transition-colors cursor-pointer tracking-wider"
          >
            SUIVRE
          </button>
        </div>

      </div>
    </div>

    <!-- Empty State -->
    <div v-else class="bg-white rounded-3xl p-12 text-center border border-gray-200 space-y-2">
      <div class="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center text-xl mx-auto font-bold">
        📦
      </div>
      <p class="text-sm font-bold text-gray-700">Aucun colis dans cette catégorie.</p>
      <p class="text-xs text-gray-400">Vos réservations actives ou livrées apparaîtront ici.</p>
    </div>
  </div>
</template>
