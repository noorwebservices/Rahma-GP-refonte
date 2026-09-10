<script setup>
import { useRouter } from 'vue-router'

const props = defineProps({
  voyage: {
    type: Object,
    required: true
  }
})

const router = useRouter()

const goToDetail = () => {
  router.push(`/client/voyage/${props.voyage.id || 1}`)
}
</script>

<template>
  <div class="bg-white rounded-3xl p-5 border border-gray-200/80 shadow-md hover:shadow-lg transition-all space-y-3.5 relative overflow-hidden">
    
    <!-- Top Row: Badge Recommandé / Entreprise GP -->
    <div class="flex items-center justify-between">
      <div></div>
      <span
        v-if="voyage.recommande"
        class="bg-[#FFF4E5] text-[#D97706] text-[11px] font-extrabold px-3 py-1 rounded-full shadow-2xs"
      >
        Recommandé
      </span>
      <span
        v-else-if="voyage.badge"
        class="bg-emerald-50 text-emerald-700 text-[11px] font-extrabold px-3 py-1 rounded-full border border-emerald-200"
      >
        {{ voyage.badge }}
      </span>
    </div>

    <!-- Route Visual: Dakar ─── ✈️ ─── Paris -->
    <div class="flex items-center justify-between text-base sm:text-lg font-black text-principal-dark px-1">
      <div class="flex items-center gap-2">
        <span class="text-xl">🇸🇳</span>
        <span>{{ voyage.depart || 'Dakar' }}</span>
      </div>

      <!-- Dotted Line & Airplane -->
      <div class="flex-1 flex items-center justify-center px-4 relative">
        <div class="w-full border-b-2 border-gray-300 border-dashed"></div>
        <div class="absolute bg-white px-2 text-[#D94132] font-bold text-sm">
          ✈️
        </div>
      </div>

      <div class="flex items-center gap-2">
        <span class="text-xl">🇫🇷</span>
        <span>{{ voyage.destination || 'Paris' }}</span>
      </div>
    </div>

    <!-- Info Row: Date & Entreprise Badge -->
    <div class="flex items-center justify-between text-xs font-semibold text-gray-600 gap-2">
      <div class="bg-gray-100 px-3 py-1.5 rounded-xl flex items-center gap-2">
        <svg class="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        <span>{{ voyage.date || '18 Septembre 2026' }}</span>
      </div>

      <div class="bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded-xl border border-emerald-200 flex items-center gap-1.5 font-bold">
        <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
        <span>{{ voyage.type_transporteur || 'Entreprise GP' }}</span>
      </div>
    </div>

    <!-- Weight Capacity Progress Bar Card -->
    <div class="bg-gray-50 p-3 rounded-2xl border border-gray-100 space-y-1.5">
      <div class="flex items-center justify-between text-xs font-bold">
        <span class="text-gray-700 flex items-center gap-1.5">
          <span class="text-sm">⚖️</span>
          <span>{{ voyage.poids_disponible || '15Kg' }} disponible</span>
        </span>
        <span class="text-gray-400 font-medium text-[11px]">total {{ voyage.poids_total || '25kg' }}</span>
      </div>
      <!-- Progress Track -->
      <div class="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
        <div
          class="h-full bg-[#BD0A0A] rounded-full transition-all"
          :style="{ width: `${((voyage.poids_total - voyage.poids_disponible) / voyage.poids_total) * 100 || 40}%` }"
        ></div>
      </div>
    </div>

    <!-- Location Row -->
    <div class="flex items-center gap-2 text-xs text-gray-500 font-medium pt-1">
      <svg class="w-4 h-4 text-gray-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
      <span>Point de collecte :</span>
      <span class="font-bold text-gray-700">{{ voyage.point_collecte || 'Parcelle unité 26' }}</span>
    </div>

    <!-- Bottom Transporter & Action Row -->
    <div class="flex items-center justify-between pt-2 border-t border-gray-100">
      <!-- Transporter Avatar + Name + Rating -->
      <div class="flex items-center gap-2.5">
        <div class="w-10 h-10 rounded-full bg-[#BD0A0A] text-white font-black text-xs flex items-center justify-center shadow-xs shrink-0">
          RGP
        </div>
        <div>
          <div class="text-xs sm:text-sm font-bold text-principal-dark">
            {{ voyage.transporteur_nom || 'Rahma Gp Express' }}
          </div>
          <div class="text-xs text-amber-500 font-extrabold flex items-center gap-1">
            <span>★</span>
            <span>{{ voyage.note || '4.9' }}</span>
          </div>
        </div>
      </div>

      <!-- Price & Eye Button -->
      <div class="flex items-center gap-2">
        <div class="text-right">
          <div class="text-sm sm:text-base font-black text-principal-dark">
            {{ voyage.prix || '5 500' }} FCFA/Kg
          </div>
        </div>
        <button
          @click="goToDetail"
          class="w-9 h-9 rounded-full bg-red-50 hover:bg-red-100 text-[#BD0A0A] flex items-center justify-center transition-colors cursor-pointer shrink-0 border border-red-100"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
        </button>
      </div>

    </div>

  </div>
</template>
