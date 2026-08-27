<script setup>
import { ref } from 'vue'

const activeTab = ref(1)

const setTab = (id) => {
  activeTab.value = id
}
</script>

<template>
  <section id="les-profils" class="py-10 sm:py-10 bg-slate-50/50 relative overflow-hidden">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
      
      <!-- Section Header -->
      <div class="text-center max-w-4xl mx-auto space-y-3 sm:space-y-4 mb-8 sm:mb-12">
        <!-- Subtitle Pill -->
        <div>
          <span class="inline-block px-5 py-2 rounded-full border border-secondaire/40 bg-secondaire/5 text-secondaire text-xs sm:text-sm font-bold uppercase tracking-widest">
            TROIS EXPERIENCES DÉDIÉES
          </span>
        </div>

        <!-- Main Heading -->
        <h2 class="text-2xl sm:text-4xl lg:text-5xl font-extrabold text-principal tracking-tight">
          Des fonctionnalités adaptées à chaque rôle
        </h2>

        <!-- Description -->
        <p class="text-texte text-xs sm:text-base font-normal leading-relaxed max-w-3xl mx-auto px-2">
          Rahma Delivery connecte les personnes qui souhaitent envoyer des colis avec celles qui disposent de capacités pour les transporter, qu'il s'agisse d'un voyageur ou d'une entreprise spécialisée. Chaque profil bénéficie d'une expérience adaptée à ses besoins.
        </p>
      </div>

      <!-- Tab Selector Buttons (Horizontally scrollable on mobile) -->
      <div class="flex items-center justify-start sm:justify-center gap-2.5 sm:gap-4 overflow-x-auto no-scrollbar pb-3 pt-1 px-4 sm:px-0 -mx-4 sm:mx-0 snap-x mb-8 sm:mb-12">
        
        <!-- Tab 1: Client Expéditeur -->
        <button
          @click="setTab(1)"
          type="button"
          :class="[
            'shrink-0 snap-start flex items-center gap-2 px-4 sm:px-6 py-3 sm:py-3.5 rounded-2xl border text-xs sm:text-base font-bold whitespace-nowrap transition-all duration-200 cursor-pointer',
            activeTab === 1
              ? 'border-secondaire text-secondaire bg-white shadow-md ring-2 ring-secondaire/20'
              : 'border-slate-200 text-slate-500 bg-white hover:border-slate-300 hover:text-slate-700'
          ]"
        >
        <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 sm:w-8 sm:h-8" viewBox="0 0 32 32">
          <path d="M0 0h32v32H0z" fill="none" />
          <path fill="currentColor" d="M27.303 12a2.66 2.66 0 0 0-1.908.806l-.393.405l-.397-.405a2.66 2.66 0 0 0-3.816 0a2.8 2.8 0 0 0 0 3.896L25.002 21l4.209-4.298a2.8 2.8 0 0 0 0-3.896A2.66 2.66 0 0 0 27.303 12M2 30h2v-5a5.006 5.006 0 0 1 5-5h6a5.006 5.006 0 0 1 5 5v5h2v-5a7.01 7.01 0 0 0-7-7H9a7.01 7.01 0 0 0-7 7ZM12 4a5 5 0 1 1-5 5a5 5 0 0 1 5-5m0-2a7 7 0 1 0 7 7a7 7 0 0 0-7-7" />
        </svg>

          <span>Client Expéditeur</span>
        </button>

        <!-- Tab 2: Voyageur Particulier -->
        <button
          @click="setTab(2)"
          type="button"
          :class="[
            'shrink-0 snap-start flex items-center gap-2 px-4 sm:px-6 py-3 sm:py-3.5 rounded-2xl border text-xs sm:text-base font-bold whitespace-nowrap transition-all duration-200 cursor-pointer',
            activeTab === 2
              ? 'border-secondaire text-secondaire bg-white shadow-md ring-2 ring-secondaire/20'
              : 'border-slate-200 text-slate-500 bg-white hover:border-slate-300 hover:text-slate-700'
          ]"
        >
        <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 sm:w-8 sm:h-8" viewBox="0 0 24 24">
          <path d="M0 0h24v24H0z" fill="none" />
          <path fill="currentColor" d="m16.3 3.45l-1.4 1.4l-7.98-1.33c-.32-.05-.64.05-.87.28L4.28 5.57c-.23.23-.33.56-.28.88s.26.59.56.73L10 9.76l-1.49 1.49l-3.42-.31c-.29-.03-.59.08-.8.29l-1.41 1.41a.99.99 0 0 0-.27.9c.06.33.28.6.59.73l4.58 1.96l1.96 4.58c.13.31.4.53.73.59a1 1 0 0 0 .9-.27l1.41-1.41c.21-.21.32-.5.29-.8l-.31-3.42l1.49-1.49l2.57 5.44a.993.993 0 0 0 1.61.28l1.77-1.77c.23-.23.33-.55.28-.87l-1.33-7.98l1.4-1.4c.57-.57.88-1.32.88-2.12s-.31-1.55-.88-2.12a3 3 0 0 0-4.24 0Zm2.83 2.83l-1.77 1.77c-.23.23-.33.55-.28.87l1.33 7.98l-.4.4l-2.57-5.43a.993.993 0 0 0-1.61-.28L11 14.42a.99.99 0 0 0-.29.8l.31 3.42l-.04.04l-1.54-3.59c-.1-.24-.29-.42-.52-.53l-3.59-1.54l.04-.04l3.42.31c.3.03.59-.08.8-.29l2.83-2.83c.23-.23.33-.56.28-.88s-.26-.59-.56-.73L6.7 5.98l.4-.4l7.98 1.33c.32.05.64-.05.87-.28l1.77-1.77a.996.996 0 0 1 1.7.71c0 .27-.1.52-.29.71" />
        </svg>

          <span>Voyageur Particulier</span>
        </button>

        <!-- Tab 3: Entreprise Pro -->
        <button
          @click="setTab(3)"
          type="button"
          :class="[
            'shrink-0 snap-start flex items-center gap-2 px-4 sm:px-6 py-3 sm:py-3.5 rounded-2xl border text-xs sm:text-base font-bold whitespace-nowrap transition-all duration-200 cursor-pointer',
            activeTab === 3
              ? 'border-secondaire text-secondaire bg-white shadow-md ring-2 ring-secondaire/20'
              : 'border-slate-200 text-slate-500 bg-white hover:border-slate-300 hover:text-slate-700'
          ]"
        >
          <svg class="w-4 h-4 sm:w-8 sm:h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
          <span>Entreprise Pro</span>
        </button>

      </div>

      <!-- Tab Content Area -->
      <div class="bg-white rounded-3xl shadow-sm border border-slate-200/80 p-5 sm:p-10 lg:p-12">
        
        <!-- TAB 1: CLIENT EXPÉDITEUR -->
        <div v-if="activeTab === 1" class="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          <!-- Left Text Details -->
          <div class="lg:col-span-7 space-y-5 sm:space-y-6">
            <span class="inline-block px-4 py-1.5 rounded-full bg-slate-200/80 text-principal font-bold text-xs sm:text-sm border border-slate-300">
              Profil 1 : Client Expéditeur
            </span>

            <h3 class="text-xl sm:text-3xl font-extrabold text-secondaire leading-tight">
              Envoyez vos colis vers l'international en toute sérénité
            </h3>

            <p class="text-texte font-normal text-xs sm:text-base leading-relaxed">
              Vous souhaitez envoyer un colis à vos proches ou clients ? Trouvez immédiatement un voyageur ou un transporteur certifié effectuant le trajet.
            </p>

            <ul class="space-y-3">
              <li class="flex items-start gap-3 text-xs sm:text-base text-texte font-medium">
                <span class="shrink-0 w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-tertiaire/20 text-tertiaire flex items-center justify-center text-[10px] sm:text-xs font-bold mt-0.5">✓</span>
                <span>Recherche simple par ville de départ et de destination</span>
              </li>
              <li class="flex items-start gap-3 text-xs sm:text-base text-texte font-medium">
                <span class="shrink-0 w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-tertiaire/20 text-tertiaire flex items-center justify-center text-[10px] sm:text-xs font-bold mt-0.5">✓</span>
                <span>Transparence totale sur les kilos restants et les dates</span>
              </li>
              <li class="flex items-start gap-3 text-xs sm:text-base text-texte font-medium">
                <span class="shrink-0 w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-tertiaire/20 text-tertiaire flex items-center justify-center text-[10px] sm:text-xs font-bold mt-0.5">✓</span>
                <span>Formulaire de demande détaillé pour vos colis</span>
              </li>
              <li class="flex items-start gap-3 text-xs sm:text-base text-texte font-medium">
                <span class="shrink-0 w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-tertiaire/20 text-tertiaire flex items-center justify-center text-[10px] sm:text-xs font-bold mt-0.5">✓</span>
                <span>Historique des envois et notifications instantanées</span>
              </li>
            </ul>
          </div>

          <!-- Right Mockup Card (Ajusté sur mobile) -->
          <div class="lg:col-span-5">
            <div class="border border-secondaire/30 rounded-3xl p-2.5 sm:p-5 bg-white shadow-lg">
              <div class="bg-principal rounded-2xl overflow-hidden shadow-md">
                
                <!-- Dark Blue Header -->
                <div class="p-3 sm:p-4 text-white flex items-center justify-between border-b border-white/10">
                  <div class="flex items-center gap-1.5 sm:gap-2 font-bold text-xs sm:text-base">
                    <span>Dakar (DKR)</span>
                    <span class="text-white/60">➔</span>
                    <span>Paris (CDG)</span>
                  </div>
                  <span class="bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-[10px] sm:text-xs px-2.5 py-0.5 rounded-full font-bold">
                    Dispo
                  </span>
                </div>

                <!-- Card Body -->
                <div class="bg-slate-50/95 p-3.5 sm:p-5 space-y-3 sm:space-y-4 text-[11px] sm:text-sm">
                  <div class="flex items-center justify-between">
                    <div class="flex items-center gap-1.5 text-slate-600">
                      <span>📅</span>
                      <span>Vol du jour :</span>
                    </div>
                    <span class="font-bold text-slate-800">15 Septembre 2026</span>
                  </div>

                  <div class="flex items-center justify-between">
                    <div class="flex items-center gap-1.5 text-slate-600">
                      <span>👤</span>
                      <span>Transporteur :</span>
                    </div>
                    <span class="font-bold text-slate-800">Moussa K. (Vérifié)</span>
                  </div>

                  <div class="flex items-center justify-between">
                    <div class="flex items-center gap-1.5 text-slate-600">
                      <span>📦</span>
                      <span>Capacité initiale :</span>
                    </div>
                    <span class="font-bold text-slate-800">20 kg</span>
                  </div>

                  <div class="pt-2 border-t border-slate-200 space-y-1.5">
                    <div class="flex items-center justify-between font-bold text-[11px] sm:text-sm">
                      <span class="text-principal">Capacité restante :</span>
                      <span class="text-principal">12 kg disponibles</span>
                    </div>
                    <div class="w-full h-2 sm:h-2.5 bg-slate-200 rounded-full overflow-hidden">
                      <div class="h-full bg-principal rounded-full w-[60%]"></div>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          </div>

        </div>

        <!-- TAB 2: VOYAGEUR PARTICULIER -->
        <div v-if="activeTab === 2" class="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          <!-- Left Text Details -->
          <div class="lg:col-span-7 space-y-5 sm:space-y-6">
            <span class="inline-block px-4 py-1.5 rounded-full bg-slate-200/80 text-principal font-bold text-xs sm:text-sm border border-slate-300">
              Profil 2 : Voyageur particulier
            </span>

            <h3 class="text-xl sm:text-3xl font-extrabold text-secondaire leading-tight">
              Rentabilisez vos bagages et amortissez vos billets d'avion
            </h3>

            <p class="text-texte font-normal text-xs sm:text-base leading-relaxed">
              Vous avez prévu un voyage et il vous reste de la place dans vos bagages ? Proposez votre capacité disponible sur Rahma Delivery et transportez les colis de personnes qui en ont besoin.
            </p>

            <ul class="space-y-3">
              <li class="flex items-start gap-3 text-xs sm:text-base text-texte font-medium">
                <span class="shrink-0 w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-tertiaire/20 text-tertiaire flex items-center justify-center text-[10px] sm:text-xs font-bold mt-0.5">✓</span>
                <span>Publication ultra-rapide de votre trajet (5 kg à 25 kg)</span>
              </li>
              <li class="flex items-start gap-3 text-xs sm:text-base text-texte font-medium">
                <span class="shrink-0 w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-tertiaire/20 text-tertiaire flex items-center justify-center text-[10px] sm:text-xs font-bold mt-0.5">✓</span>
                <span>Contrôle et vérification des demandes reçues</span>
              </li>
              <li class="flex items-start gap-3 text-xs sm:text-base text-texte font-medium">
                <span class="shrink-0 w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-tertiaire/20 text-tertiaire flex items-center justify-center text-[10px] sm:text-xs font-bold mt-0.5">✓</span>
                <span>Liberté absolue d'accepter ou de refuser chaque colis</span>
              </li>
              <li class="flex items-start gap-3 text-xs sm:text-base text-texte font-medium">
                <span class="shrink-0 w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-tertiaire/20 text-tertiaire flex items-center justify-center text-[10px] sm:text-xs font-bold mt-0.5">✓</span>
                <span>Déduction automatique des kilos acceptés</span>
              </li>
            </ul>
          </div>

          <!-- Right Mockup Card (Ajusté sur mobile) -->
          <div class="lg:col-span-5">
            <div class="border border-secondaire/30 rounded-3xl p-2.5 sm:p-5 bg-white shadow-lg">
              <div class="bg-principal rounded-2xl overflow-hidden shadow-md">
                
                <!-- Dark Blue Header -->
                <div class="p-3 sm:p-4 text-white flex items-center justify-between border-b border-white/10">
                  <span class="font-bold text-xs sm:text-base">Mes Prochains Vols</span>
                  <span class="bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-[10px] sm:text-xs px-2.5 py-0.5 rounded-full font-bold">
                    Dispo
                  </span>
                </div>

                <!-- Card Body -->
                <div class="bg-slate-50/95 p-3.5 sm:p-5 space-y-3 sm:space-y-4 text-[11px] sm:text-sm">
                  <div class="flex items-center justify-between">
                    <span class="text-slate-600 font-medium">Vol :</span>
                    <span class="font-bold text-tertiaire">Dakar ➔ Madrid</span>
                  </div>

                  <div class="flex items-center justify-between">
                    <span class="text-slate-600 font-medium">Espace Bagage :</span>
                    <span class="font-bold text-tertiaire">20 kg au total</span>
                  </div>

                  <div class="pt-2 border-t border-slate-200 space-y-1.5">
                    <div class="flex items-center justify-between font-bold text-[11px] sm:text-sm">
                      <span class="text-slate-700">Demandes acceptées :</span>
                      <span class="text-tertiaire">8Kg/15Kg</span>
                    </div>
                    <div class="w-full h-2 sm:h-2.5 bg-slate-200 rounded-full overflow-hidden">
                      <div class="h-full bg-principal rounded-full w-[53%]"></div>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          </div>

        </div>

        <!-- TAB 3: ENTREPRISE PRO -->
        <div v-if="activeTab === 3" class="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          <!-- Left Text Details -->
          <div class="lg:col-span-7 space-y-5 sm:space-y-6">
            <span class="inline-block px-4 py-1.5 rounded-full bg-slate-200/80 text-principal font-bold text-xs sm:text-sm border border-slate-300">
              Profil 3 : Entreprise Pro
            </span>

            <h3 class="text-xl sm:text-3xl font-extrabold text-secondaire leading-tight">
              Un véritable cockpit professionnel de gestion de transport
            </h3>

            <p class="text-texte font-normal text-xs sm:text-base leading-relaxed">
              Vous êtes une entreprise spécialisée dans le transport de colis à l'international ? Publiez vos voyages, indiquez les capacités disponibles et recevez directement les demandes des clients pour vos acheminements.
            </p>

            <ul class="space-y-3">
              <li class="flex items-start gap-3 text-xs sm:text-base text-texte font-medium">
                <span class="shrink-0 w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-tertiaire/20 text-tertiaire flex items-center justify-center text-[10px] sm:text-xs font-bold mt-0.5">✓</span>
                <span>Gestion multi-voyages et lignes régulières internationales</span>
              </li>
              <li class="flex items-start gap-3 text-xs sm:text-base text-texte font-medium">
                <span class="shrink-0 w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-tertiaire/20 text-tertiaire flex items-center justify-center text-[10px] sm:text-xs font-bold mt-0.5">✓</span>
                <span>Tableau de bord pro : suivi des capacités réservées & disponibles</span>
              </li>
              <li class="flex items-start gap-3 text-xs sm:text-base text-texte font-medium">
                <span class="shrink-0 w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-tertiaire/20 text-tertiaire flex items-center justify-center text-[10px] sm:text-xs font-bold mt-0.5">✓</span>
                <span>Gestion des statuts de livraison (Transit, Livré, Attente)</span>
              </li>
              <li class="flex items-start gap-3 text-xs sm:text-base text-texte font-medium">
                <span class="shrink-0 w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-tertiaire/20 text-tertiaire flex items-center justify-center text-[10px] sm:text-xs font-bold mt-0.5">✓</span>
                <span>Outils de statistique et d'optimisation de fret</span>
              </li>
            </ul>
          </div>

          <!-- Right Mockup Card (Ajusté sur mobile) -->
          <div class="lg:col-span-5">
            <div class="border border-secondaire/30 rounded-3xl p-2.5 sm:p-5 bg-white shadow-lg">
              <div class="bg-principal rounded-2xl overflow-hidden shadow-md">
                
                <!-- Dark Blue Header -->
                <div class="p-3 sm:p-4 text-white flex items-center justify-between border-b border-white/10">
                  <span class="font-bold text-xs sm:text-base">Cockpit Entreprise Pro</span>
                  <span class="bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-[10px] sm:text-xs px-2.5 py-0.5 rounded-full font-bold">
                    Dispo
                  </span>
                </div>

                <!-- Card Body -->
                <div class="bg-slate-50/95 p-3.5 sm:p-5 space-y-3 sm:space-y-4 text-[11px] sm:text-sm">
                  
                  <!-- 3 Stats KPI Boxes -->
                  <div class="grid grid-cols-3 gap-1.5 sm:gap-2 text-center">
                    <div class="bg-white p-2 sm:p-2.5 rounded-xl border border-slate-200 shadow-2xs">
                      <p class="font-extrabold text-xs sm:text-base text-principal">4</p>
                      <p class="text-[9px] sm:text-xs text-slate-500 font-medium">Vols Actifs</p>
                    </div>
                    <div class="bg-white p-2 sm:p-2.5 rounded-xl border border-slate-200 shadow-2xs">
                      <p class="font-extrabold text-xs sm:text-base text-principal">850 kg</p>
                      <p class="text-[9px] sm:text-xs text-slate-500 font-medium">Capacité</p>
                    </div>
                    <div class="bg-white p-2 sm:p-2.5 rounded-xl border border-slate-200 shadow-2xs">
                      <p class="font-extrabold text-xs sm:text-base text-secondaire">240 kg</p>
                      <p class="text-[9px] sm:text-xs text-slate-500 font-medium">Restants</p>
                    </div>
                  </div>

                  <!-- Flight Row Card -->
                  <div class="bg-slate-200/60 p-2.5 sm:p-4 rounded-xl flex items-center justify-between">
                    <div>
                      <p class="font-bold text-principal text-[11px] sm:text-sm">Dakar ➔ Paris (#102)</p>
                      <p class="text-[9px] sm:text-xs text-slate-500 font-medium mt-0.5">300kg total | 210kg réservé</p>
                    </div>
                    <span class="font-bold text-tertiaire text-[10px] sm:text-sm whitespace-nowrap">
                      70% Rempli
                    </span>
                  </div>

                </div>

              </div>
            </div>
          </div>

        </div>

      </div>

    </div>
  </section>
</template>
