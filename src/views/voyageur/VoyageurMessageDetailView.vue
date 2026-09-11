<script setup>
import { ref, onMounted, onUnmounted, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import Swal from 'sweetalert2'
import { fetchReservation, updateColisStatut } from '@/services/reservationService'
import { fetchReservationMessages, sendReservationMessage } from '@/services/messageService'
import { formatVoyageDate } from '@/utils/flagHelper'
import CountryFlag from '@/components/common/CountryFlag.vue'
import { decodeId, encodeId } from '@/utils/idMasker'

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

let pollTimer = null

const colisStatutOptions = [
  { value: 'colis_depose', label: '📍 Colis déposé au point relais' },
  { value: 'colis_pris_en_charge', label: '🧳 Colis pris en charge par le GP' },
  { value: 'en_transit', label: '✈️ En transit / En vol' },
  { value: 'arrive', label: '🛬 Arrivé au point de destination' },
  { value: 'livre', label: '🎁 Livré au destinataire' }
]

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

onMounted(async () => {
  await loadReservationData()
  await loadMessages(false)
  pollTimer = setInterval(() => {
    loadMessages(true)
  }, 4000)
})

onUnmounted(() => {
  if (pollTimer) clearInterval(pollTimer)
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

  if (!newMessage.value.trim() && !pieceJointe.value.trim()) return

  isSending.value = true
  try {
    const payload = {
      contenu: newMessage.value.trim(),
      piece_jointe: pieceJointe.value.trim() || undefined
    }

    await sendReservationMessage(maskedId, payload)
    newMessage.value = ''
    pieceJointe.value = ''
    showAttachmentInput.value = false
    await loadMessages(true)
  } catch (err) {
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
  <div class="flex flex-col h-[calc(100vh-140px)] max-h-[800px] -mx-4 sm:-mx-6 bg-[#FAF7F2] relative">
    
    <!-- Loading State -->
    <div v-if="isLoading" class="flex-1 flex items-center justify-center p-8">
      <div class="text-center space-y-3">
        <div class="w-10 h-10 border-4 border-[#053754] border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p class="text-xs font-bold text-gray-600">Chargement de la discussion...</p>
      </div>
    </div>

    <template v-else>
      <!-- Top Chat Sub-Header -->
      <div class="bg-white border-b border-gray-200 px-4 py-3 space-y-2.5 shrink-0 shadow-2xs">
        <div class="flex items-center justify-between">
          <!-- Left: Back Arrow + Client Info -->
          <div class="flex items-center gap-3">
            <button
              @click="goBack"
              class="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-700 transition-colors cursor-pointer"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </button>

            <div class="w-10 h-10 rounded-full bg-[#B50302] text-white flex items-center justify-center font-bold text-xs shrink-0">
              {{ reservation?.clientAvatar || 'CL' }}
            </div>

            <div>
              <h2 class="text-sm font-extrabold text-[#053754]">{{ reservation?.clientNom || 'Client' }}</h2>
              <p class="text-[10px] text-emerald-600 font-bold flex items-center gap-1">
                <span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                <span>Client Rahma GP</span>
              </p>
            </div>
          </div>

          <!-- Right: Action Button "Mettre à jour le suivi" -->
          <button
            @click="showStatusModal = true"
            class="bg-[#053754] hover:bg-[#074C72] text-white font-extrabold text-xs px-3.5 py-1.5 rounded-xl transition-colors cursor-pointer flex items-center gap-1.5 shadow-2xs uppercase tracking-wider"
          >
            <span>📦 SUIVI COLIS</span>
          </button>
        </div>

        <!-- Parcel Code & Route Pill -->
        <div v-if="reservation" class="bg-white border border-gray-200 rounded-xl px-4 py-2 flex items-center justify-between text-xs font-bold shadow-2xs">
          <span class="text-[#074C72] font-black font-mono">{{ reservation.code }}</span>
          <div class="flex items-center gap-1.5 text-gray-700">
            <CountryFlag :city="reservation.villeDepart" :country="reservation.paysDepart" size="w-4 h-3" />
            <span>{{ reservation.villeDepart }}</span>
            <span class="text-[#074C72]">➔</span>
            <CountryFlag :city="reservation.villeDestination" :country="reservation.paysDestination" size="w-4 h-3" />
            <span>{{ reservation.villeDestination }}</span>
          </div>
          <span class="text-[#B50302] font-extrabold">{{ reservation.poids }}</span>
        </div>
      </div>

      <!-- Status Banner -->
      <div v-if="reservation" class="bg-emerald-50 border-b border-emerald-200/80 px-4 py-2 text-center text-xs font-bold text-emerald-800 shrink-0 flex items-center justify-center gap-2">
        <span>Statut réservation :</span>
        <span class="bg-emerald-100 text-emerald-900 px-2.5 py-0.5 rounded-full uppercase text-[10px] tracking-wider">
          {{ reservation.statut === 'acceptee' ? '✓ Réservation Acceptée' : reservation.statut }}
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
              ? 'bg-[#053754] text-white rounded-2xl rounded-tr-xs'
              : 'bg-white border border-gray-200 text-gray-800 rounded-2xl rounded-tl-xs'"
          >
            <span v-if="!msg.isMine" class="text-[10px] font-extrabold text-[#B50302] block">
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
              :class="msg.isMine ? 'text-sky-200/80' : 'text-gray-400'"
            >
              <span>{{ msg.time }}</span>
              <span v-if="msg.isMine" class="text-xs font-bold">{{ msg.isRead ? '✓✓' : '✓' }}</span>
            </div>
          </div>
        </div>

        <div v-if="messages.length === 0" class="text-center py-12 text-gray-400 text-xs space-y-1">
          <p class="font-bold">Aucun message pour l'instant.</p>
          <p>Envoyez un message ci-dessous pour contacter le client.</p>
        </div>
      </div>

      <!-- Attachment URL Input Bar (Collapsible) -->
      <div v-if="showAttachmentInput" class="bg-amber-50 border-t border-amber-200 px-4 py-2 flex items-center gap-2 shrink-0">
        <span class="text-xs text-amber-900 font-bold shrink-0">📷 Lien photo / pièce jointe :</span>
        <input
          v-model="pieceJointe"
          type="url"
          placeholder="https://example.com/photo.jpg"
          class="flex-1 px-3 py-1.5 bg-white border border-amber-300 rounded-lg text-xs outline-none"
        />
        <button @click="showAttachmentInput = false" class="text-xs text-gray-500 font-bold px-2">✕</button>
      </div>

      <!-- Bottom Input Bar -->
      <div class="bg-white border-t border-gray-200 px-4 py-3 shrink-0">
        <form @submit.prevent="handleSendMessage" class="flex items-center gap-2">
          <button
            @click="showAttachmentInput = !showAttachmentInput"
            type="button"
            class="w-9 h-9 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-500 hover:text-[#074C72] text-2xl font-bold transition-colors cursor-pointer shrink-0"
            :class="{ 'text-[#074C72] bg-sky-100': showAttachmentInput }"
          >
            +
          </button>

          <input
            v-model="newMessage"
            @input="handleMessageInput"
            type="text"
            placeholder="Écrire un message au client..."
            class="flex-1 bg-[#EAEFF4] border-none rounded-xl px-4 py-2.5 text-xs sm:text-sm text-gray-800 placeholder-gray-400 outline-none focus:ring-2 focus:ring-[#074C72]/20"
          />

          <button
            type="submit"
            :disabled="isSending || (!newMessage.trim() && !pieceJointe.trim())"
            class="w-9 h-9 text-[#053754] hover:text-[#074C72] flex items-center justify-center transition-colors cursor-pointer shrink-0 disabled:opacity-40"
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
      <div v-if="showStatusModal" class="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
        <div class="bg-white rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl animate-in zoom-in-95 duration-200">
          <div class="flex items-center justify-between border-b border-gray-100 pb-3">
            <h3 class="text-base font-extrabold text-[#053754]">Mettre à jour le statut du colis</h3>
            <button @click="showStatusModal = false" class="text-gray-400 hover:text-gray-600">✕</button>
          </div>

          <p class="text-xs text-gray-500">Mettez à jour le statut d'acheminement pour informer le client en temps réel :</p>

          <div class="space-y-3">
            <div>
              <label class="block text-xs font-bold text-[#074C72] mb-1">Nouveau statut du colis</label>
              <select
                v-model="selectedColisStatut"
                class="w-full px-3.5 py-2.5 bg-white border border-gray-300 rounded-xl text-xs font-bold outline-none focus:border-[#074C72]"
              >
                <option v-for="opt in colisStatutOptions" :key="opt.value" :value="opt.value">
                  {{ opt.label }}
                </option>
              </select>
            </div>

            <div>
              <label class="block text-xs font-bold text-[#074C72] mb-1">Commentaire (optionnel)</label>
              <input
                v-model="colisCommentaire"
                type="text"
                placeholder="ex: Le colis est dans l'avion..."
                class="w-full px-3.5 py-2.5 bg-white border border-gray-300 rounded-xl text-xs outline-none focus:border-[#074C72]"
              />
            </div>
          </div>

          <div class="flex items-center gap-2 pt-2">
            <button
              @click="showStatusModal = false"
              class="flex-1 bg-gray-100 text-gray-700 font-bold text-xs py-3 rounded-xl hover:bg-gray-200 transition-colors"
            >
              Annuler
            </button>
            <button
              @click="handleUpdateColisStatut"
              :disabled="isSubmittingColisStatut"
              class="flex-1 bg-[#053754] text-white font-extrabold text-xs py-3 rounded-xl hover:bg-[#074C72] transition-colors flex items-center justify-center gap-1 disabled:opacity-50"
            >
              <span v-if="isSubmittingColisStatut" class="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
              <span>VALIDER</span>
            </button>
          </div>
        </div>
      </div>
    </Teleport>

  </div>
</template>
