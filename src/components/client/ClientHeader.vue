<script setup>
import { computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'

const props = defineProps({
  showBack: {
    type: Boolean,
    default: false
  },
  title: {
    type: String,
    default: ''
  },
  routeFrom: {
    type: String,
    default: 'Dakar'
  },
  routeTo: {
    type: String,
    default: 'Paris'
  }
})

const router = useRouter()
const route = useRoute()

const headerTitle = computed(() => props.title || route.meta?.headerTitle || '')
const headerSubtitle = computed(() => route.meta?.headerSubtitle || '')

const goBack = () => {
  router.back()
}
</script>

<template>
  <header class="w-full bg-white border-b border-gray-200 sticky top-0 z-40 shadow-2xs">
    
    <!-- Top Bar Header (Logo, Language FR Badge & Notification Bell) - Fixed/Sticky on all pages -->
    <div class="w-full py-2.5 px-4 sm:px-6 bg-white">
      <div class="max-w-4xl mx-auto flex items-center justify-between gap-3">
        <!-- Logo Rahma Delivery -->
        <router-link to="/client" class="flex items-center">
          <img src="@/assets/images/logo-rouge.svg" alt="Rahma Delivery" class="h-8 sm:h-9 w-auto object-contain" />
        </router-link>

        <!-- Right Action Badges -->
        <div class="flex items-center gap-2.5">
          <!-- Language Switcher Pill (FR) -->
          <div class="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#F3F4F6] border border-gray-200 text-xs font-extrabold text-gray-700">
            <span class="w-4 h-4 rounded-full overflow-hidden flex items-center justify-center text-[10px] shrink-0">🇫🇷</span>
            <span>FR</span>
          </div>

          <!-- Notification Bell -->
          <button class="w-9 h-9 rounded-full bg-[#F3F4F6] hover:bg-gray-200 flex items-center justify-center text-gray-600 relative transition-colors cursor-pointer">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
          </button>
        </div>
      </div>
    </div>

    <!-- Sub-Header Row: Back Arrow (Left) + Route/Title Bar (CENTERED) -->
    <div v-if="showBack" class="w-full py-2.5 px-4 sm:px-6 border-t border-gray-100 bg-white sticky top-[53px] z-30">
      <div class="max-w-4xl mx-auto flex items-center relative min-h-[36px]">
        
        <!-- Back Arrow Icon Button (Stays on Far Left) -->
        <button
          @click="goBack"
          class="w-9 h-9 rounded-full bg-[#F3F4F6] hover:bg-gray-200 flex items-center justify-center text-gray-700 transition-colors cursor-pointer shrink-0 absolute left-0"
        >
          <svg class="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
        </button>

        <!-- Custom Header Title (e.g. Suivi de livraison / #RS-7729) -->
        <div v-if="headerTitle" class="flex flex-col items-center justify-center mx-auto text-center">
          <h2 class="text-sm sm:text-base font-extrabold text-[#074C72] leading-tight">{{ headerTitle }}</h2>
          <div v-if="headerSubtitle" class="text-xs font-bold text-[#074C72] flex items-center gap-1">
            <span class="text-sm">📦</span>
            <span>{{ headerSubtitle }}</span>
          </div>
        </div>

        <!-- Route Display CENTERED (Dakar -> Paris) -->
        <div v-else class="flex items-center justify-center gap-3 text-sm sm:text-base font-extrabold text-[#074C72] mx-auto">
          <span class="flex items-center gap-1.5">
            <span class="text-lg">🇸🇳</span>
            <span>{{ routeFrom }}</span>
          </span>

          <!-- Circle Arrow Icon -->
          <div class="w-6 h-6 rounded-full border-2 border-[#074C72] text-[#074C72] flex items-center justify-center shrink-0">
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </div>

          <span class="flex items-center gap-1.5">
            <span class="text-lg">🇫🇷</span>
            <span>{{ routeTo }}</span>
          </span>
        </div>

      </div>
    </div>

  </header>
</template>
