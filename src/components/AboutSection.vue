<script setup>
import image1Coupe from '@/assets/images/image-1-coupé.png'
import image2Coupe from '@/assets/images/image-2-coupé.png'
import image3Coupe from '@/assets/images/image-3-coupé.png'
import bannerAPropos from '@/assets/images/banner-a-propos.png'
import bateauTrain from '@/assets/images/bateau-train.png'
import packageImg from '@/assets/images/package.png'
</script>

<template>
  <section id="a-propos" class="relative py-4 sm:py-16 bg-white overflow-hidden">

    <!-- Background Decorative Banner Image (Masqué complètement sur mobile pour ne pas surcharger) -->
    <div class="hidden  absolute inset-0 pointer-events-none z-0 ">
      <img :src="bannerAPropos" alt="Decorative Banner Accents"
        class="w-full h-full lg:object-fill object-contain object-right" />
    </div>

    <!-- Package Accent Image (Positionné en haut à droite) -->
    <div class="absolute top-4 right-4 sm:right-12 w-42 sm:w-98 pointer-events-none z-10 opacity-80 sm:opacity-100 block ">  
      <img :src="packageImg" alt="3D Packages Accent" class="w-full h-auto object-contain" />
    </div>

    <div class="relative z-10 max-w-7xl 2xl:max-w-384 mx-auto px-4 sm:px-6 lg:px-8 pt-4">
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 xl:gap-16 items-center">

        <!-- LEFT COLUMN: Pre-Cut Images Composition (7 cols on xl, 6 cols on lg) -->
        <div class="lg:col-span-6 xl:col-span-7 relative">
          <div class="grid grid-cols-2 gap-4 sm:gap-6 items-center relative">

            <!-- Sub-Column 1: Image 1 + Image 2 + Circle Text in the cutout -->
            <div class="space-y-3 sm:space-y-4 relative">

              <!-- Image 1 Coupé -->
              <div class="relative">
                <img :src="image1Coupe" alt="Rahma Delivery Client sur canapé"
                  class="w-full h-auto object-contain block" />
              </div>

              <!-- Image 2 Coupé -->
              <div class="relative">
                <img :src="image2Coupe" alt="Rahma Delivery Client préparation bagages"
                  class="w-full h-auto object-contain block" />
              </div>

              <!-- Text ONLY overlay centered on the circular cutout boundary -->
              <div
                class="absolute top-1/2 right-0 lg:translate-x-[14%] sm:translate-x-[0%] translate-x-[20%] translate-y-[-70%] z-20 flex flex-col justify-center items-center text-center w-24 sm:w-32 lg:w-36 pointer-events-none">
                <span class="text-[10px] sm:text-[14px] font-light text-secondaire leading-tight">Simple.</span>
                <span
                  class="text-[10px] sm:text-[14px] font-light text-secondaire leading-tight mt-0.5 sm:mt-1">Rapide.</span>
                <span
                  class="text-[10px] sm:text-[14px] font-light text-secondaire leading-tight mt-0.5 sm:mt-1">Fiable.</span>
              </div>

            </div>

            <!-- Sub-Column 2: Image 3 Coupé + Speech Bubble Text in the top-right cutout -->
            <div class="relative">

              <!-- Image 3 Coupé -->
              <div class="relative">
                <img :src="image3Coupe" alt="Rahma Delivery au bureau GP" class="w-full h-auto object-contain block" />

                <!-- Text ONLY overlay positioned cleanly inside top-right speech bubble cutout -->
                <div
                  class="absolute top-[9%] sm:top-[9%] right-[6%] sm:right-[0%] w-[48%] sm:w-[50%] h-[20%] z-20 flex items-center justify-center text-left pointer-events-none">
                  <p class="text-[10px] sm:text-[14px] font-light text-principal leading-snug">
                    Voyagez,<br />
                    transportez,<br />
                    partagez.
                  </p>
                </div>
              </div>

            </div>

          </div>
           <!-- Bateau Train 3D Illustration Image -->
           <div class="shrink-0 w-40 sm:w-72 absolute -bottom-2 sm:bottom-2 right-0 sm:right-4 lg:right-8 z-10 pointer-events-none block lg:hidden">
              <img :src="bateauTrain" alt="Transport Maritime & Ferroviaire" class="w-full h-auto object-contain" />
            </div>
        </div>

        <!-- RIGHT COLUMN: Content Text & Action (5 cols on xl, 6 cols on lg) -->
        <div class="lg:col-span-6 xl:col-span-5 space-y-5 sm:space-y-6 relative">

          <!-- Section Title with Bateau-Train Image next to it -->
          <div class="flex items-center justify-between gap-4 relative">
            <div class="space-y-1">
              <!-- Subtitle (Rouge Secondaire) -->
              <p class="text-xs sm:text-sm font-light tracking-widest text-secondaire uppercase">
                À PROPOS DE RAHMA DELIVERY
              </p>

              <!-- Main Title (Bleu Principal) -->
              <h2 class="text-lg sm:text-xl lg:text-xl xl:text-3xl font-extrabold text-principal tracking-tight leading-tight">
                QUI SOMMES-NOUS ?
              </h2>
            </div>
          </div>

          <!-- Paragraphs -->
          <div class="space-y-4 text-texte font-normal text-xs sm:text-base leading-relaxed">
            <p>
              Rahma Delivery est une plateforme qui facilite l'acheminement de colis à l'international en mettant en
              relation les clients avec des voyageurs et des entreprises disposant de capacité disponible.
            </p>
            <p>
              Notre ambition est de simplifier chaque étape de l'envoi, en permettant à chacun de trouver une solution
              adaptée à sa destination. Que vous souhaitiez envoyer un colis, proposer de l'espace lors d'un voyage ou
              transporter des colis professionnellement, Rahma Delivery vous accompagne.
            </p>
          </div>

          <!-- Action Button avec biseau exact de la maquette Figma -->
          <div class="pt-2">
            <a href="#devenir-partenaire"
              class="relative inline-flex items-center justify-center bg-secondaire hover:bg-secondaire-light text-white font-bold text-xs sm:text-sm uppercase tracking-wider px-9 py-4 rounded-2xl shadow-xl shadow-secondaire/30 transition-all duration-200 transform hover:scale-[1.02] active:scale-95 text-center">
              <span>NOUS CONTACTER</span>
            </a>
          </div>
           <!-- Bateau Train 3D Illustration Image -->
           <div class="shrink-0 w-72 absolute  -bottom-32 -right-24  z-10 pointer-events-none hidden lg:block ">
              <img :src="bateauTrain" alt="Transport Maritime & Ferroviaire" class="w-full h-auto object-contain" />
            </div>
        </div>

      </div>
    </div>

  </section>
</template>
