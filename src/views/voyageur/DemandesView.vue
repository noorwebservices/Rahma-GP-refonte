<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from '@/composables/useI18n'
import { fetchReservationsVoyageur } from '@/services/reservationService'
import { getCountryFlag, formatVoyageDate } from '@/utils/flagHelper'
import CountryFlag from '@/components/common/CountryFlag.vue'
import { encodeId } from '@/utils/idMasker'
import { currentCurrency, formatPrice } from '@/utils/currencyState'

const { t } = useI18n()
const router = useRouter()
const activeTab = ref('pending') // 'pending' | 'accepted' | 'refused'

const isLoading = ref(true)
const rawReservations = ref([])

const loadReservations = async () => {
  isLoading.value = true
  try {
    const res = await fetchReservationsVoyageur()
    if (res && res.data) {
      const items = Array.isArray(res.data) ? res.data : (res.data.data || [])
      rawReservations.value = items
        .filter(d => d.statut !== 'annulee' && d.statut !== 'annule')
        .map(d => {
          const c = d.colis || {}
          const u = d.client?.user || {}
          const v = d.voyage || {}

          const clientName = `${u.prenom || ''} ${u.nom || d.expediteur_nom || ''}`.trim() || 'Client Rahma'
          const rawMontant = Number(d.montant_total || d.prix_total || 0)
          const rawDevise = v.devise || 'XOF'

          return {
            id: d.id,
            code: d.numero || `RES-${d.id.slice(0, 8)}`,
            clientName,
            routeFrom: v.ville_depart || 'Départ',
            countryFrom: v.pays_depart || '',
            flagFrom: getCountryFlag(v.ville_depart, v.pays_depart),
            routeTo: v.ville_destination || 'Destination',
            countryTo: v.pays_destination || '',
            flagTo: getCountryFlag(v.ville_destination, v.pays_destination),
            departureDate: formatVoyageDate(v.date_depart),
            parcelType: c.type || d.type_colis || 'Colis',
            weight: (c.poids !== undefined && c.poids !== null) ? `${c.poids} Kg` : (d.poids ? `${d.poids} Kg` : 'Forfait'),
            rawMontant,
            rawDevise,
            status: d.statut || 'en_attente',
            raw: d
          }
        })
    }
  } catch (err) {
    // Keep empty if fetch fails
  } finally {
    isLoading.value = false
  }
}

onMounted(loadReservations)

const searchQuery = ref('')

const pendingCount = computed(() => rawReservations.value.filter(r => r.status === 'en_attente').length)
const acceptedCount = computed(() => rawReservations.value.filter(r => r.status === 'acceptee').length)
const refusedCount = computed(() => rawReservations.value.filter(r => r.status === 'refusee').length)

const filteredDemandes = computed(() => {
  let list = rawReservations.value
  if (activeTab.value === 'pending') {
    list = list.filter(r => r.status === 'en_attente')
  } else if (activeTab.value === 'accepted') {
    list = list.filter(r => r.status === 'acceptee')
  } else if (activeTab.value === 'refused') {
    list = list.filter(r => r.status === 'refusee')
  }

  if (searchQuery.value.trim()) {
    const q = searchQuery.value.toLowerCase().trim()
    list = list.filter(r => 
      (r.code && r.code.toLowerCase().includes(q)) ||
      (r.clientName && r.clientName.toLowerCase().includes(q)) ||
      (r.parcelType && r.parcelType.toLowerCase().includes(q)) ||
      (r.routeFrom && r.routeFrom.toLowerCase().includes(q)) ||
      (r.routeTo && r.routeTo.toLowerCase().includes(q))
    )
  }

  return list.map(r => ({
    ...r,
    price: formatPrice(r.rawMontant, r.rawDevise)
  }))
})

const truncateText = (str, maxLen = 30) => {
  if (str === null || str === undefined) return ''
  const s = String(str).trim()
  if (s.length <= maxLen) return s
  return s.substring(0, maxLen) + '...'
}

const goToDetail = (id) => {
  const masked = encodeId(id)
  router.push(`/voyageur/demandes/${masked}`)
}
</script>

<template>
  <div class="space-y-5 pb-16">
    <!-- Header Title & Subtitle -->
    <div class="space-y-1">
      <h1 class="text-xl sm:text-2xl font-serif font-bold text-principal-dark dark:text-sky-300">{{ t('voyageur.demandes.title') }}</h1>
      <p class="text-xs sm:text-sm text-gray-500 dark:text-slate-400">{{ t('voyageur.demandes.subTitle') }}</p>
    </div>

    <!-- Search & Filter Controls Row -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
      <!-- Search Input -->
      <div class="relative flex-1 max-w-md">
        <input
          v-model="searchQuery"
          type="text"
          :placeholder="t('voyageur.messages.searchPlaceholder', 'Rechercher par code, client, ville, colis...')"
          class="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-2xl text-xs font-medium text-slate-800 dark:text-slate-100 placeholder-gray-400 dark:placeholder-slate-500 outline-none focus:border-[#074C72] dark:focus:border-sky-500 focus:ring-2 focus:ring-[#074C72]/20 shadow-2xs"
        />
        <span class="absolute left-3.5 top-2.5 text-gray-400 dark:text-slate-500 text-sm">🔍</span>
      </div>

      <!-- Filter Tabs (En attente / Acceptées / Refusées) -->
      <div class="bg-[#EAEFF4]/60 dark:bg-slate-900 p-1.5 rounded-2xl flex items-center gap-2 w-full sm:w-auto min-w-[320px] border border-gray-200/50 dark:border-slate-800">
        <button
          @click="activeTab = 'pending'"
          class="flex-1 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer flex items-center justify-center gap-1.5"
          :class="activeTab === 'pending' ? 'bg-white dark:bg-slate-800 text-[#053754] dark:text-sky-300 shadow-sm' : 'text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-200'"
        >
          <span>{{ t('voyageur.demandes.tabs.pending') }}</span>
          <span class="w-5 h-5 rounded-full bg-amber-500 text-white text-[10px] flex items-center justify-center font-black">{{ pendingCount }}</span>
        </button>

        <button
          @click="activeTab = 'accepted'"
          class="flex-1 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer flex items-center justify-center gap-1.5"
          :class="activeTab === 'accepted' ? 'bg-white dark:bg-slate-800 text-[#053754] dark:text-sky-300 shadow-sm' : 'text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-200'"
        >
          <span>{{ t('voyageur.demandes.tabs.accepted') }}</span>
          <span class="w-5 h-5 rounded-full bg-emerald-600 text-white text-[10px] flex items-center justify-center font-bold">{{ acceptedCount }}</span>
        </button>

        <button
          @click="activeTab = 'refused'"
          class="flex-1 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer flex items-center justify-center gap-1.5"
          :class="activeTab === 'refused' ? 'bg-white dark:bg-slate-800 text-[#053754] dark:text-sky-300 shadow-sm' : 'text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-200'"
        >
          <span>{{ t('voyageur.demandes.tabs.rejected') }}</span>
          <span class="w-5 h-5 rounded-full bg-gray-400 text-white text-[10px] flex items-center justify-center font-bold">{{ refusedCount }}</span>
        </button>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="isLoading" class="bg-white dark:bg-slate-900 rounded-3xl p-12 text-center border border-gray-100 dark:border-slate-800 shadow-sm space-y-4">
      <div class="w-10 h-10 border-4 border-[#053754] dark:border-sky-400 border-t-transparent rounded-full animate-spin mx-auto"></div>
      <p class="text-sm font-bold text-gray-600 dark:text-slate-300">{{ t('voyageur.voyageDetail.loading', 'Chargement des demandes de réservation...') }}</p>
    </div>

    <!-- Demandes Table View (Desktop & Tablet) -->
    <div v-else-if="filteredDemandes.length > 0" class="hidden md:block bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-3xl shadow-2xs overflow-hidden">
      <div class="overflow-x-auto min-w-full">
        <table class="min-w-max w-full text-left border-collapse">
          <thead>
            <tr class="bg-slate-50 dark:bg-slate-800/80 border-b border-gray-200 dark:border-slate-800 text-[11px] font-extrabold text-gray-500 dark:text-slate-400 uppercase tracking-wider whitespace-nowrap">
              <th class="py-4 px-5">Code / Tracking</th>
              <th class="py-4 px-5">Client</th>
              <th class="py-4 px-5">Trajet</th>
              <th class="py-4 px-5">Contenu / Poids</th>
              <th class="py-4 px-5">Montant Total</th>
              <th class="py-4 px-5">Statut</th>
              <th class="py-4 px-5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100 dark:divide-slate-800 text-xs font-medium whitespace-nowrap">
            <tr
              v-for="demande in filteredDemandes"
              :key="demande.id"
              @click="goToDetail(demande.id)"
              class="hover:bg-sky-50/50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer group"
            >
              <td class="py-4 px-5 font-mono font-extrabold text-[#053754] dark:text-sky-300">
                {{ truncateText(demande.code, 30) }}
              </td>
              <td class="py-4 px-5 font-bold text-gray-900 dark:text-slate-100">
                👤 {{ truncateText(demande.clientName, 30) }}
              </td>
              <td class="py-4 px-5">
                <div class="flex items-center gap-1.5 font-bold text-gray-800 dark:text-slate-200">
                  <span>{{ truncateText(demande.routeFrom, 30) }}</span>
                  <span class="text-red-500 text-xs">➔</span>
                  <span>{{ truncateText(demande.routeTo, 30) }}</span>
                </div>
              </td>
              <td class="py-4 px-5 font-semibold text-gray-700 dark:text-slate-300">
                {{ truncateText(demande.parcelType, 30) }} ({{ demande.weight }})
              </td>
              <td class="py-4 px-5 font-black text-[#053754] dark:text-sky-300 text-sm">
                {{ demande.price }}
              </td>
              <td class="py-4 px-5">
                <span
                  class="text-[11px] font-extrabold px-3 py-1 rounded-full border"
                  :class="{
                    'bg-amber-50 dark:bg-amber-950/50 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-800': demande.status === 'en_attente',
                    'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800': demande.status === 'acceptee',
                    'bg-red-50 dark:bg-red-950/50 text-red-800 dark:text-red-300 border-red-200 dark:border-red-800': demande.status === 'refusee',
                    'bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-slate-300 border-gray-300 dark:border-slate-700': demande.status === 'annulee' || demande.status === 'annule'
                  }"
                >
                  {{ demande.status === 'en_attente' ? t('voyageur.status.pending', '⏳ En attente') : demande.status === 'acceptee' ? t('voyageur.status.accepted', '✓ Acceptée') : demande.status === 'refusee' ? t('voyageur.status.refused', '✕ Refusée') : t('voyageur.status.cancelled', '🚫 Annulée') }}
                </span>
              </td>
              <td class="py-4 px-5 text-right" @click.stop>
                <button
                  @click="goToDetail(demande.id)"
                  type="button"
                  class="bg-[#053754] dark:bg-sky-600 hover:bg-[#074C72] dark:hover:bg-sky-500 text-white px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all shadow-xs inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <span>Détails</span>
                  <span>➔</span>
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Demandes Cards View (Mobile) -->
    <div v-if="filteredDemandes.length > 0" class="grid grid-cols-1 gap-4 md:hidden">
      <div
        v-for="demande in filteredDemandes"
        :key="demande.id"
        class="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-gray-200 dark:border-slate-800 shadow-sm space-y-4 hover:border-sky-400 dark:hover:border-sky-500 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
        @click="goToDetail(demande.id)"
      >
        <!-- Top Bar: Code + Client Tag + Status Badge -->
        <div class="space-y-1.5">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2">
              <span class="text-base">📦</span>
              <span class="font-extrabold text-[#053754] dark:text-sky-300 text-xs sm:text-sm font-mono">{{ demande.code }}</span>
            </div>

            <!-- Status Badge -->
            <span
              class="text-[11px] font-extrabold px-3.5 py-1 rounded-full border"
              :class="{
                'bg-amber-50 dark:bg-amber-950/50 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-800': demande.status === 'en_attente',
                'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800': demande.status === 'acceptee',
                'bg-red-50 dark:bg-red-950/50 text-red-800 dark:text-red-300 border-red-200 dark:border-red-800': demande.status === 'refusee',
                'bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-slate-300 border-gray-300 dark:border-slate-700': demande.status === 'annulee' || demande.status === 'annule'
              }"
            >
              {{ demande.status === 'en_attente' ? t('voyageur.status.pending', '⏳ En attente') : demande.status === 'acceptee' ? t('voyageur.status.accepted', '✓ Acceptée') : demande.status === 'refusee' ? t('voyageur.status.refused', '✕ Refusée') : t('voyageur.status.cancelled', '🚫 Annulée') }}
            </span>
          </div>

          <!-- Client Tag -->
          <div class="flex justify-start">
            <span class="bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-bold px-3 py-0.5 rounded-full border border-slate-200 dark:border-slate-700 flex items-center gap-1.5">
              <span>👤</span>
              <span>{{ t('voyageur.demandes.clientLabel') }} {{ demande.clientName }}</span>
            </span>
          </div>
        </div>

        <!-- Route Graphic -->
        <div class="flex items-center justify-between px-1 pt-1">
          <!-- Departure -->
          <div class="space-y-0.5">
            <CountryFlag :city="demande.routeFrom" :country="demande.countryFrom" size="w-6 h-4" />
            <h4 class="text-xs sm:text-sm font-extrabold text-gray-900 dark:text-slate-100 leading-tight mt-1">{{ demande.routeFrom }}</h4>
            <p class="text-[10px] text-gray-400 dark:text-slate-400 font-medium">{{ demande.countryFrom }}</p>
          </div>

          <!-- Flight Line Graphic -->
          <div class="flex-1 max-w-[140px] sm:max-w-[200px] px-2 flex items-center justify-center">
            <div class="w-full flex items-center gap-1">
              <span class="w-2 h-2 rounded-full bg-red-500 shrink-0"></span>
              <div class="flex-1 border-t-2 border-dashed border-red-400"></div>
              <div class="bg-white dark:bg-slate-900 px-1 transform -rotate-12">
                <span class="text-red-500 text-xs font-bold">✈</span>
              </div>
              <div class="flex-1 border-t-2 border-dashed border-amber-400"></div>
              <span class="w-2 h-2 rounded-full bg-amber-400 shrink-0"></span>
            </div>
          </div>

          <!-- Destination -->
          <div class="space-y-0.5 text-right flex flex-col items-end">
            <CountryFlag :city="demande.routeTo" :country="demande.countryTo" size="w-6 h-4" />
            <h4 class="text-xs sm:text-sm font-extrabold text-gray-900 dark:text-slate-100 leading-tight mt-1">{{ demande.routeTo }}</h4>
            <p class="text-[10px] text-gray-400 dark:text-slate-400 font-medium">{{ demande.countryTo }}</p>
          </div>
        </div>

        <!-- Details Grid -->
        <div class="border-t border-gray-100 dark:border-slate-800 pt-3 grid grid-cols-2 gap-2 text-xs">
          <div>
            <span class="text-gray-400 dark:text-slate-400 block font-medium text-[11px]">{{ t('voyageur.createVoyage.departureDate', 'Départ') }}</span>
            <span class="font-extrabold text-gray-800 dark:text-slate-200 text-xs">{{ demande.departureDate }}</span>
          </div>
          <div class="text-right">
            <span class="text-gray-400 dark:text-slate-400 block font-medium text-[11px]">{{ t('voyageur.demandes.parcelType', 'Colis') }}</span>
            <span class="font-extrabold text-gray-800 dark:text-slate-200 text-xs truncate block">{{ demande.parcelType }} ({{ demande.weight }})</span>
          </div>
        </div>

        <!-- Price & Action Button Row -->
        <div class="border-t border-gray-100 dark:border-slate-800 pt-3 flex items-center justify-between">
          <span class="font-black text-[#053754] dark:text-sky-300 text-sm sm:text-base">{{ demande.price }}</span>

          <button
            @click.stop="goToDetail(demande.id)"
            type="button"
            title="Voir les détails"
            class="bg-[#053754] dark:bg-sky-600 hover:bg-[#074C72] dark:hover:bg-sky-500 text-white px-3 py-2 rounded-xl text-xs font-extrabold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer active:scale-95"
          >
            <span>{{ t('voyageur.voyageDetail.detailsBtn', 'Détails') }}</span>
            <span>➔</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else class="bg-white dark:bg-slate-900 rounded-3xl p-10 text-center border border-gray-200 dark:border-slate-800 space-y-2">
      <div class="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-400 flex items-center justify-center text-xl mx-auto font-bold">
        📥
      </div>
      <p class="text-sm font-bold text-gray-700 dark:text-slate-200">{{ t('voyageur.demandes.noDemandesTitle') }}</p>
      <p class="text-xs text-gray-400 dark:text-slate-400">{{ t('voyageur.demandes.noDemandesSub') }}</p>
    </div>
  </div>
</template>
