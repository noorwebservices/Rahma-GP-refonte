<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from '@/composables/useI18n'
import Swal from 'sweetalert2'
import { fetchVoyage } from '@/services/voyageService'
import { accepterReservation, refuserReservation } from '@/services/reservationService'
import { getCountryFlag, formatVoyageDate } from '@/utils/flagHelper'
import CountryFlag from '@/components/common/CountryFlag.vue'
import { decodeId, encodeId } from '@/utils/idMasker'
import { setHeaderRoute } from '@/utils/headerState'
import { formatPrice } from '@/utils/currencyState'

const { t } = useI18n()
const route = useRoute()
const router = useRouter()
const voyageId = decodeId(route.params.id)

const isLoading = ref(true)
const errorMsg = ref('')
const voyage = ref(null)
const reservations = ref([])
const isUpdatingStatus = ref(false)

const searchQuery = ref('')

const filteredReservations = computed(() => {
  if (!searchQuery.value.trim()) return reservations.value
  const q = searchQuery.value.toLowerCase().trim()
  return reservations.value.filter(r => {
    return (
      (r.clientNom && r.clientNom.toLowerCase().includes(q)) ||
      (r.numero && r.numero.toLowerCase().includes(q)) ||
      (r.codeTracking && r.codeTracking.toLowerCase().includes(q)) ||
      (r.colisType && r.colisType.toLowerCase().includes(q)) ||
      (r.statut && r.statut.toLowerCase().includes(q)) ||
      (r.clientPhone && r.clientPhone.toLowerCase().includes(q))
    )
  })
})

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
      return { text: t('voyageur.status.brouillon', 'Brouillon'), cls: 'bg-amber-50 text-amber-700 border-amber-200' }
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
        agentGp: v.agent_gp || v.agentGp || null,
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

const goToDemandeDetail = (resId) => {
  router.push(`/entreprise/demandes/${encodeId(resId)}`)
}

const truncateText = (str, maxLen = 30) => {
  if (str === null || str === undefined) return ''
  const s = String(str).trim()
  if (s.length <= maxLen) return s
  return s.substring(0, maxLen) + '...'
}

const goBack = () => {
  router.push('/entreprise/voyages')
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
        <span>{{ t('voyageur.voyageDetail.backBtn', 'Retour aux voyages') }}</span>
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
      <p class="text-sm font-bold text-gray-600 dark:text-slate-300">{{ t('voyageur.voyageDetail.loading', 'Chargement du voyage...') }}</p>
    </div>

    <!-- Error State -->
    <div v-else-if="errorMsg" class="bg-red-50 dark:bg-rose-950/40 border border-red-200 dark:border-rose-900 rounded-3xl p-8 text-center space-y-3">
      <p class="text-sm font-bold text-red-800 dark:text-rose-300">{{ errorMsg }}</p>
      <button @click="goBack" class="px-4 py-2 bg-red-600 text-white font-bold text-xs rounded-xl cursor-pointer">Retour</button>
    </div>

    <!-- Main Content when loaded -->
    <template v-else-if="voyage">
      <!-- Title Header -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 class="text-xl sm:text-2xl font-serif font-bold text-principal-dark dark:text-sky-300">
            Détails Voyage {{ voyage.routeFrom }} ➔ {{ voyage.routeTo }}
          </h1>
          <p class="text-xs sm:text-sm text-gray-500 dark:text-slate-400">
            Vue détaillée du voyage entreprise et suivi des réservations
          </p>
        </div>

        <div v-if="voyage.agentGp?.user" class="inline-flex items-center gap-2 bg-sky-50 dark:bg-slate-800 border border-sky-100 dark:border-slate-700 px-3.5 py-1.5 rounded-2xl text-xs font-extrabold text-[#053754] dark:text-sky-300">
          <span>👤 Agent GP:</span>
          <span>{{ voyage.agentGp.user.prenom }} {{ voyage.agentGp.user.nom }}</span>
        </div>
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
            <span class="text-sky-200 font-medium block">Date de départ</span>
            <span class="font-extrabold text-white text-xs sm:text-sm mt-0.5 block">
              {{ formatVoyageDate(voyage.departureDate) }}
            </span>
          </div>
          <div class="text-right">
            <span class="text-sky-200 font-medium block">Date d'arrivée</span>
            <span class="font-extrabold text-white text-xs sm:text-sm mt-0.5 block">
              {{ formatVoyageDate(voyage.arrivalDate) }}
            </span>
          </div>
        </div>

        <!-- Capacity Progress Bar -->
        <div class="space-y-2 pt-2 border-t border-sky-800/80">
          <div class="flex items-center justify-between text-xs font-extrabold">
            <span class="text-sky-200">Capacité occupée</span>
            <span class="text-white">{{ voyage.capaciteTotale - voyage.capaciteDispo }} Kg / {{ voyage.capaciteTotale }} Kg</span>
          </div>
          <div class="w-full h-3 bg-sky-950/80 rounded-full overflow-hidden border border-sky-700/50">
            <div
              class="h-full bg-gradient-to-r from-amber-400 to-[#B50302] rounded-full transition-all duration-500"
              :style="{ width: `${Math.min(100, Math.max(0, ((voyage.capaciteTotale - voyage.capaciteDispo) / voyage.capaciteTotale) * 100))}%` }"
            ></div>
          </div>
          <div class="flex justify-between text-[11px] text-sky-300">
            <span>Reste disponible : <strong class="text-white">{{ voyage.capaciteDispo }} Kg</strong></span>
            <span>Tarif / Kg : <strong class="text-white">{{ voyage.prixKg }}</strong> | Tarif / Objet : <strong class="text-white">{{ voyage.prixObjet }}</strong></span>
          </div>
        </div>

        <!-- Dynamic Revenue Metrics for this Voyage -->
        <div class="pt-3 border-t border-sky-800/80 grid grid-cols-2 gap-4 text-xs">
          <div>
            <span class="text-emerald-300 font-bold block">Revenus confirmés</span>
            <span class="text-lg sm:text-xl font-black text-emerald-400 block mt-0.5">
              {{ totalRevenuVolAccepte }}
            </span>
          </div>
          <div class="text-right">
            <span class="text-amber-200 font-bold block">Chiffre d'affaires estimé</span>
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
            <h3 class="text-xs font-bold text-gray-400 dark:text-slate-400 uppercase tracking-wider">Tarifications appliquées</h3>
            <div class="grid grid-cols-2 gap-4">
              <div class="bg-slate-50 dark:bg-slate-800/80 p-3.5 rounded-2xl border border-slate-100 dark:border-slate-700 space-y-1">
                <span class="text-xs text-gray-500 dark:text-slate-400 block font-medium">Prix par kilo (Kg)</span>
                <span class="text-lg font-black text-[#B50302] dark:text-rose-400 block">{{ voyage.prixKg }}</span>
              </div>
              <div class="bg-slate-50 dark:bg-slate-800/80 p-3.5 rounded-2xl border border-slate-100 dark:border-slate-700 space-y-1">
                <span class="text-xs text-gray-500 dark:text-slate-400 block font-medium">Prix par objet / pli</span>
                <span class="text-lg font-black text-[#053754] dark:text-sky-300 block">{{ voyage.prixObjet }}</span>
              </div>
            </div>
          </div>

          <!-- Adresse de Dépôt Card -->
          <div class="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-gray-200 dark:border-slate-800 shadow-2xs space-y-3">
            <div class="flex items-center justify-between border-b border-gray-100 dark:border-slate-800 pb-2">
              <h3 class="text-xs font-bold text-gray-400 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <span>📍</span> Adresse de Dépôt
              </h3>
            </div>
            
            <template v-if="voyage.adresseDepot">
              <div class="space-y-1 text-xs">
                <p class="font-extrabold text-[#053754] dark:text-sky-300 text-sm sm:text-base">{{ voyage.adresseDepot.adresse }}</p>
                <p class="text-gray-600 dark:text-slate-300 font-medium">{{ voyage.adresseDepot.ville }}, {{ voyage.adresseDepot.pays }}</p>
              </div>
              
              <div v-if="voyage.adresseDepot.horaire_ouverture" class="bg-amber-50/60 dark:bg-amber-950/30 border border-amber-200/60 dark:border-amber-800/60 p-3 rounded-2xl text-xs space-y-0.5">
                <span class="text-amber-800 dark:text-amber-300 font-bold block">🕒 Horaires d'ouverture</span>
                <span class="text-amber-900 dark:text-amber-200 font-medium block">{{ voyage.adresseDepot.horaire_ouverture }}</span>
              </div>

              <div v-if="voyage.adresseDepot.instructions" class="bg-blue-50/60 dark:bg-sky-950/40 border border-blue-200/60 dark:border-sky-800/60 p-3 rounded-2xl text-xs space-y-0.5">
                <span class="text-blue-800 dark:text-sky-300 font-bold block">💡 Consignes de dépôt</span>
                <span class="text-blue-900 dark:text-sky-200 font-medium block">{{ voyage.adresseDepot.instructions }}</span>
              </div>
            </template>
            <p v-else class="text-xs text-gray-400 dark:text-slate-500 italic">Aucune adresse de dépôt renseignée</p>
          </div>

          <!-- Adresse de Récupération Card -->
          <div class="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-gray-200 dark:border-slate-800 shadow-2xs space-y-3">
            <div class="flex items-center justify-between border-b border-gray-100 dark:border-slate-800 pb-2">
              <h3 class="text-xs font-bold text-gray-400 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <span>📍</span> Adresse de Récupération
              </h3>
            </div>

            <template v-if="voyage.adresseRetrait">
              <div class="space-y-1 text-xs">
                <p class="font-extrabold text-[#053754] dark:text-sky-300 text-sm sm:text-base">{{ voyage.adresseRetrait.adresse }}</p>
                <p class="text-gray-600 dark:text-slate-300 font-medium">{{ voyage.adresseRetrait.ville }}, {{ voyage.adresseRetrait.pays }}</p>
              </div>

              <div v-if="voyage.adresseRetrait.horaire_ouverture" class="bg-amber-50/60 dark:bg-amber-950/30 border border-amber-200/60 dark:border-amber-800/60 p-3 rounded-2xl text-xs space-y-0.5">
                <span class="text-amber-800 dark:text-amber-300 font-bold block">🕒 Horaires de retrait</span>
                <span class="text-amber-900 dark:text-amber-200 font-medium block">{{ voyage.adresseRetrait.horaire_ouverture }}</span>
              </div>

              <div v-if="voyage.adresseRetrait.instructions" class="bg-blue-50/60 dark:bg-sky-950/40 border border-blue-200/60 dark:border-sky-800/60 p-3 rounded-2xl text-xs space-y-0.5">
                <span class="text-blue-800 dark:text-sky-300 font-bold block">💡 Consignes de retrait</span>
                <span class="text-blue-900 dark:text-sky-200 font-medium block">{{ voyage.adresseRetrait.instructions }}</span>
              </div>
            </template>
            <p v-else class="text-xs text-gray-400 dark:text-slate-500 italic">Aucune adresse de récupération renseignée</p>
          </div>

          <!-- Description / Notes -->
          <div v-if="voyage.description" class="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-gray-200 dark:border-slate-800 shadow-2xs space-y-2">
            <h3 class="text-xs font-bold text-gray-400 dark:text-slate-400 uppercase tracking-wider">Note & Consignes particulières</h3>
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
              <span>Catégories d'objets autorisés</span>
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
            <p v-else class="text-xs text-gray-400 dark:text-slate-500 italic">Aucune catégorie spécifique</p>
          </div>

          <!-- Objets interdits Card -->
          <div class="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-red-300 dark:border-rose-900 shadow-2xs space-y-3">
            <div class="flex items-center gap-2 text-red-800 dark:text-rose-300 font-extrabold text-sm border-b border-red-100 dark:border-rose-950 pb-2">
              <span class="text-base">🚫</span>
              <span>Catégories d'objets interdits</span>
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
            <p v-else class="text-xs text-gray-400 dark:text-slate-500 italic">Aucune restriction spécifique</p>
          </div>
        </div>

      </div>

      <!-- Reservations Section -->
      <div class="space-y-4 pt-4 border-t border-gray-200 dark:border-slate-800">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h2 class="text-base sm:text-lg font-bold text-principal-dark dark:text-sky-300 flex items-center gap-2">
            <span>Réservations associées</span>
            <span class="bg-sky-100 dark:bg-sky-950 text-[#074C72] dark:text-sky-300 text-xs px-2.5 py-0.5 rounded-full font-black">{{ filteredReservations.length }}</span>
          </h2>
          
          <!-- Search Bar Input -->
          <div class="relative w-full sm:w-72">
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Rechercher (nom client, N° suivi, type...)"
              class="w-full bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-2xl pl-9 pr-8 py-2 text-xs font-medium text-gray-900 dark:text-slate-100 outline-none focus:border-[#074C72] dark:focus:border-sky-400 shadow-2xs"
            />
            <span class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs">🔍</span>
            <button
              v-if="searchQuery"
              @click="searchQuery = ''"
              type="button"
              class="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-xs font-bold p-1 cursor-pointer"
            >
              ✕
            </button>
          </div>
        </div>

        <template v-if="filteredReservations.length > 0">
          <!-- Desktop Table View -->
          <div class="hidden md:block overflow-x-auto min-w-full bg-white dark:bg-slate-900 rounded-3xl border border-gray-200 dark:border-slate-800 shadow-sm p-4">
            <table class="min-w-max w-full text-left border-collapse">
              <thead>
                <tr class="border-b border-gray-100 dark:border-slate-800 text-[11px] font-extrabold text-gray-400 dark:text-slate-400 uppercase tracking-wider whitespace-nowrap">
                  <th class="pb-3 px-3">Tracking / Code</th>
                  <th class="pb-3 px-3">Client</th>
                  <th class="pb-3 px-3">Contenu / Fragile</th>
                  <th class="pb-3 px-3">Poids</th>
                  <th class="pb-3 px-3">Montant Total</th>
                  <th class="pb-3 px-3">Statut</th>
                  <th class="pb-3 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-100 dark:divide-slate-800/60 text-xs whitespace-nowrap">
                <tr
                  v-for="res in filteredReservations"
                  :key="res.id"
                  class="hover:bg-sky-50/50 dark:hover:bg-slate-800/50 transition-colors"
                >
                  <td class="py-3.5 px-3">
                    <span class="font-extrabold text-[#053754] dark:text-sky-300 font-mono bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-700">
                      {{ truncateText(res.codeTracking, 30) }}
                    </span>
                    <span class="block text-[10px] text-gray-400 dark:text-slate-400 font-mono mt-0.5">{{ truncateText(res.numero, 30) }}</span>
                  </td>
                  <td class="py-3.5 px-3 font-extrabold text-gray-900 dark:text-slate-100">
                    <div class="flex items-center gap-2">
                      <div class="w-7 h-7 rounded-full bg-[#053754] text-white text-[10px] font-bold flex items-center justify-center shrink-0">
                        {{ res.clientNom.slice(0, 2).toUpperCase() }}
                      </div>
                      <div>
                        <div>{{ truncateText(res.clientNom, 30) }}</div>
                        <div class="text-[10px] text-gray-400 font-normal">{{ truncateText(res.clientPhone, 30) }}</div>
                      </div>
                    </div>
                  </td>
                  <td class="py-3.5 px-3">
                    <span class="font-bold text-gray-800 dark:text-slate-200 block">{{ truncateText(res.colisType, 30) }}</span>
                    <span v-if="res.colisEstFragile" class="inline-block text-[10px] font-bold text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/60 px-2 py-0.5 rounded border border-amber-200 dark:border-amber-800">
                      ⚠️ Fragile
                    </span>
                  </td>
                  <td class="py-3.5 px-3 font-extrabold text-[#B50302] dark:text-rose-400">
                    {{ res.colisPoids }}
                  </td>
                  <td class="py-3.5 px-3 font-black text-[#053754] dark:text-sky-300 text-sm">
                    {{ res.montantTotal }}
                  </td>
                  <td class="py-3.5 px-3">
                    <span
                      class="text-[10px] font-extrabold px-2.5 py-1 rounded-full border whitespace-nowrap"
                      :class="getReservationStatusBadge(res.statut).cls"
                    >
                      {{ getReservationStatusBadge(res.statut).text }}
                    </span>
                  </td>
                  <td class="py-3.5 px-3 text-right" @click.stop>
                    <div class="flex items-center justify-end gap-1.5">
                      <button
                        @click="goToDemandeDetail(res.id)"
                        type="button"
                        class="bg-sky-50 dark:bg-sky-950/60 hover:bg-sky-100 dark:hover:bg-sky-900 text-[#074C72] dark:text-sky-300 border border-sky-200 dark:border-sky-800 font-extrabold text-[11px] px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer"
                      >
                        Détails
                      </button>

                      <button
                        v-if="res.statut === 'en_attente'"
                        @click="handleAccepter(res.id)"
                        :disabled="isUpdatingStatus"
                        type="button"
                        class="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-[11px] px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer shadow-2xs"
                      >
                        Accepter
                      </button>
                      <button
                        v-if="res.statut === 'en_attente'"
                        @click="handleRefuser(res.id)"
                        :disabled="isUpdatingStatus"
                        type="button"
                        class="bg-red-50 dark:bg-rose-950/50 hover:bg-red-100 text-[#B50302] dark:text-rose-300 border border-red-200 dark:border-rose-900 font-extrabold text-[11px] px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer"
                      >
                        Refuser
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Mobile Cards View -->
          <div class="grid grid-cols-1 gap-4 md:hidden">
            <div
              v-for="res in filteredReservations"
              :key="res.id"
              class="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-gray-200 dark:border-slate-800 shadow-sm space-y-4 flex flex-col justify-between"
            >
              <!-- Card Header -->
              <div class="flex items-center justify-between gap-3">
                <div class="flex items-center gap-3">
                  <div class="w-10 h-10 rounded-full bg-[#053754] text-white font-extrabold text-xs flex items-center justify-center shrink-0 shadow-xs">
                    {{ res.clientNom.slice(0, 2).toUpperCase() }}
                  </div>
                  <div>
                    <h4 class="text-sm font-extrabold text-gray-900 dark:text-slate-100">
                      {{ res.clientNom }}
                    </h4>
                    <span class="text-[10px] text-gray-400 font-medium">Expéditeur</span>
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
                  <span class="text-gray-400 dark:text-slate-400 font-medium">Numéro</span>
                  <span class="font-extrabold text-[#053754] dark:text-sky-300 font-mono bg-white dark:bg-slate-900 px-2 py-0.5 rounded-md border border-gray-200 dark:border-slate-700">{{ res.numero }}</span>
                </div>

                <div class="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span class="text-gray-400 dark:text-slate-400 font-medium block">Contenu</span>
                    <span class="font-extrabold text-gray-900 dark:text-slate-100 block truncate">{{ res.colisType }}</span>
                  </div>
                  <div class="text-right">
                    <span class="text-gray-400 dark:text-slate-400 font-medium block">Poids</span>
                    <span class="font-extrabold text-[#B50302] dark:text-rose-400 block">{{ res.colisPoids }}</span>
                  </div>
                </div>

                <div v-if="res.colisEstFragile" class="bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 text-[11px] font-bold px-2.5 py-1 rounded-lg border border-amber-200/80 dark:border-amber-800 flex items-center gap-1.5">
                  <span>⚠️</span> Fragile
                </div>
              </div>

              <!-- Footer Action & Price Row -->
              <div class="border-t border-gray-100 dark:border-slate-800 pt-3 flex items-center justify-between gap-2">
                <div>
                  <span class="text-[10px] text-gray-400 dark:text-slate-400 font-bold uppercase block">Montant</span>
                  <span class="font-black text-[#053754] dark:text-sky-300 text-base sm:text-lg">{{ res.montantTotal }}</span>
                </div>

                <div class="flex items-center gap-1.5" @click.stop>
                  <button
                    @click="goToDemandeDetail(res.id)"
                    type="button"
                    class="h-9 px-3 rounded-xl bg-sky-50 dark:bg-sky-950/60 hover:bg-sky-100 dark:hover:bg-sky-900 text-[#074C72] dark:text-sky-300 border border-sky-200 dark:border-sky-800 font-extrabold text-xs flex items-center justify-center transition-all cursor-pointer"
                  >
                    Détails
                  </button>

                  <button
                    v-if="res.statut === 'en_attente'"
                    @click="handleAccepter(res.id)"
                    :disabled="isUpdatingStatus"
                    type="button"
                    class="h-9 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs flex items-center justify-center transition-all cursor-pointer shadow-2xs"
                  >
                    Accepter
                  </button>

                  <button
                    v-if="res.statut === 'en_attente'"
                    @click="handleRefuser(res.id)"
                    :disabled="isUpdatingStatus"
                    type="button"
                    class="h-9 px-3 rounded-xl bg-red-50 dark:bg-rose-950/50 hover:bg-red-100 text-[#B50302] dark:text-rose-300 border border-red-200 dark:border-rose-900 font-extrabold text-xs flex items-center justify-center transition-all cursor-pointer"
                  >
                    Refuser
                  </button>
                </div>
              </div>
            </div>
          </div>
        </template>

        <!-- Empty state if no reservations -->
        <div v-else class="bg-white dark:bg-slate-900 rounded-3xl p-10 text-center border border-gray-200 dark:border-slate-800 space-y-2">
          <div class="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 flex items-center justify-center text-xl mx-auto font-bold">
            📦
          </div>
          <p class="text-sm font-bold text-gray-700 dark:text-slate-200">Aucune réservation pour le moment</p>
          <p class="text-xs text-gray-400 dark:text-slate-400">Les demandes de réservation de vos clients apparaîtront ici.</p>
        </div>
      </div>
    </template>
  </div>
</template>
