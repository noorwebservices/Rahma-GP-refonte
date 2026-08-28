<script setup>
import bannerCommentCaMarche from '@/assets/images/banner-comment-ça-marche.png'

const steps = [
  {
    number: '01',
    title: 'Un voyage est créé',
    description: 'Un voyageur ou une entreprise publie un voyage avec sa destination, sa date et sa capacité disponible.',
    color: '#074C72', // Bleu
    titleColor: 'text-principal',
    borderColor: 'border-b-principal',
    bgColor: 'bg-principal',
    iconType: 'calendar-plane',
    isLower: false
  },
  {
    number: '02',
    title: 'Le client recherche',
    description: 'Le client indique sa destination et recherche les capacités de transport disponibles sur la plateforme.',
    color: '#B50302', // Rouge
    titleColor: 'text-principal',
    borderColor: 'border-b-secondaire',
    bgColor: 'bg-secondaire',
    iconType: 'search',
    isLower: true
  },
  {
    number: '03',
    title: 'Le client fait sa demande',
    description: 'Il choisit le voyage qui lui convient et transmet les informations nécessaires concernant son colis.',
    color: '#FF9F02', // Orange
    titleColor: 'text-tertiaire',
    borderColor: 'border-b-tertiaire',
    bgColor: 'bg-tertiaire',
    iconType: 'package',
    isLower: false
  },
  {
    number: '04',
    title: 'La demande est acceptée',
    description: 'Le transporteur reçoit la demande, confirme la prise en charge et le client lui remet son colis selon les modalités convenues.',
    color: '#074C72', // Bleu
    titleColor: 'text-principal',
    borderColor: 'border-b-principal',
    bgColor: 'bg-principal',
    iconType: 'handshake',
    isLower: true
  },
  {
    number: '05',
    title: 'Le colis arrive à destination',
    description: 'Le colis est acheminé vers sa destination et le client peut suivre son envoi jusqu\'à sa réception.',
    color: '#B50302', // Rouge
    titleColor: 'text-secondaire',
    borderColor: 'border-b-secondaire',
    bgColor: 'bg-secondaire',
    iconType: 'pin-circle',
    isLower: false
  }
]
</script>

<template>
  <section id="comment-ca-marche" class="relative pt-12 pb-18 sm:pt-10 sm:pb-0 overflow-hidden">
    
    <!-- Background Decorative Banner Image (Dézoomé et ancré en bas sur mobile pour révéler les cartons 3D sans gêner le texte) -->
    <div class="absolute inset-0 pointer-events-none z-0">
      <img 
        :src="bannerCommentCaMarche" 
        alt="Background Comment Ça Marche" 
        class="w-full h-full sm:object-contain  object-scale-down object-bottom  "
      />
    </div>

    <div class="relative z-10 max-w-7xl 2xl:max-w-384 mx-auto px-4 sm:px-6 lg:px-8">
      
      <!-- Section Header -->
      <div class="text-center max-w-3xl mx-auto space-y-3 sm:space-y-4 mb-20 lg:mb-28">
        <div>
          <span class="inline-block px-6 py-2 rounded-full border border-secondaire/40 bg-secondaire/5 text-secondaire text-xs sm:text-sm font-medium uppercase tracking-widest">
            Le Parcours Colis
          </span>
        </div>

        <h2 class="text-lg sm:text-xl lg:text-xl xl:text-3xl font-extrabold text-principal tracking-tight">
          Comment fonctionne Rahma Delivery ?
        </h2>

        <p class="text-texte text-xs sm:text-base font-normal leading-relaxed px-2">
          Rahma Delivery simplifie l'acheminement de vos colis à l'international. Trouvez une capacité disponible, faites votre demande et laissez votre colis prendre la route vers sa destination.
        </p>
      </div>

      <!-- DESKTOP ALTERNATING 5-STEP LAYOUT WITH CONNECTING ARROW LINES (>= 1024px) -->
      <div class="hidden lg:block relative mb-12 min-h-120">
        
        <!-- 5 Cards Container -->
        <div class="grid grid-cols-5 gap-4 lg:gap-6 relative z-20 items-start">
          
          <div 
            v-for="(step, index) in steps" 
            :key="step.number"
            :class="[
              'relative flex flex-col items-center pt-10',
              step.isLower ? 'mt-28' : 'mt-4'
            ]"
          >

            <!-- Number Badge (Rehaussé au-dessus du cercle de l'icône) -->
            <div 
              :class="[
                'absolute -top-8 left-1/2 -translate-x-1/2 z-30 w-7 h-7 rounded-full text-white text-[11px] font-extrabold flex items-center justify-center shadow-md border border-white/20',
                step.bgColor
              ]"
            >
              {{ step.number }}
            </div>

            <!-- Icon Circle (Superposé directement sur le bord supérieur de la carte) -->
            <div 
              :class="[
                'absolute top-0 left-1/2 -translate-x-1/2 z-30 w-16 h-16 rounded-full text-white flex items-center justify-center shadow-lg border-4 border-white transition-transform duration-300 hover:scale-110',
                step.bgColor
              ]"
            >
              <!-- Icon 1: Calendar Plane (Exact SVG Figma) -->
              <svg v-if="step.iconType === 'calendar-plane'" class="w-7 h-7" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M0 0h32v32H0z" fill="none" />
                <path fill="currentColor" fill-rule="evenodd" d="m25 23l5 2v-2l-5-2.5V18a1 1 0 0 0-2 0v2.5L18 23v2l5-2v3.5L21 28v1l3-1l3 1v-1l-2-1.5Z" />
                <path fill="currentColor" fill-rule="evenodd" d="M26 4h-4V2h-2v2h-8V2h-2v2H6a2 2 0 0 0-2 2v20a2 2 0 0 0 2 2h10v-2H6V6h4v2h2V6h8v2h2V6h4v7h2V6a2 2 0 0 0-2-2" />
              </svg>

              <!-- Icon 2: Search -->
              <svg v-else-if="step.iconType === 'search'" class="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>

              <!-- Icon 3: Package -->
              <svg v-else-if="step.iconType === 'package'" class="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>

              <!-- Icon 4: Handshake (Exact SVG Figma) -->
              <svg v-else-if="step.iconType === 'handshake'" class="w-7 h-7" viewBox="0 0 2304 1472" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M0 0h2304v1472H0z" fill="none" />
                <path fill="currentColor" d="M192 896q40 0 56-32t0-64t-56-32t-56 32t0 64t56 32m1473-58q-10-13-38.5-50t-41.5-54t-38-49t-42.5-53t-40.5-47t-45-49l-125 140q-83 94-208.5 92T880 670q-57-69-56.5-158T882 355l177-206q-22-11-51-16.5t-47.5-6t-56.5.5t-49 1q-92 0-158 66L539 352H384v544q5 0 21-.5t22 0t19.5 2T467 902t17.5 8.5T503 924l297 292q115 111 227 111q78 0 125-47q57 20 112.5-8t72.5-85q74 6 127-44q20-18 36-45.5t14-50.5q10 10 43 10q43 0 77-21t49.5-53t12-71.5T1665 838m159 58h96V384h-93l-157-180q-66-76-169-76h-167q-89 0-146 67L979 438q-28 33-28 75t27 75q43 51 110 52t111-49l193-218q25-23 53.5-21.5t47 27t8.5 56.5q16 19 56 63t60 68q29 36 82.5 105.5T1764 756q52 66 60 140m288 0q40 0 56-32t0-64t-56-32t-56 32t0 64t56 32m192-576v640q0 26-19 45t-45 19h-434q-27 65-82 106.5t-125 51.5q-33 48-80.5 81.5T1416 1309q-42 53-104.5 81.5T1183 1415q-60 34-126 39.5t-127.5-14t-117-53.5t-103.5-81l-287-282H64q-26 0-45-19T0 960V288q0-26 19-45t45-19h421q14-14 47-48t47.5-48t44-40T674 50.5T725 25t62-19.5T855 0h117q99 0 181 56q82-56 181-56h167q35 0 67 6t56.5 14.5T1676 47t44.5 31t43 39.5t39 42t41 48T1885 256h355q26 0 45 19t19 45" />
              </svg>

              <!-- Icon 5: Pin Circle (Exact SVG Figma) -->
              <svg v-else-if="step.iconType === 'pin-circle'" class="w-7 h-7" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M0 0h24v24H0z" fill="none" />
                <path fill="currentColor" d="M6 8.44c-.02 5.1 5.17 9.18 5.39 9.35c.18.14.4.21.61.21s.43-.07.61-.21c.22-.17 5.41-4.25 5.39-9.35C18 4.89 15.31 2 12 2S6 4.89 6 8.44m10 0c.01 3.19-2.74 6.08-4 7.24c-1.26-1.15-4.01-4.04-4-7.24C8 5.99 9.79 4 12 4s4 1.99 4 4.44" />
                <path fill="currentColor" d="M12 6a2 2 0 1 0 0 4a2 2 0 1 0 0-4m6.02 8.73c-.4.64-.84 1.23-1.27 1.76C18.88 16.97 20 17.68 20 18c0 .51-2.75 2-8 2s-8-1.49-8-2c0-.32 1.12-1.03 3.25-1.51c-.43-.53-.86-1.12-1.27-1.76C3.66 15.37 2 16.44 2 18c0 2.75 5.18 4 10 4s10-1.25 10-4c0-1.56-1.67-2.63-3.98-3.27" />
              </svg>
            </div>

            <!-- White Content Card (Toutes les bordures sont en bas: border-b-4) -->
            <div 
              :class="[
                'w-full bg-white rounded-3xl pt-10 pb-6 px-4 shadow-xl border-t border-slate-100 text-center flex flex-col items-center justify-start min-h-52.5 border-b-4 relative',
                step.borderColor
              ]"
            >
              <h3 
                :class="[
                  'font-extrabold text-sm sm:text-base mb-2 leading-snug',
                  step.titleColor
                ]"
              >
                {{ step.title }}
              </h3>

              <p class="text-texte text-xs font-normal leading-relaxed">
                {{ step.description }}
              </p>

              <!-- LINE 1: Attaché au bord droit de la Carte 1 vers la Carte 2 (Virage vers le bas + Flèche bas) -->
              <div v-if="index === 0" class="absolute -top-4 -right-12 xl:-right-16 w-12 xl:w-16 h-30 pointer-events-none z-30">
                <svg class="w-full h-full overflow-visible" viewBox="0 0 60 120" preserveAspectRatio="none">
                  <circle cx="0" cy="20" r="3.5" fill="none" stroke="#074C72" stroke-width="2.5" />
                  <path d="M 4,20 H 35 A 15,15 0 0,1 50,35 V 105" fill="none" stroke="#074C72" stroke-width="2.5" stroke-dasharray="5 5" />
                  <polygon points="43,103 57,103 50,115" fill="#074C72" />
                </svg>
              </div>

              <!-- LINE 2: Attaché au bord droit de la Carte 2 vers la Carte 3 (Virage vers le haut + Flèche haut) -->
              <div v-if="index === 1" class="absolute -bottom-4 -right-12 xl:-right-14 w-12 xl:w-16 h-30 pointer-events-none z-30">
                <svg class="w-full h-full overflow-visible" viewBox="0 0 60 120" preserveAspectRatio="none">
                  <path d="M 4,100 H 35 A 15,15 0 0,0 50,85 V 15" fill="none" stroke="#B50302" stroke-width="2.5" stroke-dasharray="5 5" />
                  <polygon points="43,17 57,17 50,5" fill="#B50302" />
                </svg>
              </div>

              <!-- LINE 3: Attaché au bord droit de la Carte 3 vers la Carte 4 (Virage vers le bas + Flèche bas) -->
              <div v-if="index === 2" class="absolute -top-4 -right-12 xl:-right-16 w-12 xl:w-16 h-30 pointer-events-none z-30">
                <svg class="w-full h-full overflow-visible" viewBox="0 0 60 120" preserveAspectRatio="none">
                  <path d="M 4,20 H 35 A 15,15 0 0,1 50,35 V 105" fill="none" stroke="#FF9F02" stroke-width="2.5" stroke-dasharray="5 5" />
                  <polygon points="43,103 57,103 50,115" fill="#FF9F02" />
                </svg>
              </div>

              <!-- LINE 4: Attaché au bord droit de la Carte 4 vers la Carte 5 (Virage vers le haut + Flèche haut) -->
              <div v-if="index === 3" class="absolute -bottom-4 -right-12 xl:-right-14 w-12 xl:w-16 h-30 pointer-events-none z-30">
                <svg class="w-full h-full overflow-visible" viewBox="0 0 60 120" preserveAspectRatio="none">
                  <path d="M 4,100 H 35 A 15,15 0 0,0 50,85 V 15" fill="none" stroke="#074C72" stroke-width="2.5" stroke-dasharray="5 5" />
                  <polygon points="43,17 57,17 50,5" fill="#074C72" />
                </svg>
              </div>

            </div>

          </div>

        </div>

      </div>

      <!-- MOBILE VERTICAL STEP LIST (< 1024px) -->
      <div class="lg:hidden space-y-6 max-w-md mx-auto relative">
        <div 
          v-for="step in steps" 
          :key="step.number"
          :class="[
            'bg-white rounded-2xl p-5 shadow-lg border border-slate-100 flex gap-4 items-start relative border-b-4',
            step.borderColor
          ]"
        >
          <!-- Icon Circle -->
          <div 
            :class="[
              'w-12 h-12 rounded-full text-white flex items-center justify-center shrink-0 shadow-md',
              step.bgColor
            ]"
          >
            <span class="text-xs font-extrabold">{{ step.number }}</span>
          </div>

          <!-- Content -->
          <div class="space-y-1">
            <h3 
              :class="[
                'font-extrabold text-base',
                step.titleColor
              ]"
            >
              {{ step.title }}
            </h3>
            <p class="text-texte text-xs font-normal leading-relaxed">
              {{ step.description }}
            </p>
          </div>
        </div>
      </div>

    </div>
  </section>
</template>
