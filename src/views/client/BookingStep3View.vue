<script setup>
import { useRouter } from 'vue-router'
import BookingProgressBar from '@/components/client/BookingProgressBar.vue'

const router = useRouter()

const handlePayment = () => {
  alert('Redirection vers le système de paiement sécurisé (Wave, Orange Money, Carte)...')
}
</script>

<template>
  <div class="space-y-6 pb-12">
    <!-- Progress Bar Step 3 -->
    <BookingProgressBar
      :step="3"
      :totalSteps="4"
      title="Récapitulatif"
      subtitle="Récapitulatif"
    />

    <!-- Summary Content Card -->
    <div class="bg-white rounded-3xl p-6 border border-gray-200 shadow-sm space-y-5">
      
      <!-- Type de colis -->
      <div class="flex items-center justify-between">
        <span class="text-xs font-bold text-gray-500">Type de colis :</span>
        <div class="bg-gray-50 border border-gray-200 px-4 py-2 rounded-2xl flex items-center gap-2 font-bold text-xs text-principal-dark shadow-2xs">
          <span>👗</span>
          <span>Vêtements & tissus</span>
        </div>
      </div>

      <!-- Photo du colis -->
      <div class="space-y-2">
        <span class="text-xs font-bold text-gray-500 block">Photo du colis :</span>
        <div class="w-full h-44 rounded-2xl overflow-hidden border border-gray-200 bg-gray-100 flex items-center justify-center relative">
          <!-- Realistic box with folded clothes preview or icon -->
          <div class="text-center p-4">
            <span class="text-5xl">📦</span>
            <p class="text-xs text-gray-500 font-semibold mt-2">Photo du colis importée</p>
          </div>
        </div>
      </div>

      <!-- Detail rows -->
      <div class="space-y-3 pt-2 border-t border-gray-100 text-xs sm:text-sm">
        <div class="flex items-center justify-between">
          <span class="text-gray-500 font-medium">Valeur estimée du colis(CFA) :</span>
          <span class="font-extrabold text-[#BD0A0A] text-sm sm:text-base">75 000 FCFA</span>
        </div>

        <div class="flex items-center justify-between">
          <span class="text-gray-500 font-medium">Poids estimée(Kg) :</span>
          <span class="font-extrabold text-principal-dark text-sm sm:text-base">6kg</span>
        </div>

        <div class="flex items-center justify-between">
          <span class="text-gray-500 font-medium">Prix du voyage :</span>
          <span class="font-black text-[#BD0A0A] text-base sm:text-lg">51 000 F CFA</span>
        </div>
      </div>

      <!-- Destinataire Card -->
      <div class="space-y-2 pt-2 border-t border-gray-100">
        <span class="text-xs font-bold text-gray-500 block">Destinataire :</span>
        <div class="bg-white border-2 border-red-200 rounded-2xl p-4 space-y-1 shadow-2xs">
          <div class="font-extrabold text-gray-800 text-sm sm:text-base">Mariama Diallo</div>
          <div class="text-xs font-mono font-semibold text-gray-600">+33 7 23 34 56 78</div>
          <div class="text-xs text-gray-500 font-medium">14 Boulevard Voltaire, 75011 Paris</div>
        </div>
      </div>

    </div>

    <!-- Submit Payment CTA -->
    <button
      @click="handlePayment"
      type="button"
      class="w-full bg-[#BD0A0A] hover:bg-[#a00808] text-white font-extrabold text-sm py-4 rounded-2xl shadow-xl transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99]"
    >
      <span>CONTINUER VERS LE PAIEMENT</span>
    </button>

  </div>
</template>
