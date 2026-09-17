<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { City, Country } from 'country-state-city'

const props = defineProps({
  modelValue: {
    type: String,
    default: ''
  },
  label: {
    type: String,
    default: ''
  },
  placeholder: {
    type: String,
    default: 'Choisir la ville'
  },
  id: {
    type: String,
    default: 'city-select'
  }
})

const emit = defineEmits(['update:modelValue', 'change'])

const isOpen = ref(false)
const searchQuery = ref('')
const containerRef = ref(null)

// Priority frequent cities list
const priorityCities = [
  { city: 'Dakar', country: 'Sénégal', flag: '🇸🇳', iso: 'SN' },
  { city: 'Thiès', country: 'Sénégal', flag: '🇸🇳', iso: 'SN' },
  { city: 'Saint-Louis', country: 'Sénégal', flag: '🇸🇳', iso: 'SN' },
  { city: 'Ziguinchor', country: 'Sénégal', flag: '🇸🇳', iso: 'SN' },
  { city: 'Touba', country: 'Sénégal', flag: '🇸🇳', iso: 'SN' },
  { city: 'Mbour', country: 'Sénégal', flag: '🇸🇳', iso: 'SN' },
  { city: 'Paris', country: 'France', flag: '🇫🇷', iso: 'FR' },
  { city: 'Lyon', country: 'France', flag: '🇫🇷', iso: 'FR' },
  { city: 'Marseille', country: 'France', flag: '🇫🇷', iso: 'FR' },
  { city: 'Toulouse', country: 'France', flag: '🇫🇷', iso: 'FR' },
  { city: 'Bordeaux', country: 'France', flag: '🇫🇷', iso: 'FR' },
  { city: 'Abidjan', country: "Côte d'Ivoire", flag: '🇨🇮', iso: 'CI' },
  { city: 'Bamako', country: 'Mali', flag: '🇲🇱', iso: 'ML' },
  { city: 'Conakry', country: 'Guinée', flag: '🇬🇳', iso: 'GN' },
  { city: 'Douala', country: 'Cameroun', flag: '🇨🇲', iso: 'CM' },
  { city: 'Casablanca', country: 'Maroc', flag: '🇲🇦', iso: 'MA' },
  { city: 'Londres', country: 'Royaume-Uni', flag: '🇬🇧', iso: 'GB' },
  { city: 'New York', country: 'États-Unis', flag: '🇺🇸', iso: 'US' },
  { city: 'Montréal', country: 'Canada', flag: '🇨🇦', iso: 'CA' },
  { city: 'Bruxelles', country: 'Belgique', flag: '🇧🇪', iso: 'BE' },
  { city: 'Genève', country: 'Suisse', flag: '🇨🇭', iso: 'CH' }
]

const allCitiesData = ref([])

onMounted(() => {
  try {
    const rawCities = City.getAllCities()
    const countryMap = new Map(Country.getAllCountries().map(c => [c.isoCode, c]))
    
    // Map cities with country names and flags from country-state-city library
    allCitiesData.value = rawCities.map(c => {
      const countryObj = countryMap.get(c.countryCode)
      return {
        city: c.name,
        country: countryObj ? countryObj.name : c.countryCode,
        flag: countryObj ? countryObj.flag : '🌍',
        iso: c.countryCode
      }
    })
  } catch (err) {
    allCitiesData.value = priorityCities
  }
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})

const selectedCityObj = computed(() => {
  if (!props.modelValue || !props.modelValue.trim()) return null
  const q = props.modelValue.toLowerCase().trim()
  const matchedP = priorityCities.find(c => c.city.toLowerCase() === q)
  if (matchedP) return matchedP

  const matchedA = allCitiesData.value.find(c => c.city.toLowerCase() === q)
  if (matchedA) return matchedA

  return { city: props.modelValue, country: '', flag: '📍' }
})

const filteredCities = computed(() => {
  if (!searchQuery.value.trim()) return priorityCities
  const q = searchQuery.value.toLowerCase()
  
  // Filter all cities from country-state-city library
  const matched = allCitiesData.value.filter(
    c => c.city.toLowerCase().includes(q) || c.country.toLowerCase().includes(q)
  )
  return matched.slice(0, 60) // cap to 60 for performance
})

const selectCity = (cityObj) => {
  emit('update:modelValue', cityObj.city)
  emit('change', cityObj)
  isOpen.value = false
  searchQuery.value = ''
}

const handleClickOutside = (e) => {
  if (containerRef.value && !containerRef.value.contains(e.target)) {
    isOpen.value = false
    searchQuery.value = ''
  }
}
</script>

<template>
  <div class="relative w-full" ref="containerRef">
    <label v-if="label" :for="id" class="block text-[10px] font-extrabold uppercase tracking-wider text-gray-500 dark:text-slate-400 mb-1">
      {{ label }}
    </label>

    <!-- Select Trigger Input Button -->
    <button
      type="button"
      @click="isOpen = !isOpen"
      class="w-full bg-[#EAEFF4] dark:bg-slate-700/80 hover:bg-gray-200/80 dark:hover:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-xl px-3.5 py-3 flex items-center justify-between text-xs sm:text-sm font-bold transition-colors cursor-pointer outline-none shadow-2xs"
    >
      <div class="flex items-center gap-2.5 truncate">
        <span class="text-base leading-none">{{ selectedCityObj ? selectedCityObj.flag : '📍' }}</span>
        <template v-if="selectedCityObj">
          <span class="truncate font-extrabold text-[#074C72] dark:text-sky-300">{{ selectedCityObj.city }}</span>
          <span v-if="selectedCityObj.country" class="text-[11px] font-normal text-gray-500 dark:text-slate-400 truncate">
            ({{ selectedCityObj.country }})
          </span>
        </template>
        <template v-else>
          <span class="truncate font-semibold text-gray-400 dark:text-slate-400">
            {{ placeholder || 'Choisir la ville' }}
          </span>
        </template>
      </div>

      <svg
        class="w-4 h-4 text-gray-500 dark:text-slate-400 transition-transform duration-200 shrink-0"
        :class="{ 'rotate-180': isOpen }"
        fill="none" stroke="currentColor" viewBox="0 0 24 24"
      >
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M19 9l-7 7-7-7" />
      </svg>
    </button>

    <!-- Dropdown with Search Input & Full City List from country-state-city -->
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
        class="absolute left-0 top-full mt-1.5 w-full bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-slate-700 z-[300] overflow-hidden text-gray-800 dark:text-slate-100"
      >
        <!-- Search Input Header -->
        <div class="p-2.5 border-b border-gray-100 dark:border-slate-700 bg-gray-50 dark:bg-slate-900">
          <div class="relative">
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Rechercher une ville ou un pays..."
              class="w-full pl-9 pr-3 py-2 text-xs text-gray-800 dark:text-slate-100 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl outline-none focus:border-[#074C72] dark:focus:border-sky-400 font-medium placeholder-gray-400 dark:placeholder-slate-500"
              @click.stop
            />
            <svg class="w-4 h-4 text-gray-400 dark:text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>

        <div v-if="!searchQuery" class="px-3.5 pt-2 pb-1 text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-slate-400">
          Villes fréquentes
        </div>

        <!-- Scrollable Cities List -->
        <div class="max-h-60 overflow-y-auto divide-y divide-gray-50 dark:divide-slate-700/50 no-scrollbar">
          <!-- Reset / Choisir la ville option -->
          <button
            type="button"
            @click="selectCity({ city: '', country: '', flag: '📍' })"
            class="w-full px-4 py-2 flex items-center justify-between text-left hover:bg-[#074C72]/5 dark:hover:bg-slate-700 transition-colors cursor-pointer text-gray-400 dark:text-slate-400 italic bg-gray-50/50 dark:bg-slate-900/50"
          >
            <div class="flex items-center gap-2.5 truncate">
              <span class="text-base leading-none">📍</span>
              <span class="text-xs sm:text-sm font-semibold">{{ placeholder || 'Choisir la ville' }}</span>
            </div>
          </button>

          <button
            v-for="item in filteredCities"
            :key="item.city + '-' + item.iso"
            type="button"
            @click="selectCity(item)"
            :class="[
              'w-full px-4 py-2.5 flex items-center justify-between text-left hover:bg-[#074C72]/5 dark:hover:bg-slate-700 transition-colors cursor-pointer',
              modelValue && modelValue.toLowerCase() === item.city.toLowerCase() ? 'bg-[#074C72]/10 dark:bg-sky-950/80 font-bold text-[#074C72] dark:text-sky-300' : 'text-gray-700 dark:text-slate-200'
            ]"
          >
            <div class="flex items-center gap-2.5 truncate">
              <span class="text-base leading-none">{{ item.flag }}</span>
              <span class="text-xs sm:text-sm font-bold">{{ item.city }}</span>
            </div>
            <span class="text-[11px] text-gray-400 dark:text-slate-400 font-medium shrink-0 ml-2">
              {{ item.country }}
            </span>
          </button>

          <div v-if="filteredCities.length === 0" class="p-4 text-center text-xs text-gray-400 dark:text-slate-400">
            Aucune ville trouvée
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>
