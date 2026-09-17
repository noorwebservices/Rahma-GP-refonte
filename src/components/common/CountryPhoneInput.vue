<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { allCountries } from 'country-telephone-data'

// Build flag emoji from ISO2 code
const getFlag = (iso2) => {
  if (!iso2) return '🌍'
  return iso2
    .toUpperCase()
    .split('')
    .map(char => String.fromCodePoint(127397 + char.charCodeAt(0)))
    .join('')
}

// Priority countries at the top (Africa & Diaspora first)
const priorityCodes = ['sn', 'fr', 'ci', 'ml', 'ma', 'gn', 'bf', 'tg', 'bj', 'cm', 'ga', 'cd', 'cg', 'ne', 'mr', 'dz', 'tn', 'us', 'ca', 'gb', 'be', 'ch', 'es', 'it']

const normalizeCountries = (list) =>
  list.map(c => ({
    code: c.iso2.toUpperCase(),
    iso2: c.iso2.toLowerCase(),
    name: c.name.replace(/\s*\(.*?\)\s*/g, '').trim(), // Remove native name in parentheses
    dialCode: `+${c.dialCode}`,
    flag: getFlag(c.iso2),
    priority: c.priority || 0
  }))

// Build ordered list: priority countries first, then all others
const buildCountryList = () => {
  const normalized = normalizeCountries(allCountries)
  const unique = new Map()
  normalized.forEach(c => {
    const key = `${c.iso2}-${c.priority}`
    if (!unique.has(c.iso2) || c.priority === 0) {
      unique.set(c.iso2, c)
    }
  })
  const all = Array.from(unique.values())
  const priority = priorityCodes.map(pc => all.find(c => c.iso2 === pc)).filter(Boolean)
  const rest = all.filter(c => !priorityCodes.includes(c.iso2)).sort((a, b) => a.name.localeCompare(b.name))
  return [...priority, ...rest]
}

const countries = buildCountryList()
const senegal = countries.find(c => c.iso2 === 'sn') || countries[0]

const props = defineProps({
  modelValue: {
    type: String,
    default: ''
  },
  placeholder: {
    type: String,
    default: '77 000 00 00'
  },
  id: {
    type: String,
    default: 'phone-input'
  }
})

const emit = defineEmits(['update:modelValue', 'countryChange', 'blur'])

const selectedCountry = ref(senegal)
const phoneNumber = ref('')
const isOpen = ref(false)
const searchQuery = ref('')
const dropdownRef = ref(null)

const filteredCountries = computed(() => {
  if (!searchQuery.value.trim()) return countries
  const q = searchQuery.value.toLowerCase()
  return countries.filter(
    c => c.name.toLowerCase().includes(q) || c.dialCode.includes(q) || c.code.toLowerCase().includes(q)
  )
})

onMounted(() => {
  if (props.modelValue) {
    const matched = countries.find(c => props.modelValue.startsWith(c.dialCode))
    if (matched) {
      selectedCountry.value = matched
      phoneNumber.value = props.modelValue.replace(matched.dialCode, '').trim()
    } else {
      phoneNumber.value = props.modelValue
    }
  }
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})

const handleClickOutside = (e) => {
  if (dropdownRef.value && !dropdownRef.value.contains(e.target)) {
    isOpen.value = false
    searchQuery.value = ''
  }
}

const selectCountry = (country) => {
  selectedCountry.value = country
  isOpen.value = false
  searchQuery.value = ''
  emitFullValue()
  emit('countryChange', country)
}

const handleInput = () => {
  emitFullValue()
}

const emitFullValue = () => {
  const clean = phoneNumber.value.replace(/\s+/g, '')
  emit('update:modelValue', clean ? `${selectedCountry.value.dialCode}${clean}` : '')
}

watch(() => props.modelValue, (val) => {
  if (!val) phoneNumber.value = ''
})
</script>

<template>
  <div class="relative w-full" ref="dropdownRef">
    <!-- Input Row -->
    <div class="flex rounded-xl overflow-visible border border-gray-300 dark:border-slate-700 focus-within:border-principal dark:focus-within:border-sky-400 focus-within:ring-2 focus-within:ring-principal/20 transition-all bg-white dark:bg-slate-800 shadow-2xs">

      <!-- Country Trigger Button -->
      <button
        type="button"
        @click="isOpen = !isOpen"
        class="bg-gray-100 dark:bg-slate-700 hover:bg-gray-200/80 dark:hover:bg-slate-600 px-3 py-3 text-xs sm:text-sm font-bold text-gray-700 dark:text-slate-200 flex items-center gap-1.5 border-r border-gray-300 dark:border-slate-700 cursor-pointer transition-colors shrink-0 rounded-l-xl"
      >
        <span class="text-base leading-none">{{ selectedCountry.flag }}</span>
        <span class="font-mono">{{ selectedCountry.dialCode }}</span>
        <svg
          class="w-3 h-3 text-gray-500 dark:text-slate-400 transition-transform duration-200 shrink-0"
          :class="{ 'rotate-180': isOpen }"
          fill="none" stroke="currentColor" viewBox="0 0 24 24"
        >
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      <!-- Phone Number Input -->
      <input
        :id="id"
        v-model="phoneNumber"
        @input="handleInput"
        @blur="emit('blur')"
        type="tel"
        :placeholder="placeholder"
        class="w-full px-3.5 py-3 text-xs sm:text-sm text-gray-900 dark:text-slate-100 bg-transparent outline-none placeholder-gray-400 dark:placeholder-slate-500 font-medium rounded-r-xl"
      />
    </div>

    <!-- Dropdown -->
    <transition
      enter-active-class="transition duration-150 ease-out"
      enter-from-class="opacity-0 scale-95 -translate-y-1"
      enter-to-class="opacity-100 scale-100 translate-y-0"
      leave-active-class="transition duration-100 ease-in"
      leave-from-class="opacity-100 scale-100 translate-y-0"
      leave-to-class="opacity-0 scale-95 -translate-y-1"
    >
      <div
        v-if="isOpen"
        class="absolute left-0 top-full mt-1.5 w-80 bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-slate-700 z-[200] overflow-hidden"
      >
        <!-- Search -->
        <div class="p-2 border-b border-gray-100 dark:border-slate-700 bg-gray-50 dark:bg-slate-900">
          <div class="relative">
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Rechercher pays ou indicatif..."
              class="w-full pl-8 pr-3 py-2 text-xs text-gray-800 dark:text-slate-100 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl outline-none focus:border-principal dark:focus:border-sky-400"
              @click.stop
            />
            <svg class="w-4 h-4 text-gray-400 dark:text-slate-500 absolute left-2.5 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>

        <!-- Divider label when no search -->
        <div v-if="!searchQuery" class="px-3.5 pt-2 pb-1 text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-slate-400">
          Pays fréquents
        </div>

        <!-- Scrollable List -->
        <div class="max-h-60 overflow-y-auto divide-y divide-gray-50 dark:divide-slate-700/50 no-scrollbar">
          <template v-if="!searchQuery">
            <!-- Priority countries -->
            <button
              v-for="country in filteredCountries.slice(0, priorityCodes.length)"
              :key="country.code + '-p'"
              type="button"
              @click="selectCountry(country)"
              :class="[
                'w-full px-3.5 py-2.5 flex items-center justify-between text-left hover:bg-principal/5 dark:hover:bg-slate-700 transition-colors cursor-pointer',
                selectedCountry.iso2 === country.iso2 ? 'bg-principal/10 dark:bg-slate-700 font-bold text-principal-dark dark:text-sky-300' : 'text-gray-700 dark:text-slate-200'
              ]"
            >
              <div class="flex items-center gap-2 truncate">
                <span class="text-base leading-none shrink-0">{{ country.flag }}</span>
                <span class="text-xs sm:text-sm truncate">{{ country.name }}</span>
              </div>
              <span class="font-mono text-xs text-gray-500 dark:text-slate-400 shrink-0 ml-2 font-semibold">{{ country.dialCode }}</span>
            </button>

            <div class="px-3.5 pt-2 pb-1 text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-slate-400 bg-gray-50 dark:bg-slate-900 border-t border-gray-100 dark:border-slate-700">
              Tous les pays
            </div>

            <!-- Rest of countries -->
            <button
              v-for="country in filteredCountries.slice(priorityCodes.length)"
              :key="country.code"
              type="button"
              @click="selectCountry(country)"
              :class="[
                'w-full px-3.5 py-2.5 flex items-center justify-between text-left hover:bg-principal/5 dark:hover:bg-slate-700 transition-colors cursor-pointer',
                selectedCountry.iso2 === country.iso2 ? 'bg-principal/10 dark:bg-slate-700 font-bold text-principal-dark dark:text-sky-300' : 'text-gray-700 dark:text-slate-200'
              ]"
            >
              <div class="flex items-center gap-2 truncate">
                <span class="text-base leading-none shrink-0">{{ country.flag }}</span>
                <span class="text-xs sm:text-sm truncate">{{ country.name }}</span>
              </div>
              <span class="font-mono text-xs text-gray-500 dark:text-slate-400 shrink-0 ml-2 font-semibold">{{ country.dialCode }}</span>
            </button>
          </template>

          <!-- Search results -->
          <template v-else>
            <button
              v-for="country in filteredCountries"
              :key="country.code + '-s'"
              type="button"
              @click="selectCountry(country)"
              :class="[
                'w-full px-3.5 py-2.5 flex items-center justify-between text-left hover:bg-principal/5 dark:hover:bg-slate-700 transition-colors cursor-pointer',
                selectedCountry.iso2 === country.iso2 ? 'bg-principal/10 dark:bg-slate-700 font-bold text-principal-dark dark:text-sky-300' : 'text-gray-700 dark:text-slate-200'
              ]"
            >
              <div class="flex items-center gap-2 truncate">
                <span class="text-base leading-none shrink-0">{{ country.flag }}</span>
                <span class="text-xs sm:text-sm truncate">{{ country.name }}</span>
              </div>
              <span class="font-mono text-xs text-gray-500 dark:text-slate-400 shrink-0 ml-2 font-semibold">{{ country.dialCode }}</span>
            </button>
            <div v-if="filteredCountries.length === 0" class="p-4 text-center text-xs text-gray-400 dark:text-slate-400">
              Aucun pays trouvé
            </div>
          </template>
        </div>
      </div>
    </transition>
  </div>
</template>
