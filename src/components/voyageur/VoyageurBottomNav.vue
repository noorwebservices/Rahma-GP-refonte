<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from '@/composables/useI18n'
import { fetchUnreadMessagesCount } from '@/services/messageService'

const route = useRoute()
const router = useRouter()
const { t } = useI18n()

const unreadMsgCount = ref(0)
let timer = null

const loadUnreadMsgCount = async () => {
  const token = localStorage.getItem('rahma_token') || localStorage.getItem('token')
  if (!token) {
    unreadMsgCount.value = 0
    return
  }
  try {
    const res = await fetchUnreadMessagesCount()
    const count = res?.unread_count ?? res?.data?.unread_count ?? 0
    unreadMsgCount.value = Number(count)
  } catch (e) {
    // silent
  }
}

onMounted(() => {
  loadUnreadMsgCount()
  timer = setInterval(loadUnreadMsgCount, 15000)
})

onUnmounted(() => {
  if (timer) clearInterval(timer)
})

watch(() => route.path, loadUnreadMsgCount)

const activeTab = computed(() => {
  const path = route.path
  if (path.includes('/voyageur/demandes')) return 'demandes'
  if (path.includes('/voyageur/messages')) return 'messages'
  if (path.includes('/voyageur/profil') || path.includes('/profile')) return 'profil'
  return 'voyages'
})

const tabs = computed(() => [
  {
    id: 'voyages',
    label: t('voyageurNav.voyages'),
    path: '/voyageur',
    icon: 'M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L14 19v-5.5l8 2.5z'
  },
  {
    id: 'demandes',
    label: t('voyageurNav.demandes'),
    path: '/voyageur/demandes',
    icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01'
  },
  {
    id: 'messages',
    label: t('voyageurNav.messages'),
    path: '/voyageur/messages',
    icon: 'M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z'
  },
  {
    id: 'profil',
    label: t('voyageurNav.profil'),
    path: '/profile',
    icon: 'M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z'
  }
])

const navigateTo = (path) => {
  router.push(path)
}
</script>

<template>
  <nav class="fixed bottom-0 left-0 right-0 z-50 bg-[#053754] dark:bg-slate-900 text-white py-2 px-6 shadow-2xl border-t border-white/10 dark:border-slate-800 overflow-visible transition-colors duration-300">
    <div class="max-w-md mx-auto flex items-center justify-between relative overflow-visible">
      <button
        v-for="tab in tabs"
        :key="tab.id"
        @click="navigateTo(tab.path)"
        class="flex flex-col items-center justify-end transition-all cursor-pointer relative min-w-[64px]"
      >
        <!-- Elevated circle for active tab -->
        <div
          :class="[
            'w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 shrink-0 relative',
            activeTab === tab.id
              ? 'bg-[#053754] dark:bg-slate-900 ring-[6px] ring-[#FAF7F2] dark:ring-slate-950 -translate-y-7 text-white shadow-2xl scale-110'
              : 'text-white/70 hover:text-white'
          ]"
        >
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" :d="tab.icon" />
          </svg>

          <!-- Unread Messages Badge -->
          <span
            v-if="tab.id === 'messages' && unreadMsgCount > 0"
            class="absolute -top-1 -right-1 bg-[#B50302] text-white text-[10px] font-black rounded-full min-w-4.5 h-4.5 px-1 flex items-center justify-center border-2 border-white dark:border-slate-900 shadow-sm"
          >
            {{ unreadMsgCount > 99 ? '99+' : unreadMsgCount }}
          </span>
        </div>

        <span
          :class="[
            'text-[11px] font-semibold tracking-wide transition-colors',
            activeTab === tab.id ? 'text-white font-bold -mt-4 pb-0.5' : 'text-white/70'
          ]"
        >
          {{ tab.label }}
        </span>
      </button>
    </div>
  </nav>
</template>
