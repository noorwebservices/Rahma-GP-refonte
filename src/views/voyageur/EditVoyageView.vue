<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import Swal from 'sweetalert2'
import CitySelect from '@/components/client/CitySelect.vue'
import { fetchVoyage, updateVoyage, publierVoyage } from '@/services/voyageService'
import { fetchAdresseDepots, fetchAdresseRecuperations } from '@/services/adresseService'
import { decodeId } from '@/utils/idMasker'
import { useI18n } from '@/composables/useI18n'

const route = useRoute()
const router = useRouter()
const { t } = useI18n()
const isLoading = ref(false)

const voyageId = decodeId(route.params.id)

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

const form = reactive({
  adresse_depot_id: '',
  adresse_recuperation_id: '',
  pays_depart: 'Sénégal',
  ville_depart: 'Dakar',
  pays_destination: 'France',
  ville_destination: 'Paris',
  date_depart: '',
  date_arrivee: '',
  capacite_totale: 20,
  prix_kg: 8500,
  prix_objet: 15000,
  devise: 'XOF',
  description: '',
  statut: 'brouillon'
})

const adressesDepot = ref([])
const adressesRecuperation = ref([])

onMounted(async () => {
  try {
    const [resDepots, resRecups] = await Promise.all([
      fetchAdresseDepots().catch(() => ({ data: [] })),
      fetchAdresseRecuperations().catch(() => ({ data: [] }))
    ])
    adressesDepot.value = resDepots?.data || []
    adressesRecuperation.value = resRecups?.data || []
  } catch (err) {
    // Silent catch
  }

  if (voyageId) {
    try {
      const res = await fetchVoyage(voyageId)
      if (res && res.data) {
        const v = res.data
        form.adresse_depot_id = v.adresse_depot_id || ''
        form.adresse_recuperation_id = v.adresse_recuperation_id || ''
        form.pays_depart = v.pays_depart || 'Sénégal'
        form.ville_depart = v.ville_depart || 'Dakar'
        form.pays_destination = v.pays_destination || 'France'
        form.ville_destination = v.ville_destination || 'Paris'
        form.date_depart = v.date_depart ? v.date_depart.replace(' ', 'T').slice(0, 16) : ''
        form.date_arrivee = v.date_arrivee ? v.date_arrivee.replace(' ', 'T').slice(0, 16) : ''
        form.capacite_totale = v.capacite_totale || 20
        form.prix_kg = v.prix_kg || 8500
        form.prix_objet = v.prix_objet || 15000
        form.devise = v.devise || 'XOF'
        form.description = v.description || ''
        form.statut = v.statut || 'brouillon'
      }
    } catch (err) {
      // Keep default values if fetch fails or mock id used
    }
  }
})

const validate = () => {
  if (!form.ville_depart || !form.ville_destination) {
    showToast('warning', 'Veuillez renseigner les villes de départ et de destination.')
    return false
  }
  if (!form.date_depart || !form.date_arrivee) {
    showToast('warning', 'Veuillez renseigner les dates de départ et d\'arrivée.')
    return false
  }
  if (new Date(form.date_arrivee) <= new Date(form.date_depart)) {
    showToast('warning', 'La date d\'arrivée doit être strictly supérieure à la date de départ.')
    return false
  }
  if (!form.capacite_totale || form.capacite_totale <= 0) {
    showToast('warning', 'La capacité totale doit être supérieure à 0.')
    return false
  }
  return true
}

const formatDateForApi = (dateStr) => {
  if (!dateStr) return null
  return dateStr.replace('T', ' ') + ':00'
}

const saveChanges = async () => {
  if (!validate()) return
  isLoading.value = true

  const payload = {
    adresse_depot_id: form.adresse_depot_id || undefined,
    adresse_recuperation_id: form.adresse_recuperation_id || undefined,
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
    statut: 'brouillon'
  }

  try {
    if (voyageId && voyageId !== 'voy-1' && voyageId !== 'voy-2') {
      await updateVoyage(voyageId, payload)
    }
    showToast('success', t('voyageur.createVoyage.successUpdated'))
    router.push('/voyageur')
  } catch (err) {
    showToast('error', err?.message || 'Erreur lors de la mise à jour.')
  } finally {
    isLoading.value = false
  }
}

const handlePublishVoyage = async () => {
  if (!validate()) return
  isLoading.value = true

  try {
    if (voyageId && voyageId !== 'voy-1' && voyageId !== 'voy-2') {
      await publierVoyage(voyageId)
    }
    showToast('success', t('voyageur.createVoyage.successCreated'))
    router.push('/voyageur')
  } catch (err) {
    showToast('error', err?.message || 'Erreur lors de la publication du voyage.')
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <div class="space-y-6 pb-20 font-sans">
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
      <div>
        <h1 class="text-xl sm:text-2xl font-serif font-bold text-principal-dark dark:text-sky-300">{{ t('voyageur.voyages.editBtn') }}</h1>
        <p class="text-xs sm:text-sm text-gray-500 dark:text-slate-400">{{ t('voyageur.createVoyage.subTitle') }}</p>
      </div>

      <span
        class="self-start sm:self-auto text-xs font-bold px-3 py-1 rounded-full uppercase border"
        :class="form.statut === 'publie' ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800' : 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-800'"
      >
        {{ form.statut === 'publie' ? '✓ ' + t('status.accepted') : '⏳ ' + t('status.draft') }}
      </span>
    </div>

    <div class="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-gray-200 dark:border-slate-800 shadow-sm space-y-5">
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div class="space-y-1.5">
          <label class="block text-xs font-bold text-gray-700 dark:text-slate-300">{{ t('voyageur.createVoyage.departureCity') }}</label>
          <CitySelect v-model="form.ville_depart" :placeholder="t('clientHome.searchDeparture')" />
        </div>

        <div class="space-y-1.5">
          <label class="block text-xs font-bold text-gray-700 dark:text-slate-300">{{ t('voyageur.createVoyage.destinationCity') }}</label>
          <CitySelect v-model="form.ville_destination" :placeholder="t('clientHome.searchArrival')" />
        </div>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div class="space-y-1.5">
          <label class="block text-xs font-bold text-gray-700 dark:text-slate-300">{{ t('voyageur.createVoyage.departureDate') }}</label>
          <input v-model="form.date_depart" type="datetime-local" class="w-full bg-[#F3F4F6] dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-xs text-gray-800 dark:text-slate-100 outline-none" />
        </div>

        <div class="space-y-1.5">
          <label class="block text-xs font-bold text-gray-700 dark:text-slate-300">{{ t('voyageur.createVoyage.arrivalDate') }}</label>
          <input v-model="form.date_arrivee" type="datetime-local" class="w-full bg-[#F3F4F6] dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-xs text-gray-800 dark:text-slate-100 outline-none" />
        </div>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div class="space-y-1.5">
          <label class="block text-xs font-bold text-gray-700 dark:text-slate-300">{{ t('voyageur.createVoyage.totalCapacityKg') }}</label>
          <input v-model.number="form.capacite_totale" type="number" class="w-full bg-[#F3F4F6] dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-xs text-gray-800 dark:text-slate-100 outline-none" />
        </div>

        <div class="space-y-1.5">
          <label class="block text-xs font-bold text-gray-700 dark:text-slate-300">{{ t('voyageur.createVoyage.currency') }}</label>
          <select v-model="form.devise" class="w-full bg-[#F3F4F6] dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-xs font-bold text-gray-800 dark:text-slate-100 outline-none">
            <option value="XOF" class="dark:bg-slate-800 text-slate-100">FCFA (XOF)</option>
            <option value="EUR" class="dark:bg-slate-800 text-slate-100">Euro (€)</option>
            <option value="USD" class="dark:bg-slate-800 text-slate-100">Dollar US ($)</option>
          </select>
        </div>

        <div class="space-y-1.5">
          <label class="block text-xs font-bold text-gray-700 dark:text-slate-300">{{ t('voyageur.createVoyage.pricePerKg') }} ({{ form.devise }})</label>
          <input v-model.number="form.prix_kg" type="number" class="w-full bg-[#F3F4F6] dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-xs text-gray-800 dark:text-slate-100 outline-none" />
        </div>
      </div>

      <div class="space-y-1.5">
        <label class="block text-xs font-bold text-gray-700 dark:text-slate-300">{{ t('voyageur.createVoyage.conditions') }}</label>
        <textarea v-model="form.description" rows="3" class="w-full bg-[#F3F4F6] dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-xs text-gray-800 dark:text-slate-100 outline-none"></textarea>
      </div>

      <div class="border-t border-gray-100 dark:border-slate-800 pt-4 flex items-center justify-between gap-3 flex-wrap">
        <button @click="saveChanges" :disabled="isLoading" type="button" class="px-5 py-3 rounded-xl bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 text-gray-700 dark:text-slate-200 font-bold text-xs cursor-pointer">
          {{ t('status.draft') }}
        </button>

        <button @click="handlePublishVoyage" :disabled="isLoading" type="button" class="bg-[#B50302] hover:bg-[#8B0000] text-white font-extrabold text-xs px-6 py-3 rounded-xl shadow-md cursor-pointer uppercase">
          {{ t('voyageur.createVoyage.submitBtn') }}
        </button>
      </div>
    </div>
  </div>
</template>
