<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const trackingSteps = ref([
  {
    id: 1,
    title: 'Demande acceptée',
    subtitle: 'Votre réservation a été confirmée',
    time: 'Aujourd\'hui, 12:00',
    status: 'completed' // 'completed' | 'current' | 'upcoming'
  },
  {
    id: 2,
    title: 'Colis déposé',
    subtitle: 'À déposer au point de relais',
    time: 'À venir',
    status: 'upcoming'
  },
  {
    id: 3,
    title: 'En cours d\'acheminement',
    subtitle: 'Acheminement Dakar - Paris',
    time: 'À venir',
    status: 'upcoming'
  },
  {
    id: 4,
    title: 'Arrivé à destination',
    subtitle: 'Arrivée à Paris',
    time: 'À venir',
    status: 'upcoming'
  },
  {
    id: 5,
    title: 'Livré',
    subtitle: 'Remise à Mariama Diallo',
    time: 'À venir',
    status: 'upcoming'
  }
])

const goToChat = () => {
  router.push('/client/messages/1')
}

const openMap = (location) => {
  window.open(`https://maps.google.com/?q=${encodeURIComponent(location)}`, '_blank')
}
</script>

<template>
  <div class="space-y-5 pb-16">
    
    <!-- Top Summary Container (Dark Blue Card) -->
    <div class="bg-[#053754] text-white rounded-2xl p-5 shadow-lg space-y-4 relative overflow-hidden">
      <!-- Weight Badge Top Left -->
      <div>
        <span class="inline-flex items-center gap-1.5 bg-white/10 backdrop-blur-md px-3.5 py-1 rounded-full text-xs font-extrabold text-sky-100 border border-white/10">
          <span>📦</span>
          <span>Colis de 6 Kg</span>
        </span>
      </div>

      <!-- Route Graphics & Flags -->
      <div class="flex items-center justify-between px-2 pt-1">
        <!-- Departure -->
        <div class="space-y-0.5">
          <span class="text-xl">🇸🇳</span>
          <h3 class="text-lg font-extrabold leading-tight">Dakar</h3>
          <p class="text-xs text-sky-200">Sénégal</p>
        </div>

        <!-- Flight Path Graphic -->
        <div class="flex-1 max-w-[160px] sm:max-w-[220px] px-2 flex items-center justify-center">
          <div class="w-full flex items-center gap-1">
            <span class="w-2.5 h-2.5 rounded-full bg-red-500 shrink-0"></span>
            <div class="flex-1 border-t-2 border-dashed border-red-400"></div>
            <div class="bg-[#053754] px-1 transform -rotate-12">
              <span class="text-red-500 text-sm font-bold">✈</span>
            </div>
            <div class="flex-1 border-t-2 border-dashed border-amber-400"></div>
            <span class="w-2.5 h-2.5 rounded-full bg-amber-400 shrink-0"></span>
          </div>
        </div>

        <!-- Destination -->
        <div class="space-y-0.5 text-right">
          <span class="text-xl">🇫🇷</span>
          <h3 class="text-lg font-extrabold leading-tight">Paris</h3>
          <p class="text-xs text-sky-200">France</p>
        </div>
      </div>

      <!-- Recipient Bottom Row -->
      <div class="border-t border-sky-800/80 pt-3 flex items-center justify-between text-xs sm:text-sm font-semibold">
        <span class="text-sky-200">Destinataire : <strong class="text-white font-extrabold">Mariama Diallo</strong></span>
        <span class="text-sky-100 font-mono font-bold">33 6 23 34 56 78</span>
      </div>
    </div>

    <!-- Transporteur Card -->
    <div class="bg-white rounded-2xl p-4 border border-gray-200 shadow-2xs space-y-2">
      <span class="text-xs text-gray-400 font-medium block">Transporteur</span>
      
      <div class="flex items-center justify-between gap-3">
        <!-- Transporter Info -->
        <div class="flex items-center gap-3">
          <div class="w-12 h-12 rounded-full bg-[#053754] text-white flex items-center justify-center font-extrabold text-xs shrink-0 shadow-xs">
            RGP
          </div>

          <div class="space-y-0.5">
            <h3 class="text-sm font-extrabold text-[#053754]">Rahma Gp Express</h3>
            <div class="flex items-center gap-2 text-xs">
              <span class="flex items-center gap-1 font-bold text-amber-500">
                ⭐ 4.9
              </span>
              <span class="text-gray-400 font-medium flex items-center gap-0.5 hover:underline cursor-pointer">
                32 avis ➔
              </span>
            </div>
          </div>
        </div>

        <!-- Discuter Button -->
        <button
          @click="goToChat"
          type="button"
          class="bg-[#B50302] hover:bg-[#8B0000] text-white font-extrabold text-xs px-4 py-2.5 rounded-xl shadow-xs transition-colors cursor-pointer flex items-center gap-1.5 uppercase tracking-wider shrink-0"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
          DISCUTEZ
        </button>
      </div>
    </div>

    <!-- Historique et progression Section -->
    <div class="bg-white rounded-2xl p-5 border border-gray-200 shadow-2xs space-y-4">
      <div class="flex items-center gap-2 border-b border-gray-100 pb-3">
        <svg class="w-5 h-5 text-[#053754]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <h3 class="text-sm sm:text-base font-extrabold text-[#053754]">Historique et progression</h3>
      </div>

      <!-- Stepper Vertical Timeline -->
      <div class="relative pl-3 space-y-6 before:absolute before:left-5 before:top-3 before:bottom-3 before:w-0.5 before:bg-gray-200">
        <div
          v-for="step in trackingSteps"
          :key="step.id"
          class="relative flex items-start justify-between gap-4 group"
        >
          <!-- Timeline Indicator Icon -->
          <div class="relative z-10 flex items-center justify-center shrink-0">
            <div
              v-if="step.status === 'completed'"
              class="w-5 h-5 rounded-full bg-[#053754] text-white flex items-center justify-center text-[10px] font-bold ring-4 ring-sky-50 shadow-xs"
            >
              ✓
            </div>
            <div
              v-else
              class="w-5 h-5 rounded-full bg-white border-2 border-gray-300 flex items-center justify-center"
            >
              <div class="w-1.5 h-1.5 rounded-full bg-gray-300"></div>
            </div>
          </div>

          <!-- Step Content -->
          <div class="flex-1 min-w-0 -mt-0.5">
            <h4
              class="text-xs sm:text-sm font-extrabold leading-tight"
              :class="step.status === 'completed' ? 'text-[#053754]' : 'text-gray-600'"
            >
              {{ step.title }}
            </h4>
            <p class="text-[11px] text-gray-400 font-medium mt-0.5">
              {{ step.subtitle }}
            </p>
          </div>

          <!-- Step Time -->
          <span
            class="text-[11px] font-medium shrink-0"
            :class="step.status === 'completed' ? 'text-gray-500 font-semibold' : 'text-gray-300'"
          >
            {{ step.time }}
          </span>
        </div>
      </div>
    </div>

    <!-- Point de Dépôt Card ("Où déposer mon colis ?") -->
    <div class="bg-white rounded-2xl p-4 border border-gray-200 shadow-2xs space-y-3">
      <span class="text-xs text-gray-400 font-medium block">Où déposer mon colis ?</span>

      <div class="flex items-start gap-2.5">
        <span class="text-red-600 text-lg">📍</span>
        <div class="space-y-0.5">
          <h4 class="text-xs sm:text-sm font-extrabold text-[#053754]">Parcelles Assainies, Dakar</h4>
          <p class="text-xs text-gray-500">
            Horaires de dépôt : <span class="font-extrabold text-[#053754]">Lun - Ven: 09h00 - 18h00</span>
          </p>
        </div>
      </div>

      <button
        @click="openMap('Parcelles Assainies, Dakar')"
        type="button"
        class="w-full bg-red-50 hover:bg-red-100 text-[#B50302] border border-red-100 font-extrabold text-xs py-3 rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-2"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 20l-5-4V4l5 4m0 0l6-4 6 4v12l-6-4m-6 4V8m6 12V8" />
        </svg>
        <span>Voir l'itinéraire</span>
      </button>
    </div>

    <!-- Point de Retrait Card ("Où retirer le colis à destination ?") -->
    <div class="bg-white rounded-2xl p-4 border border-gray-200 shadow-2xs space-y-3">
      <span class="text-xs text-gray-400 font-medium block">Où retirer le colis à destination ?</span>

      <div class="flex items-start gap-2.5">
        <span class="text-red-600 text-lg">📍</span>
        <div class="space-y-0.5">
          <h4 class="text-xs sm:text-sm font-extrabold text-[#053754]">Agence Paris 10ème (Gare du Nord)</h4>
          <p class="text-xs text-gray-500">
            Horaires de dépôt : <span class="font-extrabold text-[#053754]">Lun - Ven: 09h00 - 18h00</span>
          </p>
        </div>
      </div>

      <button
        @click="openMap('Gare du Nord, Paris')"
        type="button"
        class="w-full bg-red-50 hover:bg-red-100 text-[#B50302] border border-red-100 font-extrabold text-xs py-3 rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-2"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 20l-5-4V4l5 4m0 0l6-4 6 4v12l-6-4m-6 4V8m6 12V8" />
        </svg>
        <span>Voir l'itinéraire</span>
      </button>
    </div>

  </div>
</template>
