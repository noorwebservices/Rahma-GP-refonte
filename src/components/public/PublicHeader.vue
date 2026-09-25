<script setup>
import { RouterLink } from 'vue-router'
import logoRouge from '@/assets/images/logo-rouge.svg'

const links = [
  { name: 'Voyages', to: '/voyages' },
  { name: 'Comment ça marche', to: '/comment-ca-marche' },
  { name: 'FAQ', to: '/faq' },
]
</script>

<template>
  <header class="sticky top-0 z-30 bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-800">
    <div class="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
      <RouterLink to="/" class="flex items-center gap-2 shrink-0">
        <img :src="logoRouge" alt="Rahma Delivery" class="h-8 w-auto object-contain" />
      </RouterLink>

      <nav class="hidden md:flex items-center gap-1">
        <RouterLink
          v-for="l in links"
          :key="l.to"
          :to="l.to"
          class="px-3 py-2 rounded-xl text-sm font-bold text-gray-600 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-800 transition"
          active-class="text-[#053754] dark:text-sky-300"
        >
          {{ l.name }}
        </RouterLink>
      </nav>

      <RouterLink
        to="/auth/login"
        class="bg-[#053754] hover:bg-[#074C72] text-white text-xs font-extrabold px-4 py-2 rounded-full transition shrink-0"
      >
        Connexion
      </RouterLink>
    </div>
  </header>
</template>
