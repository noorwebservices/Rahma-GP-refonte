<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import BookingProgressBar from '@/components/client/BookingProgressBar.vue'
import { getCategoryIcon, isElectronicType } from '@/utils/flagHelper'

const route = useRoute()
const router = useRouter()

const voyageId = ref(sessionStorage.getItem('rahma_active_voyage_id') || route.query.voyage_id || '')
const draft = ref(null)

onMounted(() => {
  const savedDraft = sessionStorage.getItem('rahma_booking_draft')
  if (savedDraft) {
    try {
      draft.value = JSON.parse(savedDraft)
      if (draft.value?.voyage_id) voyageId.value = draft.value.voyage_id
    } catch (e) {}
  }
})

const colisType = computed(() => draft.value?.colis?.type || 'Vêtements')
const isElectronic = computed(() => isElectronicType(colisType.value))
const typeIcon = computed(() => getCategoryIcon(colisType.value))
const photoUrl = computed(() => draft.value?.colis?.photo || null)
const weightKg = computed(() => draft.value?.colis?.poids || 1)
const estimatedValue = computed(() => Number(draft.value?.colis?.valeur_estimee) || 0)
const estFragile = computed(() => draft.value?.colis?.est_fragile || false)

const unitPriceKg = computed(() => draft.value?.voyage?.prix_kg || 8500)
const unitPriceObjet = computed(() => draft.value?.voyage?.prix_objet || 15000)
const devise = computed(() => draft.value?.voyage?.devise || 'XOF')

const totalPrice = computed(() => {
  if (isElectronic.value) {
    return Math.round(unitPriceObjet.value)
  }
  return Math.round(weightKg.value * unitPriceKg.value)
})

const destinataireNom = computed(() => {
  const p = draft.value?.colis?.destinataire_prenom || ''
  const n = draft.value?.colis?.destinataire_nom || ''
  const full = `${p} ${n}`.trim()
  return full || 'Non renseigné'
})
const destinatairePhone = computed(() => draft.value?.colis?.destinataire_numero || 'Non renseigné')
const destinataireAdresse = computed(() => draft.value?.colis?.destinataire_adresse || 'Non renseignée')

const handlePayment = () => {
  if (voyageId.value) {
    sessionStorage.setItem('rahma_active_voyage_id', voyageId.value)
  }
  router.push('/client/booking/step-4')
}
</script>

<template>
  <div class="space-y-6 pb-12 max-w-3xl mx-auto font-sans">
    <!-- Progress Bar Step 3 -->
    <BookingProgressBar
      :step="3"
      :totalSteps="4"
      title="Récapitulatif de la réservation"
      subtitle="Vérifiez les détails avant le paiement"
    />

    <!-- Summary Content Card -->
    <div class="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200 shadow-sm space-y-5">
      
      <!-- Type de colis -->
      <div class="flex items-center justify-between">
        <span class="text-xs font-bold text-gray-500">Type de colis :</span>
        <div class="bg-gray-50 border border-gray-200 px-4 py-2 rounded-2xl flex items-center gap-2 font-bold text-xs text-principal-dark shadow-2xs">
          <span>{{ typeIcon }}</span>
          <span>{{ colisType }}</span>
        </div>
      </div>

      <!-- Photo du colis -->
      <div class="space-y-2">
        <span class="text-xs font-bold text-gray-500 block">Photo du colis :</span>
        <div class="w-full h-48 rounded-2xl overflow-hidden border border-gray-200 bg-gray-50 flex items-center justify-center relative">
          <img v-if="photoUrl && photoUrl.startsWith('data:')" :src="photoUrl" alt="Photo du colis" class="w-full h-full object-cover" />
          <div v-else class="text-center p-4">
            <span class="text-5xl">📦</span>
            <p class="text-xs text-gray-500 font-semibold mt-2">Photo du colis importée</p>
          </div>
        </div>
      </div>

      <!-- Detail rows -->
      <div class="space-y-3 pt-2 border-t border-gray-100 text-xs sm:text-sm">
        <div class="flex items-center justify-between">
          <span class="text-gray-500 font-medium">Description du contenu :</span>
          <span class="font-bold text-gray-800 text-right max-w-xs truncate">{{ draft?.colis?.description || "Quelques vêtements d'hiver" }}</span>
        </div>

        <div class="flex items-center justify-between">
          <span class="text-gray-500 font-medium">Valeur estimée du colis :</span>
          <span class="font-extrabold text-[#B50302] text-sm sm:text-base">{{ estimatedValue.toLocaleString() }} {{ devise }}</span>
        </div>

        <div class="flex items-center justify-between">
          <span class="text-gray-500 font-medium">Colis fragile :</span>
          <span :class="[estFragile ? 'text-amber-800 font-bold bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200' : 'text-gray-700 font-semibold']">
            {{ estFragile ? '⚠️ Oui' : 'Non' }}
          </span>
        </div>

        <div class="flex items-center justify-between">
          <span class="text-gray-500 font-medium">Poids estimé :</span>
          <span class="font-extrabold text-principal-dark text-sm sm:text-base">{{ weightKg }} Kg</span>
        </div>

        <div class="flex items-center justify-between pt-1">
          <span class="text-gray-700 font-bold">Prix du transport :</span>
          <div class="text-right">
            <span class="font-black text-[#B50302] text-base sm:text-lg block">{{ totalPrice.toLocaleString() }} {{ devise }}</span>
            <span v-if="isElectronic" class="text-[10px] text-sky-700 font-extrabold bg-sky-50 px-2 py-0.5 rounded-full border border-sky-200">Forfait Objet Électronique</span>
            <span v-else class="text-[10px] text-gray-400 font-medium">{{ weightKg }} Kg × {{ unitPriceKg.toLocaleString() }} {{ devise }}</span>
          </div>
        </div>
      </div>

      <!-- Destinataire Card -->
      <div class="space-y-2 pt-2 border-t border-gray-100">
        <span class="text-xs font-bold text-gray-500 block">Informations du Destinataire :</span>
        <div class="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-1 shadow-2xs">
          <div class="font-extrabold text-[#053754] text-sm sm:text-base">{{ destinataireNom }}</div>
          <div class="text-xs font-mono font-semibold text-gray-600">{{ destinatairePhone }}</div>
          <div class="text-xs text-gray-600 font-medium">{{ destinataireAdresse }}</div>
        </div>
      </div>

    </div>

    <!-- Submit Payment CTA -->
    <button
      @click="handlePayment"
      type="button"
      class="w-full bg-[#B50302] hover:bg-[#870202] text-white font-extrabold text-sm py-4 rounded-2xl shadow-xl transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99]"
    >
      <span>CONTINUER VERS LE PAIEMENT</span>
    </button>

  </div>
</template>
