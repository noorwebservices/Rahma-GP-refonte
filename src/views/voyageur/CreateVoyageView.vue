<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import Swal from 'sweetalert2'
import CitySelect from '@/components/client/CitySelect.vue'
import { fetchAdresseDepots, createAdresseDepot, fetchAdresseRecuperations, createAdresseRecuperation } from '@/services/adresseService'
import { createVoyage } from '@/services/voyageService'
import { useAuth } from '@/composables/useAuth'
import { useI18n } from '@/composables/useI18n'

const router = useRouter()
const { user } = useAuth()
const { t } = useI18n()

const currentStep = ref(1)
const isLoading = ref(false)

// Toast Helper
const showToast = (icon, title) => {
  Swal.fire({
    toast: true,
    position: 'top-end',
    icon,
    title,
    showConfirmButton: false,
    timer: 3500
  })
}

// Min Date String for HTML datetime-local input
const minDateDepart = computed(() => {
  const now = new Date()
  const tzOffset = now.getTimezoneOffset() * 60000
  return new Date(now.getTime() - tzOffset).toISOString().slice(0, 16)
})

// Main Form State matching backend StoreVoyageRequest schema
const form = reactive({
  adresse_depot_id: '',
  adresse_recuperation_id: '',
  pays_depart: '',
  ville_depart: '',
  pays_destination: '',
  ville_destination: '',
  date_depart: '',
  date_arrivee: '',
  capacite_totale: null,
  prix_kg: null,
  prix_objet: null,
  devise: 'XOF',
  description: '',
  objets_autorises: [],
  objets_interdits: [],
  statut: 'brouillon'
})

// Addresses lists fetched from backend
const adressesDepot = ref([])
const adressesRecuperation = ref([])

// New Address Modal States
const showDepotModal = ref(false)
const showRecupModal = ref(false)

const newDepotForm = reactive({
  adresse: '',
  ville: '',
  pays: '',
  horaire_ouverture: '',
  instructions: '',
  latitude: null,
  longitude: null
})

const newRecupForm = reactive({
  adresse: '',
  ville: '',
  pays: '',
  horaire_ouverture: '',
  instructions: '',
  latitude: null,
  longitude: null
})

// Load existing addresses on mount
onMounted(async () => {
  await loadAddresses()
})

const loadAddresses = async () => {
  try {
    const resDepot = await fetchAdresseDepots()
    if (resDepot && resDepot.data) {
      adressesDepot.value = resDepot.data
      if (adressesDepot.value.length > 0 && !form.adresse_depot_id) {
        form.adresse_depot_id = adressesDepot.value[0].id
      }
    }
  } catch (err) {
    adressesDepot.value = []
  }

  try {
    const resRecup = await fetchAdresseRecuperations()
    if (resRecup && resRecup.data) {
      adressesRecuperation.value = resRecup.data
      if (adressesRecuperation.value.length > 0 && !form.adresse_recuperation_id) {
        form.adresse_recuperation_id = adressesRecuperation.value[0].id
      }
    }
  } catch (err) {
    adressesRecuperation.value = []
  }
}

// Save New Adresse de Dépôt
const submitNewDepotAddress = async () => {
  if (!newDepotForm.adresse.trim() || !newDepotForm.ville.trim() || !newDepotForm.pays.trim()) {
    showToast('warning', 'Veuillez remplir l\'adresse, la ville et le pays.')
    return
  }
  isLoading.value = true
  try {
    const res = await createAdresseDepot({ ...newDepotForm })
    showToast('success', 'Adresse de dépôt enregistrée avec succès !')
    showDepotModal.value = false
    await loadAddresses()
    if (res && res.data && res.data.id) {
      form.adresse_depot_id = res.data.id
    }
  } catch (err) {
    showToast('error', err?.message || 'Erreur lors de la création de l\'adresse de dépôt.')
  } finally {
    isLoading.value = false
  }
}

// Save New Adresse de Récupération
const submitNewRecupAddress = async () => {
  if (!newRecupForm.adresse.trim() || !newRecupForm.ville.trim() || !newRecupForm.pays.trim()) {
    showToast('warning', 'Veuillez remplir l\'adresse, la ville et le pays.')
    return
  }
  isLoading.value = true
  try {
    const res = await createAdresseRecuperation({ ...newRecupForm })
    showToast('success', 'Adresse de récupération enregistrée avec succès !')
    showRecupModal.value = false
    await loadAddresses()
    if (res && res.data && res.data.id) {
      form.adresse_recuperation_id = res.data.id
    }
  } catch (err) {
    showToast('error', err?.message || 'Erreur lors de la création de l\'adresse de récupération.')
  } finally {
    isLoading.value = false
  }
}

// Custom category inputs
const customAutorise = ref('')
const customInterdit = ref('')
const dateError = ref('')

const presetAutorises = ref([
  'Vêtements & tissus',
  'Électronique & téléphones',
  'Documents & papiers',
  'Cosmétiques & soins',
  'Médicaments sur ordonnance',
  'Bijoux & valeurs',
  'Artisanat & souvenirs',
  'Nourriture sèche & épices scellées'
])

const presetInterdits = ref([
  'Aliments périssables',
  'Liquides non scellés > 100ml',
  'Produits inflammables & aérosols',
  'Substances illégales ou interdites',
  'Objets tranchants'
])

const allAutorisesList = computed(() => {
  return Array.from(new Set([...presetAutorises.value, ...form.objets_autorises]))
})

const allInterditsList = computed(() => {
  return Array.from(new Set([...presetInterdits.value, ...form.objets_interdits]))
})

// Strict Validation matching backend rules
const validateDates = () => {
  dateError.value = ''
  if (!form.date_depart) {
    dateError.value = 'La date de départ est obligatoire.'
    return false
  }
  if (!form.date_arrivee) {
    dateError.value = 'La date d\'arrivée est obligatoire.'
    return false
  }

  const now = new Date()
  const dep = new Date(form.date_depart)
  const arr = new Date(form.date_arrivee)

  if (dep < now) {
    dateError.value = 'La date de départ doit être aujourd\'hui ou une date future.'
    return false
  }

  if (arr <= dep) {
    dateError.value = 'La date d\'arrivée doit être strictement supérieure à la date de départ.'
    return false
  }
  return true
}

const validateStep = (step) => {
  if (step === 1) {
    if (!form.ville_depart || !form.ville_destination) {
      showToast('warning', 'Veuillez sélectionner les villes de départ et de destination.')
      return false
    }
  } else if (step === 2) {
    if (!validateDates()) {
      showToast('warning', dateError.value)
      return false
    }
  } else if (step === 3) {
    if (!form.capacite_totale || form.capacite_totale <= 0) {
      showToast('warning', 'La capacité totale (en Kg) doit être supérieure à 0.')
      return false
    }
  } else if (step === 4) {
    if (!form.adresse_depot_id) {
      showToast('warning', 'Veuillez sélectionner une adresse de dépôt.')
      return false
    }
    if (!form.adresse_recuperation_id) {
      showToast('warning', 'Veuillez sélectionner une adresse de récupération.')
      return false
    }
  }
  return true
}

const nextStep = () => {
  if (!validateStep(currentStep.value)) return
  if (currentStep.value < 5) currentStep.value++
}

const prevStep = () => {
  if (currentStep.value > 1) currentStep.value--
}

const toggleAutorise = (cat) => {
  const index = form.objets_autorises.indexOf(cat)
  if (index > -1) form.objets_autorises.splice(index, 1)
  else form.objets_autorises.push(cat)
}

const toggleInterdit = (cat) => {
  const index = form.objets_interdits.indexOf(cat)
  if (index > -1) form.objets_interdits.splice(index, 1)
  else form.objets_interdits.push(cat)
}

const addCustomAutorise = () => {
  if (customAutorise.value.trim()) {
    const val = customAutorise.value.trim()
    if (!presetAutorises.value.includes(val)) presetAutorises.value.push(val)
    if (!form.objets_autorises.includes(val)) form.objets_autorises.push(val)
    customAutorise.value = ''
  }
}

const addCustomInterdit = () => {
  if (customInterdit.value.trim()) {
    const val = customInterdit.value.trim()
    if (!presetInterdits.value.includes(val)) presetInterdits.value.push(val)
    if (!form.objets_interdits.includes(val)) form.objets_interdits.push(val)
    customInterdit.value = ''
  }
}

// Format date string for Backend API
const formatDateForApi = (dateStr) => {
  if (!dateStr) return null
  return dateStr.replace('T', ' ') + ':00'
}

// Submit Voyage to Backend API
const handleSaveVoyage = async (targetStatut) => {
  if (!validateStep(1) || !validateStep(2) || !validateStep(3) || !validateStep(4)) return

  form.statut = targetStatut
  isLoading.value = true

  const payload = {
    adresse_depot_id: form.adresse_depot_id,
    adresse_recuperation_id: form.adresse_recuperation_id,
    pays_depart: form.pays_depart,
    ville_depart: form.ville_depart,
    pays_destination: form.pays_destination,
    ville_destination: form.ville_destination,
    date_depart: formatDateForApi(form.date_depart),
    date_arrivee: formatDateForApi(form.date_arrivee),
    capacite_totale: Number(form.capacite_totale),
    prix_kg: Number(form.prix_kg) || 0,
    prix_objet: Number(form.prix_objet) || 0,
    devise: form.devise,
    description: form.description,
    objets_autorises: form.objets_autorises,
    objets_interdits: form.objets_interdits,
    statut: form.statut
  }

  try {
    await createVoyage(payload)
    showToast('success', targetStatut === 'publie' ? 'Voyage publié avec succès !' : 'Voyage enregistré en brouillon !')
    router.push('/voyageur')
  } catch (err) {
    const errMsg = err?.message || 'Une erreur est survenue lors de l\'enregistrement du voyage.'
    showToast('error', errMsg)
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <div class="space-y-6 pb-20 font-sans">
    <!-- Header Title & Stepper indicator -->
    <div class="space-y-2">
      <div class="flex items-center justify-between">
        <h1 class="text-xl sm:text-2xl font-serif font-bold text-principal-dark dark:text-sky-300">{{ t('voyageur.createVoyage.title') }}</h1>
        <span class="text-xs font-bold text-[#074C72] dark:text-sky-400 bg-sky-50 dark:bg-sky-950/60 px-3 py-1 rounded-full border border-sky-100 dark:border-sky-800">
          {{ t('booking.stepProgress').replace('{step}', currentStep).replace('{total}', 5) }}
        </span>
      </div>

      <div class="text-xs font-semibold text-gray-500 dark:text-slate-400">
        <span v-if="currentStep === 1">1. {{ t('voyageur.createVoyage.step1') }}</span>
        <span v-else-if="currentStep === 2">2. {{ t('voyageur.createVoyage.step2') }}</span>
        <span v-else-if="currentStep === 3">3. {{ t('voyageur.createVoyage.step3') }}</span>
        <span v-else-if="currentStep === 4">4. {{ t('voyageur.createVoyage.step4') }}</span>
        <span v-else>5. {{ t('voyageur.createVoyage.acceptedItems') }}</span>
      </div>

      <div class="w-full bg-gray-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden flex">
        <div
          class="bg-[#B50302] dark:bg-rose-500 h-full transition-all duration-300 rounded-full"
          :style="{ width: `${(currentStep / 5) * 100}%` }"
        ></div>
      </div>
    </div>

    <!-- Form Content Container -->
    <div class="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-gray-200 dark:border-slate-800 shadow-sm space-y-6">
      
      <!-- STEP 1: TRAJET -->
      <div v-if="currentStep === 1" class="space-y-4">
        <h3 class="text-base font-extrabold text-[#053754] dark:text-sky-300 border-b border-gray-100 dark:border-slate-800 pb-2">1. {{ t('voyageur.createVoyage.step1') }}</h3>

        <div class="space-y-4">
          <!-- Departure City Select -->
          <div class="space-y-1.5">
            <label class="block text-xs font-bold text-gray-700 dark:text-slate-300">{{ t('voyageur.createVoyage.departureCity') }}</label>
            <CitySelect
              v-model="form.ville_depart"
              :placeholder="t('clientHome.searchDeparture')"
            />
          </div>

          <!-- Destination City Select -->
          <div class="space-y-1.5">
            <label class="block text-xs font-bold text-gray-700 dark:text-slate-300">{{ t('voyageur.createVoyage.destinationCity') }}</label>
            <CitySelect
              v-model="form.ville_destination"
              :placeholder="t('clientHome.searchArrival')"
            />
          </div>
        </div>
      </div>

      <!-- STEP 2: DATES & HEURES -->
      <div v-else-if="currentStep === 2" class="space-y-4">
        <h3 class="text-base font-extrabold text-[#053754] dark:text-sky-300 border-b border-gray-100 dark:border-slate-800 pb-2">2. {{ t('voyageur.createVoyage.departureDate') }}</h3>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div class="space-y-1.5">
            <label class="block text-xs font-bold text-gray-700 dark:text-slate-300">{{ t('voyageur.createVoyage.departureDate') }}</label>
            <input
              v-model="form.date_depart"
              :min="minDateDepart"
              @change="validateDates"
              type="datetime-local"
              class="w-full bg-[#F3F4F6] dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl px-4 py-3 text-xs sm:text-sm text-gray-800 dark:text-slate-100 outline-none focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-[#074C72]/20"
            />
          </div>

          <div class="space-y-1.5">
            <label class="block text-xs font-bold text-gray-700 dark:text-slate-300">{{ t('voyageur.createVoyage.arrivalDate') }}</label>
            <input
              v-model="form.date_arrivee"
              :min="form.date_depart || minDateDepart"
              @change="validateDates"
              type="datetime-local"
              class="w-full bg-[#F3F4F6] dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl px-4 py-3 text-xs sm:text-sm text-gray-800 dark:text-slate-100 outline-none focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-[#074C72]/20"
            />
          </div>
        </div>

        <p v-if="dateError" class="text-xs text-red-600 dark:text-rose-400 font-extrabold mt-2 bg-red-50 dark:bg-rose-950/40 p-3.5 rounded-xl border border-red-200 dark:border-rose-900 flex items-center gap-2">
          <span>⚠️</span> {{ dateError }}
        </p>
      </div>

      <!-- STEP 3: CAPACITÉ & TARIFS -->
      <div v-else-if="currentStep === 3" class="space-y-4">
        <h3 class="text-base font-extrabold text-[#053754] dark:text-sky-300 border-b border-gray-100 dark:border-slate-800 pb-2">3. {{ t('voyageur.createVoyage.step2') }}</h3>

        <div class="space-y-4">
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div class="space-y-1.5">
              <label class="block text-xs font-bold text-gray-700 dark:text-slate-300">{{ t('voyageur.createVoyage.totalCapacityKg') }} *</label>
              <input
                v-model.number="form.capacite_totale"
                type="number"
                placeholder="ex: 25"
                class="w-full bg-[#F3F4F6] dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl px-4 py-3 text-xs sm:text-sm text-gray-800 dark:text-slate-100 outline-none focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-[#074C72]/20"
              />
            </div>

            <div class="space-y-1.5">
              <label class="block text-xs font-bold text-gray-700 dark:text-slate-300">{{ t('voyageur.createVoyage.currency') }} *</label>
              <select
                v-model="form.devise"
                class="w-full bg-[#F3F4F6] dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl px-4 py-3 text-xs sm:text-sm text-gray-800 dark:text-slate-100 font-bold outline-none focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-[#074C72]/20"
              >
                <option value="XOF" class="dark:bg-slate-800">FCFA (XOF) - Franc CFA</option>
                <option value="EUR" class="dark:bg-slate-800">EUR (€) - Euro</option>
                <option value="USD" class="dark:bg-slate-800">USD ($) - Dollar US</option>
              </select>
            </div>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div class="space-y-1.5">
              <label class="block text-xs font-bold text-gray-700 dark:text-slate-300">{{ t('voyageur.createVoyage.pricePerKg') }} ({{ form.devise }}) *</label>
              <input
                v-model.number="form.prix_kg"
                type="number"
                placeholder="ex: 8500"
                class="w-full bg-[#F3F4F6] dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl px-4 py-3 text-xs sm:text-sm text-gray-800 dark:text-slate-100 outline-none focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-[#074C72]/20"
              />
            </div>

            <div class="space-y-1.5">
              <label class="block text-xs font-bold text-gray-700 dark:text-slate-300">{{ t('voyageur.createVoyage.pricePerObject') }} ({{ form.devise }})</label>
              <input
                v-model.number="form.prix_objet"
                type="number"
                placeholder="ex: 15000"
                class="w-full bg-[#F3F4F6] dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl px-4 py-3 text-xs sm:text-sm text-gray-800 dark:text-slate-100 outline-none focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-[#074C72]/20"
              />
            </div>
          </div>

          <div class="space-y-1.5">
            <label class="block text-xs font-bold text-gray-700 dark:text-slate-300">{{ t('voyageur.createVoyage.conditions') }}</label>
            <textarea
              v-model="form.description"
              rows="3"
              placeholder="Fournissez des détails sur votre vol, vos consignes et disponibilités..."
              class="w-full bg-[#F3F4F6] dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl px-4 py-3 text-xs sm:text-sm text-gray-800 dark:text-slate-100 outline-none focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-[#074C72]/20"
            ></textarea>
          </div>
        </div>
      </div>

      <!-- STEP 4: ADRESSES DÉPÔT ET RÉCUPÉRATION -->
      <div v-else-if="currentStep === 4" class="space-y-6">
        <h3 class="text-base font-extrabold text-[#053754] dark:text-sky-300 border-b border-gray-100 dark:border-slate-800 pb-2">4. {{ t('voyageur.createVoyage.step3') }}</h3>

        <div class="space-y-5">
          <!-- Adresse Dépôt Selector Card -->
          <div class="bg-slate-50 dark:bg-slate-800/70 p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-3">
            <div class="flex items-center justify-between flex-wrap gap-2">
              <h4 class="text-xs font-extrabold text-[#053754] dark:text-sky-300 flex items-center gap-1.5 uppercase tracking-wider">
                <span>📍</span> {{ t('voyageur.createVoyage.depositAddress') }}
              </h4>
              <button
                @click="showDepotModal = true"
                type="button"
                class="text-xs font-extrabold text-[#B50302] dark:text-rose-400 hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span>+ {{ t('voyageur.createVoyage.depositAddress') }}</span>
              </button>
            </div>

            <div class="space-y-2">
              <select
                v-model="form.adresse_depot_id"
                class="w-full bg-white dark:bg-slate-900 border border-gray-300 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-gray-800 dark:text-slate-100 font-bold outline-none focus:ring-2 focus:ring-[#074C72]/20"
              >
                <option value="" disabled class="dark:bg-slate-800">-- {{ t('voyageur.createVoyage.depositAddress') }} --</option>
                <option v-for="addr in adressesDepot" :key="addr.id" :value="addr.id" class="dark:bg-slate-800">
                  {{ addr.adresse }} ({{ addr.ville }}, {{ addr.pays }})
                </option>
              </select>
            </div>
          </div>

          <!-- Adresse Récupération Selector Card -->
          <div class="bg-slate-50 dark:bg-slate-800/70 p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-3">
            <div class="flex items-center justify-between flex-wrap gap-2">
              <h4 class="text-xs font-extrabold text-[#053754] dark:text-sky-300 flex items-center gap-1.5 uppercase tracking-wider">
                <span>📍</span> {{ t('voyageur.createVoyage.pickupAddress') }}
              </h4>
              <button
                @click="showRecupModal = true"
                type="button"
                class="text-xs font-extrabold text-[#B50302] dark:text-rose-400 hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span>+ {{ t('voyageur.createVoyage.pickupAddress') }}</span>
              </button>
            </div>

            <div class="space-y-2">
              <select
                v-model="form.adresse_recuperation_id"
                class="w-full bg-white dark:bg-slate-900 border border-gray-300 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-gray-800 dark:text-slate-100 font-bold outline-none focus:ring-2 focus:ring-[#074C72]/20"
              >
                <option value="" disabled class="dark:bg-slate-800">-- {{ t('voyageur.createVoyage.pickupAddress') }} --</option>
                <option v-for="addr in adressesRecuperation" :key="addr.id" :value="addr.id" class="dark:bg-slate-800">
                  {{ addr.adresse }} ({{ addr.ville }}, {{ addr.pays }})
                </option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <!-- STEP 5: CATÉGORIES ACCEPTÉES / REFUSÉES -->
      <div v-else-if="currentStep === 5" class="space-y-6">
        <h3 class="text-base font-extrabold text-[#053754] dark:text-sky-300 border-b border-gray-100 dark:border-slate-800 pb-2">5. {{ t('voyageur.createVoyage.step4') }}</h3>

        <!-- SECTION A: AUTORISÉES -->
        <div class="space-y-3">
          <label class="block text-xs font-extrabold text-emerald-800 dark:text-emerald-300">✅ {{ t('voyageur.createVoyage.acceptedItems') }}</label>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <div
              v-for="cat in allAutorisesList"
              :key="cat"
              @click="toggleAutorise(cat)"
              class="p-3 rounded-xl border text-xs font-bold flex items-center justify-between cursor-pointer transition-all"
              :class="form.objets_autorises.includes(cat) ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300' : 'bg-gray-50 dark:bg-slate-800 border-gray-200 dark:border-slate-700 text-gray-600 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-700'"
            >
              <span>{{ cat }}</span>
              <span v-if="form.objets_autorises.includes(cat)" class="text-emerald-600 dark:text-emerald-400 text-sm">✓</span>
            </div>
          </div>
        </div>

        <!-- SECTION B: INTERDITES / REFUSÉES -->
        <div class="space-y-3 pt-4 border-t border-gray-100 dark:border-slate-800">
          <label class="block text-xs font-extrabold text-red-800 dark:text-rose-300">🚫 {{ t('voyageur.createVoyage.forbiddenItems') }}</label>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <div
              v-for="cat in allInterditsList"
              :key="cat"
              @click="toggleInterdit(cat)"
              class="p-3 rounded-xl border text-xs font-bold flex items-center justify-between cursor-pointer transition-all"
              :class="form.objets_interdits.includes(cat) ? 'bg-red-50 dark:bg-rose-950/60 border-red-300 dark:border-rose-800 text-red-800 dark:text-rose-300' : 'bg-gray-50 dark:bg-slate-800 border-gray-200 dark:border-slate-700 text-gray-600 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-700'"
            >
              <span>{{ cat }}</span>
              <span v-if="form.objets_interdits.includes(cat)" class="text-red-600 dark:text-rose-400 text-sm">✕</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Navigation Buttons -->
      <div class="border-t border-gray-100 dark:border-slate-800 pt-4 flex items-center justify-between gap-3 flex-wrap">
        <button
          v-if="currentStep > 1"
          @click="prevStep"
          type="button"
          class="px-5 py-3 rounded-xl bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 text-gray-700 dark:text-slate-200 font-bold text-xs sm:text-sm transition-colors cursor-pointer"
        >
          {{ t('parcelDetail.prevBtn') }}
        </button>

        <div class="ml-auto flex items-center gap-2">
          <button
            v-if="currentStep < 5"
            @click="nextStep"
            type="button"
            class="bg-[#053754] dark:bg-sky-600 hover:bg-[#074C72] dark:hover:bg-sky-500 text-white font-extrabold text-xs sm:text-sm py-3.5 px-6 rounded-xl shadow-md transition-all cursor-pointer uppercase tracking-wider"
          >
            {{ t('parcelDetail.nextBtn') }}
          </button>

          <template v-else>
            <button
              @click="handleSaveVoyage('brouillon')"
              :disabled="isLoading"
              type="button"
              class="bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 text-gray-800 dark:text-slate-200 font-extrabold text-xs py-3.5 px-5 rounded-xl transition-all cursor-pointer uppercase tracking-wider"
            >
              {{ t('status.draft') }}
            </button>

            <button
              @click="handleSaveVoyage('publie')"
              :disabled="isLoading"
              type="button"
              class="bg-[#B50302] hover:bg-[#8B0000] text-white font-extrabold text-xs sm:text-sm py-3.5 px-6 rounded-xl shadow-lg transition-all cursor-pointer uppercase tracking-wider active:scale-[0.99]"
            >
              {{ t('voyageur.createVoyage.submitBtn') }}
            </button>
          </template>
        </div>
      </div>

    </div>

    <!-- MODAL: NOUVELLE ADRESSE DE DÉPÔT -->
    <div v-if="showDepotModal" class="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div class="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 w-full max-w-md rounded-3xl p-6 shadow-2xl space-y-4 font-sans">
        <div class="flex items-center justify-between border-b border-gray-100 dark:border-slate-800 pb-3">
          <h3 class="text-base font-bold text-[#053754] dark:text-sky-300 font-serif">Créer une adresse de dépôt</h3>
          <button @click="showDepotModal = false" class="text-gray-400 dark:text-slate-500 hover:text-gray-600 dark:hover:text-slate-300 font-bold cursor-pointer">✕</button>
        </div>

        <form @submit.prevent="submitNewDepotAddress" class="space-y-3 text-xs">
          <div>
            <label class="block font-bold text-gray-700 dark:text-slate-300 mb-1">Adresse complète *</label>
            <input v-model="newDepotForm.adresse" type="text" placeholder="ex: 15 Rue de Rivoli, Agence Relais Rahma" class="w-full bg-[#F3F4F6] dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-gray-800 dark:text-slate-100 outline-none" />
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block font-bold text-gray-700 dark:text-slate-300 mb-1">Ville *</label>
              <input v-model="newDepotForm.ville" type="text" placeholder="Dakar" class="w-full bg-[#F3F4F6] dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-gray-800 dark:text-slate-100 outline-none" />
            </div>
            <div>
              <label class="block font-bold text-gray-700 dark:text-slate-300 mb-1">Pays *</label>
              <input v-model="newDepotForm.pays" type="text" placeholder="Sénégal" class="w-full bg-[#F3F4F6] dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-gray-800 dark:text-slate-100 outline-none" />
            </div>
          </div>

          <div>
            <label class="block font-bold text-gray-700 dark:text-slate-300 mb-1">Horaire d'ouverture</label>
            <input v-model="newDepotForm.horaire_ouverture" type="text" placeholder="Du Lundi au Samedi de 08h30 à 19h00" class="w-full bg-[#F3F4F6] dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-gray-800 dark:text-slate-100 outline-none" />
          </div>

          <div>
            <label class="block font-bold text-gray-700 dark:text-slate-300 mb-1">Instructions de dépôt</label>
            <textarea v-model="newDepotForm.instructions" rows="2" placeholder="Consignes particulières pour le client..." class="w-full bg-[#F3F4F6] dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-gray-800 dark:text-slate-100 outline-none"></textarea>
          </div>

          <div class="pt-2 flex justify-end gap-2">
            <button type="button" @click="showDepotModal = false" class="px-4 py-2 text-gray-600 dark:text-slate-400 font-bold cursor-pointer">Annuler</button>
            <button type="submit" :disabled="isLoading" class="bg-[#053754] text-white font-bold px-5 py-2 rounded-xl cursor-pointer">Enregistrer</button>
          </div>
        </form>
      </div>
    </div>

    <!-- MODAL: NOUVELLE ADRESSE DE RÉCUPÉRATION -->
    <div v-if="showRecupModal" class="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div class="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 w-full max-w-md rounded-3xl p-6 shadow-2xl space-y-4 font-sans">
        <div class="flex items-center justify-between border-b border-gray-100 dark:border-slate-800 pb-3">
          <h3 class="text-base font-bold text-[#053754] dark:text-sky-300 font-serif">Créer une adresse de récupération</h3>
          <button @click="showRecupModal = false" class="text-gray-400 dark:text-slate-500 hover:text-gray-600 dark:hover:text-slate-300 font-bold cursor-pointer">✕</button>
        </div>

        <form @submit.prevent="submitNewRecupAddress" class="space-y-3 text-xs">
          <div>
            <label class="block font-bold text-gray-700 dark:text-slate-300 mb-1">Adresse complète *</label>
            <input v-model="newRecupForm.adresse" type="text" placeholder="ex: Agence Rahma Paris 10ème (Gare du Nord)" class="w-full bg-[#F3F4F6] dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-gray-800 dark:text-slate-100 outline-none" />
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block font-bold text-gray-700 dark:text-slate-300 mb-1">Ville *</label>
              <input v-model="newRecupForm.ville" type="text" placeholder="Paris" class="w-full bg-[#F3F4F6] dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-gray-800 dark:text-slate-100 outline-none" />
            </div>
            <div>
              <label class="block font-bold text-gray-700 dark:text-slate-300 mb-1">Pays *</label>
              <input v-model="newRecupForm.pays" type="text" placeholder="France" class="w-full bg-[#F3F4F6] dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-gray-800 dark:text-slate-100 outline-none" />
            </div>
          </div>

          <div>
            <label class="block font-bold text-gray-700 dark:text-slate-300 mb-1">Horaire d'ouverture</label>
            <input v-model="newRecupForm.horaire_ouverture" type="text" placeholder="Du Lundi au Samedi de 09h00 à 19h00" class="w-full bg-[#F3F4F6] dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-gray-800 dark:text-slate-100 outline-none" />
          </div>

          <div>
            <label class="block font-bold text-gray-700 dark:text-slate-300 mb-1">Instructions de récupération</label>
            <textarea v-model="newRecupForm.instructions" rows="2" placeholder="Consignes particulières pour le destinataire..." class="w-full bg-[#F3F4F6] dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-gray-800 dark:text-slate-100 outline-none"></textarea>
          </div>

          <div class="pt-2 flex justify-end gap-2">
            <button type="button" @click="showRecupModal = false" class="px-4 py-2 text-gray-600 dark:text-slate-400 font-bold cursor-pointer">Annuler</button>
            <button type="submit" :disabled="isLoading" class="bg-[#053754] text-white font-bold px-5 py-2 rounded-xl cursor-pointer">Enregistrer</button>
          </div>
        </form>
      </div>
    </div>

  </div>
</template>
