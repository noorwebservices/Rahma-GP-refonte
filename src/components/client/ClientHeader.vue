<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { headerState } from '@/utils/headerState'
import CountryFlag from '@/components/common/CountryFlag.vue'
import { useAuth } from '@/composables/useAuth'
import NotificationModal from '@/components/common/NotificationModal.vue'
import { fetchUnreadNotificationsCount } from '@/services/notificationService'
import { currentCurrency, availableCurrencies, setCurrency } from '@/utils/currencyState'
import ThemeToggle from '@/components/common/ThemeToggle.vue'
import LanguageToggle from '@/components/common/LanguageToggle.vue'
import { useI18n } from '@/composables/useI18n'

const { t, te } = useI18n()

const titleMap = {
  'Mes Revenus GP': 'headers.myRevenues',
  'Avis & Évaluations': 'headers.reviews',
  'Avis et Évaluations': 'headers.reviews',
  'Détails de la demande': 'headers.requestDetails',
  'Publier un voyage': 'headers.publishTrip',
  'Modifier le voyage': 'headers.editTrip',
  'Suivi de livraison': 'headers.deliveryTracking'
}

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
let notifTimer = null

const loadUnreadCount = async () => {
  const token = localStorage.getItem('rahma_token')
  if (!token) {
    unreadNotifCount.value = 0
    return
  }
  try {
    const res = await fetchUnreadNotificationsCount()
    if (res && (res.unread_count !== undefined || res.data?.unread_count !== undefined)) {
      unreadNotifCount.value = Number(res.unread_count ?? res.data?.unread_count ?? 0)
    }
  } catch (e) {
    // silent
  }
}

onMounted(() => {
  if (isAuthenticated.value) {
    loadUnreadCount()
  }
  notifTimer = setInterval(() => {
    if (isAuthenticated.value) {
      loadUnreadCount()
    }
  }, 15000)
})

onUnmounted(() => {
  if (notifTimer) clearInterval(notifTimer)
})

watch(() => route.path, loadUnreadCount)
watch(isAuthenticated, (val) => {
  if (val) loadUnreadCount()
})

const headerTitle = computed(() => {
  const raw = props.title || headerState.title || route.meta?.headerTitleKey || route.meta?.headerTitle || ''
  if (!raw) return ''
  if (te(raw)) return t(raw)
  if (titleMap[raw]) return t(titleMap[raw])
  return raw
})

const headerSubtitle = computed(() => {
  const raw = headerState.subtitle || route.meta?.headerSubtitle || ''
  if (!raw) return ''
  if (te(raw)) return t(raw)
  return raw
})

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
  <header class="w-full bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-800 sticky top-0 z-40 shadow-2xs transition-colors duration-300">
    
    <!-- Top Bar Header (Logo, Language & Currency Switcher, Auth / Notification Bell) -->
    <div class="w-full py-2.5 px-4 sm:px-6 bg-white dark:bg-slate-900 transition-colors duration-300">
      <div class="max-w-4xl mx-auto flex items-center justify-between gap-3">
        <!-- Logo Rahma Delivery -->
        <router-link to="/client" class="flex items-center">
          <img src="@/assets/images/logo-rouge.svg" alt="Rahma Delivery" class="h-8 sm:h-9 w-auto object-contain" />
        </router-link>

        <!-- Right Action Badges -->
        <div class="flex items-center gap-1.5 sm:gap-2">
          <!-- Theme Toggle Button -->
          <ThemeToggle variant="pill" />

          <!-- Currency Switcher Pill -->
          <div class="flex items-center gap-1 bg-[#F3F4F6] dark:bg-slate-800 border border-gray-200 dark:border-slate-700 px-2.5 py-1 rounded-full text-xs font-extrabold text-gray-700 dark:text-slate-200">
            <span>💱</span>
            <select
              :value="currentCurrency"
              @change="setCurrency($event.target.value)"
              class="bg-transparent border-none text-xs font-extrabold text-[#053754] dark:text-sky-300 outline-none cursor-pointer p-0"
            >
              <option v-for="c in availableCurrencies" :key="c.code" :value="c.code" class="dark:bg-slate-800 text-slate-800 dark:text-slate-100">
                {{ c.code }}
              </option>
            </select>
          </div>

          <!-- Language Switcher Pill -->
          <LanguageToggle variant="pill" />

          <!-- Notification Bell (If Authenticated) -->
          <button
            v-if="isAuthenticated"
            @click="showNotifModal = true"
            type="button"
            class="w-9 h-9 rounded-full bg-[#F3F4F6] dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 flex items-center justify-center text-gray-600 dark:text-gray-300 relative transition-colors cursor-pointer"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            <span
              v-if="unreadNotifCount > 0"
              class="absolute -top-1 -right-1 bg-[#B50302] text-white text-[10px] font-black rounded-full min-w-4.5 h-4.5 px-1 flex items-center justify-center border-2 border-white dark:border-slate-900"
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
    <div v-if="showBack" class="w-full py-2.5 px-4 sm:px-6 border-t border-gray-100 dark:border-slate-800 bg-white dark:bg-slate-900 sticky top-[53px] z-30 transition-colors duration-300">
      <div class="max-w-4xl mx-auto flex items-center relative min-h-[36px]">
        
        <!-- Back Arrow Icon Button (Stays on Far Left) -->
        <button
          @click="goBack"
          class="w-9 h-9 rounded-full bg-[#F3F4F6] dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 flex items-center justify-center text-gray-700 dark:text-gray-200 transition-colors cursor-pointer shrink-0 absolute left-0"
        >
          <svg class="w-5 h-5 text-gray-700 dark:text-gray-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
        </button>

        <!-- Custom Header Title -->
        <div v-if="headerTitle" class="flex flex-col items-center justify-center mx-auto text-center">
          <h2 class="text-sm sm:text-base font-extrabold text-[#074C72] dark:text-sky-300 leading-tight">{{ headerTitle }}</h2>
          <div v-if="headerSubtitle" class="text-xs font-bold text-[#074C72] dark:text-sky-300 flex items-center gap-1">
            <span class="text-sm">📦</span>
            <span>{{ headerSubtitle }}</span>
          </div>
        </div>

        <!-- Route Display CENTERED (Dynamic Route with Flags) -->
        <div v-else class="flex items-center justify-center gap-2 text-sm sm:text-base font-extrabold text-[#074C72] dark:text-sky-300 mx-auto">
          <div class="flex items-center gap-1.5">
            <CountryFlag :city="displayFrom" :country="headerState.countryFrom" size="w-5 h-3.5" />
            <span>{{ displayFrom }}</span>
          </div>

          <!-- Circle Arrow Icon -->
          <div class="w-6 h-6 rounded-full border-2 border-[#074C72] dark:border-sky-300 text-[#074C72] dark:text-sky-300 flex items-center justify-center shrink-0">
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
