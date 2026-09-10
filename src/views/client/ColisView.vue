<script setup>
</script>

<template>
  <div class="space-y-4 pb-12">
    <h1 class="text-xl sm:text-2xl font-serif font-bold text-principal-dark">Mes Colis & Envois</h1>
    <p class="text-xs sm:text-sm text-gray-500">Suivez l'état de vos réservations et livraisons en cours.</p>

    <!-- Statut Tabs Filter -->
    <div class="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
      <button class="px-4 py-2 rounded-full bg-[#053754] text-white text-xs font-bold shadow-2xs">
        En cours (1)
      </button>
      <button class="px-4 py-2 rounded-full bg-white text-gray-600 border border-gray-200 text-xs font-bold">
        Livrées (3)
      </button>
    </div>

    <!-- Active Parcel Card -->
    <div class="bg-white rounded-3xl p-5 border border-gray-200 shadow-sm space-y-4">
      <div class="flex items-center justify-between border-b border-gray-100 pb-3">
        <div>
          <span class="text-[10px] font-extrabold uppercase text-gray-400">N° Suivi : #RGP-2026-984</span>
          <h3 class="text-sm font-bold text-principal-dark">Dakar ➔ Paris</h3>
        </div>
        <span class="bg-amber-100 text-amber-800 text-[11px] font-extrabold px-3 py-1 rounded-full">
          En préparation
        </span>
      </div>

      <div class="flex items-center justify-between text-xs text-gray-600">
        <div>
          <span class="text-gray-400 block font-medium">Contenu :</span>
          <span class="font-bold text-gray-800">Vêtements & tissus (6kg)</span>
        </div>
        <div class="text-right">
          <span class="text-gray-400 block font-medium">Transporteur :</span>
          <span class="font-bold text-principal-dark">Rahma Gp Express</span>
        </div>
      </div>

      <div class="pt-2 flex justify-end">
        <button class="px-4 py-2 rounded-xl bg-red-50 text-[#BD0A0A] font-bold text-xs hover:bg-red-100 transition-colors">
          Voir les détails de l'envoi
        </button>
      </div>
    </div>
  </div>
</template>
