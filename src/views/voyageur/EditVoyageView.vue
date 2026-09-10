<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import Swal from 'sweetalert2'
import CitySelect from '@/components/client/CitySelect.vue'

const router = useRouter()

const form = reactive({
  ville_depart: 'Dakar',
  ville_destination: 'Paris',
  date_depart: '2026-09-22T10:00',
  date_arrivee: '2026-09-23T06:00',
  capacite_totale: 20,
  prix_kg: 8500,
  prix_objet: 15000,
  adresse_depot: 'Parcelles Assainies, Dakar',
  adresse_retrait: 'Agence Paris 10ème (Gare du Nord)',
  statut: 'brouillon'
})

const saveChanges = () => {
  Swal.fire({
    toast: true,
    position: 'top-end',
    icon: 'success',
    title: 'Modifications enregistrées !',
    showConfirmButton: false,
    timer: 3000
  })
  router.push('/voyageur')
}

const publishVoyage = () => {
  form.statut = 'publie'
  Swal.fire({
    toast: true,
    position: 'top-end',
    icon: 'success',
    title: 'Voyage publié avec succès !',
    showConfirmButton: false,
    timer: 3000
  })
  router.push('/voyageur')
}
</script>

<template>
  <div class="space-y-6 pb-16">
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-xl sm:text-2xl font-serif font-bold text-principal-dark">Modifier le voyage (Brouillon)</h1>
        <p class="text-xs sm:text-sm text-gray-500">Mettez à jour les informations de votre voyage avant publication</p>
      </div>

      <span class="bg-gray-100 text-gray-700 border border-gray-300 text-xs font-bold px-3 py-1 rounded-full uppercase">
        Brouillon
      </span>
    </div>

    <div class="bg-white rounded-3xl p-6 border border-gray-200 shadow-sm space-y-5">
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div class="space-y-1.5">
          <label class="block text-xs font-bold text-gray-700">Ville de Départ</label>
          <CitySelect v-model="form.ville_depart" />
        </div>

        <div class="space-y-1.5">
          <label class="block text-xs font-bold text-gray-700">Ville de Destination</label>
          <CitySelect v-model="form.ville_destination" />
        </div>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div class="space-y-1.5">
          <label class="block text-xs font-bold text-gray-700">Date de départ</label>
          <input v-model="form.date_depart" type="datetime-local" class="w-full bg-[#F3F4F6] border border-gray-200 rounded-xl px-4 py-2.5 text-xs text-gray-800 outline-none" />
        </div>

        <div class="space-y-1.5">
          <label class="block text-xs font-bold text-gray-700">Date d'arrivée</label>
          <input v-model="form.date_arrivee" type="datetime-local" class="w-full bg-[#F3F4F6] border border-gray-200 rounded-xl px-4 py-2.5 text-xs text-gray-800 outline-none" />
        </div>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div class="space-y-1.5">
          <label class="block text-xs font-bold text-gray-700">Capacité Bagages (Kg)</label>
          <input v-model.number="form.capacite_totale" type="number" class="w-full bg-[#F3F4F6] border border-gray-200 rounded-xl px-4 py-2.5 text-xs text-gray-800 outline-none" />
        </div>

        <div class="space-y-1.5">
          <label class="block text-xs font-bold text-gray-700">Prix au Kg (F CFA)</label>
          <input v-model.number="form.prix_kg" type="number" class="w-full bg-[#F3F4F6] border border-gray-200 rounded-xl px-4 py-2.5 text-xs text-gray-800 outline-none" />
        </div>
      </div>

      <div class="border-t border-gray-100 pt-4 flex items-center justify-between gap-3">
        <button @click="saveChanges" type="button" class="px-5 py-3 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs cursor-pointer">
          Enregistrer en brouillon
        </button>

        <button @click="publishVoyage" type="button" class="bg-[#B50302] hover:bg-[#8B0000] text-white font-extrabold text-xs px-6 py-3 rounded-xl shadow-md cursor-pointer uppercase">
          PUBLIER LE VOYAGE
        </button>
      </div>
    </div>
  </div>
</template>
