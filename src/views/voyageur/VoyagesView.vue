<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import Swal from 'sweetalert2'
import CitySelect from '@/components/client/CitySelect.vue'
import CountryFlag from '@/components/common/CountryFlag.vue'
import { fetchVoyages, createVoyage, updateVoyage, publierVoyage } from '@/services/voyageService'
import { fetchAdresseDepots, createAdresseDepot, fetchAdresseRecuperations, createAdresseRecuperation } from '@/services/adresseService'
import { fetchReservations } from '@/services/reservationService'
import { fetchMyEvaluations } from '@/services/evaluationService'
import { getCountryFlag } from '@/utils/flagHelper'

const router = useRouter()

// Toast helper
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

// Date Formatter: "12-sept.-2026 12:15" or relative days ("Aujourd'hui à 12:15", "Demain...", "Lundi...")
const formatVoyageDate = (dateStr) => {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  if (isNaN(d.getTime())) return dateStr

  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const targetDate = new Date(d.getFullYear(), d.getMonth(), d.getDate())
  const diffDays = Math.round((targetDate - today) / (1000 * 60 * 60 * 24))

  const hours = String(d.getHours()).padStart(2, '0')
  const minutes = String(d.getMinutes()).padStart(2, '0')
  const timeStr = `${hours}:${minutes}`

  if (diffDays === 0) {
    return `Aujourd'hui à ${timeStr}`
  } else if (diffDays === 1) {
    return `Demain à ${timeStr}`
  } else if (diffDays === 2) {
    return `Après-demain à ${timeStr}`
  } else if (diffDays > 2 && diffDays <= 7) {
    const daysFr = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi']
    return `${daysFr[d.getDay()]} à ${timeStr}`
  } else {
    const monthsFr = ['janv.', 'févr.', 'mars', 'avr.', 'mai', 'juin', 'juil.', 'sept.', 'oct.', 'nov.', 'déc.']
    const dayNum = String(d.getDate()).padStart(2, '0')
    const monthStr = monthsFr[d.getMonth()]
    const yearStr = d.getFullYear()
    return `${dayNum}-${monthStr}-${yearStr} ${timeStr}`
  }
}

// Filter Status State (Enum: tous, publie, brouillon, complet, en_cours, termine, annule)
const activeStatutFilter = ref('tous')
const statusOptions = [
  { value: 'tous', label: 'Tous' },
  { value: 'publie', label: 'Publiés' },
  { value: 'brouillon', label: 'Brouillons' },
  { value: 'complet', label: 'Complets' },
  { value: 'en_cours', label: 'En cours' },
  { value: 'termine', label: 'Terminés' },
  { value: 'annule', label: 'Annulés' }
]

// Voyages List Data State
const voyages = ref([])

const isLoading = ref(false)

const loadVoyages = async () => {
  try {
    const res = await fetchVoyages()
    if (res && res.data && res.data.length > 0) {
      voyages.value = res.data.map(v => ({
        id: v.id,
        routeFrom: v.ville_depart,
        countryFrom: v.pays_depart,
        flagFrom: getCountryFlag(v.ville_depart, v.pays_depart),
        routeTo: v.ville_destination,
        countryTo: v.pays_destination,
        flagTo: getCountryFlag(v.ville_destination, v.pays_destination),
        departureDate: v.date_depart,
        arrivalDate: v.date_arrivee,
        capaciteTotale: Number(v.capacite_totale) || 0,
        capaciteDispo: v.capacite_dispo !== undefined ? Number(v.capacite_dispo) : Number(v.capacite_totale || 0),
        prixKg: `${v.prix_kg} ${v.devise || 'F CFA'}`,
        reservationsCount: v.reservations ? v.reservations.length : 0,
        statut: v.statut,
        rawObject: v
      }))
    }
  } catch (err) {
    // Keep initial mock list
  }
}

const pendingDemandesCount = ref(0)
const voyageurRating = ref('4.9')
const voyageurReviewsCount = ref(0)

const loadPendingDemandes = async () => {
  try {
    const res = await fetchReservations()
    if (res && res.data) {
      const items = Array.isArray(res.data) ? res.data : (res.data.data || [])
      pendingDemandesCount.value = items.filter(r => r.statut === 'en_attente').length
    }
  } catch (err) {
    pendingDemandesCount.value = 0
  }
}

const loadEvaluations = async () => {
  try {
    const res = await fetchMyEvaluations()
    if (res) {
      const items = Array.isArray(res.data) ? res.data : (res.data?.data || (Array.isArray(res) ? res : []))
      voyageurReviewsCount.value = items.length
      if (items.length > 0) {
        const sum = items.reduce((acc, curr) => acc + (Number(curr.note) || 5), 0)
        voyageurRating.value = (sum / items.length).toFixed(1)
      } else {
        voyageurRating.value = '5.0'
      }
    }
  } catch (err) {
    voyageurRating.value = '4.9'
    voyageurReviewsCount.value = 0
  }
}

onMounted(async () => {
  await loadVoyages()
  await loadAddresses()
  await loadPendingDemandes()
  await loadEvaluations()
})

const searchQuery = ref('')

// Filtered Voyages List based on Status Filter and Search Query
const filteredVoyages = computed(() => {
  let list = voyages.value
  if (activeStatutFilter.value !== 'tous') {
    list = list.filter(v => v.statut === activeStatutFilter.value)
  }
  if (searchQuery.value.trim()) {
    const q = searchQuery.value.toLowerCase().trim()
    list = list.filter(v => 
      (v.routeFrom && v.routeFrom.toLowerCase().includes(q)) ||
      (v.routeTo && v.routeTo.toLowerCase().includes(q)) ||
      (v.countryFrom && v.countryFrom.toLowerCase().includes(q)) ||
      (v.countryTo && v.countryTo.toLowerCase().includes(q)) ||
      (v.statut && v.statut.toLowerCase().includes(q))
    )
  }
  return list
})

// Pagination logic: 10 items per page
const currentPage = ref(1)
const itemsPerPage = 10

const totalPages = computed(() => {
  return Math.ceil(filteredVoyages.value.length / itemsPerPage) || 1
})

const paginatedVoyages = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage
  return filteredVoyages.value.slice(start, start + itemsPerPage)
})

const nextPage = () => {
  if (currentPage.value < totalPages.value) currentPage.value++
}

const prevPage = () => {
  if (currentPage.value > 1) currentPage.value--
}

// -------------------------------------------------------------
// MULTI-STEP WIZARD MODAL STATE (CREATE AND UPDATE MODE)
// -------------------------------------------------------------
const showWizardModal = ref(false)
const isEditing = ref(false)
const editingVoyageId = ref(null)
const wizardStep = ref(1)

const form = reactive({
  adresse_depot_id: '',
  adresse_recuperation_id: '',
  pays_depart: 'Sénégal',
  ville_depart: 'Dakar',
  pays_destination: 'France',
  ville_destination: 'Paris',
  date_depart: '',
  date_arrivee: '',
  capacite_totale: 25,
  prix_kg: 8500,
  prix_objet: 15000,
  devise: 'XOF',
  description: '',
  objets_autorises: ['Vêtements & tissus', 'Électronique & téléphones', 'Documents & papiers'],
  objets_interdits: ['Aliments périssables', 'Liquides non scellés > 100ml', 'Substances inflammables'],
  statut: 'brouillon'
})

const adressesDepot = ref([])
const adressesRecuperation = ref([])

const loadAddresses = async () => {
  try {
    const resDepot = await fetchAdresseDepots()
    if (resDepot && resDepot.data) adressesDepot.value = resDepot.data
  } catch (err) {
    adressesDepot.value = [
      { id: '01a0828c-8880-7190-be0a-5e3294225ecd', adresse: '15 Rue de Rivoli, Agence Relais Rahma', ville: 'Paris', pays: 'France' },
      { id: '01a0828c-8880-7190-be0a-5e3294225ece', adresse: 'Point Relais Rahma - Parcelles Assainies', ville: 'Dakar', pays: 'Sénégal' }
    ]
  }

  try {
    const resRecup = await fetchAdresseRecuperations()
    if (resRecup && resRecup.data) adressesRecuperation.value = resRecup.data
  } catch (err) {
    adressesRecuperation.value = [
      { id: '01a0828c-888a-724f-a324-ce1f1cdf2a6b', adresse: 'Agence Rahma Paris 10ème (Gare du Nord)', ville: 'Paris', pays: 'France' },
      { id: '01a0828c-888a-724f-a324-ce1f1cdf2a6c', adresse: 'Aéroport Blaise Diagne (Zone Arrivée)', ville: 'Dakar', pays: 'Sénégal' }
    ]
  }

  if (adressesDepot.value.length > 0 && !form.adresse_depot_id) {
    form.adresse_depot_id = adressesDepot.value[0].id
  }
  if (adressesRecuperation.value.length > 0 && !form.adresse_recuperation_id) {
    form.adresse_recuperation_id = adressesRecuperation.value[0].id
  }
}

// Open Wizard in CREATE Mode
const openCreateModal = () => {
  isEditing.value = false
  editingVoyageId.value = null
  wizardStep.value = 1
  form.adresse_depot_id = adressesDepot.value[0]?.id || ''
  form.adresse_recuperation_id = adressesRecuperation.value[0]?.id || ''
  form.pays_depart = 'Sénégal'
  form.ville_depart = 'Dakar'
  form.pays_destination = 'France'
  form.ville_destination = 'Paris'
  form.date_depart = ''
  form.date_arrivee = ''
  form.capacite_totale = 25
  form.prix_kg = 8500
  form.prix_objet = 15000
  form.devise = 'XOF'
  form.description = 'Voyage régulier. Bagages sécurisés.'
  form.objets_autorises = ['Vêtements & tissus', 'Électronique & téléphones', 'Documents & papiers']
  form.objets_interdits = ['Aliments périssables', 'Liquides non scellés > 100ml', 'Substances inflammables']
  form.statut = 'brouillon'
  showWizardModal.value = true
}

// Open Wizard in EDIT Mode with prefilled data
const openEditModal = (voyage) => {
  isEditing.value = true
  editingVoyageId.value = voyage.id
  wizardStep.value = 1

  const raw = voyage.rawObject || {}
  form.adresse_depot_id = raw.adresse_depot_id || adressesDepot.value[0]?.id || ''
  form.adresse_recuperation_id = raw.adresse_recuperation_id || adressesRecuperation.value[0]?.id || ''
  form.pays_depart = raw.pays_depart || voyage.countryFrom || 'Sénégal'
  form.ville_depart = raw.ville_depart || voyage.routeFrom || 'Dakar'
  form.pays_destination = raw.pays_destination || voyage.countryTo || 'France'
  form.ville_destination = raw.ville_destination || voyage.routeTo || 'Paris'

  // Format ISO / SQL date for datetime-local
  const parseDt = (dStr) => dStr ? dStr.replace(' ', 'T').slice(0, 16) : ''
  form.date_depart = parseDt(raw.date_depart || voyage.departureDate)
  form.date_arrivee = parseDt(raw.date_arrivee || voyage.arrivalDate)

  form.capacite_totale = raw.capacite_totale || voyage.capaciteTotale || 20
  form.prix_kg = raw.prix_kg || 8500
  form.prix_objet = raw.prix_objet || 15000
  form.devise = raw.devise || 'XOF'
  form.description = raw.description || ''
  form.objets_autorises = raw.objets_autorises ? [...raw.objets_autorises] : ['Vêtements & tissus', 'Électronique & téléphones', 'Documents & papiers']
  form.objets_interdits = raw.objets_interdits ? [...raw.objets_interdits] : ['Aliments périssables', 'Liquides non scellés > 100ml']
  
  form.objets_autorises.forEach(item => {
    if (!presetAutorises.value.includes(item)) presetAutorises.value.push(item)
  })
  form.objets_interdits.forEach(item => {
    if (!presetInterdits.value.includes(item)) presetInterdits.value.push(item)
  })

  form.statut = raw.statut || voyage.statut || 'brouillon'

  showWizardModal.value = true
}

// Address Creation Modals with CitySelect & Auto-fill Country
const showDepotAddressModal = ref(false)
const showRecupAddressModal = ref(false)

const newDepotForm = reactive({
  adresse: '',
  ville: 'Dakar',
  pays: 'Sénégal',
  horaire_ouverture: '',
  instructions: ''
})

const newRecupForm = reactive({
  adresse: '',
  ville: 'Paris',
  pays: 'France',
  horaire_ouverture: '',
  instructions: ''
})

// CitySelect @change handlers for auto-filling country
const onVoyageDepartCitySelect = (cityObj) => {
  form.ville_depart = cityObj.city
  if (cityObj.country) {
    form.pays_depart = cityObj.country
  }
}

const onVoyageDestinationCitySelect = (cityObj) => {
  form.ville_destination = cityObj.city
  if (cityObj.country) {
    form.pays_destination = cityObj.country
  }
}

const onDepotCitySelect = (cityObj) => {
  newDepotForm.ville = cityObj.city
  newDepotForm.pays = cityObj.country || 'Sénégal'
}

const onRecupCitySelect = (cityObj) => {
  newRecupForm.ville = cityObj.city
  newRecupForm.pays = cityObj.country || 'France'
}

const submitNewDepotAddress = async () => {
  if (!newDepotForm.adresse.trim()) {
    showToast('warning', 'Veuillez saisir une adresse complète.')
    return
  }
  isLoading.value = true
  try {
    const res = await createAdresseDepot({ ...newDepotForm })
    showToast('success', 'Adresse de dépôt créée avec succès !')
    showDepotAddressModal.value = false
    await loadAddresses()
    if (res && res.data && res.data.id) {
      form.adresse_depot_id = res.data.id
    }
  } catch (err) {
    showToast('error', 'Erreur lors de la création de l\'adresse.')
  } finally {
    isLoading.value = false
  }
}

const submitNewRecupAddress = async () => {
  if (!newRecupForm.adresse.trim()) {
    showToast('warning', 'Veuillez saisir une adresse complète.')
    return
  }
  isLoading.value = true
  try {
    const res = await createAdresseRecuperation({ ...newRecupForm })
    showToast('success', 'Adresse de récupération créée avec succès !')
    showRecupAddressModal.value = false
    await loadAddresses()
    if (res && res.data && res.data.id) {
      form.adresse_recuperation_id = res.data.id
    }
  } catch (err) {
    showToast('error', 'Erreur lors de la création de l\'adresse.')
  } finally {
    isLoading.value = false
  }
}

// Category custom inputs
const customAutorise = ref('')
const customInterdit = ref('')

const presetAutorises = ref([
  'Vêtements & tissus',
  'Électronique & téléphones',
  'Documents & papiers',
  'Cosmétiques & soins',
  'Médicaments sur ordonnance',
  'Bijoux & valeurs',
  'Nourriture sèche & épices scellées'
])

const presetInterdits = ref([
  'Aliments périssables',
  'Liquides non scellés > 100ml',
  'Produits inflammables & aérosols',
  'Substances illégales',
  'Objets tranchants'
])

const allAutorisesList = computed(() => {
  return Array.from(new Set([...presetAutorises.value, ...form.objets_autorises]))
})

const allInterditsList = computed(() => {
  return Array.from(new Set([...presetInterdits.value, ...form.objets_interdits]))
})

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
    if (!presetAutorises.value.includes(val)) {
      presetAutorises.value.push(val)
    }
    if (!form.objets_autorises.includes(val)) {
      form.objets_autorises.push(val)
    }
    customAutorise.value = ''
  }
}

const addCustomInterdit = () => {
  if (customInterdit.value.trim()) {
    const val = customInterdit.value.trim()
    if (!presetInterdits.value.includes(val)) {
      presetInterdits.value.push(val)
    }
    if (!form.objets_interdits.includes(val)) {
      form.objets_interdits.push(val)
    }
    customInterdit.value = ''
  }
}

// Wizard navigation and validation
const validateWizardStep = (step) => {
  if (step === 1) {
    if (!form.ville_depart || !form.ville_destination) {
      showToast('warning', 'Veuillez sélectionner les villes de départ et de destination.')
      return false
    }
  } else if (step === 2) {
    if (!form.date_depart || !form.date_arrivee) {
      showToast('warning', 'Veuillez renseigner les dates de départ et d\'arrivée.')
      return false
    }
    if (new Date(form.date_arrivee) <= new Date(form.date_depart)) {
      showToast('warning', 'La date d\'arrivée doit être strictement supérieure à la date de départ.')
      return false
    }
  } else if (step === 3) {
    if (!form.capacite_totale || form.capacite_totale <= 0) {
      showToast('warning', 'La capacité totale doit être supérieure à 0 Kg.')
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

const nextWizardStep = () => {
  if (!validateWizardStep(wizardStep.value)) return
  if (wizardStep.value < 5) wizardStep.value++
}

const prevWizardStep = () => {
  if (wizardStep.value > 1) wizardStep.value--
}

const formatDateForApi = (dateStr) => {
  if (!dateStr) return null
  return dateStr.replace('T', ' ') + ':00'
}

// Submit Wizard (Create or Update)
const handleSaveVoyage = async (targetStatut) => {
  if (!validateWizardStep(1) || !validateWizardStep(2) || !validateWizardStep(3) || !validateWizardStep(4)) return

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
    if (isEditing.value && editingVoyageId.value && !editingVoyageId.value.startsWith('voy-')) {
      await updateVoyage(editingVoyageId.value, payload)
      showToast('success', 'Voyage mis à jour avec succès !')
    } else {
      await createVoyage(payload)
      showToast('success', targetStatut === 'publie' ? 'Voyage publié avec succès !' : 'Voyage enregistré en brouillon !')
    }
    showWizardModal.value = false
    await loadVoyages()
  } catch (err) {
    showToast('error', err?.message || 'Erreur lors de l\'enregistrement du voyage.')
  } finally {
    isLoading.value = false
  }
}

import { encodeId } from '@/utils/idMasker'

const goToVoyageDetail = (id) => {
  const masked = encodeId(id)
  router.push(`/voyageur/voyages/${masked}`)
}
const goToRevenus = () => router.push('/voyageur/revenus')
const goToDemandes = () => router.push('/voyageur/demandes')
</script>

<template>
  <div class="space-y-6 pb-20 font-sans">
    <!-- Header Title & Action -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h1 class="text-xl sm:text-2xl font-serif font-bold text-principal-dark">Mes voyages GP</h1>
        <p class="text-xs sm:text-sm text-gray-500">Publiez vos trajets et gérez vos capacités de bagages</p>
      </div>

      <button
        @click="openCreateModal"
        type="button"
        class="bg-[#B50302] hover:bg-[#8B0000] text-white font-extrabold text-xs sm:text-sm py-3 px-5 rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer uppercase tracking-wider shrink-0 active:scale-[0.99]"
      >
        <span>➕ PUBLIER UN VOYAGE</span>
      </button>
    </div>

    <!-- Quick Stats Cards Banner -->
    <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
      <div @click="goToRevenus" class="bg-white rounded-2xl p-4 border border-gray-200 shadow-2xs hover:border-[#074C72] transition-all cursor-pointer space-y-1">
        <span class="text-[11px] font-bold text-gray-400 block uppercase">Revenus générés</span>
        <div class="text-base sm:text-lg font-black text-[#053754]">350 000 F CFA</div>
        <span class="text-[10px] text-emerald-600 font-bold flex items-center gap-0.5">↗ 3 réservations payées</span>
      </div>

      <div @click="goToDemandes" class="bg-white rounded-2xl p-4 border border-amber-200 bg-amber-50/40 shadow-2xs hover:border-amber-400 transition-all cursor-pointer space-y-1">
        <span class="text-[11px] font-bold text-amber-700 block uppercase">Demandes en attente</span>
        <div class="text-base sm:text-lg font-black text-amber-900 font-serif">
          {{ pendingDemandesCount }} {{ pendingDemandesCount > 1 ? 'demandes' : 'demande' }}
        </div>
        <span class="text-[10px] text-amber-600 font-bold underline">Répondre aux clients ➔</span>
      </div>

      <div @click="router.push('/voyageur/evaluations')" class="bg-white rounded-2xl p-4 border border-gray-200 shadow-2xs hover:border-[#053754] transition-all cursor-pointer space-y-1 group">
        <span class="text-[11px] font-bold text-gray-400 block uppercase group-hover:text-[#053754]">Note Voyageur</span>
        <div class="text-base sm:text-lg font-black text-[#053754] flex items-center gap-1.5">
          <span>⭐ {{ voyageurRating }}</span>
          <span class="text-xs text-gray-400 font-medium">({{ voyageurReviewsCount }} {{ voyageurReviewsCount > 1 ? 'avis' : 'avis' }})</span>
        </div>
        <span class="text-[10px] text-sky-700 font-bold underline block">Voir mes évaluations ➔</span>
      </div>
    </div>

    <!-- Search Bar & Filter Bar -->
    <div class="space-y-3 bg-white p-4 rounded-2xl border border-gray-200 shadow-2xs">
      <div class="relative w-full">
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Rechercher un voyage par ville, pays..."
          class="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium outline-none focus:border-[#074C72] focus:ring-2 focus:ring-[#074C72]/20"
        />
        <span class="absolute left-3.5 top-2.5 text-gray-400 text-sm">🔍</span>
      </div>

      <div class="space-y-1.5">
        <label class="block text-[10px] font-extrabold uppercase tracking-wider text-gray-400">Filtrer par statut de voyage :</label>
        <div class="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
          <button
            v-for="opt in statusOptions"
            :key="opt.value"
            @click="activeStatutFilter = opt.value; currentPage = 1"
            class="px-3.5 py-1.5 rounded-full text-xs font-extrabold transition-all cursor-pointer whitespace-nowrap shrink-0 border"
            :class="[
              activeStatutFilter === opt.value
                ? 'bg-[#053754] text-white border-[#053754] shadow-xs'
                : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
            ]"
          >
            {{ opt.label }}
          </button>
        </div>
      </div>
    </div>

    <!-- Voyages Grid (2 Cards per line on Desktop: grid-cols-1 lg:grid-cols-2) -->
    <div v-if="paginatedVoyages.length > 0" class="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <div
        v-for="voyage in paginatedVoyages"
        :key="voyage.id"
        class="bg-white rounded-3xl p-5 border border-gray-200 shadow-sm space-y-4 hover:border-sky-300 transition-all flex flex-col justify-between"
      >
        <div class="space-y-4">
          <!-- Top Row: Route Flags + Status Badge -->
          <div class="flex items-center justify-between gap-2">
            <div class="flex items-center gap-2 font-black text-[#053754] text-sm sm:text-base">
              <div class="flex items-center gap-1.5">
                <CountryFlag :city="voyage.routeFrom" :country="voyage.countryFrom" size="w-5 h-3.5" />
                <span>{{ voyage.routeFrom }}</span>
              </div>
              <span class="text-red-500 text-xs">➔</span>
              <div class="flex items-center gap-1.5">
                <CountryFlag :city="voyage.routeTo" :country="voyage.countryTo" size="w-5 h-3.5" />
                <span>{{ voyage.routeTo }}</span>
              </div>
            </div>

            <span
              class="text-[10px] font-extrabold px-3 py-0.5 rounded-full uppercase border shrink-0"
              :class="{
                'bg-emerald-50 text-emerald-800 border-emerald-200': voyage.statut === 'publie',
                'bg-amber-50 text-amber-800 border-amber-200': voyage.statut === 'brouillon',
                'bg-purple-50 text-purple-800 border-purple-200': voyage.statut === 'complet',
                'bg-sky-50 text-sky-800 border-sky-200': voyage.statut === 'en_cours',
                'bg-slate-100 text-slate-700 border-slate-200': voyage.statut === 'termine',
                'bg-red-50 text-red-800 border-red-200': voyage.statut === 'annule'
              }"
            >
              {{ voyage.statut }}
            </span>
          </div>

          <!-- Departure & Arrival Dates with Smart Date Formatter -->
          <div class="bg-slate-50 p-3 rounded-2xl border border-slate-100 flex items-center justify-between text-xs">
            <div>
              <span class="text-gray-400 block text-[10px] uppercase font-bold">Départ</span>
              <span class="font-bold text-gray-900">{{ formatVoyageDate(voyage.departureDate) }}</span>
            </div>
            <div class="text-right">
              <span class="text-gray-400 block text-[10px] uppercase font-bold">Tarif au Kg</span>
              <span class="font-extrabold text-[#B50302] text-sm">{{ voyage.prixKg }}</span>
            </div>
          </div>

          <!-- Capacity Bar (Fully Dynamic) -->
          <div class="space-y-1.5 bg-gray-50 p-3 rounded-2xl border border-gray-100">
            <div class="flex justify-between text-[11px] font-bold">
              <span class="text-gray-700 flex items-center gap-1">
                <span>⚖️</span>
                <span>Capacité disponible :</span>
              </span>
              <span :class="[voyage.capaciteDispo === 0 ? 'text-red-600 font-black' : 'text-[#053754] font-extrabold']">
                {{ voyage.capaciteDispo }} Kg / {{ voyage.capaciteTotale }} Kg
              </span>
            </div>
            <div class="w-full bg-gray-200 h-2.5 rounded-full overflow-hidden">
              <div
                class="h-full rounded-full transition-all duration-300"
                :class="[
                  (voyage.capaciteTotale > 0 ? ((voyage.capaciteTotale - voyage.capaciteDispo) / voyage.capaciteTotale) * 100 : 0) >= 90
                    ? 'bg-red-600'
                    : (voyage.capaciteTotale > 0 ? ((voyage.capaciteTotale - voyage.capaciteDispo) / voyage.capaciteTotale) * 100 : 0) >= 60
                    ? 'bg-amber-500'
                    : 'bg-[#053754]'
                ]"
                :style="{ width: `${voyage.capaciteTotale > 0 ? Math.min(100, Math.max(0, Math.round(((voyage.capaciteTotale - voyage.capaciteDispo) / voyage.capaciteTotale) * 100))) : 0}%` }"
              ></div>
            </div>
            <div class="flex justify-between text-[10px] text-gray-400 font-medium">
              <span>{{ Math.max(0, voyage.capaciteTotale - voyage.capaciteDispo) }} Kg réservés</span>
              <span>{{ voyage.capaciteTotale > 0 ? Math.round(((voyage.capaciteTotale - voyage.capaciteDispo) / voyage.capaciteTotale) * 100) : 0 }}% réservé</span>
            </div>
          </div>
        </div>

        <!-- Action Row: Éditer opens the multi-step Wizard Modal in edit mode! -->
        <div class="pt-3 border-t border-gray-100 flex items-center justify-between gap-2">
          <button
            v-if="voyage.statut !== 'publie'"
            @click="openEditModal(voyage)"
            type="button"
            class="px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold text-xs transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <span>✏️ Éditer</span>
          </button>
          <div v-else></div>

          <button
            @click="goToVoyageDetail(voyage.id)"
            type="button"
            class="px-4 py-2 rounded-xl bg-[#053754] hover:bg-[#074C72] text-white font-extrabold text-xs transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <span>👁️ Voir détails</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Empty State if no voyages match filter -->
    <div v-else class="bg-white rounded-3xl p-8 text-center border border-gray-200 space-y-3">
      <div class="w-12 h-12 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center mx-auto text-xl font-bold">✈️</div>
      <h3 class="text-base font-bold text-[#053754]">Aucun voyage trouvé</h3>
      <p class="text-xs text-gray-500 max-w-sm mx-auto">Aucun voyage ne correspond au statut sélectionné.</p>
    </div>

    <!-- Pagination Controls (10 items per page) -->
    <div v-if="totalPages > 1" class="flex items-center justify-between pt-4 border-t border-gray-200 text-xs">
      <button
        @click="prevPage"
        :disabled="currentPage === 1"
        class="px-4 py-2 rounded-xl bg-white border border-gray-200 font-bold text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
      >
        ◄ Précédent
      </button>

      <span class="font-extrabold text-[#053754]">
        Page {{ currentPage }} sur {{ totalPages }}
      </span>

      <button
        @click="nextPage"
        :disabled="currentPage === totalPages"
        class="px-4 py-2 rounded-xl bg-white border border-gray-200 font-bold text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
      >
        Suivant ►
      </button>
    </div>

    <!-- ========================================================================= -->
    <!-- MULTI-STEP WIZARD MODAL (CREATION AND UPDATE MODE) -->
    <!-- ========================================================================= -->
    <div v-if="showWizardModal" class="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div class="bg-white w-full max-w-2xl rounded-3xl p-6 sm:p-7 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto font-sans">
        
        <!-- Modal Header -->
        <div class="flex items-center justify-between border-b border-gray-100 pb-3">
          <div>
            <h3 class="text-lg font-bold text-[#053754] font-serif">
              {{ isEditing ? 'Modifier le voyage' : 'Publier un nouveau voyage' }}
            </h3>
            <p class="text-xs text-gray-500">Étape {{ wizardStep }} sur 5</p>
          </div>
          <button @click="showWizardModal = false" class="text-gray-400 hover:text-gray-600 p-1 font-bold text-lg">✕</button>
        </div>

        <!-- Wizard Progress Bar -->
        <div class="w-full bg-gray-100 h-2 rounded-full overflow-hidden flex">
          <div
            class="bg-[#B50302] h-full transition-all duration-300 rounded-full"
            :style="{ width: `${(wizardStep / 5) * 100}%` }"
          ></div>
        </div>

        <!-- STEP 1: TRAJET -->
        <div v-if="wizardStep === 1" class="space-y-4">
          <h4 class="text-sm font-extrabold text-[#053754]">1. Trajet du voyage</h4>
          <div class="space-y-3">
            <div>
              <label class="block text-xs font-bold text-gray-700 mb-1">Ville de Départ</label>
              <CitySelect v-model="form.ville_depart" @change="onVoyageDepartCitySelect" />
            </div>
            <div>
              <label class="block text-xs font-bold text-gray-700 mb-1">Ville de Destination</label>
              <CitySelect v-model="form.ville_destination" @change="onVoyageDestinationCitySelect" />
            </div>
          </div>
        </div>

        <!-- STEP 2: DATES -->
        <div v-else-if="wizardStep === 2" class="space-y-4">
          <h4 class="text-sm font-extrabold text-[#053754]">2. Dates et Heures du vol</h4>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label class="block text-xs font-bold text-gray-700 mb-1">Date et heure de départ</label>
              <input v-model="form.date_depart" type="datetime-local" class="w-full bg-[#F3F4F6] border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs text-gray-800 outline-none" />
            </div>
            <div>
              <label class="block text-xs font-bold text-gray-700 mb-1">Date et heure d'arrivée</label>
              <input v-model="form.date_arrivee" type="datetime-local" class="w-full bg-[#F3F4F6] border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs text-gray-800 outline-none" />
            </div>
          </div>
        </div>

        <!-- STEP 3: CAPACITÉ & TARIFS -->
        <div v-else-if="wizardStep === 3" class="space-y-4">
          <h4 class="text-sm font-extrabold text-[#053754]">3. Capacité et Tarification</h4>
          <div class="space-y-3">
            <div>
              <label class="block text-xs font-bold text-gray-700 mb-1">Capacité disponible (Kg)</label>
              <input v-model.number="form.capacite_totale" type="number" placeholder="ex: 25" class="w-full bg-[#F3F4F6] border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs text-gray-800 outline-none" />
            </div>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label class="block text-xs font-bold text-gray-700 mb-1">Prix au Kg ({{ form.devise }})</label>
                <input v-model.number="form.prix_kg" type="number" placeholder="ex: 8500" class="w-full bg-[#F3F4F6] border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs text-gray-800 outline-none" />
              </div>
              <div>
                <label class="block text-xs font-bold text-gray-700 mb-1">Prix par objet spécifique</label>
                <input v-model.number="form.prix_objet" type="number" placeholder="ex: 15000" class="w-full bg-[#F3F4F6] border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs text-gray-800 outline-none" />
              </div>
            </div>
            <div>
              <label class="block text-xs font-bold text-gray-700 mb-1">Description / Consignes</label>
              <textarea v-model="form.description" rows="2" placeholder="Précisions sur votre vol ou vos bagages..." class="w-full bg-[#F3F4F6] border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs text-gray-800 outline-none"></textarea>
            </div>
          </div>
        </div>

        <!-- STEP 4: ADRESSES DÉPÔT ET RÉCUPÉRATION WITH CITYSELECT AUTOFILL -->
        <div v-else-if="wizardStep === 4" class="space-y-4">
          <h4 class="text-sm font-extrabold text-[#053754]">4. Lieux de Dépôt et Récupération</h4>
          
          <div class="space-y-4">
            <!-- Depot Address Select Card -->
            <div class="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
              <div class="flex items-center justify-between">
                <label class="text-xs font-bold text-gray-700">Point de Dépôt (Départ)</label>
                <button @click="showDepotAddressModal = true" type="button" class="text-xs font-bold text-[#B50302] hover:underline">+ Créer une adresse</button>
              </div>
              <select v-model="form.adresse_depot_id" class="w-full bg-white border border-gray-300 rounded-xl px-3.5 py-2.5 text-xs text-gray-800 font-bold outline-none">
                <option value="" disabled>-- Sélectionner une adresse de dépôt --</option>
                <option v-for="a in adressesDepot" :key="a.id" :value="a.id">{{ a.adresse }} ({{ a.ville }}, {{ a.pays }})</option>
              </select>
            </div>

            <!-- Recup Address Select Card -->
            <div class="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
              <div class="flex items-center justify-between">
                <label class="text-xs font-bold text-gray-700">Point de Retrait (Destination)</label>
                <button @click="showRecupAddressModal = true" type="button" class="text-xs font-bold text-[#B50302] hover:underline">+ Créer une adresse</button>
              </div>
              <select v-model="form.adresse_recuperation_id" class="w-full bg-white border border-gray-300 rounded-xl px-3.5 py-2.5 text-xs text-gray-800 font-bold outline-none">
                <option value="" disabled>-- Sélectionner une adresse de récupération --</option>
                <option v-for="a in adressesRecuperation" :key="a.id" :value="a.id">{{ a.adresse }} ({{ a.ville }}, {{ a.pays }})</option>
              </select>
            </div>
          </div>
        </div>

        <!-- STEP 5: OBJECTS LIST JSON -->
        <div v-if="wizardStep === 5" class="space-y-4">
          <h4 class="text-sm font-extrabold text-[#053754]">5. Catégories d'objets autorisées & interdites</h4>
          
          <!-- Accepted -->
          <div class="space-y-2">
            <label class="block text-xs font-bold text-emerald-800">✅ Objets Autorisés</label>
            <div class="grid grid-cols-2 gap-2">
              <div
                v-for="cat in allAutorisesList" :key="cat"
                @click="toggleAutorise(cat)"
                class="p-2.5 rounded-xl border text-xs font-bold flex items-center justify-between cursor-pointer transition-all"
                :class="form.objets_autorises.includes(cat) ? 'bg-emerald-50 border-emerald-300 text-emerald-800' : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'"
              >
                <span>{{ cat }}</span>
                <span v-if="form.objets_autorises.includes(cat)" class="text-emerald-600 font-bold">✓</span>
              </div>
            </div>
            <div class="flex gap-2 pt-1">
              <input v-model="customAutorise" type="text" placeholder="Autre objet autorisé (ex: Épices scellées)" class="flex-1 bg-[#F3F4F6] border border-gray-200 rounded-xl px-3 py-2 text-xs outline-none" @keyup.enter="addCustomAutorise" />
              <button @click="addCustomAutorise" type="button" class="bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs px-3.5 py-2 rounded-xl cursor-pointer shrink-0">+ Ajouter</button>
            </div>
          </div>

          <!-- Refused -->
          <div class="space-y-2 pt-2 border-t border-gray-100">
            <label class="block text-xs font-bold text-red-800">🚫 Objets Interdits</label>
            <div class="grid grid-cols-2 gap-2">
              <div
                v-for="cat in allInterditsList" :key="cat"
                @click="toggleInterdit(cat)"
                class="p-2.5 rounded-xl border text-xs font-bold flex items-center justify-between cursor-pointer transition-all"
                :class="form.objets_interdits.includes(cat) ? 'bg-red-50 border-red-300 text-red-800' : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'"
              >
                <span>{{ cat }}</span>
                <span v-if="form.objets_interdits.includes(cat)" class="text-red-600 font-bold">✕</span>
              </div>
            </div>
            <div class="flex gap-2 pt-1">
              <input v-model="customInterdit" type="text" placeholder="Autre objet interdit (ex: Produits corrosifs)" class="flex-1 bg-[#F3F4F6] border border-gray-200 rounded-xl px-3 py-2 text-xs outline-none" @keyup.enter="addCustomInterdit" />
              <button @click="addCustomInterdit" type="button" class="bg-[#B50302] hover:bg-[#8B0000] text-white font-bold text-xs px-3.5 py-2 rounded-xl cursor-pointer shrink-0">+ Ajouter</button>
            </div>
          </div>
        </div>

        <!-- Wizard Navigation Buttons -->
        <div class="pt-3 border-t border-gray-100 flex items-center justify-between gap-3">
          <button v-if="wizardStep > 1" @click="prevWizardStep" type="button" class="px-4 py-2.5 rounded-xl bg-gray-100 font-bold text-xs text-gray-700">Précédent</button>
          
          <div class="ml-auto flex items-center gap-2">
            <button v-if="wizardStep < 5" @click="nextWizardStep" type="button" class="bg-[#053754] text-white font-bold text-xs px-5 py-2.5 rounded-xl">Suivant</button>
            <template v-else>
              <button @click="handleSaveVoyage('brouillon')" :disabled="isLoading" type="button" class="bg-gray-100 text-gray-800 font-bold text-xs px-4 py-2.5 rounded-xl">Brouillon</button>
              <button @click="handleSaveVoyage('publie')" :disabled="isLoading" type="button" class="bg-[#B50302] text-white font-extrabold text-xs px-5 py-2.5 rounded-xl">
                {{ isEditing ? 'ENREGISTRER' : 'PUBLIER' }}
              </button>
            </template>
          </div>
        </div>

      </div>
    </div>

    <!-- MODAL CREATION ADRESSE DEPOT (WITH CITYSELECT & AUTOFILL COUNTRY) -->
    <div v-if="showDepotAddressModal" class="fixed inset-0 z-[60] bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div class="bg-white w-full max-w-md rounded-3xl p-6 shadow-2xl space-y-4 font-sans">
        <div class="flex items-center justify-between border-b border-gray-100 pb-3">
          <h3 class="text-base font-bold text-[#053754] font-serif">Nouvelle adresse de dépôt</h3>
          <button @click="showDepotAddressModal = false" class="text-gray-400 font-bold">✕</button>
        </div>

        <form @submit.prevent="submitNewDepotAddress" class="space-y-3 text-xs">
          <div>
            <label class="block font-bold text-gray-700 mb-1">Ville *</label>
            <CitySelect v-model="newDepotForm.ville" @change="onDepotCitySelect" />
          </div>

          <div>
            <label class="block font-bold text-gray-700 mb-1">Pays (Rempli automatiquement)</label>
            <input v-model="newDepotForm.pays" type="text" placeholder="ex: Sénégal" class="w-full bg-[#F3F4F6] border border-gray-200 rounded-xl px-3.5 py-2.5 font-bold outline-none" />
          </div>

          <div>
            <label class="block font-bold text-gray-700 mb-1">Adresse complète *</label>
            <input v-model="newDepotForm.adresse" type="text" placeholder="ex: 15 Rue de Rivoli, Agence Relais Rahma" class="w-full bg-[#F3F4F6] border border-gray-200 rounded-xl px-3.5 py-2.5 outline-none" />
          </div>

          <div>
            <label class="block font-bold text-gray-700 mb-1">Horaire d'ouverture</label>
            <input v-model="newDepotForm.horaire_ouverture" type="text" placeholder="ex: Du Lundi au Samedi de 08h30 à 19h00" class="w-full bg-[#F3F4F6] border border-gray-200 rounded-xl px-3.5 py-2.5 outline-none" />
          </div>

          <div>
            <label class="block font-bold text-gray-700 mb-1">Instructions de dépôt</label>
            <textarea v-model="newDepotForm.instructions" rows="2" placeholder="ex: Remettre le colis au comptoir 2..." class="w-full bg-[#F3F4F6] border border-gray-200 rounded-xl px-3.5 py-2.5 outline-none"></textarea>
          </div>

          <div class="pt-2 flex justify-end gap-2">
            <button type="button" @click="showDepotAddressModal = false" class="px-4 py-2 text-gray-600 font-bold">Annuler</button>
            <button type="submit" :disabled="isLoading" class="bg-[#053754] text-white font-bold px-5 py-2 rounded-xl">Enregistrer</button>
          </div>
        </form>
      </div>
    </div>

    <!-- MODAL CREATION ADRESSE RECUPERATION (WITH CITYSELECT & AUTOFILL COUNTRY) -->
    <div v-if="showRecupAddressModal" class="fixed inset-0 z-[60] bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div class="bg-white w-full max-w-md rounded-3xl p-6 shadow-2xl space-y-4 font-sans">
        <div class="flex items-center justify-between border-b border-gray-100 pb-3">
          <h3 class="text-base font-bold text-[#053754] font-serif">Nouvelle adresse de récupération</h3>
          <button @click="showRecupAddressModal = false" class="text-gray-400 font-bold">✕</button>
        </div>

        <form @submit.prevent="submitNewRecupAddress" class="space-y-3 text-xs">
          <div>
            <label class="block font-bold text-gray-700 mb-1">Ville *</label>
            <CitySelect v-model="newRecupForm.ville" @change="onRecupCitySelect" />
          </div>

          <div>
            <label class="block font-bold text-gray-700 mb-1">Pays (Rempli automatiquement)</label>
            <input v-model="newRecupForm.pays" type="text" placeholder="ex: France" class="w-full bg-[#F3F4F6] border border-gray-200 rounded-xl px-3.5 py-2.5 font-bold outline-none" />
          </div>

          <div>
            <label class="block font-bold text-gray-700 mb-1">Adresse complète *</label>
            <input v-model="newRecupForm.adresse" type="text" placeholder="ex: Agence Rahma Paris 10ème (Gare du Nord)" class="w-full bg-[#F3F4F6] border border-gray-200 rounded-xl px-3.5 py-2.5 outline-none" />
          </div>

          <div>
            <label class="block font-bold text-gray-700 mb-1">Horaire d'ouverture</label>
            <input v-model="newRecupForm.horaire_ouverture" type="text" placeholder="ex: Du Lundi au Samedi de 09h00 à 19h00" class="w-full bg-[#F3F4F6] border border-gray-200 rounded-xl px-3.5 py-2.5 outline-none" />
          </div>

          <div>
            <label class="block font-bold text-gray-700 mb-1">Instructions de récupération</label>
            <textarea v-model="newRecupForm.instructions" rows="2" placeholder="ex: Présenter le code de réservation au guichet..." class="w-full bg-[#F3F4F6] border border-gray-200 rounded-xl px-3.5 py-2.5 outline-none"></textarea>
          </div>

          <div class="pt-2 flex justify-end gap-2">
            <button type="button" @click="showRecupAddressModal = false" class="px-4 py-2 text-gray-600 font-bold">Annuler</button>
            <button type="submit" :disabled="isLoading" class="bg-[#053754] text-white font-bold px-5 py-2 rounded-xl">Enregistrer</button>
          </div>
        </form>
      </div>
    </div>

  </div>
</template>
