<script setup>
import { ref } from 'vue'

const props = defineProps({
  modelValue: {
    type: Object,
    default: () => ({ period: '30d' }),
  },
})
const emit = defineEmits(['update:modelValue', 'change'])

const presets = [
  { key: 'today', label: "Aujourd'hui" },
  { key: '7d', label: '7 jours' },
  { key: '30d', label: '30 jours' },
  { key: '90d', label: '90 jours' },
  { key: 'all', label: 'Tout' },
  { key: 'custom', label: 'Personnalisé' },
]

const active = ref(props.modelValue.period || '30d')
const from = ref(props.modelValue.from || '')
const to = ref(props.modelValue.to || '')

function apply() {
  const value =
    active.value === 'custom'
      ? { period: 'custom', from: from.value, to: to.value }
      : { period: active.value }
  emit('update:modelValue', value)
  emit('change', value)
}

function select(key) {
  active.value = key
  if (key !== 'custom') {
    apply()
  }
}
</script>

<template>
  <div class="flex flex-wrap items-center gap-2">
    <button
      v-for="p in presets"
      :key="p.key"
      type="button"
      @click="select(p.key)"
      :class="[
        'px-4 py-2 rounded-xl text-xs font-extrabold uppercase tracking-wider transition transform active:scale-95 cursor-pointer',
        active === p.key
          ? 'bg-[#053754] dark:bg-sky-500 text-white shadow-lg'
          : 'bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-slate-300 hover:bg-gray-200 dark:hover:bg-slate-700',
      ]"
    >
      {{ p.label }}
    </button>

    <div v-if="active === 'custom'" class="flex items-center gap-2 ml-1">
      <input
        v-model="from"
        type="date"
        class="px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 text-xs font-semibold text-gray-700 dark:text-slate-200"
      />
      <span class="text-gray-400 text-xs">→</span>
      <input
        v-model="to"
        type="date"
        class="px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 text-xs font-semibold text-gray-700 dark:text-slate-200"
      />
      <button
        type="button"
        @click="apply"
        class="px-4 py-2 rounded-xl bg-[#B50302] hover:bg-[#870202] text-white text-xs font-extrabold uppercase tracking-wider transition active:scale-95 cursor-pointer"
      >
        Appliquer
      </button>
    </div>
  </div>
</template>
