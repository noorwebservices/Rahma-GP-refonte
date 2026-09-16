<template>
  <div class="space-y-6">
    
    <!-- Top Navigation Bar -->
    <div class="flex items-center justify-between">
      <button 
        @click="router.push('/admin/users')"
        class="inline-flex items-center gap-2 text-xs font-extrabold text-[#074C72] bg-white border border-gray-200 px-4 py-2 rounded-2xl hover:bg-gray-50 transition-colors shadow-2xs cursor-pointer"
      >
        <span>←</span>
        <span>Retour à la liste des utilisateurs</span>
      </button>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="bg-white rounded-3xl p-16 text-center border border-gray-200 shadow-2xs space-y-3">
      <div class="w-10 h-10 border-4 border-[#053754] border-t-transparent rounded-full animate-spin mx-auto"></div>
      <p class="text-xs font-bold text-[#074C72]">Chargement de la fiche complète de l'utilisateur...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="bg-red-50 border border-red-200 rounded-3xl p-8 text-center space-y-3">
      <p class="text-sm font-bold text-[#B50302]">{{ error }}</p>
      <button @click="router.push('/admin/users')" class="px-4 py-2 bg-[#053754] text-white font-bold text-xs rounded-xl">Retour à la liste</button>
    </div>

    <template v-else-if="user">
      
      <!-- Top Profile Overview Banner Card -->
      <div class="bg-[#053754] text-white rounded-3xl p-6 sm:p-8 shadow-xl space-y-6 relative overflow-hidden">
        <div class="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          
          <div class="flex items-center gap-4">
            <div v-if="user.avatar" class="w-16 h-16 sm:w-20 sm:h-20 rounded-full overflow-hidden shrink-0 border-4 border-white/20 shadow-md">
              <img :src="user.avatar" class="w-full h-full object-cover" />
            </div>
            <div v-else class="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-white/20 text-white font-black text-2xl flex items-center justify-center shrink-0 border-4 border-white/20 shadow-md">
              {{ getInitials(user.prenom, user.nom) }}
            </div>
            
            <div class="space-y-1">
              <div class="flex items-center gap-2">
                <h1 class="text-xl sm:text-2xl font-black text-white">{{ user.prenom }} {{ user.nom }}</h1>
                <span class="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider border" :class="user.statut === 'actif' ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400/30' : 'bg-red-500/20 text-red-300 border-red-400/30'">
                  {{ user.statut }}
                </span>
              </div>
              
              <p class="text-xs sm:text-sm text-gray-200 font-medium">{{ user.email }} • {{ user.telephone }}</p>
              
              <div class="flex flex-wrap gap-1.5 pt-1">
                <span v-for="r in user.roles" :key="r.name" class="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-white/20 text-white">
                  {{ r.name }}
                </span>
              </div>
            </div>
          </div>

          <!-- Quick Action Buttons -->
          <div class="flex items-center gap-3 shrink-0">
            <button 
              @click="toggleBlock"
              class="px-5 py-3 rounded-2xl text-xs font-extrabold shadow-lg transition-all cursor-pointer flex items-center gap-2"
              :class="user.statut === 'suspendu' ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950' : 'bg-[#B50302] hover:bg-[#870202] text-white'"
            >
              <span>{{ user.statut === 'suspendu' ? '✓ Débloquer le compte' : '🔒 Bloquer le compte' }}</span>
            </button>
          </div>

        </div>
      </div>

      <!-- Account Info Grid -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        
        <div class="bg-white p-5 rounded-3xl border border-gray-200 shadow-2xs space-y-1">
          <span class="text-[10px] font-extrabold text-gray-400 uppercase tracking-wider">Dernière Connexion</span>
          <p class="text-sm font-black text-[#053754] font-mono">{{ user.dernier_connexion ? formatDate(user.dernier_connexion) : 'Jamais' }}</p>
        </div>

        <div class="bg-white p-5 rounded-3xl border border-gray-200 shadow-2xs space-y-1">
          <span class="text-[10px] font-extrabold text-gray-400 uppercase tracking-wider">Membre Depuis</span>
          <p class="text-sm font-black text-[#053754] font-mono">{{ formatDate(user.created_at) }}</p>
        </div>

        <div class="bg-white p-5 rounded-3xl border border-gray-200 shadow-2xs space-y-1">
          <span class="text-[10px] font-extrabold text-gray-400 uppercase tracking-wider">Adresse Résidence</span>
          <p class="text-sm font-extrabold text-[#053754] truncate">{{ user.adresse || 'Non renseignée' }}</p>
        </div>

        <div class="bg-indigo-50 p-5 rounded-3xl border border-indigo-200 shadow-2xs space-y-1">
          <span class="text-[10px] font-extrabold text-indigo-700 uppercase tracking-wider">Capacité Données BD</span>
          <p class="text-sm font-black text-indigo-950 font-mono">{{ user.capacite_donnees?.formatted || '0 Ko' }} ({{ user.capacite_donnees?.octets || 0 }} octets)</p>
        </div>

      </div>

      <!-- Section Profil Voyageur / KYC Verification (If Voyageur) -->
      <div v-if="user.voyageur" class="bg-white border border-gray-200 rounded-3xl p-6 shadow-2xs space-y-5">
        <div class="flex items-center justify-between border-b border-gray-100 pb-3">
          <h3 class="font-extrabold text-base text-[#053754] flex items-center gap-2">
            <span>Profil & Vérification Voyageur</span>
          </h3>

          <span class="px-3 py-1 rounded-full text-xs font-extrabold border capitalize" :class="getVoyageurStatutBadge(user.voyageur.statut)">
            Statut : {{ user.voyageur.statut === 'verifie' ? 'Vérifié' : (user.voyageur.statut === 'refuse' ? 'Refusé' : 'En Attente') }}
          </span>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-medium text-gray-700">
          <div>
            <span class="text-gray-400 font-bold block uppercase text-[10px]">Type Pièce Identité:</span>
            <span class="font-bold text-[#053754] text-sm uppercase">{{ user.voyageur.type_piece || 'Passeport / CNI' }}</span>
          </div>
          <div>
            <span class="text-gray-400 font-bold block uppercase text-[10px]">Numéro de Pièce:</span>
            <span class="font-bold font-mono text-[#053754] text-sm">{{ user.voyageur.numero_piece || 'Non renseigné' }}</span>
          </div>
          <div>
            <span class="text-gray-400 font-bold block uppercase text-[10px]">Note Moyenne Avis:</span>
            <span class="font-black text-amber-500 text-sm flex items-center gap-1">
              ★ {{ Number(user.note_moyenne ?? user.voyageur?.note_moyenne ?? 5.0).toFixed(1) }}
              <span class="text-gray-400 font-normal text-xs">({{ user.total_evaluations ?? user.evaluations_recues?.length ?? 0 }} avis)</span>
            </span>
          </div>
        </div>

        <!-- CNI Identity Photos Display -->
        <div class="space-y-2 pt-2 border-t border-gray-100">
          <span class="text-xs font-extrabold text-[#053754] uppercase tracking-wider block">
            Document d'Identité Fourni (CNI / Passeport)
          </span>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <!-- Recto -->
            <div class="p-4 bg-[#FAF7F2] border border-gray-200 rounded-2xl space-y-2">
              <div class="flex items-center justify-between">
                <span class="text-[10px] font-extrabold text-gray-500 uppercase tracking-wider block">Face Recto</span>
                <span v-if="rectoUrl" class="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">Fourni</span>
              </div>
              
              <div v-if="rectoUrl" class="relative h-48 rounded-xl overflow-hidden border border-gray-200 bg-white group cursor-pointer" @click="openImagePreview(rectoUrl, 'CNI Recto')">
                <img :src="formatImageUrl(rectoUrl)" class="w-full h-full object-contain p-2 transition-transform duration-300 group-hover:scale-105" />
                <div class="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-bold">
                  🔍 Clic pour agrandir
                </div>
              </div>
              <div v-else class="h-40 rounded-xl border border-dashed border-gray-300 bg-white flex flex-col items-center justify-center text-gray-400 text-xs font-semibold p-4 text-center">
                <span>Aucune photo recto téléchargée</span>
              </div>
            </div>

            <!-- Verso -->
            <div class="p-4 bg-[#FAF7F2] border border-gray-200 rounded-2xl space-y-2">
              <div class="flex items-center justify-between">
                <span class="text-[10px] font-extrabold text-gray-500 uppercase tracking-wider block">Face Verso</span>
                <span v-if="versoUrl" class="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">Fourni</span>
              </div>

              <div v-if="versoUrl" class="relative h-48 rounded-xl overflow-hidden border border-gray-200 bg-white group cursor-pointer" @click="openImagePreview(versoUrl, 'CNI Verso')">
                <img :src="formatImageUrl(versoUrl)" class="w-full h-full object-contain p-2 transition-transform duration-300 group-hover:scale-105" />
                <div class="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-bold">
                  🔍 Clic pour agrandir
                </div>
              </div>
              <div v-else class="h-40 rounded-xl border border-dashed border-gray-300 bg-white flex flex-col items-center justify-center text-gray-400 text-xs font-semibold p-4 text-center">
                <span>Aucune photo verso téléchargée</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Verification Action Buttons -->
        <div class="flex items-center gap-3 pt-3 border-t border-gray-100">
          <template v-if="user.voyageur.statut === 'verifie'">
            <div class="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 font-extrabold text-xs">
              <span>✓ Compte Voyageur actuellement vérifié et actif</span>
            </div>
            <button 
              @click="toggleBlock"
              class="px-5 py-2.5 bg-[#B50302] hover:bg-[#870202] text-white rounded-xl text-xs font-extrabold shadow-md transition-all cursor-pointer ml-auto"
            >
              🔒 Bloquer l'utilisateur
            </button>
          </template>

          <template v-else>
            <button @click="verifyVoyageur('verifie')" class="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-extrabold shadow-md transition-all cursor-pointer">
              ✓ Valider le compte Voyageur
            </button>
            <button @click="verifyVoyageur('refuse')" class="px-5 py-2.5 bg-red-100 text-[#B50302] hover:bg-red-200 border border-red-200 rounded-xl text-xs font-extrabold transition-all cursor-pointer">
              ✕ Refuser le compte Voyageur
            </button>
            <button 
              @click="toggleBlock"
              class="px-5 py-2.5 bg-[#B50302] hover:bg-[#870202] text-white rounded-xl text-xs font-extrabold shadow-md transition-all cursor-pointer ml-auto"
            >
              🔒 Bloquer l'utilisateur
            </button>
          </template>
        </div>
      </div>

      <!-- Section Avis & Évaluations Reçus -->
      <div class="bg-white border border-gray-200 rounded-3xl p-6 shadow-2xs space-y-4">
        <div class="flex items-center justify-between border-b border-gray-100 pb-3">
          <h3 class="font-extrabold text-base text-[#053754] flex items-center gap-2">
            <span>⭐ Avis & Évaluations Reçus par {{ user.prenom }}</span>
            <span class="text-gray-400 text-xs font-semibold">({{ user.evaluations_recues ? user.evaluations_recues.length : 0 }})</span>
          </h3>
          <span class="text-xs font-black text-amber-500 bg-amber-50 border border-amber-200 px-3 py-1 rounded-full">
            Note Moyenne : ★ {{ Number(user.note_moyenne ?? 5.0).toFixed(1) }} / 5
          </span>
        </div>

        <div v-if="!user.evaluations_recues || user.evaluations_recues.length === 0" class="text-xs text-gray-400 italic py-2">
          Aucun avis ou évaluation reçu pour le moment.
        </div>

        <template v-else>
          <div class="space-y-3">
            <div v-for="evalItem in paginatedEvaluations" :key="evalItem.id" class="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-2">
              <div class="flex items-center justify-between border-b border-gray-200/60 pb-2">
                <div class="flex items-center gap-2">
                  <div class="w-7 h-7 rounded-full bg-[#053754] text-white text-[10px] font-black flex items-center justify-center">
                    {{ getInitials(evalItem.evaluateur?.prenom, evalItem.evaluateur?.nom) }}
                  </div>
                  <div>
                    <span class="font-extrabold text-[#053754] text-xs sm:text-sm">
                      {{ evalItem.evaluateur?.prenom }} {{ evalItem.evaluateur?.nom }}
                    </span>
                    <span class="text-gray-400 text-[10px] ml-2">({{ evalItem.evaluateur?.email || evalItem.evaluateur?.telephone }})</span>
                  </div>
                </div>

                <div class="flex items-center gap-1 bg-amber-100/80 text-amber-800 font-extrabold px-2.5 py-0.5 rounded-full text-xs border border-amber-300">
                  <span>★</span>
                  <span>{{ evalItem.note }} / 5</span>
                </div>
              </div>

              <p class="text-gray-700 font-medium text-xs sm:text-sm italic pl-1">
                "{{ evalItem.commentaire || 'Aucun commentaire rédigé.' }}"
              </p>

              <div class="flex items-center justify-between text-[11px] text-gray-400 font-medium pt-1 border-t border-gray-100">
                <span v-if="evalItem.reservation?.voyage">
                  Trajet concerné : <strong class="text-[#074C72]">{{ evalItem.reservation.voyage.ville_depart }} ➔ {{ evalItem.reservation.voyage.ville_destination }}</strong>
                </span>
                <span v-else>Évaluation directe</span>
                <span class="font-mono text-gray-500">{{ formatDate(evalItem.created_at) }}</span>
              </div>
            </div>
          </div>

          <!-- Pagination Avis (5 items per page) -->
          <div v-if="totalEvaluationsPages > 1" class="pt-3 flex items-center justify-between text-xs font-bold text-gray-600 border-t border-gray-100">
            <span>Page {{ evaluationsPage }} sur {{ totalEvaluationsPages }}</span>
            <div class="flex items-center gap-1.5">
              <button @click="evaluationsPage > 1 && evaluationsPage--" :disabled="evaluationsPage === 1" class="px-3 py-1 rounded-lg border bg-white disabled:opacity-40">← Préc.</button>
              <button @click="evaluationsPage < totalEvaluationsPages && evaluationsPage++" :disabled="evaluationsPage === totalEvaluationsPages" class="px-3 py-1 rounded-lg border bg-white disabled:opacity-40">Suiv. →</button>
            </div>
          </div>
        </template>
      </div>

      <!-- Section Voyages Créés (If Voyageur) -->
      <div v-if="user.voyageur && user.voyageur.voyages" class="bg-white border border-gray-200 rounded-3xl p-6 shadow-2xs space-y-4">
        <div class="flex items-center justify-between border-b border-gray-100 pb-3">
          <h3 class="font-extrabold text-base text-[#053754]">
            ✈️ Voyages Publiés par {{ user.prenom }} ({{ user.voyageur.voyages.length }})
          </h3>
        </div>

        <div v-if="user.voyageur.voyages.length === 0" class="text-xs text-gray-400 italic">
          Aucun voyage publié.
        </div>

        <template v-else>
          <div class="space-y-3">
            <div v-for="voyage in paginatedVoyages" :key="voyage.id" class="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-3">
              <div class="flex items-center justify-between border-b border-gray-200 pb-2">
                <span class="font-black text-[#053754] text-sm sm:text-base">{{ voyage.ville_depart }} ➔ {{ voyage.ville_destination || voyage.ville_arrivee }}</span>
                <span class="px-2.5 py-0.5 rounded-full font-bold bg-white text-emerald-700 border border-emerald-200 text-[10px] sm:text-xs">{{ voyage.statut }}</span>
              </div>
              <!-- Each element on its own line on mobile -->
              <div class="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-6 text-gray-600 font-medium">
                <div><span>Date départ :</span> <strong class="text-[#053754]">{{ formatDate(voyage.date_depart) }}</strong></div>
                <div><span>Kilos dispos :</span> <strong class="text-[#B50302] font-black">{{ voyage.capacite_dispo ?? voyage.capacite_totale }} kg</strong></div>
                <div><span>Réservations :</span> <strong class="text-[#074C72]">{{ voyage.reservations ? voyage.reservations.length : 0 }}</strong></div>
              </div>
            </div>
          </div>

          <!-- Pagination Voyages (5 items per page) -->
          <div v-if="totalVoyagesPages > 1" class="pt-3 flex items-center justify-between text-xs font-bold text-gray-600 border-t border-gray-100">
            <span>Page {{ voyagesPage }} sur {{ totalVoyagesPages }}</span>
            <div class="flex items-center gap-1.5">
              <button @click="voyagesPage > 1 && voyagesPage--" :disabled="voyagesPage === 1" class="px-3 py-1 rounded-lg border bg-white disabled:opacity-40">← Préc.</button>
              <button @click="voyagesPage < totalVoyagesPages && voyagesPage++" :disabled="voyagesPage === totalVoyagesPages" class="px-3 py-1 rounded-lg border bg-white disabled:opacity-40">Suiv. →</button>
            </div>
          </div>
        </template>
      </div>

      <!-- Section Réservations faites par cet utilisateur (If Client) -->
      <div class="bg-white border border-gray-200 rounded-3xl p-6 shadow-2xs space-y-4">
        <div class="flex items-center justify-between border-b border-gray-100 pb-3">
          <h3 class="font-extrabold text-base text-[#053754]">
            📦 Réservations effectuées par {{ user.prenom }} ({{ user.reservations_client ? user.reservations_client.length : 0 }})
          </h3>
        </div>

        <div v-if="!user.reservations_client || user.reservations_client.length === 0" class="text-xs text-gray-400 italic">
          Aucune réservation effectuée par cet utilisateur.
        </div>

        <template v-else>
          <div class="space-y-3">
            <div v-for="res in paginatedReservations" :key="res.id" class="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-3">
              <div class="flex items-center justify-between border-b border-gray-200 pb-2">
                <span class="font-mono font-black text-[#053754] text-sm">#{{ res.numero || res.id.substring(0, 8) }}</span>
                <span class="px-2.5 py-0.5 rounded-full font-bold bg-white text-[#074C72] border border-sky-200 text-[10px] sm:text-xs">{{ res.statut }}</span>
              </div>
              <!-- Each element on its own line on mobile -->
              <div class="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-6 text-gray-600 font-medium">
                <div><span>Trajet :</span> <strong>{{ res.voyage ? `${res.voyage.ville_depart} ➔ ${res.voyage.ville_destination}` : 'N/A' }}</strong></div>
                <div><span>Poids réservé :</span> <strong class="text-[#B50302] font-black">{{ res.colis?.poids ?? res.poids_kg ?? 0 }} kg</strong></div>
                <div><span>Messages échangés :</span> <strong class="text-[#074C72]">{{ res.messages ? res.messages.length : 0 }}</strong></div>
              </div>
            </div>
          </div>

          <!-- Pagination Reservations (5 items per page) -->
          <div v-if="totalReservationsPages > 1" class="pt-3 flex items-center justify-between text-xs font-bold text-gray-600 border-t border-gray-100">
            <span>Page {{ reservationsPage }} sur {{ totalReservationsPages }}</span>
            <div class="flex items-center gap-1.5">
              <button @click="reservationsPage > 1 && reservationsPage--" :disabled="reservationsPage === 1" class="px-3 py-1 rounded-lg border bg-white disabled:opacity-40">← Préc.</button>
              <button @click="reservationsPage < totalReservationsPages && reservationsPage++" :disabled="reservationsPage === totalReservationsPages" class="px-3 py-1 rounded-lg border bg-white disabled:opacity-40">Suiv. →</button>
            </div>
          </div>
        </template>
      </div>

    </template>

    <!-- Modal preview image -->
    <Teleport to="body">
      <div v-if="previewModal.isOpen" class="fixed inset-0 z-[9999] bg-black/80 flex items-center justify-center p-4" @click.self="previewModal.isOpen = false">
        <div class="max-w-3xl w-full bg-white rounded-3xl p-4 space-y-4 relative">
          <div class="flex items-center justify-between border-b pb-2">
            <h4 class="font-black text-[#053754] text-sm">{{ previewModal.title }}</h4>
            <button @click="previewModal.isOpen = false" class="text-gray-500 hover:text-gray-800 font-bold p-1 text-base">✕</button>
          </div>
          <div class="max-h-[75vh] flex items-center justify-center overflow-hidden">
            <img :src="previewModal.url" class="max-h-[70vh] w-auto object-contain rounded-xl" />
          </div>
        </div>
      </div>
    </Teleport>

  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { adminService } from '@/services/adminService'
import Swal from 'sweetalert2'

const route = useRoute()
const router = useRouter()
const userId = route.params.id

const user = ref(null)
const loading = ref(true)
const error = ref('')

const voyagesPage = ref(1)
const reservationsPage = ref(1)
const evaluationsPage = ref(1)
const perPage = 5

const previewModal = reactive({
  isOpen: false,
  url: '',
  title: ''
})

const formatImageUrl = (url) => {
  if (!url) return null
  if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:')) {
    return url
  }
  const cleanUrl = url.replace(/^\//, '')
  if (cleanUrl.startsWith('storage/')) {
    return `http://localhost:8000/${cleanUrl}`
  }
  return `http://localhost:8000/storage/${cleanUrl}`
}

const openImagePreview = (url, title) => {
  if (!url) return
  previewModal.url = formatImageUrl(url)
  previewModal.title = title
  previewModal.isOpen = true
}

onMounted(async () => {
  if (!userId) {
    error.value = 'ID Utilisateur invalide.'
    loading.value = false
    return
  }

  try {
    const res = await adminService.getUserDetail(userId)
    if (res && res.data) {
      user.value = res.data
    } else {
      error.value = 'Utilisateur non trouvé.'
    }
  } catch (err) {
    error.value = err?.message || 'Erreur lors du chargement des détails.'
  } finally {
    loading.value = false
  }
})

const rectoUrl = computed(() => {
  const v = user.value?.voyageur
  if (!v) return null
  return v.cni_recto || v.piece_recto || v.photo_recto || v.cni_photo || v.piece_identite_url || null
})

const versoUrl = computed(() => {
  const v = user.value?.voyageur
  if (!v) return null
  return v.cni_verso || v.piece_verso || v.photo_verso || null
})

const paginatedVoyages = computed(() => {
  if (!user.value?.voyageur?.voyages) return []
  const start = (voyagesPage.value - 1) * perPage
  return user.value.voyageur.voyages.slice(start, start + perPage)
})

const totalVoyagesPages = computed(() => {
  const total = user.value?.voyageur?.voyages?.length || 0
  return Math.ceil(total / perPage) || 1
})

const paginatedReservations = computed(() => {
  if (!user.value?.reservations_client) return []
  const start = (reservationsPage.value - 1) * perPage
  return user.value.reservations_client.slice(start, start + perPage)
})

const totalReservationsPages = computed(() => {
  const total = user.value?.reservations_client?.length || 0
  return Math.ceil(total / perPage) || 1
})

const paginatedEvaluations = computed(() => {
  if (!user.value?.evaluations_recues) return []
  const start = (evaluationsPage.value - 1) * perPage
  return user.value.evaluations_recues.slice(start, start + perPage)
})

const totalEvaluationsPages = computed(() => {
  const total = user.value?.evaluations_recues?.length || 0
  return Math.ceil(total / perPage) || 1
})

const getInitials = (prenom, nom) => {
  const p = (prenom || '').charAt(0).toUpperCase()
  const n = (nom || '').charAt(0).toUpperCase()
  return (p + n) || 'U'
}

const toggleBlock = async () => {
  if (!user.value) return
  const nextStatut = user.value.statut === 'suspendu' ? 'actif' : 'suspendu'
  
  const result = await Swal.fire({
    title: user.value.statut === 'suspendu' ? 'Débloquer le compte' : 'Bloquer le compte',
    text: `Voulez-vous vraiment changer le statut vers "${nextStatut}" pour ${user.value.prenom} ${user.value.nom} ?`,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#053754',
    cancelButtonColor: '#B50302',
    confirmButtonText: 'Oui, confirmer',
    cancelButtonText: 'Annuler'
  })

  if (!result.isConfirmed) return

  try {
    await adminService.toggleBlockUser(user.value.id, nextStatut)
    user.value.statut = nextStatut
    Swal.fire('Succès !', `Statut mis à jour en "${nextStatut}".`, 'success')
  } catch (err) {
    Swal.fire('Erreur', err.message || 'Erreur lors du blocage', 'error')
  }
}

const verifyVoyageur = async (statut) => {
  if (!user.value || !user.value.voyageur) return
  try {
    await adminService.updateStatutVoyageur(user.value.voyageur.id, statut)
    user.value.voyageur.statut = statut
    Swal.fire('Statut mis à jour', `Le statut voyageur a été mis à jour en '${statut}'`, 'success')
  } catch (err) {
    Swal.fire('Erreur', err.message || 'Erreur lors de la vérification voyageur', 'error')
  }
}

const getVoyageurStatutBadge = (statut) => {
  if (statut === 'verifie') return 'bg-emerald-50 text-emerald-700 border-emerald-200'
  if (statut === 'refuse') return 'bg-red-50 text-[#B50302] border-red-200'
  return 'bg-amber-50 text-amber-700 border-amber-200'
}

const formatDate = (dateStr) => {
  if (!dateStr) return '-'
  return new Date(dateStr).toLocaleString('fr-FR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}
</script>
