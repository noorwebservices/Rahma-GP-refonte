<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import VoyageurHeader from '@/components/voyageur/VoyageurHeader.vue'
import VoyageurBottomNav from '@/components/voyageur/VoyageurBottomNav.vue'

const route = useRoute()

const showBack = computed(() => {
  return route.path.includes('/voyages/') || route.path.includes('/demandes/') || Boolean(route.meta?.showBack)
})
</script>

<template>
  <div class="min-h-screen bg-[#FAF7F2] dark:bg-slate-950 text-slate-800 dark:text-slate-100 font-sans pb-24 flex flex-col justify-between selection:bg-secondaire selection:text-white transition-colors duration-300">
    <!-- Top Voyageur Header -->
    <VoyageurHeader :showBack="showBack" />

    <!-- Main Dynamic Route View -->
    <main class="flex-1 w-full max-w-2xl lg:max-w-6xl mx-auto px-4 sm:px-6 pt-4 sm:pt-6">
      <router-view />
    </main>

    <!-- Bottom 4-Tab Navigation Bar for Voyageur -->
    <VoyageurBottomNav />
  </div>
</template>
