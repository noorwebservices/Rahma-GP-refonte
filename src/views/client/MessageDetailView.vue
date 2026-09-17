<script setup>
import { ref, onMounted, onUnmounted, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import Swal from 'sweetalert2'
import { fetchReservation } from '@/services/reservationService'
import { fetchReservationMessages, sendReservationMessage } from '@/services/messageService'
import { formatVoyageDate } from '@/utils/flagHelper'
import CountryFlag from '@/components/common/CountryFlag.vue'
import { decodeId, encodeId } from '@/utils/idMasker'
import ReportUserModal from '@/components/ReportUserModal.vue'
import { useI18n } from '@/composables/useI18n'

const { t } = useI18n()

const showReportModal = ref(false)

const route = useRoute()
const router = useRouter()
const maskedId = route.params.id

const isLoading = ref(true)
const errorMsg = ref('')
const reservation = ref(null)
const messages = ref([])
const newMessage = ref('')
const pieceJointe = ref('')
const showAttachmentInput = ref(false)
const isSending = ref(false)
const chatContainer = ref(null)

let lastMessageId = null
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

const scrollToBottom = () => {
  nextTick(() => {
    if (chatContainer.value) {
      chatContainer.value.scrollTop = chatContainer.value.scrollHeight
    }
  })
}

const loadReservationData = async () => {
  try {
    const res = await fetchReservation(maskedId)
    if (res && res.data) {
      const data = res.data
      const v = data.voyage || {}
      const c = data.colis || {}
      const vUser = v.voyageur?.user || v.voyageur || {}
      const vUserId = vUser.id || v.voyageur?.user_id || v.voyageur?.user?.id || null
      const transporteurName = `${vUser.prenom || ''} ${vUser.nom || ''}`.trim() || 'Transporteur GP'

      reservation.value = {
        id: data.id,
        voyageurUserId: vUserId,
        code: data.numero || (c.numero_suivi ? `#${c.numero_suivi}` : `#RS-${data.id.slice(0, 8)}`),
        trackingCode: c.numero_suivi || data.code_tracking || 'TRK-EN-ATTENTE',
        statut: data.statut || 'en_attente',
        
        villeDepart: v.ville_depart || 'Départ',
        paysDepart: v.pays_depart || '',
        villeDestination: v.ville_destination || 'Destination',
        paysDestination: v.pays_destination || '',
        
        poids: c.poids ? `${c.poids} Kg` : (data.poids ? `${data.poids} Kg` : 'Forfait Objet'),
        transporteurNom: transporteurName,
        transporteurAvatar: transporteurName.slice(0, 2).toUpperCase()
      }
    }
  } catch (err) {
    console.error('Erreur chargement reservation chat:', err)
  }
}

const loadMessages = async (silent = false) => {
  if (!silent) isLoading.value = true
  try {
    const res = await fetchReservationMessages(maskedId)
    if (res && res.data) {
      const list = Array.isArray(res.data) ? res.data : (res.data.data || [])
      messages.value = list.map(m => {
        const isMine = currentUserId ? (m.expediteur_id === currentUserId || m.expediteur?.id === currentUserId) : true
        if (m.id && (lastMessageId === null || m.id > lastMessageId)) {
          lastMessageId = m.id
        }
        return {
          id: m.id,
          senderId: m.expediteur_id,
          senderName: `${m.expediteur?.prenom || ''} ${m.expediteur?.nom || ''}`.trim() || 'Utilisateur',
          isMine,
          text: m.contenu || '',
          attachment: m.piece_jointe || null,
          time: formatVoyageDate(m.date_heure_envoi || m.created_at),
          isRead: Boolean(m.est_lu)
        }
      })
      scrollToBottom()
    }
  } catch (err) {
    if (!silent) errorMsg.value = err?.message || 'Erreur lors du chargement de la discussion.'
  } finally {
    if (!silent) isLoading.value = false
  }
}

const pollNewMessages = async () => {
  try {
    const res = await fetchReservationMessages(maskedId, { markRead: true })
    if (res && res.data) {
      const list = Array.isArray(res.data) ? res.data : (res.data.data || [])
      let hasNew = false
      list.forEach(m => {
        const isMine = currentUserId ? (m.expediteur_id === currentUserId || m.expediteur?.id === currentUserId) : true
        const existing = messages.value.find(msg => String(msg.id) === String(m.id))
        if (existing) {
          existing.isRead = Boolean(m.est_lu)
        } else {
          messages.value.push({
            id: m.id,
            senderId: m.expediteur_id,
            senderName: `${m.expediteur?.prenom || ''} ${m.expediteur?.nom || ''}`.trim() || 'Utilisateur',
            isMine,
            text: m.contenu || '',
            attachment: m.piece_jointe || null,
            time: formatVoyageDate(m.date_heure_envoi || m.created_at),
            isRead: Boolean(m.est_lu)
          })
          hasNew = true
        }
      })
      if (hasNew) scrollToBottom()
    }
  } catch (e) {
    // Silent fail during poll
  }
}

const handleVisibilityChange = () => {
  if (!document.hidden) {
    pollNewMessages()
  }
}

onMounted(async () => {
  await loadReservationData()
  await loadMessages(false)
  // Fast 2-second real-time polling
  pollTimer = setInterval(pollNewMessages, 2000)
  document.addEventListener('visibilitychange', handleVisibilityChange)
  window.addEventListener('focus', pollNewMessages)
})

onUnmounted(() => {
  if (pollTimer) clearInterval(pollTimer)
  document.removeEventListener('visibilitychange', handleVisibilityChange)
  window.removeEventListener('focus', pollNewMessages)
})

import { containsPhoneOrEmail, stripPhoneAndEmail } from '@/utils/securityFilter'

const handleMessageInput = () => {
  if (containsPhoneOrEmail(newMessage.value).isForbidden) {
    newMessage.value = stripPhoneAndEmail(newMessage.value)
  }
}

const handleSendMessage = async () => {
  if (containsPhoneOrEmail(newMessage.value).isForbidden) {
    newMessage.value = stripPhoneAndEmail(newMessage.value)
  }

  const textToSend = newMessage.value.trim()
  const attachmentToSend = pieceJointe.value.trim()

  if (!textToSend && !attachmentToSend) return

  // Optimistic UI update: display message immediately with temp ID
  const tempId = `temp-${Date.now()}`
  const tempMsgObj = {
    id: tempId,
    senderId: currentUserId,
    senderName: 'Moi',
    isMine: true,
    text: textToSend,
    attachment: attachmentToSend || null,
    time: formatVoyageDate(new Date().toISOString()),
    isRead: false,
    isPending: true
  }

  messages.value.push(tempMsgObj)
  newMessage.value = ''
  pieceJointe.value = ''
  showAttachmentInput.value = false
  scrollToBottom()

  isSending.value = true
  try {
    const payload = {
      contenu: textToSend,
      piece_jointe: attachmentToSend || undefined
    }

    const res = await sendReservationMessage(maskedId, payload)
    const returnedMsg = res?.data?.data || res?.data
    if (returnedMsg && returnedMsg.id) {
      const idx = messages.value.findIndex(m => m.id === tempId)
      if (idx !== -1) {
        messages.value[idx].id = returnedMsg.id
        messages.value[idx].isPending = false
        if (returnedMsg.id > (lastMessageId || 0)) {
          lastMessageId = returnedMsg.id
        }
      }
    } else {
      await pollNewMessages()
    }
  } catch (err) {
    // Remove temp message on error
    messages.value = messages.value.filter(m => m.id !== tempId)
    Swal.fire({
      icon: 'error',
      title: 'Erreur',
      text: err?.message || err?.data?.message || 'Impossible d\'envoyer le message.'
    })
  } finally {
    isSending.value = false
  }
}

const goBack = () => {
  router.push('/client/messages')
}

const goToTracking = () => {
  if (reservation.value?.id) {
    router.push(`/client/colis/${encodeId(reservation.value.id)}`)
  } else {
    router.push('/client/colis')
  }
}
</script>

<template>
  <div class="flex flex-col h-[calc(100vh-140px)] max-h-[800px] -mx-4 sm:-mx-6 bg-[#FAF7F2] dark:bg-slate-950 relative transition-colors duration-300">
    
    <!-- Loading State -->
    <div v-if="isLoading" class="flex-1 flex items-center justify-center p-8">
      <div class="text-center space-y-3">
        <div class="w-10 h-10 border-4 border-[#053754] dark:border-sky-400 border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p class="text-xs font-bold text-gray-600 dark:text-slate-300">{{ t('messages.loadingChat', 'Chargement de la discussion...') }}</p>
      </div>
    </div>

    <template v-else>
      <!-- Top Chat Sub-Header -->
      <div class="bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-800 px-4 py-3 space-y-2.5 shrink-0 shadow-2xs">
        <div class="flex items-center justify-between">
          <!-- Left: Back Arrow + Transporter Info -->
          <div class="flex items-center gap-3">
            <button
              @click="goBack"
              class="w-8 h-8 rounded-full bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 text-gray-700 dark:text-slate-200 transition-colors cursor-pointer"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </button>

            <div class="w-10 h-10 rounded-full bg-[#053754] dark:bg-sky-600 text-white flex items-center justify-center font-bold text-xs shrink-0">
              {{ reservation?.transporteurAvatar || 'GP' }}
            </div>

            <div>
              <h2 class="text-sm font-extrabold text-[#053754] dark:text-sky-300">{{ reservation?.transporteurNom || 'Transporteur GP' }}</h2>
              <p class="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                <span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                <span>{{ t('messages.online') }}</span>
              </p>
            </div>
          </div>

          <!-- Right: Suivi & Signaler Buttons -->
          <div class="flex items-center gap-2">
            <button
              @click="showReportModal = true"
              :title="t('voyageDetail.reportAccount', 'Signaler ce compte')"
              class="bg-red-50 dark:bg-red-950/80 hover:bg-red-100 dark:hover:bg-red-900 text-red-600 dark:text-red-300 font-extrabold text-xs px-2.5 py-1.5 rounded-xl transition-colors cursor-pointer flex items-center gap-1 border border-red-100 dark:border-red-900 shadow-2xs"
            >
              <span>🚩</span>
              <span class="hidden sm:inline">{{ t('voyageDetail.reportAccount') }}</span>
            </button>

            <button
              @click="goToTracking"
              class="bg-[#D8ECF8] dark:bg-sky-950/80 hover:bg-sky-200 dark:hover:bg-sky-900 text-[#074C72] dark:text-sky-300 font-extrabold text-xs px-3.5 py-1.5 rounded-xl transition-colors cursor-pointer flex items-center gap-1.5 shadow-2xs border border-transparent dark:border-sky-800"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
              {{ t('parcels.trackParcel') }}
            </button>
          </div>
        </div>

        <!-- Parcel Code & Route Pill -->
        <div v-if="reservation" class="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-xl px-4 py-2 flex items-center justify-between text-xs font-bold shadow-2xs">
          <span class="text-[#074C72] dark:text-sky-300 font-black font-mono">{{ reservation.code }}</span>
          <div class="flex items-center gap-1.5 text-gray-700 dark:text-slate-200">
            <CountryFlag :city="reservation.villeDepart" :country="reservation.paysDepart" size="w-4 h-3" />
            <span>{{ reservation.villeDepart }}</span>
            <span class="text-[#074C72] dark:text-sky-300">➔</span>
            <CountryFlag :city="reservation.villeDestination" :country="reservation.paysDestination" size="w-4 h-3" />
            <span>{{ reservation.villeDestination }}</span>
          </div>
          <span class="text-[#B50302] dark:text-red-400 font-extrabold">{{ reservation.poids }}</span>
        </div>
      </div>

      <!-- Status Banner -->
      <div v-if="reservation" class="bg-sky-50/80 dark:bg-slate-900 border-b border-sky-100 dark:border-slate-800 px-4 py-1.5 text-center text-xs font-bold text-[#053754] dark:text-sky-300 shrink-0 flex items-center justify-center gap-1.5">
        <span>{{ t('common.status') }} :</span>
        <span class="uppercase tracking-wider text-[11px] font-extrabold" :class="reservation.statut === 'acceptee' ? 'text-emerald-700 dark:text-emerald-300' : 'text-amber-700 dark:text-amber-300'">
          {{ reservation.statut === 'acceptee' ? '✓ ' + t('status.accepted') : reservation.statut === 'en_attente' ? '⏳ ' + t('status.pending') : reservation.statut }}
        </span>
      </div>

      <!-- Chat Messages Scroll Area -->
      <div ref="chatContainer" class="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        <div
          v-for="msg in messages"
          :key="msg.id"
          class="flex flex-col"
          :class="msg.isMine ? 'items-end' : 'items-start'"
        >
          <!-- Message Bubble -->
          <div
            class="max-w-[85%] sm:max-w-[75%] p-3.5 space-y-2 shadow-2xs"
            :class="msg.isMine
              ? 'bg-[#053754] dark:bg-sky-600 text-white rounded-2xl rounded-tr-xs'
              : 'bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 text-gray-800 dark:text-slate-100 rounded-2xl rounded-tl-xs'"
          >
            <!-- Sender name if group/received -->
            <span v-if="!msg.isMine" class="text-[10px] font-extrabold text-[#074C72] dark:text-sky-300 block">
              {{ msg.senderName }}
            </span>

            <p class="text-xs sm:text-sm leading-relaxed whitespace-pre-line font-medium">
              {{ msg.text }}
            </p>

            <!-- Attachment Image/Link if any -->
            <div v-if="msg.attachment" class="pt-1">
              <a :href="msg.attachment" target="_blank" class="block rounded-xl overflow-hidden border border-white/20">
                <img :src="msg.attachment" alt="Pièce jointe" class="max-h-48 w-full object-cover" />
              </a>
            </div>

            <div
              class="text-[10px] text-right font-medium flex items-center justify-end gap-1"
              :class="msg.isMine ? 'text-sky-200/80' : 'text-gray-400 dark:text-slate-400'"
            >
              <span>{{ msg.time }}</span>
              <span v-if="msg.isMine" class="text-xs font-bold">{{ msg.isRead ? '✓✓' : '✓' }}</span>
            </div>
          </div>
        </div>

        <!-- Empty Messages Placeholder -->
        <div v-if="messages.length === 0" class="text-center py-12 text-gray-400 dark:text-slate-400 text-xs space-y-1">
          <p class="font-bold">{{ t('messages.noMessagesYet') }}</p>
        </div>
      </div>

      <!-- Attachment URL Input Bar (Collapsible) -->
      <div v-if="showAttachmentInput" class="bg-amber-50 dark:bg-amber-950/80 border-t border-amber-200 dark:border-amber-900 px-4 py-2 flex items-center gap-2 shrink-0">
        <span class="text-xs text-amber-900 dark:text-amber-300 font-bold shrink-0">{{ t('voyageur.messages.attachmentLabel', '📷 Lien photo :') }}</span>
        <input
          v-model="pieceJointe"
          type="url"
          placeholder="https://example.com/photo.jpg"
          class="flex-1 px-3 py-1.5 bg-white dark:bg-slate-800 border border-amber-300 dark:border-amber-800 rounded-lg text-xs outline-none text-gray-800 dark:text-slate-100 placeholder-gray-400 dark:placeholder-slate-500"
        />
        <button @click="showAttachmentInput = false" class="text-xs text-gray-500 dark:text-slate-400 font-bold px-2">✕</button>
      </div>

      <!-- Bottom Input Bar -->
      <div class="bg-white dark:bg-slate-900 border-t border-gray-200 dark:border-slate-800 px-4 py-3 shrink-0">
        <form @submit.prevent="handleSendMessage" class="flex items-center gap-2">
          <!-- Plus Attachment Toggle Button -->
          <button
            @click="showAttachmentInput = !showAttachmentInput"
            type="button"
            class="w-9 h-9 rounded-full hover:bg-gray-100 dark:hover:bg-slate-800 flex items-center justify-center text-gray-500 dark:text-slate-400 hover:text-[#074C72] dark:hover:text-sky-300 text-2xl font-bold transition-colors cursor-pointer shrink-0"
            :class="{ 'text-[#074C72] dark:text-sky-300 bg-sky-100 dark:bg-sky-950': showAttachmentInput }"
          >
            +
          </button>

          <!-- Message Input -->
          <input
            v-model="newMessage"
            @input="handleMessageInput"
            type="text"
            :placeholder="t('messages.typePlaceholder')"
            class="flex-1 bg-[#EAEFF4] dark:bg-slate-800 border-none rounded-xl px-4 py-2.5 text-xs sm:text-sm text-gray-800 dark:text-slate-100 placeholder-gray-400 dark:placeholder-slate-500 outline-none focus:ring-2 focus:ring-[#074C72]/20 dark:focus:ring-sky-400/20 font-medium"
          />

          <!-- Send Arrow Button -->
          <button
            type="submit"
            :disabled="isSending || (!newMessage.trim() && !pieceJointe.trim())"
            class="w-9 h-9 text-[#053754] dark:text-sky-400 hover:text-[#074C72] dark:hover:text-sky-300 flex items-center justify-center transition-colors cursor-pointer shrink-0 disabled:opacity-40"
          >
            <svg class="w-6 h-6 transform rotate-45" fill="currentColor" viewBox="0 0 24 24">
              <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
            </svg>
          </button>
        </form>
      </div>
    </template>

    <!-- Modal de Signalement -->
    <ReportUserModal 
      :show="showReportModal" 
      :target-user="reservation?.voyageurUserId ? { id: reservation.voyageurUserId, prenom: reservation.transporteurNom, nom: '' } : null"
      @close="showReportModal = false"
    />

  </div>
</template>
