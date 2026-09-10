<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import ClientHeader from '@/components/client/ClientHeader.vue'
import ClientBottomNav from '@/components/client/ClientBottomNav.vue'

const route = useRoute()

// Check if page needs back button in top header
const showBack = computed(() => {
  return route.path.includes('/voyage/') || route.path.includes('/booking/')
})
</script>

<template>
  <div class="min-h-screen bg-[#FAF7F2] font-sans pb-24 flex flex-col justify-between selection:bg-secondaire selection:text-white">
    <!-- Top Client Header -->
    <ClientHeader :showBack="showBack" />

    <!-- Main Dynamic Route View -->
    <main class="flex-1 w-full max-w-2xl lg:max-w-6xl mx-auto px-4 sm:px-6 pt-4 sm:pt-6">
      <router-view />
    </main>

    <!-- Bottom 4-Tab Navigation Bar -->
    <ClientBottomNav />
  </div>
</template>
