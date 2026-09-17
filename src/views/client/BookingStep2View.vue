<script setup>
import { reactive, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import BookingProgressBar from '@/components/client/BookingProgressBar.vue'
import { useI18n } from '@/composables/useI18n'

const route = useRoute()
const router = useRouter()
const { t } = useI18n()

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
      :title="t('booking.step2.title')"
      :subtitle="t('booking.step2.recipientSection')"
    />

    <!-- Form Section -->
    <div class="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-gray-200 dark:border-slate-800 shadow-2xs space-y-4">
      
      <!-- Prénom & Nom Grid -->
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <!-- Prénom * -->
        <div class="space-y-1.5">
          <label class="block text-xs font-bold text-[#074C72] dark:text-sky-300">
            {{ t('booking.step2.firstName') }} <span class="text-[#B50302] dark:text-rose-400">*</span>
          </label>
          <input
            v-model="form.destinataire_prenom"
            type="text"
            :placeholder="t('booking.step2.firstNamePlaceholder')"
            class="w-full px-4 py-3 text-xs sm:text-sm bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-700 text-gray-800 dark:text-slate-100 rounded-xl outline-none focus:border-[#074C72] dark:focus:border-sky-400 focus:ring-2 focus:ring-[#074C72]/20 font-medium placeholder-gray-400 dark:placeholder-slate-500"
          />
        </div>

        <!-- Nom * -->
        <div class="space-y-1.5">
          <label class="block text-xs font-bold text-[#074C72] dark:text-sky-300">
            {{ t('booking.step2.lastName') }} <span class="text-[#B50302] dark:text-rose-400">*</span>
          </label>
          <input
            v-model="form.destinataire_nom"
            type="text"
            :placeholder="t('booking.step2.lastNamePlaceholder')"
            class="w-full px-4 py-3 text-xs sm:text-sm bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-700 text-gray-800 dark:text-slate-100 rounded-xl outline-none focus:border-[#074C72] dark:focus:border-sky-400 focus:ring-2 focus:ring-[#074C72]/20 font-medium placeholder-gray-400 dark:placeholder-slate-500"
          />
        </div>
      </div>

      <!-- Téléphone * -->
      <div class="space-y-1.5">
        <label class="block text-xs font-bold text-[#074C72] dark:text-sky-300">
          {{ t('booking.step2.phone') }} <span class="text-[#B50302] dark:text-rose-400">*</span>
        </label>
        <input
          v-model="form.destinataire_numero"
          type="tel"
          :placeholder="t('booking.step2.phonePlaceholder')"
          class="w-full px-4 py-3 text-xs sm:text-sm bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-700 text-gray-800 dark:text-slate-100 rounded-xl outline-none focus:border-[#074C72] dark:focus:border-sky-400 focus:ring-2 focus:ring-[#074C72]/20 font-medium placeholder-gray-400 dark:placeholder-slate-500"
        />
      </div>

      <!-- Adresse complète de livraison * -->
      <div class="space-y-1.5">
        <label class="block text-xs font-bold text-[#074C72] dark:text-sky-300">
          {{ t('booking.step2.address') }} <span class="text-[#B50302] dark:text-rose-400">*</span>
        </label>
        <input
          v-model="form.destinataire_adresse"
          type="text"
          :placeholder="t('booking.step2.addressPlaceholder')"
          class="w-full px-4 py-3 text-xs sm:text-sm bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-700 text-gray-800 dark:text-slate-100 rounded-xl outline-none focus:border-[#074C72] dark:focus:border-sky-400 focus:ring-2 focus:ring-[#074C72]/20 font-medium placeholder-gray-400 dark:placeholder-slate-500"
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
        {{ t('booking.step2.continueBtn') }}
      </button>
    </div>

  </div>
</template>
