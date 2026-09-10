<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const newMessage = ref('')
const currentStatus = ref('reservation_acceptee') // 'demande_envoyee' | 'reservation_acceptee' | 'colis_depose' | 'en_transit' | 'arrive' | 'livre'
const showStatusModal = ref(false)

const goBack = () => {
  router.push('/voyageur/messages')
}

const goToVoyage = () => {
  router.push('/voyageur/voyages/voy-1')
}

const messages = ref([
  {
    id: 1,
    sender: 'client',
    text: "Bonjour, j'ai effectué une réservation pour l'envoi de mon colis de Dakar vers Paris. Je voulais savoir si vous avez pu la consulter ?",
    time: '30 août, 11:18'
  },
  {
    id: 2,
    sender: 'voyageur',
    text: "Bonjour, oui j'ai bien reçu votre demande de réservation. Je vais vérifier les détails du colis et l'espace disponible avant de la confirmer.",
    time: '30 août, 11:18'
  },
  {
    id: 3,
    sender: 'client',
    text: "D'accord, merci. Mon colis fait environ 4 kg. Est-ce que cela devrait être bon pour vous ?",
    time: '30 août, 11:18'
  },
  {
    id: 4,
    sender: 'voyageur',
    text: "Oui, normalement c'est bon. Je vérifie juste les autres réservations prévues pour ce voyage.",
    time: '30 août, 11:18'
  },
  {
    id: 5,
    sender: 'voyageur',
    text: "Oui, exactement. Une fois la réservation confirmée, vous pourrez consulter toutes les informations concernant le dépôt du colis.",
    time: '30 août, 11:18'
  },
  {
    id: 6,
    sender: 'client',
    text: "Parfait, merci pour les informations. J'attends donc votre confirmation.",
    time: '30 août, 11:18'
  },
  {
    id: 7,
    sender: 'voyageur',
    text: "Avec plaisir. Je vous confirme la réservation dès que la vérification est terminée.",
    time: '30 août, 11:18'
  }
])

const sendMessage = () => {
  if (!newMessage.value.trim()) return
  messages.value.push({
    id: Date.now(),
    sender: 'voyageur',
    text: newMessage.value.trim(),
    time: 'À l\'instant'
  })
  newMessage.value = ''
}

const updateParcelStatus = (newStat) => {
  currentStatus.value = newStat
  showStatusModal.value = false
  alert('Le statut du colis a été mis à jour avec succès ! Le client a été notifié.')
}
</script>

<template>
  <div class="flex flex-col h-[calc(100vh-140px)] max-h-[800px] -mx-4 sm:-mx-6 bg-[#FAF7F2] relative">
    
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
            MD
          </div>

          <div>
            <h2 class="text-sm font-extrabold text-[#053754]">Mariama Diallo</h2>
            <p class="text-[10px] text-gray-400 font-medium">Client - Envoi Dakar ➔ Paris</p>
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
      <div class="bg-white border border-gray-200 rounded-xl px-4 py-2 flex items-center justify-between text-xs font-bold shadow-2xs">
        <span class="text-[#074C72] font-black">#RS-7729</span>
        <div class="flex items-center gap-1.5 text-gray-700">
          <span>Dakar</span>
          <span class="text-[#074C72]">➔</span>
          <span>Paris</span>
        </div>
        <span class="text-[#B50302] font-extrabold">6Kg</span>
      </div>
    </div>

    <!-- Status Banner: "Statut de la réservation : Acceptée" -->
    <div class="bg-emerald-50 border-b border-emerald-200/80 px-4 py-2 text-center text-xs font-bold text-emerald-800 shrink-0 flex items-center justify-center gap-2">
      <span>Statut du transport :</span>
      <span class="bg-emerald-100 text-emerald-900 px-2.5 py-0.5 rounded-full uppercase text-[10px] tracking-wider">
        {{ currentStatus === 'reservation_acceptee' ? '✓ Réservation Acceptée' : currentStatus === 'colis_depose' ? '📦 Colis Reçu au dépôt' : currentStatus === 'en_transit' ? '✈️ En Transit (En vol)' : '✅ Livré au destinataire' }}
      </span>
    </div>

    <!-- Chat Messages Scroll Area -->
    <div class="flex-1 overflow-y-auto px-4 py-4 space-y-4">
      <div
        v-for="msg in messages"
        :key="msg.id"
        class="flex flex-col"
        :class="msg.sender === 'voyageur' ? 'items-end' : 'items-start'"
      >
        <!-- Message Bubble -->
        <div
          class="max-w-[85%] sm:max-w-[75%] p-3.5 space-y-1.5 shadow-2xs"
          :class="msg.sender === 'voyageur'
            ? 'bg-[#053754] text-white rounded-2xl rounded-tr-xs'
            : 'bg-white border border-gray-200 text-gray-800 rounded-2xl rounded-tl-xs'"
        >
          <p class="text-xs sm:text-sm leading-relaxed whitespace-pre-line font-medium">
            {{ msg.text }}
          </p>
          <div
            class="text-[10px] text-right font-medium"
            :class="msg.sender === 'voyageur' ? 'text-sky-200/80' : 'text-gray-400'"
          >
            {{ msg.time }}
          </div>
        </div>
      </div>
    </div>

    <!-- Bottom Input Bar -->
    <div class="bg-white border-t border-gray-200 px-4 py-3 shrink-0">
      <form @submit.prevent="sendMessage" class="flex items-center gap-2">
        <button
          type="button"
          class="w-9 h-9 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-500 hover:text-gray-700 text-2xl font-bold transition-colors cursor-pointer shrink-0"
        >
          +
        </button>

        <input
          v-model="newMessage"
          type="text"
          placeholder="Écrire un message au client..."
          class="flex-1 bg-[#EAEFF4] border-none rounded-xl px-4 py-2.5 text-xs sm:text-sm text-gray-800 placeholder-gray-400 outline-none focus:ring-2 focus:ring-[#074C72]/20"
        />

        <button
          type="submit"
          class="w-9 h-9 text-[#053754] hover:text-[#074C72] flex items-center justify-center transition-colors cursor-pointer shrink-0"
        >
          <svg class="w-6 h-6 transform rotate-45" fill="currentColor" viewBox="0 0 24 24">
            <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
          </svg>
        </button>
      </form>
    </div>

    <!-- Status Change Modal ("Mettre à jour le suivi") -->
    <Teleport to="body">
      <div v-if="showStatusModal" class="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
        <div class="bg-white rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl animate-in zoom-in-95 duration-200">
          <div class="flex items-center justify-between border-b border-gray-100 pb-3">
            <h3 class="text-base font-extrabold text-[#053754]">Changer l'état du colis #RS-7729</h3>
            <button @click="showStatusModal = false" class="text-gray-400 hover:text-gray-600">✕</button>
          </div>

          <p class="text-xs text-gray-500">Mettez à jour le statut d'acheminement pour informer le client en temps réel :</p>

          <div class="space-y-2">
            <button
              @click="updateParcelStatus('reservation_acceptee')"
              class="w-full text-left p-3 rounded-xl border text-xs font-extrabold flex items-center justify-between transition-all"
              :class="currentStatus === 'reservation_acceptee' ? 'bg-sky-50 border-[#074C72] text-[#074C72]' : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'"
            >
              <span>1. Réservation confirmée & acceptée</span>
              <span v-if="currentStatus === 'reservation_acceptee'">✓</span>
            </button>

            <button
              @click="updateParcelStatus('colis_depose')"
              class="w-full text-left p-3 rounded-xl border text-xs font-extrabold flex items-center justify-between transition-all"
              :class="currentStatus === 'colis_depose' ? 'bg-sky-50 border-[#074C72] text-[#074C72]' : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'"
            >
              <span>2. Colis reçu au point de dépôt</span>
              <span v-if="currentStatus === 'colis_depose'">✓</span>
            </button>

            <button
              @click="updateParcelStatus('en_transit')"
              class="w-full text-left p-3 rounded-xl border text-xs font-extrabold flex items-center justify-between transition-all"
              :class="currentStatus === 'en_transit' ? 'bg-sky-50 border-[#074C72] text-[#074C72]' : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'"
            >
              <span>3. Colis en transit / En vol ✈️</span>
              <span v-if="currentStatus === 'en_transit'">✓</span>
            </button>

            <button
              @click="updateParcelStatus('livre')"
              class="w-full text-left p-3 rounded-xl border text-xs font-extrabold flex items-center justify-between transition-all"
              :class="currentStatus === 'livre' ? 'bg-sky-50 border-[#074C72] text-[#074C72]' : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'"
            >
              <span>4. Colis remis au destinataire (Livré) 🎉</span>
              <span v-if="currentStatus === 'livre'">✓</span>
            </button>
          </div>

          <button
            @click="showStatusModal = false"
            class="w-full bg-gray-100 text-gray-700 font-bold text-xs py-3 rounded-xl hover:bg-gray-200 transition-colors"
          >
            Fermer
          </button>
        </div>
      </div>
    </Teleport>

  </div>
</template>
