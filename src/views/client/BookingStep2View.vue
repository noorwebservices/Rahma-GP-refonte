<script setup>
import { reactive, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import BookingProgressBar from '@/components/client/BookingProgressBar.vue'

const route = useRoute()
const router = useRouter()

const voyageId = ref(sessionStorage.getItem('rahma_active_voyage_id') || route.query.voyage_id || '')

const form = reactive({
  destinataire_prenom: '',
  destinataire_nom: '',
  destinataire_numero: '',
  destinataire_adresse: ''
})

onMounted(() => {
  const savedDraft = sessionStorage.getItem('rahma_booking_draft')
  if (savedDraft) {
    try {
      const parsed = JSON.parse(savedDraft)
      if (parsed.voyage_id) voyageId.value = parsed.voyage_id
      if (parsed.colis) {
        form.destinataire_prenom = parsed.colis.destinataire_prenom ?? ''
        form.destinataire_nom = parsed.colis.destinataire_nom ?? ''
        form.destinataire_numero = parsed.colis.destinataire_numero ?? ''
        form.destinataire_adresse = parsed.colis.destinataire_adresse ?? ''
      }
    } catch (e) {}
  }
})

const goToStep3 = () => {
  const existingDraft = JSON.parse(sessionStorage.getItem('rahma_booking_draft') || '{}')
  const updatedDraft = {
    ...existingDraft,
    voyage_id: voyageId.value || existingDraft.voyage_id || '01a08d03-a84c-70a7-945c-053fe2e67b57',
    colis: {
      ...(existingDraft.colis || {}),
      destinataire_prenom: form.destinataire_prenom,
      destinataire_nom: form.destinataire_nom,
      destinataire_numero: form.destinataire_numero,
      destinataire_adresse: form.destinataire_adresse
    }
  }
  sessionStorage.setItem('rahma_booking_draft', JSON.stringify(updatedDraft))
  if (voyageId.value) {
    sessionStorage.setItem('rahma_active_voyage_id', voyageId.value)
  }
  router.push('/client/booking/step-3')
}
</script>

<template>
  <div class="space-y-6 pb-12 max-w-3xl mx-auto font-sans">
    <!-- Progress Bar Step 2 -->
    <BookingProgressBar
      :step="2"
      :totalSteps="4"
      title="Informations du Destinataire"
      subtitle="Coordonnées de la personne recevant le colis"
    />

    <!-- Form Section -->
    <div class="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200 shadow-2xs space-y-4">
      
      <!-- Prénom & Nom Grid -->
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <!-- Prénom * -->
        <div class="space-y-1.5">
          <label class="block text-xs font-bold text-[#074C72]">
            Prénom du destinataire <span class="text-[#B50302]">*</span>
          </label>
          <input
            v-model="form.destinataire_prenom"
            type="text"
            placeholder="Ex : Moussa"
            class="w-full px-4 py-3 text-xs sm:text-sm bg-white border border-gray-300 rounded-xl outline-none focus:border-[#074C72] focus:ring-2 focus:ring-[#074C72]/20 font-medium placeholder-gray-400"
          />
        </div>

        <!-- Nom * -->
        <div class="space-y-1.5">
          <label class="block text-xs font-bold text-[#074C72]">
            Nom du destinataire <span class="text-[#B50302]">*</span>
          </label>
          <input
            v-model="form.destinataire_nom"
            type="text"
            placeholder="Ex : Kouyaté"
            class="w-full px-4 py-3 text-xs sm:text-sm bg-white border border-gray-300 rounded-xl outline-none focus:border-[#074C72] focus:ring-2 focus:ring-[#074C72]/20 font-medium placeholder-gray-400"
          />
        </div>
      </div>

      <!-- Téléphone * -->
      <div class="space-y-1.5">
        <label class="block text-xs font-bold text-[#074C72]">
          Numéro de téléphone <span class="text-[#B50302]">*</span>
        </label>
        <input
          v-model="form.destinataire_numero"
          type="tel"
          placeholder="Ex : +242066554492"
          class="w-full px-4 py-3 text-xs sm:text-sm bg-white border border-gray-300 rounded-xl outline-none focus:border-[#074C72] focus:ring-2 focus:ring-[#074C72]/20 font-medium placeholder-gray-400"
        />
      </div>

      <!-- Adresse complète de livraison * -->
      <div class="space-y-1.5">
        <label class="block text-xs font-bold text-[#074C72]">
          Adresse complète de livraison <span class="text-[#B50302]">*</span>
        </label>
        <input
          v-model="form.destinataire_adresse"
          type="text"
          placeholder="Ex : 15 Rue de la Paix, 75002 Paris, France"
          class="w-full px-4 py-3 text-xs sm:text-sm bg-white border border-gray-300 rounded-xl outline-none focus:border-[#074C72] focus:ring-2 focus:ring-[#074C72]/20 font-medium placeholder-gray-400"
        />
      </div>

    </div>

    <!-- Submit CTA Button -->
    <div class="flex justify-end pt-2">
      <button
        @click="goToStep3"
        type="button"
        class="bg-[#B50302] hover:bg-[#870202] text-white font-extrabold text-xs sm:text-sm px-8 py-3.5 rounded-xl shadow-md transition-all cursor-pointer active:scale-[0.99]"
      >
        CONTINUER
      </button>
    </div>

  </div>
</template>
