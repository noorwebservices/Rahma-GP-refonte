<script setup>
import { computed } from 'vue'
import { useRoute, useRouter, RouterView, RouterLink } from 'vue-router'
import sansFond from '@/assets/images/sans-fond.png'

const route = useRoute()
const router = useRouter()

const activeTab = computed(() => {
  if (route.name === 'register') return 'register'
  if (route.name === 'login') return 'login'
  return 'login'
})

const navigateTab = (tab) => {
  if (tab === 'login') {
    router.push('/auth/login')
  } else if (tab === 'register') {
    router.push('/auth/register')
  } else if (tab === 'visiteur') {
    router.push('/client')
  }
}
</script>

<template>
  <div class="min-h-screen bg-[#FAF7F2] flex flex-col justify-between selection:bg-secondaire selection:text-white font-sans overflow-x-hidden">
    <!-- Top Header Bar -->
    <header class="w-full bg-[#FAF7F2] py-3.5 px-4 sm:px-8 border-b border-black/5 z-30 sticky top-0 backdrop-blur-md bg-opacity-90">
      <div class="w-full max-w-7xl mx-auto flex items-center justify-between gap-2">
        
        <!-- Logo Rouge (Masqué sur Mobile < sm) -->
        <RouterLink to="/" class="hidden sm:flex items-center gap-2 group shrink-0">
          <img src="@/assets/images/logo-rouge.svg" alt="Rahma Delivery Logo" class="h-8 sm:h-10 w-auto object-contain transition-transform group-hover:scale-105" />
        </RouterLink>

        <!-- Top Switcher Pill Bar (Scrollable on Mobile) -->
        <div class="flex-1 sm:flex-initial flex items-center overflow-x-auto no-scrollbar max-w-full py-1">
          <div class="flex items-center bg-white p-1 rounded-full shadow-xs border border-gray-200 text-xs sm:text-sm font-medium shrink-0 mx-auto sm:mx-0">
            <button
              type="button"
              @click="navigateTab('login')"
              :class="[
                'px-4 py-2 rounded-full transition-all duration-200 cursor-pointer whitespace-nowrap',
                activeTab === 'login'
                  ? 'bg-principal-dark text-white font-semibold shadow-xs'
                  : 'text-gray-600 hover:text-principal'
              ]"
            >
              Connexion
            </button>
            <button
              type="button"
              @click="navigateTab('register')"
              :class="[
                'px-4 py-2 rounded-full transition-all duration-200 cursor-pointer whitespace-nowrap',
                activeTab === 'register'
                  ? 'bg-principal-dark text-white font-semibold shadow-xs'
                  : 'text-gray-600 hover:text-principal'
              ]"
            >
              Inscription
            </button>
            <button
              type="button"
              @click="navigateTab('visiteur')"
              class="px-4 py-2 rounded-full text-gray-600 hover:text-principal transition-all duration-200 cursor-pointer whitespace-nowrap"
            >
              Espace visiteur
            </button>
          </div>
        </div>

        <!-- Right Quick Links (Desktop) -->
        <div class="hidden md:flex items-center gap-3 shrink-0">
          <RouterLink to="/" class="p-2 px-3 rounded-xl bg-white border border-gray-200 text-gray-600 hover:text-principal transition-colors text-xs font-semibold flex items-center gap-1.5 shadow-2xs">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            Accueil
          </RouterLink>
        </div>
      </div>
    </header>

    <!-- Main Content Body: Full width line without margins on desktop -->
    <main class="flex-1 w-full flex flex-col lg:flex-row min-h-[calc(100vh-65px)]">
      
      <!-- Left Hero Banner (Desktop Split - Full line without margin) -->
      <div
        class="relative lg:w-1/2 p-8 sm:p-12 lg:p-16 text-white flex flex-col justify-between overflow-hidden"
        style="background-color: #053754;"
      >
        <!-- Background geometric texture -->
        <div class="absolute inset-0 opacity-10 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:20px_20px] pointer-events-none z-0"></div>
        <!-- Sans-fond image overlay on blue (Full image visible without cropping) -->
        <img
          :src="sansFond"
          alt=""
          class="absolute inset-0 w-full h-full object-contain pointer-events-none z-0 p-4 sm:p-8"
          style="opacity: 0.35; mix-blend-mode: screen;"
        />
        <!-- Glow blobs -->
        <div class="absolute -top-24 -left-24 w-80 h-80 bg-blue-400/30 rounded-full blur-3xl pointer-events-none z-0"></div>
        <div class="absolute -bottom-24 -right-24 w-80 h-80 bg-red-500/20 rounded-full blur-3xl pointer-events-none z-0"></div>

        <div class="relative z-10 max-w-xl mx-auto lg:mx-0 w-full">
          <!-- Brand Logo Blanc -->
          <RouterLink to="/" class="inline-block mb-8">
            <img src="@/assets/images/logo-blanc.svg" alt="Rahma Delivery Logo Blanc" class="h-10 sm:h-12 w-auto object-contain" />
          </RouterLink>

          <!-- Headline -->
          <h2 class="text-2xl sm:text-3xl lg:text-4xl font-serif font-bold leading-tight mb-4 text-white/95">
            Chaque trajet peut porter un peu d'entraide.
          </h2>
          <p class="text-sm sm:text-base text-gray-200 max-w-md font-light leading-relaxed mb-8">
            Retrouvez vos réservations, vos trajets proposés et vos échanges sécurisés avec la communauté Rahma GP.
          </p>

          <!-- Route Graphic Visual: Dakar -> Paris with points aligned next to destination names -->
          <div class="my-6 p-6 bg-white/10 rounded-3xl border border-white/20 backdrop-blur-md relative overflow-hidden shadow-xl">
            <div class="relative w-full pt-4 pb-1">
              
              <!-- Dotted Arc Curve with Airplane Icon facing RIGHT towards Paris -->
              <div class="relative h-16 w-full flex items-center justify-center">
                <svg class="w-full h-full text-tertiaire" viewBox="0 0 320 60" fill="none">
                  <!-- Trajectory Arc starting at left point and ending at right point -->
                  <path d="M 18,48 Q 160,5 302,48" stroke="currentColor" stroke-width="3" stroke-dasharray="6 6" fill="none" opacity="0.9" />
                </svg>
                
                <!-- Airplane Icon Badge at Apex facing Paris (rotated 12deg right) -->
                <div class="absolute -top-3 left-1/2 -translate-x-1/2 bg-tertiaire text-principal-dark w-11 h-11 rounded-full flex items-center justify-center shadow-2xl ring-4 ring-white/20 hover:scale-110 transition-transform">
                  <svg class="w-6 h-6 transform rotate-[12deg]" viewBox="0 0 24 24" fill="currentColor">
                    <!-- Standard airliner facing right -->
                    <path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z" transform="rotate(90 12 12)" />
                  </svg>
                </div>
              </div>

              <!-- Endpoint Labels Aligned Directly at Point Level -->
              <div class="flex items-center justify-between -mt-4 px-1 relative z-10">
                <!-- Dakar Left Endpoint with Yellow Point -->
                <div class="flex items-center gap-2.5">
                  <span class="w-4 h-4 rounded-full bg-tertiaire shadow-lg ring-4 ring-tertiaire/30 animate-pulse shrink-0"></span>
                  <div class="flex flex-col">
                    <span class="text-sm sm:text-base font-extrabold text-white leading-tight">Dakar</span>
                    <span class="text-[11px] text-gray-300 font-medium">Sénégal</span>
                  </div>
                </div>

                <!-- Paris Right Endpoint with Red Point -->
                <div class="flex items-center gap-2.5 text-right">
                  <div class="flex flex-col">
                    <span class="text-sm sm:text-base font-extrabold text-white leading-tight">Paris</span>
                    <span class="text-[11px] text-gray-300 font-medium">France</span>
                  </div>
                  <span class="w-4 h-4 rounded-full bg-secondaire shadow-lg ring-4 ring-secondaire/30 shrink-0"></span>
                </div>
              </div>

            </div>
          </div>
        </div>

        <!-- Bottom Card Preview -->
        <div class="relative z-10 bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20 max-w-xl mx-auto lg:mx-0 w-full mt-6">
          <div class="flex items-center justify-between mb-1.5">
            <span class="text-sm font-bold text-white flex items-center gap-2">
              Dakar <span class="text-tertiaire">➔</span> Paris
            </span>
            <span class="bg-tertiaire text-principal-dark text-xs font-extrabold px-2.5 py-1 rounded-full">
              2 500 F/kg
            </span>
          </div>
          <p class="text-xs text-gray-200 font-medium mb-3">Départ 14 sept. • 15 kg disponibles</p>
          <div class="flex items-center gap-2 text-xs text-gray-100 pt-2 border-t border-white/15">
            <span class="w-6 h-6 rounded-full bg-tertiaire text-principal-dark flex items-center justify-center font-bold text-[10px]">FD</span>
            <span class="font-medium">Fatou D. • voyageuse</span>
            <span class="text-tertiaire ml-auto flex items-center gap-0.5 font-bold">★ 4.9</span>
          </div>
        </div>
      </div>

      <!-- Right Form View Container (Full height & width on desktop) -->
      <div class="lg:w-1/2 p-6 sm:p-12 lg:p-16 flex flex-col justify-center bg-white shadow-2xs">
        <RouterView />
      </div>

    </main>

    <!-- Footer Copyright -->
    <footer class="py-3 text-center text-xs text-gray-500 font-medium bg-[#FAF7F2] border-t border-black/5">
      &copy; {{ new Date().getFullYear() }} Rahma GP. Tous droits réservés.
    </footer>
  </div>
</template>
