<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()

const activeTab = computed(() => {
  const path = route.path
  if (path.includes('/client/messages')) return 'messages'
  if (path.includes('/client/colis')) return 'colis'
  if (path.includes('/profile')) return 'profil'
  return 'accueil'
})

const tabs = [
  {
    id: 'accueil',
    label: 'Accueil',
    path: '/client',
    icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6'
  },
  {
    id: 'messages',
    label: 'Messages',
    path: '/client/messages',
    icon: 'M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z'
  },
  {
    id: 'colis',
    label: 'Colis',
    path: '/client/colis',
    icon: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4'
  },
  {
    id: 'profil',
    label: 'Profil',
    path: '/profile',
    icon: 'M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z'
  }
]

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
        <!-- Icon Badge Container: Elevated circle outside the navbar when active -->
        <div
          :class="[
            'w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 shrink-0',
            activeTab === tab.id
              ? 'bg-[#053754] dark:bg-slate-900 ring-[6px] ring-[#FAF7F2] dark:ring-slate-950 -translate-y-7 text-white shadow-2xl scale-110'
              : 'text-white/70 hover:text-white'
          ]"
        >
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" :d="tab.icon" />
          </svg>
        </div>

        <!-- Label text -->
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
