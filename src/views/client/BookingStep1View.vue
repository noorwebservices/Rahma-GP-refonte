<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import Swal from 'sweetalert2'
import BookingProgressBar from '@/components/client/BookingProgressBar.vue'
import { fetchVoyage } from '@/services/voyageService'
import { getCategoryIcon, isElectronicType } from '@/utils/flagHelper'
import { useI18n } from '@/composables/useI18n'

const { t } = useI18n()

const route = useRoute()
const router = useRouter()

const voyageId = ref(sessionStorage.getItem('rahma_active_voyage_id') || route.query.voyage_id || '')
const voyageData = ref(null)
const isLoadingVoyage = ref(false)

const selectedType = ref('Vêtements')
const weightKg = ref(1)
const estimatedValue = ref('')
const description = ref('')
const estFragile = ref(false)
const fileName = ref('')
const previewImage = ref(null)
const photoUrl = ref('')

const maxWeight = computed(() => {
  if (voyageData.value?.capacite_dispo !== undefined && voyageData.value?.capacite_dispo !== null) {
    const c = Number(voyageData.value.capacite_dispo)
    return c > 0 ? c : 25
  }
  if (voyageData.value?.capacite !== undefined && voyageData.value?.capacite !== null) {
    const c = Number(voyageData.value.capacite)
    return c > 0 ? c : 25
  }
  return 25
})

watch(maxWeight, (newMax) => {
  if (weightKg.value > newMax) {
    weightKg.value = newMax
  }
}, { immediate: true })

const defaultTypes = [
  { id: 'Vêtements', label: 'Vêtements', icon: '👗' },
  { id: 'Documents', label: 'Documents', icon: '📄' },
  { id: 'Électronique & téléphones', label: 'Électroniques', icon: '📱' },
  { id: 'Cosmétiques & soins', label: 'Cosmétiques', icon: '💄' },
  { id: 'Cadeaux', label: 'Cadeaux', icon: '🎁' },
  { id: 'Autres objets', label: 'Autres objets', icon: '📦' }
]

const packageTypes = ref(defaultTypes)

import { setHeaderRoute } from '@/utils/headerState'

onMounted(async () => {
  // Load existing draft if present
  const savedDraft = sessionStorage.getItem('rahma_booking_draft')
  if (savedDraft) {
    try {
      const parsed = JSON.parse(savedDraft)
      if (parsed.voyage_id) voyageId.value = parsed.voyage_id
      if (parsed.colis) {
        selectedType.value = parsed.colis.type || selectedType.value
        description.value = parsed.colis.description ?? description.value
        estimatedValue.value = parsed.colis.valeur_estimee ?? estimatedValue.value
        weightKg.value = parsed.colis.poids || weightKg.value
        estFragile.value = Boolean(parsed.colis.est_fragile)
        photoUrl.value = parsed.colis.photo || photoUrl.value
        if (photoUrl.value) {
          previewImage.value = photoUrl.value
        }
      }
    } catch (e) {}
  }

  if (voyageId.value) {
    isLoadingVoyage.value = true
    try {
      const res = await fetchVoyage(voyageId.value)
      if (res && res.data) {
        voyageData.value = res.data
        if (weightKg.value > maxWeight.value) {
          weightKg.value = maxWeight.value
        }
        setHeaderRoute({
          routeFrom: res.data.ville_depart,
          countryFrom: res.data.pays_depart,
          routeTo: res.data.ville_destination,
          countryTo: res.data.pays_destination
        })
        if (Array.isArray(res.data.objets_autorises) && res.data.objets_autorises.length > 0) {
          packageTypes.value = res.data.objets_autorises.map(item => ({
            id: item,
            label: item,
            icon: getCategoryIcon(item)
          }))
          if (!packageTypes.value.some(t => t.id === selectedType.value)) {
            selectedType.value = packageTypes.value[0].id
          }
        }
      }
    } catch (err) {
      console.warn('Voyage details failed to load, using default categories')
    } finally {
      isLoadingVoyage.value = false
    }
  }
})

import { currentCurrency, formatPrice } from '@/utils/currencyState'

const isElectronic = computed(() => isElectronicType(selectedType.value))
const unitPriceKg = computed(() => voyageData.value?.prix_kg || 8500)
const unitPriceObjet = computed(() => voyageData.value?.prix_objet || 15000)
const devise = computed(() => voyageData.value?.devise || 'XOF')

const totalPrice = computed(() => {
  if (isElectronic.value) {
    return Math.round(unitPriceObjet.value)
  }
  return Math.round(weightKg.value * unitPriceKg.value)
})

const formattedUnitPriceKg = computed(() => formatPrice(unitPriceKg.value, devise.value))
const formattedUnitPriceObjet = computed(() => formatPrice(unitPriceObjet.value, devise.value))
const formattedTotalPrice = computed(() => formatPrice(totalPrice.value, devise.value))

const handleFileChange = (e) => {
  const file = e.target.files[0]
  if (file) {
    fileName.value = file.name
    const reader = new FileReader()
    reader.onload = (event) => {
      previewImage.value = event.target.result
      photoUrl.value = event.target.result
    }
    reader.readAsDataURL(file)
  }
}

const goToStep2 = () => {
  if (!description.value.trim()) {
    Swal.fire({
      icon: 'warning',
      title: 'Champ obligatoire',
      text: 'Veuillez saisir une description précise du contenu de votre colis.',
      confirmButtonColor: '#B50302'
    })
    return
  }

  if (!isElectronic.value && Number(weightKg.value) > maxWeight.value) {
    Swal.fire({
      icon: 'error',
      title: 'Capacité insuffisante',
      text: `Le poids sélectionné (${weightKg.value} Kg) dépasse la capacité disponible du voyage (${maxWeight.value} Kg).`,
      confirmButtonColor: '#B50302'
    })
    return
  }

  const existingDraft = JSON.parse(sessionStorage.getItem('rahma_booking_draft') || '{}')
  const updatedDraft = {
    ...existingDraft,
    voyage_id: voyageId.value || '01a08d03-a84c-70a7-945c-053fe2e67b57',
    voyage: voyageData.value || existingDraft.voyage,
    colis: {
      ...(existingDraft.colis || {}),
      type: selectedType.value,
      description: description.value.trim(),
      valeur_estimee: Number(estimatedValue.value) || 0,
      poids: Number(weightKg.value) || 1,
      est_fragile: Boolean(estFragile.value),
      photo: photoUrl.value || null
    }
  }
  sessionStorage.setItem('rahma_booking_draft', JSON.stringify(updatedDraft))
  if (voyageId.value) {
    sessionStorage.setItem('rahma_active_voyage_id', voyageId.value)
  }
  router.push('/client/booking/step-2')
}
</script>

<template>
  <div class="space-y-6 pb-12 max-w-3xl mx-auto font-sans">
    <!-- Progress Bar Step 1 -->
    <BookingProgressBar
      :step="1"
      :totalSteps="4"
      :title="t('booking.step1.title')"
      :subtitle="t('booking.step1.sub')"
    />

    <!-- Form Section -->
    <div class="space-y-6 bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-gray-200 dark:border-slate-800 shadow-2xs">
      
      <!-- Type de colis (Accepted categories by traveler) * -->
      <div class="space-y-2.5">
        <div class="flex items-center justify-between">
          <label class="block text-xs font-bold text-[#074C72] dark:text-sky-300">
            {{ t('booking.step1.packageTypeLabel') }} <span class="text-[#B50302] dark:text-rose-400">*</span>
          </label>
          <span v-if="voyageData?.objets_autorises" class="text-[11px] font-extrabold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 px-2.5 py-0.5 rounded-full">
            ✓ {{ t('booking.step1.routeRequirements') }}
          </span>
        </div>

        <div class="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          <button
            v-for="type in packageTypes"
            :key="type.id"
            type="button"
            @click="selectedType = type.id"
            :class="[
              'p-3.5 rounded-2xl border text-left flex items-center gap-3 transition-all cursor-pointer shadow-2xs',
              selectedType === type.id
                ? 'border-[#074C72] dark:border-sky-400 bg-white dark:bg-slate-800 ring-2 ring-[#074C72]/20 dark:ring-sky-400/20 font-bold text-[#074C72] dark:text-sky-300 shadow-xs'
                : 'border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800/80 hover:border-gray-300 dark:hover:border-slate-600 text-gray-600 dark:text-slate-300 font-medium'
            ]"
          >
            <span class="text-xl shrink-0">{{ type.icon }}</span>
            <span class="text-xs sm:text-sm font-semibold truncate">{{ type.label }}</span>
          </button>
        </div>

        <!-- Tariff notice box for electronic item vs standard -->
        <div v-if="isElectronic" class="bg-blue-50 dark:bg-sky-950/40 border border-blue-200 dark:border-sky-800/80 rounded-2xl p-3.5 flex items-center gap-3 text-xs text-[#053754] dark:text-sky-200">
          <span class="text-xl">📱</span>
          <div>
            <div class="font-extrabold text-[#074C72] dark:text-sky-300">{{ t('booking.step1.electronicNoticeTitle') }}</div>
            <div class="text-[11px] text-gray-600 dark:text-slate-300 font-medium">{{ t('booking.step1.electronicNoticeText') }} <strong class="text-[#B50302] dark:text-rose-400">{{ unitPriceObjet.toLocaleString() }} {{ devise }} / objet</strong></div>
          </div>
        </div>
      </div>

      <!-- Photo du contenu du colis * -->
      <div class="space-y-2.5">
        <label class="block text-xs font-bold text-[#074C72] dark:text-sky-300">
          {{ t('booking.step1.photoLabel') }} <span class="text-[#B50302] dark:text-rose-400">*</span>
        </label>
        
        <div class="border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-800/60 rounded-2xl p-5 flex items-center gap-5">
          <!-- Square Image Container -->
          <div class="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-[#EAEFF4] dark:bg-slate-900 border border-gray-200/80 dark:border-slate-700 flex items-center justify-center shrink-0 overflow-hidden relative">
            <img v-if="previewImage" :src="previewImage" alt="Colis preview" class="w-full h-full object-cover" />
            <svg v-else class="w-10 h-10 text-gray-400 dark:text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>

          <!-- Right Side Controls -->
          <div class="space-y-3 flex-1">
            <p class="text-xs text-gray-500 dark:text-slate-400 font-medium italic">
              {{ t('booking.step1.photoImportHint') }}
            </p>
            <div>
              <label class="inline-block px-5 py-2.5 rounded-xl border border-[#B50302] dark:border-rose-500 bg-white dark:bg-slate-800 text-[#B50302] dark:text-rose-400 hover:bg-red-50 dark:hover:bg-rose-950/30 text-xs sm:text-sm font-bold transition-colors cursor-pointer shadow-2xs">
                <span>{{ t('booking.step1.chooseFileBtn') }}</span>
                <input type="file" accept="image/*" class="hidden" @change="handleFileChange" />
              </label>
            </div>
            <p v-if="fileName" class="text-[11px] text-gray-600 dark:text-slate-300 font-semibold truncate">
              {{ fileName }}
            </p>
          </div>
        </div>
      </div>

      <!-- Description précise du contenu * -->
      <div class="space-y-2">
        <label class="block text-xs font-bold text-[#074C72] dark:text-sky-300">
          {{ t('booking.step1.descLabel') }} <span class="text-[#B50302] dark:text-rose-400">*</span>
        </label>
        <textarea
          v-model="description"
          rows="3"
          :placeholder="t('booking.step1.descPlaceholder')"
          class="w-full p-3.5 text-xs sm:text-sm bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-700 text-gray-800 dark:text-slate-100 rounded-2xl outline-none focus:border-[#074C72] dark:focus:border-sky-400 focus:ring-2 focus:ring-[#074C72]/20 font-medium placeholder-gray-400 dark:placeholder-slate-500"
        ></textarea>
      </div>

      <!-- Valeur estimée & Fragile Row -->
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div class="space-y-2">
          <label class="block text-xs font-bold text-[#074C72] dark:text-sky-300">
            {{ t('booking.step1.estimatedValueLabel') }} ({{ devise }})
          </label>
          <input
            v-model="estimatedValue"
            type="number"
            placeholder="25000"
            class="w-full px-4 py-3 text-xs sm:text-sm bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-700 text-principal-dark dark:text-slate-100 rounded-xl outline-none focus:border-[#074C72] dark:focus:border-sky-400 focus:ring-2 focus:ring-[#074C72]/20 font-bold"
          />
        </div>

        <div class="space-y-2 flex flex-col justify-end">
          <label class="block text-xs font-bold text-[#074C72] dark:text-sky-300">{{ t('booking.step1.natureLabel') }}</label>
          <button
            type="button"
            @click="estFragile = !estFragile"
            :class="[
              'w-full py-3 px-4 rounded-xl border font-bold text-xs flex items-center justify-between transition-all cursor-pointer',
              estFragile ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-300 dark:border-amber-700 text-amber-900 dark:text-amber-200 ring-2 ring-amber-400/20' : 'bg-gray-50 dark:bg-slate-800 border-gray-200 dark:border-slate-700 text-gray-600 dark:text-slate-300'
            ]"
          >
            <span class="flex items-center gap-2">
              <span>⚠️</span>
              <span>{{ t('booking.step1.fragileLabel') }}</span>
            </span>
            <span class="text-xs font-extrabold uppercase">{{ estFragile ? t('common.yes') : t('common.no') }}</span>
          </button>
        </div>
      </div>

      <!-- Poids estimé(Kg) Slider (Standard items only) -->
      <div v-if="!isElectronic" class="bg-gray-50 dark:bg-slate-800/80 rounded-2xl p-5 border border-gray-200 dark:border-slate-700 space-y-3">
        <div class="flex items-center justify-between">
          <div>
            <div class="text-sm font-bold text-[#074C72] dark:text-sky-300">{{ t('booking.step1.weightLabel') }}</div>
            <div class="text-[11px] text-gray-400 dark:text-slate-400 font-medium italic">{{ t('booking.step1.weightCertHint') }}</div>
          </div>
          <div class="text-lg font-black text-[#074C72] dark:text-sky-300">
            {{ weightKg }} Kg
          </div>
        </div>

        <!-- Slider Range Input -->
        <input
          v-model.number="weightKg"
          type="range"
          min="0.5"
          :max="maxWeight"
          step="0.5"
          class="w-full accent-[#B50302] cursor-pointer"
        />

        <div class="flex items-center justify-between text-xs pt-1">
          <span class="text-[#FF9F02] dark:text-amber-300 bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800 px-3 py-1 rounded-full text-[11px] font-extrabold">
            1 Kg = {{ formattedUnitPriceKg }}
          </span>
          <span v-if="voyageData" class="text-gray-500 dark:text-slate-400 font-bold text-[11px]">
            {{ t('booking.step1.capacityAvailable') }} {{ voyageData.capacite_dispo || voyageData.capacite_totale }} Kg
          </span>
        </div>
      </div>

      <!-- Electronic Object Tariff Banner (Electronic items) -->
      <div v-else class="bg-sky-50/70 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-800/80 rounded-2xl p-5 space-y-2 shadow-2xs">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2 text-sm font-bold text-[#074C72] dark:text-sky-300">
            <span class="text-lg">📱</span>
            <span>{{ t('booking.step1.electronicFlatTariff') }}</span>
          </div>
          <span class="text-xs font-black text-[#B50302] dark:text-rose-400 bg-white dark:bg-slate-800 px-3 py-1 rounded-full border border-red-200 dark:border-rose-900 shadow-2xs">
            {{ formattedUnitPriceObjet }} / objet
          </span>
        </div>
        <p class="text-xs text-gray-600 dark:text-slate-300 font-medium leading-relaxed">
          {{ t('booking.step1.electronicFlatNotice') }}
        </p>
      </div>

    </div>

    <!-- Bottom Price Bar & Submit CTA -->
    <div class="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 rounded-2xl border shadow-xs">
      <div class="space-y-0.5">
        <div class="text-xs text-gray-500 dark:text-slate-400 font-medium">{{ t('booking.step1.totalEstimatedPrice') }}</div>
        <div class="text-sm sm:text-base font-extrabold text-[#B50302] dark:text-rose-400">
          <template v-if="isElectronic">
            1 {{ t('booking.step1.electronicFlatTariff') }} = {{ formattedTotalPrice }}
          </template>
          <template v-else>
            {{ weightKg }} Kg × {{ formattedUnitPriceKg }} = {{ formattedTotalPrice }}
          </template>
        </div>
      </div>

      <button
        @click="goToStep2"
        type="button"
        class="bg-[#B50302] hover:bg-[#870202] text-white font-extrabold text-xs sm:text-sm px-7 py-3.5 rounded-xl shadow-md transition-all cursor-pointer active:scale-[0.99]"
      >
        {{ t('booking.step1.continueBtn') }}
      </button>
    </div>

  </div>
</template>
