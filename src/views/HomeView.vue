<script setup>
import Header from '@/components/Header.vue'
import Footer from '@/components/Footer.vue'
</script>

<template>
  <div class="min-h-screen flex flex-col justify-between bg-white font-sans text-texte">
    <!-- Header -->
    <Header />

    <!-- Main Body Area -->
    <main class="flex-grow flex items-center justify-center py-20 px-4">
      <div class="text-center">
        <h1 class="text-2xl font-bold text-slate-800">Portail Rahma Delivery</h1>
        <p class="text-sm text-texte mt-2">Page d'accueil</p>
      </div>
    </main>

    <!-- Footer -->
    <Footer />
  </div>
</template>
