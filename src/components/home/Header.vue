<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { RouterLink } from 'vue-router'
import ThemeToggle from '@/components/common/ThemeToggle.vue'

const isMobileMenuOpen = ref(false)
const activeLink = ref('#accueil')

const navLinks = [
  { name: 'Accueil', href: '#accueil' },
  { name: 'A propos', href: '#a-propos' },
  { name: 'Les profils', href: '#les-profils' },
  { name: 'Comment ça marche', href: '#comment-ca-marche' },
  { name: 'Contact', href: '#devenir-partenaire' },
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

let observer = null

onMounted(() => {
  if (window.location.hash) {
    activeLink.value = window.location.hash
  }

  // Scrollspy via IntersectionObserver
  const sectionIds = ['accueil', 'a-propos', 'les-profils', 'comment-ca-marche', 'devenir-partenaire']
  const sections = sectionIds
    .map(id => document.getElementById(id))
    .filter(Boolean)

  if (sections.length > 0) {
    const observerOptions = {
      root: null,
      rootMargin: '-30% 0px -50% 0px', // Active la section quand elle entre dans la zone médiane de l'écran
      threshold: 0
    }

    observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          activeLink.value = `#${entry.target.id}`
        }
      })
    }, observerOptions)

    sections.forEach(section => observer.observe(section))
  }
})

onUnmounted(() => {
  if (observer) {
    observer.disconnect()
  }
})
</script>

<template>
  <header class="sticky top-0 z-50 bg-principal dark:bg-slate-900 text-white shadow-md border-b border-white/10 dark:border-slate-800 transition-colors duration-300">
    <div class="max-w-7xl 2xl:max-w-[1536px] mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex items-center justify-between h-20">

        <!-- Logo Blanc -->
        <a href="#accueil" @click="setActiveLink('#accueil')" class="flex items-center shrink-0">
          <img src="@/assets/images/logo-blanc.svg" alt="Rahma Delivery Logo Blanc"
            class="h-9 sm:h-11 lg:h-12 w-auto object-contain" />
        </a>

        <!-- Navigation Links (Actif sur Ordinateur >= 1024px) -->
        <nav class="hidden lg:flex items-center gap-6 xl:gap-8">
          <a v-for="link in navLinks" :key="link.name" :href="link.href" @click="setActiveLink(link.href)" :class="[
            'text-sm xl:text-base transition-colors duration-200 py-1',
            activeLink === link.href
              ? 'text-secondaire font-bold border-b-2 border-secondaire'
              : 'font-medium text-white hover:text-secondaire'
          ]">
            {{ link.name }}
          </a>
        </nav>

        <!-- Desktop Action Buttons (>= 1024px) -->
        <div class="hidden lg:flex items-center gap-3">
          <ThemeToggle variant="transparent" />

          <RouterLink
            to="/auth/login"
            class="bg-white/10 hover:bg-white/20 text-white font-semibold text-xs xl:text-sm px-4 xl:px-5 py-2.5 rounded-2xl border border-white/20 transition-all duration-200 text-center whitespace-nowrap"
          >
            Connexion / Profil
          </RouterLink>
          <a href="#devenir-partenaire" @click="setActiveLink('#devenir-partenaire')"
            class="bg-secondaire hover:bg-secondaire-light text-white font-semibold text-xs xl:text-sm px-5 xl:px-6 py-2.5 rounded-2xl shadow-md transition-all duration-200 hover:scale-[1.02] active:scale-95 text-center whitespace-nowrap">
            Devenir un partenaire
          </a>
        </div>

        <!-- Mobile & Tablet Menu Toggle Button (< 1024px) -->
        <div class="flex lg:hidden items-center gap-2">
          <ThemeToggle variant="transparent" />
          <button @click="toggleMobileMenu" type="button"
            class="p-2.5 rounded-xl text-white hover:bg-white/10 focus:outline-none transition-colors"
            aria-label="Toggle Menu">
            <svg v-if="!isMobileMenuOpen" class="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
            <svg v-else class="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

      </div>
    </div>

    <!-- Mobile & Tablet Dropdown Navigation (< 1024px) -->
    <transition enter-active-class="transition duration-200 ease-out" enter-from-class="opacity-0 -translate-y-2"
      enter-to-class="opacity-100 translate-y-0" leave-active-class="transition duration-150 ease-in"
      leave-from-class="opacity-100 translate-y-0" leave-to-class="opacity-0 -translate-y-2">
      <div v-if="isMobileMenuOpen"
        class="lg:hidden bg-principal-dark border-t border-white/10 px-4 pt-4 pb-6 space-y-3 shadow-xl">
        <a v-for="link in navLinks" :key="link.name" :href="link.href" @click="handleMobileClick(link.href)" :class="[
          'block text-base px-4 py-2.5 rounded-xl transition-colors',
          activeLink === link.href
            ? 'text-secondaire font-bold bg-white/10'
            : 'font-medium text-white/90 hover:text-secondaire hover:bg-white/5'
        ]">
          {{ link.name }}
        </a>
        <div class="pt-3 border-t border-white/10 space-y-2">
          <RouterLink
            to="/auth/login"
            @click="isMobileMenuOpen = false"
            class="block w-full bg-white/10 hover:bg-white/20 text-white font-bold text-center text-base py-3 rounded-xl border border-white/20 transition-colors"
          >
            Connexion / Mon Profil
          </RouterLink>
          <a href="#devenir-partenaire" @click="handleMobileClick('#devenir-partenaire')"
            class="block w-full bg-secondaire hover:bg-secondaire-light text-white font-bold text-center text-base py-3.5 rounded-xl shadow-md transition-colors">
            Devenir un partenaire
          </a>
        </div>
      </div>
    </transition>
  </header>
</template>
