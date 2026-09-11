<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import Swal from 'sweetalert2'
import BookingProgressBar from '@/components/client/BookingProgressBar.vue'
import CountryFlag from '@/components/common/CountryFlag.vue'
import { createReservation } from '@/services/reservationService'
import { formatVoyageDate, isElectronicType } from '@/utils/flagHelper'

const route = useRoute()
const router = useRouter()

const selectedPayment = ref('wave')
const showSuccessModal = ref(false)
const isSubmitting = ref(false)

const draft = ref(null)

onMounted(() => {
  const savedDraft = sessionStorage.getItem('rahma_booking_draft')
  if (savedDraft) {
    try {
      draft.value = JSON.parse(savedDraft)
    } catch (e) {}
  }
})

const voyage = computed(() => draft.value?.voyage || null)
const villeDepart = computed(() => voyage.value?.ville_depart || voyage.value?.depart || 'Dakar')
const paysDepart = computed(() => voyage.value?.pays_depart || voyage.value?.paysDepart || 'Sénégal')

const villeDestination = computed(() => voyage.value?.ville_destination || voyage.value?.destination || 'Paris')
const paysDestination = computed(() => voyage.value?.pays_destination || voyage.value?.paysDest || 'France')

const dateDepart = computed(() => voyage.value?.date_depart || voyage.value?.date || '')
const weightKg = computed(() => draft.value?.colis?.poids || 3.5)

import { currentCurrency, formatPrice } from '@/utils/currencyState'

const isElectronic = computed(() => isElectronicType(draft.value?.colis?.type))
const unitPriceKg = computed(() => voyage.value?.prix_kg || 8500)
const unitPriceObjet = computed(() => voyage.value?.prix_objet || 15000)
const devise = computed(() => voyage.value?.devise || 'XOF')

const totalPrice = computed(() => {
  if (isElectronic.value) {
    return Math.round(unitPriceObjet.value)
  }
  return Math.round(weightKg.value * unitPriceKg.value)
})

const formattedUnitPriceKg = computed(() => formatPrice(unitPriceKg.value, devise.value))
const formattedUnitPriceObjet = computed(() => formatPrice(unitPriceObjet.value, devise.value))
const formattedTotalPrice = computed(() => formatPrice(totalPrice.value, devise.value))

const handleConfirmBooking = async () => {
  isSubmitting.value = true

  const activeVoyageId = draft.value?.voyage_id || sessionStorage.getItem('rahma_active_voyage_id') || route.query.voyage_id || '01a08d03-a84c-70a7-945c-053fe2e67b57'

  const payload = {
    voyage_id: activeVoyageId,
    mode_paiement_souhaite: selectedPayment.value,
    colis: {
      type: draft.value?.colis?.type || 'Vêtements',
      description: draft.value?.colis?.description || '',
      valeur_estimee: Number(draft.value?.colis?.valeur_estimee) || 0,
      poids: Number(draft.value?.colis?.poids) || 1,
      est_fragile: Boolean(draft.value?.colis?.est_fragile),
      destinataire_nom: draft.value?.colis?.destinataire_nom || '',
      destinataire_prenom: draft.value?.colis?.destinataire_prenom || '',
      destinataire_numero: draft.value?.colis?.destinataire_numero || '',
      destinataire_adresse: draft.value?.colis?.destinataire_adresse || '',
      photo: draft.value?.colis?.photo || 'https://example.com/photos/colis1.jpg'
    }
  }

  try {
    await createReservation(payload)
    showSuccessModal.value = true
    sessionStorage.removeItem('rahma_booking_draft')
    sessionStorage.removeItem('rahma_active_voyage_id')
  } catch (err) {
    Swal.fire({
      icon: 'error',
      title: 'Erreur lors de la réservation',
      text: err?.message || err?.data?.message || 'Une erreur est survenue lors de l\'enregistrement.',
      confirmButtonColor: '#B50302'
    })
  } finally {
    isSubmitting.value = false
  }
}

const goToChat = () => {
  router.push('/client/messages/1')
}

const goToHome = () => {
  router.push('/client')
}
</script>

<template>
  <div class="space-y-6 pb-16 max-w-3xl mx-auto font-sans">
    <!-- Progress Bar Step 4 -->
    <BookingProgressBar
      :step="4"
      :totalSteps="4"
      title="Paiement et Confirmation"
      subtitle="Finalisez votre demande de réservation"
    />

    <!-- Trip Summary Card (Dark Blue Container) -->
    <div class="bg-[#053754] text-white rounded-2xl p-5 shadow-lg space-y-5 relative overflow-hidden">
      <!-- Badge Top Right -->
      <div class="flex justify-end">
        <span class="inline-flex items-center gap-1.5 bg-white/10 backdrop-blur-md px-3 py-1 rounded-full text-xs font-semibold text-sky-100 border border-white/10">
          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          Voyageur GP Vérifié
        </span>
      </div>

      <!-- Route Header with Flags -->
      <div class="flex items-center justify-between px-2">
        <!-- Departure -->
        <div class="flex items-center gap-2.5">
          <CountryFlag :city="villeDepart" :country="paysDepart" size="w-7 h-5" />
          <div class="space-y-0.5">
            <h3 class="text-lg font-extrabold leading-tight">{{ villeDepart }}</h3>
            <p class="text-xs text-sky-200">{{ paysDepart }}</p>
          </div>
        </div>

        <!-- Flight Path Graphic -->
        <div class="flex-1 max-w-[160px] sm:max-w-[200px] px-2 flex items-center justify-center relative">
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
        <div class="flex items-center gap-2.5 text-right">
          <div class="space-y-0.5">
            <h3 class="text-lg font-extrabold leading-tight">{{ villeDestination }}</h3>
            <p class="text-xs text-sky-200">{{ paysDestination }}</p>
          </div>
          <CountryFlag :city="villeDestination" :country="paysDestination" size="w-7 h-5" />
        </div>
      </div>

      <div class="border-t border-sky-800/80 pt-4 grid grid-cols-2 gap-4 text-xs">
        <div>
          <span class="text-sky-300 block font-medium">Départ</span>
          <span class="font-extrabold text-sm sm:text-base text-white">{{ formatVoyageDate(dateDepart) }}</span>
        </div>
        <div class="text-right">
          <span class="text-sky-300 block font-medium">Poids du colis</span>
          <span class="font-extrabold text-sm sm:text-base text-white">{{ weightKg }} Kg</span>
        </div>
      </div>

      <div class="pt-2 flex items-center justify-between border-t border-sky-800/80 text-sm">
        <span class="text-sky-200 font-medium">Prix total du voyage</span>
        <span class="font-black text-base sm:text-lg text-white">{{ formattedTotalPrice }}</span>
      </div>
    </div>

    <!-- Mode de paiement Section -->
    <div class="space-y-4">
      <div>
        <h2 class="text-base sm:text-lg font-bold text-principal-dark">Choisissez votre mode de paiement</h2>
        <p class="text-xs text-gray-500">Sélectionnez la méthode qui vous convient pour régler les frais de livraison.</p>
      </div>

      <div class="space-y-3">
        <!-- Option 1: Wave -->
        <div
          @click="selectedPayment = 'wave'"
          class="bg-white rounded-2xl p-4 border transition-all cursor-pointer relative flex items-start gap-3.5"
          :class="selectedPayment === 'wave' ? 'border-[#B50302] ring-1 ring-[#B50302] shadow-sm' : 'border-gray-200 hover:border-gray-300'"
        >
          <!-- Icon Wave -->
          <div class="w-10 h-10 rounded-xl bg-sky-400 flex items-center justify-center text-white shrink-0 font-bold overflow-hidden shadow-2xs">
            <span class="text-xl">🐧</span>
          </div>

          <div class="flex-1 space-y-1.5">
            <div class="flex items-center justify-between">
              <h3 class="text-sm font-extrabold text-gray-900">Wave</h3>
              <!-- Radio dot -->
              <div class="w-5 h-5 rounded-full border-2 flex items-center justify-center"
                :class="selectedPayment === 'wave' ? 'border-[#B50302]' : 'border-gray-300'">
                <div v-if="selectedPayment === 'wave'" class="w-2.5 h-2.5 rounded-full bg-[#B50302]"></div>
              </div>
            </div>
            <p class="text-xs text-gray-500 leading-relaxed">
              Vous réglez les frais tout de suite pour valider et lancer votre envoi.
            </p>
            <div>
              <span class="inline-block bg-sky-50 text-sky-700 text-[11px] font-bold px-3 py-1 rounded-lg border border-sky-100">
                Paiement immédiat via Wave
              </span>
            </div>
          </div>
        </div>

        <!-- Option 2: Espèces -->
        <div
          @click="selectedPayment = 'espece_depot'"
          class="bg-white rounded-2xl p-4 border transition-all cursor-pointer relative flex items-start gap-3.5"
          :class="selectedPayment === 'espece_depot' ? 'border-[#B50302] ring-1 ring-[#B50302] shadow-sm' : 'border-gray-200 hover:border-gray-300'"
        >
          <!-- Icon Cash -->
          <div class="w-10 h-10 rounded-xl bg-amber-500 flex items-center justify-center text-white shrink-0 font-bold overflow-hidden shadow-2xs">
            <span class="text-xl">💵</span>
          </div>

          <div class="flex-1 space-y-1.5">
            <div class="flex items-center justify-between">
              <h3 class="text-sm font-extrabold text-gray-900">Paiement par espèces au dépôt</h3>
              <!-- Radio dot -->
              <div class="w-5 h-5 rounded-full border-2 flex items-center justify-center"
                :class="selectedPayment === 'espece_depot' ? 'border-[#B50302]' : 'border-gray-300'">
                <div v-if="selectedPayment === 'espece_depot'" class="w-2.5 h-2.5 rounded-full bg-[#B50302]"></div>
              </div>
            </div>
            <p class="text-xs text-gray-500 leading-relaxed">
              Réglez directement en espèces auprès du transporteur lors de la remise du colis au point de dépôt.
            </p>
            <div>
              <span class="inline-block bg-gray-100 text-gray-700 text-[11px] font-bold px-3 py-1 rounded-lg border border-gray-200">
                Paiement par espèces au dépôt
              </span>
            </div>
          </div>
        </div>

        <!-- Option 3: Paiement à la livraison -->
        <div
          @click="selectedPayment = 'livraison'"
          class="bg-white rounded-2xl p-4 border transition-all cursor-pointer relative flex items-start gap-3.5"
          :class="selectedPayment === 'livraison' ? 'border-[#B50302] ring-1 ring-[#B50302] shadow-sm' : 'border-gray-200 hover:border-gray-300'"
        >
          <!-- Icon Parcel -->
          <div class="w-10 h-10 rounded-xl bg-amber-100 border border-amber-200 flex items-center justify-center text-amber-700 shrink-0 font-bold overflow-hidden shadow-2xs">
            <span class="text-xl">📦</span>
          </div>

          <div class="flex-1 space-y-1.5">
            <div class="flex items-center justify-between">
              <h3 class="text-sm font-extrabold text-[#B50302]">Paiement à la livraison</h3>
              <!-- Radio dot -->
              <div class="w-5 h-5 rounded-full border-2 flex items-center justify-center"
                :class="selectedPayment === 'livraison' ? 'border-[#B50302]' : 'border-gray-300'">
                <div v-if="selectedPayment === 'livraison'" class="w-2.5 h-2.5 rounded-full bg-[#B50302]"></div>
              </div>
            </div>
            <p class="text-xs text-gray-500 leading-relaxed">
              C'est le destinataire qui règle les frais au moment où il reçoit le colis. Rien à payer de votre côté.
            </p>
            <div>
              <span class="inline-block bg-sky-50 text-sky-700 text-[11px] font-bold px-3 py-1 rounded-lg border border-sky-100">
                Payé par le destinataire
              </span>
            </div>
          </div>
        </div>
      </div>

    </div>

    <!-- Confirm Reservation CTA Button -->
    <button
      @click="handleConfirmBooking"
      :disabled="isSubmitting"
      type="button"
      class="w-full bg-[#B50302] hover:bg-[#8B0000] text-white font-extrabold text-sm py-4 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99] uppercase tracking-wider disabled:opacity-50 disabled:cursor-not-allowed"
    >
      <span v-if="isSubmitting" class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
      <span>{{ isSubmitting ? 'ENREGISTREMENT DE LA RÉSERVATION...' : 'CONFIRMER VOTRE RÉSERVATION' }}</span>
    </button>

    <!-- Confirmation Modal ("Réservation en attente") -->
    <Teleport to="body">
      <div v-if="showSuccessModal" class="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-4 animate-in fade-in duration-200">
        <div class="bg-white rounded-t-3xl sm:rounded-3xl p-6 sm:p-8 max-w-md w-full text-center space-y-5 shadow-2xl animate-in slide-in-from-bottom-6 sm:zoom-in-95 duration-200">
          
          <!-- Big Checkmark Circle -->
          <div class="w-16 h-16 rounded-full border-3 border-emerald-500 text-emerald-500 flex items-center justify-center mx-auto text-3xl font-extrabold shadow-2xs">
            ✓
          </div>

          <!-- Modal Title & Message -->
          <div class="space-y-2">
            <h3 class="text-xl font-bold text-[#053754]">Réservation effectuée avec succès</h3>
            <p class="text-xs sm:text-sm text-gray-500 leading-relaxed">
              Veuillez attendre que le transporteur accepte votre demande de réservation.
            </p>
          </div>

          <!-- Primary Button: DISCUTEZ AVEC LE TRANSPORTEUR -->
          <button
            @click="goToChat"
            type="button"
            class="w-full bg-[#B50302] hover:bg-[#8B0000] text-white font-extrabold text-xs sm:text-sm py-4 rounded-xl shadow-md transition-all uppercase tracking-wider cursor-pointer active:scale-[0.99]"
          >
            DISCUTEZ AVEC LE TRANSPORTEUR
          </button>

          <!-- Secondary Link: Retour à l'accueil -->
          <div>
            <button
              @click="goToHome"
              type="button"
              class="text-sm font-semibold text-gray-600 hover:text-[#053754] underline underline-offset-4 cursor-pointer transition-colors"
            >
              Retour à l'accueil
            </button>
          </div>

        </div>
      </div>
    </Teleport>

  </div>
</template>
