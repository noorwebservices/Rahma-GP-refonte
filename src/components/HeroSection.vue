<script setup>
import bannerHero from '@/assets/images/banner-hero.png'
</script>

<template>
  <section id="accueil"
    class="relative min-h-125 sm:min-h-150 lg:min-h-[90vh] flex items-center bg-[#074C72] overflow-hidden">

    <!-- Background Image & Subtle Figma Overlay -->
    <div class="absolute inset-0 z-0">
      <img :src="bannerHero" alt="Rahma Delivery Hero Banner" class="w-full h-full object-cover object-center" />

      <!-- Subtle Linear Gradient Overlay matching Figma mockup specs -->
      <div class="absolute inset-0 pointer-events-none"
        style="background: linear-gradient(90deg, rgba(7, 76, 114, 0.65) 0%, rgba(7, 76, 114, 0.40) 30%, rgba(7, 76, 114, 0.15) 60%, rgba(7, 76, 114, 0) 100%);">
      </div>
    </div>

    <!-- Hero Content Container -->
    <div class="relative z-10 max-w-7xl 2xl:max-w-[1536px] mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16 lg:pt-32 lg:pb-24 w-full">
      <div class="max-w-2xl sm:max-w-3xl lg:max-w-4xl space-y-4 sm:space-y-5 text-white">

        <!-- 1. Subtitle (12px = text-xs) -->
        <p class="text-xs font-bold tracking-wider text-white uppercase">
          VOTRE COLIS, NOTRE ENGAGEMENT
        </p>

        <!-- 2. Main Title (Rahma Delivery: text-7xl | votre partenaire de confiance: text-5xl) -->
        <h1 class="font-bold text-white tracking-tight leading-tight">
          <span class="text-secondaire text-3xl sm:text-5xl lg:text-7xl inline-block font-bold">Rahma Delivery,</span>
          <br />
          <span class="text-xl sm:text-3xl lg:text-5xl inline-block font-bold">votre partenaire de confiance</span>
        </h1>

        <!-- 3. Paragraph (16px = text-base) -->
        <p class="text-sm sm:text-base font-medium text-white/95 leading-relaxed max-w-xl pt-1">
          Trouvez facilement un voyageur ou une entreprise disposant de capacité disponible et faites acheminer vos
          colis vers leur destination en toute simplicité.
        </p>

        <!-- 4. CTA Buttons -->
        <div class="flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 sm:gap-4 pt-3 sm:pt-4">

          <!-- Primary CTA Button (Devenir un partenaire avec flèche) -->
          <a href="#devenir-partenaire"
            class="bg-secondaire hover:bg-secondaire-light text-white font-bold text-xs sm:text-sm uppercase tracking-wider px-6 sm:px-7 py-3.5 rounded-xl shadow-md transition-all duration-200 transform hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-3 group text-center">
            <span>DEVENIR UN PARTENAIRE</span>
            <svg class="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24"
              stroke="currentColor" stroke-width="2.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </a>

          <!-- Secondary CTA Button (Nous contacter - Outline) -->
          <a href="#devenir-partenaire"
            class="border-2 border-white/80 hover:border-white hover:bg-white/15 text-white font-bold text-xs sm:text-sm uppercase tracking-wider px-6 sm:px-7 py-3 rounded-xl transition-all duration-200 transform hover:scale-[1.02] active:scale-95 text-center backdrop-blur-xs">
            NOUS CONTACTER
          </a>

        </div>

      </div>
    </div>

  </section>
</template>
