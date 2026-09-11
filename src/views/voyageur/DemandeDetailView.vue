<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import Swal from 'sweetalert2'
import { fetchReservation, accepterReservation, refuserReservation, annulerReservation, updateColisStatut } from '@/services/reservationService'
import { postReservationPaiement } from '@/services/paiementService'
import { getCountryFlag, formatVoyageDate } from '@/utils/flagHelper'
import CountryFlag from '@/components/common/CountryFlag.vue'
import { decodeId, encodeId } from '@/utils/idMasker'
import { setHeaderRoute } from '@/utils/headerState'
import { currentCurrency, formatPrice } from '@/utils/currencyState'

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

const formatPhotoUrl = (url) => {
  if (!url) return null
  if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:')) {
    return url
  }
  const cleanUrl = url.replace(/^\//, '')
  if (cleanUrl.startsWith('storage/')) {
    return `http://localhost:8000/${cleanUrl}`
  }
  return `http://localhost:8000/storage/${cleanUrl}`
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

      demande.value = {
        id: data.id,
        rawId: rawId,
        maskedId: route.params.id,
        code: data.numero || `RES-${data.id.slice(0, 8)}`,
        codeTracking: c.numero_suivi || data.code_tracking || 'TRK-EN-ATTENTE',
        statut: data.statut || 'en_attente',

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
        photo: formatPhotoUrl(c.photo),

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
    Swal.fire({
      icon: 'error',
      title: 'Erreur',
      text: err?.message || err?.data?.message || 'Impossible de valider le paiement.'
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
        class="inline-flex items-center gap-2 text-xs font-bold text-gray-600 bg-white border border-gray-200 px-3.5 py-2 rounded-xl hover:bg-gray-50 transition-colors shadow-2xs cursor-pointer"
      >
        <span>←</span>
        <span>Retour aux réservations</span>
      </button>

      <span
        v-if="demande"
        class="text-xs font-extrabold px-3.5 py-1 rounded-full uppercase tracking-wider border"
        :class="{
          'bg-amber-50 text-amber-800 border-amber-300': demande.statut === 'en_attente',
          'bg-emerald-50 text-emerald-800 border-emerald-300': demande.statut === 'acceptee',
          'bg-red-50 text-red-800 border-red-300': demande.statut === 'refusee',
          'bg-gray-100 text-gray-700 border-gray-300': demande.statut === 'annulee' || demande.statut === 'annule'
        }"
      >
        {{ demande.statut === 'en_attente' ? '⏳ En attente' : demande.statut === 'acceptee' ? '✓ Acceptée' : demande.statut === 'refusee' ? '✕ Refusée' : '🚫 Annulée' }}
      </span>
    </div>

    <!-- Loading State -->
    <div v-if="isLoading" class="bg-white rounded-3xl p-12 text-center border border-gray-100 shadow-sm space-y-4">
      <div class="w-10 h-10 border-4 border-[#053754] border-t-transparent rounded-full animate-spin mx-auto"></div>
      <p class="text-sm font-bold text-gray-600">Chargement des détails de la demande...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="errorMsg" class="bg-red-50 border border-red-200 rounded-3xl p-8 text-center space-y-3">
      <p class="text-sm font-bold text-red-800">{{ errorMsg }}</p>
      <button @click="goBackToVoyage" class="px-4 py-2 bg-red-600 text-white font-bold text-xs rounded-xl">Retour</button>
    </div>

    <template v-else-if="demande">
      <!-- Header Info Banner -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 sm:p-5 rounded-2xl border border-gray-200 shadow-2xs">
        <div class="space-y-0.5">
          <div class="flex items-center gap-2">
            <h1 class="text-lg sm:text-xl font-serif font-bold text-principal-dark">Détails de la demande</h1>
            <span class="font-extrabold text-[#074C72] text-xs bg-sky-50 px-2.5 py-0.5 rounded-full border border-sky-100 font-mono">
              {{ demande.code }}
            </span>
          </div>
          <p class="text-xs text-gray-500 flex items-center gap-1.5 mt-0.5">
            <span>Code de Suivi :</span>
            <strong class="font-mono text-gray-800 bg-gray-100 px-2 py-0.5 rounded">{{ demande.codeTracking }}</strong>
          </p>
        </div>

        <!-- Trajet Mini Badge -->
        <div class="bg-slate-50 border border-slate-200 px-3.5 py-1.5 rounded-xl flex items-center gap-2 text-xs font-bold text-gray-800">
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
      <div class="bg-white rounded-3xl p-5 sm:p-6 border border-gray-200 shadow-sm space-y-6">
        
        <!-- Client Identity Banner -->
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 pb-4">
          <div class="flex items-center gap-3">
            <div class="w-12 h-12 rounded-full bg-[#053754] text-white font-extrabold text-sm flex items-center justify-center shrink-0 shadow-xs">
              {{ demande.clientName.slice(0, 2).toUpperCase() }}
            </div>
            <div>
              <h3 class="text-base font-extrabold text-gray-900 leading-tight">{{ demande.clientName }}</h3>
              <span class="text-[10px] text-sky-700 font-extrabold bg-sky-50 px-2 py-0.5 rounded-full border border-sky-100 mt-1 inline-block">Client Rahma GP</span>
            </div>
          </div>

          <button
            @click="goToChat"
            type="button"
            class="w-full sm:w-auto bg-sky-50 text-[#074C72] border border-sky-200 hover:bg-sky-100 font-extrabold text-xs px-4 py-2.5 rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-1.5"
          >
            <span>💬</span> DISCUTER AVEC LE CLIENT
          </button>
        </div>

        <!-- Parcel Description & Image Card -->
        <div class="space-y-3">
          <h4 class="text-xs font-extrabold text-gray-400 uppercase tracking-wider">Détails du colis</h4>
          
          <div class="bg-gray-50 rounded-2xl p-4 border border-gray-200/80 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs sm:text-sm">
            <div class="space-y-2.5">
              <div>
                <span class="text-gray-400 font-medium block">Type de contenu :</span>
                <span class="font-extrabold text-[#053754] text-sm sm:text-base">{{ demande.parcelType }}</span>
              </div>
              <div>
                <span class="text-gray-400 font-medium block">Poids du colis :</span>
                <span class="font-extrabold text-[#B50302] text-sm">{{ demande.weight }}</span>
              </div>
              <div>
                <span class="text-gray-400 font-medium block">Valeur estimée du colis :</span>
                <span class="font-bold text-gray-800 text-sm">{{ formattedEstimatedValue }}</span>
              </div>
              <div>
                <span class="text-gray-400 font-medium block">Nature du colis :</span>
                <span class="font-bold text-xs px-2.5 py-0.5 rounded-md inline-block mt-0.5" :class="demande.isFragile ? 'bg-amber-100 text-amber-900 border border-amber-200' : 'bg-gray-200 text-gray-700'">
                  {{ demande.isFragile ? '⚠️ Colis Fragile' : 'Standard' }}
                </span>
              </div>
              <div>
                <span class="text-gray-400 font-medium block">Mode de paiement souhaité :</span>
                <span class="font-bold text-sky-800 uppercase tracking-wider">{{ demande.paymentMode }}</span>
              </div>
            </div>

            <!-- Description & Photo -->
            <div class="space-y-2">
              <div>
                <span class="text-gray-400 font-medium block">Description :</span>
                <p class="text-xs text-gray-800 font-semibold bg-white p-2.5 rounded-xl border border-gray-200 leading-relaxed mt-1">
                  {{ demande.description }}
                </p>
              </div>

              <div v-if="demande.photo" class="space-y-1">
                <span class="text-gray-400 font-medium block">Photo du colis :</span>
                <div class="w-full h-32 rounded-xl overflow-hidden border border-gray-300 bg-white">
                  <img :src="demande.photo" alt="Photo du colis" class="w-full h-full object-cover" />
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Recipient Information Card -->
        <div class="space-y-3 pt-2">
          <h4 class="text-xs font-extrabold text-gray-400 uppercase tracking-wider">Informations du Destinataire à l'arrivée</h4>

          <div class="bg-amber-50/70 border border-amber-200/80 rounded-2xl p-4 space-y-1.5 shadow-2xs">
            <div class="font-extrabold text-gray-900 text-sm sm:text-base">{{ demande.recipientName }}</div>
            <div class="text-xs text-gray-600 font-medium pt-1 border-t border-amber-200/60">
              📍 {{ demande.recipientAddress }}
            </div>
          </div>
        </div>

        <!-- Section Validation du Paiement en Espèces (Voyageur) -->
        <div v-if="demande.statut === 'acceptee'" class="space-y-3 pt-4 border-t border-gray-100">
          <div class="flex items-center gap-2">
            <span class="text-lg">💳</span>
            <h4 class="text-xs font-extrabold text-[#053754] uppercase tracking-wider">
              Validation du Paiement (Encaissement par le Voyageur)
            </h4>
          </div>

          <div class="bg-emerald-50/70 border border-emerald-200/80 rounded-2xl p-4 sm:p-5 space-y-3">
            <p class="text-xs text-emerald-900 font-medium">
              Si le client a choisi le paiement en espèces (au dépôt ou à la livraison), validez la réception du montant pour créditer vos revenus.
            </p>

            <div class="flex flex-col sm:flex-row items-center gap-3">
              <select
                v-model="selectedPaymentMode"
                class="w-full sm:w-auto px-3.5 py-2.5 bg-white border border-gray-300 rounded-xl text-xs font-bold outline-none focus:border-emerald-600"
              >
                <option value="espece_depot">💵 Espèce au dépôt</option>
                <option value="livraison">📦 À la livraison</option>
                <option value="wave">🌊 Wave (En ligne)</option>
              </select>

              <button
                @click="handleRecordPaiementVoyageur"
                :disabled="isSubmittingPaiement"
                type="button"
                class="w-full sm:w-auto bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold text-xs px-5 py-2.5 rounded-xl shadow-xs transition-all cursor-pointer flex items-center justify-center gap-2 uppercase tracking-wider disabled:opacity-50"
              >
                <span v-if="isSubmittingPaiement" class="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                <span>Valider le Paiement Reçu</span>
              </button>
            </div>
          </div>
        </div>

        <!-- Section Suivi & Mise à jour du Colis (pour les réservations acceptées) -->
        <div v-if="demande.statut === 'acceptee'" class="space-y-4 pt-4 border-t border-gray-100">
          <div class="flex items-center gap-2">
            <span class="text-lg">🚚</span>
            <h4 class="text-xs font-extrabold text-[#053754] uppercase tracking-wider">
              Mettre à jour le Statut du Colis (Suivi de Livraison)
            </h4>
          </div>

          <div class="bg-sky-50/70 border border-sky-200/80 rounded-2xl p-4 sm:p-5 space-y-4">
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label class="block text-xs font-bold text-[#074C72] mb-1">Nouveau statut du colis</label>
                <select
                  v-model="selectedColisStatut"
                  class="w-full px-3.5 py-2.5 bg-white border border-gray-300 rounded-xl text-xs font-bold outline-none focus:border-[#074C72] focus:ring-2 focus:ring-[#074C72]/20"
                >
                  <option v-for="opt in colisStatutOptions" :key="opt.value" :value="opt.value">
                    {{ opt.label }}
                  </option>
                </select>
              </div>

              <div>
                <label class="block text-xs font-bold text-[#074C72] mb-1">Commentaire (optionnel)</label>
                <input
                  v-model="colisCommentaire"
                  type="text"
                  placeholder="ex: Le colis est dans l'avion en direction de Paris..."
                  class="w-full px-3.5 py-2.5 bg-white border border-gray-300 rounded-xl text-xs font-medium outline-none focus:border-[#074C72] focus:ring-2 focus:ring-[#074C72]/20"
                />
              </div>
            </div>

            <div class="flex justify-end">
              <button
                @click="handleUpdateColisStatut"
                :disabled="isSubmittingColisStatut"
                type="button"
                class="w-full sm:w-auto bg-[#053754] hover:bg-[#074C72] text-white font-extrabold text-xs px-5 py-3 rounded-xl shadow-xs transition-all cursor-pointer flex items-center justify-center gap-2 uppercase tracking-wider disabled:opacity-50"
              >
                <span v-if="isSubmittingColisStatut" class="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                <span>METTRE À JOUR LE STATUT DU COLIS</span>
              </button>
            </div>

            <!-- Historique des suivis du colis -->
            <div v-if="demande.suivis && demande.suivis.length > 0" class="pt-3 border-t border-sky-200/60 space-y-2">
              <span class="text-[11px] font-extrabold text-[#074C72] block uppercase tracking-wider">
                Historique du suivi ({{ demande.suivis.length }})
              </span>
              <div class="space-y-2">
                <div
                  v-for="s in demande.suivis"
                  :key="s.id"
                  class="bg-white p-3 rounded-xl border border-sky-100 flex items-center justify-between text-xs"
                >
                  <div>
                    <span class="font-extrabold text-[#053754] block">{{ s.statut }}</span>
                    <span v-if="s.commentaire" class="text-gray-600 text-[11px] block italic mt-0.5">{{ s.commentaire }}</span>
                  </div>
                  <span class="text-[10px] text-gray-400 font-medium shrink-0 ml-2">
                    {{ formatVoyageDate(s.date_changement) }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Price & Action CTA Row -->
        <div class="border-t border-gray-100 pt-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span class="text-xs text-gray-400 font-medium block">Prix total du transport :</span>
            <span class="font-black text-[#053754] text-xl sm:text-2xl">{{ formattedPrice }}</span>
          </div>

          <div v-if="demande.statut === 'en_attente'" class="flex items-center gap-3">
            <button
              @click="refuseDemande"
              :disabled="isUpdatingStatus"
              type="button"
              class="flex-1 sm:flex-none px-5 py-3 rounded-xl bg-red-50 text-[#B50302] border border-red-200 font-extrabold text-xs hover:bg-red-100 transition-colors cursor-pointer"
            >
              REFUSER
            </button>

            <button
              @click="acceptDemande"
              :disabled="isUpdatingStatus"
              type="button"
              class="flex-1 sm:flex-none bg-[#053754] hover:bg-[#074C72] text-white font-extrabold text-xs sm:text-sm py-3.5 px-6 rounded-xl shadow-lg transition-all cursor-pointer uppercase tracking-wider active:scale-[0.99]"
            >
              ✓ ACCEPTER LA RÉSERVATION
            </button>
          </div>

          <div v-else-if="demande.statut === 'acceptee'">
            <span class="text-xs font-extrabold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3.5 py-1.5 rounded-xl flex items-center gap-1.5">
              ✓ Réservation acceptée
            </span>
          </div>
        </div>

      </div>
    </template>
  </div>
</template>
