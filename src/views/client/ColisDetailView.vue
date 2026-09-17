<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import Swal from 'sweetalert2'
import { fetchReservation, annulerReservation } from '@/services/reservationService'
import { postReservationEvaluation, fetchVoyageurEvaluations } from '@/services/evaluationService'
import { postReservationPaiement } from '@/services/paiementService'
import { formatVoyageDate, formatDateTime, getColisStatutLabel } from '@/utils/flagHelper'
import CountryFlag from '@/components/common/CountryFlag.vue'
import { decodeId, encodeId } from '@/utils/idMasker'
import { setHeaderRoute } from '@/utils/headerState'
import { currentCurrency, formatPrice } from '@/utils/currencyState'

const route = useRoute()
const router = useRouter()
const reservationId = decodeId(route.params.id)

const isLoading = ref(true)
const errorMsg = ref('')
const reservation = ref(null)
const trackingSteps = ref([])

const formattedMontantTotal = computed(() => {
  if (!reservation.value) return '0 F CFA'
  return formatPrice(reservation.value.rawMontantTotal, reservation.value.rawDevise)
})

const selectedPaymentMode = ref('wave')
const customMontant = ref('')
const paymentRef = ref('')
const isSubmittingPayment = ref(false)

const ratingNote = ref(0)
const ratingComment = ref('')
const isSubmittingRating = ref(false)
const hasSubmittedRating = ref(false)

const currentReviewPage = ref(1)
const reviewsPerPage = 2

const voyageurReviews = ref({
  moyenneNotes: 0,
  totalEvaluations: 0,
  data: []
})

const totalReviewPages = computed(() => {
  const list = voyageurReviews.value.data || []
  return Math.ceil(list.length / reviewsPerPage) || 1
})

const paginatedVoyageurReviews = computed(() => {
  const list = voyageurReviews.value.data || []
  const start = (currentReviewPage.value - 1) * reviewsPerPage
  return list.slice(start, start + reviewsPerPage)
})

const loadVoyageurReviews = async (vId) => {
  if (!vId) return
  try {
    const res = await fetchVoyageurEvaluations(vId)
    if (res) {
      voyageurReviews.value = {
        moyenneNotes: res.moyenne_notes !== undefined ? Number(res.moyenne_notes) : 0,
        totalEvaluations: res.total_evaluations !== undefined ? Number(res.total_evaluations) : 0,
        data: Array.isArray(res.data) ? res.data : []
      }
    }
  } catch (e) {
    console.error('Erreur chargement avis voyageur:', e)
  }
}

const loadReservationData = async () => {
  if (!reservationId) {
    errorMsg.value = 'Identifiant de réservation manquant.'
    isLoading.value = false
    return
  }

  isLoading.value = true
  errorMsg.value = ''

  try {
    const res = await fetchReservation(reservationId)
    if (res && res.data) {
      const data = res.data
      const v = data.voyage || {}
      const c = data.colis || {}
      const vUser = v.voyageur?.user || v.voyageur || {}
      const transporteurName = `${vUser.prenom || ''} ${vUser.nom || ''}`.trim() || 'Voyageur GP'
      const vId = v.voyageur_id || v.voyageur?.id || null

      reservation.value = {
        id: data.id,
        voyageurId: vId,
        numero: data.numero || (c.numero_suivi ? `#${c.numero_suivi}` : `#RS-${data.id.slice(0, 8)}`),
        trackingCode: c.numero_suivi || data.code_tracking || 'TRK-EN-ATTENTE',
        statut: data.statut || 'en_attente',
        suivis: Array.isArray(c.suivis) ? c.suivis : [],
        
        villeDepart: v.ville_depart || 'Départ',
        paysDepart: v.pays_depart || '',
        villeDestination: v.ville_destination || 'Destination',
        paysDestination: v.pays_destination || '',
        dateDepart: v.date_depart || data.created_at,
        
        poids: c.poids ? `${c.poids} Kg` : (data.poids ? `${data.poids} Kg` : 'Forfait Objet'),
        rawMontantTotal: Number(data.montant_total || data.prix_total || 0),
        rawDevise: v.devise || 'XOF',
        montantTotal: `${data.montant_total || data.prix_total || 0} ${v.devise || 'XOF'}`,
        modePaiement: data.mode_paiement_souhaite || data.mode_paiement || 'Au dépôt',
        
        colisType: c.type || data.type_colis || 'Marchandise',
        colisDescription: c.description || data.description || 'Aucune description',
        colisValeur: c.valeur_estimee ? `${c.valeur_estimee.toLocaleString()} ${v.devise || 'XOF'}` : 'Non renseignée',
        colisEstFragile: Boolean(c.est_fragile),
        colisPhoto: c.photo || null,
        
        destinataireNom: `${c.destinataire_prenom || ''} ${c.destinataire_nom || ''}`.trim() || 'Non renseigné',
        destinatairePhone: c.destinataire_numero || 'Non renseigné',
        destinataireAdresse: c.destinataire_adresse || 'Non renseignée',
        
        transporteurNom: transporteurName,
        transporteurPhone: vUser.telephone || 'Non renseigné',
        
        adresseDepot: v.adresse_depot || null,
        adresseRetrait: v.adresse_recuperation || null
      }

      if (vId) {
        await loadVoyageurReviews(vId)
      }

      setHeaderRoute({
        routeFrom: reservation.value.villeDepart,
        countryFrom: reservation.value.paysDepart,
        routeTo: reservation.value.villeDestination,
        countryTo: reservation.value.paysDestination
      })

      // Build tracking timeline from suivis or fallback steps
      if (c.suivis && Array.isArray(c.suivis) && c.suivis.length > 0) {
        trackingSteps.value = c.suivis.map(s => ({
          id: s.id,
          title: s.statut === 'demande_envoyee' ? 'Demande envoyée' : (s.statut === 'acceptee' ? 'Demande acceptée' : s.statut),
          subtitle: s.commentaire || 'Mise à jour du statut',
          time: s.date_changement ? formatVoyageDate(s.date_changement) : 'Récent',
          status: 'completed'
        }))
      } else {
        const isAcceptee = ['acceptee', 'en_cours', 'livre', 'livree'].includes(data.statut)
        const isLivre = ['livre', 'livree'].includes(data.statut)
        trackingSteps.value = [
          {
            id: 1,
            title: 'Demande effectuée',
            subtitle: 'Votre demande de réservation a été transmise au transporteur',
            time: formatVoyageDate(data.created_at),
            status: 'completed'
          },
          {
            id: 2,
            title: 'Validation par le transporteur',
            subtitle: isAcceptee ? 'Réservation acceptée par le transporteur GP' : 'En attente de confirmation',
            time: isAcceptee ? 'Confirmé' : 'En attente',
            status: isAcceptee ? 'completed' : 'upcoming'
          },
          {
            id: 3,
            title: 'Acheminement & Livraison',
            subtitle: `Livraison vers ${reservation.value.villeDestination}`,
            time: isLivre ? 'Livré' : 'À venir',
            status: isLivre ? 'completed' : 'upcoming'
          }
        ]
      }
    } else {
      errorMsg.value = 'Réservation non trouvée.'
    }
  } catch (err) {
    errorMsg.value = err?.message || 'Erreur lors du chargement des détails du colis.'
  } finally {
    isLoading.value = false
  }
}

onMounted(loadReservationData)

const handleCancel = async () => {
  const result = await Swal.fire({
    title: 'Annuler la réservation ?',
    text: 'Voulez-vous vraiment annuler votre réservation ?',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#B50302',
    cancelButtonColor: '#6B7280',
    confirmButtonText: 'Oui, annuler',
    cancelButtonText: 'Non, conserver'
  })

  if (!result.isConfirmed) return

  try {
    await annulerReservation(reservationId)
    Swal.fire({
      toast: true,
      position: 'top-end',
      icon: 'success',
      title: 'Réservation annulée.',
      showConfirmButton: false,
      timer: 3000
    })
    await loadReservationData()
  } catch (err) {
    Swal.fire({
      icon: 'error',
      title: 'Erreur',
      text: err?.message || err?.data?.message || 'Impossible d\'annuler la réservation.'
    })
  }
}

const handleRecordPayment = async () => {
  if (!reservation.value) return
  isSubmittingPayment.value = true
  try {
    const payload = {
      mode_paiement: selectedPaymentMode.value,
      montant: customMontant.value ? Number(customMontant.value) : undefined,
      statut: 'reussi',
      reference: paymentRef.value.trim() || undefined
    }
    await postReservationPaiement(reservation.value.id, payload)
    Swal.fire({
      toast: true,
      position: 'top-end',
      icon: 'success',
      title: 'Paiement enregistré avec succès !',
      showConfirmButton: false,
      timer: 3000
    })
    paymentRef.value = ''
    customMontant.value = ''
    await loadReservationData()
  } catch (err) {
    Swal.fire({
      icon: 'error',
      title: 'Erreur',
      text: err?.message || err?.data?.message || 'Impossible d\'enregistrer le paiement.'
    })
  } finally {
    isSubmittingPayment.value = false
  }
}

const goToChat = () => {
  if (reservation.value && reservation.value.id) {
    const masked = encodeId(reservation.value.id)
    router.push(`/client/messages/${masked}`)
  } else {
    router.push('/client/messages')
  }
}

const submitRating = async () => {
  if (!reservation.value) return
  if (Number(ratingNote.value) <= 0) {
    Swal.fire({
      icon: 'warning',
      title: 'Note requise',
      text: 'Veuillez sélectionner au moins 1 étoile pour votre évaluation.',
      confirmButtonColor: '#053754'
    })
    return
  }

  isSubmittingRating.value = true
  try {
    await postReservationEvaluation(reservation.value.id, {
      note: Number(ratingNote.value),
      commentaire: ratingComment.value.trim() || undefined
    })
    Swal.fire({
      toast: true,
      position: 'top-end',
      icon: 'success',
      title: 'Évaluation enregistrée avec succès !',
      showConfirmButton: false,
      timer: 3000
    })
    hasSubmittedRating.value = true
    ratingComment.value = ''
    if (reservation.value.voyageurId) {
      await loadVoyageurReviews(reservation.value.voyageurId)
    }
  } catch (err) {
    Swal.fire({
      icon: 'error',
      title: 'Erreur',
      text: err?.message || err?.data?.message || 'Impossible d\'enregistrer l\'évaluation.'
    })
  } finally {
    isSubmittingRating.value = false
  }
}

const openMap = (location) => {
  if (!location) return
  window.open(`https://maps.google.com/?q=${encodeURIComponent(location)}`, '_blank')
}
const allSteps = computed(() => {
  if (!reservation.value) return []

  const currentStatut = reservation.value.statut || 'en_attente'
  const suivis = reservation.value.suivis || []

  if (suivis.length > 0) {
    return suivis.map((s, idx) => ({
      id: s.id || idx + 1,
      title: `${idx + 1}. ${getColisStatutLabel(s.statut)}`,
      subtitle: s.commentaire || 'Mise à jour du statut par le transporteur',
      time: formatDateTime(s.date_changement || s.created_at),
      isCompleted: true
    }))
  }

  const statusLevels = {
    'demande_envoyee': 1,
    'en_attente': 1,
    'acceptee': 2,
    'colis_depose': 3,
    'depose': 3,
    'colis_pris_en_charge': 4,
    'en_transit': 4,
    'en_cours': 4,
    'arrive': 5,
    'livre': 6,
    'livree': 6
  }

  const currentLevel = statusLevels[currentStatut] || 1

  return [
    {
      id: 1,
      title: '1. Demande effectuée',
      subtitle: 'Votre demande de réservation a été transmise au transporteur GP',
      time: formatDateTime(reservation.value.dateDepart),
      isCompleted: currentLevel >= 1
    },
    {
      id: 2,
      title: '2. Confirmation par le transporteur',
      subtitle: currentLevel >= 2 ? 'Réservation acceptée et validée par le transporteur' : 'En attente de confirmation du transporteur',
      time: currentLevel >= 2 ? 'Validé' : 'À venir',
      isCompleted: currentLevel >= 2
    },
    {
      id: 3,
      title: '3. Dépôt du colis au point relais',
      subtitle: currentLevel >= 3 ? 'Colis réceptionné au point de dépôt' : 'Remise du colis à l\'adresse de dépôt',
      time: currentLevel >= 3 ? 'Réceptionné' : 'À venir',
      isCompleted: currentLevel >= 3
    },
    {
      id: 4,
      title: '4. Transport & Vol en cours',
      subtitle: currentLevel >= 4 ? 'Colis en cours d\'acheminement aérien' : 'Vol et acheminement vers la destination',
      time: currentLevel >= 4 ? 'En transit' : 'À venir',
      isCompleted: currentLevel >= 4
    },
    {
      id: 5,
      title: '5. Arrivée au point de retrait',
      subtitle: currentLevel >= 5 ? `Disponible au guichet à ${reservation.value.villeDestination}` : `Point de retrait à ${reservation.value.villeDestination}`,
      time: currentLevel >= 5 ? 'Prêt pour retrait' : 'À venir',
      isCompleted: currentLevel >= 5
    },
    {
      id: 6,
      title: '6. Livré au destinataire',
      subtitle: currentLevel >= 6 ? `Remis en mains propres à ${reservation.value.destinataireNom}` : `Remise finale à ${reservation.value.destinataireNom}`,
      time: currentLevel >= 6 ? 'Livré' : 'À venir',
      isCompleted: currentLevel >= 6
    }
  ]
})
</script>

<template>
  <div class="space-y-5 pb-16">
    <!-- Loading State -->
    <div v-if="isLoading" class="bg-white dark:bg-slate-900 rounded-3xl p-12 text-center border border-gray-100 dark:border-slate-800 shadow-sm space-y-4">
      <div class="w-10 h-10 border-4 border-[#053754] dark:border-sky-400 border-t-transparent rounded-full animate-spin mx-auto"></div>
      <p class="text-sm font-bold text-gray-600 dark:text-slate-300">Chargement du suivi de colis...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="errorMsg" class="bg-red-50 dark:bg-red-950/80 border border-red-200 dark:border-red-900 rounded-3xl p-8 text-center space-y-3">
      <p class="text-sm font-bold text-red-800 dark:text-red-300">{{ errorMsg }}</p>
      <button @click="router.push('/client/colis')" class="px-4 py-2 bg-red-600 text-white font-bold text-xs rounded-xl cursor-pointer">Retour aux colis</button>
    </div>

    <template v-else-if="reservation">
      <!-- Top Summary Container (Dark Blue Card) -->
      <div class="bg-[#053754] dark:bg-slate-900 border border-transparent dark:border-slate-800 text-white rounded-2xl p-5 shadow-lg space-y-4 relative overflow-hidden">
        <!-- Weight & Code Badge Top Left -->
        <div class="flex items-center justify-between">
          <span class="inline-flex items-center gap-1.5 bg-white/10 backdrop-blur-md px-3.5 py-1 rounded-full text-xs font-extrabold text-sky-100 border border-white/10">
            <span>📦</span>
            <span>Colis : {{ reservation.poids }}</span>
          </span>

          <span class="text-xs font-mono font-bold bg-white/10 backdrop-blur-md px-3 py-1 rounded-full border border-white/10">
            {{ reservation.trackingCode }}
          </span>
        </div>

        <!-- Route Graphics & Flags -->
        <div class="flex items-center justify-between px-2 pt-1">
          <!-- Departure -->
          <div class="space-y-0.5">
            <CountryFlag :city="reservation.villeDepart" :country="reservation.paysDepart" size="w-7 h-5" />
            <h3 class="text-lg font-extrabold leading-tight">{{ reservation.villeDepart }}</h3>
            <p class="text-xs text-sky-200">{{ reservation.paysDepart }}</p>
          </div>

          <!-- Flight Path Graphic -->
          <div class="flex-1 max-w-[160px] sm:max-w-[220px] px-2 flex items-center justify-center">
            <div class="w-full flex items-center gap-1">
              <span class="w-2.5 h-2.5 rounded-full bg-red-500 shrink-0"></span>
              <div class="flex-1 border-t-2 border-dashed border-red-400"></div>
              <div class="bg-[#053754] dark:bg-slate-900 px-1 transform -rotate-12">
                <span class="text-red-500 text-sm font-bold">✈</span>
              </div>
              <div class="flex-1 border-t-2 border-dashed border-amber-400"></div>
              <span class="w-2.5 h-2.5 rounded-full bg-amber-400 shrink-0"></span>
            </div>
          </div>

          <!-- Destination -->
          <div class="space-y-0.5 text-right flex flex-col items-end">
            <CountryFlag :city="reservation.villeDestination" :country="reservation.paysDestination" size="w-7 h-5" />
            <h3 class="text-lg font-extrabold leading-tight">{{ reservation.villeDestination }}</h3>
            <p class="text-xs text-sky-200">{{ reservation.paysDestination }}</p>
          </div>
        </div>

        <!-- Recipient Bottom Row -->
        <div class="border-t border-sky-800/80 pt-3 flex items-center justify-between text-xs sm:text-sm font-semibold">
          <span class="text-sky-200">Destinataire : <strong class="text-white font-extrabold">{{ reservation.destinataireNom }}</strong></span>
        </div>
      </div>

      <!-- Transporteur Card -->
      <div class="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-gray-200 dark:border-slate-800 shadow-2xs space-y-2">
        <span class="text-xs text-gray-400 dark:text-slate-400 font-medium block">Transporteur GP</span>
        
        <div class="flex items-center justify-between gap-3">
          <!-- Transporter Info -->
          <div class="flex items-center gap-3">
            <div class="w-12 h-12 rounded-full bg-[#053754] dark:bg-sky-600 text-white flex items-center justify-center font-extrabold text-xs shrink-0 shadow-xs uppercase">
              GP
            </div>

            <div class="space-y-0.5">
              <h3 class="text-sm font-extrabold text-[#053754] dark:text-sky-300">{{ reservation.transporteurNom }}</h3>
              <div class="flex items-center gap-2 text-xs">
                <span class="flex items-center gap-1 font-bold text-amber-500">
                  ⭐ {{ voyageurReviews.moyenneNotes }}
                </span>
                <span class="text-gray-400 dark:text-slate-400 font-medium text-[11px]">
                  ({{ voyageurReviews.totalEvaluations }} {{ voyageurReviews.totalEvaluations > 1 ? 'avis' : 'avis' }})
                </span>
              </div>
            </div>
          </div>

          <!-- Discuter Button -->
          <button
            @click="goToChat"
            type="button"
            class="bg-[#B50302] dark:bg-red-700 hover:bg-[#8B0000] dark:hover:bg-red-600 text-white font-extrabold text-xs px-4 py-2.5 rounded-xl shadow-xs transition-colors cursor-pointer flex items-center gap-1.5 uppercase tracking-wider shrink-0"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <span>DISCUTER</span>
          </button>
        </div>
      </div>

      <!-- Information de paiement pour le client -->
      <div v-if="['acceptee', 'en_cours', 'livre', 'livree'].includes(reservation.statut)" class="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-gray-200 dark:border-slate-800 shadow-2xs space-y-3">
        <div class="flex items-center gap-2 border-b border-gray-100 dark:border-slate-800 pb-2.5">
          <span class="text-lg">💳</span>
          <h3 class="text-sm font-extrabold text-[#053754] dark:text-sky-300">Mode & Statut de paiement</h3>
        </div>

        <div class="bg-slate-50 dark:bg-slate-800/80 p-4 rounded-xl border border-slate-100 dark:border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
          <div>
            <span class="text-gray-500 dark:text-slate-400 font-medium block">Mode de paiement choisi :</span>
            <span class="font-extrabold text-[#053754] dark:text-sky-300 text-sm uppercase tracking-wide">
              {{ reservation.modePaiement.toLowerCase().includes('wave') ? '🌊 Wave (En ligne)' : (reservation.modePaiement.toLowerCase().includes('livraison') ? '📦 À la livraison (Espèces)' : '💵 Espèces au dépôt') }}
            </span>
          </div>

          <div class="text-left sm:text-right">
            <span class="text-gray-500 dark:text-slate-400 font-medium block">Montant à régler :</span>
            <span class="font-black text-[#B50302] dark:text-red-400 text-sm sm:text-base">{{ formattedMontantTotal }}</span>
          </div>
        </div>

        <p v-if="!reservation.modePaiement.toLowerCase().includes('wave')" class="text-[11px] text-gray-500 dark:text-amber-300 italic bg-amber-50/60 dark:bg-amber-950/80 p-3 rounded-xl border border-amber-200/50 dark:border-amber-800">
          💡 Le paiement en espèces s'effectue directement auprès du transporteur GP lors de la remise ou du retrait du colis.
        </p>
      </div>

      <!-- Poster une évaluation pour cette réservation -->
      <div class="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-gray-200 dark:border-slate-800 shadow-2xs space-y-4">
        <div class="flex items-center gap-2 border-b border-gray-100 dark:border-slate-800 pb-3">
          <span class="text-lg">⭐</span>
          <h3 class="text-sm font-extrabold text-[#053754] dark:text-sky-300">Évaluer ce transporteur GP</h3>
        </div>

        <div v-if="hasSubmittedRating" class="bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 p-4 rounded-xl text-xs font-bold text-center space-y-1">
          <span class="text-base">🎉</span>
          <p>Merci ! Votre évaluation a été enregistrée avec succès.</p>
        </div>

        <form v-else @submit.prevent="submitRating" class="space-y-3">
          <div>
            <label class="block text-xs font-bold text-gray-600 dark:text-slate-300 mb-1.5">Votre note :</label>
            <div class="flex items-center gap-1">
              <button
                v-for="star in 5"
                :key="star"
                type="button"
                @click="ratingNote = star"
                class="text-2xl transition-transform cursor-pointer hover:scale-110"
              >
                <span :class="star <= ratingNote ? 'text-amber-400' : 'text-gray-300 dark:text-slate-600'">★</span>
              </button>
              <span class="text-xs font-bold text-amber-600 dark:text-amber-400 ml-2">({{ ratingNote }} / 5)</span>
            </div>
          </div>

          <div>
            <label class="block text-xs font-bold text-gray-600 dark:text-slate-300 mb-1">Votre commentaire :</label>
            <textarea
              v-model="ratingComment"
              rows="3"
              placeholder="ex: Voyageur très ponctuel et professionnel, le colis est arrivé intact !"
              class="w-full bg-[#FAF7F2] dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl p-3 text-xs font-medium text-gray-800 dark:text-slate-100 outline-none focus:border-[#074C72] dark:focus:border-sky-400 placeholder-gray-400 dark:placeholder-slate-500"
            ></textarea>
          </div>

          <button
            type="submit"
            :disabled="isSubmittingRating"
            class="w-full bg-[#053754] dark:bg-sky-600 hover:bg-[#074C72] dark:hover:bg-sky-500 text-white font-extrabold text-xs py-3 rounded-xl shadow-md transition-all cursor-pointer flex items-center justify-center gap-2 uppercase tracking-wider disabled:opacity-50"
          >
            <span v-if="isSubmittingRating" class="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
            <span>ENREGISTRER L'ÉVALUATION</span>
          </button>
        </form>
      </div>

      <!-- Consulter les évaluations existantes du voyageur -->
      <div v-if="voyageurReviews.data && voyageurReviews.data.length > 0" class="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-gray-200 dark:border-slate-800 shadow-2xs space-y-3">
        <div class="flex items-center justify-between border-b border-gray-100 dark:border-slate-800 pb-3">
          <h3 class="text-sm font-extrabold text-[#053754] dark:text-sky-300 flex items-center gap-2">
            <span>Avis des clients sur {{ reservation.transporteurNom }}</span>
            <span class="bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 text-xs px-2.5 py-0.5 rounded-full font-bold">⭐ {{ voyageurReviews.moyenneNotes }}</span>
          </h3>
          <span class="text-xs text-gray-400 dark:text-slate-400 font-medium">({{ voyageurReviews.totalEvaluations }} avis)</span>
        </div>

        <div class="space-y-3">
          <div
            v-for="rev in paginatedVoyageurReviews"
            :key="rev.id"
            class="bg-gray-50 dark:bg-slate-800/80 p-3.5 rounded-xl border border-gray-100 dark:border-slate-700 space-y-1.5 text-xs"
          >
            <div class="flex items-center justify-between">
              <span class="font-extrabold text-[#053754] dark:text-sky-300">{{ rev.evaluateur ? `${rev.evaluateur.prenom || ''} ${rev.evaluateur.nom || ''}` : 'Client Rahma' }}</span>
              <span class="text-amber-500 font-bold">{{ rev.note > 0 ? '⭐'.repeat(rev.note) : 'Non noté' }}</span>
            </div>
            <p v-if="rev.commentaire" class="text-gray-600 dark:text-slate-300 italic">"{{ rev.commentaire }}"</p>
            <span class="text-[10px] text-gray-400 dark:text-slate-400 block text-right">{{ formatVoyageDate(rev.created_at) }}</span>
          </div>
        </div>

        <!-- Pagination Controls (2 per page) -->
        <div v-if="totalReviewPages > 1" class="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-slate-800 text-xs">
          <button
            @click="currentReviewPage = Math.max(1, currentReviewPage - 1)"
            :disabled="currentReviewPage === 1"
            class="px-3 py-1 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg text-gray-700 dark:text-slate-200 font-bold disabled:opacity-40 cursor-pointer shadow-2xs"
          >
            ← Précédent
          </button>
          <span class="text-gray-500 dark:text-slate-400 font-semibold">Page {{ currentReviewPage }} / {{ totalReviewPages }}</span>
          <button
            @click="currentReviewPage = Math.min(totalReviewPages, currentReviewPage + 1)"
            :disabled="currentReviewPage === totalReviewPages"
            class="px-3 py-1 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg text-gray-700 dark:text-slate-200 font-bold disabled:opacity-40 cursor-pointer shadow-2xs"
          >
            Suivant →
          </button>
        </div>
      </div>

      <!-- Historique et progression Section -->
      <div class="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-gray-200 dark:border-slate-800 shadow-2xs space-y-4">
        <div class="flex items-center gap-2 border-b border-gray-100 dark:border-slate-800 pb-3">
          <svg class="w-5 h-5 text-[#053754] dark:text-sky-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h3 class="text-sm sm:text-base font-extrabold text-[#053754] dark:text-sky-300">Historique et progression de la livraison</h3>
        </div>

        <!-- Stepper Vertical Timeline (All steps displayed with blur on future steps) -->
        <div class="relative pl-3 space-y-6 before:absolute before:left-5 before:top-3 before:bottom-3 before:w-0.5 before:bg-gray-200 dark:before:bg-slate-700">
          <div
            v-for="step in allSteps"
            :key="step.id"
            class="relative flex items-start justify-between gap-4 transition-all"
            :class="step.isCompleted ? 'opacity-100' : 'opacity-40 filter blur-[0.4px] grayscale'"
          >
            <!-- Timeline Indicator Icon -->
            <div class="relative z-10 flex items-center justify-center shrink-0">
              <div
                v-if="step.isCompleted"
                class="w-5 h-5 rounded-full bg-[#053754] dark:bg-sky-600 text-white flex items-center justify-center text-[10px] font-bold ring-4 ring-sky-50 dark:ring-slate-800 shadow-xs"
              >
                ✓
              </div>
              <div
                v-else
                class="w-5 h-5 rounded-full bg-gray-100 dark:bg-slate-800 border-2 border-gray-300 dark:border-slate-700 flex items-center justify-center"
              >
                <div class="w-1.5 h-1.5 rounded-full bg-gray-400 dark:bg-slate-500"></div>
              </div>
            </div>

            <!-- Step Content -->
            <div class="flex-1 min-w-0 -mt-0.5">
              <h4
                class="text-xs sm:text-sm font-extrabold leading-tight"
                :class="step.isCompleted ? 'text-[#053754] dark:text-sky-300' : 'text-gray-500 dark:text-slate-400'"
              >
                {{ step.title }}
              </h4>
              <p class="text-[11px] text-gray-400 dark:text-slate-400 font-medium mt-0.5">
                {{ step.subtitle }}
              </p>
            </div>

            <!-- Step Time -->
            <span
              class="text-[11px] font-medium shrink-0"
              :class="step.isCompleted ? 'text-gray-600 dark:text-slate-300 font-semibold' : 'text-gray-400 dark:text-slate-500 italic'"
            >
              {{ step.time }}
            </span>
          </div>
        </div>
      </div>

      <!-- Point de Dépôt Card ("Où déposer mon colis ?") -->
      <div v-if="reservation.adresseDepot" class="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-gray-200 dark:border-slate-800 shadow-2xs space-y-3">
        <span class="text-xs text-gray-400 dark:text-slate-400 font-medium block">Où déposer mon colis ?</span>

        <div class="flex items-start gap-2.5">
          <span class="text-red-600 dark:text-red-400 text-lg">📍</span>
          <div class="space-y-0.5">
            <h4 class="text-xs sm:text-sm font-extrabold text-[#053754] dark:text-sky-300">{{ reservation.adresseDepot.adresse }} ({{ reservation.adresseDepot.ville }}, {{ reservation.adresseDepot.pays }})</h4>
            <p v-if="reservation.adresseDepot.horaire_ouverture" class="text-xs text-gray-500 dark:text-slate-400">
              Horaires : <span class="font-extrabold text-[#053754] dark:text-sky-300">{{ reservation.adresseDepot.horaire_ouverture }}</span>
            </p>
          </div>
        </div>

        <button
          @click="openMap(`${reservation.adresseDepot.adresse}, ${reservation.adresseDepot.ville}`)"
          type="button"
          class="w-full bg-red-50 dark:bg-red-950/80 hover:bg-red-100 dark:hover:bg-red-900 text-[#B50302] dark:text-red-300 border border-red-100 dark:border-red-900 font-extrabold text-xs py-3 rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-2"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 20l-5-4V4l5 4m0 0l6-4 6 4v12l-6-4m-6 4V8m6 12V8" />
          </svg>
          <span>Voir l'itinéraire</span>
        </button>
      </div>

      <!-- Point de Retrait Card ("Où retirer le colis à destination ?") -->
      <div v-if="reservation.adresseRetrait" class="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-gray-200 dark:border-slate-800 shadow-2xs space-y-3">
        <span class="text-xs text-gray-400 dark:text-slate-400 font-medium block">Où retirer le colis à destination ?</span>

        <div class="flex items-start gap-2.5">
          <span class="text-red-600 dark:text-red-400 text-lg">📍</span>
          <div class="space-y-0.5">
            <h4 class="text-xs sm:text-sm font-extrabold text-[#053754] dark:text-sky-300">{{ reservation.adresseRetrait.adresse }} ({{ reservation.adresseRetrait.ville }}, {{ reservation.adresseRetrait.pays }})</h4>
            <p v-if="reservation.adresseRetrait.horaire_ouverture" class="text-xs text-gray-500 dark:text-slate-400">
              Horaires : <span class="font-extrabold text-[#053754] dark:text-sky-300">{{ reservation.adresseRetrait.horaire_ouverture }}</span>
            </p>
          </div>
        </div>

        <button
          @click="openMap(`${reservation.adresseRetrait.adresse}, ${reservation.adresseRetrait.ville}`)"
          type="button"
          class="w-full bg-red-50 dark:bg-red-950/80 hover:bg-red-100 dark:hover:bg-red-900 text-[#B50302] dark:text-red-300 border border-red-100 dark:border-red-900 font-extrabold text-xs py-3 rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-2"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 20l-5-4V4l5 4m0 0l6-4 6 4v12l-6-4m-6 4V8m6 12V8" />
          </svg>
          <span>Voir l'itinéraire</span>
        </button>
      </div>

      <!-- Cancel Action Button if pending -->
      <div v-if="reservation.statut === 'en_attente'" class="pt-2">
        <button
          @click="handleCancel"
          type="button"
          class="w-full bg-white dark:bg-slate-900 border border-red-200 dark:border-red-900 hover:bg-red-50 dark:hover:bg-red-950/80 text-[#B50302] dark:text-red-400 font-extrabold text-xs sm:text-sm py-3.5 rounded-xl transition-colors cursor-pointer shadow-xs"
        >
          🚫 Annuler cette réservation
        </button>
      </div>
    </template>
  </div>
</template>
