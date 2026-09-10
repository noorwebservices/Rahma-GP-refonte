<script setup>
import { computed } from 'vue'

const props = defineProps({
  step: {
    type: Number,
    required: true,
    default: 1
  },
  totalSteps: {
    type: Number,
    default: 4
  },
  title: {
    type: String,
    default: ''
  },
  subtitle: {
    type: String,
    default: ''
  }
})

const percentage = computed(() => (props.step / props.totalSteps) * 100)

const stepTitles = [
  'Détails du colis',
  'Destinataire',
  'Récapitulatif',
  'Paiement'
]
</script>

<template>
  <div class="w-full space-y-2 mb-6">
    <!-- Header Row -->
    <div class="flex items-center justify-between text-xs font-semibold text-gray-500 uppercase tracking-wider">
      <span>Étape {{ step }} sur {{ totalSteps }}</span>
      <span class="text-gray-400 capitalize font-normal">{{ subtitle || stepTitles[step - 1] }}</span>
    </div>

    <!-- Step Title -->
    <h2 class="text-lg sm:text-xl font-bold text-principal-dark font-serif">
      {{ step }}. {{ title || stepTitles[step - 1] }}
    </h2>

    <!-- Progress Bar Track -->
    <div class="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
      <div
        class="h-full bg-[#053754] rounded-full transition-all duration-300"
        :style="{ width: `${percentage}%` }"
      ></div>
    </div>
  </div>
</template>
