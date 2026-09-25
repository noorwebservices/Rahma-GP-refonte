<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { entrepriseService } from '@/services/entrepriseService'
import { updateVoyage, publierVoyage } from '@/services/voyageService'
import { fetchAdresseDepots, createAdresseDepot, fetchAdresseRecuperations, createAdresseRecuperation } from '@/services/adresseService'
import CitySelect from '@/components/client/CitySelect.vue'
import { formatCurrency } from '@/utils/currencyState'
import { encodeId } from '@/utils/idMasker'
import Swal from 'sweetalert2'

const router = useRouter()
const isLoading = ref(true)
const voyages = ref([])
const agents = ref([])
const adressesDepot = ref([])
const adressesRecuperation = ref([])

const currentStep = ref(1)
const showCreateModal = ref(false)
const showAssignModal = ref(false)
const showDepotModal = ref(false)
const showRecupModal = ref(false)
const selectedVoyage = ref(null)
const selectedAgentId = ref('')
const isSubmitting = ref(false)
const dateError = ref('')

const isEditing = ref(false)
const editingVoyageId = ref(null)

// Toast Notification Helper
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

const truncateText = (str, maxLen = 30) => {
  if (str === null || str === undefined) return ''
  const s = String(str).trim()
  if (s.length <= maxLen) return s
  return s.substring(0, maxLen) + '...'
}

// Min Date String for HTML datetime-local input
const minDateDepart = computed(() => {
  const now = new Date()
  const tzOffset = now.getTimezoneOffset() * 60000
  return new Date(now.getTime() - tzOffset).toISOString().slice(0, 16)
})

// Main Form State matching voyageur CreateVoyageView + Agent GP selection
const form = reactive({
  adresse_depot_id: '',
  adresse_recuperation_id: '',
  pays_depart: 'Sénégal',
  ville_depart: '',
  pays_destination: 'France',
  ville_destination: '',
  date_depart: '',
  date_arrivee: '',
  capacite_totale: 50,
  prix_kg: 8500,
  prix_objet: 15000,
  devise: 'XOF',
  description: '',
  agent_gp_id: '',
  objets_autorises: [],
  objets_interdits: [],
  statut: 'brouillon'
})

const resetForm = () => {
  form.adresse_depot_id = adressesDepot.value[0]?.id || ''
  form.adresse_recuperation_id = adressesRecuperation.value[0]?.id || ''
  form.pays_depart = 'Sénégal'
  form.ville_depart = ''
  form.pays_destination = 'France'
  form.ville_destination = ''
  form.date_depart = ''
  form.date_arrivee = ''
  form.capacite_totale = 50
  form.prix_kg = 8500
  form.prix_objet = 15000
  form.devise = 'XOF'
  form.description = ''
  form.agent_gp_id = ''
  form.objets_autorises = []
  form.objets_interdits = []
  form.statut = 'brouillon'
}

// Modal Address creation forms (clean empty values)
const newDepotForm = reactive({
  adresse: '',
  ville: '',
  pays: '',
  horaire_ouverture: '',
  instructions: '',
})

const newRecupForm = reactive({
  adresse: '',
  ville: '',
  pays: '',
  horaire_ouverture: '',
  instructions: '',
})

const onDepotCitySelect = (cityObj) => {
  newDepotForm.ville = cityObj.city
  newDepotForm.pays = cityObj.country || 'Sénégal'
}

const onRecupCitySelect = (cityObj) => {
  newRecupForm.ville = cityObj.city
  newRecupForm.pays = cityObj.country || 'France'
}

const fetchInitialData = async () => {
  isLoading.value = true
  try {
    const [vRes, aRes] = await Promise.all([
      entrepriseService.getVoyages(),
      entrepriseService.getAgents(),
    ])
    voyages.value = vRes.voyages?.data || vRes.voyages || []
    agents.value = aRes.agents || []
  } catch (err) {
    console.error(err)
  } finally {
    isLoading.value = false
  }

  await loadAddresses()
}

const loadAddresses = async () => {
  try {
    const resDepot = await fetchAdresseDepots()
    if (resDepot && resDepot.data) {
      adressesDepot.value = Array.isArray(resDepot.data) ? resDepot.data : (resDepot.data.data || [])
      if (adressesDepot.value.length > 0 && !form.adresse_depot_id) {
        form.adresse_depot_id = adressesDepot.value[0].id
      }
    } else {
      adressesDepot.value = []
    }
  } catch (err) {
    console.error('Erreur chargement adresses dépôt:', err)
    adressesDepot.value = []
  }

  try {
    const resRecup = await fetchAdresseRecuperations()
    if (resRecup && resRecup.data) {
      adressesRecuperation.value = Array.isArray(resRecup.data) ? resRecup.data : (resRecup.data.data || [])
      if (adressesRecuperation.value.length > 0 && !form.adresse_recuperation_id) {
        form.adresse_recuperation_id = adressesRecuperation.value[0].id
      }
    } else {
      adressesRecuperation.value = []
    }
  } catch (err) {
    console.error('Erreur chargement adresses récupération:', err)
    adressesRecuperation.value = []
  }
}

onMounted(() => {
  fetchInitialData()
})

// Submit new depot address
const submitNewDepotAddress = async () => {
  if (!newDepotForm.adresse.trim() || !newDepotForm.ville.trim()) {
    return showToast('warning', 'Veuillez remplir l\'adresse et la ville.')
  }
  isSubmitting.value = true
  try {
    const res = await createAdresseDepot({ ...newDepotForm })
    showToast('success', 'Adresse de dépôt enregistrée avec succès !')
    showDepotModal.value = false
    await loadAddresses()
    if (res?.data?.id) form.adresse_depot_id = res.data.id
  } catch (err) {
    showToast('error', err?.message || 'Erreur lors de la création.')
  } finally {
    isSubmitting.value = false
  }
}

// Submit new recup address
const submitNewRecupAddress = async () => {
  if (!newRecupForm.adresse.trim() || !newRecupForm.ville.trim()) {
    return showToast('warning', 'Veuillez remplir l\'adresse et la ville.')
  }
  isSubmitting.value = true
  try {
    const res = await createAdresseRecuperation({ ...newRecupForm })
    showToast('success', 'Adresse de récupération enregistrée avec succès !')
    showRecupModal.value = false
    await loadAddresses()
    if (res?.data?.id) form.adresse_recuperation_id = res.data.id
  } catch (err) {
    showToast('error', err?.message || 'Erreur lors de la création.')
  } finally {
    isSubmitting.value = false
  }
}

// Presets categories
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

const customAutorise = ref('')
const customInterdit = ref('')

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

// Strict Validation
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

  const dep = new Date(form.date_depart)
  const arr = new Date(form.date_arrivee)

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

const formatDateForApi = (dateStr) => {
  if (!dateStr) return null
  return dateStr.replace('T', ' ') + (dateStr.length === 16 ? ':00' : '')
}

// Open creation modal
const openCreateModal = () => {
  isEditing.value = false
  editingVoyageId.value = null
  resetForm()
  currentStep.value = 1
  showCreateModal.value = true
}

// Edit a draft voyage
const editVoyage = (voyage) => {
  isEditing.value = true
  editingVoyageId.value = voyage.id
  form.adresse_depot_id = voyage.adresse_depot_id || ''
  form.adresse_recuperation_id = voyage.adresse_recuperation_id || ''
  form.pays_depart = voyage.pays_depart || 'Sénégal'
  form.ville_depart = voyage.ville_depart || ''
  form.pays_destination = voyage.pays_destination || 'France'
  form.ville_destination = voyage.ville_destination || ''
  form.date_depart = voyage.date_depart ? voyage.date_depart.replace(' ', 'T').slice(0, 16) : ''
  form.date_arrivee = voyage.date_arrivee ? voyage.date_arrivee.replace(' ', 'T').slice(0, 16) : ''
  form.capacite_totale = voyage.capacite_totale || 50
  form.prix_kg = voyage.prix_kg || 8500
  form.prix_objet = voyage.prix_objet || 15000
  form.devise = voyage.devise || 'XOF'
  form.description = voyage.description || ''
  form.agent_gp_id = voyage.agent_gp_id || voyage.agent_gp?.id || ''
  form.objets_autorises = Array.isArray(voyage.objets_autorises) ? [...voyage.objets_autorises] : []
  form.objets_interdits = Array.isArray(voyage.objets_interdits) ? [...voyage.objets_interdits] : []
  form.statut = voyage.statut || 'brouillon'

  // Dynamic add any custom/saved categories into preset lists so they display in step 5 grid
  if (Array.isArray(voyage.objets_autorises)) {
    voyage.objets_autorises.forEach(cat => {
      if (cat && !presetAutorises.value.includes(cat)) {
        presetAutorises.value.push(cat)
      }
    })
  }
  if (Array.isArray(voyage.objets_interdits)) {
    voyage.objets_interdits.forEach(cat => {
      if (cat && !presetInterdits.value.includes(cat)) {
        presetInterdits.value.push(cat)
      }
    })
  }

  currentStep.value = 1
  showCreateModal.value = true
}

// Go to voyage detail view
const goToVoyageDetail = (voyage) => {
  const maskedId = encodeId(voyage.id)
  router.push(`/entreprise/voyages/${maskedId}`)
}

// Submit Voyage to Backend API
const handleSaveVoyage = async (targetStatut) => {
  if (!validateStep(1) || !validateStep(2) || !validateStep(3) || !validateStep(4)) return

  isSubmitting.value = true
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
    agent_gp_id: form.agent_gp_id || null,
    objets_autorises: form.objets_autorises,
    objets_interdits: form.objets_interdits,
    statut: targetStatut
  }

  try {
    if (isEditing.value && editingVoyageId.value) {
      await updateVoyage(editingVoyageId.value, payload)
      if (targetStatut === 'publie') {
        await publierVoyage(editingVoyageId.value).catch(() => {})
      }
      showToast('success', targetStatut === 'publie' ? 'Voyage mis à jour et publié avec succès !' : 'Voyage mis à jour enregistrée en brouillon !')
    } else {
      await entrepriseService.createVoyage(payload)
      showToast('success', targetStatut === 'publie' ? 'Voyage d\'entreprise publié avec succès !' : 'Voyage enregistré en brouillon !')
    }
    showCreateModal.value = false
    fetchInitialData()
  } catch (err) {
    console.error(err)
    showToast('error', err?.message || 'Erreur lors de l\'enregistrement du voyage.')
  } finally {
    isSubmitting.value = false
  }
}

const openAssignModal = (voyage) => {
  selectedVoyage.value = voyage
  selectedAgentId.value = voyage.agent_gp_id || ''
  showAssignModal.value = true
}

const handleAssignAgent = async () => {
  if (!selectedAgentId.value) {
    return showToast('warning', 'Veuillez sélectionner un agent GP.')
  }

  isSubmitting.value = true
  try {
    await entrepriseService.assignAgentToVoyage(selectedVoyage.value.id, selectedAgentId.value)
    showAssignModal.value = false
    showToast('success', 'Agent GP affecté au voyage avec succès !')
    fetchInitialData()
  } catch (err) {
    console.error(err)
    showToast('error', err?.message || 'Erreur lors de l\'affectation de l\'agent.')
  } finally {
    isSubmitting.value = false
  }
}

// Pagination logic
const currentPage = ref(1)
const itemsPerPage = ref(10)

const totalPages = computed(() => {
  return Math.ceil(voyages.value.length / itemsPerPage.value) || 1
})

const paginatedVoyages = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value
  return voyages.value.slice(start, start + itemsPerPage.value)
})

const nextPage = () => {
  if (currentPage.value < totalPages.value) currentPage.value++
}

const prevPage = () => {
  if (currentPage.value > 1) currentPage.value--
}

const visiblePages = computed(() => {
  const total = totalPages.value
  const current = currentPage.value

  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1)
  }

  if (current <= 4) {
    return [1, 2, 3, 4, 5, '...', total]
  }

  if (current >= total - 3) {
    return [1, '...', total - 4, total - 3, total - 2, total - 1, total]
  }

  return [1, '...', current - 1, current, current + 1, '...', total]
})
</script>

<template>
  <div class="space-y-6">
    
    <!-- Top Header Bar -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 p-5 sm:p-6 rounded-3xl shadow-2xs">
      <div>
        <h2 class="text-xl font-extrabold text-[#053754] dark:text-sky-300">Voyages de l'Entreprise</h2>
        <p class="text-xs text-gray-500 dark:text-slate-400 mt-1">
          Planifiez vos voyages en étapes, modifiez vos brouillons et consultez le détail de vos réservations.
        </p>
      </div>

      <button
        @click="openCreateModal"
        class="px-4 py-2.5 bg-[#053754] hover:bg-[#0284c7] text-white font-bold text-xs rounded-2xl transition-all shadow-sm flex items-center gap-2 cursor-pointer"
      >
        <span>✈️</span>
        <span>Créer un Voyage Entreprise</span>
      </button>
    </div>

    <!-- Loading -->
    <div v-if="isLoading" class="py-12 text-center space-y-3">
      <div class="w-8 h-8 border-4 border-[#053754] border-t-transparent rounded-full animate-spin mx-auto"></div>
      <p class="text-xs font-bold text-gray-500">Chargement des voyages entreprise...</p>
    </div>

    <!-- Empty -->
    <div v-else-if="voyages.length === 0" class="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 p-8 rounded-3xl text-center space-y-3">
      <span class="text-3xl">✈️</span>
      <h3 class="text-sm font-bold text-gray-700 dark:text-slate-300">Aucun voyage créé</h3>
      <p class="text-xs text-gray-500 max-w-md mx-auto">
        Votre entreprise n'a pas encore de voyages enregistrés. Cliquez sur le bouton ci-dessus pour planifier votre premier trajet.
      </p>
    </div>

    <!-- Voyages Table View -->
    <div v-else class="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-3xl shadow-2xs overflow-hidden">
      <div class="overflow-x-auto min-w-full">
        <table class="min-w-max w-full text-left border-collapse">
          <thead>
            <tr class="bg-slate-50 dark:bg-slate-800/80 border-b border-gray-200 dark:border-slate-800 text-[11px] font-extrabold text-gray-500 dark:text-slate-400 uppercase tracking-wider whitespace-nowrap">
              <th class="py-4 px-5">Trajet</th>
              <th class="py-4 px-5">Dates (Départ ➔ Arrivée)</th>
              <th class="py-4 px-5">Agent GP Responsable</th>
              <th class="py-4 px-5">Capacité</th>
              <th class="py-4 px-5">Tarifs</th>
              <th class="py-4 px-5">Statut</th>
              <th class="py-4 px-5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100 dark:divide-slate-800 text-xs font-medium whitespace-nowrap">
            <tr
              v-for="voyage in paginatedVoyages"
              :key="voyage.id"
              @click="goToVoyageDetail(voyage)"
              class="hover:bg-sky-50/50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer group"
            >
              <!-- Trajet -->
              <td class="py-4 px-5">
                <div class="flex items-center gap-2 font-extrabold text-[#053754] dark:text-sky-300 text-sm">
                  <span>{{ truncateText(voyage.ville_depart, 30) }}</span>
                  <span class="text-gray-400 text-xs">➔</span>
                  <span>{{ truncateText(voyage.ville_destination, 30) }}</span>
                </div>
                <div class="text-[11px] text-gray-400 dark:text-slate-500 mt-0.5">
                  {{ truncateText(`${voyage.pays_depart} ➔ ${voyage.pays_destination}`, 30) }}
                </div>
              </td>

              <!-- Dates -->
              <td class="py-4 px-5">
                <div class="font-bold text-gray-800 dark:text-slate-200">
                  {{ voyage.date_depart ? new Date(voyage.date_depart).toLocaleString('fr-FR', { dateStyle: 'short', timeStyle: 'short' }) : '—' }}
                </div>
                <div class="text-[11px] text-gray-500 dark:text-slate-400">
                  ➔ {{ voyage.date_arrivee ? new Date(voyage.date_arrivee).toLocaleString('fr-FR', { dateStyle: 'short', timeStyle: 'short' }) : '—' }}
                </div>
              </td>

              <!-- Agent GP Responsable -->
              <td class="py-4 px-5" @click.stop>
                <div class="flex items-center justify-between gap-2">
                  <div>
                    <span v-if="voyage.agent_gp?.user" class="font-bold text-[#053754] dark:text-sky-300 block">
                      👤 {{ truncateText(`${voyage.agent_gp.user.prenom || ''} ${voyage.agent_gp.user.nom || ''}`, 30) }}
                    </span>
                    <span v-else class="text-amber-600 dark:text-amber-400 italic font-semibold text-[11px] block">
                      Non attribué
                    </span>
                  </div>
                  <button
                    @click="openAssignModal(voyage)"
                    type="button"
                    class="px-2.5 py-1 bg-sky-50 hover:bg-sky-100 text-[#053754] dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-sky-300 font-extrabold text-[11px] rounded-lg transition cursor-pointer shrink-0"
                  >
                    {{ voyage.agent_gp_id ? 'Réaffecter' : 'Affecter' }}
                  </button>
                </div>
              </td>

              <!-- Capacité -->
              <td class="py-4 px-5 font-bold text-emerald-600 dark:text-emerald-400">
                {{ voyage.capacite_dispo ?? voyage.capacite_totale }} / {{ voyage.capacite_totale }} Kg
              </td>

              <!-- Tarifs -->
              <td class="py-4 px-5">
                <div class="text-gray-800 dark:text-slate-200 font-bold">
                  {{ formatCurrency(voyage.prix_kg || 0) }} / Kg
                </div>
                <div class="text-[11px] text-gray-500 dark:text-slate-400">
                  {{ formatCurrency(voyage.prix_objet || 0) }} / objet
                </div>
              </td>

              <!-- Statut -->
              <td class="py-4 px-5">
                <span
                  class="px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider border"
                  :class="voyage.statut === 'publie' ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800' : (voyage.statut === 'brouillon' ? 'bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800' : 'bg-gray-100 text-gray-700 border-gray-200 dark:bg-slate-800 dark:text-slate-300')"
                >
                  {{ voyage.statut === 'publie' ? 'Publié' : (voyage.statut === 'brouillon' ? 'Brouillon' : voyage.statut) }}
                </span>
              </td>

              <!-- Actions -->
              <td class="py-4 px-5 text-right" @click.stop>
                <div class="flex items-center justify-end gap-2">
                  <button
                    v-if="voyage.statut === 'brouillon'"
                    @click="editVoyage(voyage)"
                    type="button"
                    title="Modifier le voyage en brouillon"
                    class="px-3 py-1.5 bg-amber-50 dark:bg-amber-950/60 hover:bg-amber-100 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800 font-extrabold text-xs rounded-xl transition cursor-pointer flex items-center gap-1 shadow-2xs"
                  >
                    <span>✏️</span>
                    <span>Éditer</span>
                  </button>

                  <button
                    @click="goToVoyageDetail(voyage)"
                    type="button"
                    title="Voir les détails du voyage"
                    class="px-3 py-1.5 bg-[#053754] hover:bg-[#074C72] text-white font-extrabold text-xs rounded-xl transition cursor-pointer flex items-center gap-1 shadow-2xs"
                  >
                    <span>👁️</span>
                    <span>Détails</span>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination Controls Bar -->
      <div v-if="totalPages > 1" class="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 border-t border-gray-100 dark:border-slate-800 text-xs bg-gray-50/50 dark:bg-slate-800/40">
        <div class="text-gray-500 dark:text-slate-400 font-medium">
          Affichage de <span class="font-bold text-gray-800 dark:text-slate-200">{{ (currentPage - 1) * itemsPerPage + 1 }}</span>
          à <span class="font-bold text-gray-800 dark:text-slate-200">{{ Math.min(currentPage * itemsPerPage, voyages.length) }}</span>
          sur <span class="font-bold text-[#053754] dark:text-sky-300">{{ voyages.length }}</span> voyages
        </div>

        <div class="flex items-center gap-2">
          <button
            @click="prevPage"
            :disabled="currentPage === 1"
            class="px-3.5 py-2 rounded-xl bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 font-bold text-gray-700 dark:text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-slate-800 transition cursor-pointer shadow-2xs"
          >
            ◄ Précédent
          </button>

          <div class="flex items-center gap-1">
            <template v-for="(p, index) in visiblePages" :key="index">
              <span v-if="p === '...'" class="px-2 py-1 text-gray-400 dark:text-slate-500 font-extrabold select-none text-xs">...</span>
              <button
                v-else
                @click="currentPage = p"
                :class="[
                  'w-8 h-8 rounded-xl font-extrabold text-xs transition cursor-pointer flex items-center justify-center',
                  currentPage === p ? 'bg-[#053754] text-white shadow-xs' : 'bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 text-gray-600 dark:text-slate-300 hover:bg-gray-100'
                ]"
              >
                {{ p }}
              </button>
            </template>
          </div>

          <button
            @click="nextPage"
            :disabled="currentPage === totalPages"
            class="px-3.5 py-2 rounded-xl bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 font-bold text-gray-700 dark:text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-slate-800 transition cursor-pointer shadow-2xs"
          >
            Suivant ►
          </button>
        </div>
      </div>
    </div>

    <!-- MODAL STEPPER : CRÉATION DE VOYAGE EN ÉTAPES (Identique à CreateVoyageView) -->
    <div v-if="showCreateModal" class="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div class="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 w-full max-w-2xl shadow-2xl space-y-6 max-h-[92vh] overflow-y-auto">
        
        <!-- Header Title & Stepper indicator -->
        <div class="space-y-2 border-b border-gray-100 dark:border-slate-800 pb-4">
          <div class="flex items-center justify-between">
            <h3 class="text-lg font-serif font-bold text-[#053754] dark:text-sky-300 flex items-center gap-2">
              <span>✈️</span>
              <span>Créer un Voyage d'Entreprise</span>
            </h3>
            <div class="flex items-center gap-2">
              <span class="text-xs font-bold text-[#074C72] dark:text-sky-400 bg-sky-50 dark:bg-sky-950/60 px-3 py-1 rounded-full border border-sky-100 dark:border-sky-800">
                Étape {{ currentStep }} sur 5
              </span>
              <button @click="showCreateModal = false" class="text-gray-400 hover:text-gray-700 text-lg cursor-pointer">✕</button>
            </div>
          </div>

          <div class="text-xs font-semibold text-gray-500 dark:text-slate-400">
            <span v-if="currentStep === 1">1. Villes de départ et de destination</span>
            <span v-else-if="currentStep === 2">2. Dates & Horaires de voyage</span>
            <span v-else-if="currentStep === 3">3. Capacité, Tarifs & Agent GP Responsable</span>
            <span v-else-if="currentStep === 4">4. Adresses de Dépôt & Récupération</span>
            <span v-else>5. Catégories d'objets acceptés et refusés</span>
          </div>

          <!-- Progress Bar -->
          <div class="w-full bg-gray-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden flex">
            <div
              class="bg-[#053754] dark:bg-sky-500 h-full transition-all duration-300 rounded-full"
              :style="{ width: `${(currentStep / 5) * 100}%` }"
            ></div>
          </div>
        </div>

        <!-- Form Step Content -->
        <div class="space-y-5">
          
          <!-- STEP 1: TRAJET -->
          <div v-if="currentStep === 1" class="space-y-4">
            <h4 class="text-sm font-extrabold text-[#053754] dark:text-sky-300">1. Trajet du Voyage</h4>

            <div class="space-y-4">
              <div class="space-y-1.5">
                <label class="block text-xs font-bold text-gray-700 dark:text-slate-300">Ville de Départ *</label>
                <CitySelect v-model="form.ville_depart" placeholder="Rechercher la ville de départ..." />
              </div>

              <div class="space-y-1.5">
                <label class="block text-xs font-bold text-gray-700 dark:text-slate-300">Ville de Destination *</label>
                <CitySelect v-model="form.ville_destination" placeholder="Rechercher la ville de destination..." />
              </div>
            </div>
          </div>

          <!-- STEP 2: DATES & HEURES -->
          <div v-else-if="currentStep === 2" class="space-y-4">
            <h4 class="text-sm font-extrabold text-[#053754] dark:text-sky-300">2. Dates & Horaires</h4>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div class="space-y-1.5">
                <label class="block text-xs font-bold text-gray-700 dark:text-slate-300">Date & Heure de Départ *</label>
                <input
                  v-model="form.date_depart"
                  :min="minDateDepart"
                  @change="validateDates"
                  type="datetime-local"
                  class="w-full bg-[#F3F4F6] dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl px-4 py-3 text-xs sm:text-sm text-gray-800 dark:text-slate-100 outline-none"
                />
              </div>

              <div class="space-y-1.5">
                <label class="block text-xs font-bold text-gray-700 dark:text-slate-300">Date & Heure d'Arrivée *</label>
                <input
                  v-model="form.date_arrivee"
                  :min="form.date_depart || minDateDepart"
                  @change="validateDates"
                  type="datetime-local"
                  class="w-full bg-[#F3F4F6] dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl px-4 py-3 text-xs sm:text-sm text-gray-800 dark:text-slate-100 outline-none"
                />
              </div>
            </div>

            <p v-if="dateError" class="text-xs text-red-600 dark:text-rose-400 font-extrabold p-3 bg-red-50 dark:bg-rose-950/40 rounded-xl border border-red-200 flex items-center gap-2">
              <span>⚠️</span> {{ dateError }}
            </p>
          </div>

          <!-- STEP 3: CAPACITÉ, TARIFS & AGENT GP -->
          <div v-else-if="currentStep === 3" class="space-y-4">
            <h4 class="text-sm font-extrabold text-[#053754] dark:text-sky-300">3. Capacité, Tarifs & Agent Responsable</h4>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div class="space-y-1.5">
                <label class="block text-xs font-bold text-gray-700 dark:text-slate-300">Capacité Totale (Kg) *</label>
                <input
                  v-model.number="form.capacite_totale"
                  type="number"
                  placeholder="ex: 50"
                  class="w-full bg-[#F3F4F6] dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl px-4 py-3 text-xs sm:text-sm text-gray-800 dark:text-slate-100 outline-none"
                />
              </div>

              <div class="space-y-1.5">
                <label class="block text-xs font-bold text-gray-700 dark:text-slate-300">Devise *</label>
                <select
                  v-model="form.devise"
                  class="w-full bg-[#F3F4F6] dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl px-4 py-3 text-xs sm:text-sm text-gray-800 dark:text-slate-100 font-bold outline-none"
                >
                  <option value="XOF">FCFA (XOF)</option>
                  <option value="EUR">Euro (€)</option>
                  <option value="USD">Dollar US ($)</option>
                </select>
              </div>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div class="space-y-1.5">
                <label class="block text-xs font-bold text-gray-700 dark:text-slate-300">Prix / kg ({{ form.devise }}) *</label>
                <input
                  v-model.number="form.prix_kg"
                  type="number"
                  placeholder="ex: 8500"
                  class="w-full bg-[#F3F4F6] dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl px-4 py-3 text-xs sm:text-sm text-gray-800 dark:text-slate-100 outline-none"
                />
              </div>

              <div class="space-y-1.5">
                <label class="block text-xs font-bold text-gray-700 dark:text-slate-300">Prix / Objet ou Document ({{ form.devise }})</label>
                <input
                  v-model.number="form.prix_objet"
                  type="number"
                  placeholder="ex: 15000"
                  class="w-full bg-[#F3F4F6] dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl px-4 py-3 text-xs sm:text-sm text-gray-800 dark:text-slate-100 outline-none"
                />
              </div>
            </div>

            <!-- Agent GP Responsable Selection -->
            <div class="p-3 bg-sky-50 dark:bg-slate-800/80 rounded-2xl border border-sky-200 dark:border-slate-700 space-y-1.5">
              <label class="block text-xs font-bold text-[#053754] dark:text-sky-300">👤 Agent GP Responsable du Trajet (Spécifique Entreprise)</label>
              <select
                v-model="form.agent_gp_id"
                class="w-full bg-white dark:bg-slate-900 border border-gray-300 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-gray-800 dark:text-slate-100 outline-none"
              >
                <option value="">-- Affecter un agent ultérieurement --</option>
                <option v-for="agent in agents" :key="agent.id" :value="agent.id">
                  👤 {{ agent.user?.prenom }} {{ agent.user?.nom }} ({{ agent.matricule }})
                </option>
              </select>
            </div>

            <div class="space-y-1.5">
              <label class="block text-xs font-bold text-gray-700 dark:text-slate-300">Conditions & Description</label>
              <textarea
                v-model="form.description"
                rows="3"
                placeholder="Fournissez des détails sur votre trajet, vos consignes et disponibilités..."
                class="w-full bg-[#F3F4F6] dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl px-4 py-3 text-xs sm:text-sm text-gray-800 dark:text-slate-100 outline-none"
              ></textarea>
            </div>
          </div>

          <!-- STEP 4: ADRESSES DÉPÔT ET RÉCUPÉRATION -->
          <div v-else-if="currentStep === 4" class="space-y-6">
            <h4 class="text-sm font-extrabold text-[#053754] dark:text-sky-300">4. Adresses de Dépôt et Récupération</h4>

            <div class="space-y-5">
              <!-- Adresse Dépôt Card -->
              <div class="bg-slate-50 dark:bg-slate-800/70 p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-3">
                <div class="flex items-center justify-between flex-wrap gap-2">
                  <h4 class="text-xs font-extrabold text-[#053754] dark:text-sky-300 uppercase tracking-wider flex items-center gap-1.5">
                    <span>📍</span> Adresse de Dépôt
                  </h4>
                  <button
                    @click="showDepotModal = true"
                    type="button"
                    class="text-xs font-extrabold text-[#B50302] dark:text-rose-400 hover:underline cursor-pointer"
                  >
                    + Nouvelle adresse de dépôt
                  </button>
                </div>

                <select
                  v-model="form.adresse_depot_id"
                  class="w-full bg-white dark:bg-slate-900 border border-gray-300 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-gray-800 dark:text-slate-100 font-bold outline-none"
                >
                  <option value="" disabled class="dark:bg-slate-800">-- Sélectionner l'adresse de dépôt --</option>
                  <option v-for="addr in adressesDepot" :key="addr.id" :value="addr.id" class="dark:bg-slate-800">
                    {{ addr.adresse }} ({{ addr.ville }}, {{ addr.pays }})
                  </option>
                </select>
              </div>

              <!-- Adresse Récupération Card -->
              <div class="bg-slate-50 dark:bg-slate-800/70 p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-3">
                <div class="flex items-center justify-between flex-wrap gap-2">
                  <h4 class="text-xs font-extrabold text-[#053754] dark:text-sky-300 uppercase tracking-wider flex items-center gap-1.5">
                    <span>📍</span> Adresse de Récupération
                  </h4>
                  <button
                    @click="showRecupModal = true"
                    type="button"
                    class="text-xs font-extrabold text-[#B50302] dark:text-rose-400 hover:underline cursor-pointer"
                  >
                    + Nouvelle adresse de récupération
                  </button>
                </div>

                <select
                  v-model="form.adresse_recuperation_id"
                  class="w-full bg-white dark:bg-slate-900 border border-gray-300 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-gray-800 dark:text-slate-100 font-bold outline-none"
                >
                  <option value="" disabled class="dark:bg-slate-800">-- Sélectionner l'adresse de récupération --</option>
                  <option v-for="addr in adressesRecuperation" :key="addr.id" :value="addr.id" class="dark:bg-slate-800">
                    {{ addr.adresse }} ({{ addr.ville }}, {{ addr.pays }})
                  </option>
                </select>
              </div>
            </div>
          </div>

          <!-- STEP 5: CATÉGORIES ACCEPTÉES / REFUSÉES -->
          <div v-else-if="currentStep === 5" class="space-y-6">
            <h4 class="text-sm font-extrabold text-[#053754] dark:text-sky-300">5. Catégories d'objets acceptés & interdits</h4>

            <!-- SECTION AUTORISÉES -->
            <div class="space-y-3">
              <label class="block text-xs font-extrabold text-emerald-800 dark:text-emerald-300">✅ Objets & Colis Acceptés</label>
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div
                  v-for="cat in presetAutorises"
                  :key="cat"
                  @click="toggleAutorise(cat)"
                  class="p-3 rounded-xl border text-xs font-bold flex items-center justify-between cursor-pointer transition-all"
                  :class="form.objets_autorises.includes(cat) ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300' : 'bg-gray-50 dark:bg-slate-800 border-gray-200 dark:border-slate-700 text-gray-600 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-700'"
                >
                  <span>{{ cat }}</span>
                  <span v-if="form.objets_autorises.includes(cat)" class="text-emerald-600 dark:text-emerald-400 text-sm">✓</span>
                </div>
              </div>

              <!-- Champ d'ajout personnalisé Autorisé -->
              <div class="flex gap-2 pt-2">
                <input
                  v-model="customAutorise"
                  @keyup.enter="addCustomAutorise"
                  type="text"
                  placeholder="Ajouter une autre catégorie autorisée..."
                  class="flex-1 bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded-xl px-3.5 py-2 text-xs text-gray-800 dark:text-slate-100 outline-none focus:ring-2 focus:ring-emerald-500"
                />
                <button
                  @click="addCustomAutorise"
                  type="button"
                  class="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs transition-all cursor-pointer"
                >
                  Ajouter
                </button>
              </div>
            </div>

            <!-- SECTION INTERDITES -->
            <div class="space-y-3 pt-4 border-t border-gray-100 dark:border-slate-800">
              <label class="block text-xs font-extrabold text-red-800 dark:text-rose-300">🚫 Objets Interdits</label>
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div
                  v-for="cat in presetInterdits"
                  :key="cat"
                  @click="toggleInterdit(cat)"
                  class="p-3 rounded-xl border text-xs font-bold flex items-center justify-between cursor-pointer transition-all"
                  :class="form.objets_interdits.includes(cat) ? 'bg-red-50 dark:bg-rose-950/60 border-red-300 dark:border-rose-800 text-red-800 dark:text-rose-300' : 'bg-gray-50 dark:bg-slate-800 border-gray-200 dark:border-slate-700 text-gray-600 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-700'"
                >
                  <span>{{ cat }}</span>
                  <span v-if="form.objets_interdits.includes(cat)" class="text-red-600 dark:text-rose-400 text-sm">✕</span>
                </div>
              </div>

              <!-- Champ d'ajout personnalisé Interdit -->
              <div class="flex gap-2 pt-2">
                <input
                  v-model="customInterdit"
                  @keyup.enter="addCustomInterdit"
                  type="text"
                  placeholder="Ajouter une autre catégorie interdite..."
                  class="flex-1 bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded-xl px-3.5 py-2 text-xs text-gray-800 dark:text-slate-100 outline-none focus:ring-2 focus:ring-rose-500"
                />
                <button
                  @click="addCustomInterdit"
                  type="button"
                  class="px-4 py-2 bg-[#B50302] hover:bg-[#870202] text-white rounded-xl text-xs font-bold shadow-xs transition-all cursor-pointer"
                >
                  Ajouter
                </button>
              </div>
            </div>
          </div>

        </div>

        <!-- Stepper Navigation Footer -->
        <div class="border-t border-gray-100 dark:border-slate-800 pt-4 flex items-center justify-between gap-3 flex-wrap">
          <button
            v-if="currentStep > 1"
            @click="prevStep"
            type="button"
            class="px-5 py-2.5 rounded-xl bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 text-gray-700 dark:text-slate-200 font-bold text-xs cursor-pointer"
          >
            ← Étape précédente
          </button>

          <div class="ml-auto flex items-center gap-2">
            <button
              v-if="currentStep < 5"
              @click="nextStep"
              type="button"
              class="bg-[#053754] hover:bg-[#0284c7] text-white font-extrabold text-xs py-2.5 px-6 rounded-xl shadow-md cursor-pointer uppercase tracking-wider"
            >
              Suivant →
            </button>

            <template v-else>
              <button
                @click="handleSaveVoyage('brouillon')"
                :disabled="isSubmitting"
                type="button"
                class="bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 text-gray-800 dark:text-slate-200 font-extrabold text-xs py-2.5 px-5 rounded-xl cursor-pointer uppercase tracking-wider"
              >
                Enregistrer brouillon
              </button>

              <button
                @click="handleSaveVoyage('publie')"
                :disabled="isSubmitting"
                type="button"
                class="bg-[#B50302] hover:bg-[#8B0000] text-white font-extrabold text-xs py-2.5 px-6 rounded-xl shadow-lg cursor-pointer uppercase tracking-wider"
              >
                {{ isSubmitting ? 'Publication...' : 'Publier le Voyage →' }}
              </button>
            </template>
          </div>
        </div>

      </div>
    </div>

    <!-- MODAL: NOUVELLE ADRESSE DE DÉPÔT -->
    <div v-if="showDepotModal" class="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div class="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 w-full max-w-md rounded-3xl p-6 shadow-2xl space-y-4 font-sans">
        <div class="flex items-center justify-between border-b border-gray-100 dark:border-slate-800 pb-3">
          <h3 class="text-base font-bold text-[#053754] dark:text-sky-300 font-serif">Nouvelle adresse de dépôt</h3>
          <button @click="showDepotModal = false" class="text-gray-400 dark:text-slate-500 hover:text-gray-600 dark:hover:text-slate-300 font-bold cursor-pointer">✕</button>
        </div>

        <form @submit.prevent="submitNewDepotAddress" class="space-y-3 text-xs">
          <div>
            <label class="block font-bold text-gray-700 dark:text-slate-300 mb-1">Ville *</label>
            <CitySelect v-model="newDepotForm.ville" @change="onDepotCitySelect" />
          </div>

          <div>
            <label class="block font-bold text-gray-700 dark:text-slate-300 mb-1">Pays (Rempli automatiquement)</label>
            <input :value="newDepotForm.pays" readonly type="text" placeholder="ex: Sénégal" class="w-full bg-[#F3F4F6] dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 font-bold text-gray-800 dark:text-slate-100 outline-none cursor-not-allowed" />
          </div>

          <div>
            <label class="block font-bold text-gray-700 dark:text-slate-300 mb-1">Adresse complète *</label>
            <input v-model="newDepotForm.adresse" type="text" placeholder="ex: 15 Rue de Rivoli, Agence Relais Rahma" class="w-full bg-[#F3F4F6] dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-gray-800 dark:text-slate-100 outline-none" />
          </div>

          <div>
            <label class="block font-bold text-gray-700 dark:text-slate-300 mb-1">Horaire d'ouverture</label>
            <input v-model="newDepotForm.horaire_ouverture" type="text" placeholder="ex: Du Lundi au Samedi de 08h30 à 19h00" class="w-full bg-[#F3F4F6] dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-gray-800 dark:text-slate-100 outline-none" />
          </div>

          <div>
            <label class="block font-bold text-gray-700 dark:text-slate-300 mb-1">Instructions de dépôt</label>
            <textarea v-model="newDepotForm.instructions" rows="2" placeholder="ex: Remettre le colis au comptoir 2..." class="w-full bg-[#F3F4F6] dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-gray-800 dark:text-slate-100 outline-none"></textarea>
          </div>

          <div class="pt-2 flex justify-end items-center gap-3">
            <button type="button" @click="showDepotModal = false" class="px-4 py-2 text-gray-600 dark:text-slate-400 font-bold cursor-pointer">Annuler</button>
            <button type="submit" :disabled="isSubmitting" class="bg-[#053754] hover:bg-[#074C72] text-white font-extrabold px-6 py-2.5 rounded-xl cursor-pointer uppercase tracking-wider shadow-md">ENREGISTRER</button>
          </div>
        </form>
      </div>
    </div>

    <!-- MODAL: NOUVELLE ADRESSE DE RÉCUPÉRATION -->
    <div v-if="showRecupModal" class="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div class="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 w-full max-w-md rounded-3xl p-6 shadow-2xl space-y-4 font-sans">
        <div class="flex items-center justify-between border-b border-gray-100 dark:border-slate-800 pb-3">
          <h3 class="text-base font-bold text-[#053754] dark:text-sky-300 font-serif">Nouvelle adresse de récupération</h3>
          <button @click="showRecupModal = false" class="text-gray-400 dark:text-slate-500 hover:text-gray-600 dark:hover:text-slate-300 font-bold cursor-pointer">✕</button>
        </div>

        <form @submit.prevent="submitNewRecupAddress" class="space-y-3 text-xs">
          <div>
            <label class="block font-bold text-gray-700 dark:text-slate-300 mb-1">Ville *</label>
            <CitySelect v-model="newRecupForm.ville" @change="onRecupCitySelect" />
          </div>

          <div>
            <label class="block font-bold text-gray-700 dark:text-slate-300 mb-1">Pays (Rempli automatiquement)</label>
            <input :value="newRecupForm.pays" readonly type="text" placeholder="ex: France" class="w-full bg-[#F3F4F6] dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 font-bold text-gray-800 dark:text-slate-100 outline-none cursor-not-allowed" />
          </div>

          <div>
            <label class="block font-bold text-gray-700 dark:text-slate-300 mb-1">Adresse complète *</label>
            <input v-model="newRecupForm.adresse" type="text" placeholder="ex: Agence Rahma Paris 10ème (Gare du Nord)" class="w-full bg-[#F3F4F6] dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-gray-800 dark:text-slate-100 outline-none" />
          </div>

          <div>
            <label class="block font-bold text-gray-700 dark:text-slate-300 mb-1">Horaire d'ouverture</label>
            <input v-model="newRecupForm.horaire_ouverture" type="text" placeholder="ex: Du Lundi au Samedi de 09h00 à 19h00" class="w-full bg-[#F3F4F6] dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-gray-800 dark:text-slate-100 outline-none" />
          </div>

          <div>
            <label class="block font-bold text-gray-700 dark:text-slate-300 mb-1">Instructions de récupération</label>
            <textarea v-model="newRecupForm.instructions" rows="2" placeholder="ex: Consignes particulières pour le destinataire..." class="w-full bg-[#F3F4F6] dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-gray-800 dark:text-slate-100 outline-none"></textarea>
          </div>

          <div class="pt-2 flex justify-end items-center gap-3">
            <button type="button" @click="showRecupModal = false" class="px-4 py-2 text-gray-600 dark:text-slate-400 font-bold cursor-pointer">Annuler</button>
            <button type="submit" :disabled="isSubmitting" class="bg-[#053754] hover:bg-[#074C72] text-white font-extrabold px-6 py-2.5 rounded-xl cursor-pointer uppercase tracking-wider shadow-md">ENREGISTRER</button>
          </div>
        </form>
      </div>
    </div>

    <!-- MODAL 2 : AFFECTATION / RÉAFFECTATION AGENT -->
    <div v-if="showAssignModal" class="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div class="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-3xl p-6 w-full max-w-md shadow-2xl space-y-4">
        <div class="flex items-center justify-between border-b border-gray-100 dark:border-slate-800 pb-3">
          <h3 class="font-extrabold text-base text-[#053754] dark:text-sky-300">Affecter un Agent GP au voyage</h3>
          <button @click="showAssignModal = false" class="text-gray-400 hover:text-gray-700 text-lg cursor-pointer">✕</button>
        </div>

        <p class="text-xs text-gray-500 dark:text-slate-400">
          Sélectionnez l'agent responsable du voyage <strong>{{ selectedVoyage?.ville_depart }} ➔ {{ selectedVoyage?.ville_destination }}</strong> :
        </p>

        <div>
          <select v-model="selectedAgentId" class="w-full px-3.5 py-2.5 text-xs border rounded-xl bg-white dark:bg-slate-800 font-medium text-gray-800 dark:text-slate-100 outline-none">
            <option value="">-- Sélectionner un agent --</option>
            <option v-for="agent in agents" :key="agent.id" :value="agent.id">
              👤 {{ agent.user?.prenom }} {{ agent.user?.nom }} ({{ agent.matricule }})
            </option>
          </select>
        </div>

        <div class="flex items-center justify-end gap-3 pt-3">
          <button @click="showAssignModal = false" class="px-4 py-2 text-xs font-bold text-gray-500 hover:bg-gray-100 rounded-xl">Annuler</button>
          <button @click="handleAssignAgent" :disabled="isSubmitting" class="px-5 py-2 bg-[#053754] text-white font-bold text-xs rounded-xl hover:bg-[#0284c7] cursor-pointer">
            {{ isSubmitting ? 'Affectation...' : 'Confirmer l\'affectation' }}
          </button>
        </div>
      </div>
    </div>

  </div>
</template>
