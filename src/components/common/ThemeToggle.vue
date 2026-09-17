<script setup>
import { onMounted } from 'vue'
import { useTheme } from '@/composables/useTheme'

const props = defineProps({
  showLabel: {
    type: Boolean,
    default: false
  },
  variant: {
    type: String,
    default: 'default' // 'default' | 'transparent' | 'pill'
  }
})

const { isDark, toggleTheme, initTheme } = useTheme()

onMounted(() => {
  initTheme()
})
</script>

<template>
  <button
    @click="toggleTheme"
    type="button"
    aria-label="Basculer le thème sombre/clair"
    :title="isDark ? 'Passer au mode clair' : 'Passer au mode sombre'"
    class="relative inline-flex items-center justify-center p-2 rounded-xl transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-primary/50 group select-none"
    :class="[
      variant === 'transparent'
        ? 'text-current hover:bg-white/10 dark:hover:bg-white/10'
        : variant === 'pill'
        ? 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:border-primary/40'
        : 'bg-white/10 hover:bg-white/20 dark:bg-slate-800/80 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-100 border border-slate-200/50 dark:border-slate-700/60 shadow-sm'
    ]"
  >
    <div class="relative w-5 h-5 flex items-center justify-center overflow-hidden">
      <!-- Sun Icon (visible when Dark to switch to Light) -->
      <svg
        v-if="isDark"
        class="w-5 h-5 text-amber-400 transform transition-transform duration-300 rotate-0 scale-100 group-hover:rotate-45"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
        />
      </svg>

      <!-- Moon Icon (visible when Light to switch to Dark) -->
      <svg
        v-else
        class="w-5 h-5 text-slate-700 dark:text-slate-200 transform transition-transform duration-300 -rotate-12 group-hover:rotate-0"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
        />
      </svg>
    </div>

    <span v-if="showLabel" class="ml-2 text-xs font-semibold">
      {{ isDark ? 'Mode Clair' : 'Mode Sombre' }}
    </span>
  </button>
</template>
