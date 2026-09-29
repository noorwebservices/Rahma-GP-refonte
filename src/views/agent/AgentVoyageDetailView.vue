<template>
  <div class="space-y-6 pb-16 font-sans">
    <!-- Top Action Bar -->
    <div class="flex items-center justify-between gap-2 border-b border-gray-200/60 dark:border-slate-800 pb-3">
      <button
        @click="goBack"
        type="button"
        class="inline-flex items-center gap-1.5 text-xs font-bold text-gray-700 dark:text-slate-200 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 px-3 py-2 rounded-xl hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors shadow-2xs cursor-pointer shrink"
      >
        <span>←</span>
        <span>Retour aux voyages</span>
      </button>

      <span
        v-if="voyage"
        class="text-[11px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider border shrink-0"
        :class="getStatusBadge(voyage.statut).cls"
      >
        {{ getStatusBadge(voyage.statut).text }}
      </span>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="bg-white dark:bg-slate-900 rounded-3xl p-12 text-center border border-gray-100 dark:border-slate-800 shadow-sm space-y-4">
      <div class="w-10 h-10 border-4 border-[#053754] dark:border-sky-400 border-t-transparent rounded-full animate-spin mx-auto"></div>
      <p class="text-sm font-bold text-gray-600 dark:text-slate-300">Chargement des détails du voyage...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="bg-red-50 dark:bg-rose-950/40 border border-red-200 dark:border-rose-900 rounded-3xl p-8 text-center space-y-3">
      <p class="text-sm font-bold text-red-800 dark:text-rose-300">{{ error }}</p>
      <button @click="goBack" class="px-4 py-2 bg-red-600 text-white font-bold text-xs rounded-xl cursor-pointer">Retour aux voyages</button>
    </div>

    <!-- Main Content when loaded -->
    <template v-else-if="voyage">
      <!-- Title Header -->
      <div>
        <h1 class="text-xl sm:text-2xl font-serif font-bold text-principal-dark dark:text-sky-300">
          Fiche Voyage GP : {{ voyage.routeFrom }} ➔ {{ voyage.routeTo }}
        </h1>
        <p class="text-xs sm:text-sm text-gray-500 dark:text-slate-400">
          Supervisez le trajet, la capacité de transport et les colis clients enregistrés sur ce vol.
        </p>
      </div>

      <!-- Hero Summary Dark Blue Card (Identical to Voyageur) -->
      <div class="bg-[#053754] text-white rounded-3xl p-6 sm:p-7 shadow-xl space-y-5 relative overflow-hidden">
        <div class="flex items-center justify-between px-2">
          <!-- Departure -->
          <div class="space-y-1">
            <CountryFlag :city="voyage.routeFrom" :country="voyage.countryFrom" size="w-7 h-5" />
            <h3 class="text-xl sm:text-2xl font-extrabold leading-tight">{{ voyage.routeFrom }}</h3>
            <p class="text-xs text-sky-200">{{ voyage.countryFrom }}</p>
          </div>

          <!-- Route Graphic -->
          <div class="flex-1 max-w-[160px] sm:max-w-[240px] px-3 flex items-center justify-center">
            <div class="w-full flex items-center gap-1">
              <span class="w-2.5 h-2.5 rounded-full bg-red-500 shrink-0"></span>
              <div class="flex-1 border-t-2 border-dashed border-red-400"></div>
              <div class="bg-[#053754] px-1 transform -rotate-12">
                <span class="text-red-500 text-sm font-bold">✈</span>
              </div>
              <div class="flex-1 border-t-2 border-dashed border-amber-400"></div>
              <span class="w-2.5 h-2.5 rounded-full bg-amber-400 shrink-0"></span>
            </div>
          </div>

          <!-- Destination -->
          <div class="space-y-1 text-right flex flex-col items-end">
            <CountryFlag :city="voyage.routeTo" :country="voyage.countryTo" size="w-7 h-5" />
            <h3 class="text-xl sm:text-2xl font-extrabold leading-tight">{{ voyage.routeTo }}</h3>
            <p class="text-xs text-sky-200">{{ voyage.countryTo }}</p>
          </div>
        </div>

        <!-- Dates Row -->
        <div class="grid grid-cols-2 gap-4 pt-4 border-t border-sky-800/80 text-xs">
          <div>
            <span class="text-sky-200 font-medium block">Date de départ</span>
            <span class="font-extrabold text-white text-xs sm:text-sm mt-0.5 block">
              {{ formatVoyageDate(voyage.departureDate) }}
            </span>
          </div>
          <div class="text-right">
            <span class="text-sky-200 font-medium block">Date d'arrivée estimée</span>
            <span class="font-extrabold text-white text-xs sm:text-sm mt-0.5 block">
              {{ formatVoyageDate(voyage.arrivalDate) }}
            </span>
          </div>
        </div>

        <!-- Capacity Progress Bar -->
        <div class="space-y-2 pt-2 border-t border-sky-800/80">
          <div class="flex items-center justify-between text-xs font-extrabold">
            <span class="text-sky-200">Capacité de transport occupée</span>
            <span class="text-white">{{ voyage.capaciteTotale - voyage.capaciteDispo }} Kg / {{ voyage.capaciteTotale }} Kg</span>
          </div>
          <div class="w-full h-3 bg-sky-950/80 rounded-full overflow-hidden border border-sky-700/50">
            <div
              class="h-full bg-gradient-to-r from-amber-400 to-[#B50302] rounded-full transition-all duration-500"
              :style="{ width: `${Math.min(100, Math.max(0, ((voyage.capaciteTotale - voyage.capaciteDispo) / (voyage.capaciteTotale || 1)) * 100))}%` }"
            ></div>
          </div>
          <div class="flex justify-between text-[11px] text-sky-300">
            <span>Capacité restante : <strong class="text-white">{{ voyage.capaciteDispo }} Kg</strong></span>
            <span>Tarif au Kg : <strong class="text-white">{{ voyage.prixKg }}</strong></span>
          </div>
        </div>

        <!-- Dynamic Revenue Metrics for this Voyage -->
        <div class="pt-3 border-t border-sky-800/80 grid grid-cols-2 gap-4 text-xs">
          <div>
            <span class="text-emerald-300 font-bold block">Revenu Validé (Paiements reçus)</span>
            <span class="text-lg sm:text-xl font-black text-emerald-400 block mt-0.5">
              {{ totalRevenuVolAccepte }}
            </span>
          </div>
          <div class="text-right">
            <span class="text-amber-200 font-bold block">Chiffre d'Affaires Total Estimé</span>
            <span class="text-lg sm:text-xl font-black text-amber-300 block mt-0.5">
              {{ totalRevenuVolEstime }}
            </span>
          </div>
        </div>
      </div>

      <!-- Voyage Full Specifications (2 Grid Columns on Desktop: grid grid-cols-1 lg:grid-cols-12 gap-6 items-start) -->
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        <!-- Left Column: Tarifs, Adresses & Description (lg:col-span-7) -->
        <div class="lg:col-span-7 space-y-5">
          
          <!-- Tarifs Card -->
          <div class="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-gray-200 dark:border-slate-800 shadow-2xs space-y-3">
            <h3 class="text-xs font-bold text-gray-400 dark:text-slate-400 uppercase tracking-wider">Tarification Appliquée</h3>
            <div class="bg-slate-50 dark:bg-slate-800/80 p-3.5 rounded-2xl border border-slate-100 dark:border-slate-700 space-y-1">
              <span class="text-xs text-gray-500 dark:text-slate-400 block font-medium">Prix standard au Kg</span>
              <span class="text-lg font-black text-[#B50302] dark:text-rose-400 block">{{ voyage.prixKg }}</span>
            </div>

            <!-- Tarifs Spéciaux par Objet -->
            <div v-if="voyage.tarifsSpeciaux && voyage.tarifsSpeciaux.length > 0" class="pt-2 border-t border-gray-100 dark:border-slate-800 space-y-2">
              <span class="text-xs font-bold text-[#053754] dark:text-sky-300 block">🏷️ Tarifs Spéciaux par Objet (Forfaits spécifiques) :</span>
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div
                  v-for="(item, idx) in voyage.tarifsSpeciaux"
                  :key="idx"
                  class="p-2.5 rounded-xl bg-sky-50/70 dark:bg-slate-800/80 border border-sky-200 dark:border-slate-700 flex items-center justify-between text-xs"
                >
                  <span class="font-extrabold text-[#053754] dark:text-slate-100">📦 {{ item.nom }}</span>
                  <span class="font-black text-emerald-600 dark:text-emerald-400">{{ formatPrice(item.prix, voyage.devise) }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Adresse de Dépôt Card -->
          <div class="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-gray-200 dark:border-slate-800 shadow-2xs space-y-3">
            <div class="flex items-center justify-between border-b border-gray-100 dark:border-slate-800 pb-2">
              <h3 class="text-xs font-bold text-gray-400 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <span>📍</span> Adresse de Dépôt des Colis
              </h3>
            </div>
            
            <template v-if="voyage.adresseDepot">
              <div class="space-y-1 text-xs">
                <p class="font-extrabold text-[#053754] dark:text-sky-300 text-sm sm:text-base">{{ voyage.adresseDepot.adresse }}</p>
                <p class="text-gray-600 dark:text-slate-300 font-medium">{{ voyage.adresseDepot.ville }}, {{ voyage.adresseDepot.pays }}</p>
              </div>
              
              <div v-if="voyage.adresseDepot.horaire_ouverture" class="bg-amber-50/60 dark:bg-amber-950/30 border border-amber-200/60 dark:border-amber-800/60 p-3 rounded-2xl text-xs space-y-0.5">
                <span class="text-amber-800 dark:text-amber-300 font-bold block">🕒 Horaires d'ouverture</span>
                <span class="text-amber-900 dark:text-amber-200 font-medium block">{{ voyage.adresseDepot.horaire_ouverture }}</span>
              </div>

              <div v-if="voyage.adresseDepot.instructions" class="bg-blue-50/60 dark:bg-sky-950/40 border border-blue-200/60 dark:border-sky-800/60 p-3 rounded-2xl text-xs space-y-0.5">
                <span class="text-blue-800 dark:text-sky-300 font-bold block">💡 Instructions de dépôt</span>
                <span class="text-blue-900 dark:text-sky-200 font-medium block">{{ voyage.adresseDepot.instructions }}</span>
              </div>
            </template>
            <p v-else class="text-xs text-gray-400 dark:text-slate-500 italic">Aucune adresse de dépôt renseignée.</p>
          </div>

          <!-- Adresse de Récupération Card -->
          <div class="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-gray-200 dark:border-slate-800 shadow-2xs space-y-3">
            <div class="flex items-center justify-between border-b border-gray-100 dark:border-slate-800 pb-2">
              <h3 class="text-xs font-bold text-gray-400 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <span>📍</span> Adresse de Retrait à Destination
              </h3>
            </div>

            <template v-if="voyage.adresseRetrait">
              <div class="space-y-1 text-xs">
                <p class="font-extrabold text-[#053754] dark:text-sky-300 text-sm sm:text-base">{{ voyage.adresseRetrait.adresse }}</p>
                <p class="text-gray-600 dark:text-slate-300 font-medium">{{ voyage.adresseRetrait.ville }}, {{ voyage.adresseRetrait.pays }}</p>
              </div>

              <div v-if="voyage.adresseRetrait.horaire_ouverture" class="bg-amber-50/60 dark:bg-amber-950/30 border border-amber-200/60 dark:border-amber-800/60 p-3 rounded-2xl text-xs space-y-0.5">
                <span class="text-amber-800 dark:text-amber-300 font-bold block">🕒 Horaires de retrait</span>
                <span class="text-amber-900 dark:text-amber-200 font-medium block">{{ voyage.adresseRetrait.horaire_ouverture }}</span>
              </div>

              <div v-if="voyage.adresseRetrait.instructions" class="bg-blue-50/60 dark:bg-sky-950/40 border border-blue-200/60 dark:border-sky-800/60 p-3 rounded-2xl text-xs space-y-0.5">
                <span class="text-blue-800 dark:text-sky-300 font-bold block">💡 Instructions de retrait</span>
                <span class="text-blue-900 dark:text-sky-200 font-medium block">{{ voyage.adresseRetrait.instructions }}</span>
              </div>
            </template>
            <p v-else class="text-xs text-gray-400 dark:text-slate-500 italic">Aucune adresse de retrait renseignée.</p>
          </div>

          <!-- Description / Notes -->
          <div v-if="voyage.description" class="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-gray-200 dark:border-slate-800 shadow-2xs space-y-2">
            <h3 class="text-xs font-bold text-gray-400 dark:text-slate-400 uppercase tracking-wider">Notes & Consignes</h3>
            <p class="text-xs text-gray-700 dark:text-slate-300 leading-relaxed font-medium bg-gray-50 dark:bg-slate-800/80 p-3.5 rounded-2xl border border-gray-100 dark:border-slate-700">
              {{ voyage.description }}
            </p>
          </div>
        </div>

        <!-- Right Column: Objets autorisés et interdits (lg:col-span-5) -->
        <div class="lg:col-span-5 space-y-5 lg:sticky lg:top-20">
          
          <!-- Objets autorisés Card -->
          <div class="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-emerald-300 dark:border-emerald-800 shadow-2xs space-y-3">
            <div class="flex items-center gap-2 text-emerald-800 dark:text-emerald-300 font-extrabold text-sm border-b border-emerald-100 dark:border-emerald-900/60 pb-2">
              <span class="text-base">✅</span>
              <span>Objets & Catégories Autorisés</span>
            </div>
            
            <div v-if="voyage.categoriesAutorisees.length > 0" class="flex flex-wrap gap-2 pt-1">
              <span
                v-for="cat in voyage.categoriesAutorisees"
                :key="cat"
                class="bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-xs font-bold px-3 py-1.5 rounded-xl flex items-center gap-1.5"
              >
                <span>✓</span>
                <span>{{ cat }}</span>
              </span>
            </div>
            <p v-else class="text-xs text-gray-400 dark:text-slate-500 italic">Aucune catégorie spécifiée.</p>
          </div>

          <!-- Objets interdits Card -->
          <div class="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-red-300 dark:border-rose-900 shadow-2xs space-y-3">
            <div class="flex items-center gap-2 text-red-800 dark:text-rose-300 font-extrabold text-sm border-b border-red-100 dark:border-rose-950 pb-2">
              <span class="text-base">🚫</span>
              <span>Objets & Produits Interdits</span>
            </div>

            <div v-if="voyage.categoriesRefusees.length > 0" class="flex flex-wrap gap-2 pt-1">
              <span
                v-for="cat in voyage.categoriesRefusees"
                :key="cat"
                class="bg-red-50 dark:bg-rose-950/60 text-red-800 dark:text-rose-300 border border-red-200 dark:border-rose-800 text-xs font-bold px-3 py-1.5 rounded-xl flex items-center gap-1.5"
              >
                <span>✕</span>
                <span>{{ cat }}</span>
              </span>
            </div>
            <p v-else class="text-xs text-gray-400 dark:text-slate-500 italic">Aucune restriction spécifiée.</p>
          </div>
        </div>

      </div>

      <!-- Reservations Section (Identical to Voyageur VoyageDetailView) -->
      <div class="space-y-4 pt-4 border-t border-gray-200 dark:border-slate-800">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h2 class="text-base sm:text-lg font-bold text-principal-dark dark:text-sky-300 flex items-center gap-2">
            <span>Demandes de réservation & Colis à bord</span>
            <span class="bg-sky-100 dark:bg-sky-950 text-[#074C72] dark:text-sky-300 text-xs px-2.5 py-0.5 rounded-full font-black">{{ filteredReservations.length }}</span>
          </h2>
          
          <!-- Search Bar Input -->
          <div class="relative w-full sm:w-72">
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Rechercher (nom client, N° suivi, type...)"
              class="w-full bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-2xl pl-9 pr-8 py-2 text-xs font-medium text-gray-900 dark:text-slate-100 outline-none focus:border-[#074C72] dark:focus:border-sky-400 shadow-2xs"
            />
            <span class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs">🔍</span>
            <button
              v-if="searchQuery"
              @click="searchQuery = ''"
              type="button"
              class="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-xs font-bold p-1 cursor-pointer"
            >
              ✕
            </button>
          </div>
        </div>

        <template v-if="filteredReservations.length > 0">
          <!-- Desktop Table View -->
          <div class="hidden md:block overflow-x-auto w-full bg-white dark:bg-slate-900 rounded-3xl border border-gray-200 dark:border-slate-800 shadow-sm p-4">
            <table class="min-w-max w-full text-left border-collapse">
              <thead>
                <tr class="border-b border-gray-100 dark:border-slate-800 text-[11px] font-extrabold text-gray-400 dark:text-slate-400 uppercase tracking-wider whitespace-nowrap">
                  <th class="pb-3 px-3">Tracking / Code</th>
                  <th class="pb-3 px-3">Client</th>
                  <th class="pb-3 px-3">Contenu / Fragile</th>
                  <th class="pb-3 px-3">Poids</th>
                  <th class="pb-3 px-3">Montant Total</th>
                  <th class="pb-3 px-3">Statut</th>
                  <th class="pb-3 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-100 dark:divide-slate-800/60 text-xs">
                <tr
                  v-for="res in filteredReservations"
                  :key="res.id"
                  @click="goToDemandeDetail(res.id)"
                  class="hover:bg-sky-50/50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer group"
                >
                  <td class="py-3.5 px-3 whitespace-nowrap">
                    <span class="font-extrabold text-[#053754] dark:text-sky-300 font-mono bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-700">
                      {{ res.codeTracking }}
                    </span>
                    <span class="block text-[10px] text-gray-400 dark:text-slate-400 font-mono mt-0.5">{{ res.numero }}</span>
                  </td>
                  <td class="py-3.5 px-3 font-extrabold text-gray-900 dark:text-slate-100 whitespace-nowrap">
                    <div class="flex items-center gap-2">
                      <div class="w-7 h-7 rounded-full bg-[#053754] text-white text-[10px] font-bold flex items-center justify-center shrink-0">
                        {{ res.clientNom.slice(0, 2).toUpperCase() }}
                      </div>
                      <div>
                        <div>{{ truncateText(res.clientNom, 30) }}</div>
                        <div class="text-[10px] text-gray-400 font-normal">{{ res.clientPhone }}</div>
                      </div>
                    </div>
                  </td>
                  <td class="py-3.5 px-3 whitespace-nowrap">
                    <span class="font-bold text-gray-800 dark:text-slate-200 block">{{ truncateText(res.colisType, 30) }}</span>
                    <span v-if="res.colisEstFragile" class="inline-block text-[10px] font-bold text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/60 px-2 py-0.5 rounded border border-amber-200 dark:border-amber-800">
                      ⚠️ Fragile
                    </span>
                  </td>
                  <td class="py-3.5 px-3 font-extrabold text-[#B50302] dark:text-rose-400">
                    {{ res.colisPoids }}
                  </td>
                  <td class="py-3.5 px-3 font-black text-[#053754] dark:text-sky-300 text-sm">
                    {{ res.montantTotal }}
                  </td>
                  <td class="py-3.5 px-3">
                    <span
                      class="text-[10px] font-extrabold px-2.5 py-1 rounded-full border whitespace-nowrap"
                      :class="getReservationStatusBadge(res.statut).cls"
                    >
                      {{ getReservationStatusBadge(res.statut).text }}
                    </span>
                  </td>
                  <td class="py-3.5 px-3 text-right" @click.stop>
                    <div class="flex items-center justify-end gap-1.5">
                      <button
                        v-if="res.statut === 'en_attente'"
                        @click="handleAccepter(res.id)"
                        type="button"
                        class="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-[11px] px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer shadow-2xs"
                      >
                        Accepter
                      </button>
                      <button
                        v-if="res.statut === 'en_attente'"
                        @click="handleRefuser(res.id)"
                        type="button"
                        class="bg-red-50 dark:bg-rose-950/50 hover:bg-red-100 text-[#B50302] dark:text-rose-300 border border-red-200 dark:border-rose-900 font-extrabold text-[11px] px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer"
                      >
                        Refuser
                      </button>
                      <button
                        @click="goToDemandeDetail(res.id)"
                        type="button"
                        class="bg-[#053754] dark:bg-sky-600 hover:bg-[#074C72] text-white font-extrabold text-[11px] px-3 py-1.5 rounded-lg transition-colors cursor-pointer flex items-center gap-1 shadow-2xs"
                      >
                        <span>Détails</span>
                        <span>➔</span>
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Mobile Cards View -->
          <div class="grid grid-cols-1 gap-4 md:hidden">
            <div
              v-for="res in filteredReservations"
              :key="res.id"
              @click="goToDemandeDetail(res.id)"
              class="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-gray-200 dark:border-slate-800 shadow-sm space-y-4 hover:border-[#074C72] dark:hover:border-sky-400 hover:shadow-md transition-all flex flex-col justify-between cursor-pointer group"
            >
              <!-- Card Header: Client Avatar + Name + Status Badge -->
              <div class="flex items-center justify-between gap-3">
                <div class="flex items-center gap-3">
                  <div class="w-10 h-10 rounded-full bg-[#053754] dark:bg-slate-800 text-white font-extrabold text-xs flex items-center justify-center shrink-0 shadow-xs group-hover:bg-[#B50302] transition-colors">
                    {{ res.clientNom.slice(0, 2).toUpperCase() }}
                  </div>
                  <div>
                    <h4 class="text-sm font-extrabold text-gray-900 dark:text-slate-100 group-hover:text-[#074C72] dark:group-hover:text-sky-300 transition-colors flex items-center gap-2">
                      <span>{{ res.clientNom }}</span>
                    </h4>
                    <span class="text-[10px] text-gray-400 dark:text-slate-400 font-medium">Client Rahma GP</span>
                  </div>
                </div>

                <span
                  class="text-[11px] font-extrabold px-3 py-1 rounded-full border shrink-0"
                  :class="getReservationStatusBadge(res.statut).cls"
                >
                  {{ getReservationStatusBadge(res.statut).text }}
                </span>
              </div>

              <!-- Main Info Box -->
              <div class="bg-slate-50 dark:bg-slate-800/80 p-3.5 rounded-2xl border border-slate-100 dark:border-slate-700 space-y-2.5">
                <div class="flex items-center justify-between text-xs">
                  <span class="text-gray-400 dark:text-slate-400 font-medium">Code Réservation</span>
                  <span class="font-extrabold text-[#053754] dark:text-sky-300 font-mono bg-white dark:bg-slate-900 px-2 py-0.5 rounded-md border border-gray-200 dark:border-slate-700">{{ res.numero }}</span>
                </div>

                <div class="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span class="text-gray-400 dark:text-slate-400 font-medium block">Type de Colis</span>
                    <span class="font-extrabold text-gray-900 dark:text-slate-100 block truncate">{{ res.colisType }}</span>
                  </div>
                  <div class="text-right">
                    <span class="text-gray-400 dark:text-slate-400 font-medium block">Poids Colis</span>
                    <span class="font-extrabold text-[#B50302] dark:text-rose-400 block">{{ res.colisPoids }}</span>
                  </div>
                </div>

                <div v-if="res.colisEstFragile" class="bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 text-[11px] font-bold px-2.5 py-1 rounded-lg border border-amber-200/80 dark:border-amber-800 flex items-center gap-1.5">
                  <span>⚠️</span> Objet Fragile
                </div>
              </div>

              <!-- Footer Action & Price Row -->
              <div class="border-t border-gray-100 dark:border-slate-800 pt-3 flex items-center justify-between gap-2">
                <div>
                  <span class="text-[10px] text-gray-400 dark:text-slate-400 font-bold uppercase block">Montant Total</span>
                  <span class="font-black text-[#053754] dark:text-sky-300 text-base sm:text-lg">{{ res.montantTotal }}</span>
                </div>

                <div class="flex items-center gap-1.5" @click.stop>
                  <button
                    v-if="res.statut === 'en_attente'"
                    @click="handleAccepter(res.id)"
                    type="button"
                    title="Accepter"
                    class="w-9 h-9 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-sm flex items-center justify-center transition-all cursor-pointer shadow-2xs active:scale-95 shrink-0"
                  >
                    ✓
                  </button>

                  <button
                    v-if="res.statut === 'en_attente'"
                    @click="handleRefuser(res.id)"
                    type="button"
                    title="Refuser"
                    class="w-9 h-9 rounded-xl bg-red-50 dark:bg-rose-950/50 hover:bg-red-100 dark:hover:bg-rose-900/60 text-[#B50302] dark:text-rose-300 border border-red-200 dark:border-rose-900 font-black text-sm flex items-center justify-center transition-all cursor-pointer active:scale-95 shrink-0"
                  >
                    ✕
                  </button>

                  <button
                    @click="goToDemandeDetail(res.id)"
                    type="button"
                    title="Détails"
                    class="h-9 px-3 rounded-xl bg-[#053754] dark:bg-sky-600 hover:bg-[#074C72] dark:hover:bg-sky-500 text-white font-extrabold text-xs flex items-center justify-center gap-1 transition-all cursor-pointer shadow-xs active:scale-95 shrink-0"
                  >
                    <span>👁️</span>
                    <span class="text-[11px]">Détails</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </template>

        <!-- Empty state if no reservations -->
        <div v-else class="bg-white dark:bg-slate-900 rounded-3xl p-10 text-center border border-gray-200 dark:border-slate-800 space-y-2">
          <div class="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 flex items-center justify-center text-xl mx-auto font-bold">
            📦
          </div>
          <p class="text-sm font-bold text-gray-700 dark:text-slate-200">Aucune réservation trouvée.</p>
          <p class="text-xs text-gray-400 dark:text-slate-400">Les demandes de réservation des clients pour ce voyage s'afficheront ici.</p>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { agentService } from '@/services/agentService'
import CountryFlag from '@/components/common/CountryFlag.vue'
import { getCountryFlag, formatVoyageDate } from '@/utils/flagHelper'
import { decodeId, encodeId } from '@/utils/idMasker'
import { formatPrice } from '@/utils/currencyState'
import Swal from 'sweetalert2'

const route = useRoute()
const router = useRouter()
const rawVoyageId = decodeId(route.params.id) || route.params.id

const voyage = ref(null)
const loading = ref(true)
const error = ref('')
const searchQuery = ref('')

const fetchVoyageDetail = async () => {
  loading.value = true
  error.value = ''
  try {
    const res = await agentService.getVoyages()
    const d = res?.data || res
    const list = Array.isArray(d) ? d : (d.voyages || d.data || [])
    const found = list.find(v => v.id === rawVoyageId || v.id === route.params.id)

    if (found) {
      const v = found
      const capTotale = Number(v.capacite_totale) || 0
      let capDispo = capTotale
      if (v.capacite_dispo !== undefined && v.capacite_dispo !== null) {
        capDispo = Math.max(0, Number(v.capacite_dispo))
      } else if (v.poids_disponible !== undefined && v.poids_disponible !== null) {
        capDispo = Math.max(0, Number(v.poids_disponible))
      } else {
        let reserved = Number(v.poids_reserve || 0)
        if (!reserved && Array.isArray(v.reservations)) {
          reserved = v.reservations
            .filter(r => r.statut === 'acceptee' || r.statut === 'confirmee' || r.statut === 'en_attente')
            .reduce((sum, r) => sum + Number(r.colis?.poids || r.poids || 0), 0)
        }
        capDispo = Math.max(0, capTotale - reserved)
      }

      voyage.value = {
        id: v.id,
        routeFrom: v.ville_depart || 'Départ',
        countryFrom: v.pays_depart || '',
        flagFrom: getCountryFlag(v.ville_depart, v.pays_depart),
        routeTo: v.ville_destination || v.ville_arrivee || 'Destination',
        countryTo: v.pays_destination || '',
        flagTo: getCountryFlag(v.ville_destination || v.ville_arrivee, v.pays_destination),
        departureDate: v.date_depart,
        arrivalDate: v.date_arrivee,
        capaciteTotale: capTotale,
        capaciteDispo: capDispo,
        prixKg: formatPrice(v.prix_kg || 0, v.devise || 'XOF'),
        devise: v.devise || 'XOF',
        description: v.description || '',
        statut: v.statut || 'publie',
        adresseDepot: v.adresse_depot || null,
        adresseRetrait: v.adresse_recuperation || null,
        tarifsSpeciaux: Array.isArray(v.tarifs_speciaux) ? v.tarifs_speciaux : [],
        categoriesAutorisees: Array.isArray(v.objets_autorises) ? v.objets_autorises : [],
        categoriesRefusees: Array.isArray(v.objets_interdits) ? v.objets_interdits : [],
        reservations: Array.isArray(v.reservations) ? v.reservations : []
      }
    } else {
      error.value = 'Voyage non trouvé.'
    }
  } catch (err) {
    error.value = err?.message || 'Erreur lors du chargement des détails du voyage.'
  } finally {
    loading.value = false
  }
}

onMounted(fetchVoyageDetail)

const reservationsList = computed(() => {
  if (!voyage.value || !voyage.value.reservations) return []
  return voyage.value.reservations
    .filter(r => r.statut !== 'annulee' && r.statut !== 'annule')
    .map(r => {
      const c = r.colis || {}
      const u = r.client?.user || r.client || {}
      const clientName = `${u.prenom || ''} ${u.nom || r.expediteur_nom || ''}`.trim() || 'Client Rahma'

      return {
        id: r.id,
        numero: r.numero || `RES-${r.id.toString().slice(0, 8)}`,
        codeTracking: c.numero_suivi || r.code_suivi || (r.id ? r.id.toString().slice(0, 8) : 'TRK'),
        statut: r.statut || 'en_attente',
        colisStatut: c.statut || 'en_attente',
        rawColisId: c.id || null,
        clientNom: clientName,
        clientPhone: u.telephone || r.expediteur_telephone || 'Non renseigné',
        colisType: c.type || r.type_colis || 'Colis',
        colisPoids: (c.poids !== undefined && c.poids !== null) ? `${c.poids} Kg` : (r.poids ? `${r.poids} Kg` : 'Forfait'),
        colisEstFragile: Boolean(c.est_fragile),
        montantTotal: formatPrice(r.montant_total || r.prix_total || 0, voyage.value.devise || 'XOF'),
        raw: r
      }
    })
})

const filteredReservations = computed(() => {
  if (!searchQuery.value.trim()) return reservationsList.value
  const q = searchQuery.value.toLowerCase().trim()
  return reservationsList.value.filter(res => {
    return (
      (res.clientNom && res.clientNom.toLowerCase().includes(q)) ||
      (res.numero && res.numero.toLowerCase().includes(q)) ||
      (res.codeTracking && res.codeTracking.toLowerCase().includes(q)) ||
      (res.colisType && res.colisType.toLowerCase().includes(q)) ||
      (res.statut && res.statut.toLowerCase().includes(q))
    )
  })
})

const totalRevenuVolEstime = computed(() => {
  if (!reservationsList.value || reservationsList.value.length === 0) return formatPrice(0, 'XOF')
  const totalRaw = reservationsList.value.reduce((acc, r) => acc + Number(r.raw?.montant_total || r.raw?.prix_total || 0), 0)
  return formatPrice(totalRaw, voyage.value?.devise || 'XOF')
})

const totalRevenuVolAccepte = computed(() => {
  if (!reservationsList.value || reservationsList.value.length === 0) return formatPrice(0, 'XOF')
  const totalRaw = reservationsList.value
    .filter(r => r.statut === 'acceptee' || r.statut === 'confirmee' || r.statut === 'paye' || r.statut === 'livre' || r.statut === 'livree')
    .reduce((acc, r) => acc + Number(r.raw?.montant_total || r.raw?.prix_total || 0), 0)
  return formatPrice(totalRaw, voyage.value?.devise || 'XOF')
})

const getStatusBadge = (statut) => {
  switch (statut) {
    case 'publie':
    case 'programme':
    case 'actif':
      return { text: 'Publié & Ouvert', cls: 'bg-emerald-50 text-emerald-700 border-emerald-200' }
    case 'brouillon':
      return { text: 'Brouillon', cls: 'bg-gray-100 text-gray-700 border-gray-300' }
    case 'complet':
      return { text: 'Vol Complet', cls: 'bg-purple-50 text-purple-700 border-purple-200' }
    case 'en_cours':
      return { text: 'En Cours de Vol', cls: 'bg-blue-50 text-blue-700 border-blue-200' }
    case 'termine':
      return { text: 'Voyage Terminé', cls: 'bg-slate-100 text-slate-700 border-slate-300' }
    default:
      return { text: statut || 'Statut inconnu', cls: 'bg-gray-50 text-gray-600 border-gray-200' }
  }
}

const getReservationStatusBadge = (statut) => {
  switch (statut) {
    case 'en_attente':
      return { text: '⏳ En Attente', cls: 'bg-amber-50 text-amber-800 border-amber-300' }
    case 'acceptee':
    case 'confirmee':
      return { text: '✓ Acceptée', cls: 'bg-emerald-50 text-emerald-800 border-emerald-300' }
    case 'refusee':
      return { text: '✕ Refusée', cls: 'bg-red-50 text-red-800 border-red-300' }
    case 'annulee':
    case 'annule':
      return { text: '🚫 Annulée', cls: 'bg-gray-100 text-gray-700 border-gray-300' }
    default:
      return { text: statut || 'Inconnu', cls: 'bg-slate-100 text-slate-700 border-slate-200' }
  }
}

const truncateText = (text, maxLength = 30) => {
  if (!text) return ''
  const str = String(text)
  if (str.length <= maxLength) return str
  return str.slice(0, maxLength) + '...'
}

const handleAccepter = async (reservationId) => {
  try {
    await agentService.acceptReservation(reservationId)
    Swal.fire({
      toast: true,
      position: 'top-end',
      icon: 'success',
      title: 'Réservation acceptée avec succès',
      showConfirmButton: false,
      timer: 3000
    })
    fetchVoyageDetail()
  } catch (err) {
    Swal.fire({
      toast: true,
      position: 'top-end',
      icon: 'error',
      title: err.response?.data?.message || 'Erreur lors de l\'acceptation',
      showConfirmButton: false,
      timer: 4000
    })
  }
}

const handleRefuser = async (reservationId) => {
  try {
    await agentService.refuseReservation(reservationId)
    Swal.fire({
      toast: true,
      position: 'top-end',
      icon: 'success',
      title: 'Réservation refusée',
      showConfirmButton: false,
      timer: 3000
    })
    fetchVoyageDetail()
  } catch (err) {
    Swal.fire({
      toast: true,
      position: 'top-end',
      icon: 'error',
      title: err.response?.data?.message || 'Erreur lors du refus',
      showConfirmButton: false,
      timer: 4000
    })
  }
}

const changeColisStatut = async (colisId, statut) => {
  if (!colisId) return
  try {
    await agentService.updateColisStatut(colisId, statut)
    Swal.fire({
      toast: true,
      position: 'top-end',
      icon: 'success',
      title: `Statut du colis mis à jour en "${statut}"`,
      showConfirmButton: false,
      timer: 3000
    })
    fetchVoyageDetail()
  } catch (err) {
    Swal.fire({
      toast: true,
      position: 'top-end',
      icon: 'error',
      title: err.response?.data?.message || 'Erreur lors de la mise à jour du statut',
      showConfirmButton: false,
      timer: 4000
    })
  }
}

const goBack = () => {
  router.push('/agent')
}

const goToDemandeDetail = (resId) => {
  const masked = encodeId(resId)
  router.push(`/agent/demandes/${masked}`)
}
</script>
