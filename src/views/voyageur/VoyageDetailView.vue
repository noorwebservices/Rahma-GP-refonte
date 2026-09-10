<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { fetchVoyage } from '@/services/voyageService'
import { getCountryFlag, formatVoyageDate } from '@/utils/flagHelper'
import CountryFlag from '@/components/common/CountryFlag.vue'

const route = useRoute()
const router = useRouter()
const voyageId = route.params.id

const isLoading = ref(true)
const errorMsg = ref('')
const voyage = ref(null)
const reservations = ref([])

const getStatusBadge = (statut) => {
  switch (statut) {
    case 'publie':
      return { text: 'Publié & Ouvert', cls: 'bg-emerald-50 text-emerald-700 border-emerald-200' }
    case 'brouillon':
      return { text: 'Brouillon', cls: 'bg-gray-100 text-gray-700 border-gray-300' }
    case 'complet':
      return { text: 'Vol Complet', cls: 'bg-purple-50 text-purple-700 border-purple-200' }
    case 'en_cours':
      return { text: 'En Cours de Vol', cls: 'bg-blue-50 text-blue-700 border-blue-200' }
    case 'termine':
      return { text: 'Voyage Terminé', cls: 'bg-slate-100 text-slate-700 border-slate-300' }
    case 'annule':
      return { text: 'Annulé', cls: 'bg-red-50 text-red-700 border-red-200' }
    default:
      return { text: statut || 'Statut inconnu', cls: 'bg-gray-50 text-gray-600 border-gray-200' }
  }
}

onMounted(async () => {
  if (!voyageId) {
    errorMsg.value = 'Identifiant du voyage manquant.'
    isLoading.value = false
    return
  }

  isLoading.value = true
  errorMsg.value = ''

  try {
    const res = await fetchVoyage(voyageId)
    if (res && res.data) {
      const v = res.data
      voyage.value = {
        id: v.id,
        routeFrom: v.ville_depart || 'Départ',
        countryFrom: v.pays_depart || '',
        flagFrom: getCountryFlag(v.ville_depart, v.pays_depart),
        routeTo: v.ville_destination || 'Destination',
        countryTo: v.pays_destination || '',
        flagTo: getCountryFlag(v.ville_destination, v.pays_destination),
        departureDate: v.date_depart,
        arrivalDate: v.date_arrivee,
        capaciteTotale: Number(v.capacite_totale) || 0,
        capaciteDispo: v.capacite_dispo !== undefined ? Number(v.capacite_dispo) : Number(v.capacite_totale || 0),
        prixKg: v.prix_kg ? `${v.prix_kg} ${v.devise || 'XOF'}` : 'Non défini',
        prixObjet: v.prix_objet ? `${v.prix_objet} ${v.devise || 'XOF'}` : 'Non défini',
        devise: v.devise || 'XOF',
        description: v.description || '',
        statut: v.statut || 'publie',
        adresseDepot: v.adresse_depot || null,
        adresseRetrait: v.adresse_recuperation || null,
        categoriesAutorisees: Array.isArray(v.objets_autorises) ? v.objets_autorises : [],
        categoriesRefusees: Array.isArray(v.objets_interdits) ? v.objets_interdits : []
      }

      if (v.reservations && Array.isArray(v.reservations)) {
        reservations.value = v.reservations.map(r => ({
          id: r.id,
          clientName: r.client?.user ? `${r.client.user.prenom || ''} ${r.client.user.nom || ''}`.trim() : (r.expediteur_nom || 'Client Rahma'),
          clientPhone: r.client?.user?.telephone || r.expediteur_telephone || 'Non renseigné',
          parcelType: r.type_colis || r.description || 'Colis de marchandise',
          weight: r.poids ? `${r.poids} Kg` : 'Forfait objet',
          price: `${r.prix_total || 0} ${v.devise || 'XOF'}`,
          paymentMode: r.mode_paiement || 'Au dépôt',
          status: r.statut || 'en_attente',
          code: r.code_tracking ? `#${r.code_tracking}` : `#RS-${r.id.toString().slice(0, 5)}`
        }))
      } else {
        reservations.value = []
      }
    } else {
      errorMsg.value = 'Voyage non trouvé.'
    }
  } catch (err) {
    errorMsg.value = err?.message || 'Erreur lors du chargement du voyage.'
  } finally {
    isLoading.value = false
  }
})

const goToChat = (id) => {
  router.push(`/voyageur/messages/${id}`)
}

const goBack = () => {
  router.push('/voyageur')
}
</script>

<template>
  <div class="space-y-6 pb-16">
    <!-- Top Action Bar -->
    <div class="flex items-center justify-between gap-3">
      <button
        @click="goBack"
        type="button"
        class="inline-flex items-center gap-2 text-xs font-bold text-gray-600 bg-white border border-gray-200 px-3.5 py-2 rounded-xl hover:bg-gray-50 transition-colors shadow-2xs"
      >
        <span>←</span>
        <span>Retour aux voyages</span>
      </button>

      <span
        v-if="voyage"
        class="text-xs font-extrabold px-3.5 py-1 rounded-full uppercase tracking-wider border"
        :class="getStatusBadge(voyage.statut).cls"
      >
        {{ getStatusBadge(voyage.statut).text }}
      </span>
    </div>

    <!-- Loading State -->
    <div v-if="isLoading" class="bg-white rounded-3xl p-12 text-center border border-gray-100 shadow-sm space-y-4">
      <div class="w-10 h-10 border-4 border-[#053754] border-t-transparent rounded-full animate-spin mx-auto"></div>
      <p class="text-sm font-bold text-gray-600">Chargement des détails complets du voyage...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="errorMsg" class="bg-red-50 border border-red-200 rounded-3xl p-8 text-center space-y-3">
      <p class="text-sm font-bold text-red-800">{{ errorMsg }}</p>
      <button @click="goBack" class="px-4 py-2 bg-red-600 text-white font-bold text-xs rounded-xl">Retour</button>
    </div>

    <!-- Main Content when loaded -->
    <template v-else-if="voyage">
      <!-- Title Header -->
      <div>
        <h1 class="text-xl sm:text-2xl font-serif font-bold text-principal-dark">
          Détails du voyage {{ voyage.routeFrom }} ➔ {{ voyage.routeTo }}
        </h1>
        <p class="text-xs sm:text-sm text-gray-500">
          Toutes les caractéristiques, adresses et les réservations associées à ce vol
        </p>
      </div>

      <!-- Hero Summary Dark Blue Card -->
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
            <span class="text-sky-200 font-medium block">Date de Départ</span>
            <span class="font-extrabold text-white text-xs sm:text-sm mt-0.5 block">
              {{ formatVoyageDate(voyage.departureDate) }}
            </span>
          </div>
          <div class="text-right">
            <span class="text-sky-200 font-medium block">Date d'Arrivée Estimée</span>
            <span class="font-extrabold text-white text-xs sm:text-sm mt-0.5 block">
              {{ formatVoyageDate(voyage.arrivalDate) }}
            </span>
          </div>
        </div>

        <!-- Capacity Progress Bar -->
        <div class="space-y-1.5 pt-3 border-t border-sky-800/80">
          <div class="flex justify-between text-xs font-bold text-sky-200">
            <span>Capacité restante :</span>
            <span class="text-white font-extrabold">
              {{ voyage.capaciteDispo }} Kg disponibles sur {{ voyage.capaciteTotale }} Kg
            </span>
          </div>
          <div class="w-full bg-sky-950 h-3 rounded-full overflow-hidden p-0.5 border border-sky-800">
            <div
              class="bg-amber-400 h-full rounded-full transition-all"
              :style="{ width: `${Math.min(100, Math.max(0, ((voyage.capaciteTotale - voyage.capaciteDispo) / voyage.capaciteTotale) * 100))}%` }"
            ></div>
          </div>
        </div>
      </div>

      <!-- Voyage Full Specifications (2 Grid Columns on Desktop) -->
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        <!-- Left Column: Tarifs, Adresses & Description (lg:col-span-7) -->
        <div class="lg:col-span-7 space-y-5">
          
          <!-- Tarifs Card -->
          <div class="bg-white rounded-3xl p-5 border border-gray-200 shadow-2xs space-y-3">
            <h3 class="text-xs font-bold text-gray-400 uppercase tracking-wider">Tarification appliquée</h3>
            <div class="grid grid-cols-2 gap-4">
              <div class="bg-slate-50 p-3.5 rounded-2xl border border-slate-100 space-y-1">
                <span class="text-xs text-gray-500 block font-medium">Prix par Kg</span>
                <span class="text-lg font-black text-[#B50302] block">{{ voyage.prixKg }}</span>
              </div>
              <div class="bg-slate-50 p-3.5 rounded-2xl border border-slate-100 space-y-1">
                <span class="text-xs text-gray-500 block font-medium">Prix par Objet (Forfait)</span>
                <span class="text-lg font-black text-[#053754] block">{{ voyage.prixObjet }}</span>
              </div>
            </div>
          </div>

          <!-- Adresse de Dépôt Card -->
          <div class="bg-white rounded-3xl p-5 border border-gray-200 shadow-2xs space-y-3">
            <div class="flex items-center justify-between border-b border-gray-100 pb-2">
              <h3 class="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                <span>📍</span> Adresse de Dépôt du colis (Départ)
              </h3>
            </div>
            
            <template v-if="voyage.adresseDepot">
              <div class="space-y-1 text-xs">
                <p class="font-extrabold text-[#053754] text-sm sm:text-base">{{ voyage.adresseDepot.adresse }}</p>
                <p class="text-gray-600 font-medium">{{ voyage.adresseDepot.ville }}, {{ voyage.adresseDepot.pays }}</p>
              </div>
              
              <div v-if="voyage.adresseDepot.horaire_ouverture" class="bg-amber-50/60 border border-amber-200/60 p-3 rounded-2xl text-xs space-y-0.5">
                <span class="text-amber-800 font-bold block">🕒 Horaires d'ouverture :</span>
                <span class="text-amber-900 font-medium block">{{ voyage.adresseDepot.horaire_ouverture }}</span>
              </div>

              <div v-if="voyage.adresseDepot.instructions" class="bg-blue-50/60 border border-blue-200/60 p-3 rounded-2xl text-xs space-y-0.5">
                <span class="text-blue-800 font-bold block">💡 Instructions de dépôt :</span>
                <span class="text-blue-900 font-medium block">{{ voyage.adresseDepot.instructions }}</span>
              </div>
            </template>
            <p v-else class="text-xs text-gray-400 italic">Aucune adresse de dépôt spécifique attribuée.</p>
          </div>

          <!-- Adresse de Récupération Card -->
          <div class="bg-white rounded-3xl p-5 border border-gray-200 shadow-2xs space-y-3">
            <div class="flex items-center justify-between border-b border-gray-100 pb-2">
              <h3 class="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                <span>📍</span> Adresse de Retrait du colis (Destination)
              </h3>
            </div>

            <template v-if="voyage.adresseRetrait">
              <div class="space-y-1 text-xs">
                <p class="font-extrabold text-[#053754] text-sm sm:text-base">{{ voyage.adresseRetrait.adresse }}</p>
                <p class="text-gray-600 font-medium">{{ voyage.adresseRetrait.ville }}, {{ voyage.adresseRetrait.pays }}</p>
              </div>

              <div v-if="voyage.adresseRetrait.horaire_ouverture" class="bg-amber-50/60 border border-amber-200/60 p-3 rounded-2xl text-xs space-y-0.5">
                <span class="text-amber-800 font-bold block">🕒 Horaires de retrait :</span>
                <span class="text-amber-900 font-medium block">{{ voyage.adresseRetrait.horaire_ouverture }}</span>
              </div>

              <div v-if="voyage.adresseRetrait.instructions" class="bg-blue-50/60 border border-blue-200/60 p-3 rounded-2xl text-xs space-y-0.5">
                <span class="text-blue-800 font-bold block">💡 Instructions de retrait :</span>
                <span class="text-blue-900 font-medium block">{{ voyage.adresseRetrait.instructions }}</span>
              </div>
            </template>
            <p v-else class="text-xs text-gray-400 italic">Aucune adresse de retrait spécifique attribuée.</p>
          </div>

          <!-- Description / Notes -->
          <div v-if="voyage.description" class="bg-white rounded-3xl p-5 border border-gray-200 shadow-2xs space-y-2">
            <h3 class="text-xs font-bold text-gray-400 uppercase tracking-wider">Note ou description du transporteur</h3>
            <p class="text-xs text-gray-700 leading-relaxed font-medium bg-gray-50 p-3.5 rounded-2xl border border-gray-100">
              {{ voyage.description }}
            </p>
          </div>
        </div>

        <!-- Right Column: Objets autorisés et interdits (lg:col-span-5) -->
        <div class="lg:col-span-5 space-y-5 lg:sticky lg:top-20">
          
          <!-- Objets autorisés Card -->
          <div class="bg-white rounded-3xl p-5 border border-emerald-300 shadow-2xs space-y-3">
            <div class="flex items-center gap-2 text-emerald-800 font-extrabold text-sm border-b border-emerald-100 pb-2">
              <span class="text-base">✅</span>
              <span>Catégories d'objets autorisées :</span>
            </div>
            
            <div v-if="voyage.categoriesAutorisees.length > 0" class="flex flex-wrap gap-2 pt-1">
              <span
                v-for="cat in voyage.categoriesAutorisees"
                :key="cat"
                class="bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold px-3 py-1.5 rounded-xl flex items-center gap-1.5"
              >
                <span>✓</span>
                <span>{{ cat }}</span>
              </span>
            </div>
            <p v-else class="text-xs text-gray-400 italic">Aucune catégorie spécifiée.</p>
          </div>

          <!-- Objets interdits Card -->
          <div class="bg-white rounded-3xl p-5 border border-red-300 shadow-2xs space-y-3">
            <div class="flex items-center gap-2 text-red-800 font-extrabold text-sm border-b border-red-100 pb-2">
              <span class="text-base">🚫</span>
              <span>Catégories d'objets interdites :</span>
            </div>

            <div v-if="voyage.categoriesRefusees.length > 0" class="flex flex-wrap gap-2 pt-1">
              <span
                v-for="cat in voyage.categoriesRefusees"
                :key="cat"
                class="bg-red-50 text-red-800 border border-red-200 text-xs font-bold px-3 py-1.5 rounded-xl flex items-center gap-1.5"
              >
                <span>✕</span>
                <span>{{ cat }}</span>
              </span>
            </div>
            <p v-else class="text-xs text-gray-400 italic">Aucune interdiction spécifique.</p>
          </div>
        </div>

      </div>

      <!-- Reservations Section (Full Width) -->
      <div class="space-y-4 pt-4 border-t border-gray-200">
        <div class="flex items-center justify-between">
          <h2 class="text-base sm:text-lg font-bold text-principal-dark">
            Réservations effectuées sur ce vol ({{ reservations.length }})
          </h2>
          <span class="text-xs text-gray-500 font-medium">
            Poids réservé : {{ voyage.capaciteTotale - voyage.capaciteDispo }} Kg / {{ voyage.capaciteTotale }} Kg
          </span>
        </div>

        <div v-if="reservations.length > 0" class="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div
            v-for="res in reservations"
            :key="res.id"
            class="bg-white rounded-3xl p-5 border border-gray-200 shadow-sm space-y-4 hover:border-sky-300 transition-all flex flex-col justify-between"
          >
            <!-- Top Row: Code + Status -->
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-2">
                <span class="text-lg">📦</span>
                <span class="font-extrabold text-[#053754] text-sm">{{ res.code }}</span>
              </div>

              <span
                class="text-[11px] font-extrabold px-3 py-1 rounded-full border uppercase tracking-wider"
                :class="res.status === 'en_attente' ? 'bg-amber-50 text-amber-700 border-amber-300' : 'bg-emerald-50 text-emerald-700 border-emerald-200'"
              >
                {{ res.status === 'en_attente' ? 'En Attente' : (res.status === 'acceptee' ? 'Acceptée' : res.status) }}
              </span>
            </div>

            <!-- Client & Parcel Details -->
            <div class="grid grid-cols-2 gap-3 text-xs bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
              <div>
                <span class="text-gray-400 block font-medium">Expéditeur / Client</span>
                <span class="font-extrabold text-gray-900 block mt-0.5">{{ res.clientName }}</span>
                <span class="text-gray-500 font-mono text-[11px] mt-0.5 block">{{ res.clientPhone }}</span>
              </div>

              <div class="text-right">
                <span class="text-gray-400 block font-medium">Contenu & Poids</span>
                <span class="font-extrabold text-gray-900 block mt-0.5">{{ res.parcelType }}</span>
                <span class="text-[#B50302] font-extrabold block mt-0.5">{{ res.weight }}</span>
              </div>
            </div>

            <!-- Action Button -->
            <div class="border-t border-gray-100 pt-3 flex items-center justify-between">
              <div>
                <span class="text-[11px] text-gray-400 block font-medium">Prix Total</span>
                <span class="font-black text-[#053754] text-sm sm:text-base">{{ res.price }}</span>
              </div>

              <button
                @click="goToChat(res.id)"
                type="button"
                class="bg-[#053754] hover:bg-[#074C72] text-white font-extrabold text-xs px-4 py-2.5 rounded-xl transition-colors cursor-pointer flex items-center gap-1.5 shadow-xs"
              >
                💬 Discuter avec le client
              </button>
            </div>
          </div>
        </div>

        <!-- Empty state if no reservations -->
        <div v-else class="bg-white rounded-3xl p-10 text-center border border-gray-200 space-y-2">
          <div class="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center text-xl mx-auto font-bold">
            📦
          </div>
          <p class="text-sm font-bold text-gray-700">Aucune réservation sur ce vol pour le moment.</p>
          <p class="text-xs text-gray-400">Les réservations envoyées par les clients s'afficheront ici automatiquement.</p>
        </div>
      </div>
    </template>
  </div>
</template>

