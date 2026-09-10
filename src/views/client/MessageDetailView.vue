<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const newMessage = ref('')

const goBack = () => {
  router.push('/client/messages')
}

const goToTracking = () => {
  router.push('/client/colis')
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
    sender: 'transporter',
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
    sender: 'transporter',
    text: "Oui, normalement c'est bon. Je vérifie juste les autres réservations prévues pour ce voyage.",
    time: '30 août, 11:18'
  },
  {
    id: 5,
    sender: 'transporter',
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
    sender: 'transporter',
    text: "Avec plaisir. Je vous confirme la réservation dès que la vérification est terminée.",
    time: '30 août, 11:18'
  }
])

const sendMessage = () => {
  if (!newMessage.value.trim()) return
  messages.value.push({
    id: Date.now(),
    sender: 'client',
    text: newMessage.value.trim(),
    time: 'À l\'instant'
  })
  newMessage.value = ''
}
</script>

<template>
  <div class="flex flex-col h-[calc(100vh-140px)] max-h-[800px] -mx-4 sm:-mx-6 bg-[#FAF7F2] relative">
    
    <!-- Top Chat Sub-Header -->
    <div class="bg-white border-b border-gray-200 px-4 py-3 space-y-2.5 shrink-0 shadow-2xs">
      <div class="flex items-center justify-between">
        <!-- Left: Back Arrow + Transporter Info -->
        <div class="flex items-center gap-3">
          <button
            @click="goBack"
            class="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-700 transition-colors cursor-pointer"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </button>

          <div class="w-10 h-10 rounded-full bg-[#053754] text-white flex items-center justify-center font-bold text-xs shrink-0">
            RGP
          </div>

          <h2 class="text-sm font-extrabold text-[#053754]">Rahma GP Express</h2>
        </div>

        <!-- Right: Suivi Button -->
        <button
          @click="goToTracking"
          class="bg-[#D8ECF8] hover:bg-sky-200 text-[#074C72] font-extrabold text-xs px-3.5 py-1.5 rounded-xl transition-colors cursor-pointer flex items-center gap-1.5 shadow-2xs"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
          </svg>
          Suivi
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

    <!-- Status Banner: "Statut de la réservation : ⏳ En-attente" -->
    <div class="bg-amber-50 border-b border-amber-200/80 px-4 py-2 text-center text-xs font-bold text-[#053754] shrink-0">
      Statut de la réservation : <span class="text-amber-700">⏳ En-attente</span>
    </div>

    <!-- Chat Messages Scroll Area -->
    <div class="flex-1 overflow-y-auto px-4 py-4 space-y-4">
      <div
        v-for="msg in messages"
        :key="msg.id"
        class="flex flex-col"
        :class="msg.sender === 'client' ? 'items-end' : 'items-start'"
      >
        <!-- Message Bubble -->
        <div
          class="max-w-[85%] sm:max-w-[75%] p-3.5 space-y-1.5 shadow-2xs"
          :class="msg.sender === 'client'
            ? 'bg-[#053754] text-white rounded-2xl rounded-tr-xs'
            : 'bg-white border border-gray-200 text-gray-800 rounded-2xl rounded-tl-xs'"
        >
          <p class="text-xs sm:text-sm leading-relaxed whitespace-pre-line font-medium">
            {{ msg.text }}
          </p>
          <div
            class="text-[10px] text-right font-medium"
            :class="msg.sender === 'client' ? 'text-sky-200/80' : 'text-gray-400'"
          >
            {{ msg.time }}
          </div>
        </div>
      </div>
    </div>

    <!-- Bottom Input Bar -->
    <div class="bg-white border-t border-gray-200 px-4 py-3 shrink-0">
      <form @submit.prevent="sendMessage" class="flex items-center gap-2">
        <!-- Plus Attachment Button -->
        <button
          type="button"
          class="w-9 h-9 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-500 hover:text-gray-700 text-2xl font-bold transition-colors cursor-pointer shrink-0"
        >
          +
        </button>

        <!-- Message Input -->
        <input
          v-model="newMessage"
          type="text"
          placeholder="Écrire un message au transporteur"
          class="flex-1 bg-[#EAEFF4] border-none rounded-xl px-4 py-2.5 text-xs sm:text-sm text-gray-800 placeholder-gray-400 outline-none focus:ring-2 focus:ring-[#074C72]/20"
        />

        <!-- Send Arrow Button -->
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

  </div>
</template>
