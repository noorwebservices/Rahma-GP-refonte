<script setup>
import { onMounted } from 'vue'
import { useI18n } from '@/composables/useI18n'

const props = defineProps({
  variant: {
    type: String,
    default: 'default' // 'default' | 'transparent' | 'pill'
  }
})

const { currentLang, toggleLanguage, initLang } = useI18n()

onMounted(() => {
  initLang()
})
</script>

<template>
  <button
    @click="toggleLanguage"
    type="button"
    aria-label="Basculer la langue / Switch language"
    :title="currentLang === 'fr' ? 'Switch to English' : 'Passer au Français'"
    class="relative inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-extrabold tracking-wider uppercase transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-primary/50 group select-none cursor-pointer"
    :class="[
      variant === 'transparent'
        ? 'text-white hover:bg-white/10 border border-white/20 dark:hover:bg-slate-800'
        : variant === 'pill'
        ? 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:border-primary/40'
        : 'bg-white/10 hover:bg-white/20 dark:bg-slate-800/80 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-100 border border-slate-200/50 dark:border-slate-700/60 shadow-sm'
    ]"
  >
    <!-- Flag Icon / Indicator -->
    <span class="text-sm font-normal">
      <span v-if="currentLang === 'fr'">🇫🇷</span>
      <span v-else>🇬🇧</span>
    </span>

    <span>{{ currentLang === 'fr' ? 'FR' : 'EN' }}</span>
  </button>
</template>
