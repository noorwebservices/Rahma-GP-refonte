<script setup>
import { ref, computed, watch, onMounted, onUnmounted, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from '@/composables/useI18n'
import Swal from 'sweetalert2'
import { fetchReservation, updateColisStatut } from '@/services/reservationService'
import { fetchReservationMessages, sendReservationMessage } from '@/services/messageService'
import { formatVoyageDate } from '@/utils/flagHelper'
import CountryFlag from '@/components/common/CountryFlag.vue'
import { decodeId, encodeId } from '@/utils/idMasker'

const { t } = useI18n()
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

const showStatusModal = ref(false)
const selectedColisStatut = ref('en_transit')
const colisCommentaire = ref('')
const isSubmittingColisStatut = ref(false)

let lastMessageId = null
let pollTimer = null

const colisStatutOptions = [
  { value: 'colis_depose', label: '📍 Colis déposé au point relais' },
  { value: 'colis_pris_en_charge', label: '🧳 Colis pris en charge par le GP' },
  { value: 'en_transit', label: '✈️ En transit / En vol' },
  { value: 'arrive', label: '🛬 Arrivé au point de destination' },
  { value: 'livre', label: '🎁 Livré au destinataire' }
]

const isVoyageClosedOrCompleted = computed(() => {
  if (!reservation.value) return false
  const vStatut = (reservation.value.voyageStatut || '').toLowerCase()
  const isClosedStatut = ['complet', 'ferme', 'cloture', 'termine'].includes(vStatut)
  const isPastDepart = reservation.value.departureDate ? new Date(reservation.value.departureDate) <= new Date() : false
  return isClosedStatut || isPastDepart
})

const availableColisStatutOptions = computed(() => {
  if (!reservation.value) return colisStatutOptions

  const doneStatuts = new Set()
  if (Array.isArray(reservation.value.suivis)) {
    reservation.value.suivis.forEach(s => {
      if (s && s.statut) {
        doneStatuts.add(s.statut)
      }
    })
  }

  if (reservation.value.colisStatut) {
    doneStatuts.add(reservation.value.colisStatut)
  }

  const statusLevels = {
    'colis_depose': 1,
    'colis_pris_en_charge': 2,
    'en_transit': 3,
    'arrive': 4,
    'livre': 5,
    'livree': 5
  }

  let maxLevelAchieved = 0
  doneStatuts.forEach(st => {
    if (statusLevels[st] && statusLevels[st] > maxLevelAchieved) {
      maxLevelAchieved = statusLevels[st]
    }
  })

  return colisStatutOptions.filter(opt => {
    const level = statusLevels[opt.value]
    if (level !== maxLevelAchieved + 1) return false
    if (!isVoyageClosedOrCompleted.value && ['en_transit', 'arrive', 'livre', 'livree'].includes(opt.value)) {
      return false
    }
    return true
  })
})

watch(availableColisStatutOptions, (opts) => {
  if (opts && opts.length > 0) {
    if (!opts.some(o => o.value === selectedColisStatut.value)) {
      selectedColisStatut.value = opts[0].value
    }
  }
}, { immediate: true })

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
      const u = data.client?.user || {}
      const clientName = `${u.prenom || ''} ${u.nom || data.expediteur_nom || ''}`.trim() || 'Client Rahma'

      reservation.value = {
        id: data.id,
        colisId: c.id || null,
        code: data.numero || (c.numero_suivi ? `#${c.numero_suivi}` : `#RS-${data.id.slice(0, 8)}`),
        trackingCode: c.numero_suivi || data.code_tracking || 'TRK-EN-ATTENTE',
        statut: data.statut || 'en_attente',
        colisStatut: c.statut || 'demande_envoyee',
        suivis: Array.isArray(c.suivis) ? c.suivis : [],
        voyageStatut: v.statut || 'publie',
        departureDate: v.date_depart,
        
        villeDepart: v.ville_depart || 'Départ',
        paysDepart: v.pays_depart || '',
        villeDestination: v.ville_destination || 'Destination',
        paysDestination: v.pays_destination || '',
        
        poids: c.poids ? `${c.poids} Kg` : (data.poids ? `${data.poids} Kg` : 'Forfait Objet'),
        clientNom: clientName,
        clientPhone: u.telephone || data.expediteur_telephone || 'Non renseigné',
        clientAvatar: clientName.slice(0, 2).toUpperCase()
      }
    }
  } catch (err) {
    console.error('Erreur chargement reservation chat voyageur:', err)
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

  // Optimistic UI update
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

const handleUpdateColisStatut = async () => {
  if (!reservation.value || !reservation.value.colisId) {
    Swal.fire({ icon: 'warning', title: 'Erreur', text: 'Identifiant de colis introuvable.' })
    return
  }

  isSubmittingColisStatut.value = true
  try {
    const payload = {
      statut: selectedColisStatut.value,
      commentaire: colisCommentaire.value.trim() || undefined
    }
    await updateColisStatut(reservation.value.colisId, payload)

    Swal.fire({
      toast: true,
      position: 'top-end',
      icon: 'success',
      title: 'Statut du colis mis à jour avec succès !',
      showConfirmButton: false,
      timer: 3000
    })

    showStatusModal.value = false
    colisCommentaire.value = ''
    await loadReservationData()
  } catch (err) {
    Swal.fire({
      icon: 'error',
      title: 'Erreur',
      text: err?.message || err?.data?.message || 'Impossible de mettre à jour le statut.'
    })
  } finally {
    isSubmittingColisStatut.value = false
  }
}

const goBack = () => {
  router.push('/voyageur/messages')
}
</script>

<template>
  <div class="flex flex-col h-[calc(100vh-140px)] max-h-[800px] -mx-4 sm:-mx-6 bg-[#FAF7F2] dark:bg-slate-950 relative">
    
    <!-- Loading State -->
    <div v-if="isLoading" class="flex-1 flex items-center justify-center p-8">
      <div class="text-center space-y-3">
        <div class="w-10 h-10 border-4 border-[#053754] dark:border-sky-400 border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p class="text-xs font-bold text-gray-600 dark:text-slate-300">{{ t('voyageur.messages.loadingChat', 'Chargement de la discussion...') }}</p>
      </div>
    </div>

    <template v-else>
      <!-- Top Chat Sub-Header -->
      <div class="bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-800 px-4 py-3 space-y-2.5 shrink-0 shadow-2xs">
        <div class="flex items-center justify-between">
          <!-- Left: Back Arrow + Client Info -->
          <div class="flex items-center gap-3">
            <button
              @click="goBack"
              class="w-8 h-8 rounded-full bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 flex items-center justify-center text-gray-700 dark:text-slate-300 transition-colors cursor-pointer"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </button>

            <div class="w-10 h-10 rounded-full bg-[#B50302] dark:bg-red-700 text-white flex items-center justify-center font-bold text-xs shrink-0">
              {{ reservation?.clientAvatar || 'CL' }}
            </div>

            <div>
              <h2 class="text-sm font-extrabold text-[#053754] dark:text-sky-300">{{ reservation?.clientNom || 'Client' }}</h2>
              <p class="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                <span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                <span>{{ t('voyageur.messages.clientTag', 'Client Rahma GP') }}</span>
              </p>
            </div>
          </div>

          <!-- Right: Action Button "Mettre à jour le suivi" -->
          <button
            @click="showStatusModal = true"
            class="bg-[#053754] dark:bg-sky-600 hover:bg-[#074C72] dark:hover:bg-sky-500 text-white font-extrabold text-xs px-3.5 py-1.5 rounded-xl transition-colors cursor-pointer flex items-center gap-1.5 shadow-2xs uppercase tracking-wider"
          >
            <span>{{ t('voyageur.messages.parcelTrackingBtn', '📦 SUIVI COLIS') }}</span>
          </button>
        </div>

        <!-- Parcel Code & Route Pill -->
        <div v-if="reservation" class="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-xl px-4 py-2 flex items-center justify-between text-xs font-bold shadow-2xs">
          <span class="text-[#074C72] dark:text-sky-300 font-black font-mono">{{ reservation.code }}</span>
          <div class="flex items-center gap-1.5 text-gray-700 dark:text-slate-300">
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
      <div v-if="reservation" class="bg-emerald-50 dark:bg-emerald-950/40 border-b border-emerald-200/80 dark:border-emerald-900/60 px-4 py-2 text-center text-xs font-bold text-emerald-800 dark:text-emerald-300 shrink-0 flex items-center justify-center gap-2">
        <span>{{ t('common.status', 'Statut réservation :') }}</span>
        <span class="bg-emerald-100 dark:bg-emerald-900/80 text-emerald-900 dark:text-emerald-200 px-2.5 py-0.5 rounded-full uppercase text-[10px] tracking-wider">
          {{ reservation.statut === 'acceptee' ? '✓ ' + t('status.accepted', 'Réservation Acceptée') : reservation.statut }}
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
              ? 'bg-[#053754] dark:bg-sky-700 text-white rounded-2xl rounded-tr-xs'
              : 'bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 text-gray-800 dark:text-slate-100 rounded-2xl rounded-tl-xs'"
          >
            <span v-if="!msg.isMine" class="text-[10px] font-extrabold text-[#B50302] dark:text-red-400 block">
              {{ msg.senderName }}
            </span>

            <p class="text-xs sm:text-sm leading-relaxed whitespace-pre-line font-medium">
              {{ msg.text }}
            </p>

            <div v-if="msg.attachment" class="pt-1">
              <a :href="msg.attachment" target="_blank" class="block rounded-xl overflow-hidden border border-white/20">
                <img :src="msg.attachment" alt="Pièce jointe" class="max-h-48 w-full object-cover" />
              </a>
            </div>

            <div
              class="text-[10px] text-right font-medium flex items-center justify-end gap-1"
              :class="msg.isMine ? 'text-sky-200/80' : 'text-gray-400 dark:text-slate-500'"
            >
              <span>{{ msg.time }}</span>
              <span v-if="msg.isMine" class="text-xs font-bold">{{ msg.isRead ? '✓✓' : '✓' }}</span>
            </div>
          </div>
        </div>

        <div v-if="messages.length === 0" class="text-center py-12 text-gray-400 dark:text-slate-500 text-xs space-y-1">
          <p class="font-bold">{{ t('messages.noMessagesYet', 'Aucun message pour l\'instant.') }}</p>
          <p>{{ t('voyageur.messages.sendMsgHint', 'Envoyez un message ci-dessous pour contacter le client.') }}</p>
        </div>
      </div>

      <!-- Attachment URL Input Bar (Collapsible) -->
      <div v-if="showAttachmentInput" class="bg-amber-50 dark:bg-amber-950/40 border-t border-amber-200 dark:border-amber-900/60 px-4 py-2 flex items-center gap-2 shrink-0">
        <span class="text-xs text-amber-900 dark:text-amber-200 font-bold shrink-0">{{ t('voyageur.messages.attachmentLabel', '📷 Lien photo / pièce jointe :') }}</span>
        <input
          v-model="pieceJointe"
          type="url"
          placeholder="https://example.com/photo.jpg"
          class="flex-1 px-3 py-1.5 bg-white dark:bg-slate-900 border border-amber-300 dark:border-amber-800 text-xs text-gray-800 dark:text-slate-100 outline-none"
        />
        <button @click="showAttachmentInput = false" class="text-xs text-gray-500 dark:text-slate-400 font-bold px-2">✕</button>
      </div>

      <!-- Bottom Input Bar -->
      <div class="bg-white dark:bg-slate-900 border-t border-gray-200 dark:border-slate-800 px-4 py-3 shrink-0">
        <form @submit.prevent="handleSendMessage" class="flex items-center gap-2">
          <button
            @click="showAttachmentInput = !showAttachmentInput"
            type="button"
            class="w-9 h-9 rounded-full hover:bg-gray-100 dark:hover:bg-slate-800 flex items-center justify-center text-gray-500 dark:text-slate-400 hover:text-[#074C72] dark:hover:text-sky-300 text-2xl font-bold transition-colors cursor-pointer shrink-0"
            :class="{ 'text-[#074C72] dark:text-sky-300 bg-sky-100 dark:bg-sky-950/60': showAttachmentInput }"
          >
            +
          </button>

          <input
            v-model="newMessage"
            @input="handleMessageInput"
            type="text"
            :placeholder="t('voyageur.messages.typePlaceholder')"
            class="flex-1 bg-[#EAEFF4] dark:bg-slate-800 border-none rounded-xl px-4 py-2.5 text-xs sm:text-sm text-gray-800 dark:text-slate-100 placeholder-gray-400 dark:placeholder-slate-500 outline-none focus:ring-2 focus:ring-[#074C72]/20 dark:focus:ring-sky-500/20"
          />

          <button
            type="submit"
            :disabled="isSending || (!newMessage.trim() && !pieceJointe.trim())"
            class="w-9 h-9 text-[#053754] dark:text-sky-300 hover:text-[#074C72] dark:hover:text-sky-400 flex items-center justify-center transition-colors cursor-pointer shrink-0 disabled:opacity-40"
          >
            <svg class="w-6 h-6 transform rotate-45" fill="currentColor" viewBox="0 0 24 24">
              <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
            </svg>
          </button>
        </form>
      </div>
    </template>

    <!-- Status Change Modal ("Mettre à jour le suivi") -->
    <Teleport to="body">
      <div v-if="showStatusModal" class="fixed inset-0 z-50 bg-black/60 dark:bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
        <div class="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 text-slate-800 dark:text-slate-100 rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl animate-in zoom-in-95 duration-200">
          <div class="flex items-center justify-between border-b border-gray-100 dark:border-slate-800 pb-3">
            <h3 class="text-base font-extrabold text-[#053754] dark:text-sky-300">{{ t('voyageur.demandeDetail.updateStatusModalTitle', 'Mettre à jour le statut du colis') }}</h3>
            <button @click="showStatusModal = false" class="text-gray-400 dark:text-slate-400 hover:text-gray-600 dark:hover:text-slate-200">✕</button>
          </div>

          <p class="text-xs text-gray-500 dark:text-slate-400">{{ t('voyageur.demandeDetail.updateStatusDesc', 'Mettez à jour le statut d\'acheminement pour informer le client en temps réel :') }}</p>

          <div class="space-y-3">
            <div>
              <label class="block text-xs font-bold text-[#074C72] dark:text-sky-300 mb-1">{{ t('voyageur.demandeDetail.newParcelStatus', 'Nouveau statut du colis') }}</label>
              <select
                v-if="availableColisStatutOptions.length > 0"
                v-model="selectedColisStatut"
                class="w-full px-3.5 py-2.5 bg-white dark:bg-slate-900 border border-gray-300 dark:border-slate-700 text-xs font-bold text-gray-800 dark:text-slate-100 outline-none focus:border-[#074C72] dark:focus:border-sky-500"
              >
                <option v-for="opt in availableColisStatutOptions" :key="opt.value" :value="opt.value">
                  {{ opt.label }}
                </option>
              </select>
              <div v-else class="px-3.5 py-2.5 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 rounded-xl text-xs font-bold flex items-center gap-1.5">
                <span>🎉</span>
                <span>{{ t('voyageur.demandeDetail.allStatusesApplied', 'Tous les statuts de suivi ont été appliqués') }}</span>
              </div>
              <div v-if="!isVoyageClosedOrCompleted" class="mt-2 p-2.5 bg-amber-50 dark:bg-amber-950/60 text-amber-900 dark:text-amber-200 border border-amber-200 dark:border-amber-800 rounded-xl text-[11px] font-medium flex items-start gap-1.5">
                <span class="shrink-0 mt-0.5">⏳</span>
                <span>{{ t('voyageur.demandeDetail.ongoingTripNotice', 'Voyage en cours : les statuts Transit, Arrivé et Livré seront débloqués quand le voyage sera complet/fermé ou sa date de départ passée.') }}</span>
              </div>
            </div>

            <div>
              <label class="block text-xs font-bold text-[#074C72] dark:text-sky-300 mb-1">{{ t('voyageur.demandeDetail.commentOptional', 'Commentaire (optionnel)') }}</label>
              <input
                v-model="colisCommentaire"
                type="text"
                placeholder="ex: Le colis est dans l'avion..."
                class="w-full px-3.5 py-2.5 bg-white dark:bg-slate-900 border border-gray-300 dark:border-slate-700 text-gray-800 dark:text-slate-100 placeholder-gray-400 dark:placeholder-slate-500 rounded-xl text-xs outline-none focus:border-[#074C72] dark:focus:border-sky-500"
              />
            </div>
          </div>

          <div class="flex items-center gap-2 pt-2">
            <button
              @click="showStatusModal = false"
              class="flex-1 bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-slate-300 font-bold text-xs py-3 rounded-xl hover:bg-gray-200 dark:hover:bg-slate-700 transition-colors"
            >
              {{ t('common.cancel', 'Annuler') }}
            </button>
            <button
              @click="handleUpdateColisStatut"
              :disabled="isSubmittingColisStatut"
              class="flex-1 bg-[#053754] dark:bg-sky-600 text-white font-extrabold text-xs py-3 rounded-xl hover:bg-[#074C72] dark:hover:bg-sky-500 transition-colors flex items-center justify-center gap-1 disabled:opacity-50"
            >
              <span v-if="isSubmittingColisStatut" class="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
              <span>{{ t('common.validate', 'VALIDER') }}</span>
            </button>
          </div>
        </div>
      </div>
    </Teleport>

  </div>
</template>
