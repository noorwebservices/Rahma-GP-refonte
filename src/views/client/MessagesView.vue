<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import Swal from 'sweetalert2'
import { fetchReservations } from '@/services/reservationService'
import { fetchReservationMessages } from '@/services/messageService'
import { checkWavePaymentStatus } from '@/services/paiementService'
import { getCountryFlag, formatVoyageDate } from '@/utils/flagHelper'
import CountryFlag from '@/components/common/CountryFlag.vue'
import { encodeId } from '@/utils/idMasker'

const route = useRoute()
const router = useRouter()
const searchQuery = ref('')
const isLoading = ref(true)
const errorMsg = ref('')

const conversations = ref([])
let pollTimer = null

const getCurrentUserId = () => {
  try {
    const u = JSON.parse(localStorage.getItem('rahma_user') || '{}')
    return u.id || u.user_id || u.user?.id || null
  } catch (e) {
    return null
  }
}
const currentUserId = getCurrentUserId()

const loadConversations = async (silent = false) => {
  if (!silent) isLoading.value = true
  errorMsg.value = ''
  try {
    const res = await fetchReservations()
    if (res && res.data) {
      const allowedStatuses = ['en_attente', 'acceptee', 'accepte', 'en_cours', 'livre', 'livree']
      const rawItems = (Array.isArray(res.data) ? res.data : (res.data.data || []))
        .filter(r => allowedStatuses.includes(r.statut))
      
      const convPromises = rawItems.map(async (r) => {
        const v = r.voyage || {}
        const c = r.colis || {}
        const vUser = v.voyageur?.user || v.voyageur || {}
        const transporterName = `${vUser.prenom || ''} ${vUser.nom || ''}`.trim() || 'Transporteur GP'
        
        let lastMsg = 'Commencer la discussion...'
        let timeStr = formatVoyageDate(r.created_at)
        let unreadCount = 0

        try {
          const msgRes = await fetchReservationMessages(r.id, { markRead: false })
          const messages = msgRes && msgRes.data ? (Array.isArray(msgRes.data) ? msgRes.data : msgRes.data.data || []) : []
          if (messages.length > 0) {
            const last = messages[messages.length - 1]
            lastMsg = last.contenu || (last.piece_jointe ? '📷 Pièce jointe envoyée' : 'Message...')
            timeStr = formatVoyageDate(last.date_heure_envoi || last.created_at)
            unreadCount = messages.filter(m => !m.est_lu && (m.destinataire_id === currentUserId || (currentUserId && m.expediteur_id !== currentUserId))).length
          }
        } catch (e) {
          // If fetching messages for a reservation fails, fall back to initial info
        }

        return {
          id: r.id,
          maskedId: encodeId(r.id),
          transporterName,
          avatar: transporterName.slice(0, 2).toUpperCase(),
          time: timeStr,
          routeFrom: v.ville_depart || 'Départ',
          countryFrom: v.pays_depart || '',
          routeTo: v.ville_destination || 'Destination',
          countryTo: v.pays_destination || '',
          parcelCode: r.numero || (c.numero_suivi ? `#${c.numero_suivi}` : `#RS-${r.id.slice(0, 8)}`),
          lastMessage: lastMsg,
          unreadCount,
          hasUnread: unreadCount > 0,
          rawReservation: r
        }
      })

      conversations.value = await Promise.all(convPromises)
    }
  } catch (err) {
    if (!silent) errorMsg.value = err?.message || 'Erreur lors du chargement de vos conversations.'
  } finally {
    if (!silent) isLoading.value = false
  }
}

onMounted(async () => {
  if (route.query.success === 'wave') {
    const resId = route.query.reservation
    if (resId) {
      try {
        await checkWavePaymentStatus(resId)
      } catch (err) {
        console.warn('Vérification statut Wave:', err)
      }
    }
    Swal.fire({
      icon: 'success',
      title: 'Paiement Wave Confirmé !',
      text: 'Votre paiement a été validé avec succès. Vous pouvez maintenant échanger directement avec le transporteur.',
      confirmButtonColor: '#074C72'
    }).then(() => {
      if (resId) {
        router.push(`/client/messages/${encodeId(resId)}`)
      }
    })
  }

  loadConversations(false)
  pollTimer = setInterval(() => {
    loadConversations(true)
  }, 4000)
})

onUnmounted(() => {
  if (pollTimer) clearInterval(pollTimer)
})

const filteredConversations = computed(() => {
  if (!searchQuery.value.trim()) return conversations.value
  const q = searchQuery.value.toLowerCase().trim()
  return conversations.value.filter(c =>
    c.transporterName.toLowerCase().includes(q) ||
    c.parcelCode.toLowerCase().includes(q) ||
    c.routeFrom.toLowerCase().includes(q) ||
    c.routeTo.toLowerCase().includes(q) ||
    c.lastMessage.toLowerCase().includes(q)
  )
})

const openChat = (maskedId) => {
  router.push(`/client/messages/${maskedId}`)
}
</script>

<template>
  <div class="space-y-5 pb-16">
    <!-- Header Title & Subtitle -->
    <div class="space-y-1">
      <h1 class="text-xl sm:text-2xl font-serif font-bold text-principal-dark dark:text-sky-300">Messagerie Client</h1>
      <p class="text-xs sm:text-sm text-gray-500 dark:text-slate-400">Échangez directement avec vos transporteurs GP pour vos réservations</p>
    </div>

    <!-- Search Input -->
    <div class="relative">
      <div class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400 dark:text-slate-500">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </div>
      <input
        v-model="searchQuery"
        type="text"
        placeholder="Rechercher un transporteur, un trajet ou un n° de colis..."
        class="w-full bg-[#F3F4F6] dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl pl-10 pr-4 py-3 text-xs sm:text-sm placeholder-gray-400 dark:placeholder-slate-500 text-gray-800 dark:text-slate-100 outline-none focus:bg-white dark:focus:bg-slate-800 focus:ring-2 focus:ring-[#074C72]/20 focus:border-[#074C72] dark:focus:border-sky-400 transition-all font-medium"
      />
    </div>

    <!-- Loading State -->
    <div v-if="isLoading" class="bg-white dark:bg-slate-900 rounded-3xl p-12 text-center border border-gray-100 dark:border-slate-800 shadow-sm space-y-4">
      <div class="w-10 h-10 border-4 border-[#053754] dark:border-sky-400 border-t-transparent rounded-full animate-spin mx-auto"></div>
      <p class="text-sm font-bold text-gray-600 dark:text-slate-300">Chargement des conversations...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="errorMsg" class="bg-red-50 dark:bg-red-950/80 border border-red-200 dark:border-red-900 rounded-3xl p-8 text-center space-y-3">
      <p class="text-sm font-bold text-red-800 dark:text-red-300">{{ errorMsg }}</p>
      <button @click="loadConversations" class="px-4 py-2 bg-red-600 text-white font-bold text-xs rounded-xl cursor-pointer">Réessayer</button>
    </div>

    <!-- Conversations Cards List -->
    <div v-else-if="filteredConversations.length > 0" class="space-y-3">
      <div
        v-for="conv in filteredConversations"
        :key="conv.id"
        @click="openChat(conv.maskedId)"
        class="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-gray-200 dark:border-slate-800 hover:border-[#074C72]/40 dark:hover:border-sky-500 transition-all shadow-2xs cursor-pointer flex items-center gap-3.5 group relative overflow-hidden"
      >
        <!-- Unread Marker Line -->
        <div v-if="conv.hasUnread" class="absolute left-0 top-0 bottom-0 w-1 bg-[#B50302]"></div>

        <!-- RGP Avatar Circle -->
        <div class="w-12 h-12 sm:w-13 sm:h-13 rounded-full bg-[#053754] dark:bg-sky-600 text-white flex items-center justify-center font-extrabold text-sm shrink-0 shadow-xs group-hover:scale-105 transition-transform">
          {{ conv.avatar }}
        </div>

        <!-- Card Content -->
        <div class="flex-1 min-w-0 space-y-1.5">
          <!-- Top Row: Name + Time + Unread Badge -->
          <div class="flex items-center justify-between">
            <h3 class="text-sm font-extrabold text-[#053754] dark:text-sky-300 truncate flex items-center gap-1.5">
              <span>{{ conv.transporterName }}</span>
            </h3>
            <div class="flex items-center gap-2">
              <span class="text-xs text-gray-400 dark:text-slate-400 font-medium shrink-0">{{ conv.time }}</span>
              <span v-if="conv.unreadCount > 0" class="bg-[#B50302] text-white text-[10px] font-black px-2 py-0.5 rounded-full shrink-0 shadow-2xs">
                {{ conv.unreadCount }}
              </span>
            </div>
          </div>

          <!-- Middle Row: Route + Parcel ID -->
          <div class="flex items-center justify-between text-xs">
            <div class="flex items-center gap-1.5 font-bold text-gray-800 dark:text-slate-100">
              <CountryFlag :city="conv.routeFrom" :country="conv.countryFrom" size="w-4 h-3" />
              <span>{{ conv.routeFrom }}</span>
              <div class="w-4 h-4 rounded-full border border-gray-400 dark:border-slate-600 text-gray-600 dark:text-slate-300 flex items-center justify-center text-[10px]">
                ➔
              </div>
              <CountryFlag :city="conv.routeTo" :country="conv.countryTo" size="w-4 h-3" />
              <span>{{ conv.routeTo }}</span>
            </div>
            <span class="hidden sm:inline-block font-extrabold text-[#053754] dark:text-sky-300 text-xs shrink-0 font-mono bg-sky-50 dark:bg-sky-950/80 px-2 py-0.5 rounded border border-sky-100 dark:border-sky-800">{{ conv.parcelCode }}</span>
          </div>

          <!-- Bottom Row: Last Message -->
          <p class="text-xs text-gray-500 dark:text-slate-400 truncate leading-tight">
            {{ conv.lastMessage }}
          </p>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else class="bg-white dark:bg-slate-900 rounded-3xl p-10 text-center border border-gray-200 dark:border-slate-800 space-y-2">
      <div class="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center text-xl mx-auto font-bold">
        💬
      </div>
      <p class="text-sm font-bold text-gray-700 dark:text-slate-200">Aucune conversation trouvée.</p>
      <p class="text-xs text-gray-400 dark:text-slate-400">Vos échanges relatifs à vos réservations s'afficheront ici.</p>
    </div>
  </div>
</template>
