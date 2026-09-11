<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import Swal from 'sweetalert2'
import { fetchReservation, annulerReservation } from '@/services/reservationService'
import { formatVoyageDate } from '@/utils/flagHelper'
import CountryFlag from '@/components/common/CountryFlag.vue'
import { decodeId } from '@/utils/idMasker'
import { setHeaderRoute } from '@/utils/headerState'

const route = useRoute()
const router = useRouter()
const reservationId = decodeId(route.params.id)

const isLoading = ref(true)
const errorMsg = ref('')
const reservation = ref(null)
const trackingSteps = ref([])

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

      reservation.value = {
        id: data.id,
        numero: data.numero || (c.numero_suivi ? `#${c.numero_suivi}` : `#RS-${data.id.slice(0, 8)}`),
        trackingCode: c.numero_suivi || data.code_tracking || 'TRK-EN-ATTENTE',
        statut: data.statut || 'en_attente',
        
        villeDepart: v.ville_depart || 'Départ',
        paysDepart: v.pays_depart || '',
        villeDestination: v.ville_destination || 'Destination',
        paysDestination: v.pays_destination || '',
        dateDepart: v.date_depart || data.created_at,
        
        poids: c.poids ? `${c.poids} Kg` : (data.poids ? `${data.poids} Kg` : 'Forfait Objet'),
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

const goToChat = () => {
  router.push('/client/messages/1')
}

const openMap = (location) => {
  if (!location) return
  window.open(`https://maps.google.com/?q=${encodeURIComponent(location)}`, '_blank')
}
const allSteps = computed(() => {
  if (!reservation.value) return []

  const currentStatut = reservation.value.statut || 'en_attente'

  const statusLevels = {
    'demande_envoyee': 1,
    'en_attente': 1,
    'acceptee': 2,
    'depose': 3,
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
      time: formatVoyageDate(reservation.value.dateDepart),
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
    <div v-if="isLoading" class="bg-white rounded-3xl p-12 text-center border border-gray-100 shadow-sm space-y-4">
      <div class="w-10 h-10 border-4 border-[#053754] border-t-transparent rounded-full animate-spin mx-auto"></div>
      <p class="text-sm font-bold text-gray-600">Chargement du suivi de colis...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="errorMsg" class="bg-red-50 border border-red-200 rounded-3xl p-8 text-center space-y-3">
      <p class="text-sm font-bold text-red-800">{{ errorMsg }}</p>
      <button @click="router.push('/client/colis')" class="px-4 py-2 bg-red-600 text-white font-bold text-xs rounded-xl cursor-pointer">Retour aux colis</button>
    </div>

    <template v-else-if="reservation">
      <!-- Top Summary Container (Dark Blue Card) -->
      <div class="bg-[#053754] text-white rounded-2xl p-5 shadow-lg space-y-4 relative overflow-hidden">
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
              <div class="bg-[#053754] px-1 transform -rotate-12">
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
          <span class="text-sky-100 font-mono font-bold">{{ reservation.destinatairePhone }}</span>
        </div>
      </div>

      <!-- Transporteur Card -->
      <div class="bg-white rounded-2xl p-4 border border-gray-200 shadow-2xs space-y-2">
        <span class="text-xs text-gray-400 font-medium block">Transporteur GP</span>
        
        <div class="flex items-center justify-between gap-3">
          <!-- Transporter Info -->
          <div class="flex items-center gap-3">
            <div class="w-12 h-12 rounded-full bg-[#053754] text-white flex items-center justify-center font-extrabold text-xs shrink-0 shadow-xs uppercase">
              GP
            </div>

            <div class="space-y-0.5">
              <h3 class="text-sm font-extrabold text-[#053754]">{{ reservation.transporteurNom }}</h3>
              <div class="flex items-center gap-2 text-xs">
                <span class="flex items-center gap-1 font-bold text-amber-500">
                  ⭐ 4.9
                </span>
                <span class="text-gray-400 font-mono font-medium">
                  {{ reservation.transporteurPhone }}
                </span>
              </div>
            </div>
          </div>

          <!-- Discuter Button -->
          <button
            @click="goToChat"
            type="button"
            class="bg-[#B50302] hover:bg-[#8B0000] text-white font-extrabold text-xs px-4 py-2.5 rounded-xl shadow-xs transition-colors cursor-pointer flex items-center gap-1.5 uppercase tracking-wider shrink-0"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            DISCUTEZ
          </button>
        </div>
      </div>

      <!-- Historique et progression Section -->
      <div class="bg-white rounded-2xl p-5 border border-gray-200 shadow-2xs space-y-4">
        <div class="flex items-center gap-2 border-b border-gray-100 pb-3">
          <svg class="w-5 h-5 text-[#053754]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h3 class="text-sm sm:text-base font-extrabold text-[#053754]">Historique et progression de la livraison</h3>
        </div>

        <!-- Stepper Vertical Timeline (All steps displayed with blur on future steps) -->
        <div class="relative pl-3 space-y-6 before:absolute before:left-5 before:top-3 before:bottom-3 before:w-0.5 before:bg-gray-200">
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
                class="w-5 h-5 rounded-full bg-[#053754] text-white flex items-center justify-center text-[10px] font-bold ring-4 ring-sky-50 shadow-xs"
              >
                ✓
              </div>
              <div
                v-else
                class="w-5 h-5 rounded-full bg-gray-100 border-2 border-gray-300 flex items-center justify-center"
              >
                <div class="w-1.5 h-1.5 rounded-full bg-gray-400"></div>
              </div>
            </div>

            <!-- Step Content -->
            <div class="flex-1 min-w-0 -mt-0.5">
              <h4
                class="text-xs sm:text-sm font-extrabold leading-tight"
                :class="step.isCompleted ? 'text-[#053754]' : 'text-gray-500'"
              >
                {{ step.title }}
              </h4>
              <p class="text-[11px] text-gray-400 font-medium mt-0.5">
                {{ step.subtitle }}
              </p>
            </div>

            <!-- Step Time -->
            <span
              class="text-[11px] font-medium shrink-0"
              :class="step.isCompleted ? 'text-gray-600 font-semibold' : 'text-gray-400 italic'"
            >
              {{ step.time }}
            </span>
          </div>
        </div>
      </div>

      <!-- Point de Dépôt Card ("Où déposer mon colis ?") -->
      <div v-if="reservation.adresseDepot" class="bg-white rounded-2xl p-4 border border-gray-200 shadow-2xs space-y-3">
        <span class="text-xs text-gray-400 font-medium block">Où déposer mon colis ?</span>

        <div class="flex items-start gap-2.5">
          <span class="text-red-600 text-lg">📍</span>
          <div class="space-y-0.5">
            <h4 class="text-xs sm:text-sm font-extrabold text-[#053754]">{{ reservation.adresseDepot.adresse }} ({{ reservation.adresseDepot.ville }}, {{ reservation.adresseDepot.pays }})</h4>
            <p v-if="reservation.adresseDepot.horaire_ouverture" class="text-xs text-gray-500">
              Horaires : <span class="font-extrabold text-[#053754]">{{ reservation.adresseDepot.horaire_ouverture }}</span>
            </p>
          </div>
        </div>

        <button
          @click="openMap(`${reservation.adresseDepot.adresse}, ${reservation.adresseDepot.ville}`)"
          type="button"
          class="w-full bg-red-50 hover:bg-red-100 text-[#B50302] border border-red-100 font-extrabold text-xs py-3 rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-2"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 20l-5-4V4l5 4m0 0l6-4 6 4v12l-6-4m-6 4V8m6 12V8" />
          </svg>
          <span>Voir l'itinéraire</span>
        </button>
      </div>

      <!-- Point de Retrait Card ("Où retirer le colis à destination ?") -->
      <div v-if="reservation.adresseRetrait" class="bg-white rounded-2xl p-4 border border-gray-200 shadow-2xs space-y-3">
        <span class="text-xs text-gray-400 font-medium block">Où retirer le colis à destination ?</span>

        <div class="flex items-start gap-2.5">
          <span class="text-red-600 text-lg">📍</span>
          <div class="space-y-0.5">
            <h4 class="text-xs sm:text-sm font-extrabold text-[#053754]">{{ reservation.adresseRetrait.adresse }} ({{ reservation.adresseRetrait.ville }}, {{ reservation.adresseRetrait.pays }})</h4>
            <p v-if="reservation.adresseRetrait.horaire_ouverture" class="text-xs text-gray-500">
              Horaires : <span class="font-extrabold text-[#053754]">{{ reservation.adresseRetrait.horaire_ouverture }}</span>
            </p>
          </div>
        </div>

        <button
          @click="openMap(`${reservation.adresseRetrait.adresse}, ${reservation.adresseRetrait.ville}`)"
          type="button"
          class="w-full bg-red-50 hover:bg-red-100 text-[#B50302] border border-red-100 font-extrabold text-xs py-3 rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-2"
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
          class="w-full bg-white border border-red-200 hover:bg-red-50 text-[#B50302] font-extrabold text-xs sm:text-sm py-3.5 rounded-xl transition-colors cursor-pointer shadow-xs"
        >
          🚫 Annuler cette réservation
        </button>
      </div>
    </template>
  </div>
</template>
