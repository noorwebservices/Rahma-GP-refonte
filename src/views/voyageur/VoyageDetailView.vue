<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from '@/composables/useI18n'
import Swal from 'sweetalert2'
import { fetchVoyage } from '@/services/voyageService'
import { accepterReservation, refuserReservation, annulerReservation } from '@/services/reservationService'
import { getCountryFlag, formatVoyageDate } from '@/utils/flagHelper'
import CountryFlag from '@/components/common/CountryFlag.vue'
import { decodeId, encodeId } from '@/utils/idMasker'
import { setHeaderRoute, clearHeaderRoute } from '@/utils/headerState'
import { currentCurrency, formatPrice, convertAmount } from '@/utils/currencyState'

const { t } = useI18n()
const route = useRoute()
const router = useRouter()
const voyageId = decodeId(route.params.id)

const isLoading = ref(true)
const errorMsg = ref('')
const voyage = ref(null)
const reservations = ref([])
const isUpdatingStatus = ref(false)

const totalRevenuVolEstime = computed(() => {
  if (!reservations.value || reservations.value.length === 0) return formatPrice(0, 'XOF')
  const totalRaw = reservations.value.reduce((acc, r) => {
    return acc + Number(r.raw?.montant_total || r.raw?.prix_total || 0)
  }, 0)
  return formatPrice(totalRaw, voyage.value?.devise || 'XOF')
})

const totalRevenuVolAccepte = computed(() => {
  if (!reservations.value || reservations.value.length === 0) return formatPrice(0, 'XOF')
  const totalRaw = reservations.value
    .filter(r => r.statut === 'acceptee' || r.statut === 'paye' || r.statut === 'livre' || r.statut === 'livree')
    .reduce((acc, r) => {
      return acc + Number(r.raw?.montant_total || r.raw?.prix_total || 0)
    }, 0)
  return formatPrice(totalRaw, voyage.value?.devise || 'XOF')
})

const getStatusBadge = (statut) => {
  switch (statut) {
    case 'publie':
      return { text: t('voyageur.status.publie', 'Publié & Ouvert'), cls: 'bg-emerald-50 text-emerald-700 border-emerald-200' }
    case 'brouillon':
      return { text: t('voyageur.status.brouillon', 'Brouillon'), cls: 'bg-gray-100 text-gray-700 border-gray-300' }
    case 'complet':
      return { text: t('voyageur.status.complet', 'Vol Complet'), cls: 'bg-purple-50 text-purple-700 border-purple-200' }
    case 'en_cours':
      return { text: t('voyageur.status.en_cours', 'En Cours de Vol'), cls: 'bg-blue-50 text-blue-700 border-blue-200' }
    case 'termine':
      return { text: t('voyageur.status.termine', 'Voyage Terminé'), cls: 'bg-slate-100 text-slate-700 border-slate-300' }
    case 'annule':
      return { text: t('voyageur.status.annule', 'Annulé'), cls: 'bg-red-50 text-red-700 border-red-200' }
    default:
      return { text: statut || 'Statut inconnu', cls: 'bg-gray-50 text-gray-600 border-gray-200' }
  }
}

const getReservationStatusBadge = (statut) => {
  switch (statut) {
    case 'en_attente':
      return { text: t('voyageur.status.pending', '⏳ En Attente'), cls: 'bg-amber-50 text-amber-800 border-amber-300' }
    case 'acceptee':
      return { text: t('voyageur.status.accepted', '✓ Acceptée'), cls: 'bg-emerald-50 text-emerald-800 border-emerald-300' }
    case 'refusee':
      return { text: t('voyageur.status.refused', '✕ Refusée'), cls: 'bg-red-50 text-red-800 border-red-300' }
    case 'annulee':
    case 'annule':
      return { text: t('voyageur.status.cancelled', '🚫 Annulée'), cls: 'bg-gray-100 text-gray-700 border-gray-300' }
    default:
      return { text: statut || 'Inconnu', cls: 'bg-slate-100 text-slate-700 border-slate-200' }
  }
}

const loadVoyageData = async () => {
  if (!voyageId) {
    errorMsg.value = 'Identifiant du voyage manquant.'
    isLoading.value = false
    return
  }

  isLoading.value = true
  errorMsg.value = ''

  try {
    const res = await fetchVoyage(voyageId)
    if (res && res.data) {
      const v = res.data
      voyage.value = {
        id: v.id,
        routeFrom: v.ville_depart || 'Départ',
        countryFrom: v.pays_depart || '',
        flagFrom: getCountryFlag(v.ville_depart, v.pays_depart),
        routeTo: v.ville_destination || 'Destination',
        countryTo: v.pays_destination || '',
        flagTo: getCountryFlag(v.ville_destination, v.pays_destination),
        departureDate: v.date_depart,
        arrivalDate: v.date_arrivee,
        capaciteTotale: Number(v.capacite_totale) || 0,
        capaciteDispo: v.capacite_dispo !== undefined ? Number(v.capacite_dispo) : Number(v.capacite_totale || 0),
        rawPrixKg: v.prix_kg,
        rawPrixObjet: v.prix_objet,
        prixKg: computed(() => v.prix_kg ? formatPrice(v.prix_kg, v.devise || 'XOF') : 'Non défini'),
        prixObjet: computed(() => v.prix_objet ? formatPrice(v.prix_objet, v.devise || 'XOF') : 'Non défini'),
        devise: v.devise || 'XOF',
        description: v.description || '',
        statut: v.statut || 'publie',
        adresseDepot: v.adresse_depot || null,
        adresseRetrait: v.adresse_recuperation || null,
        categoriesAutorisees: Array.isArray(v.objets_autorises) ? v.objets_autorises : [],
        categoriesRefusees: Array.isArray(v.objets_interdits) ? v.objets_interdits : []
      }

      setHeaderRoute({
        routeFrom: voyage.value.routeFrom,
        countryFrom: voyage.value.countryFrom,
        routeTo: voyage.value.routeTo,
        countryTo: voyage.value.countryTo
      })

      if (v.reservations && Array.isArray(v.reservations)) {
        reservations.value = v.reservations
          .filter(r => r.statut !== 'annulee' && r.statut !== 'annule')
          .map(r => {
          const c = r.colis || {}
          const u = r.client?.user || {}
          const clientName = `${u.prenom || ''} ${u.nom || r.expediteur_nom || ''}`.trim() || 'Client Rahma'

          return {
            id: r.id,
            numero: r.numero || `RES-${r.id.toString().slice(0, 8)}`,
            codeTracking: c.numero_suivi || r.code_tracking || 'TRK-EN-ATTENTE',
            statut: r.statut || 'en_attente',
            clientNom: clientName,
            clientPhone: u.telephone || r.expediteur_telephone || 'Non renseigné',
            clientEmail: u.email || 'Non renseigné',

            colisType: c.type || r.type_colis || 'Colis de marchandise',
            colisDescription: c.description || r.description || 'Aucune description',
            colisPoids: (c.poids !== undefined && c.poids !== null) ? `${c.poids} Kg` : (r.poids ? `${r.poids} Kg` : 'Forfait Objet'),
            colisValeur: computed(() => c.valeur_estimee ? formatPrice(c.valeur_estimee, v.devise || 'XOF') : 'Non renseignée'),
            colisEstFragile: Boolean(c.est_fragile),
            colisPhoto: c.photo || null,

            destinataireNom: `${c.destinataire_prenom || ''} ${c.destinataire_nom || ''}`.trim() || 'Non renseigné',
            destinatairePhone: c.destinataire_numero || 'Non renseigné',
            destinataireAdresse: c.destinataire_adresse || 'Non renseignée',

            montantTotal: computed(() => formatPrice(r.montant_total || r.prix_total || 0, v.devise || 'XOF')),
            modePaiement: r.mode_paiement_souhaite || r.mode_paiement || 'Au dépôt',
            createdAt: r.created_at,
            raw: r
          }
        })
      } else {
        reservations.value = []
      }
    } else {
      errorMsg.value = 'Voyage non trouvé.'
    }
  } catch (err) {
    errorMsg.value = err?.message || 'Erreur lors du chargement du voyage.'
  } finally {
    isLoading.value = false
  }
}

onMounted(loadVoyageData)

const goToDemandeDetail = (resId) => {
  const masked = encodeId(resId)
  router.push(`/voyageur/demandes/${masked}`)
}

const handleAccepter = async (resId) => {
  isUpdatingStatus.value = true
  try {
    await accepterReservation(resId)
    Swal.fire({
      toast: true,
      position: 'top-end',
      icon: 'success',
      title: 'Demande de réservation acceptée !',
      showConfirmButton: false,
      timer: 3000
    })
    await loadVoyageData()
  } catch (err) {
    Swal.fire({
      icon: 'error',
      title: 'Erreur',
      text: err?.message || err?.data?.message || 'Impossible d\'accepter la réservation.'
    })
  } finally {
    isUpdatingStatus.value = false
  }
}

const handleRefuser = async (resId) => {
  isUpdatingStatus.value = true
  try {
    await refuserReservation(resId)
    Swal.fire({
      toast: true,
      position: 'top-end',
      icon: 'info',
      title: 'Demande de réservation refusée.',
      showConfirmButton: false,
      timer: 3000
    })
    await loadVoyageData()
  } catch (err) {
    Swal.fire({
      icon: 'error',
      title: 'Erreur',
      text: err?.message || err?.data?.message || 'Impossible de refuser la réservation.'
    })
  } finally {
    isUpdatingStatus.value = false
  }
}

const goBack = () => {
  router.push('/voyageur')
}
</script>

<template>
  <div class="space-y-6 pb-16 font-sans">
    <!-- Top Action Bar -->
    <div class="flex items-center justify-between gap-2 border-b border-gray-200/60 dark:border-slate-800 pb-3">
      <button
        @click="goBack"
        type="button"
        class="inline-flex items-center gap-1.5 text-xs font-bold text-gray-700 dark:text-slate-200 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 px-3 py-2 rounded-xl hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors shadow-2xs cursor-pointer shrink"
      >
        <span>←</span>
        <span>{{ t('voyageur.voyageDetail.backBtn') }}</span>
      </button>

      <span
        v-if="voyage"
        class="text-[11px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider border shrink-0"
        :class="getStatusBadge(voyage.statut).cls"
      >
        {{ getStatusBadge(voyage.statut).text }}
      </span>
    </div>

    <!-- Loading State -->
    <div v-if="isLoading" class="bg-white dark:bg-slate-900 rounded-3xl p-12 text-center border border-gray-100 dark:border-slate-800 shadow-sm space-y-4">
      <div class="w-10 h-10 border-4 border-[#053754] dark:border-sky-400 border-t-transparent rounded-full animate-spin mx-auto"></div>
      <p class="text-sm font-bold text-gray-600 dark:text-slate-300">{{ t('voyageur.voyageDetail.loading') }}</p>
    </div>

    <!-- Error State -->
    <div v-else-if="errorMsg" class="bg-red-50 dark:bg-rose-950/40 border border-red-200 dark:border-rose-900 rounded-3xl p-8 text-center space-y-3">
      <p class="text-sm font-bold text-red-800 dark:text-rose-300">{{ errorMsg }}</p>
      <button @click="goBack" class="px-4 py-2 bg-red-600 text-white font-bold text-xs rounded-xl cursor-pointer">{{ t('voyageur.voyageDetail.backBtn') }}</button>
    </div>

    <!-- Main Content when loaded -->
    <template v-else-if="voyage">
      <!-- Title Header -->
      <div>
        <h1 class="text-xl sm:text-2xl font-serif font-bold text-principal-dark dark:text-sky-300">
          {{ t('voyageur.voyageDetail.title') }} {{ voyage.routeFrom }} ➔ {{ voyage.routeTo }}
        </h1>
        <p class="text-xs sm:text-sm text-gray-500 dark:text-slate-400">
          {{ t('voyageur.voyageDetail.subTitle') }}
        </p>
      </div>

      <!-- Hero Summary Dark Blue Card -->
      <div class="bg-[#053754] text-white rounded-3xl p-6 sm:p-7 shadow-xl space-y-5 relative overflow-hidden">
        <div class="flex items-center justify-between px-2">
          <!-- Departure -->
          <div class="space-y-1">
            <CountryFlag :city="voyage.routeFrom" :country="voyage.countryFrom" size="w-7 h-5" />
            <h3 class="text-xl sm:text-2xl font-extrabold leading-tight">{{ voyage.routeFrom }}</h3>
            <p class="text-xs text-sky-200">{{ voyage.countryFrom }}</p>
          </div>

          <!-- Route Graphic -->
          <div class="flex-1 max-w-[160px] sm:max-w-[240px] px-3 flex items-center justify-center">
            <div class="w-full flex items-center gap-1">
              <span class="w-2.5 h-2.5 rounded-full bg-red-500 shrink-0"></span>
              <div class="flex-1 border-t-2 border-dashed border-red-400"></div>
              <div class="bg-[#053754] px-1 transform -rotate-12">
                <span class="text-red-500 text-sm font-bold">✈</span>
              </div>
              <div class="flex-1 border-t-2 border-dashed border-amber-400"></div>
              <span class="w-2.5 h-2.5 rounded-full bg-amber-400 shrink-0"></span>
            </div>
          </div>

          <!-- Destination -->
          <div class="space-y-1 text-right flex flex-col items-end">
            <CountryFlag :city="voyage.routeTo" :country="voyage.countryTo" size="w-7 h-5" />
            <h3 class="text-xl sm:text-2xl font-extrabold leading-tight">{{ voyage.routeTo }}</h3>
            <p class="text-xs text-sky-200">{{ voyage.countryTo }}</p>
          </div>
        </div>

        <!-- Dates Row -->
        <div class="grid grid-cols-2 gap-4 pt-4 border-t border-sky-800/80 text-xs">
          <div>
            <span class="text-sky-200 font-medium block">{{ t('voyageur.voyageDetail.departureDate') }}</span>
            <span class="font-extrabold text-white text-xs sm:text-sm mt-0.5 block">
              {{ formatVoyageDate(voyage.departureDate) }}
            </span>
          </div>
          <div class="text-right">
            <span class="text-sky-200 font-medium block">{{ t('voyageur.voyageDetail.arrivalDate') }}</span>
            <span class="font-extrabold text-white text-xs sm:text-sm mt-0.5 block">
              {{ formatVoyageDate(voyage.arrivalDate) }}
            </span>
          </div>
        </div>

        <!-- Capacity Progress Bar -->
        <div class="space-y-2 pt-2 border-t border-sky-800/80">
          <div class="flex items-center justify-between text-xs font-extrabold">
            <span class="text-sky-200">{{ t('voyageur.voyageDetail.capacityUsed') }}</span>
            <span class="text-white">{{ voyage.capaciteTotale - voyage.capaciteDispo }} Kg / {{ voyage.capaciteTotale }} Kg</span>
          </div>
          <div class="w-full h-3 bg-sky-950/80 rounded-full overflow-hidden border border-sky-700/50">
            <div
              class="h-full bg-gradient-to-r from-amber-400 to-[#B50302] rounded-full transition-all duration-500"
              :style="{ width: `${Math.min(100, Math.max(0, ((voyage.capaciteTotale - voyage.capaciteDispo) / voyage.capaciteTotale) * 100))}%` }"
            ></div>
          </div>
          <div class="flex justify-between text-[11px] text-sky-300">
            <span>{{ t('voyageur.voyageDetail.remCapacity') }} <strong class="text-white">{{ voyage.capaciteDispo }} Kg</strong></span>
            <span>{{ t('voyageur.voyageDetail.rateKg') }} <strong class="text-white">{{ voyage.prixKg }}</strong> | {{ t('voyageur.voyageDetail.rateObjet') }} <strong class="text-white">{{ voyage.prixObjet }}</strong></span>
          </div>
        </div>

        <!-- Dynamic Revenue Metrics for this Voyage -->
        <div class="pt-3 border-t border-sky-800/80 grid grid-cols-2 gap-4 text-xs">
          <div>
            <span class="text-emerald-300 font-bold block">{{ t('voyageur.voyageDetail.confirmedRev') }}</span>
            <span class="text-lg sm:text-xl font-black text-emerald-400 block mt-0.5">
              {{ totalRevenuVolAccepte }}
            </span>
          </div>
          <div class="text-right">
            <span class="text-amber-200 font-bold block">{{ t('voyageur.voyageDetail.totalRev') }}</span>
            <span class="text-lg sm:text-xl font-black text-amber-300 block mt-0.5">
              {{ totalRevenuVolEstime }}
            </span>
          </div>
        </div>
      </div>

      <!-- Voyage Full Specifications (2 Grid Columns on Desktop) -->
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        <!-- Left Column: Tarifs, Adresses & Description (lg:col-span-7) -->
        <div class="lg:col-span-7 space-y-5">
          
          <!-- Tarifs Card -->
          <div class="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-gray-200 dark:border-slate-800 shadow-2xs space-y-3">
            <h3 class="text-xs font-bold text-gray-400 dark:text-slate-400 uppercase tracking-wider">{{ t('voyageur.voyageDetail.pricingApplied') }}</h3>
            <div class="grid grid-cols-2 gap-4">
              <div class="bg-slate-50 dark:bg-slate-800/80 p-3.5 rounded-2xl border border-slate-100 dark:border-slate-700 space-y-1">
                <span class="text-xs text-gray-500 dark:text-slate-400 block font-medium">{{ t('voyageur.voyageDetail.pricePerKg') }}</span>
                <span class="text-lg font-black text-[#B50302] dark:text-rose-400 block">{{ voyage.prixKg }}</span>
              </div>
              <div class="bg-slate-50 dark:bg-slate-800/80 p-3.5 rounded-2xl border border-slate-100 dark:border-slate-700 space-y-1">
                <span class="text-xs text-gray-500 dark:text-slate-400 block font-medium">{{ t('voyageur.voyageDetail.pricePerItem') }}</span>
                <span class="text-lg font-black text-[#053754] dark:text-sky-300 block">{{ voyage.prixObjet }}</span>
              </div>
            </div>
          </div>

          <!-- Adresse de Dépôt Card -->
          <div class="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-gray-200 dark:border-slate-800 shadow-2xs space-y-3">
            <div class="flex items-center justify-between border-b border-gray-100 dark:border-slate-800 pb-2">
              <h3 class="text-xs font-bold text-gray-400 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <span>📍</span> {{ t('voyageur.voyageDetail.depositAddr') }}
              </h3>
            </div>
            
            <template v-if="voyage.adresseDepot">
              <div class="space-y-1 text-xs">
                <p class="font-extrabold text-[#053754] dark:text-sky-300 text-sm sm:text-base">{{ voyage.adresseDepot.adresse }}</p>
                <p class="text-gray-600 dark:text-slate-300 font-medium">{{ voyage.adresseDepot.ville }}, {{ voyage.adresseDepot.pays }}</p>
              </div>
              
              <div v-if="voyage.adresseDepot.horaire_ouverture" class="bg-amber-50/60 dark:bg-amber-950/30 border border-amber-200/60 dark:border-amber-800/60 p-3 rounded-2xl text-xs space-y-0.5">
                <span class="text-amber-800 dark:text-amber-300 font-bold block">🕒 {{ t('voyageur.voyageDetail.openingHours') }}</span>
                <span class="text-amber-900 dark:text-amber-200 font-medium block">{{ voyage.adresseDepot.horaire_ouverture }}</span>
              </div>

              <div v-if="voyage.adresseDepot.instructions" class="bg-blue-50/60 dark:bg-sky-950/40 border border-blue-200/60 dark:border-sky-800/60 p-3 rounded-2xl text-xs space-y-0.5">
                <span class="text-blue-800 dark:text-sky-300 font-bold block">💡 {{ t('voyageur.voyageDetail.instructions') }}</span>
                <span class="text-blue-900 dark:text-sky-200 font-medium block">{{ voyage.adresseDepot.instructions }}</span>
              </div>
            </template>
            <p v-else class="text-xs text-gray-400 dark:text-slate-500 italic">{{ t('voyageur.voyageDetail.noDepositAddr') }}</p>
          </div>

          <!-- Adresse de Récupération Card -->
          <div class="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-gray-200 dark:border-slate-800 shadow-2xs space-y-3">
            <div class="flex items-center justify-between border-b border-gray-100 dark:border-slate-800 pb-2">
              <h3 class="text-xs font-bold text-gray-400 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <span>📍</span> {{ t('voyageur.voyageDetail.pickupAddr') }}
              </h3>
            </div>

            <template v-if="voyage.adresseRetrait">
              <div class="space-y-1 text-xs">
                <p class="font-extrabold text-[#053754] dark:text-sky-300 text-sm sm:text-base">{{ voyage.adresseRetrait.adresse }}</p>
                <p class="text-gray-600 dark:text-slate-300 font-medium">{{ voyage.adresseRetrait.ville }}, {{ voyage.adresseRetrait.pays }}</p>
              </div>

              <div v-if="voyage.adresseRetrait.horaire_ouverture" class="bg-amber-50/60 dark:bg-amber-950/30 border border-amber-200/60 dark:border-amber-800/60 p-3 rounded-2xl text-xs space-y-0.5">
                <span class="text-amber-800 dark:text-amber-300 font-bold block">🕒 {{ t('voyageur.voyageDetail.pickupHours') }}</span>
                <span class="text-amber-900 dark:text-amber-200 font-medium block">{{ voyage.adresseRetrait.horaire_ouverture }}</span>
              </div>

              <div v-if="voyage.adresseRetrait.instructions" class="bg-blue-50/60 dark:bg-sky-950/40 border border-blue-200/60 dark:border-sky-800/60 p-3 rounded-2xl text-xs space-y-0.5">
                <span class="text-blue-800 dark:text-sky-300 font-bold block">💡 {{ t('voyageur.voyageDetail.pickupInstructions') }}</span>
                <span class="text-blue-900 dark:text-sky-200 font-medium block">{{ voyage.adresseRetrait.instructions }}</span>
              </div>
            </template>
            <p v-else class="text-xs text-gray-400 dark:text-slate-500 italic">{{ t('voyageur.voyageDetail.noPickupAddr') }}</p>
          </div>

          <!-- Description / Notes -->
          <div v-if="voyage.description" class="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-gray-200 dark:border-slate-800 shadow-2xs space-y-2">
            <h3 class="text-xs font-bold text-gray-400 dark:text-slate-400 uppercase tracking-wider">{{ t('voyageur.voyageDetail.carrierNote') }}</h3>
            <p class="text-xs text-gray-700 dark:text-slate-300 leading-relaxed font-medium bg-gray-50 dark:bg-slate-800/80 p-3.5 rounded-2xl border border-gray-100 dark:border-slate-700">
              {{ voyage.description }}
            </p>
          </div>
        </div>

        <!-- Right Column: Objets autorisés et interdits (lg:col-span-5) -->
        <div class="lg:col-span-5 space-y-5 lg:sticky lg:top-20">
          
          <!-- Objets autorisés Card -->
          <div class="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-emerald-300 dark:border-emerald-800 shadow-2xs space-y-3">
            <div class="flex items-center gap-2 text-emerald-800 dark:text-emerald-300 font-extrabold text-sm border-b border-emerald-100 dark:border-emerald-900/60 pb-2">
              <span class="text-base">✅</span>
              <span>{{ t('voyageur.voyageDetail.allowedCategories') }}</span>
            </div>
            
            <div v-if="voyage.categoriesAutorisees.length > 0" class="flex flex-wrap gap-2 pt-1">
              <span
                v-for="cat in voyage.categoriesAutorisees"
                :key="cat"
                class="bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-xs font-bold px-3 py-1.5 rounded-xl flex items-center gap-1.5"
              >
                <span>✓</span>
                <span>{{ cat }}</span>
              </span>
            </div>
            <p v-else class="text-xs text-gray-400 dark:text-slate-500 italic">{{ t('voyageur.voyageDetail.noCategory') }}</p>
          </div>

          <!-- Objets interdits Card -->
          <div class="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-red-300 dark:border-rose-900 shadow-2xs space-y-3">
            <div class="flex items-center gap-2 text-red-800 dark:text-rose-300 font-extrabold text-sm border-b border-red-100 dark:border-rose-950 pb-2">
              <span class="text-base">🚫</span>
              <span>{{ t('voyageur.voyageDetail.forbiddenCategories') }}</span>
            </div>

            <div v-if="voyage.categoriesRefusees.length > 0" class="flex flex-wrap gap-2 pt-1">
              <span
                v-for="cat in voyage.categoriesRefusees"
                :key="cat"
                class="bg-red-50 dark:bg-rose-950/60 text-red-800 dark:text-rose-300 border border-red-200 dark:border-rose-800 text-xs font-bold px-3 py-1.5 rounded-xl flex items-center gap-1.5"
              >
                <span>✕</span>
                <span>{{ cat }}</span>
              </span>
            </div>
            <p v-else class="text-xs text-gray-400 dark:text-slate-500 italic">{{ t('voyageur.voyageDetail.noRestriction') }}</p>
          </div>
        </div>

      </div>

      <!-- Reservations Section (Premium Redesigned Cards) -->
      <div class="space-y-4 pt-4 border-t border-gray-200 dark:border-slate-800">
        <div class="flex items-center justify-between">
          <h2 class="text-base sm:text-lg font-bold text-principal-dark dark:text-sky-300 flex items-center gap-2">
            <span>{{ t('voyageur.voyageDetail.reservationsTitle') }}</span>
            <span class="bg-sky-100 dark:bg-sky-950 text-[#074C72] dark:text-sky-300 text-xs px-2.5 py-0.5 rounded-full font-black">{{ reservations.length }}</span>
          </h2>
          <span class="text-xs text-gray-500 dark:text-slate-400 font-medium hidden sm:inline">
            {{ t('voyageur.voyageDetail.clickSub') }}
          </span>
        </div>

        <div v-if="reservations.length > 0" class="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div
            v-for="res in reservations"
            :key="res.id"
            @click="goToDemandeDetail(res.id)"
            class="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-gray-200 dark:border-slate-800 shadow-sm space-y-4 hover:border-[#074C72] dark:hover:border-sky-400 hover:shadow-md transition-all flex flex-col justify-between cursor-pointer group"
          >
            <!-- Card Header: Client Avatar + Name + Status Badge -->
            <div class="flex items-center justify-between gap-3">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-full bg-[#053754] dark:bg-slate-800 text-white font-extrabold text-xs flex items-center justify-center shrink-0 shadow-xs group-hover:bg-[#B50302] transition-colors">
                  {{ res.clientNom.slice(0, 2).toUpperCase() }}
                </div>
                <div>
                  <h4 class="text-sm font-extrabold text-gray-900 dark:text-slate-100 group-hover:text-[#074C72] dark:group-hover:text-sky-300 transition-colors flex items-center gap-2">
                    <span>{{ res.clientNom }}</span>
                  </h4>
                  <span class="text-[10px] text-gray-400 dark:text-slate-400 font-medium">{{ t('voyageur.voyageDetail.clientLabel') }}</span>
                </div>
              </div>

              <span
                class="text-[11px] font-extrabold px-3 py-1 rounded-full border shrink-0"
                :class="getReservationStatusBadge(res.statut).cls"
              >
                {{ getReservationStatusBadge(res.statut).text }}
              </span>
            </div>

            <!-- Main Info Box -->
            <div class="bg-slate-50 dark:bg-slate-800/80 p-3.5 rounded-2xl border border-slate-100 dark:border-slate-700 space-y-2.5">
              <div class="flex items-center justify-between text-xs">
                <span class="text-gray-400 dark:text-slate-400 font-medium">{{ t('voyageur.voyageDetail.resNo') }}</span>
                <span class="font-extrabold text-[#053754] dark:text-sky-300 font-mono bg-white dark:bg-slate-900 px-2 py-0.5 rounded-md border border-gray-200 dark:border-slate-700">{{ res.numero }}</span>
              </div>

              <div class="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span class="text-gray-400 dark:text-slate-400 font-medium block">{{ t('voyageur.voyageDetail.contentType') }}</span>
                  <span class="font-extrabold text-gray-900 dark:text-slate-100 block truncate">{{ res.colisType }}</span>
                </div>
                <div class="text-right">
                  <span class="text-gray-400 dark:text-slate-400 font-medium block">{{ t('voyageur.voyageDetail.weight') }}</span>
                  <span class="font-extrabold text-[#B50302] dark:text-rose-400 block">{{ res.colisPoids }}</span>
                </div>
              </div>

              <div v-if="res.colisEstFragile" class="bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 text-[11px] font-bold px-2.5 py-1 rounded-lg border border-amber-200/80 dark:border-amber-800 flex items-center gap-1.5">
                <span>⚠️</span> {{ t('voyageur.voyageDetail.fragile') }}
              </div>
            </div>

            <!-- Footer Action & Price Row -->
            <div class="border-t border-gray-100 dark:border-slate-800 pt-3 flex items-center justify-between gap-3">
              <div>
                <span class="text-[10px] text-gray-400 dark:text-slate-400 font-bold uppercase block">{{ t('voyageur.voyageDetail.totalAmount') }}</span>
                <span class="font-black text-[#053754] dark:text-sky-300 text-base sm:text-lg">{{ res.montantTotal }}</span>
              </div>

              <div class="flex items-center gap-2" @click.stop>
                <button
                  v-if="res.statut === 'en_attente'"
                  @click="handleAccepter(res.id)"
                  :disabled="isUpdatingStatus"
                  type="button"
                  class="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs px-3.5 py-2 rounded-xl transition-colors cursor-pointer shadow-2xs"
                >
                  {{ t('voyageur.voyageDetail.acceptBtn') }}
                </button>

                <button
                  v-if="res.statut === 'en_attente'"
                  @click="handleRefuser(res.id)"
                  :disabled="isUpdatingStatus"
                  type="button"
                  class="bg-red-50 dark:bg-rose-950/50 hover:bg-red-100 dark:hover:bg-rose-900/60 text-[#B50302] dark:text-rose-300 border border-red-200 dark:border-rose-900 font-extrabold text-xs px-3 py-2 rounded-xl transition-colors cursor-pointer"
                >
                  {{ t('voyageur.voyageDetail.refuseBtn') }}
                </button>

                <button
                  @click="goToDemandeDetail(res.id)"
                  type="button"
                  class="bg-[#053754] dark:bg-sky-600 hover:bg-[#074C72] dark:hover:bg-sky-500 text-white font-extrabold text-xs px-3.5 py-2 rounded-xl transition-colors cursor-pointer flex items-center gap-1 shadow-xs"
                >
                  <span>{{ t('voyageur.voyageDetail.detailsBtn') }}</span>
                  <span>➔</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Empty state if no reservations -->
        <div v-else class="bg-white dark:bg-slate-900 rounded-3xl p-10 text-center border border-gray-200 dark:border-slate-800 space-y-2">
          <div class="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 flex items-center justify-center text-xl mx-auto font-bold">
            📦
          </div>
          <p class="text-sm font-bold text-gray-700 dark:text-slate-200">{{ t('voyageur.voyageDetail.noReservationsTitle') }}</p>
          <p class="text-xs text-gray-400 dark:text-slate-400">{{ t('voyageur.voyageDetail.noReservationsSub') }}</p>
        </div>
      </div>
    </template>
  </div>
</template>
