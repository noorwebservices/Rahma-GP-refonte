<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import AgentHeader from '@/components/agent/AgentHeader.vue'
import AgentBottomNav from '@/components/agent/AgentBottomNav.vue'

const route = useRoute()

const showBack = computed(() => {
  return route.path.includes('/agent/voyages/') || route.path.includes('/agent/demandes/') || route.path.includes('/agent/messages/') || Boolean(route.meta?.showBack)
})
</script>

<template>
  <div class="min-h-screen bg-[#FAF7F2] dark:bg-slate-950 text-slate-800 dark:text-slate-100 font-sans pb-24 flex flex-col justify-between selection:bg-[#053754] selection:text-white transition-colors duration-300">
    <!-- Top Agent Header -->
    <AgentHeader :showBack="showBack" />

    <!-- Main Dynamic Route View -->
    <main class="flex-1 w-full max-w-2xl lg:max-w-6xl mx-auto px-4 sm:px-6 pt-4 sm:pt-6">
      <router-view />
    </main>

    <!-- Bottom 4-Tab Navigation Bar for Agent GP -->
    <AgentBottomNav />
  </div>
</template>
