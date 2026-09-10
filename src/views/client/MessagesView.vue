<script setup>
</script>

<template>
  <div class="space-y-4 pb-12">
    <h1 class="text-xl sm:text-2xl font-serif font-bold text-principal-dark">Mes Messages</h1>
    <p class="text-xs sm:text-sm text-gray-500">Échanges sécurisés avec vos transporteurs GP et clients.</p>

    <!-- Empty/Static State Messages List -->
    <div class="bg-white rounded-3xl p-6 border border-gray-200 shadow-sm space-y-4">
      <div class="flex items-center gap-3 p-3 rounded-2xl bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer border border-gray-100">
        <div class="w-12 h-12 rounded-full bg-[#053754] text-white font-bold flex items-center justify-center text-xs shrink-0">
          RGP
        </div>
        <div class="flex-1 min-w-0">
          <div class="flex items-center justify-between">
            <h3 class="text-xs sm:text-sm font-bold text-principal-dark truncate">Rahma Gp Express</h3>
            <span class="text-[10px] text-gray-400 font-medium">10:45</span>
          </div>
          <p class="text-xs text-gray-500 truncate">Bonjour, votre colis est bien enregistré pour le vol du 22 Septembre.</p>
        </div>
      </div>

      <div class="flex items-center gap-3 p-3 rounded-2xl bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer border border-gray-100">
        <div class="w-12 h-12 rounded-full bg-tertiaire text-principal-dark font-bold flex items-center justify-center text-xs shrink-0">
          FN
        </div>
        <div class="flex-1 min-w-0">
          <div class="flex items-center justify-between">
            <h3 class="text-xs sm:text-sm font-bold text-principal-dark truncate">Fatou Ndiaye GP</h3>
            <span class="text-[10px] text-gray-400 font-medium">Hier</span>
          </div>
          <p class="text-xs text-gray-500 truncate">Merci pour votre confiance !</p>
        </div>
      </div>
    </div>
  </div>
</template>
