<script setup>
import { ref } from 'vue'

const selectedTransaction = ref(null)
const showDetailModal = ref(false)

const revenus = ref([
  {
    id: 1,
    code: '#RS-7729',
    client: 'Mariama Diallo',
    telephone: '+33 7 23 34 56 78',
    route: 'Dakar ➔ Paris',
    date: '23 Septembre 2026',
    datePaiement: '23 Sept. 2026 à 14:35',
    montant: '51 000 F CFA',
    poids: '6 Kg',
    tarifKg: '8 500 F CFA / Kg',
    colisType: 'Vêtements & tissus',
    modePaiement: 'Wave Mobile Money',
    statut: 'disponible',
    commission: '0 F CFA (0%)',
    netGain: '51 000 F CFA'
  },
  {
    id: 2,
    code: '#RS-6640',
    client: 'Abdoulaye Faye',
    telephone: '+221 77 654 32 10',
    route: 'Dakar ➔ Paris',
    date: '15 Septembre 2026',
    datePaiement: '15 Sept. 2026 à 18:20',
    montant: '85 000 F CFA',
    poids: '10 Kg',
    tarifKg: '8 500 F CFA / Kg',
    colisType: 'Électronique & Accessoires',
    modePaiement: 'Orange Money',
    statut: 'disponible',
    commission: '0 F CFA (0%)',
    netGain: '85 000 F CFA'
  },
  {
    id: 3,
    code: '#RS-5510',
    client: 'Aïssatou Ba',
    telephone: '+33 6 12 34 56 78',
    route: 'Dakar ➔ Paris',
    date: '22 Septembre 2026',
    datePaiement: 'En attente de livraison',
    montant: '34 000 F CFA',
    poids: '4 Kg',
    tarifKg: '8 500 F CFA / Kg',
    colisType: 'Documents & Cosmétiques',
    modePaiement: 'Wave Mobile Money',
    statut: 'en_attente',
    commission: '0 F CFA (0%)',
    netGain: '34 000 F CFA'
  }
])

const openDetail = (rev) => {
  selectedTransaction.value = rev
  showDetailModal.value = true
}

const closeDetail = () => {
  showDetailModal.value = false
  selectedTransaction.value = null
}
</script>

<template>
  <div class="space-y-6 pb-20 font-sans">
    <!-- Header Title (Superposed vertical layout for title and subtitle) -->
    <div class="space-y-1">
      <h1 class="text-xl sm:text-2xl font-serif font-bold text-principal-dark">Mes revenus GP</h1>
      <p class="text-xs sm:text-sm text-gray-500 leading-snug">Suivez l'historique des gains générés par le transport de vos colis</p>
    </div>

    <!-- Revenue Summary Metric Cards -->
    <div class="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
      <!-- Total -->
      <div class="bg-[#053754] text-white rounded-3xl p-4 sm:p-5 shadow-md space-y-1 relative overflow-hidden">
        <span class="text-[11px] sm:text-xs font-bold text-sky-200 uppercase tracking-wider block">Total Revenus Générés</span>
        <div class="text-xl sm:text-2xl font-black text-white">170 000 F CFA</div>
        <p class="text-[10px] sm:text-[11px] text-sky-300">Sur 3 réservations transportées</p>
      </div>

      <!-- Disponibles -->
      <div class="bg-white rounded-3xl p-4 sm:p-5 border border-emerald-200 shadow-2xs space-y-1">
        <span class="text-[11px] sm:text-xs font-bold text-emerald-600 uppercase tracking-wider block">Revenus Disponibles</span>
        <div class="text-xl sm:text-2xl font-black text-emerald-800">136 000 F CFA</div>
        <p class="text-[10px] sm:text-[11px] text-emerald-600 font-semibold">Paiements validés & reçus</p>
      </div>

      <!-- En attente -->
      <div class="bg-white rounded-3xl p-4 sm:p-5 border border-amber-200 shadow-2xs space-y-1">
        <span class="text-[11px] sm:text-xs font-bold text-amber-600 uppercase tracking-wider block">Revenus en Attente</span>
        <div class="text-xl sm:text-2xl font-black text-amber-800">34 000 F CFA</div>
        <p class="text-[10px] sm:text-[11px] text-amber-600 font-semibold">Colis en cours de livraison</p>
      </div>
    </div>

    <!-- Earnings History List Card -->
    <div class="bg-white rounded-3xl p-5 sm:p-6 border border-gray-200 shadow-sm space-y-4">
      <!-- Vertically stacked Header and Subtitle on Mobile -->
      <div class="flex flex-col gap-0.5">
        <h3 class="text-base font-extrabold text-[#053754]">Historique des transactions</h3>
        <p class="text-xs text-gray-400 font-medium">Cliquez sur une ligne pour voir les détails</p>
      </div>

      <!-- Simplified Clean List -->
      <div class="divide-y divide-gray-100">
        <div
          v-for="rev in revenus"
          :key="rev.id"
          @click="openDetail(rev)"
          class="py-3.5 flex items-center justify-between gap-3 first:pt-0 last:pb-0 cursor-pointer hover:bg-slate-50 -mx-1 px-2 rounded-2xl transition-all"
        >
          <!-- Left side: Code, Client & Route -->
          <div class="min-w-0 space-y-0.5">
            <div class="flex items-center gap-1.5 flex-wrap">
              <span class="font-extrabold text-[#053754] text-xs sm:text-sm">{{ rev.code }}</span>
              <span class="text-xs text-gray-500 font-medium truncate">• {{ rev.client }}</span>
            </div>
            <p class="text-[11px] text-gray-400 font-medium truncate">
              {{ rev.route }}
            </p>
          </div>

          <!-- Right side: Montant, Badge & Eye Icon -->
          <div class="flex items-center gap-2 sm:gap-3 shrink-0">
            <div class="text-right">
              <div class="font-black text-xs sm:text-sm text-gray-900">{{ rev.montant }}</div>
              <span
                class="inline-block text-[9px] sm:text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase"
                :class="rev.statut === 'disponible' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'"
              >
                {{ rev.statut === 'disponible' ? '✓ DISPONIBLE' : '⏳ EN ATTENTE' }}
              </span>
            </div>

            <!-- Eye Icon Button -->
            <button
              @click.stop="openDetail(rev)"
              class="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-slate-100 hover:bg-principal/10 text-slate-600 hover:text-principal flex items-center justify-center transition-all cursor-pointer"
              title="Voir les détails"
            >
              <svg class="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Detail Transaction Modal (Clean & Vertically Aligned) -->
    <div
      v-if="showDetailModal && selectedTransaction"
      class="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4"
    >
      <div class="bg-white w-full max-w-lg rounded-3xl p-5 sm:p-7 shadow-2xl space-y-5 max-h-[85vh] overflow-y-auto font-sans">
        
        <!-- Modal Header -->
        <div class="flex items-center justify-between border-b border-gray-100 pb-3">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-2xl bg-[#053754]/10 text-[#053754] font-black text-xs flex items-center justify-center shrink-0">
              GP
            </div>
            <div>
              <div class="flex items-center gap-2 flex-wrap">
                <h3 class="text-base sm:text-lg font-bold text-[#053754] font-serif">{{ selectedTransaction.code }}</h3>
                <span
                  class="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase"
                  :class="selectedTransaction.statut === 'disponible' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'"
                >
                  {{ selectedTransaction.statut === 'disponible' ? '✓ DISPONIBLE' : '⏳ EN ATTENTE' }}
                </span>
              </div>
              <p class="text-xs text-gray-500">Détails de la transaction financière</p>
            </div>
          </div>
          <button @click="closeDetail" class="text-gray-400 hover:text-gray-600 p-1.5 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <!-- Client & Trajet (Vertical Clean Stack) -->
        <div class="bg-slate-50 p-4 rounded-2xl space-y-3 border border-slate-100 text-xs">
          <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 pb-2 border-b border-slate-200/60">
            <span class="text-gray-500 font-semibold">Expéditeur / Client</span>
            <span class="font-extrabold text-gray-900 sm:text-right">{{ selectedTransaction.client }} <span class="text-gray-500 font-normal">({{ selectedTransaction.telephone }})</span></span>
          </div>
          <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 pb-2 border-b border-slate-200/60">
            <span class="text-gray-500 font-semibold">Trajet du voyage</span>
            <span class="font-extrabold text-gray-900 sm:text-right">{{ selectedTransaction.route }}</span>
          </div>
          <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
            <span class="text-gray-500 font-semibold">Date du transfert</span>
            <span class="font-extrabold text-gray-900 sm:text-right">{{ selectedTransaction.date }}</span>
          </div>
        </div>

        <!-- Caractéristiques du Colis (Grid) -->
        <div class="space-y-2">
          <h4 class="text-xs font-extrabold text-[#053754] uppercase tracking-wider">Caractéristiques du colis</h4>
          <div class="grid grid-cols-2 gap-3 text-xs">
            <div class="bg-slate-50 p-3 rounded-2xl border border-slate-100 space-y-0.5">
              <span class="text-gray-400 block text-[11px] font-medium">Contenu</span>
              <span class="font-extrabold text-gray-800 leading-tight block">{{ selectedTransaction.colisType }}</span>
            </div>
            <div class="bg-slate-50 p-3 rounded-2xl border border-slate-100 space-y-0.5">
              <span class="text-gray-400 block text-[11px] font-medium">Poids réservé</span>
              <span class="font-extrabold text-gray-800 leading-tight block">{{ selectedTransaction.poids }}</span>
            </div>
          </div>
        </div>

        <!-- Décompte Financier (Vertical Clean Stack) -->
        <div class="space-y-2">
          <h4 class="text-xs font-extrabold text-[#053754] uppercase tracking-wider">Décompte financier</h4>
          <div class="bg-slate-50 border border-slate-100 rounded-2xl p-4 text-xs space-y-3">
            <div class="flex justify-between items-center pb-2 border-b border-slate-200/60">
              <span class="text-gray-500 font-medium">Tarif unitaire / Kg</span>
              <span class="font-bold text-gray-800">{{ selectedTransaction.tarifKg }}</span>
            </div>
            <div class="flex justify-between items-center pb-2 border-b border-slate-200/60">
              <span class="text-gray-500 font-medium">Sous-total transport</span>
              <span class="font-bold text-gray-800">{{ selectedTransaction.montant }}</span>
            </div>
            <div class="flex justify-between items-center pb-2 border-b border-slate-200/60">
              <span class="text-gray-500 font-medium">Commission Rahma GP</span>
              <span class="font-bold text-emerald-600">{{ selectedTransaction.commission }}</span>
            </div>
            <div class="flex justify-between items-center pt-1 text-sm font-black text-[#053754]">
              <span>Gain Net Voyageur</span>
              <span class="text-emerald-700 text-base font-black">{{ selectedTransaction.netGain }}</span>
            </div>
          </div>
        </div>

        <!-- Mode de Versement Card -->
        <div class="bg-emerald-50/80 p-4 rounded-2xl border border-emerald-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
          <div>
            <span class="text-emerald-900 font-extrabold block">Mode de versement</span>
            <span class="text-emerald-700 text-[11px] font-medium">{{ selectedTransaction.modePaiement }}</span>
          </div>
          <span class="text-[11px] text-emerald-800 font-semibold">{{ selectedTransaction.datePaiement }}</span>
        </div>

        <!-- Action Button -->
        <div class="pt-2 flex justify-end">
          <button
            @click="closeDetail"
            class="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-[#053754] text-white font-bold text-xs hover:bg-[#074C72] transition-colors cursor-pointer"
          >
            Fermer
          </button>
        </div>

      </div>
    </div>
  </div>
</template>
