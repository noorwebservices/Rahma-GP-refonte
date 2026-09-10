<script setup>
import { computed } from 'vue'
import { getCountryIso, getCountryFlag } from '@/utils/flagHelper'

const props = defineProps({
  city: {
    type: String,
    default: ''
  },
  country: {
    type: String,
    default: ''
  },
  size: {
    type: String,
    default: 'w-6 h-4'
  }
})

const isoCode = computed(() => getCountryIso(props.city, props.country))

const flagImgUrl = computed(() => {
  if (!isoCode.value) return ''
  return `https://flagcdn.com/w40/${isoCode.value.toLowerCase()}.png`
})

const emojiFallback = computed(() => getCountryFlag(props.city, props.country))
</script>

<template>
  <span class="inline-flex items-center shrink-0">
    <img
      v-if="flagImgUrl"
      :src="flagImgUrl"
      :alt="country || city || 'Drapeau'"
      class="object-cover rounded-xs shadow-2xs inline-block border border-gray-200/50"
      :class="size"
      @error="(e) => e.target.style.display = 'none'"
    />
    <span v-else class="text-base leading-none">{{ emojiFallback }}</span>
  </span>
</template>
