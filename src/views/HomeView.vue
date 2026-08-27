<script setup>
import Header from '@/components/Header.vue'
import HeroSection from '@/components/HeroSection.vue'
import AboutSection from '@/components/AboutSection.vue'
import ProfilesSection from '@/components/ProfilesSection.vue'
import HowItWorksSection from '@/components/HowItWorksSection.vue'
import Footer from '@/components/Footer.vue'
</script>

<template>
  <div class="min-h-screen flex flex-col justify-between bg-white font-sans text-texte">
    <!-- Header -->
    <Header />

    <!-- Main Content Area -->
    <main class="flex-grow">
      <!-- Hero Section -->
      <HeroSection />

      <!-- À Propos Section -->
      <AboutSection />

      <!-- Les Profils Section -->
      <ProfilesSection />

      <!-- Comment ça marche Section -->
      <HowItWorksSection />
    </main>

    <!-- Footer -->
    <Footer />
  </div>
</template>
