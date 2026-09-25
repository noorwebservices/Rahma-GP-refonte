<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { RouterLink } from 'vue-router'
import PublicHeader from '@/components/public/PublicHeader.vue'

const faqs = [
  {
    q: "Qu'est-ce qu'un GP (voyageur) sur Rahma Delivery ?",
    r: "Un GP est un voyageur de confiance qui dispose de place dans ses bagages et accepte d'acheminer les colis d'autres personnes lors de ses trajets, en échange d'une rémunération au kilo. Rahma Delivery met en relation ces voyageurs avec les expéditeurs.",
  },
  {
    q: 'Comment envoyer un colis avec Rahma Delivery ?',
    r: "Recherchez un voyage correspondant à votre destination, réservez en indiquant le poids et le contenu de votre colis, payez en ligne de façon sécurisée, déposez votre colis, puis suivez la livraison en temps réel jusqu'au destinataire.",
  },
  {
    q: "Combien coûte l'envoi d'un colis ?",
    r: "Le prix est fixé par chaque voyageur, généralement au kilo (par exemple en euros pour un trajet Europe-Afrique ou en francs CFA pour un trajet local). Le montant total s'affiche avant de valider la réservation, sans frais cachés.",
  },
  {
    q: 'Le paiement est-il sécurisé ?',
    r: 'Oui. Le paiement se fait en ligne via des moyens sécurisés. Le montant est associé à votre réservation et le suivi permet de garantir le bon déroulement de la livraison.',
  },
  {
    q: 'Comment devenir voyageur (GP) et gagner de l\'argent ?',
    r: "Créez un compte voyageur, faites vérifier votre identité, puis publiez vos voyages (trajet, dates, capacité disponible et prix au kilo). Vous recevez les demandes des expéditeurs, acceptez celles qui vous conviennent et percevez vos revenus.",
  },
  {
    q: 'Les voyageurs sont-ils vérifiés ?',
    r: "Oui. Chaque voyageur doit fournir une pièce d'identité qui est vérifiée par notre équipe avant qu'il puisse être pleinement actif. Les expéditeurs peuvent aussi consulter les notes et avis laissés par la communauté.",
  },
  {
    q: 'Comment suivre mon colis ?',
    r: "Après la réservation, un numéro de suivi vous permet de connaître à tout moment l'état de votre colis, du dépôt jusqu'à sa remise au destinataire.",
  },
  {
    q: 'Quels objets sont interdits au transport ?',
    r: "Les objets dangereux ou illégaux sont interdits (armes, produits inflammables, batteries au lithium non scellées, substances illicites, etc.). Chaque annonce de voyage précise les objets autorisés et interdits par le voyageur.",
  },
  {
    q: 'Dans quels pays Rahma Delivery est-il disponible ?',
    r: "Rahma Delivery est pensé pour connecter la diaspora et l'Afrique, avec de nombreux trajets internationaux (par exemple France-Sénégal) et régionaux (par exemple Dakar-Abidjan). De nouveaux trajets sont publiés régulièrement par les voyageurs.",
  },
  {
    q: 'Que faire en cas de problème avec une livraison ?',
    r: "Vous pouvez contacter directement le voyageur via la messagerie de la plateforme, et signaler tout problème à notre équipe qui interviendra pour vous accompagner.",
  },
]

const open = ref(0)
function toggle(i) {
  open.value = open.value === i ? -1 : i
}

// Données structurées FAQPage (schema.org) pour Google et les IA.
let scriptEl = null
onMounted(() => {
  try {
    const data = {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: faqs.map((f) => ({
        '@type': 'Question',
        name: f.q,
        acceptedAnswer: { '@type': 'Answer', text: f.r },
      })),
    }
    scriptEl = document.createElement('script')
    scriptEl.type = 'application/ld+json'
    scriptEl.id = 'faq-jsonld'
    scriptEl.textContent = JSON.stringify(data)
    document.head.appendChild(scriptEl)
  } catch {
    /* noop */
  }
})
onUnmounted(() => {
  if (scriptEl && scriptEl.parentNode) {
    scriptEl.parentNode.removeChild(scriptEl)
  }
})
</script>

<template>
  <div class="min-h-screen bg-gray-50 dark:bg-slate-950">
    <PublicHeader />

    <main class="max-w-3xl mx-auto px-4 py-10 space-y-6">
      <section class="text-center space-y-2">
        <h1 class="text-3xl sm:text-4xl font-black text-[#053754] dark:text-white">Questions fréquentes</h1>
        <p class="text-gray-500 dark:text-slate-400">Tout ce qu'il faut savoir pour envoyer un colis ou devenir voyageur (GP).</p>
      </section>

      <div class="space-y-3">
        <div
          v-for="(f, i) in faqs"
          :key="i"
          class="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-2xs"
        >
          <button
            @click="toggle(i)"
            class="w-full flex items-center justify-between gap-4 p-4 text-left"
          >
            <span class="font-bold text-gray-800 dark:text-slate-100 text-sm sm:text-base">{{ f.q }}</span>
            <span class="text-[#B50302] text-xl font-black shrink-0 transition-transform" :class="open === i ? 'rotate-45' : ''">+</span>
          </button>
          <div v-show="open === i" class="px-4 pb-4 -mt-1">
            <p class="text-sm text-gray-600 dark:text-slate-300 leading-relaxed">{{ f.r }}</p>
          </div>
        </div>
      </div>

      <div class="text-center pt-4">
        <RouterLink to="/voyages" class="inline-block bg-[#053754] hover:bg-[#074C72] text-white text-sm font-extrabold uppercase tracking-wider px-6 py-3 rounded-2xl transition">
          Voir les voyages disponibles
        </RouterLink>
      </div>
    </main>
  </div>
</template>
