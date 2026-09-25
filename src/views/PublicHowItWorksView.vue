<script setup>
import { RouterLink } from 'vue-router'
import PublicHeader from '@/components/public/PublicHeader.vue'

const etapesClient = [
  { n: 1, t: 'Trouvez un voyage', d: 'Parcourez les voyages disponibles et choisissez le trajet qui correspond à votre destination et à votre date.' },
  { n: 2, t: 'Réservez et payez en ligne', d: 'Indiquez le poids et le contenu de votre colis, puis réglez de manière sécurisée. Le montant est calculé au kilo.' },
  { n: 3, t: 'Déposez votre colis', d: "Remettez votre colis au point de dépôt convenu, ou au voyageur, avant la date de départ." },
  { n: 4, t: 'Suivez la livraison', d: 'Suivez votre colis en temps réel jusqu’à sa remise au destinataire, avec un numéro de suivi.' },
]

const etapesGp = [
  { n: 1, t: 'Créez votre compte GP', d: 'Inscrivez-vous comme voyageur et faites vérifier votre identité par notre équipe pour inspirer confiance.' },
  { n: 2, t: 'Publiez votre voyage', d: 'Renseignez votre trajet, vos dates, la capacité disponible (kg) et votre prix au kilo.' },
  { n: 3, t: 'Acceptez les réservations', d: 'Recevez les demandes des expéditeurs, échangez avec eux et acceptez celles qui vous conviennent.' },
  { n: 4, t: 'Recevez vos revenus', d: 'Transportez les colis et percevez vos gains : rentabilisez vos trajets en toute simplicité.' },
]
</script>

<template>
  <div class="min-h-screen bg-gray-50 dark:bg-slate-950">
    <PublicHeader />

    <main class="max-w-4xl mx-auto px-4 py-10 space-y-10">
      <section class="text-center space-y-3">
        <h1 class="text-3xl sm:text-4xl font-black text-[#053754] dark:text-white">Comment ça marche ?</h1>
        <p class="text-gray-500 dark:text-slate-400 max-w-2xl mx-auto">
          Rahma Delivery met en relation les personnes qui veulent <strong>envoyer un colis</strong> avec des
          <strong>voyageurs de confiance (GP)</strong> qui disposent de place dans leurs bagages. Simple, rapide et économique.
        </p>
      </section>

      <!-- Côté expéditeur -->
      <section>
        <h2 class="text-xl font-black text-[#053754] dark:text-sky-300 mb-4">📦 Envoyer un colis</h2>
        <div class="grid gap-4 sm:grid-cols-2">
          <div v-for="e in etapesClient" :key="e.n" class="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-2xl p-5 shadow-2xs">
            <div class="w-9 h-9 rounded-full bg-[#053754] text-white flex items-center justify-center font-black mb-3">{{ e.n }}</div>
            <h3 class="font-extrabold text-gray-800 dark:text-slate-100 mb-1">{{ e.t }}</h3>
            <p class="text-sm text-gray-500 dark:text-slate-400">{{ e.d }}</p>
          </div>
        </div>
        <div class="mt-4 text-center">
          <RouterLink to="/voyages" class="inline-block bg-[#B50302] hover:bg-[#870202] text-white text-sm font-extrabold uppercase tracking-wider px-6 py-3 rounded-2xl transition">
            Voir les voyages disponibles
          </RouterLink>
        </div>
      </section>

      <!-- Côté voyageur -->
      <section>
        <h2 class="text-xl font-black text-[#053754] dark:text-sky-300 mb-4">✈️ Devenir voyageur (GP)</h2>
        <div class="grid gap-4 sm:grid-cols-2">
          <div v-for="e in etapesGp" :key="e.n" class="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-2xl p-5 shadow-2xs">
            <div class="w-9 h-9 rounded-full bg-sky-600 text-white flex items-center justify-center font-black mb-3">{{ e.n }}</div>
            <h3 class="font-extrabold text-gray-800 dark:text-slate-100 mb-1">{{ e.t }}</h3>
            <p class="text-sm text-gray-500 dark:text-slate-400">{{ e.d }}</p>
          </div>
        </div>
        <div class="mt-4 text-center">
          <RouterLink to="/auth/register" class="inline-block bg-[#053754] hover:bg-[#074C72] text-white text-sm font-extrabold uppercase tracking-wider px-6 py-3 rounded-2xl transition">
            Créer un compte voyageur
          </RouterLink>
        </div>
      </section>

      <p class="text-center text-sm text-gray-500 dark:text-slate-400">
        Une question ? Consultez la <RouterLink to="/faq" class="text-[#B50302] font-bold hover:underline">FAQ</RouterLink>.
      </p>
    </main>
  </div>
</template>
