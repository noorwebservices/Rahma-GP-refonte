<script setup>
const navLinks = [
  { name: 'Accueil', href: '#accueil' },
  { name: 'A propos', href: '#a-propos' },
  { name: 'Les profils', href: '#les-profils' },
  { name: 'Comment ça marche', href: '#comment-ca-marche' },
  { name: 'Contact', href: '#devenir-partenaire' },
]
</script>

<template>
  <footer class="bg-principal text-white pt-12 pb-6 border-t border-white/10">
    <div class="max-w-7xl 2xl:max-w-[1536px] mx-auto px-4 sm:px-6 lg:px-8">

      <!-- Main Footer Columns Grid -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12 pb-10 items-start">

        <!-- Column 1: Logo, Slogan & Social Icons -->
        <div class="space-y-4">
          <a href="#accueil" class="inline-block">
            <img src="@/assets/images/logo-rouge.svg" alt="Rahma Delivery Logo Rouge"
              class="h-12 sm:h-14 w-auto object-contain" />
          </a>
          <p class="text-sm text-white/90 font-normal">
            Votre partenaire de livraison de confiance
          </p>

          <!-- Social Icons Circles -->
          <div class="flex items-center gap-3 pt-2">
            <!-- Facebook -->
            <a href="https://www.facebook.com/profile.php?id=61575125610585" target="_blank" rel="noopener noreferrer" aria-label="Facebook"
              class="w-10 h-10 rounded-full border border-white/40 flex items-center justify-center text-white hover:bg-white/10 hover:border-white transition-colors shrink-0">
              <svg class="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path
                  d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
              </svg>
            </a>

            <!-- Instagram -->
            <a href="https://www.instagram.com/noorwebservices/" target="_blank" rel="noopener noreferrer" aria-label="Instagram"
              class="w-10 h-10 rounded-full border border-white/40 flex items-center justify-center text-white hover:bg-white/10 hover:border-white transition-colors shrink-0">
              <svg class="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path
                  d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
              </svg>
            </a>

            <!-- LinkedIn -->
            <a href="https://www.linkedin.com/company/noor-web-services/" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn"
              class="w-10 h-10 rounded-full border border-white/40 flex items-center justify-center text-white hover:bg-white/10 hover:border-white transition-colors shrink-0">
              <svg class="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path
                  d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
              </svg>
            </a>

            <!-- TikTok -->
            <a href="https://www.tiktok.com/@rahmadelivery?_r=1&_t=ZS-99L3qBdPjhk" target="_blank" rel="noopener noreferrer" aria-label="TikTok"
              class="w-10 h-10 rounded-full border border-white/40 flex items-center justify-center text-white hover:bg-white/10 hover:border-white transition-colors shrink-0">
              <svg class="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path
                  d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64c.29 0 .56.04.82.1v-3.5a6.37 6.37 0 0 0-.82-.05A6.34 6.34 0 0 0 3.15 15.66a6.34 6.34 0 0 0 10.86 4.46V13a8.3 8.3 0 0 0 5.17 1.8V11.3a4.85 4.85 0 0 1-3.59-1.58V6.69z" />
              </svg>
            </a>
          </div>
        </div>

        <!-- Column 2: Navigation -->
        <div class="space-y-4 md:text-center">
          <h3 class="text-lg font-bold text-white tracking-wide">
            Navigation
          </h3>
          <ul class="flex flex-wrap md:justify-center items-center gap-x-5 gap-y-2 text-sm text-white/90">
            <li v-for="link in navLinks" :key="link.name">
              <a :href="link.href" class="hover:text-white transition-colors">
                {{ link.name }}
              </a>
            </li>
          </ul>
        </div>

        <!-- Column 3: Coordonnées -->
        <div class="space-y-4 md:text-right">
          <h3 class="text-lg font-bold text-white tracking-wide">
            Coordonnées
          </h3>
          <div class="text-sm text-white/90 space-y-2">
            <p>Adresse : Front de Terre Villa N°75 Dakar, Sénégal</p>
            <p>Téléphone : <a href="tel:+221781860290" class="hover:text-white underline-offset-2 hover:underline transition-colors">781860290</a> / <a href="tel:+221776859660" class="hover:text-white underline-offset-2 hover:underline transition-colors">776859660</a></p>
            <p>Email : <a href="mailto:contact@noorwebservices.com" class="hover:text-white underline-offset-2 hover:underline transition-colors">contact@noorwebservices.com</a></p>
          </div>
        </div>

      </div>

      <!-- Copyright Bottom Bar -->
      <div class="pt-6 border-t border-white/20 text-center">
        <p class="text-xs sm:text-sm text-white/80">
          © 2024 Rehma Delivery. Tous droits réservés. by binAbd
        </p>
      </div>

    </div>
  </footer>
</template>
