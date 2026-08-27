<script setup>
import { ref, onMounted } from 'vue'

const isMobileMenuOpen = ref(false)
const activeLink = ref('#accueil')

const navLinks = [
  { name: 'Accueil', href: '#accueil' },
  { name: 'A propos', href: '#a-propos' },
  { name: 'Les profils', href: '#les-profils' },
  { name: 'Comment ça marche', href: '#comment-ca-marche' },
  { name: 'Contact', href: '#contact' },
]

const setActiveLink = (href) => {
  activeLink.value = href
}

const toggleMobileMenu = () => {
  isMobileMenuOpen.value = !isMobileMenuOpen.value
}

const closeMobileMenu = () => {
  isMobileMenuOpen.value = false
}

const handleMobileClick = (href) => {
  setActiveLink(href)
  closeMobileMenu()
}

onMounted(() => {
  if (window.location.hash) {
    activeLink.value = window.location.hash
  }
})
</script>

<template>
  <header class="sticky top-0 z-50 bg-principal text-white shadow-md">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex items-center justify-between h-20">
        
        <!-- Logo Blanc -->
        <a href="#accueil" @click="setActiveLink('#accueil')" class="flex items-center shrink-0">
          <img 
            src="@/assets/images/logo-blanc.svg" 
            alt="Rahma Delivery Logo Blanc" 
            class="h-10 sm:h-12 w-auto object-contain"
          />
        </a>

        <!-- Desktop Navigation Links (Centré avec gap, survol et active en rouge) -->
        <nav class="hidden md:flex items-center gap-6 lg:gap-8">
          <a
            v-for="link in navLinks"
            :key="link.name"
            :href="link.href"
            @click="setActiveLink(link.href)"
            :class="[
              'text-sm sm:text-base transition-colors duration-200 py-1',
              activeLink === link.href
                ? 'text-secondaire font-bold border-b-2 border-secondaire'
                : 'font-medium text-white hover:text-secondaire'
            ]"
          >
            {{ link.name }}
          </a>
        </nav>

        <!-- Desktop Action Button (Rouge Secondaire) -->
        <div class="hidden md:flex items-center">
          <a
            href="#devenir-partenaire"
            @click="setActiveLink('#devenir-partenaire')"
            class="bg-secondaire hover:bg-secondaire-light text-white font-semibold text-sm px-6 py-2.5 rounded-2xl shadow-md transition-all duration-200 hover:scale-[1.02] active:scale-95 text-center"
          >
            Devenir un partenaire
          </a>
        </div>

        <!-- Mobile Menu Toggle Button -->
        <div class="flex md:hidden items-center">
          <button
            @click="toggleMobileMenu"
            type="button"
            class="p-2 rounded-lg text-white hover:bg-white/10 focus:outline-none transition-colors"
            aria-label="Toggle Menu"
          >
            <svg
              v-if="!isMobileMenuOpen"
              class="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
            <svg
              v-else
              class="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

      </div>
    </div>

    <!-- Mobile Dropdown Navigation -->
    <transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="opacity-0 -translate-y-2"
      enter-to-class="opacity-100 translate-y-0"
      leave-active-class="transition duration-150 ease-in"
      leave-from-class="opacity-100 translate-y-0"
      leave-to-class="opacity-0 -translate-y-2"
    >
      <div v-if="isMobileMenuOpen" class="md:hidden bg-principal-dark border-t border-white/10 px-4 pt-3 pb-6 space-y-3">
        <a
          v-for="link in navLinks"
          :key="link.name"
          :href="link.href"
          @click="handleMobileClick(link.href)"
          :class="[
            'block text-base px-3 py-2 rounded-md transition-colors',
            activeLink === link.href
              ? 'text-secondaire font-bold bg-white/10'
              : 'font-medium text-white/90 hover:text-secondaire hover:bg-white/5'
          ]"
        >
          {{ link.name }}
        </a>
        <div class="pt-2">
          <a
            href="#devenir-partenaire"
            @click="handleMobileClick('#devenir-partenaire')"
            class="block w-full bg-secondaire hover:bg-secondaire-light text-white font-semibold text-center text-base py-3 rounded-xl shadow-sm transition-colors"
          >
            Devenir un partenaire
          </a>
        </div>
      </div>
    </transition>
  </header>
</template>
