<script setup>
import { ref } from 'vue'

const evaluations = ref([
  {
    id: 1,
    clientName: 'Mariama Diallo',
    avatar: 'MD',
    date: '24 Août 2026',
    note: 5,
    commentaire: 'Transporteur très ponctuel et réactif ! Mon colis est arrivé en parfait état à Paris Gare du Nord. Je recommande vivement.'
  },
  {
    id: 2,
    clientName: 'Ousmane Sow',
    avatar: 'OS',
    date: '12 Août 2026',
    note: 5,
    commentaire: 'Excellente communication sur WhatsApp et la plateforme. Dépôt facile aux Parcelles Assainies.'
  },
  {
    id: 3,
    clientName: 'Fatou Ndiaye',
    avatar: 'FN',
    date: '02 Juillet 2026',
    note: 4,
    commentaire: 'Très satisfaite du service GP, remis dans les temps.'
  }
])
</script>

<template>
  <div class="space-y-6 pb-16">
    <!-- Header Title -->
    <div class="space-y-1">
      <h1 class="text-xl sm:text-2xl font-serif font-bold text-principal-dark">Avis & Évaluations</h1>
      <p class="text-xs sm:text-sm text-gray-500">Découvrez ce que les clients pensent de vos services de transport GP</p>
    </div>

    <!-- Rating Summary Banner Card -->
    <div class="bg-[#053754] text-white rounded-3xl p-6 shadow-md flex flex-col sm:flex-row items-center justify-between gap-6">
      <div class="text-center sm:text-left space-y-1">
        <span class="text-xs text-sky-200 uppercase font-extrabold tracking-wider">Note globale Voyageur</span>
        <div class="flex items-center justify-center sm:justify-start gap-3">
          <span class="text-4xl sm:text-5xl font-black text-amber-400">4.9</span>
          <div class="space-y-0.5">
            <div class="text-amber-400 text-lg">⭐⭐⭐⭐⭐</div>
            <p class="text-xs text-sky-200 font-semibold">Basé sur 32 avis vérifiés</p>
          </div>
        </div>
      </div>

      <div class="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/10 text-xs space-y-1.5 w-full sm:max-w-xs">
        <div class="flex items-center justify-between text-sky-100">
          <span>5 étoiles</span>
          <div class="w-32 bg-white/20 h-2 rounded-full overflow-hidden">
            <div class="bg-amber-400 h-full w-[90%]"></div>
          </div>
          <span>90%</span>
        </div>
        <div class="flex items-center justify-between text-sky-100">
          <span>4 étoiles</span>
          <div class="w-32 bg-white/20 h-2 rounded-full overflow-hidden">
            <div class="bg-amber-400 h-full w-[10%]"></div>
          </div>
          <span>10%</span>
        </div>
      </div>
    </div>

    <!-- Reviews List -->
    <div class="space-y-4">
      <h3 class="text-base font-extrabold text-[#053754]">Derniers avis clients</h3>

      <div class="space-y-3">
        <div
          v-for="evalItem in evaluations"
          :key="evalItem.id"
          class="bg-white rounded-2xl p-5 border border-gray-200 shadow-2xs space-y-3"
        >
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-full bg-[#B50302] text-white font-extrabold text-xs flex items-center justify-center">
                {{ evalItem.avatar }}
              </div>
              <div>
                <h4 class="text-sm font-extrabold text-gray-900">{{ evalItem.clientName }}</h4>
                <p class="text-[11px] text-gray-400 font-medium">{{ evalItem.date }}</p>
              </div>
            </div>

            <div class="text-amber-500 font-bold text-sm">
              {{ '⭐'.repeat(evalItem.note) }}
            </div>
          </div>

          <p class="text-xs sm:text-sm text-gray-600 leading-relaxed italic">
            "{{ evalItem.commentaire }}"
          </p>
        </div>
      </div>
    </div>
  </div>
</template>
