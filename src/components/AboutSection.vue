<script setup>
import image1Coupe from '@/assets/images/image-1-coupé.png'
import image2Coupe from '@/assets/images/image-2-coupé.png'
import image3Coupe from '@/assets/images/image-3-coupé.png'
import bannerAPropos from '@/assets/images/banner-a-propos.png'
</script>

<template>
  <section id="a-propos" class="relative py-16 sm:py-24 bg-white overflow-hidden">
    
    <!-- Background Decorative Banner Image (Atténué sur mobile à opacity-20 pour ne pas gêner la lisibilité, ultra net sur desktop) -->
    <div class="absolute inset-0 pointer-events-none z-0 opacity-20 sm:opacity-40 lg:opacity-100">
      <img 
        :src="bannerAPropos" 
        alt="Decorative Banner Accents" 
        class="w-full h-full object-contain md:object-cover object-right"
      />
    </div>

    <div class="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
        
        <!-- LEFT COLUMN: Pre-Cut Images Composition (7 cols on lg) -->
        <div class="lg:col-span-7 relative">
          <div class="grid grid-cols-2 gap-4 sm:gap-6 items-center relative">
            
            <!-- Sub-Column 1: Image 1 + Image 2 + Circle Text in the cutout -->
            <div class="space-y-3 sm:space-y-4 relative">
              
              <!-- Image 1 Coupé -->
              <div class="relative">
                <img 
                  :src="image1Coupe" 
                  alt="Rahma Delivery Client sur canapé" 
                  class="w-full h-auto object-contain block"
                />
              </div>

              <!-- Image 2 Coupé -->
              <div class="relative">
                <img 
                  :src="image2Coupe" 
                  alt="Rahma Delivery Client préparation bagages" 
                  class="w-full h-auto object-contain block"
                />
              </div>

              <!-- Text ONLY overlay centered on the circular cutout boundary -->
              <div class="absolute top-1/2 right-0 translate-x-[18%] translate-y-[-70%] z-20 flex flex-col justify-center items-center text-center w-24 sm:w-32 lg:w-36 pointer-events-none">
                <span class="text-[10px] sm:text-base font-bold text-secondaire leading-tight">Simple.</span>
                <span class="text-[10px] sm:text-base font-bold text-secondaire leading-tight mt-0.5 sm:mt-1">Rapide.</span>
                <span class="text-[10px] sm:text-base font-bold text-secondaire leading-tight mt-0.5 sm:mt-1">Fiable.</span>
              </div>

            </div>

            <!-- Sub-Column 2: Image 3 Coupé + Speech Bubble Text in the top-right cutout -->
            <div class="relative">
              
              <!-- Image 3 Coupé -->
              <div class="relative">
                <img 
                  :src="image3Coupe" 
                  alt="Rahma Delivery au bureau GP" 
                  class="w-full h-auto object-contain block"
                />

                <!-- Text ONLY overlay positioned cleanly inside top-right speech bubble cutout -->
                <div class="absolute top-[9%] sm:top-[9%] right-[6%] sm:right-[8%] w-[48%] sm:w-[50%] h-[20%] z-20 flex items-center justify-center text-left pointer-events-none">
                  <p class="text-[10px] sm:text-sm lg:text-base font-bold text-principal leading-snug">
                    Voyagez,<br />
                    transportez,<br />
                    partagez.
                  </p>
                </div>
              </div>

            </div>

          </div>
        </div>

        <!-- RIGHT COLUMN: Content Text & Action (5 cols on lg) -->
        <div class="lg:col-span-5 space-y-6">
          
          <!-- Subtitle (Rouge Secondaire) -->
          <p class="text-xs sm:text-sm font-light tracking-widest text-secondaire uppercase">
            À PROPOS DE RAHMA DELIVERY
          </p>

          <!-- Main Title (Bleu Principal) -->
          <h2 class="text-3xl sm:text-4xl font-extrabold text-principal tracking-tight leading-tight">
            QUI SOMMES-NOUS ?
          </h2>

          <!-- Paragraphs -->
          <div class="space-y-4 text-texte font-normal text-sm sm:text-base leading-relaxed">
            <p>
              Rahma Delivery est une plateforme qui facilite l'acheminement de colis à l'international en mettant en relation les clients avec des voyageurs et des entreprises disposant de capacité disponible.
            </p>
            <p>
              Notre ambition est de simplifier chaque étape de l'envoi, en permettant à chacun de trouver une solution adaptée à sa destination. Que vous souhaitiez envoyer un colis, proposer de l'espace lors d'un voyage ou transporter des colis professionnellement, Rahma Delivery vous accompagne.
            </p>
          </div>

          <!-- Action Button avec biseau exact de la maquette Figma -->
          <div class="pt-2">
            <a
              href="#contact"
              class="relative inline-flex items-center justify-center bg-secondaire hover:bg-secondaire-light text-white font-bold text-xs sm:text-sm uppercase tracking-wider px-9 py-4 rounded-2xl shadow-xl shadow-secondaire/30 transition-all duration-200 transform hover:scale-[1.02] active:scale-95 text-center [clip-path:polygon(0_0,100%_0,84%_100%,0_100%)]"
            >
              <span>NOUS CONTACTER</span>
            </a>
          </div>

        </div>

      </div>
    </div>

  </section>
</template>
