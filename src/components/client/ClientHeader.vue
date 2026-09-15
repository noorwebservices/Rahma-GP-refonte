<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { headerState } from '@/utils/headerState'
import CountryFlag from '@/components/common/CountryFlag.vue'
import NotificationModal from '@/components/common/NotificationModal.vue'
import { fetchUnreadNotificationsCount } from '@/services/notificationService'
import { currentCurrency, availableCurrencies, setCurrency } from '@/utils/currencyState'
import { useAuth } from '@/composables/useAuth'

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
    default: ''
  },
  routeTo: {
    type: String,
    default: ''
  }
})

const router = useRouter()
const route = useRoute()
const { isAuthenticated } = useAuth()
const unreadNotifCount = ref(0)
const showNotifModal = ref(false)

const loadUnreadCount = async () => {
  if (!isAuthenticated.value) return
  try {
    const res = await fetchUnreadNotificationsCount()
    if (res && (res.unread_count !== undefined || res.data?.unread_count !== undefined)) {
      unreadNotifCount.value = Number(res.unread_count ?? res.data?.unread_count ?? 0)
    }
  } catch (e) {
    unreadNotifCount.value = 0
  }
}

onMounted(loadUnreadCount)

const headerTitle = computed(() => props.title || headerState.title || route.meta?.headerTitle || '')
const headerSubtitle = computed(() => headerState.subtitle || route.meta?.headerSubtitle || '')

const displayFrom = computed(() => headerState.routeFrom || props.routeFrom || 'Dakar')
const displayTo = computed(() => headerState.routeTo || props.routeTo || 'Paris')

const goBack = () => {
  router.back()
}

const goToMessages = () => {
  router.push('/client/messages')
}
</script>

<template>
  <header class="w-full bg-white border-b border-gray-200 sticky top-0 z-40 shadow-2xs">
    
    <!-- Top Bar Header (Logo, Language & Currency Switcher, Auth / Notification Bell) -->
    <div class="w-full py-2.5 px-4 sm:px-6 bg-white">
      <div class="max-w-4xl mx-auto flex items-center justify-between gap-3">
        <!-- Logo Rahma Delivery -->
        <router-link to="/client" class="flex items-center">
          <img src="@/assets/images/logo-rouge.svg" alt="Rahma Delivery" class="h-8 sm:h-9 w-auto object-contain" />
        </router-link>

        <!-- Right Action Badges -->
        <div class="flex items-center gap-2">
          <!-- Currency Switcher Pill -->
          <div class="flex items-center gap-1 bg-[#F3F4F6] border border-gray-200 px-2.5 py-1 rounded-full text-xs font-extrabold text-gray-700">
            <span>💱</span>
            <select
              :value="currentCurrency"
              @change="setCurrency($event.target.value)"
              class="bg-transparent border-none text-xs font-extrabold text-[#053754] outline-none cursor-pointer p-0"
            >
              <option v-for="c in availableCurrencies" :key="c.code" :value="c.code">
                {{ c.code }}
              </option>
            </select>
          </div>

          <!-- Language Switcher Pill (FR) -->
          <div class="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#F3F4F6] border border-gray-200 text-xs font-extrabold text-gray-700">
            <span class="w-4 h-4 rounded-full overflow-hidden flex items-center justify-center text-[10px] shrink-0">🇫🇷</span>
            <span>FR</span>
          </div>

          <!-- Notification Bell (If Authenticated) -->
          <button
            v-if="isAuthenticated"
            @click="showNotifModal = true"
            type="button"
            class="w-9 h-9 rounded-full bg-[#F3F4F6] hover:bg-gray-200 flex items-center justify-center text-gray-600 relative transition-colors cursor-pointer"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            <span
              v-if="unreadNotifCount > 0"
              class="absolute -top-1 -right-1 bg-[#B50302] text-white text-[10px] font-black rounded-full min-w-4.5 h-4.5 px-1 flex items-center justify-center border-2 border-white"
            >
              {{ unreadNotifCount }}
            </span>
          </button>

          <!-- Login Button (If Unauthenticated Visitor) -->
          <router-link
            v-else
            to="/auth/login"
            class="bg-[#053754] hover:bg-[#074C72] text-white text-xs font-extrabold px-3.5 py-1.5 rounded-full transition-colors flex items-center gap-1 shadow-2xs cursor-pointer"
          >
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
            </svg>
            <span>Connexion</span>
          </router-link>
        </div>
      </div>
    </div>

    <NotificationModal
      :is-open="showNotifModal"
      @close="showNotifModal = false"
      @refresh-count="loadUnreadCount"
    />

    <!-- Sub-Header Row: Back Arrow (Left) + Dynamic Route/Title Bar (CENTERED) -->
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

        <!-- Custom Header Title -->
        <div v-if="headerTitle" class="flex flex-col items-center justify-center mx-auto text-center">
          <h2 class="text-sm sm:text-base font-extrabold text-[#074C72] leading-tight">{{ headerTitle }}</h2>
          <div v-if="headerSubtitle" class="text-xs font-bold text-[#074C72] flex items-center gap-1">
            <span class="text-sm">📦</span>
            <span>{{ headerSubtitle }}</span>
          </div>
        </div>

        <!-- Route Display CENTERED (Dynamic Route with Flags) -->
        <div v-else class="flex items-center justify-center gap-2 text-sm sm:text-base font-extrabold text-[#074C72] mx-auto">
          <div class="flex items-center gap-1.5">
            <CountryFlag :city="displayFrom" :country="headerState.countryFrom" size="w-5 h-3.5" />
            <span>{{ displayFrom }}</span>
          </div>

          <!-- Circle Arrow Icon -->
          <div class="w-6 h-6 rounded-full border-2 border-[#074C72] text-[#074C72] flex items-center justify-center shrink-0">
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </div>

          <div class="flex items-center gap-1.5">
            <CountryFlag :city="displayTo" :country="headerState.countryTo" size="w-5 h-3.5" />
            <span>{{ displayTo }}</span>
          </div>
        </div>

      </div>
    </div>
  </header>
</template>
