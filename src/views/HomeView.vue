<script setup>
import Header from '@/components/home/Header.vue'
import HeroSection from '@/components/home/HeroSection.vue'
import AboutSection from '@/components/home/AboutSection.vue'
import ProfilesSection from '@/components/home/ProfilesSection.vue'
import HowItWorksSection from '@/components/home/HowItWorksSection.vue'
import PartnershipSection from '@/components/home/PartnershipSection.vue'
import RecordTimeSection from '@/components/home/RecordTimeSection.vue'
import Footer from '@/components/home/Footer.vue'
</script>

<template>
  <div class="min-h-screen flex flex-col justify-between bg-white dark:bg-slate-950 font-sans text-texte dark:text-slate-100">
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

      <!-- Partenariat & Contact Section -->
      <PartnershipSection />

      <!-- Temps Record Section -->
      <RecordTimeSection />
    </main>

    <!-- Footer -->
    <Footer />
  </div>
</template>
