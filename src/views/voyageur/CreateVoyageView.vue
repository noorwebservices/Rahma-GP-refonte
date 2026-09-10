<script setup>
import { ref, reactive, computed } from 'vue'
import { useRouter } from 'vue-router'
import Swal from 'sweetalert2'
import CitySelect from '@/components/client/CitySelect.vue'

const router = useRouter()
const currentStep = ref(1)

// Min Date String for HTML datetime-local input
const minDateDepart = computed(() => {
  const now = new Date()
  const tzOffset = now.getTimezoneOffset() * 60000
  const localISOTime = new Date(now.getTime() - tzOffset).toISOString().slice(0, 16)
  return localISOTime
})

const form = reactive({
  // Trajet
  pays_depart: 'Sénégal',
  ville_depart: 'Dakar',
  pays_destination: 'France',
  ville_destination: 'Paris',

  // Dates
  date_depart: '',
  date_arrivee: '',

  // Capacité & Tarifs
  capacite_totale: 20,
  prix_kg: 8500,
  prix_objet: 15000,
  devise: 'XOF',
  description: 'Voyage régulier Dakar - Paris. Bagages sécurisés et scellés.',

  // Dépôt & Retrait (Backend alignment: adresse_depots & adresse_recuperations)
  adresse_depot: 'Point Relais Rahma - Parcelles Assainies, Dakar',
  horaire_depot: 'Lun - Ven: 09h00 - 18h00',
  instructions_depot: 'Remettre le colis en main propre au relais.',

  adresse_retrait: 'Agence Rahma Paris 10ème (Gare du Nord)',
  horaire_retrait: 'Lun - Sam: 09h00 - 19h00',
  instructions_retrait: 'Présenter la pièce d\'identité du destinataire.',

  // Catégories autorisées / refusées (JSON)
  objets_autorises: [
    'Vêtements & tissus',
    'Électronique & téléphones',
    'Documents & papiers',
    'Cosmétiques & soins',
    'Médicaments sur ordonnance'
  ],
  objets_interdits: [
    'Aliments périssables',
    'Liquides non scellés',
    'Produits inflammables',
    'Substances illégales'
  ],
  statut: 'brouillon'
})

// Presets selection state
const selectedDepotPreset = ref('relais_dakar')
const selectedRetraitPreset = ref('agence_paris_nord')

const onDepotPresetChange = () => {
  if (selectedDepotPreset.value === 'relais_dakar') {
    form.adresse_depot = 'Point Relais Rahma - Parcelles Assainies Unité 15, Dakar'
    form.horaire_depot = 'Lun - Ven: 08h30 - 18h30'
  } else if (selectedDepotPreset.value === 'aeroport_aibd') {
    form.adresse_depot = 'Aéroport International Blaise Diagne (AIBD), Diass'
    form.horaire_depot = 'Jour du départ: 3h avant le vol'
  } else if (selectedDepotPreset.value === 'new') {
    form.adresse_depot = ''
    form.horaire_depot = ''
  }
}

const onRetraitPresetChange = () => {
  if (selectedRetraitPreset.value === 'agence_paris_nord') {
    form.adresse_retrait = 'Agence Rahma Paris 10ème (Gare du Nord, 14 Rue Lafayette)'
    form.horaire_retrait = 'Lun - Sam: 09h00 - 19h00'
  } else if (selectedRetraitPreset.value === 'aeroport_orly') {
    form.adresse_retrait = 'Aéroport Paris-Orly (Zone Arrivée Terminal 4)'
    form.horaire_retrait = 'À l\'arrivée du vol'
  } else if (selectedRetraitPreset.value === 'new') {
    form.adresse_retrait = ''
    form.horaire_retrait = ''
  }
}

// Custom category inputs
const customAutorise = ref('')
const customInterdit = ref('')

const dateError = ref('')

// Pre-defined category choices for air travel
const presetAutorises = [
  'Vêtements & tissus',
  'Électronique & téléphones',
  'Documents & papiers',
  'Cosmétiques & soins',
  'Médicaments sur ordonnance',
  'Bijoux & valeurs',
  'Artisanat & souvenirs',
  'Nourriture sèche & épices scellées'
]

const presetInterdits = [
  'Aliments périssables',
  'Liquides non scellés (> 100ml)',
  'Produits inflammables & aérosols',
  'Substances illégales ou interdites',
  'Armes & objets tranchants'
]

// Strict Validation logic for dates
const validateDates = () => {
  dateError.value = ''
  if (!form.date_depart) {
    dateError.value = 'La date de départ est requise.'
    return false
  }
  if (!form.date_arrivee) {
    dateError.value = 'La date d\'arrivée est requise.'
    return false
  }

  const now = new Date()
  const dep = new Date(form.date_depart)
  const arr = new Date(form.date_arrivee)

  if (dep < now) {
    dateError.value = 'La date de départ ne peut pas être une date passée.'
    return false
  }

  if (arr <= dep) {
    dateError.value = 'La date d\'arrivée doit être strictement postérieure à la date de départ.'
    return false
  }
  return true
}

const nextStep = () => {
  if (currentStep.value === 2) {
    if (!validateDates()) {
      return // BLOCKS NAVIGATION IF INVALID!
    }
  }
  if (currentStep.value < 5) {
    currentStep.value++
  }
}

const prevStep = () => {
  if (currentStep.value > 1) {
    currentStep.value--
  }
}

// Toggle Autorises & Interdits
const toggleAutorise = (cat) => {
  const index = form.objets_autorises.indexOf(cat)
  if (index > -1) {
    form.objets_autorises.splice(index, 1)
  } else {
    form.objets_autorises.push(cat)
  }
}

const toggleInterdit = (cat) => {
  const index = form.objets_interdits.indexOf(cat)
  if (index > -1) {
    form.objets_interdits.splice(index, 1)
  } else {
    form.objets_interdits.push(cat)
  }
}

const addCustomAutorise = () => {
  if (customAutorise.value.trim()) {
    const val = customAutorise.value.trim()
    if (!form.objets_autorises.includes(val)) {
      form.objets_autorises.push(val)
    }
    customAutorise.value = ''
  }
}

const addCustomInterdit = () => {
  if (customInterdit.value.trim()) {
    const val = customInterdit.value.trim()
    if (!form.objets_interdits.includes(val)) {
      form.objets_interdits.push(val)
    }
    customInterdit.value = ''
  }
}

const submitVoyage = () => {
  Swal.fire({
    toast: true,
    position: 'top-end',
    icon: 'success',
    title: 'Voyage enregistré en brouillon avec succès !',
    showConfirmButton: false,
    timer: 3000
  })
  router.push('/voyageur')
}
</script>

<template>
  <div class="space-y-6 pb-16">
    <!-- Header -->
    <div class="space-y-1">
      <h1 class="text-xl sm:text-2xl font-serif font-bold text-principal-dark">Publier un voyage</h1>
      <p class="text-xs sm:text-sm text-gray-500">Renseignez votre trajet et vos disponibilités pour transporter des colis</p>
    </div>

    <!-- Multi-Step Progress Indicator -->
    <div class="bg-white rounded-2xl p-4 border border-gray-200 shadow-2xs space-y-3">
      <div class="flex items-center justify-between text-xs font-bold text-[#053754]">
        <span>Étape {{ currentStep }} sur 5</span>
        <span v-if="currentStep === 1">1. Trajet</span>
        <span v-else-if="currentStep === 2">2. Dates & Heures</span>
        <span v-else-if="currentStep === 3">3. Capacité & Tarifs</span>
        <span v-else-if="currentStep === 4">4. Points Relais</span>
        <span v-else>5. Catégories d'objets</span>
      </div>

      <div class="w-full bg-gray-100 h-2 rounded-full overflow-hidden flex">
        <div
          class="bg-[#B50302] h-full transition-all duration-300 rounded-full"
          :style="{ width: `${(currentStep / 5) * 100}%` }"
        ></div>
      </div>
    </div>

    <!-- Form Content Container -->
    <div class="bg-white rounded-3xl p-6 border border-gray-200 shadow-sm space-y-6">
      
      <!-- STEP 1: TRAJET (Uses CitySelect component!) -->
      <div v-if="currentStep === 1" class="space-y-4">
        <h3 class="text-base font-extrabold text-[#053754] border-b border-gray-100 pb-2">1. Sélectionnez votre trajet</h3>

        <div class="space-y-4">
          <!-- Departure City Select -->
          <div class="space-y-1.5">
            <label class="block text-xs font-bold text-gray-700">Ville & Pays de Départ</label>
            <CitySelect
              v-model="form.ville_depart"
              placeholder="Rechercher une ville de départ..."
            />
          </div>

          <!-- Destination City Select -->
          <div class="space-y-1.5">
            <label class="block text-xs font-bold text-gray-700">Ville & Pays de Destination</label>
            <CitySelect
              v-model="form.ville_destination"
              placeholder="Rechercher une ville de destination..."
            />
          </div>
        </div>
      </div>

      <!-- STEP 2: DATES & STRICT VALIDATIONS -->
      <div v-else-if="currentStep === 2" class="space-y-4">
        <h3 class="text-base font-extrabold text-[#053754] border-b border-gray-100 pb-2">2. Dates et Heures du voyage</h3>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div class="space-y-1.5">
            <label class="block text-xs font-bold text-gray-700">Date et heure de départ</label>
            <input
              v-model="form.date_depart"
              :min="minDateDepart"
              @change="validateDates"
              type="datetime-local"
              class="w-full bg-[#F3F4F6] border border-gray-200 rounded-xl px-4 py-3 text-xs sm:text-sm text-gray-800 outline-none focus:bg-white focus:ring-2 focus:ring-[#074C72]/20"
            />
            <span class="text-[11px] text-gray-400">Les dates passées ne sont pas autorisées</span>
          </div>

          <div class="space-y-1.5">
            <label class="block text-xs font-bold text-gray-700">Date et heure d'arrivée prévues</label>
            <input
              v-model="form.date_arrivee"
              :min="form.date_depart || minDateDepart"
              @change="validateDates"
              type="datetime-local"
              class="w-full bg-[#F3F4F6] border border-gray-200 rounded-xl px-4 py-3 text-xs sm:text-sm text-gray-800 outline-none focus:bg-white focus:ring-2 focus:ring-[#074C72]/20"
            />
            <span class="text-[11px] text-gray-400">L'arrivée doit être postérieure au départ</span>
          </div>
        </div>

        <p v-if="dateError" class="text-xs text-red-600 font-extrabold mt-2 bg-red-50 p-3.5 rounded-xl border border-red-200 flex items-center gap-2">
          <span>⚠️</span> {{ dateError }}
        </p>
      </div>

      <!-- STEP 3: CAPACITÉ & TARIFS -->
      <div v-else-if="currentStep === 3" class="space-y-4">
        <h3 class="text-base font-extrabold text-[#053754] border-b border-gray-100 pb-2">3. Capacité bagages & Tarification</h3>

        <div class="space-y-4">
          <div class="space-y-1.5">
            <label class="block text-xs font-bold text-gray-700">Capacité totale disponible (en Kg)</label>
            <input
              v-model.number="form.capacite_totale"
              type="number"
              placeholder="ex: 20"
              class="w-full bg-[#F3F4F6] border border-gray-200 rounded-xl px-4 py-3 text-xs sm:text-sm text-gray-800 outline-none focus:bg-white focus:ring-2 focus:ring-[#074C72]/20"
            />
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div class="space-y-1.5">
              <label class="block text-xs font-bold text-gray-700">Prix au Kg (F CFA)</label>
              <input
                v-model.number="form.prix_kg"
                type="number"
                placeholder="ex: 8500"
                class="w-full bg-[#F3F4F6] border border-gray-200 rounded-xl px-4 py-3 text-xs sm:text-sm text-gray-800 outline-none focus:bg-white focus:ring-2 focus:ring-[#074C72]/20"
              />
            </div>

            <div class="space-y-1.5">
              <label class="block text-xs font-bold text-gray-700">Prix objet spécifique (Optionnel)</label>
              <input
                v-model.number="form.prix_objet"
                type="number"
                placeholder="ex: 15000"
                class="w-full bg-[#F3F4F6] border border-gray-200 rounded-xl px-4 py-3 text-xs sm:text-sm text-gray-800 outline-none focus:bg-white focus:ring-2 focus:ring-[#074C72]/20"
              />
            </div>
          </div>
        </div>
      </div>

      <!-- STEP 4: POINTS RELAIS (SELECT PRESETS & DISABLED FIELDS) -->
      <div v-else-if="currentStep === 4" class="space-y-4">
        <h3 class="text-base font-extrabold text-[#053754] border-b border-gray-100 pb-2">4. Lieux de Dépôt & Récupération</h3>

        <div class="space-y-4">
          <!-- Point Dépôt Select & Disabled Inputs -->
          <div class="bg-gray-50 p-4 rounded-2xl border border-gray-200 space-y-3">
            <h4 class="text-xs font-extrabold text-[#053754] flex items-center gap-1.5">
              <span>📍</span> Point de Dépôt (Ville de Départ)
            </h4>

            <div class="space-y-2">
              <label class="block text-[11px] font-bold text-gray-600">Choisissez une adresse enregistrée :</label>
              <select
                v-model="selectedDepotPreset"
                @change="onDepotPresetChange"
                class="w-full bg-white border border-gray-300 rounded-xl px-3.5 py-2.5 text-xs text-gray-800 font-bold outline-none"
              >
                <option value="relais_dakar">Point Relais Rahma - Parcelles Assainies, Dakar</option>
                <option value="aeroport_aibd">Aéroport International Blaise Diagne (AIBD), Diass</option>
                <option value="new">➕ Enregistrer une nouvelle adresse de dépôt...</option>
              </select>

              <div class="space-y-2 pt-1">
                <input
                  v-model="form.adresse_depot"
                  :disabled="selectedDepotPreset !== 'new'"
                  type="text"
                  placeholder="Adresse de dépôt"
                  class="w-full bg-white border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs text-gray-800 outline-none disabled:bg-gray-200/70 disabled:text-gray-500 disabled:cursor-not-allowed font-medium"
                />
                <input
                  v-model="form.horaire_depot"
                  :disabled="selectedDepotPreset !== 'new'"
                  type="text"
                  placeholder="Horaires d'ouverture"
                  class="w-full bg-white border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs text-gray-800 outline-none disabled:bg-gray-200/70 disabled:text-gray-500 disabled:cursor-not-allowed font-medium"
                />
              </div>
            </div>
          </div>

          <!-- Point Retrait Select & Disabled Inputs -->
          <div class="bg-gray-50 p-4 rounded-2xl border border-gray-200 space-y-3">
            <h4 class="text-xs font-extrabold text-[#053754] flex items-center gap-1.5">
              <span>📍</span> Point de Retrait (Ville de Destination)
            </h4>

            <div class="space-y-2">
              <label class="block text-[11px] font-bold text-gray-600">Choisissez une adresse enregistrée :</label>
              <select
                v-model="selectedRetraitPreset"
                @change="onRetraitPresetChange"
                class="w-full bg-white border border-gray-300 rounded-xl px-3.5 py-2.5 text-xs text-gray-800 font-bold outline-none"
              >
                <option value="agence_paris_nord">Agence Rahma Paris 10ème (Gare du Nord)</option>
                <option value="aeroport_orly">Aéroport Paris-Orly (Zone Arrivée)</option>
                <option value="new">➕ Enregistrer une nouvelle adresse de retrait...</option>
              </select>

              <div class="space-y-2 pt-1">
                <input
                  v-model="form.adresse_retrait"
                  :disabled="selectedRetraitPreset !== 'new'"
                  type="text"
                  placeholder="Adresse de retrait"
                  class="w-full bg-white border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs text-gray-800 outline-none disabled:bg-gray-200/70 disabled:text-gray-500 disabled:cursor-not-allowed font-medium"
                />
                <input
                  v-model="form.horaire_retrait"
                  :disabled="selectedRetraitPreset !== 'new'"
                  type="text"
                  placeholder="Horaires d'ouverture"
                  class="w-full bg-white border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs text-gray-800 outline-none disabled:bg-gray-200/70 disabled:text-gray-500 disabled:cursor-not-allowed font-medium"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- STEP 5: CATÉGORIES ACCEPTÉES ET REFUSÉES AVEC SAISIE PERSONNALISÉE DES DEUX CÔTÉS -->
      <div v-else-if="currentStep === 5" class="space-y-6">
        <h3 class="text-base font-extrabold text-[#053754] border-b border-gray-100 pb-2">5. Catégories d'objets autorisées & interdites</h3>

        <!-- SECTION A: AUTORISÉES -->
        <div class="space-y-3">
          <label class="block text-xs font-extrabold text-emerald-800">✅ Catégories d'objets ACCEPTÉES dans vos bagages</label>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <div
              v-for="cat in presetAutorises"
              :key="cat"
              @click="toggleAutorise(cat)"
              class="p-3 rounded-xl border text-xs font-bold flex items-center justify-between cursor-pointer transition-all"
              :class="form.objets_autorises.includes(cat) ? 'bg-emerald-50 border-emerald-300 text-emerald-800' : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'"
            >
              <span>{{ cat }}</span>
              <span v-if="form.objets_autorises.includes(cat)" class="text-emerald-600 text-sm">✓</span>
            </div>
          </div>

          <!-- Custom Add Input Field for Autorises -->
          <div class="flex gap-2 pt-1">
            <input
              v-model="customAutorise"
              type="text"
              placeholder="✍️ Autre objet accepté (ex: Épices et thés scellés)"
              class="flex-1 bg-[#F3F4F6] border border-gray-200 rounded-xl px-4 py-2.5 text-xs text-gray-800 outline-none"
              @keyup.enter="addCustomAutorise"
            />
            <button
              @click="addCustomAutorise"
              type="button"
              class="bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold text-xs px-4 py-2.5 rounded-xl cursor-pointer shrink-0"
            >
              + Ajouter
            </button>
          </div>
        </div>

        <!-- SECTION B: INTERDITES / REFUSÉES -->
        <div class="space-y-3 pt-4 border-t border-gray-100">
          <label class="block text-xs font-extrabold text-red-800">🚫 Catégories d'objets STRICTEMENT REFUSÉES</label>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <div
              v-for="cat in presetInterdits"
              :key="cat"
              @click="toggleInterdit(cat)"
              class="p-3 rounded-xl border text-xs font-bold flex items-center justify-between cursor-pointer transition-all"
              :class="form.objets_interdits.includes(cat) ? 'bg-red-50 border-red-300 text-red-800' : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'"
            >
              <span>{{ cat }}</span>
              <span v-if="form.objets_interdits.includes(cat)" class="text-red-600 text-sm">✕</span>
            </div>
          </div>

          <!-- Custom Add Input Field for Interdits -->
          <div class="flex gap-2 pt-1">
            <input
              v-model="customInterdit"
              type="text"
              placeholder="✍️ Autre objet refusé (ex: Parfums > 100ml)"
              class="flex-1 bg-[#F3F4F6] border border-gray-200 rounded-xl px-4 py-2.5 text-xs text-gray-800 outline-none"
              @keyup.enter="addCustomInterdit"
            />
            <button
              @click="addCustomInterdit"
              type="button"
              class="bg-[#B50302] hover:bg-[#8B0000] text-white font-extrabold text-xs px-4 py-2.5 rounded-xl cursor-pointer shrink-0"
            >
              + Ajouter
            </button>
          </div>
        </div>

      </div>

      <!-- Navigation Buttons -->
      <div class="border-t border-gray-100 pt-4 flex items-center justify-between gap-3">
        <button
          v-if="currentStep > 1"
          @click="prevStep"
          type="button"
          class="px-5 py-3 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs sm:text-sm transition-colors cursor-pointer"
        >
          Précédent
        </button>

        <div class="ml-auto">
          <button
            v-if="currentStep < 5"
            @click="nextStep"
            type="button"
            class="bg-[#053754] hover:bg-[#074C72] text-white font-extrabold text-xs sm:text-sm py-3.5 px-6 rounded-xl shadow-md transition-all cursor-pointer uppercase tracking-wider"
          >
            Suivant
          </button>

          <button
            v-else
            @click="submitVoyage"
            type="button"
            class="bg-[#B50302] hover:bg-[#8B0000] text-white font-extrabold text-xs sm:text-sm py-3.5 px-6 rounded-xl shadow-lg transition-all cursor-pointer uppercase tracking-wider active:scale-[0.99]"
          >
            ENREGISTRER CE VOYAGE (BROUILLON)
          </button>
        </div>
      </div>

    </div>
  </div>
</template>
