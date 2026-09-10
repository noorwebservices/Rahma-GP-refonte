<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import Swal from 'sweetalert2'

const router = useRouter()

const demande = ref({
  id: 1,
  code: '#RS-7729',
  clientName: 'Mariama Diallo',
  clientPhone: '+33 7 23 34 56 78',
  routeFrom: 'Dakar',
  flagFrom: '🇸🇳',
  routeTo: 'Paris',
  flagTo: '🇫🇷',
  departureDate: '22 Septembre 2026',
  parcelType: 'Vêtements & tissus',
  weight: '6Kg',
  estimatedValue: '75 000 F CFA',
  price: '51 000 F CFA',
  recipientName: 'Mariama Diallo',
  recipientPhone: '+33 7 23 34 56 78',
  recipientAddress: '14 Boulevard Voltaire, 75011 Paris',
  paymentMode: 'Wave Mobile Money (Paiement immédiat)',
  status: 'pending'
})

const acceptDemande = () => {
  demande.value.status = 'accepted'
  Swal.fire({
    toast: true,
    position: 'top-end',
    icon: 'success',
    title: `La réservation ${demande.value.code} a été acceptée avec succès !`,
    showConfirmButton: false,
    timer: 3000
  })
}

const refuseDemande = () => {
  demande.value.status = 'refused'
  Swal.fire({
    toast: true,
    position: 'top-end',
    icon: 'info',
    title: `La réservation ${demande.value.code} a été refusée.`,
    showConfirmButton: false,
    timer: 3000
  })
}

const goToChat = () => {
  router.push(`/voyageur/messages/${demande.value.id}`)
}
</script>

<template>
  <div class="space-y-5 pb-16">
    <!-- Top Header Info (Aligned for Mobile & Desktop) -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 sm:p-5 rounded-2xl border border-gray-200 shadow-2xs">
      <div class="space-y-0.5">
        <div class="flex items-center gap-2">
          <h1 class="text-lg sm:text-xl font-serif font-bold text-principal-dark">Détails de la demande</h1>
          <span class="font-extrabold text-[#074C72] text-xs bg-sky-50 px-2.5 py-0.5 rounded-full border border-sky-100">
            {{ demande.code }}
          </span>
        </div>
        <p class="text-xs text-gray-500">Examinez le colis et le destinataire avant de valider la réservation</p>
      </div>

      <div class="self-start sm:self-auto shrink-0">
        <span
          class="text-[11px] font-extrabold px-3.5 py-1 rounded-full border uppercase tracking-wider inline-block"
          :class="{
            'bg-amber-50 text-amber-700 border-amber-300': demande.status === 'pending',
            'bg-emerald-50 text-emerald-700 border-emerald-200': demande.status === 'accepted',
            'bg-red-50 text-red-700 border-red-200': demande.status === 'refused'
          }"
        >
          {{ demande.status === 'pending' ? '⏳ En attente' : demande.status === 'accepted' ? '✓ Acceptée' : '✕ Refusée' }}
        </span>
      </div>
    </div>

    <!-- Main Detail Card Container -->
    <div class="bg-white rounded-3xl p-5 sm:p-6 border border-gray-200 shadow-sm space-y-6">
      
      <!-- Client Identity Banner (Mobile Responsive) -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 pb-4">
        <div class="flex items-center gap-3">
          <div class="w-12 h-12 rounded-full bg-[#B50302] text-white font-extrabold text-sm flex items-center justify-center shrink-0">
            MD
          </div>
          <div>
            <h3 class="text-base font-extrabold text-gray-900 leading-tight">{{ demande.clientName }}</h3>
            <p class="text-xs text-gray-500 font-mono">{{ demande.clientPhone }}</p>
          </div>
        </div>

        <button
          @click="goToChat"
          type="button"
          class="w-full sm:w-auto bg-sky-50 text-[#074C72] border border-sky-200 hover:bg-sky-100 font-extrabold text-xs px-4 py-2.5 rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-1.5"
        >
          <span>💬</span> DISCUTER AVEC LE CLIENT
        </button>
      </div>

      <!-- Parcel Description & Image Card -->
      <div class="space-y-3">
        <h4 class="text-xs font-extrabold text-gray-400 uppercase tracking-wider">Détails du colis</h4>
        
        <div class="bg-gray-50 rounded-2xl p-4 border border-gray-200/80 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs sm:text-sm">
          <div class="space-y-2">
            <div>
              <span class="text-gray-400 font-medium block">Type de contenu :</span>
              <span class="font-extrabold text-[#053754] text-sm sm:text-base">{{ demande.parcelType }}</span>
            </div>
            <div>
              <span class="text-gray-400 font-medium block">Poids estimé :</span>
              <span class="font-extrabold text-gray-800 text-sm">{{ demande.weight }}</span>
            </div>
            <div>
              <span class="text-gray-400 font-medium block">Valeur estimée du colis :</span>
              <span class="font-extrabold text-[#B50302] text-sm">{{ demande.estimatedValue }}</span>
            </div>
            <div>
              <span class="text-gray-400 font-medium block">Mode de paiement souhaité :</span>
              <span class="font-bold text-sky-700">{{ demande.paymentMode }}</span>
            </div>
          </div>

          <!-- Photo du colis thumbnail -->
          <div class="space-y-1.5">
            <span class="text-gray-400 font-medium block">Photo du colis :</span>
            <div class="w-full h-36 rounded-xl border border-gray-300 bg-white flex items-center justify-center text-center p-3">
              <div>
                <span class="text-4xl">📦</span>
                <p class="text-xs text-gray-500 font-semibold mt-1">Photo téléversée par le client</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Recipient Information Card -->
      <div class="space-y-3 pt-2">
        <h4 class="text-xs font-extrabold text-gray-400 uppercase tracking-wider">Informations du Destinataire</h4>

        <div class="bg-white border-2 border-red-200 rounded-2xl p-4 space-y-1.5 shadow-2xs">
          <div class="font-extrabold text-gray-900 text-sm sm:text-base">{{ demande.recipientName }}</div>
          <div class="text-xs font-mono font-semibold text-gray-600">{{ demande.recipientPhone }}</div>
          <div class="text-xs text-gray-500 font-medium">{{ demande.recipientAddress }}</div>
        </div>
      </div>

      <!-- Price & Action CTA Row -->
      <div class="border-t border-gray-100 pt-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span class="text-xs text-gray-400 font-medium block">Prix total du transport :</span>
          <span class="font-black text-[#053754] text-xl sm:text-2xl">{{ demande.price }}</span>
        </div>

        <div v-if="demande.status === 'pending'" class="flex items-center gap-3">
          <button
            @click="refuseDemande"
            type="button"
            class="flex-1 sm:flex-none px-5 py-3 rounded-xl bg-red-50 text-[#B50302] border border-red-200 font-extrabold text-xs hover:bg-red-100 transition-colors cursor-pointer"
          >
            REFUSER
          </button>

          <button
            @click="acceptDemande"
            type="button"
            class="flex-1 sm:flex-none bg-[#053754] hover:bg-[#074C72] text-white font-extrabold text-xs sm:text-sm py-3.5 px-6 rounded-xl shadow-lg transition-all cursor-pointer uppercase tracking-wider active:scale-[0.99]"
          >
            ✓ ACCEPTER LA RÉSERVATION
          </button>
        </div>
      </div>

    </div>
  </div>
</template>
