<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const voyage = ref({
  id: 'voy-1',
  routeFrom: 'Dakar',
  countryFrom: 'Sénégal',
  flagFrom: '🇸🇳',
  routeTo: 'Paris',
  countryTo: 'France',
  flagTo: '🇫🇷',
  departureDate: '22 Septembre 2026 à 10:00',
  arrivalDate: '23 Septembre 2026 à 06:00',
  capaciteTotale: 20,
  capaciteDispo: 14,
  prixKg: '8 500 F CFA',
  prixObjet: '15 000 F CFA',
  devise: 'XOF',
  description: 'Voyage régulier Dakar - Paris. Bagages sécurisés et scellés sous film plastique.',
  statut: 'publie',
  adresseDepot: 'Point Relais Rahma - Parcelles Assainies Unité 15, Dakar',
  horaireDepot: 'Lun - Ven: 08h30 - 18h30',
  instructionsDepot: 'Remettre le colis au gérant avec la pièce d\'identité.',
  adresseRetrait: 'Agence Rahma Paris 10ème - 14 Rue Lafayette, 75010 Paris',
  horaireRetrait: 'Lun - Sam: 09h00 - 19h00',
  instructionsRetrait: 'Présenter la pièce d\'identité du destinataire.',
  categoriesAutorisees: ['Vêtements & tissus', 'Électronique & téléphones', 'Documents & papiers', 'Cosmétiques & soins', 'Médicaments prescrits'],
  categoriesRefusees: ['Aliments périssables', 'Liquides non scellés', 'Produits inflammables', 'Substances illégales']
})

const reservations = ref([
  {
    id: 1,
    clientName: 'Mariama Diallo',
    clientPhone: '+33 6 23 34 56 78',
    parcelType: 'Vêtements & tissus',
    weight: '6Kg',
    price: '51 000 F CFA',
    paymentMode: 'Wave',
    status: 'en_attente',
    code: '#RS-7729'
  },
  {
    id: 2,
    clientName: 'Ibrahima Sow',
    clientPhone: '+221 77 543 21 00',
    parcelType: 'Électronique & téléphone',
    weight: '1Kg (Forfait objet)',
    price: '15 000 F CFA',
    paymentMode: 'Espèces au dépôt',
    status: 'acceptee',
    code: '#RS-8830'
  }
])

const goToChat = (id) => {
  router.push(`/voyageur/messages/${id}`)
}
</script>

<template>
  <div class="space-y-6 pb-16">
    <!-- Header Title & Status -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-xl sm:text-2xl font-serif font-bold text-principal-dark">Détails complets du voyage</h1>
        <p class="text-xs sm:text-sm text-gray-500">Consultez l'ensemble des caractéristiques et les réservations associées</p>
      </div>

      <span class="bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-extrabold px-3.5 py-1 rounded-full uppercase tracking-wider">
        Publié & Ouvert
      </span>
    </div>

    <!-- Summary Dark Blue Header Card -->
    <div class="bg-[#053754] text-white rounded-3xl p-6 shadow-lg space-y-5">
      <!-- Route Graphic -->
      <div class="flex items-center justify-between px-2">
        <!-- Departure -->
        <div class="space-y-0.5">
          <span class="text-2xl">{{ voyage.flagFrom }}</span>
          <h3 class="text-lg sm:text-xl font-extrabold leading-tight">{{ voyage.routeFrom }}</h3>
          <p class="text-xs text-sky-200">{{ voyage.countryFrom }}</p>
        </div>

        <!-- Flight Path Graphic -->
        <div class="flex-1 max-w-[160px] sm:max-w-[220px] px-2 flex items-center justify-center">
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
        <div class="space-y-0.5 text-right">
          <span class="text-2xl">{{ voyage.flagTo }}</span>
          <h3 class="text-lg sm:text-xl font-extrabold leading-tight">{{ voyage.routeTo }}</h3>
          <p class="text-xs text-sky-200">{{ voyage.countryTo }}</p>
        </div>
      </div>

      <!-- Capacity Progress Bar -->
      <div class="space-y-1.5 pt-3 border-t border-sky-800/80">
        <div class="flex justify-between text-xs font-bold text-sky-200">
          <span>Capacité restante :</span>
          <span class="text-white font-extrabold">{{ voyage.capaciteDispo }} Kg disponibles sur {{ voyage.capaciteTotale }} Kg</span>
        </div>
        <div class="w-full bg-sky-950 h-3 rounded-full overflow-hidden p-0.5 border border-sky-800">
          <div
            class="bg-amber-400 h-full rounded-full transition-all"
            :style="{ width: `${((voyage.capaciteTotale - voyage.capaciteDispo) / voyage.capaciteTotale) * 100}%` }"
          ></div>
        </div>
      </div>
    </div>

    <!-- SECTON ALL DETAILS OF THE TRIP (Avant les réservations) -->
    <div class="bg-white rounded-3xl p-6 border border-gray-200 shadow-sm space-y-6">
      <h3 class="text-base font-extrabold text-[#053754] border-b border-gray-100 pb-3 flex items-center gap-2">
        <span>📋</span> Informations & Conditions du Voyage
      </h3>

      <!-- Grid 1: Dates & Tarifs -->
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs sm:text-sm">
        <div class="bg-gray-50 p-4 rounded-2xl border border-gray-200/80 space-y-2">
          <span class="text-gray-400 font-medium block">Horaires du Vol</span>
          <div>Départ: <strong class="text-gray-900 block">{{ voyage.departureDate }}</strong></div>
          <div>Arrivée: <strong class="text-gray-900 block">{{ voyage.arrivalDate }}</strong></div>
        </div>

        <div class="bg-gray-50 p-4 rounded-2xl border border-gray-200/80 space-y-2">
          <span class="text-gray-400 font-medium block">Grille Tarifaire</span>
          <div>Prix au Kg: <strong class="text-[#B50302] font-black text-base">{{ voyage.prixKg }}</strong></div>
          <div>Prix forfait objet: <strong class="text-gray-800 font-extrabold">{{ voyage.prixObjet }}</strong></div>
        </div>
      </div>

      <!-- Description -->
      <div class="space-y-1 bg-sky-50/50 p-4 rounded-2xl border border-sky-100 text-xs sm:text-sm">
        <span class="text-[#074C72] font-extrabold block">Instructions du voyageur :</span>
        <p class="text-gray-700 leading-relaxed font-medium">{{ voyage.description }}</p>
      </div>

      <!-- Points Relais Dépôt & Retrait -->
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs sm:text-sm">
        <div class="bg-gray-50 p-4 rounded-2xl border border-gray-200/80 space-y-1.5">
          <span class="text-[#053754] font-extrabold block">📍 Point de Dépôt (Départ)</span>
          <div class="font-bold text-gray-900">{{ voyage.adresseDepot }}</div>
          <div class="text-gray-500">Horaires: {{ voyage.horaireDepot }}</div>
          <div class="text-gray-400 italic">{{ voyage.instructionsDepot }}</div>
        </div>

        <div class="bg-gray-50 p-4 rounded-2xl border border-gray-200/80 space-y-1.5">
          <span class="text-[#053754] font-extrabold block">📍 Point de Retrait (Destination)</span>
          <div class="font-bold text-gray-900">{{ voyage.adresseRetrait }}</div>
          <div class="text-gray-500">Horaires: {{ voyage.horaireRetrait }}</div>
          <div class="text-gray-400 italic">{{ voyage.instructionsRetrait }}</div>
        </div>
      </div>

      <!-- Catégories d'objets -->
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
        <div class="space-y-2">
          <span class="text-emerald-800 font-extrabold block">✅ Objets Autorisés dans ce vol</span>
          <div class="flex flex-wrap gap-1.5">
            <span v-for="cat in voyage.categoriesAutorisees" :key="cat" class="bg-emerald-50 text-emerald-800 border border-emerald-200 px-2.5 py-1 rounded-lg font-bold">
              ✓ {{ cat }}
            </span>
          </div>
        </div>

        <div class="space-y-2">
          <span class="text-red-800 font-extrabold block">🚫 Objets Stricts Interdits</span>
          <div class="flex flex-wrap gap-1.5">
            <span v-for="cat in voyage.categoriesRefusees" :key="cat" class="bg-red-50 text-red-800 border border-red-200 px-2.5 py-1 rounded-lg font-bold">
              ✕ {{ cat }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- Reservations Section (2 per row on desktop: grid-cols-1 lg:grid-cols-2) -->
    <div class="space-y-4">
      <h2 class="text-base sm:text-lg font-bold text-principal-dark">Réservations sur ce vol ({{ reservations.length }})</h2>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div
          v-for="res in reservations"
          :key="res.id"
          class="bg-white rounded-2xl p-5 border border-gray-200 shadow-2xs space-y-4 hover:border-sky-300 transition-all flex flex-col justify-between"
        >
          <!-- Top Row: Code + Status -->
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2">
              <span class="text-lg">📦</span>
              <span class="font-extrabold text-[#053754] text-sm">{{ res.code }}</span>
            </div>

            <span
              class="text-[11px] font-extrabold px-3 py-1 rounded-full border"
              :class="res.status === 'en_attente' ? 'bg-amber-50 text-amber-700 border-amber-300' : 'bg-emerald-50 text-emerald-700 border-emerald-200'"
            >
              {{ res.status === 'en_attente' ? 'Demande en attente' : 'Réservation Acceptée' }}
            </span>
          </div>

          <!-- Client & Parcel Details -->
          <div class="grid grid-cols-2 gap-3 text-xs">
            <div>
              <span class="text-gray-400 block font-medium">Client</span>
              <span class="font-extrabold text-gray-900 block">{{ res.clientName }}</span>
              <span class="text-gray-500 font-mono text-[11px]">{{ res.clientPhone }}</span>
            </div>

            <div class="text-right">
              <span class="text-gray-400 block font-medium">Colis & Poids</span>
              <span class="font-extrabold text-gray-900 block">{{ res.parcelType }}</span>
              <span class="text-[#B50302] font-bold">{{ res.weight }}</span>
            </div>
          </div>

          <!-- Action Button -->
          <div class="border-t border-gray-100 pt-3 flex items-center justify-between">
            <span class="font-black text-[#053754] text-sm sm:text-base">{{ res.price }}</span>

            <button
              @click="goToChat(res.id)"
              type="button"
              class="bg-[#053754] hover:bg-[#074C72] text-white font-extrabold text-xs px-4 py-2 rounded-xl transition-colors cursor-pointer flex items-center gap-1.5"
            >
              💬 Discuter
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
