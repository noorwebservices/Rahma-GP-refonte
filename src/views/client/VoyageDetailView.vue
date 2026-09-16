<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { fetchVoyage } from '@/services/voyageService'
import { fetchVoyageurEvaluations } from '@/services/evaluationService'
import { formatVoyageDate } from '@/utils/flagHelper'
import CountryFlag from '@/components/common/CountryFlag.vue'
import { decodeId } from '@/utils/idMasker'

import { setHeaderRoute } from '@/utils/headerState'
import { currentCurrency, formatPrice } from '@/utils/currencyState'
import ReportUserModal from '@/components/ReportUserModal.vue'

const showReportModal = ref(false)

const route = useRoute()
const router = useRouter()
const voyageId = decodeId(route.params.id)

const isLoading = ref(true)
const errorMsg = ref('')
const voyage = ref(null)

const voyageurEvaluations = ref([])
const voyageurMoyenne = ref(0)
const voyageurTotalCount = ref(0)

const currentEvalPage = ref(1)
const evalsPerPage = 2

const totalEvalPages = computed(() => {
  return Math.ceil(voyageurEvaluations.value.length / evalsPerPage) || 1
})

const paginatedVoyageurEvaluations = computed(() => {
  const start = (currentEvalPage.value - 1) * evalsPerPage
  return voyageurEvaluations.value.slice(start, start + evalsPerPage)
})

onMounted(async () => {
  if (!voyageId) {
    errorMsg.value = 'Identifiant du voyage manquant.'
    isLoading.value = false
    return
  }

  isLoading.value = true
  errorMsg.value = ''

  try {
    const res = await fetchVoyage(voyageId)
    if (res && res.data) {
      const v = res.data
      const vId = v.voyageur_id || v.voyageur?.id
      const vUserId = v.voyageur?.user_id || v.voyageur?.user?.id || (v.user ? v.user.id : null)
      
      voyage.value = {
        id: v.id,
        voyageurId: vId,
        voyageurUserId: vUserId,
        depart: v.ville_depart || 'Départ',
        paysDepart: v.pays_depart || '',
        destination: v.ville_destination || 'Destination',
        paysDest: v.pays_destination || '',
        dateDepart: v.date_depart,
        dateArrivee: v.date_arrivee,
        poidsDispo: v.capacite_dispo !== undefined ? Number(v.capacite_dispo) : Number(v.capacite_totale || 0),
        poidsTotal: Number(v.capacite_totale) || 0,
        rawPrixKg: v.prix_kg,
        rawPrixObjet: v.prix_objet,
        devise: v.devise || 'XOF',
        prixKg: computed(() => v.prix_kg ? formatPrice(v.prix_kg, v.devise || 'XOF') : 'Non défini'),
        prixObjet: computed(() => v.prix_objet ? formatPrice(v.prix_objet, v.devise || 'XOF') : 'Non défini'),
        transporteur: v.voyageur ? `${v.voyageur.prenom || v.voyageur.user?.prenom || ''} ${v.voyageur.nom || v.voyageur.user?.nom || ''}`.trim() || 'Transporteur GP' : (v.transporteur_nom || 'Transporteur GP'),
        adresseDepotObj: v.adresse_depot || null,
        adresseDepotText: v.adresse_depot ? `${v.adresse_depot.adresse} (${v.adresse_depot.ville}, ${v.adresse_depot.pays})` : 'Adresse non spécifiée',
        horaireDepot: v.adresse_depot?.horaire_ouverture || 'Non précisé',
        adresseRetraitObj: v.adresse_recuperation || null,
        adresseRetraitText: v.adresse_recuperation ? `${v.adresse_recuperation.adresse} (${v.adresse_recuperation.ville}, ${v.adresse_recuperation.pays})` : 'Adresse non spécifiée',
        horaireRetrait: v.adresse_recuperation?.horaire_ouverture || 'Non précisé',
        categoriesAutorisees: Array.isArray(v.objets_autorises) ? v.objets_autorises : [],
        categoriesRefusees: Array.isArray(v.objets_interdits) ? v.objets_interdits : []
      }

      setHeaderRoute({
        routeFrom: voyage.value.depart,
        countryFrom: voyage.value.paysDepart,
        routeTo: voyage.value.destination,
        countryTo: voyage.value.paysDest
      })

      if (vId) {
        try {
          const evalRes = await fetchVoyageurEvaluations(vId)
          if (evalRes) {
            const evList = evalRes.data?.data || evalRes.data || (Array.isArray(evalRes) ? evalRes : [])
            voyageurEvaluations.value = evList
            voyageurTotalCount.value = evalRes.total_evaluations || evalRes.data?.total_evaluations || evList.length || 0
            if (evalRes.moyenne_notes || evalRes.data?.moyenne_notes) {
              voyageurMoyenne.value = Number(evalRes.moyenne_notes || evalRes.data?.moyenne_notes).toFixed(1)
            } else if (evList.length > 0) {
              const sum = evList.reduce((acc, curr) => acc + (Number(curr.note) || 0), 0)
              voyageurMoyenne.value = (sum / evList.length).toFixed(1)
            } else {
              voyageurMoyenne.value = null
            }
          }
        } catch (e) {
          voyageurMoyenne.value = null
          voyageurTotalCount.value = 0
          voyageurEvaluations.value = []
        }
      }
    } else {
      errorMsg.value = 'Voyage non trouvé.'
    }
  } catch (err) {
    errorMsg.value = err?.message || 'Erreur lors du chargement du voyage.'
  } finally {
    isLoading.value = false
  }
})

const startBooking = () => {
  const token = localStorage.getItem('rahma_token') || localStorage.getItem('token')
  if (!token) {
    Swal.fire({
      icon: 'info',
      title: 'Connexion requise',
      text: 'Veuillez vous connecter pour réserver ce voyage.',
      confirmButtonText: 'Se connecter',
      confirmButtonColor: '#053754',
      showCancelButton: true,
      cancelButtonText: 'Annuler'
    }).then((res) => {
      if (res.isConfirmed) {
        router.push({ name: 'login' })
      }
    })
    return
  }

  if (voyage.value) {
    sessionStorage.setItem('rahma_active_voyage_id', voyage.value.id)
    router.push('/client/booking/step-1')
  }
}
</script>

<template>
  <div class="space-y-6 pb-12">
    <!-- Loading State -->
    <div v-if="isLoading" class="bg-white rounded-3xl p-12 text-center border border-gray-100 shadow-sm space-y-4">
      <div class="w-10 h-10 border-4 border-[#053754] border-t-transparent rounded-full animate-spin mx-auto"></div>
      <p class="text-sm font-bold text-gray-600">Chargement du voyage...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="errorMsg" class="bg-red-50 border border-red-200 rounded-3xl p-8 text-center space-y-3">
      <p class="text-sm font-bold text-red-800">{{ errorMsg }}</p>
      <button @click="router.push('/client')" class="px-4 py-2 bg-red-600 text-white font-bold text-xs rounded-xl">Retour à l'accueil</button>
    </div>

    <!-- Top Return Bar -->
    <div class="flex items-center justify-between gap-3">
      <button
        @click="router.push('/client')"
        type="button"
        class="inline-flex items-center gap-2 text-xs font-bold text-gray-600 bg-white border border-gray-200 px-3.5 py-2 rounded-xl hover:bg-gray-50 transition-colors shadow-2xs cursor-pointer"
      >
        <span>←</span>
        <span>Retour aux trajets</span>
      </button>
    </div>

    <!-- Responsive Grid Layout: 2 Columns on Desktop (lg:) -->
    <div v-if="voyage" class="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      
      <!-- Left Column: Hero Voyage Card, Capacité, Tarif & Points (lg:col-span-7) -->
      <div class="lg:col-span-7 space-y-5">
        
        <!-- Hero Summary Card (Dark Blue #053754) -->
        <div class="bg-[#053754] text-white rounded-3xl p-6 sm:p-7 shadow-xl relative overflow-hidden space-y-4">
          <div class="flex items-center justify-between">
            <div></div>
            <span class="bg-white/15 backdrop-blur-md px-3.5 py-1 rounded-full text-[11px] font-extrabold text-gray-200 border border-white/10 flex items-center gap-1.5">
              <span>👤</span> {{ voyage.transporteur }}
            </span>
          </div>

          <!-- Route Flag visual -->
          <div class="flex items-center justify-between text-lg sm:text-xl font-black px-2">
            <div class="flex items-center gap-2.5">
              <CountryFlag :city="voyage.depart" :country="voyage.paysDepart" size="w-7 h-5" />
              <div>
                <div class="text-base sm:text-lg font-bold text-white">{{ voyage.depart }}</div>
                <div class="text-xs text-gray-300 font-normal">{{ voyage.paysDepart }}</div>
              </div>
            </div>

            <div class="flex-1 flex items-center justify-center px-4 relative">
              <div class="w-full border-b-2 border-[#B50302] border-dashed"></div>
              <div class="absolute bg-[#053754] px-2 text-[#B50302] text-lg font-bold">
                ✈️
              </div>
            </div>

            <div class="flex items-center gap-2.5 text-right">
              <div>
                <div class="text-base sm:text-lg font-bold text-white">{{ voyage.destination }}</div>
                <div class="text-xs text-gray-300 font-normal">{{ voyage.paysDest }}</div>
              </div>
              <CountryFlag :city="voyage.destination" :country="voyage.paysDest" size="w-7 h-5" />
            </div>
          </div>

          <!-- Dates Row -->
          <div class="grid grid-cols-2 gap-4 pt-4 border-t border-white/15 text-xs">
            <div>
              <div class="text-gray-300 font-medium">Départ</div>
              <div class="font-bold text-white text-xs sm:text-sm mt-0.5">{{ formatVoyageDate(voyage.dateDepart) }}</div>
            </div>
            <div class="text-right">
              <div class="text-gray-300 font-medium">Arrivée Estimée</div>
              <div class="font-bold text-white text-xs sm:text-sm mt-0.5">{{ formatVoyageDate(voyage.dateArrivee) }}</div>
            </div>
          </div>
        </div>

        <!-- Capacité disponible Card -->
        <div class="bg-white rounded-2xl p-5 border border-gray-200 shadow-2xs space-y-2">
          <div class="flex items-center justify-between font-bold text-sm">
            <span class="text-[#074C72]">Capacité disponible</span>
            <span class="text-[#074C72] font-black text-base">{{ voyage.poidsDispo }}kg</span>
          </div>
          <div class="w-full h-2.5 bg-gray-200 rounded-full overflow-hidden">
            <div
              class="h-full bg-[#B50302] rounded-full transition-all"
              :style="{ width: `${Math.min(100, Math.max(0, ((voyage.poidsTotal - voyage.poidsDispo) / voyage.poidsTotal) * 100))}%` }"
            ></div>
          </div>
          <div class="text-right text-[11px] text-gray-400 font-medium">
            {{ voyage.poidsTotal - voyage.poidsDispo }} kg déjà réservés sur {{ voyage.poidsTotal }} kg
          </div>
        </div>

        <!-- Tarif Card displaying BOTH Tariffs -->
        <div class="bg-white rounded-2xl p-5 border border-gray-200 shadow-2xs space-y-3">
          <div class="text-xs font-bold text-gray-400 uppercase tracking-wider">Tarification appliquée</div>
          
          <div class="grid grid-cols-2 gap-3">
            <div class="bg-slate-50 p-3 rounded-xl border border-slate-100 space-y-1">
              <span class="text-xs text-gray-400 font-bold block">Tarif / Kg</span>
              <span class="text-base sm:text-lg font-black text-[#B50302] block">{{ voyage.prixKg }}</span>
              <span class="text-[10px] text-gray-400 block font-medium">par kilogramme</span>
            </div>

            <div class="bg-slate-50 p-3 rounded-xl border border-slate-100 space-y-1">
              <span class="text-xs text-gray-400 font-bold block">Tarif / Objet</span>
              <span class="text-base sm:text-lg font-black text-[#053754] block">{{ voyage.prixObjet }}</span>
              <span class="text-[10px] text-gray-400 block font-medium">forfait par objet</span>
            </div>
          </div>
        </div>

        <!-- Où déposer mon colis ? Card avec lien Google Maps -->
        <div class="bg-white rounded-2xl p-5 border border-gray-200 shadow-2xs space-y-3">
          <div class="text-xs font-bold text-gray-400">Où déposer mon colis ? (Lieu de Départ)</div>
          <div class="flex items-start gap-3">
            <div class="w-8 h-8 rounded-full bg-red-50 text-[#B50302] flex items-center justify-center shrink-0 font-bold">
              📍
            </div>
            <div class="space-y-1 flex-1">
              <div class="text-sm font-bold text-[#074C72]">{{ voyage.adresseDepotText }}</div>
              <div class="text-xs text-gray-500 flex items-center gap-2">
                <span>Horaires :</span>
                <span class="font-bold text-[#074C72]">{{ voyage.horaireDepot }}</span>
              </div>
              <a
                :href="`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(voyage.adresseDepotText)}`"
                target="_blank"
                rel="noopener noreferrer"
                class="inline-flex items-center gap-1.5 text-xs text-[#B50302] hover:underline font-bold pt-1.5 cursor-pointer"
              >
                <span>🗺️ Voir l'adresse sur Google Maps</span>
                <span>➔</span>
              </a>
            </div>
          </div>
        </div>

        <!-- Point de retrait à l'arrivée Card avec lien Google Maps -->
        <div class="bg-white rounded-2xl p-5 border border-gray-200 shadow-2xs space-y-3">
          <div class="text-xs font-bold text-gray-400">Point de retrait à l'arrivée (Destination)</div>
          <div class="flex items-start gap-3">
            <div class="w-8 h-8 rounded-full bg-red-50 text-[#B50302] flex items-center justify-center shrink-0 font-bold">
              📍
            </div>
            <div class="space-y-1 flex-1">
              <div class="text-sm font-bold text-[#074C72]">{{ voyage.adresseRetraitText }}</div>
              <div class="text-xs text-gray-500 flex items-center gap-2">
                <span>Horaires :</span>
                <span class="font-bold text-[#074C72]">{{ voyage.horaireRetrait }}</span>
              </div>
              <a
                :href="`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(voyage.adresseRetraitText)}`"
                target="_blank"
                rel="noopener noreferrer"
                class="inline-flex items-center gap-1.5 text-xs text-[#B50302] hover:underline font-bold pt-1.5 cursor-pointer"
              >
                <span>🗺️ Voir l'adresse sur Google Maps</span>
                <span>➔</span>
              </a>
            </div>
          </div>
        </div>

      </div>

      <!-- Right Column: Colis Acceptés, Interdits, Transporteur & CTA Button (lg:col-span-5) -->
      <div class="lg:col-span-5 space-y-5 lg:sticky lg:top-20">
        
        <!-- Colis acceptés Card (Green Border) -->
        <div class="bg-white rounded-2xl p-5 border border-emerald-300 shadow-2xs space-y-3">
          <div class="flex items-center gap-2 text-emerald-700 font-extrabold text-sm">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>Colis acceptés :</span>
          </div>
          <ul v-if="voyage.categoriesAutorisees.length > 0" class="space-y-2 text-xs font-semibold text-gray-600 pl-1">
            <li v-for="item in voyage.categoriesAutorisees" :key="item" class="flex items-center gap-2">
              <span class="w-2 h-2 rounded-full bg-emerald-600"></span>
              <span>{{ item }}</span>
            </li>
          </ul>
          <p v-else class="text-xs text-gray-400 italic">Aucune catégorie spécifiée.</p>
        </div>

        <!-- Objets interdits Card (Red Border) -->
        <div class="bg-white rounded-2xl p-5 border border-red-300 shadow-2xs space-y-3">
          <div class="flex items-center gap-2 text-[#B50302] font-extrabold text-sm">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <span>Objets interdits</span>
          </div>
          <ul v-if="voyage.categoriesRefusees.length > 0" class="space-y-2 text-xs font-semibold text-gray-600 pl-1">
            <li v-for="item in voyage.categoriesRefusees" :key="item" class="flex items-center gap-2">
              <span class="w-2 h-2 rounded-full bg-[#B50302]"></span>
              <span>{{ item }}</span>
            </li>
          </ul>
          <p v-else class="text-xs text-gray-400 italic">Aucune interdiction spécifique.</p>
        </div>

        <!-- À propos du transporteur Card avec le vrai nom du transporteur et avis -->
        <div class="bg-white rounded-2xl p-5 border border-gray-200 shadow-2xs space-y-4">
          <div class="flex items-center gap-2 text-[#074C72] font-extrabold text-sm">
            <svg class="w-5 h-5 text-[#074C72]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            <span>À propos du transporteur</span>
          </div>

          <div class="flex items-center justify-between pt-1">
            <div class="flex items-center gap-3">
              <div class="w-11 h-11 rounded-full bg-[#053754] text-white font-black text-xs flex items-center justify-center shadow-xs">
                GP
              </div>
              <div>
                <div class="font-bold text-[#074C72] text-sm">{{ voyage.transporteur }}</div>
                <div class="text-xs text-[#FF9F02] font-extrabold flex items-center gap-1">
                  <span>★</span> <span>{{ voyageurMoyenne }}</span>
                  <span class="text-gray-400 font-normal">({{ voyageurTotalCount }} avis)</span>
                </div>
              </div>
            </div>

            <span class="text-xs text-emerald-600 font-bold bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100">Vérifié ✓</span>
          </div>

          <!-- Signaler ce compte button -->
          <div class="pt-2 border-t border-gray-100 flex justify-end">
            <button 
              @click="showReportModal = true" 
              type="button"
              class="inline-flex items-center gap-1.5 text-xs text-red-600 hover:text-red-700 font-bold bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-xl border border-red-100 transition cursor-pointer"
            >
              <span>🚩</span>
              <span>Signaler ce compte</span>
            </button>
          </div>

          <!-- Reviews list preview with 2-item pagination -->
          <div v-if="voyageurEvaluations.length > 0" class="pt-3 border-t border-gray-100 space-y-2.5">
            <span class="text-[11px] font-extrabold text-gray-400 uppercase tracking-wider block">Derniers avis clients</span>
            <div v-for="evalItem in paginatedVoyageurEvaluations" :key="evalItem.id" class="bg-gray-50 p-2.5 rounded-xl border border-gray-100 space-y-1">
              <div class="flex items-center justify-between text-[11px]">
                <span class="font-bold text-gray-800">{{ evalItem.evaluateur ? `${evalItem.evaluateur.prenom} ${evalItem.evaluateur.nom}` : 'Client' }}</span>
                <span class="text-amber-500 font-bold">★ {{ evalItem.note }}</span>
              </div>
              <p class="text-[11px] text-gray-600 italic line-clamp-2">"{{ evalItem.commentaire }}"</p>
            </div>

            <div v-if="totalEvalPages > 1" class="flex items-center justify-between pt-1 text-[11px]">
              <button
                @click="currentEvalPage = Math.max(1, currentEvalPage - 1)"
                :disabled="currentEvalPage === 1"
                class="px-2 py-0.5 bg-gray-100 border border-gray-200 rounded text-gray-700 font-bold disabled:opacity-40 cursor-pointer"
              >
                ‹ Précédent
              </button>
              <span class="text-gray-400 font-semibold">{{ currentEvalPage }} / {{ totalEvalPages }}</span>
              <button
                @click="currentEvalPage = Math.min(totalEvalPages, currentEvalPage + 1)"
                :disabled="currentEvalPage === totalEvalPages"
                class="px-2 py-0.5 bg-gray-100 border border-gray-200 rounded text-gray-700 font-bold disabled:opacity-40 cursor-pointer"
              >
                Suivant ›
              </button>
            </div>
          </div>
        </div>

        <!-- CTA Button -->
        <button
          @click="startBooking"
          type="button"
          class="w-full bg-[#B50302] hover:bg-[#870202] text-white font-extrabold text-sm py-4 rounded-2xl shadow-xl transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99]"
        >
          <span>RÉSERVER POUR CE VOYAGE</span>
          <span class="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center text-xs">➔</span>
        </button>

      </div>

    </div>

    <!-- Modal de Signalement -->
    <ReportUserModal 
      :show="showReportModal" 
      :target-user="voyage?.voyageurUserId ? { id: voyage.voyageurUserId, prenom: voyage.transporteur, nom: '' } : null"
      @close="showReportModal = false"
    />

  </div>
</template>
