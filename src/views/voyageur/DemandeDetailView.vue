<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from '@/composables/useI18n'
import Swal from 'sweetalert2'
import { fetchReservation, accepterReservation, refuserReservation, annulerReservation, updateColisStatut } from '@/services/reservationService'
import { postReservationPaiement, fetchPaiements } from '@/services/paiementService'
import { getCountryFlag, formatVoyageDate, formatDateTime, getColisStatutLabel } from '@/utils/flagHelper'
import CountryFlag from '@/components/common/CountryFlag.vue'
import { decodeId, encodeId } from '@/utils/idMasker'
import { setHeaderRoute } from '@/utils/headerState'
import { currentCurrency, formatPrice } from '@/utils/currencyState'

const { t } = useI18n()
const route = useRoute()
const router = useRouter()

const isLoading = ref(true)
const errorMsg = ref('')
const isUpdatingStatus = ref(false)
const demande = ref(null)

const formattedPrice = computed(() => {
  if (!demande.value) return ''
  return formatPrice(demande.value.rawPrice, demande.value.rawDevise)
})

const formattedEstimatedValue = computed(() => {
  if (!demande.value || !demande.value.rawEstimatedValue) return 'Non renseignée'
  return formatPrice(demande.value.rawEstimatedValue, demande.value.rawDevise)
})

const isPaymentDone = computed(() => Boolean(demande.value?.isPaid))

const selectedColisStatut = ref('en_transit')
const colisCommentaire = ref('')
const isSubmittingColisStatut = ref(false)

const selectedPaymentMode = ref('espece_depot')
const isSubmittingPaiement = ref(false)

const colisStatutOptions = [
  { value: 'colis_depose', label: '📍 Colis déposé au point relais' },
  { value: 'colis_pris_en_charge', label: '🧳 Colis pris en charge par le GP' },
  { value: 'en_transit', label: '✈️ En transit / En vol' },
  { value: 'arrive', label: '🛬 Arrivé au point de destination' },
  { value: 'livre', label: '🎁 Livré au destinataire' }
]

const isVoyageClosedOrCompleted = computed(() => {
  if (!demande.value) return false
  const vStatut = (demande.value.voyageStatut || '').toLowerCase()
  const isClosedStatut = ['complet', 'ferme', 'cloture', 'termine'].includes(vStatut)
  const isPastDepart = demande.value.departureDate ? new Date(demande.value.departureDate) <= new Date() : false
  return isClosedStatut || isPastDepart
})

const availableColisStatutOptions = computed(() => {
  if (!demande.value) return colisStatutOptions

  const doneStatuts = new Set()

  if (Array.isArray(demande.value.suivis)) {
    demande.value.suivis.forEach(s => {
      if (s && s.statut) {
        doneStatuts.add(s.statut)
      }
    })
  }

  if (demande.value.colisStatut) {
    doneStatuts.add(demande.value.colisStatut)
  }

  const statusLevels = {
    'colis_depose': 1,
    'colis_pris_en_charge': 2,
    'en_transit': 3,
    'arrive': 4,
    'livre': 5,
    'livree': 5
  }

  let maxLevelAchieved = 0
  doneStatuts.forEach(st => {
    if (statusLevels[st] && statusLevels[st] > maxLevelAchieved) {
      maxLevelAchieved = statusLevels[st]
    }
  })

  return colisStatutOptions.filter(opt => {
    const level = statusLevels[opt.value]
    if (level !== maxLevelAchieved + 1) return false
    if (!isVoyageClosedOrCompleted.value && ['en_transit', 'arrive', 'livre', 'livree'].includes(opt.value)) {
      return false
    }
    return true
  })
})

watch(availableColisStatutOptions, (opts) => {
  if (opts && opts.length > 0) {
    if (!opts.some(o => o.value === selectedColisStatut.value)) {
      selectedColisStatut.value = opts[0].value
    }
  }
}, { immediate: true })

const defaultColisPhoto = 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=600&auto=format&fit=crop&q=80'

const formatPhotoUrl = (url) => {
  if (!url || typeof url !== 'string') return null
  if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:')) {
    return url
  }
  const cleanUrl = url.replace(/^\//, '')
  if (cleanUrl.startsWith('storage/')) {
    return `http://localhost:8000/${cleanUrl}`
  }
  return `http://localhost:8000/storage/${cleanUrl}`
}

const handlePhotoError = (e) => {
  if (e && e.target) {
    e.target.src = defaultColisPhoto
  }
}

const lightboxPhoto = ref(null)
const openPhotoLightbox = (url) => {
  lightboxPhoto.value = url || defaultColisPhoto
}
const closePhotoLightbox = () => {
  lightboxPhoto.value = null
}

const loadDemande = async () => {
  const rawId = decodeId(route.params.id)
  if (!rawId) {
    errorMsg.value = 'Identifiant de réservation invalide.'
    isLoading.value = false
    return
  }

  isLoading.value = true
  errorMsg.value = ''

  try {
    const res = await fetchReservation(rawId)
    if (res && res.data) {
      const data = res.data
      const c = data.colis || {}
      const u = data.client?.user || {}
      const v = data.voyage || {}

      const clientName = `${u.prenom || ''} ${u.nom || data.expediteur_nom || ''}`.trim() || 'Client Rahma'

      const rawPhoto = c.photo || c.photo_url || data.photo || data.photo_colis || data.photo_url || null

      const checkPaidStatus = (s) => {
        if (s === undefined || s === null) return false
        if (typeof s === 'boolean') return s
        if (typeof s === 'number') return s === 1
        const str = String(s).toLowerCase().trim()
        return (
          str === '1' ||
          str === 'true' ||
          str.includes('reuss') ||
          str.includes('pay') ||
          str.includes('valid') ||
          str.includes('disponib') ||
          str.includes('succ') ||
          str.includes('complet')
        )
      }

      let paiementsFromApi = []
      try {
        const paiementsRes = await fetchPaiements()
        if (paiementsRes) {
          const list = Array.isArray(paiementsRes.data) 
            ? paiementsRes.data 
            : (paiementsRes.data?.data ? paiementsRes.data.data : (Array.isArray(paiementsRes) ? paiementsRes : []))
          paiementsFromApi = list.filter(p => p && (
            String(p.reservation_id) === String(rawId) ||
            String(p.reservation?.id) === String(rawId)
          ))
        }
      } catch (e) {
        // fallback
      }

      const rawPaiements = data.paiements || data.paiement || c.paiements || c.paiement || []
      const paiements = Array.isArray(rawPaiements) ? rawPaiements : (rawPaiements ? [rawPaiements] : [])
      const allPaiements = [...paiements, ...paiementsFromApi]

      const hasPaidPayment = allPaiements.some(p => p && (checkPaidStatus(p.statut) || checkPaidStatus(p.status) || checkPaidStatus(p.state)))

      const isPaid = Boolean(
        checkPaidStatus(data.est_paye) ||
        checkPaidStatus(data.is_paid) ||
        checkPaidStatus(data.statut_paiement) ||
        checkPaidStatus(data.statutPaiement) ||
        checkPaidStatus(data.paiement_statut) ||
        checkPaidStatus(c.est_paye) ||
        checkPaidStatus(c.is_paid) ||
        checkPaidStatus(c.statut_paiement) ||
        hasPaidPayment
      )

      demande.value = {
        id: data.id,
        rawId: rawId,
        maskedId: route.params.id,
        code: data.numero || `RES-${data.id.slice(0, 8)}`,
        codeTracking: c.numero_suivi || data.code_tracking || 'TRK-EN-ATTENTE',
        statut: data.statut || 'en_attente',
        isPaid,

        colisId: c.id || null,
        colisStatut: c.statut || 'demande_envoyee',
        suivis: Array.isArray(c.suivis) ? c.suivis : [],

        clientName,
        clientPhone: u.telephone || data.expediteur_telephone || 'Non renseigné',
        clientEmail: u.email || 'Non renseigné',

        parcelType: c.type || data.type_colis || 'Colis de marchandise',
        description: c.description || data.description || 'Aucune description',
        weight: (c.poids !== undefined && c.poids !== null) ? `${c.poids} Kg` : (data.poids ? `${data.poids} Kg` : 'Objet'),
        rawEstimatedValue: c.valeur_estimee ? Number(c.valeur_estimee) : null,
        estimatedValue: c.valeur_estimee ? `${Number(c.valeur_estimee).toLocaleString()} ${v.devise || 'XOF'}` : 'Non renseignée',
        isFragile: Boolean(c.est_fragile),
        photo: formatPhotoUrl(rawPhoto),

        recipientName: `${c.destinataire_prenom || ''} ${c.destinataire_nom || ''}`.trim() || 'Non renseigné',
        recipientPhone: c.destinataire_numero || 'Non renseigné',
        recipientAddress: c.destinataire_adresse || 'Non renseignée',

        paymentMode: data.mode_paiement_souhaite || data.mode_paiement || 'Au dépôt',
        rawPrice: Number(data.montant_total || data.prix_total || 0),
        rawDevise: v.devise || 'XOF',
        price: `${Number(data.montant_total || data.prix_total || 0).toLocaleString()} ${v.devise || 'XOF'}`,
        createdAt: data.created_at,

        routeFrom: v.ville_depart || 'Départ',
        countryFrom: v.pays_depart || '',
        flagFrom: getCountryFlag(v.ville_depart, v.pays_depart),
        routeTo: v.ville_destination || 'Destination',
        countryTo: v.pays_destination || '',
        flagTo: getCountryFlag(v.ville_destination, v.pays_destination),
        departureDate: v.date_depart,
        voyageStatut: v.statut || 'publie',
        voyageId: v.id
      }

      setHeaderRoute({
        routeFrom: demande.value.routeFrom,
        countryFrom: demande.value.countryFrom,
        routeTo: demande.value.routeTo,
        countryTo: demande.value.countryTo
      })
    } else {
      errorMsg.value = 'Réservation introuvable.'
    }
  } catch (err) {
    errorMsg.value = err?.message || err?.data?.message || 'Erreur lors du chargement des détails de la réservation.'
  } finally {
    isLoading.value = false
  }
}

onMounted(loadDemande)

const handleUpdateColisStatut = async () => {
  if (!demande.value || !demande.value.colisId) {
    Swal.fire({ icon: 'warning', title: 'Erreur', text: 'Identifiant de colis introuvable.' })
    return
  }

  isSubmittingColisStatut.value = true
  try {
    const payload = {
      statut: selectedColisStatut.value,
      commentaire: colisCommentaire.value.trim() || undefined
    }
    await updateColisStatut(demande.value.colisId, payload)

    Swal.fire({
      toast: true,
      position: 'top-end',
      icon: 'success',
      title: 'Statut du colis mis à jour avec succès !',
      showConfirmButton: false,
      timer: 3000
    })

    colisCommentaire.value = ''
    await loadDemande()
  } catch (err) {
    Swal.fire({
      icon: 'error',
      title: 'Erreur',
      text: err?.message || err?.data?.message || 'Impossible de mettre à jour le statut du colis.'
    })
  } finally {
    isSubmittingColisStatut.value = false
  }
}

const handleRecordPaiementVoyageur = async () => {
  if (!demande.value) return
  isSubmittingPaiement.value = true
  try {
    await postReservationPaiement(demande.value.rawId, {
      mode_paiement: selectedPaymentMode.value,
      statut: 'reussi'
    })
    if (demande.value) {
      demande.value.isPaid = true
    }
    Swal.fire({
      toast: true,
      position: 'top-end',
      icon: 'success',
      title: 'Paiement en espèces validé & crédité !',
      showConfirmButton: false,
      timer: 3000
    })
    await loadDemande()
  } catch (err) {
    const errorText = err?.message || err?.data?.message || err?.response?.data?.message || ''
    if (
      errorText.toLowerCase().includes('existe déjà') ||
      errorText.toLowerCase().includes('déjà') ||
      errorText.toLowerCase().includes('reussi') ||
      errorText.toLowerCase().includes('paye')
    ) {
      if (demande.value) {
        demande.value.isPaid = true
      }
      Swal.fire({
        toast: true,
        position: 'top-end',
        icon: 'info',
        title: 'Un paiement réussi a déjà été enregistré pour cette réservation.',
        showConfirmButton: false,
        timer: 3000
      })
      return
    }
    Swal.fire({
      icon: 'error',
      title: 'Erreur',
      text: errorText || 'Impossible de valider le paiement.'
    })
  } finally {
    isSubmittingPaiement.value = false
  }
}

const acceptDemande = async () => {
  if (!demande.value) return
  isUpdatingStatus.value = true
  try {
    await accepterReservation(demande.value.rawId)
    demande.value.statut = 'acceptee'
    Swal.fire({
      toast: true,
      position: 'top-end',
      icon: 'success',
      title: `La réservation ${demande.value.code} a été acceptée avec succès !`,
      showConfirmButton: false,
      timer: 3000
    })
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

const refuseDemande = async () => {
  if (!demande.value) return
  isUpdatingStatus.value = true
  try {
    await refuserReservation(demande.value.rawId)
    demande.value.statut = 'refusee'
    Swal.fire({
      toast: true,
      position: 'top-end',
      icon: 'info',
      title: `La réservation ${demande.value.code} a été refusée.`,
      showConfirmButton: false,
      timer: 3000
    })
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

const cancelDemande = async () => {
  if (!demande.value) return
  const result = await Swal.fire({
    title: 'Annuler la réservation ?',
    text: 'Cette action annulera définitivement cette demande de réservation.',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#B50302',
    cancelButtonColor: '#6B7280',
    confirmButtonText: 'Oui, annuler',
    cancelButtonText: 'Conserver'
  })

  if (!result.isConfirmed) return

  isUpdatingStatus.value = true
  try {
    await annulerReservation(demande.value.rawId)
    demande.value.statut = 'annulee'
    Swal.fire({
      toast: true,
      position: 'top-end',
      icon: 'success',
      title: 'Réservation annulée.',
      showConfirmButton: false,
      timer: 3000
    })
  } catch (err) {
    Swal.fire({
      icon: 'error',
      title: 'Erreur',
      text: err?.message || err?.data?.message || 'Impossible d\'annuler la réservation.'
    })
  } finally {
    isUpdatingStatus.value = false
  }
}

const goToChat = () => {
  if (demande.value) {
    router.push(`/voyageur/messages/${encodeId(demande.value.id)}`)
  }
}

const goBackToVoyage = () => {
  if (demande.value?.voyageId) {
    router.push(`/voyageur/voyages/${encodeId(demande.value.voyageId)}`)
  } else {
    router.push('/voyageur/demandes')
  }
}
</script>

<template>
  <div class="space-y-5 pb-16">
    <!-- Top Action Bar -->
    <div class="flex items-center justify-between gap-3">
      <button
        @click="goBackToVoyage"
        type="button"
        class="inline-flex items-center gap-2 text-xs font-bold text-gray-600 dark:text-slate-300 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 px-3.5 py-2 rounded-xl hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors shadow-2xs cursor-pointer"
      >
        <span>←</span>
        <span>{{ t('voyageur.voyageDetail.backBtn', 'Retour aux réservations') }}</span>
      </button>

      <span
        v-if="demande"
        class="text-xs font-extrabold px-3.5 py-1 rounded-full uppercase tracking-wider border"
        :class="{
          'bg-amber-50 dark:bg-amber-950/50 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-800': demande.statut === 'en_attente',
          'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800': demande.statut === 'acceptee',
          'bg-red-50 dark:bg-red-950/50 text-red-800 dark:text-red-300 border-red-300 dark:border-red-800': demande.statut === 'refusee',
          'bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-slate-300 border-gray-300 dark:border-slate-700': demande.statut === 'annulee' || demande.statut === 'annule'
        }"
      >
        {{ demande.statut === 'en_attente' ? t('voyageur.status.pending', '⏳ En attente') : demande.statut === 'acceptee' ? t('voyageur.status.accepted', '✓ Acceptée') : demande.statut === 'refusee' ? t('voyageur.status.refused', '✕ Refusée') : t('voyageur.status.cancelled', '🚫 Annulée') }}
      </span>
    </div>

    <!-- Loading State -->
    <div v-if="isLoading" class="bg-white dark:bg-slate-900 rounded-3xl p-12 text-center border border-gray-100 dark:border-slate-800 shadow-sm space-y-4">
      <div class="w-10 h-10 border-4 border-[#053754] dark:border-sky-400 border-t-transparent rounded-full animate-spin mx-auto"></div>
      <p class="text-sm font-bold text-gray-600 dark:text-slate-300">{{ t('voyageur.voyageDetail.loading', 'Chargement des détails de la demande...') }}</p>
    </div>

    <!-- Error State -->
    <div v-else-if="errorMsg" class="bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 rounded-3xl p-8 text-center space-y-3">
      <p class="text-sm font-bold text-red-800 dark:text-red-300">{{ errorMsg }}</p>
      <button @click="goBackToVoyage" class="px-4 py-2 bg-red-600 text-white font-bold text-xs rounded-xl">{{ t('voyageur.voyageDetail.backBtn', 'Retour') }}</button>
    </div>

    <template v-else-if="demande">
      <!-- Header Info Banner -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-2xl border border-gray-200 dark:border-slate-800 shadow-2xs">
        <div class="space-y-0.5">
          <div class="flex items-center gap-2">
            <h1 class="text-lg sm:text-xl font-serif font-bold text-principal-dark dark:text-sky-300">{{ t('voyageur.demandeDetail.title', 'Détails de la demande') }}</h1>
            <span class="font-extrabold text-[#074C72] dark:text-sky-300 text-xs bg-sky-50 dark:bg-sky-950/50 px-2.5 py-0.5 rounded-full border border-sky-100 dark:border-sky-800 font-mono">
              {{ demande.code }}
            </span>
          </div>
          <p class="text-xs text-gray-500 dark:text-slate-400 flex items-center gap-1.5 mt-0.5">
            <span>{{ t('voyageur.demandeDetail.trackingCode', 'Code de Suivi :') }}</span>
            <strong class="font-mono text-gray-800 dark:text-slate-200 bg-gray-100 dark:bg-slate-800 px-2 py-0.5 rounded">{{ demande.codeTracking }}</strong>
          </p>
        </div>

        <!-- Trajet Mini Badge -->
        <div class="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3.5 py-1.5 rounded-xl flex items-center gap-2 text-xs font-bold text-gray-800 dark:text-slate-200">
          <div class="flex items-center gap-1">
            <CountryFlag :city="demande.routeFrom" :country="demande.countryFrom" size="w-4 h-3" />
            <span>{{ demande.routeFrom }}</span>
          </div>
          <span class="text-red-500">➔</span>
          <div class="flex items-center gap-1">
            <CountryFlag :city="demande.routeTo" :country="demande.countryTo" size="w-4 h-3" />
            <span>{{ demande.routeTo }}</span>
          </div>
        </div>
      </div>

      <!-- Main Detail Card Container -->
      <div class="bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-6 border border-gray-200 dark:border-slate-800 shadow-sm space-y-6">
        
        <!-- Client Identity Banner -->
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 dark:border-slate-800 pb-4">
          <div class="flex items-center gap-3">
            <div class="w-12 h-12 rounded-full bg-[#053754] dark:bg-sky-600 text-white font-extrabold text-sm flex items-center justify-center shrink-0 shadow-xs">
              {{ demande.clientName.slice(0, 2).toUpperCase() }}
            </div>
            <div>
              <h3 class="text-base font-extrabold text-gray-900 dark:text-slate-100 leading-tight">{{ demande.clientName }}</h3>
              <span class="text-[10px] text-sky-700 dark:text-sky-300 font-extrabold bg-sky-50 dark:bg-sky-950/50 px-2 py-0.5 rounded-full border border-sky-100 dark:border-sky-800 mt-1 inline-block">{{ t('voyageur.demandeDetail.clientInfo', 'Client Rahma GP') }}</span>
            </div>
          </div>

          <button
            @click="goToChat"
            type="button"
            class="w-full sm:w-auto bg-sky-50 dark:bg-sky-950/60 text-[#074C72] dark:text-sky-300 border border-sky-200 dark:border-sky-800 hover:bg-sky-100 dark:hover:bg-sky-900/60 font-extrabold text-xs px-4 py-2.5 rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-1.5"
          >
            <span>💬</span> {{ t('voyageur.messages.title', 'DISCUTER AVEC LE CLIENT') }}
          </button>
        </div>

        <!-- Parcel Description & Image Card -->
        <div class="space-y-3">
          <h4 class="text-xs font-extrabold text-gray-400 dark:text-slate-400 uppercase tracking-wider">{{ t('voyageur.demandeDetail.parcelInfo', 'Détails du colis') }}</h4>
          
          <div class="bg-gray-50 dark:bg-slate-800/60 rounded-2xl p-4 border border-gray-200/80 dark:border-slate-700/80 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs sm:text-sm">
            <div class="space-y-2.5">
              <div>
                <span class="text-gray-400 dark:text-slate-400 font-medium block">{{ t('voyageur.demandeDetail.contentType', 'Type de contenu :') }}</span>
                <span class="font-extrabold text-[#053754] dark:text-sky-300 text-sm sm:text-base">{{ demande.parcelType }}</span>
              </div>
              <div>
                <span class="text-gray-400 dark:text-slate-400 font-medium block">{{ t('voyageur.demandeDetail.parcelWeight', 'Poids du colis :') }}</span>
                <span class="font-extrabold text-[#B50302] dark:text-red-400 text-sm">{{ demande.weight }}</span>
              </div>
              <div>
                <span class="text-gray-400 dark:text-slate-400 font-medium block">{{ t('voyageur.demandeDetail.estimatedValue', 'Valeur estimée du colis :') }}</span>
                <span class="font-bold text-gray-800 dark:text-slate-200 text-sm">{{ formattedEstimatedValue }}</span>
              </div>
              <div>
                <span class="text-gray-400 dark:text-slate-400 font-medium block">{{ t('voyageur.demandeDetail.parcelNature', 'Nature du colis :') }}</span>
                <span class="font-bold text-xs px-2.5 py-0.5 rounded-md inline-block mt-0.5" :class="demande.isFragile ? 'bg-amber-100 dark:bg-amber-950/50 text-amber-900 dark:text-amber-300 border border-amber-200 dark:border-amber-800' : 'bg-gray-200 dark:bg-slate-700 text-gray-700 dark:text-slate-300'">
                  {{ demande.isFragile ? t('voyageur.demandeDetail.fragileLabel', '⚠️ Colis Fragile') : t('voyageur.demandeDetail.standardLabel', 'Standard') }}
                </span>
              </div>
              <div>
                <span class="text-gray-400 dark:text-slate-400 font-medium block">{{ t('voyageur.demandeDetail.paymentMode', 'Mode de paiement souhaité :') }}</span>
                <span class="font-bold text-sky-800 dark:text-sky-300 uppercase tracking-wider">{{ demande.paymentMode }}</span>
              </div>
            </div>

            <!-- Description & Photo -->
            <div class="space-y-2">
              <div>
                <span class="text-gray-400 dark:text-slate-400 font-medium block">{{ t('voyageur.demandeDetail.description', 'Description :') }}</span>
                <p class="text-xs text-gray-800 dark:text-slate-200 font-semibold bg-white dark:bg-slate-900 p-2.5 rounded-xl border border-gray-200 dark:border-slate-700 leading-relaxed mt-1">
                  {{ demande.description }}
                </p>
              </div>

              <div v-if="demande.photo" class="space-y-1">
                <span class="text-gray-400 dark:text-slate-400 font-medium block">{{ t('voyageur.demandeDetail.parcelPhoto', 'Photo du colis :') }}</span>
                <div 
                  class="w-full h-44 sm:h-52 rounded-2xl overflow-hidden border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-900 relative group cursor-pointer shadow-2xs" 
                  @click="openPhotoLightbox(demande.photo)"
                >
                  <img 
                    :src="demande.photo" 
                    @error="handlePhotoError" 
                    alt="Photo du colis" 
                    class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
                  />
                  <div class="absolute inset-0 bg-black/25 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-bold gap-1.5 backdrop-blur-[1px]">
                    <span>{{ t('voyageur.demandeDetail.enlargeImage', '🔍 Agrandir l\'image') }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Recipient Information Card -->
        <div class="space-y-3 pt-2">
          <h4 class="text-xs font-extrabold text-gray-400 dark:text-slate-400 uppercase tracking-wider">{{ t('voyageur.demandeDetail.recipientInfoTitle', 'Informations du Destinataire à l\'arrivée') }}</h4>

          <div class="bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-800/50 rounded-2xl p-4 space-y-1.5 shadow-2xs">
            <div class="font-extrabold text-gray-900 dark:text-amber-200 text-sm sm:text-base">{{ demande.recipientName }}</div>
            <div class="text-xs text-gray-600 dark:text-amber-300 font-medium pt-1 border-t border-amber-200/60 dark:border-amber-800/40">
              📍 {{ demande.recipientAddress }}
            </div>
          </div>
        </div>

        <!-- Section Validation du Paiement en Espèces (Voyageur) -->
        <div v-if="demande.statut === 'acceptee' && !isPaymentDone" class="space-y-3 pt-4 border-t border-gray-100 dark:border-slate-800">
          <div class="flex items-center gap-2">
            <span class="text-lg">💳</span>
            <h4 class="text-xs font-extrabold text-[#053754] dark:text-sky-300 uppercase tracking-wider">{{ t('voyageur.demandeDetail.cashCollectionTitle', 'Encaissement du paiement en espèces') }}</h4>
          </div>

          <div class="p-4 bg-sky-50/60 dark:bg-slate-800/80 rounded-2xl border border-sky-100 dark:border-slate-700 space-y-3">
            <p class="text-xs text-gray-600 dark:text-slate-300 font-medium leading-relaxed">
              {{ t('voyageur.demandeDetail.selectCashMode', 'Sélectionnez le mode d\'encaissement et confirmez la réception du paiement par le client :') }}
            </p>

            <div class="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <select 
                v-model="selectedPaymentMode"
                class="flex-1 px-3.5 py-2.5 bg-white dark:bg-slate-900 border border-sky-200 dark:border-slate-700 text-xs sm:text-sm font-semibold rounded-xl text-gray-800 dark:text-slate-100 outline-none focus:ring-2 focus:ring-[#074C72]/20"
              >
                <option value="espece_depot">{{ t('voyageur.demandeDetail.cashDeposit', '💵 Espèces lors du dépôt') }}</option>
                <option value="espece_retrait">{{ t('voyageur.demandeDetail.cashPickup', '💵 Espèces lors du retrait (À l\'arrivée)') }}</option>
              </select>

              <button
                @click="handleRecordPaiementVoyageur"
                :disabled="isSubmittingPaiement"
                type="button"
                class="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs px-5 py-3 rounded-xl shadow-md transition-all shrink-0 cursor-pointer active:scale-[0.99] disabled:opacity-50"
              >
                {{ isSubmittingPaiement ? t('voyageur.demandeDetail.validating', 'VALIDATION...') : t('voyageur.demandeDetail.validatePayment', '✓ VALIDER LE PAIEMENT') }}
              </button>
            </div>
          </div>
        </div>

        <!-- Section Suivi & Mise à jour du Colis (pour les réservations acceptées) -->
        <div v-if="demande.statut === 'acceptee'" class="space-y-4 pt-4 border-t border-gray-100 dark:border-slate-800">
          <div class="flex items-center gap-2">
            <span class="text-lg">🚚</span>
            <h4 class="text-xs font-extrabold text-[#053754] dark:text-sky-300 uppercase tracking-wider">
              {{ t('voyageur.demandeDetail.updateStatusModalTitle', 'Mettre à jour le Statut du Colis') }}
            </h4>
          </div>

          <div class="bg-sky-50/70 dark:bg-slate-800/80 border border-sky-200/80 dark:border-slate-700 rounded-2xl p-4 sm:p-5 space-y-4">
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label class="block text-xs font-bold text-[#074C72] dark:text-sky-300 mb-1">{{ t('voyageur.demandeDetail.newParcelStatus', 'Nouveau statut du colis') }}</label>
                <select
                  v-if="availableColisStatutOptions.length > 0"
                  v-model="selectedColisStatut"
                  class="w-full px-3.5 py-2.5 bg-white dark:bg-slate-900 border border-gray-300 dark:border-slate-700 rounded-xl text-xs font-bold text-gray-800 dark:text-slate-100 outline-none focus:border-[#074C72] dark:focus:border-sky-500 focus:ring-2 focus:ring-[#074C72]/20"
                >
                  <option v-for="opt in availableColisStatutOptions" :key="opt.value" :value="opt.value">
                    {{ opt.label }}
                  </option>
                </select>
                <div v-else class="px-3.5 py-2.5 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 rounded-xl text-xs font-bold flex items-center gap-1.5">
                  <span>🎉</span>
                  <span>{{ t('voyageur.demandeDetail.allStatusesApplied', 'Tous les statuts de suivi ont été appliqués') }}</span>
                </div>
                <div v-if="!isVoyageClosedOrCompleted" class="mt-2 p-2.5 bg-amber-50 dark:bg-amber-950/60 text-amber-900 dark:text-amber-200 border border-amber-200 dark:border-amber-800 rounded-xl text-[11px] font-medium flex items-start gap-1.5">
                  <span class="shrink-0 mt-0.5">⏳</span>
                  <span>{{ t('voyageur.demandeDetail.ongoingTripNotice', 'Voyage en cours : les statuts Transit, Arrivé et Livré seront débloqués quand le voyage sera complet/fermé ou sa date de départ passée.') }}</span>
                </div>
              </div>

              <div>
                <label class="block text-xs font-bold text-[#074C72] dark:text-sky-300 mb-1">{{ t('voyageur.demandeDetail.commentOptional', 'Commentaire (optionnel)') }}</label>
                <input
                  v-model="colisCommentaire"
                  type="text"
                  placeholder="ex: Le colis est dans l'avion en direction de Paris..."
                  class="w-full px-3.5 py-2.5 bg-white dark:bg-slate-900 border border-gray-300 dark:border-slate-700 text-gray-800 dark:text-slate-100 placeholder-gray-400 dark:placeholder-slate-500 rounded-xl text-xs font-medium outline-none focus:border-[#074C72] dark:focus:border-sky-500 focus:ring-2 focus:ring-[#074C72]/20"
                />
              </div>
            </div>

            <div class="flex justify-end">
              <button
                @click="handleUpdateColisStatut"
                :disabled="isSubmittingColisStatut || availableColisStatutOptions.length === 0"
                type="button"
                class="w-full sm:w-auto bg-[#053754] dark:bg-sky-600 hover:bg-[#074C72] dark:hover:bg-sky-500 text-white font-extrabold text-xs px-5 py-3 rounded-xl shadow-xs transition-all cursor-pointer flex items-center justify-center gap-2 uppercase tracking-wider disabled:opacity-50"
              >
                <span v-if="isSubmittingColisStatut" class="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                <span>{{ t('voyageur.demandeDetail.updateStatusBtn', 'METTRE À JOUR LE STATUT DU COLIS') }}</span>
              </button>
            </div>

            <!-- Historique des suivis du colis -->
            <div v-if="demande.suivis && demande.suivis.length > 0" class="pt-3 border-t border-sky-200/60 dark:border-slate-700 space-y-2">
              <span class="text-[11px] font-extrabold text-[#074C72] dark:text-sky-300 block uppercase tracking-wider">
                {{ t('voyageur.demandeDetail.trackingHistory', 'Historique du suivi ({count})', { count: demande.suivis.length }) }}
              </span>
              <div class="space-y-2">
                <div
                  v-for="s in demande.suivis"
                  :key="s.id"
                  class="bg-white dark:bg-slate-900 p-3 rounded-xl border border-sky-100 dark:border-slate-700 flex items-center justify-between text-xs"
                >
                  <div>
                    <span class="font-extrabold text-[#053754] dark:text-sky-300 block">{{ getColisStatutLabel(s.statut) }}</span>
                    <span v-if="s.commentaire" class="text-gray-600 dark:text-slate-400 text-[11px] block italic mt-0.5">{{ s.commentaire }}</span>
                  </div>
                  <span class="text-[10px] text-gray-400 dark:text-slate-500 font-medium shrink-0 ml-2">
                    {{ formatDateTime(s.date_changement || s.created_at) }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Price & Action CTA Row -->
        <div class="border-t border-gray-100 dark:border-slate-800 pt-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span class="text-xs text-gray-400 dark:text-slate-400 font-medium block">{{ t('voyageur.demandeDetail.totalTransportPrice', 'Prix total du transport :') }}</span>
            <span class="font-black text-[#053754] dark:text-sky-300 text-xl sm:text-2xl">{{ formattedPrice }}</span>
          </div>

          <div v-if="demande.statut === 'en_attente'" class="flex items-center gap-3">
            <button
              @click="refuseDemande"
              :disabled="isUpdatingStatus"
              type="button"
              class="flex-1 sm:flex-none px-5 py-3 rounded-xl bg-red-50 dark:bg-red-950/50 text-[#B50302] dark:text-red-400 border border-red-200 dark:border-red-900 font-extrabold text-xs hover:bg-red-100 dark:hover:bg-red-900/50 transition-colors cursor-pointer"
            >
              {{ t('voyageur.demandes.rejectBtn', 'REFUSER') }}
            </button>

            <button
              @click="acceptDemande"
              :disabled="isUpdatingStatus"
              type="button"
              class="flex-1 sm:flex-none bg-[#053754] dark:bg-sky-600 hover:bg-[#074C72] dark:hover:bg-sky-500 text-white font-extrabold text-xs sm:text-sm py-3.5 px-6 rounded-xl shadow-lg transition-all cursor-pointer uppercase tracking-wider active:scale-[0.99]"
            >
              ✓ {{ t('voyageur.demandes.acceptBtn', 'ACCEPTER LA RÉSERVATION') }}
            </button>
          </div>

          <div v-else-if="demande.statut === 'acceptee'">
            <span class="text-xs font-extrabold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 px-3.5 py-1.5 rounded-xl flex items-center gap-1.5">
              ✓ {{ t('voyageur.demandeDetail.statusAccepted', 'Réservation acceptée') }}
            </span>
          </div>
        </div>

      </div>
    </template>

    <!-- Photo Lightbox Modal -->
    <Teleport to="body">
      <div 
        v-if="lightboxPhoto" 
        class="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4"
        @click="closePhotoLightbox"
      >
        <div class="relative max-w-3xl w-full max-h-[85vh] flex items-center justify-center" @click.stop>
          <img 
            :src="lightboxPhoto" 
            @error="handlePhotoError" 
            alt="Agrandissement photo du colis" 
            class="max-w-full max-h-[85vh] object-contain rounded-2xl shadow-2xl" 
          />
          <button 
            @click="closePhotoLightbox"
            class="absolute -top-4 -right-4 bg-white text-gray-900 w-9 h-9 rounded-full font-black text-sm flex items-center justify-center shadow-lg hover:bg-gray-100 cursor-pointer"
          >
            ✕
          </button>
        </div>
      </div>
    </Teleport>
  </div>
</template>
