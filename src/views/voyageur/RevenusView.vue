<script setup>
import { ref, computed, onMounted } from 'vue'
import { useI18n } from '@/composables/useI18n'
import { fetchRevenus } from '@/services/revenuService'
import { fetchReservations } from '@/services/reservationService'
import { formatVoyageDate } from '@/utils/flagHelper'
import { currentCurrency, availableCurrencies, setCurrency, formatPrice, convertAmount } from '@/utils/currencyState'

const { t } = useI18n()
const isLoading = ref(true)
const errorMsg = ref('')

const rawRevenusList = ref([])
const rawReservationsList = ref([])
const selectedTransaction = ref(null)
const showDetailModal = ref(false)

const loadRevenusData = async () => {
  isLoading.value = true
  errorMsg.value = ''
  try {
    const [resRevenus, resReservations] = await Promise.allSettled([
      fetchRevenus(),
      fetchReservations()
    ])

    if (resRevenus.status === 'fulfilled' && resRevenus.value) {
      const res = resRevenus.value
      const dataObj = res.data?.data ? res : res
      const rawItems = Array.isArray(dataObj.data) ? dataObj.data : (Array.isArray(res.data) ? res.data : [])
      rawRevenusList.value = rawItems
    }

    if (resReservations.status === 'fulfilled' && resReservations.value) {
      const res = resReservations.value
      const rawRes = Array.isArray(res.data?.data) ? res.data.data : (Array.isArray(res.data) ? res.data : [])
      rawReservationsList.value = rawRes
    }
  } catch (err) {
    errorMsg.value = err?.message || 'Erreur lors du chargement de vos revenus.'
  } finally {
    isLoading.value = false
  }
}

onMounted(loadRevenusData)

const isValidPaidStatut = (st) => ['disponible', 'reussi', 'retire', 'paye'].includes(st) || !st

const totalRevenusConverted = computed(() => {
  return rawRevenusList.value
    .filter(item => isValidPaidStatut(item.statut))
    .reduce((sum, item) => {
      const origDevise = item.reservation?.voyage?.devise || 'XOF'
      return sum + convertAmount(item.montant || 0, origDevise, currentCurrency.value)
    }, 0)
})

const totalWaveConverted = computed(() => {
  return rawRevenusList.value
    .filter(item => {
      const pMode = (item.reservation?.paiement?.mode_paiement || item.reservation?.mode_paiement_souhaite || item.reservation?.mode_paiement || '').toLowerCase()
      const isWave = pMode.includes('wave') || item.statut === 'paye'
      return isWave && isValidPaidStatut(item.statut)
    })
    .reduce((sum, item) => {
      const origDevise = item.reservation?.voyage?.devise || 'XOF'
      return sum + convertAmount(item.montant || 0, origDevise, currentCurrency.value)
    }, 0)
})

const totalEspecesConverted = computed(() => {
  return rawRevenusList.value
    .filter(item => {
      const pMode = (item.reservation?.paiement?.mode_paiement || item.reservation?.mode_paiement_souhaite || item.reservation?.mode_paiement || '').toLowerCase()
      const isWave = pMode.includes('wave') || item.statut === 'paye'
      return !isWave && isValidPaidStatut(item.statut)
    })
    .reduce((sum, item) => {
      const origDevise = item.reservation?.voyage?.devise || 'XOF'
      return sum + convertAmount(item.montant || 0, origDevise, currentCurrency.value)
    }, 0)
})

const totalEnAttentePaiementConverted = computed(() => {
  const sumPendingRevenus = rawRevenusList.value
    .filter(item => item.statut === 'en_attente' || item.statut === 'non_paye')
    .reduce((sum, item) => {
      const origDevise = item.reservation?.voyage?.devise || 'XOF'
      return sum + convertAmount(item.montant || 0, origDevise, currentCurrency.value)
    }, 0)

  const paidReservationIds = new Set([
    ...rawRevenusList.value
      .filter(item => isValidPaidStatut(item.statut))
      .map(item => item.reservation_id || item.reservation?.id)
      .filter(Boolean),
    ...rawReservationsList.value
      .filter(r => r.paiement?.statut === 'reussi' || r.statut === 'payee')
      .map(r => r.id)
      .filter(Boolean)
  ])

  const sumAcceptedReservations = rawReservationsList.value
    .filter(r => (r.statut === 'acceptee' || r.statut === 'reservation_acceptee') && !paidReservationIds.has(r.id) && r.paiement?.statut !== 'reussi')
    .reduce((sum, r) => {
      const origDevise = r.voyage?.devise || 'XOF'
      return sum + convertAmount(r.montant_total || r.prix_total || 0, origDevise, currentCurrency.value)
    }, 0)

  return sumPendingRevenus + sumAcceptedReservations
})

const formattedRevenusList = computed(() => {
  return rawRevenusList.value.map(item => {
    const resObj = item.reservation || {}
    const clientObj = resObj.client?.user || resObj.client || {}
    const voyageObj = resObj.voyage || {}

    const clientName = `${clientObj.prenom || ''} ${clientObj.nom || ''}`.trim() || 'Client Rahma'
    const routeText = (voyageObj.ville_depart && voyageObj.ville_destination)
      ? `${voyageObj.ville_depart} ➔ ${voyageObj.ville_destination}`
      : 'Trajet Colis'

    const origDevise = voyageObj.devise || 'XOF'
    const pModeRaw = resObj.paiement?.mode_paiement || resObj.mode_paiement_souhaite || resObj.mode_paiement || ''
    const isWave = pModeRaw.toLowerCase().includes('wave') || item.statut === 'paye'

    return {
      id: item.id,
      code: resObj.numero || `#RES-${item.id.toString().slice(0, 8)}`,
      client: clientName,
      route: routeText,
      date: formatVoyageDate(item.created_at),
      montant: formatPrice(item.montant || 0, origDevise, currentCurrency.value),
      originalMontant: `${Number(item.montant || 0).toLocaleString()} ${origDevise}`,
      modePaiement: isWave ? '🌊 Wave (En ligne)' : '💵 Espèces (Dépôt/Livraison)',
      isWave: isWave,
      statut: item.statut || 'disponible',
      colisType: resObj.colis?.type || 'Colis',
      poids: resObj.colis?.poids ? `${resObj.colis.poids} Kg` : 'Objet',
      tarifKg: formatPrice(voyageObj.prix_kg || 0, origDevise, currentCurrency.value),
      commission: formatPrice(0, origDevise, currentCurrency.value),
      netGain: formatPrice(item.montant || 0, origDevise, currentCurrency.value),
      datePaiement: formatVoyageDate(item.created_at),
      rawItem: item
    }
  })
})

const openDetail = (rev) => {
  selectedTransaction.value = rev
  showDetailModal.value = true
}

const closeDetail = () => {
  showDetailModal.value = false
  selectedTransaction.value = null
}
</script>

<template>
  <div class="space-y-6 pb-20 font-sans">
    <!-- Header Title & Currency Selector -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div class="space-y-1">
        <h1 class="text-xl sm:text-2xl font-serif font-bold text-principal-dark dark:text-sky-300">{{ t('voyageur.revenus.title') }}</h1>
        <p class="text-xs sm:text-sm text-gray-500 dark:text-slate-400 leading-snug">{{ t('voyageur.revenus.subTitle') }}</p>
      </div>

      <!-- Currency Selector Dropdown -->
      <div class="flex items-center gap-2 bg-white dark:bg-slate-900 px-3.5 py-2 rounded-2xl border border-gray-200 dark:border-slate-800 shadow-2xs self-start sm:self-auto">
        <span class="text-xs font-bold text-gray-600 dark:text-slate-300">{{ t('voyageur.revenus.currencyDisplay', 'Devise d\'affichage :') }}</span>
        <select
          :value="currentCurrency"
          @change="setCurrency($event.target.value)"
          class="bg-gray-50 dark:bg-slate-800 border border-gray-300 dark:border-slate-700 text-xs font-extrabold text-[#053754] dark:text-sky-300 rounded-xl px-3 py-1.5 outline-none cursor-pointer focus:ring-2 focus:ring-[#074C72]/20"
        >
          <option v-for="curr in availableCurrencies" :key="curr.code" :value="curr.code">
            {{ curr.label }}
          </option>
        </select>
      </div>
    </div>

    <!-- Revenue Summary Metric Cards (4 Cards: Total Payé, Wave, Espèces, Accepté non payé) -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
      <!-- Total Revenus Payés -->
      <div class="bg-[#053754] dark:bg-slate-900 text-white rounded-3xl p-4 sm:p-5 shadow-md space-y-1 relative overflow-hidden dark:border dark:border-slate-800">
        <span class="text-[11px] sm:text-xs font-bold text-sky-200 dark:text-sky-300 uppercase tracking-wider block">{{ t('voyageur.revenus.totalRevenue') }}</span>
        <div class="text-xl sm:text-2xl font-black text-white dark:text-sky-200">{{ formatPrice(totalRevenusConverted, currentCurrency) }}</div>
        <p class="text-[10px] sm:text-[11px] text-sky-300 dark:text-slate-400">{{ t('voyageur.revenus.collectedPayments', 'Paiements encaissés') }}</p>
      </div>

      <!-- Wave / Numérique -->
      <div class="bg-white dark:bg-slate-900 rounded-3xl p-4 sm:p-5 border border-sky-200 dark:border-slate-800 shadow-2xs space-y-1">
        <div class="flex items-center justify-between">
          <span class="text-[11px] sm:text-xs font-bold text-sky-700 dark:text-sky-300 uppercase tracking-wider block">{{ t('voyageur.revenus.wavePayments', 'Paiements Wave') }}</span>
          <span class="text-sm">🌊</span>
        </div>
        <div class="text-xl sm:text-2xl font-black text-[#074C72] dark:text-sky-300">{{ formatPrice(totalWaveConverted, currentCurrency) }}</div>
        <p class="text-[10px] sm:text-[11px] text-sky-600 dark:text-slate-400 font-semibold">{{ t('voyageur.revenus.paidOnline', 'Réglés en ligne') }}</p>
      </div>

      <!-- Espèces -->
      <div class="bg-white dark:bg-slate-900 rounded-3xl p-4 sm:p-5 border border-emerald-200 dark:border-slate-800 shadow-2xs space-y-1">
        <div class="flex items-center justify-between">
          <span class="text-[11px] sm:text-xs font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider block">{{ t('voyageur.revenus.cashPayments', 'Paiements Espèces') }}</span>
          <span class="text-sm">💵</span>
        </div>
        <div class="text-xl sm:text-2xl font-black text-emerald-800 dark:text-emerald-300">{{ formatPrice(totalEspecesConverted, currentCurrency) }}</div>
        <p class="text-[10px] sm:text-[11px] text-emerald-600 dark:text-slate-400 font-semibold">{{ t('voyageur.revenus.collectedDirect', 'Encaissés direct') }}</p>
      </div>

      <!-- Acceptées non payées -->
      <div class="bg-white dark:bg-slate-900 rounded-3xl p-4 sm:p-5 border border-amber-200 dark:border-slate-800 shadow-2xs space-y-1">
        <div class="flex items-center justify-between">
          <span class="text-[11px] sm:text-xs font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wider block">{{ t('voyageur.revenus.pendingPayout', 'Acceptés non Payés') }}</span>
          <span class="text-sm">⏳</span>
        </div>
        <div class="text-xl sm:text-2xl font-black text-amber-800 dark:text-amber-300">{{ formatPrice(totalEnAttentePaiementConverted, currentCurrency) }}</div>
        <p class="text-[10px] sm:text-[11px] text-amber-600 dark:text-slate-400 font-semibold">{{ t('voyageur.revenus.validatedBookings', 'Réservations validées') }}</p>
      </div>
    </div>

    <!-- Earnings History List Card -->
    <div class="bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-6 border border-gray-200 dark:border-slate-800 shadow-sm space-y-4">
      <div class="flex flex-col gap-0.5">
        <h3 class="text-base font-extrabold text-[#053754] dark:text-sky-300">{{ t('voyageur.revenus.historyTitle') }}</h3>
        <p class="text-xs text-gray-400 dark:text-slate-400 font-medium">{{ t('voyageur.revenus.convertedNote', 'Converti automatiquement dans votre devise sélectionnée ({currency})', { currency: currentCurrency }) }}</p>
      </div>

      <!-- Empty State -->
      <div v-if="formattedRevenusList.length === 0 && !isLoading" class="py-8 text-center text-xs text-gray-400 dark:text-slate-500">
        {{ t('voyageur.revenus.noRevenues', 'Aucun revenu enregistré pour le moment.') }}
      </div>

      <!-- Simplified Clean List -->
      <div v-else class="divide-y divide-gray-100 dark:divide-slate-800">
        <div
          v-for="rev in formattedRevenusList"
          :key="rev.id"
          @click="openDetail(rev)"
          class="py-3.5 flex items-center justify-between gap-3 first:pt-0 last:pb-0 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/60 -mx-1 px-2 rounded-2xl transition-all"
        >
          <!-- Left side: Code, Client & Route -->
          <div class="min-w-0 space-y-0.5">
            <div class="flex items-center gap-1.5 flex-wrap">
              <span class="font-extrabold text-[#053754] dark:text-sky-300 text-xs sm:text-sm">{{ rev.code }}</span>
              <span class="text-xs text-gray-500 dark:text-slate-400 font-medium truncate">• {{ rev.client }}</span>
            </div>
            <p class="text-[11px] text-gray-400 dark:text-slate-500 font-medium truncate">
              {{ rev.route }}
            </p>
          </div>

          <!-- Right side: Montant, Mode & Eye Icon -->
          <div class="flex items-center gap-2 sm:gap-3 shrink-0">
            <div class="text-right">
              <div class="font-black text-xs sm:text-sm text-gray-900 dark:text-slate-100">{{ rev.montant }}</div>
              <span class="inline-block text-[9px] sm:text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                {{ rev.modePaiement }}
              </span>
            </div>

            <!-- Eye Icon Button -->
            <button
              @click.stop="openDetail(rev)"
              class="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-principal/10 dark:hover:bg-sky-500/20 text-slate-600 dark:text-slate-300 hover:text-principal dark:hover:text-sky-300 flex items-center justify-center transition-all cursor-pointer"
              :title="t('voyageur.revenus.viewDetailsTitle', 'Voir les détails')"
            >
              <svg class="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Detail Transaction Modal (Clean & Vertically Aligned) -->
    <div
      v-if="showDetailModal && selectedTransaction"
      class="fixed inset-0 z-50 bg-black/60 dark:bg-black/80 backdrop-blur-xs flex items-center justify-center p-4"
    >
      <div class="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 text-slate-800 dark:text-slate-100 w-full max-w-lg rounded-3xl p-5 sm:p-7 shadow-2xl space-y-5 max-h-[85vh] overflow-y-auto font-sans">
        
        <!-- Modal Header -->
        <div class="flex items-center justify-between border-b border-gray-100 dark:border-slate-800 pb-3">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-2xl bg-[#053754]/10 dark:bg-sky-950/60 text-[#053754] dark:text-sky-300 font-black text-xs flex items-center justify-center shrink-0">
              GP
            </div>
            <div>
              <div class="flex items-center gap-2 flex-wrap">
                <h3 class="text-base sm:text-lg font-bold text-[#053754] dark:text-sky-300 font-serif">{{ selectedTransaction.code }}</h3>
                <span
                  class="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase"
                  :class="selectedTransaction.statut === 'disponible' ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300' : 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300'"
                >
                  {{ selectedTransaction.statut === 'disponible' ? t('voyageur.revenus.available', '✓ DISPONIBLE') : t('voyageur.revenus.pending', '⏳ EN ATTENTE') }}
                </span>
              </div>
              <p class="text-xs text-gray-500 dark:text-slate-400">{{ t('voyageur.revenus.modalSubtitle', 'Détails de la transaction financière') }}</p>
            </div>
          </div>
          <button @click="closeDetail" class="text-gray-400 dark:text-slate-400 hover:text-gray-600 dark:hover:text-slate-200 p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <!-- Client & Trajet (Vertical Clean Stack) -->
        <div class="bg-slate-50 dark:bg-slate-800/80 p-4 rounded-2xl space-y-3 border border-slate-100 dark:border-slate-700 text-xs">
          <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 pb-2 border-b border-slate-200/60 dark:border-slate-700">
            <span class="text-gray-500 dark:text-slate-400 font-semibold">{{ t('voyageur.revenus.clientCol', 'Expéditeur / Client') }}</span>
            <span class="font-extrabold text-gray-900 dark:text-slate-100 sm:text-right">{{ selectedTransaction.client }}</span>
          </div>
          <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 pb-2 border-b border-slate-200/60 dark:border-slate-700">
            <span class="text-gray-500 dark:text-slate-400 font-semibold">{{ t('voyageur.revenus.routeCol', 'Trajet du voyage') }}</span>
            <span class="font-extrabold text-gray-900 dark:text-slate-100 sm:text-right">{{ selectedTransaction.route }}</span>
          </div>
          <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
            <span class="text-gray-500 dark:text-slate-400 font-semibold">{{ t('voyageur.revenus.dateCol', 'Date du transfert') }}</span>
            <span class="font-extrabold text-gray-900 dark:text-slate-100 sm:text-right">{{ selectedTransaction.date }}</span>
          </div>
        </div>

        <!-- Caractéristiques du Colis (Grid) -->
        <div class="space-y-2">
          <h4 class="text-xs font-extrabold text-[#053754] dark:text-sky-300 uppercase tracking-wider">{{ t('voyageur.revenus.parcelFeatures', 'Caractéristiques du colis') }}</h4>
          <div class="grid grid-cols-2 gap-3 text-xs">
            <div class="bg-slate-50 dark:bg-slate-800/80 p-3 rounded-2xl border border-slate-100 dark:border-slate-700 space-y-0.5">
              <span class="text-gray-400 dark:text-slate-400 block text-[11px] font-medium">{{ t('voyageur.revenus.content', 'Contenu') }}</span>
              <span class="font-extrabold text-gray-800 dark:text-slate-200 leading-tight block">{{ selectedTransaction.colisType }}</span>
            </div>
            <div class="bg-slate-50 dark:bg-slate-800/80 p-3 rounded-2xl border border-slate-100 dark:border-slate-700 space-y-0.5">
              <span class="text-gray-400 dark:text-slate-400 block text-[11px] font-medium">{{ t('voyageur.revenus.reservedWeight', 'Poids réservé') }}</span>
              <span class="font-extrabold text-gray-800 dark:text-slate-200 leading-tight block">{{ selectedTransaction.poids }}</span>
            </div>
          </div>
        </div>

        <!-- Décompte Financier (Vertical Clean Stack) -->
        <div class="space-y-2">
          <h4 class="text-xs font-extrabold text-[#053754] dark:text-sky-300 uppercase tracking-wider">{{ t('voyageur.revenus.financialBreakdown', 'Décompte financier') }}</h4>
          <div class="bg-slate-50 dark:bg-slate-800/80 border border-slate-100 dark:border-slate-700 rounded-2xl p-4 text-xs space-y-3">
            <div class="flex justify-between items-center pb-2 border-b border-slate-200/60 dark:border-slate-700">
              <span class="text-gray-500 dark:text-slate-400 font-medium">{{ t('voyageur.revenus.unitTariff', 'Tarif unitaire / Kg') }}</span>
              <span class="font-bold text-gray-800 dark:text-slate-200">{{ selectedTransaction.tarifKg }}</span>
            </div>
            <div class="flex justify-between items-center pb-2 border-b border-slate-200/60 dark:border-slate-700">
              <span class="text-gray-500 dark:text-slate-400 font-medium">{{ t('voyageur.revenus.subtotal', 'Sous-total transport') }}</span>
              <span class="font-bold text-gray-800 dark:text-slate-200">{{ selectedTransaction.montant }}</span>
            </div>
            <div class="flex justify-between items-center pb-2 border-b border-slate-200/60 dark:border-slate-700">
              <span class="text-gray-500 dark:text-slate-400 font-medium">{{ t('voyageur.revenus.commission', 'Commission Rahma GP') }}</span>
              <span class="font-bold text-emerald-600 dark:text-emerald-400">{{ selectedTransaction.commission }}</span>
            </div>
            <div class="flex justify-between items-center pt-1 text-sm font-black text-[#053754] dark:text-sky-300">
              <span>{{ t('voyageur.revenus.netGain', 'Gain Net Voyageur') }}</span>
              <span class="text-emerald-700 dark:text-emerald-400 text-base font-black">{{ selectedTransaction.netGain }}</span>
            </div>
          </div>
        </div>

        <!-- Mode de Versement Card -->
        <div class="bg-emerald-50/80 dark:bg-emerald-950/40 p-4 rounded-2xl border border-emerald-100 dark:border-emerald-800/60 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
          <div>
            <span class="text-emerald-900 dark:text-emerald-200 font-extrabold block">{{ t('voyageur.revenus.payoutMethod', 'Mode de versement') }}</span>
            <span class="text-emerald-700 dark:text-emerald-300 text-[11px] font-medium">{{ selectedTransaction.modePaiement }}</span>
          </div>
          <span class="text-[11px] text-emerald-800 dark:text-emerald-300 font-semibold">{{ selectedTransaction.datePaiement }}</span>
        </div>

        <!-- Action Button -->
        <div class="pt-2 flex justify-end">
          <button
            @click="closeDetail"
            class="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-[#053754] dark:bg-sky-600 text-white font-bold text-xs hover:bg-[#074C72] dark:hover:bg-sky-500 transition-colors cursor-pointer"
          >
            {{ t('common.close', 'Fermer') }}
          </button>
        </div>

      </div>
    </div>
  </div>
</template>
