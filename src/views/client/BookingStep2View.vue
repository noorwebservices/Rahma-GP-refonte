<script setup>
import { reactive } from 'vue'
import { useRouter } from 'vue-router'
import BookingProgressBar from '@/components/client/BookingProgressBar.vue'

const router = useRouter()

const form = reactive({
  nom_prenom: 'Mariama Diallo',
  telephone: '+33 7 23 34 56 78',
  ville: 'Paris',
  adresse: '14 Boulevard Voltaire, 75011 Paris'
})

const goToStep3 = () => {
  router.push('/client/booking/step-3')
}
</script>

<template>
  <div class="space-y-6 pb-12">
    <!-- Progress Bar Step 2 -->
    <BookingProgressBar
      :step="2"
      :totalSteps="4"
      title="Destinataire"
      subtitle="Destinataire"
    />

    <!-- Form Section -->
    <div class="bg-white rounded-3xl p-6 border border-gray-200 shadow-2xs space-y-4">
      <!-- Nom & Prénom * -->
      <div class="space-y-1.5">
        <label class="block text-xs font-bold text-gray-700">
          Nom & Prénom <span class="text-red-500">*</span>
        </label>
        <input
          v-model="form.nom_prenom"
          type="text"
          placeholder="Ex : Mariama Diallo"
          class="w-full px-4 py-3 text-xs sm:text-sm bg-white border border-gray-300 rounded-xl outline-none focus:border-principal focus:ring-2 focus:ring-principal/20 font-medium placeholder-gray-400"
        />
      </div>

      <!-- Téléphone * -->
      <div class="space-y-1.5">
        <label class="block text-xs font-bold text-gray-700">
          Téléphone <span class="text-red-500">*</span>
        </label>
        <input
          v-model="form.telephone"
          type="tel"
          placeholder="Ex : 770000000"
          class="w-full px-4 py-3 text-xs sm:text-sm bg-white border border-gray-300 rounded-xl outline-none focus:border-principal focus:ring-2 focus:ring-principal/20 font-medium placeholder-gray-400"
        />
      </div>

      <!-- Ville * -->
      <div class="space-y-1.5">
        <label class="block text-xs font-bold text-gray-700">
          Ville <span class="text-red-500">*</span>
        </label>
        <input
          v-model="form.ville"
          type="text"
          placeholder="Paris"
          class="w-full px-4 py-3 text-xs sm:text-sm bg-white border border-gray-300 rounded-xl outline-none focus:border-principal focus:ring-2 focus:ring-principal/20 font-medium placeholder-gray-400"
        />
      </div>

      <!-- Adresse / Quartier * -->
      <div class="space-y-1.5">
        <label class="block text-xs font-bold text-gray-700">
          Adresse / Quartier <span class="text-red-500">*</span>
        </label>
        <input
          v-model="form.adresse"
          type="text"
          placeholder="Ex : 14 Boulevard Voltaire, 75011 Paris"
          class="w-full px-4 py-3 text-xs sm:text-sm bg-white border border-gray-300 rounded-xl outline-none focus:border-principal focus:ring-2 focus:ring-principal/20 font-medium placeholder-gray-400"
        />
      </div>
    </div>

    <!-- Submit CTA Button -->
    <div class="flex justify-end pt-2">
      <button
        @click="goToStep3"
        type="button"
        class="bg-[#BD0A0A] hover:bg-[#a00808] text-white font-extrabold text-xs sm:text-sm px-8 py-3.5 rounded-xl shadow-md transition-all cursor-pointer active:scale-[0.99]"
      >
        CONTINUER
      </button>
    </div>

  </div>
</template>
