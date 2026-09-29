<template>
  <div class="space-y-6">
    
    <!-- Filter Header Card & Tab Switcher -->
    <div class="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-3xl p-5 shadow-2xs space-y-4">
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
        
        <!-- Tab Switcher: Voyageurs / Entreprises GP -->
        <div class="bg-[#FAF7F2] dark:bg-slate-800 p-1 rounded-2xl flex items-center border border-gray-200 dark:border-slate-700 overflow-x-auto shrink-0">
          <button
            @click="activeTab = 'voyageur'; fetchData()"
            class="px-5 py-2.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap"
            :class="activeTab === 'voyageur' ? 'bg-[#053754] text-white shadow-2xs' : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'"
          >
            <span>✈️</span>
            <span>Voyageurs Particuliers</span>
          </button>

          <button
            @click="activeTab = 'entreprise'; fetchData()"
            class="px-5 py-2.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap"
            :class="activeTab === 'entreprise' ? 'bg-[#053754] text-white shadow-2xs' : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'"
          >
            <span>🏢</span>
            <span>Entreprises GP & Agences</span>
          </button>
        </div>

        <!-- Search Input -->
        <div class="relative w-full md:w-80">
          <svg class="w-5 h-5 absolute left-3.5 top-3 text-gray-400 dark:text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input 
            v-model="search"
            @input="fetchData"
            type="text" 
            :placeholder="activeTab === 'voyageur' ? 'Rechercher par nom, email, tél voyageur...' : 'Rechercher par entreprise, gérant...'"
            class="w-full bg-[#FAF7F2] dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-2xl pl-10 pr-4 py-2.5 text-xs sm:text-sm text-gray-800 dark:text-slate-100 placeholder-gray-400 dark:placeholder-slate-500 focus:outline-none focus:border-[#074C72] dark:focus:border-sky-400 transition-colors"
          />
        </div>

      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="bg-white dark:bg-slate-900 rounded-3xl p-12 text-center border border-gray-200 dark:border-slate-800 shadow-2xs space-y-3">
      <div class="w-10 h-10 border-4 border-[#053754] dark:border-sky-400 border-t-transparent rounded-full animate-spin mx-auto"></div>
      <p class="text-xs font-bold text-[#074C72] dark:text-sky-300">
        Chargement des données {{ activeTab === 'voyageur' ? 'des voyageurs' : 'des entreprises GP' }}...
      </p>
    </div>

    <!-- Empty State -->
    <div v-else-if="itemsList.length === 0" class="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-3xl p-12 text-center text-gray-400 dark:text-slate-400 font-semibold text-sm">
      Aucun {{ activeTab === 'voyageur' ? 'voyageur' : 'entreprise GP' }} trouvé.
    </div>

    <!-- TAB 1: Voyageurs Particuliers Cards List with Accordion -->
    <div v-else-if="activeTab === 'voyageur'" class="space-y-4">
      <div 
        v-for="v in paginatedItems" 
        :key="v.id" 
        class="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-2xs hover:shadow-md transition-all"
      >
        <!-- Traveler Card Header -->
        <div class="p-4 sm:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 cursor-pointer bg-white dark:bg-slate-900 hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors" @click="toggleExpand(v.id)">
          
          <div class="flex items-center justify-between md:justify-start gap-3 sm:gap-4 w-full md:w-auto">
            <div class="flex items-center gap-3 sm:gap-4">
              <div v-if="v.user?.avatar" class="w-11 h-11 sm:w-12 sm:h-12 rounded-full overflow-hidden shrink-0 border-2 border-[#053754] dark:border-sky-400">
                <img :src="formatImageUrl(v.user.avatar)" class="w-full h-full object-cover" />
              </div>
              <div v-else class="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-[#053754] text-white font-extrabold text-xs sm:text-sm flex items-center justify-center shrink-0 border-2 border-[#053754] dark:border-sky-400 shadow-2xs">
                {{ getInitials(v.user?.prenom, v.user?.nom) }}
              </div>

              <div>
                <div class="flex flex-wrap items-center gap-1.5 sm:gap-2">
                  <h3 class="font-extrabold text-sm sm:text-base text-[#053754] dark:text-sky-300">{{ v.user?.prenom }} {{ v.user?.nom }}</h3>
                  <span class="px-2 py-0.5 rounded-full text-[9px] sm:text-[10px] font-black uppercase tracking-wider bg-sky-50 dark:bg-sky-950/80 text-[#074C72] dark:text-sky-300 border border-sky-200 dark:border-sky-800">
                    Voyageur {{ v.statut }}
                  </span>
                </div>
                <p class="text-xs text-gray-500 dark:text-slate-400 font-medium mt-0.5">{{ v.user?.email || v.user?.telephone }}</p>
              </div>
            </div>

            <!-- Toggle Arrow (Mobile Top) -->
            <div class="w-8 h-8 rounded-full bg-[#F3F4F6] dark:bg-slate-800 text-[#053754] dark:text-sky-300 flex items-center justify-center shrink-0 md:hidden">
              <svg class="w-4 h-4 transition-transform duration-200" :class="expanded[v.id] ? 'rotate-180' : ''" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>

          <!-- Quick Metrics Pills -->
          <div class="flex items-center justify-between md:justify-end gap-2 sm:gap-3 w-full md:w-auto">
            <div class="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 w-full md:w-auto text-xs">
              
              <div class="px-3 py-2 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-center">
                <span class="text-gray-400 dark:text-slate-400 block font-bold text-[10px] uppercase">Voyages</span>
                <span class="text-[#053754] dark:text-slate-100 font-black text-sm">{{ v.statistiques?.total_voyages || 0 }}</span>
              </div>

              <div class="px-3 py-2 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-center">
                <span class="text-gray-400 dark:text-slate-400 block font-bold text-[10px] uppercase">Réservations</span>
                <span class="text-[#053754] dark:text-slate-100 font-black text-sm">{{ v.statistiques?.total_reservations || 0 }}</span>
              </div>

              <div class="px-3 py-2 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-center">
                <span class="text-gray-400 dark:text-slate-400 block font-bold text-[10px] uppercase">Messages</span>
                <span class="text-[#053754] dark:text-slate-100 font-black text-sm">{{ v.statistiques?.total_messages || 0 }}</span>
              </div>

              <!-- DB Capacity Usage Metric -->
              <div class="px-3 py-2 rounded-2xl bg-indigo-50 dark:bg-indigo-950/80 border border-indigo-200 dark:border-indigo-900 text-center">
                <span class="text-indigo-600 dark:text-indigo-300 block font-bold text-[10px] uppercase">Capacité BD</span>
                <span class="text-indigo-800 dark:text-indigo-200 font-black text-sm whitespace-nowrap">{{ v.statistiques?.capacite_donnees_bd?.formatted || '0 Ko' }}</span>
              </div>

            </div>

            <!-- Toggle Arrow (Desktop) -->
            <div class="w-8 h-8 rounded-full bg-[#F3F4F6] dark:bg-slate-800 text-[#053754] dark:text-sky-300 hidden md:flex items-center justify-center shrink-0">
              <svg class="w-4 h-4 transition-transform duration-200" :class="expanded[v.id] ? 'rotate-180' : ''" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>

        </div>

        <!-- Accordion Content: Trips List & Reservations Table -->
        <div v-if="expanded[v.id]" class="border-t border-gray-100 dark:border-slate-800 bg-[#FAF7F2] dark:bg-slate-950/70 p-4 sm:p-6 space-y-6">
          
          <h4 class="font-extrabold text-xs text-[#074C72] dark:text-sky-300 uppercase tracking-wider flex items-center gap-2">
            <span>Voyages publiés par {{ v.user?.prenom }}</span>
            <span class="text-gray-400 dark:text-slate-400 font-medium">({{ v.voyages_details?.length || 0 }})</span>
          </h4>

          <div v-if="!v.voyages_details || v.voyages_details.length === 0" class="text-xs text-gray-400 dark:text-slate-400 italic py-2">
            Aucun voyage publié par ce voyageur.
          </div>

          <div v-else class="space-y-4">
            <div v-for="voyage in getPaginatedVoyages(v.id, v.voyages_details)" :key="voyage.id" class="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 shadow-2xs space-y-4">
              
              <!-- Trip Header -->
              <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-100 dark:border-slate-800 pb-3">
                <div class="flex items-center gap-3">
                  <span class="font-black text-[#053754] dark:text-sky-300 text-base sm:text-lg">
                    ✈️ {{ voyage.ville_depart }} ➔ {{ voyage.ville_destination || voyage.ville_arrivee }}
                  </span>
                  <span class="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                    {{ voyage.statut }}
                  </span>
                </div>
                <div class="text-xs text-gray-600 dark:text-slate-300 font-semibold flex items-center gap-4 flex-wrap">
                  <span>Départ : <strong class="text-[#053754] dark:text-slate-100">{{ formatDate(voyage.date_depart) }}</strong></span>
                  <span>Poids réservé : <strong class="text-[#B50302] dark:text-red-400 font-black">{{ voyage.poids_reserve || 0 }} kg</strong></span>
                  <span>Capacité dispo : <strong class="text-emerald-700 dark:text-emerald-400 font-black">{{ voyage.kilos_disponibles }} kg</strong> dispos / <strong>{{ voyage.capacite_totale }} kg</strong> totaux</span>
                </div>
              </div>

              <!-- Associated Reservations Table -->
              <div class="space-y-2">
                <span class="text-xs font-extrabold text-gray-400 dark:text-slate-400 uppercase tracking-wider block">
                  Tableau des Réservations Associées ({{ voyage.reservations_count || 0 }})
                </span>

                <div v-if="!voyage.reservations || voyage.reservations.length === 0" class="text-xs text-gray-400 dark:text-slate-400 italic">
                  Aucune réservation enregistrée sur ce voyage.
                </div>

                <div v-else class="overflow-x-auto rounded-2xl border border-gray-200 dark:border-slate-800">
                  <table class="w-full min-w-[750px] text-left text-xs bg-white dark:bg-slate-900">
                    <thead class="bg-slate-50 dark:bg-slate-800/80 text-[#053754] dark:text-sky-300 uppercase tracking-wider font-extrabold border-b border-gray-200 dark:border-slate-800 text-[10px] whitespace-nowrap">
                      <tr>
                        <th class="px-4 py-2.5">Code Suivi</th>
                        <th class="px-4 py-2.5">Client Expéditeur</th>
                        <th class="px-4 py-2.5">Poids réservé</th>
                        <th class="px-4 py-2.5">Statut Réservation</th>
                        <th class="px-4 py-2.5 text-right">Messages Échangés</th>
                      </tr>
                    </thead>
                    <tbody class="divide-y divide-gray-100 dark:divide-slate-800 font-medium text-gray-700 dark:text-slate-300">
                      <tr v-for="res in getPaginatedReservations(voyage.id, voyage.reservations)" :key="res.id" class="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors">
                        <td class="px-4 py-2.5 font-mono font-black text-[#053754] dark:text-sky-300 whitespace-nowrap">
                          #{{ res.code_suivi }}
                        </td>
                        <td class="px-4 py-2.5 font-bold text-gray-800 dark:text-slate-200 whitespace-nowrap">
                          {{ res.client_nom }}
                        </td>
                        <td class="px-4 py-2.5 font-bold text-[#B50302] dark:text-red-400 whitespace-nowrap">
                          {{ res.poids_kg }} kg
                        </td>
                        <td class="px-4 py-2.5 whitespace-nowrap">
                          <span class="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold capitalize border bg-sky-50 dark:bg-sky-950/80 text-[#074C72] dark:text-sky-300 border-sky-200 dark:border-sky-800 whitespace-nowrap">
                            {{ res.statut }}
                          </span>
                        </td>
                        <td class="px-4 py-2.5 text-right font-bold text-[#074C72] dark:text-sky-300 whitespace-nowrap">
                          <span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#D8ECF8] dark:bg-sky-950 text-[#074C72] dark:text-sky-300 font-black whitespace-nowrap">
                            💬 {{ res.messages_count || 0 }} message(s)
                          </span>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>
    </div>

    <!-- TAB 2: Entreprises GP & Agences Cards List with Accordion -->
    <div v-else-if="activeTab === 'entreprise'" class="space-y-4">
      <div 
        v-for="e in paginatedItems" 
        :key="e.id" 
        class="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-2xs hover:shadow-md transition-all"
      >
        <!-- Enterprise Card Header -->
        <div class="p-4 sm:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 cursor-pointer bg-white dark:bg-slate-900 hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors" @click="toggleExpand(e.id)">
          
          <div class="flex items-center justify-between md:justify-start gap-3 sm:gap-4 w-full md:w-auto">
            <div class="flex items-center gap-3 sm:gap-4">
              <div v-if="e.logo" class="w-11 h-11 sm:w-12 sm:h-12 rounded-full overflow-hidden shrink-0 border-2 border-[#053754] dark:border-sky-400 bg-white p-0.5">
                <img :src="formatImageUrl(e.logo)" class="w-full h-full object-contain" />
              </div>
              <div v-else class="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-[#053754] text-white font-extrabold text-xs sm:text-sm flex items-center justify-center shrink-0 border-2 border-[#053754] dark:border-sky-400 shadow-2xs">
                🏢
              </div>

              <div>
                <div class="flex flex-wrap items-center gap-1.5 sm:gap-2">
                  <h3 class="font-extrabold text-sm sm:text-base text-[#053754] dark:text-sky-300">{{ e.nom || e.nom_entreprise }}</h3>
                  <span class="px-2.5 py-0.5 rounded-full text-[9px] sm:text-[10px] font-black uppercase tracking-wider border" :class="e.statut_verification === 'verifiee' ? 'bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border-emerald-200' : 'bg-amber-50 dark:bg-amber-950/80 text-amber-800 border-amber-200'">
                    Entreprise {{ e.statut_verification === 'verifiee' ? 'Validée' : 'En attente' }}
                  </span>
                </div>
                <p class="text-xs text-gray-500 dark:text-slate-400 font-medium mt-0.5">
                  Gérant: <strong>{{ e.gerant ? (e.gerant.prenom + ' ' + e.gerant.nom) : '—' }}</strong> • {{ e.email || e.telephone }}
                </p>
              </div>
            </div>

            <!-- Toggle Arrow (Mobile Top) -->
            <div class="w-8 h-8 rounded-full bg-[#F3F4F6] dark:bg-slate-800 text-[#053754] dark:text-sky-300 flex items-center justify-center shrink-0 md:hidden">
              <svg class="w-4 h-4 transition-transform duration-200" :class="expanded[e.id] ? 'rotate-180' : ''" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>

          <!-- Quick Metrics Pills -->
          <div class="flex items-center justify-between md:justify-end gap-2 sm:gap-3 w-full md:w-auto">
            <div class="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 w-full md:w-auto text-xs">
              
              <div class="px-3 py-2 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-center">
                <span class="text-gray-400 dark:text-slate-400 block font-bold text-[10px] uppercase">Voyages</span>
                <span class="text-[#053754] dark:text-slate-100 font-black text-sm">{{ e.statistiques?.total_voyages || 0 }}</span>
              </div>

              <div class="px-3 py-2 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-center">
                <span class="text-gray-400 dark:text-slate-400 block font-bold text-[10px] uppercase">Réservations</span>
                <span class="text-[#053754] dark:text-slate-100 font-black text-sm">{{ e.statistiques?.total_reservations || 0 }}</span>
              </div>

              <div class="px-3 py-2 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-center">
                <span class="text-gray-400 dark:text-slate-400 block font-bold text-[10px] uppercase">Agents GP</span>
                <span class="text-indigo-600 dark:text-indigo-400 font-black text-sm">{{ e.agents ? e.agents.length : 0 }}</span>
              </div>

              <!-- DB Capacity Usage Metric -->
              <div class="px-3 py-2 rounded-2xl bg-indigo-50 dark:bg-indigo-950/80 border border-indigo-200 dark:border-indigo-900 text-center">
                <span class="text-indigo-600 dark:text-indigo-300 block font-bold text-[10px] uppercase">Capacité BD</span>
                <span class="text-indigo-800 dark:text-indigo-200 font-black text-sm whitespace-nowrap">{{ e.statistiques?.capacite_donnees_bd?.formatted || '0 Ko' }}</span>
              </div>

            </div>

            <!-- Toggle Arrow (Desktop) -->
            <div class="w-8 h-8 rounded-full bg-[#F3F4F6] dark:bg-slate-800 text-[#053754] dark:text-sky-300 hidden md:flex items-center justify-center shrink-0">
              <svg class="w-4 h-4 transition-transform duration-200" :class="expanded[e.id] ? 'rotate-180' : ''" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>

        </div>

        <!-- Accordion Content: Enterprise Trips List & Reservations Table -->
        <div v-if="expanded[e.id]" class="border-t border-gray-100 dark:border-slate-800 bg-[#FAF7F2] dark:bg-slate-950/70 p-4 sm:p-6 space-y-6">
          
          <h4 class="font-extrabold text-xs text-[#074C72] dark:text-sky-300 uppercase tracking-wider flex items-center gap-2">
            <span>Voyages créés par l'Entreprise GP "{{ e.nom || e.nom_entreprise }}"</span>
            <span class="text-gray-400 dark:text-slate-400 font-medium">({{ e.voyages_details?.length || 0 }})</span>
          </h4>

          <div v-if="!e.voyages_details || e.voyages_details.length === 0" class="text-xs text-gray-400 dark:text-slate-400 italic py-2">
            Aucun voyage enregistré pour cette entreprise.
          </div>

          <div v-else class="space-y-4">
            <div v-for="voyage in getPaginatedVoyages(e.id, e.voyages_details)" :key="voyage.id" class="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 shadow-2xs space-y-4">
              
              <!-- Trip Header -->
              <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-100 dark:border-slate-800 pb-3">
                <div class="flex items-center gap-3">
                  <span class="font-black text-[#053754] dark:text-sky-300 text-base sm:text-lg">
                    ✈️ {{ voyage.ville_depart }} ➔ {{ voyage.ville_destination || voyage.ville_arrivee }}
                  </span>
                  <span class="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-indigo-50 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                    Agent: {{ voyage.agent_nom }}
                  </span>
                  <span class="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                    {{ voyage.statut }}
                  </span>
                </div>
                <div class="text-xs text-gray-600 dark:text-slate-300 font-semibold flex items-center gap-4 flex-wrap">
                  <span>Départ : <strong class="text-[#053754] dark:text-slate-100">{{ formatDate(voyage.date_depart) }}</strong></span>
                  <span>Poids réservé : <strong class="text-[#B50302] dark:text-red-400 font-black">{{ voyage.poids_reserve || 0 }} kg</strong></span>
                  <span>Capacité dispo : <strong class="text-emerald-700 dark:text-emerald-400 font-black">{{ voyage.kilos_disponibles }} kg</strong> dispos / <strong>{{ voyage.capacite_totale }} kg</strong> totaux</span>
                </div>
              </div>

              <!-- Associated Reservations Table -->
              <div class="space-y-2">
                <span class="text-xs font-extrabold text-gray-400 dark:text-slate-400 uppercase tracking-wider block">
                  Tableau des Réservations Associées ({{ voyage.reservations_count || 0 }})
                </span>

                <div v-if="!voyage.reservations || voyage.reservations.length === 0" class="text-xs text-gray-400 dark:text-slate-400 italic">
                  Aucune réservation enregistrée sur ce voyage d'entreprise.
                </div>

                <div v-else class="overflow-x-auto rounded-2xl border border-gray-200 dark:border-slate-800">
                  <table class="w-full min-w-[750px] text-left text-xs bg-white dark:bg-slate-900">
                    <thead class="bg-slate-50 dark:bg-slate-800/80 text-[#053754] dark:text-sky-300 uppercase tracking-wider font-extrabold border-b border-gray-200 dark:border-slate-800 text-[10px] whitespace-nowrap">
                      <tr>
                        <th class="px-4 py-2.5">Code Suivi</th>
                        <th class="px-4 py-2.5">Client Expéditeur</th>
                        <th class="px-4 py-2.5">Poids réservé</th>
                        <th class="px-4 py-2.5">Statut Réservation</th>
                        <th class="px-4 py-2.5 text-right">Messages Échangés</th>
                      </tr>
                    </thead>
                    <tbody class="divide-y divide-gray-100 dark:divide-slate-800 font-medium text-gray-700 dark:text-slate-300">
                      <tr v-for="res in getPaginatedReservations(voyage.id, voyage.reservations)" :key="res.id" class="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors">
                        <td class="px-4 py-2.5 font-mono font-black text-[#053754] dark:text-sky-300 whitespace-nowrap">
                          #{{ res.code_suivi }}
                        </td>
                        <td class="px-4 py-2.5 font-bold text-gray-800 dark:text-slate-200 whitespace-nowrap">
                          {{ res.client_nom }}
                        </td>
                        <td class="px-4 py-2.5 font-bold text-[#B50302] dark:text-red-400 whitespace-nowrap">
                          {{ res.poids_kg }} kg
                        </td>
                        <td class="px-4 py-2.5 whitespace-nowrap">
                          <span class="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold capitalize border bg-sky-50 dark:bg-sky-950/80 text-[#074C72] dark:text-sky-300 border-sky-200 dark:border-sky-800 whitespace-nowrap">
                            {{ res.statut }}
                          </span>
                        </td>
                        <td class="px-4 py-2.5 text-right font-bold text-[#074C72] dark:text-sky-300 whitespace-nowrap">
                          <span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#D8ECF8] dark:bg-sky-950 text-[#074C72] dark:text-sky-300 font-black whitespace-nowrap">
                            💬 {{ res.messages_count || 0 }} message(s)
                          </span>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>
    </div>

    <!-- Pagination Footer -->
    <div v-if="totalPages > 1" class="p-4 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-3xl flex items-center justify-between text-xs font-bold text-gray-600 dark:text-slate-300 shadow-2xs">
      <span>Page {{ currentPage }} sur {{ totalPages }} ({{ itemsList.length }} éléments)</span>

      <div class="flex items-center gap-1.5">
        <button 
          @click="currentPage > 1 && currentPage--" 
          :disabled="currentPage === 1"
          class="px-3 py-1.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-gray-700 dark:text-slate-200 hover:bg-gray-100 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
        >
          ← Précédent
        </button>

        <button 
          v-for="p in totalPages" 
          :key="p" 
          @click="currentPage = p"
          class="w-8 h-8 rounded-xl border text-xs font-extrabold transition-colors cursor-pointer"
          :class="currentPage === p ? 'bg-[#053754] dark:bg-sky-500 text-white dark:text-slate-950 border-[#053754] dark:border-sky-500' : 'bg-white dark:bg-slate-900 text-gray-700 dark:text-slate-200 border-gray-200 dark:border-slate-700 hover:bg-gray-100 dark:hover:bg-slate-800'"
        >
          {{ p }}
        </button>

        <button 
          @click="currentPage < totalPages && currentPage++" 
          :disabled="currentPage === totalPages"
          class="px-3 py-1.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-gray-700 dark:text-slate-200 hover:bg-gray-100 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
        >
          Suivant →
        </button>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { adminService } from '@/services/adminService'
import { formatImageUrl } from '@/utils/imageUrl'

const activeTab = ref('voyageur') // 'voyageur' | 'entreprise'
const itemsList = ref([])
const loading = ref(true)
const search = ref('')
const expanded = reactive({})

const currentPage = ref(1)
const perPage = 5

const voyagesPages = reactive({})
const reservationsPages = reactive({})

onMounted(() => {
  fetchData()
})

const fetchData = async () => {
  loading.value = true
  currentPage.value = 1
  itemsList.value = []
  try {
    const apiCall = activeTab.value === 'voyageur'
      ? adminService.getVoyageursStats({ search: search.value, per_page: 100 })
      : adminService.getEntreprisesVoyagesStats({ search: search.value, per_page: 100 })

    const res = await apiCall
    if (res && res.data) {
      itemsList.value = res.data.data || []
      if (itemsList.value.length > 0) {
        expanded[itemsList.value[0].id] = true
      }
    }
  } catch (err) {
    console.error('Erreur chargement voyages stats admin:', err)
  } finally {
    loading.value = false
  }
}

const totalPages = computed(() => {
  return Math.ceil(itemsList.value.length / perPage) || 1
})

const paginatedItems = computed(() => {
  const start = (currentPage.value - 1) * perPage
  return itemsList.value.slice(start, start + perPage)
})

const getPaginatedVoyages = (itemId, voyagesList) => {
  if (!voyagesList) return []
  const page = voyagesPages[itemId] || 1
  const start = (page - 1) * perPage
  return voyagesList.slice(start, start + perPage)
}

const getPaginatedReservations = (voyageId, reservationsList) => {
  if (!reservationsList) return []
  const page = reservationsPages[voyageId] || 1
  const start = (page - 1) * perPage
  return reservationsList.slice(start, start + perPage)
}

const getInitials = (prenom, nom) => {
  const p = (prenom || '').charAt(0).toUpperCase()
  const n = (nom || '').charAt(0).toUpperCase()
  return (p + n) || 'V'
}

const toggleExpand = (id) => {
  expanded[id] = !expanded[id]
}

const formatDate = (dateStr) => {
  if (!dateStr) return '-'
  return new Date(dateStr).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })
}
</script>

