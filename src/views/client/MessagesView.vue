<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const searchQuery = ref('')

const conversations = ref([
  {
    id: 1,
    transporterName: 'Rahma Gp Express',
    avatar: 'RGP',
    time: '10:42',
    routeFrom: 'Dakar',
    routeTo: 'Paris',
    flagFrom: '🇸🇳',
    flagTo: '🇫🇷',
    parcelCode: '#RS-7729',
    lastMessage: 'Bonjour , vous pouvez déposer votre colis ....'
  },
  {
    id: 2,
    transporterName: 'Rahma Gp Express',
    avatar: 'RGP',
    time: '10:42',
    routeFrom: 'Dakar',
    routeTo: 'Paris',
    flagFrom: '🇸🇳',
    flagTo: '🇫🇷',
    parcelCode: '#RS-7729',
    lastMessage: 'Bonjour , vous pouvez déposer votre colis ....'
  },
  {
    id: 3,
    transporterName: 'Rahma Gp Express',
    avatar: 'RGP',
    time: '10:42',
    routeFrom: 'Dakar',
    routeTo: 'Paris',
    flagFrom: '🇸🇳',
    flagTo: '🇫🇷',
    parcelCode: '#RS-7729',
    lastMessage: 'Bonjour , vous pouvez déposer votre colis ....'
  },
  {
    id: 4,
    transporterName: 'Rahma Gp Express',
    avatar: 'RGP',
    time: '10:42',
    routeFrom: 'Dakar',
    routeTo: 'Paris',
    flagFrom: '🇸🇳',
    flagTo: '🇫🇷',
    parcelCode: '#RS-7729',
    lastMessage: 'Bonjour , vous pouvez déposer votre colis ....'
  }
])

const openChat = (id) => {
  router.push(`/client/messages/${id}`)
}
</script>

<template>
  <div class="space-y-5 pb-16">
    <!-- Header Title & Subtitle -->
    <div class="space-y-1">
      <h1 class="text-xl sm:text-2xl font-serif font-bold text-principal-dark">Messagerie</h1>
      <p class="text-xs sm:text-sm text-gray-500">Échangez directement avec vos transporteurs GP</p>
    </div>

    <!-- Search Input -->
    <div class="relative">
      <div class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </div>
      <input
        v-model="searchQuery"
        type="text"
        placeholder="Recherche un transporteur ou un numéro de colis"
        class="w-full bg-[#F3F4F6] border border-gray-200 rounded-xl pl-10 pr-4 py-3 text-xs sm:text-sm placeholder-gray-400 text-gray-800 outline-none focus:bg-white focus:ring-2 focus:ring-[#074C72]/20 focus:border-[#074C72] transition-all"
      />
    </div>

    <!-- Conversations Cards List -->
    <div class="space-y-3">
      <div
        v-for="conv in conversations"
        :key="conv.id"
        @click="openChat(conv.id)"
        class="bg-white rounded-2xl p-4 border border-gray-200 hover:border-[#074C72]/40 transition-all shadow-2xs cursor-pointer flex items-center gap-3.5 group"
      >
        <!-- RGP Avatar Circle -->
        <div class="w-13 h-13 sm:w-14 sm:h-14 rounded-full bg-[#053754] text-white flex items-center justify-center font-extrabold text-sm sm:text-base shrink-0 shadow-xs group-hover:scale-105 transition-transform">
          {{ conv.avatar }}
        </div>

        <!-- Card Content -->
        <div class="flex-1 min-w-0 space-y-1.5">
          <!-- Top Row: Name + Time -->
          <div class="flex items-center justify-between">
            <h3 class="text-sm font-extrabold text-[#053754] truncate">{{ conv.transporterName }}</h3>
            <span class="text-xs text-gray-400 font-medium shrink-0 ml-2">{{ conv.time }}</span>
          </div>

          <!-- Middle Row: Route + Parcel ID -->
          <div class="flex items-center justify-between text-xs">
            <div class="flex items-center gap-1.5 font-bold text-gray-800">
              <span>{{ conv.flagFrom }}</span>
              <span>{{ conv.routeFrom }}</span>
              <div class="w-4 h-4 rounded-full border border-gray-400 text-gray-600 flex items-center justify-center text-[10px]">
                ➔
              </div>
              <span>{{ conv.flagTo }}</span>
              <span>{{ conv.routeTo }}</span>
            </div>
            <span class="font-extrabold text-[#053754] text-xs shrink-0">{{ conv.parcelCode }}</span>
          </div>

          <!-- Bottom Row: Last Message -->
          <p class="text-xs text-gray-500 truncate leading-tight">
            {{ conv.lastMessage }}
          </p>
        </div>
      </div>
    </div>
  </div>
</template>
