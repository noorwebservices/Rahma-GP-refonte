<template>
  <div class="space-y-6">
    <!-- Header Banner -->
    <div class="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
      <div>
        <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-100 dark:bg-sky-950/80 text-sky-800 dark:text-sky-300 text-xs font-bold mb-2">
          <span>💬 Supervision par Réservation</span>
        </div>
        <h2 class="text-2xl font-black text-[#053754] dark:text-slate-100 tracking-tight">Discussions & Réservations</h2>
        <p class="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Supervisez en temps réel les échanges entre vos clients et agents GP, groupés strictement par dossier de réservation.
        </p>
      </div>

      <!-- Quick Search -->
      <div class="w-full md:w-72 relative">
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Rechercher code réservation, client, agent..."
          class="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#053754]"
        />
        <svg class="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="py-16 text-center">
      <div class="w-10 h-10 border-4 border-[#053754] border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
      <p class="text-xs font-bold text-slate-500">Chargement des fils de discussions...</p>
    </div>

    <!-- Empty State -->
    <div v-else-if="filteredDiscussions.length === 0" class="bg-white dark:bg-slate-900 rounded-3xl p-12 text-center border border-slate-200/80 dark:border-slate-800 space-y-3">
      <div class="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center mx-auto text-2xl">
        💬
      </div>
      <h3 class="text-base font-bold text-slate-800 dark:text-slate-200">Aucune discussion par réservation trouvée</h3>
      <p class="text-xs text-slate-500 max-w-md mx-auto">
        Seules les discussions associées à une réservation active ou passée de votre entreprise sont affichées ici.
      </p>
    </div>

    <!-- Discussion Split View -->
    <div v-else class="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      
      <!-- Left Panel: Chat List per Reservation -->
      <div class="lg:col-span-5 space-y-3">
        <div class="max-h-[580px] overflow-y-auto space-y-3 pr-1">
          <div
            v-for="chat in paginatedDiscussions"
            :key="chat.id"
            @click="selectChat(chat)"
            class="p-4 rounded-2xl border transition-all cursor-pointer bg-white dark:bg-slate-900 hover:shadow-md space-y-2.5"
            :class="selectedChat?.id === chat.id ? 'border-[#053754] ring-2 ring-[#053754]/20 bg-sky-50/50 dark:bg-slate-800/80' : 'border-slate-200/80 dark:border-slate-800'"
          >
            <!-- Top Reservation Badge & Timestamp -->
            <div class="flex items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800/80 pb-2">
              <span class="px-2.5 py-0.5 rounded-lg bg-sky-100 dark:bg-sky-950 text-[#053754] dark:text-sky-300 font-black text-[10px] tracking-wider uppercase">
                🏷️ Réservation #{{ chat.code_reservation }}
              </span>
              <span class="text-[10px] font-bold text-slate-400 whitespace-nowrap">{{ chat.dernier_message_at }}</span>
            </div>

            <!-- Client & Agent Info -->
            <div class="flex items-start justify-between gap-3">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-full bg-[#053754] text-white font-bold text-xs flex items-center justify-center shrink-0">
                  {{ chat.client_nom?.charAt(0) || 'C' }}
                </div>
                <div class="overflow-hidden">
                  <h4 class="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
                    Client: {{ chat.client_nom || 'Client Anonyme' }}
                  </h4>
                  <p class="text-[11px] font-semibold text-slate-500 dark:text-slate-400 truncate flex items-center gap-1">
                    <span>Agent GP:</span>
                    <span class="text-[#053754] dark:text-sky-300 font-bold">{{ chat.agent_nom || 'Gérant' }}</span>
                  </p>
                </div>
              </div>
            </div>

            <!-- Trip & Package Info -->
            <div class="pt-1 flex items-center justify-between text-[11px] text-slate-600 dark:text-slate-300">
              <span class="truncate font-medium">📦 {{ chat.colis_description }}</span>
              <span class="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-[10px] font-bold text-slate-700 dark:text-slate-300 shrink-0">
                {{ chat.trajet }}
              </span>
            </div>

            <p class="text-xs text-slate-500 dark:text-slate-400 line-clamp-1 italic">
              "{{ chat.dernier_message }}"
            </p>
          </div>
        </div>

        <!-- Left Panel Pagination Controls -->
        <div v-if="totalPages > 1" class="flex items-center justify-between p-3 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 text-xs shadow-2xs">
          <button
            @click="prevPage"
            :disabled="currentPage === 1"
            class="px-2.5 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold text-slate-700 dark:text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-100 dark:hover:bg-slate-700 transition cursor-pointer text-[11px]"
          >
            ◄ Préc.
          </button>

          <div class="flex items-center gap-1">
            <template v-for="(p, index) in visiblePages" :key="index">
              <span v-if="p === '...'" class="px-1 py-0.5 text-slate-400 dark:text-slate-500 font-extrabold select-none text-[11px]">...</span>
              <button
                v-else
                @click="currentPage = p"
                :class="[
                  'w-7 h-7 rounded-xl font-extrabold text-[11px] transition cursor-pointer flex items-center justify-center',
                  currentPage === p ? 'bg-[#053754] text-white shadow-xs' : 'bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100'
                ]"
              >
                {{ p }}
              </button>
            </template>
          </div>

          <button
            @click="nextPage"
            :disabled="currentPage === totalPages"
            class="px-2.5 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold text-slate-700 dark:text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-100 dark:hover:bg-slate-700 transition cursor-pointer text-[11px]"
          >
            Suiv. ►
          </button>
        </div>
      </div>

      <!-- Right Panel: Message Thread Detail per Reservation -->
      <div class="lg:col-span-7 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 flex flex-col h-[650px] shadow-xs">
        <template v-if="selectedChat">
          <!-- Chat Thread Header -->
          <div class="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/80">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-full bg-[#053754] text-white font-bold text-xs flex items-center justify-center">
                {{ selectedChat.client_nom?.charAt(0) || 'C' }}
              </div>
              <div>
                <div class="flex items-center gap-2">
                  <h3 class="text-sm font-extrabold text-slate-900 dark:text-slate-100">
                    {{ selectedChat.client_nom }} <span class="text-slate-400 font-normal">↔</span> {{ selectedChat.agent_nom }}
                  </h3>
                  <span class="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-sky-100 dark:bg-sky-950 text-[#053754] dark:text-sky-300">
                    #{{ selectedChat.code_reservation }}
                  </span>
                </div>
                <p class="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  Trajet : <strong>{{ selectedChat.trajet }}</strong> • {{ selectedChat.colis_description }}
                </p>
              </div>
            </div>

            <div class="px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-[10px] font-bold flex items-center gap-1.5 shrink-0">
              <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>Supervision Réservation</span>
            </div>
          </div>

          <!-- Loading Messages -->
          <div v-if="loadingMessages" class="flex-1 flex items-center justify-center p-6 text-center space-y-2">
            <div class="w-7 h-7 border-3 border-[#053754] border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p class="text-xs text-slate-400 font-medium">Chargement des messages de la réservation...</p>
          </div>

          <!-- Messages History View -->
          <div v-else class="flex-1 p-5 overflow-y-auto space-y-4 bg-slate-50/50 dark:bg-slate-950/40">
            <div v-if="!selectedChat.messages || selectedChat.messages.length === 0" class="py-12 text-center text-slate-400 space-y-2">
              <span class="text-2xl">💬</span>
              <p class="text-xs font-semibold">Aucun message enregistré pour cette réservation.</p>
            </div>

            <div
              v-else
              v-for="msg in selectedChat.messages"
              :key="msg.id || msg.created_at"
              class="flex flex-col"
              :class="msg.expediteur_type === 'client' ? 'items-start' : 'items-end'"
            >
              <div class="flex items-center gap-2 mb-1">
                <span class="text-[10px] font-bold text-slate-400">
                  {{ msg.expediteur_nom || (msg.expediteur_type === 'client' ? selectedChat.client_nom : selectedChat.agent_nom) }} ({{ msg.expediteur_type === 'client' ? 'Client' : 'Agent GP' }})
                </span>
                <span class="text-[10px] text-slate-400">• {{ msg.heure }}</span>
              </div>
              <div
                class="max-w-[80%] p-3.5 rounded-2xl text-xs leading-relaxed"
                :class="msg.expediteur_type === 'client' 
                  ? 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 border border-slate-200/80 dark:border-slate-700 rounded-tl-none shadow-2xs' 
                  : 'bg-[#053754] text-white rounded-tr-none shadow-2xs'"
              >
                {{ msg.contenu }}
              </div>
            </div>
          </div>

          <!-- Bottom Notice for Enterprise Admin -->
          <div class="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 rounded-b-3xl text-center">
            <p class="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
              ℹ️ Ce fil de conversation est strictement rattaché au dossier de réservation <strong>#{{ selectedChat.code_reservation }}</strong> en mode supervision.
            </p>
          </div>
        </template>

        <div v-else class="flex-1 flex items-center justify-center p-8 text-center text-slate-400">
          <div>
            <p class="text-sm font-bold text-slate-500 mb-1">Sélectionnez une réservation</p>
            <p class="text-xs text-slate-400">Cliquez sur un fil de discussion par réservation à gauche pour consulter les échanges</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { entrepriseService } from '@/services/entrepriseService'

const route = useRoute()
const loading = ref(true)
const loadingMessages = ref(false)
const searchQuery = ref('')
const discussions = ref([])
const selectedChat = ref(null)

// Pagination state for Left Discussions List
const currentPage = ref(1)
const itemsPerPage = ref(5)

watch(searchQuery, () => {
  currentPage.value = 1
})

const loadDiscussions = async () => {
  loading.value = true
  try {
    const res = await entrepriseService.getDiscussions()
    const rawList = res?.discussions?.data || res?.discussions || res?.data?.discussions || res?.data || (Array.isArray(res) ? res : [])
    
    // Strict filtering & normalization: every thread MUST be linked to a reservation
    discussions.value = (Array.isArray(rawList) ? rawList : [])
      .filter(item => item && (item.id || item.code_reservation || item.reservation_id))
      .map(item => {
        const resId = item.id || item.reservation_id
        const codeRes = item.code_reservation || `RES-${String(resId).substring(0, 6).toUpperCase()}`
        
        const clientUser = item.client?.user || item.client || {}
        const agentUser = item.agent_gp?.user || item.agent_gp || {}
        const voyage = item.voyage || {}

        const clientNom = [clientUser.prenom, clientUser.nom].filter(Boolean).join(' ') || item.client_nom || 'Client Anonyme'
        const agentNom = [agentUser.prenom, agentUser.nom].filter(Boolean).join(' ') || item.agent_nom || 'Agent GP'
        const trajet = voyage.ville_depart && voyage.ville_destination ? `${voyage.ville_depart} ➔ ${voyage.ville_destination}` : (item.trajet || 'Trajet non spécifié')

        const msgsList = Array.isArray(item.messages) ? item.messages.map(m => ({
          id: m.id,
          expediteur_nom: m.expediteur ? `${m.expediteur.prenom || ''} ${m.expediteur.nom || ''}`.trim() : (m.expediteur_type === 'client' ? clientNom : agentNom),
          expediteur_type: m.expediteur_id === clientUser.id || m.expediteur_type === 'client' ? 'client' : 'agent',
          contenu: m.contenu,
          heure: m.created_at ? new Date(m.created_at).toLocaleString('fr-FR', { dateStyle: 'short', timeStyle: 'short' }) : 'Récemment'
        })) : []

        const lastMsgObj = msgsList.length > 0 ? msgsList[msgsList.length - 1] : null

        return {
          id: resId,
          reservation_id: resId,
          code_reservation: codeRes,
          client_nom: clientNom,
          agent_nom: agentNom,
          trajet: trajet,
          colis_description: item.colis_description || (item.nombre_colis ? `${item.nombre_colis} colis (${item.poids_total || 0} Kg)` : 'Colis réservé'),
          dernier_message: lastMsgObj?.contenu || item.dernier_message || 'Échange démarré',
          dernier_message_at: lastMsgObj?.heure || (item.dernier_message_at || 'Actif'),
          messages: msgsList
        }
      })

    const targetResId = route.query.reservation_id
    if (targetResId) {
      const targetChat = discussions.value.find(d => String(d.id) === String(targetResId) || String(d.reservation_id) === String(targetResId))
      if (targetChat) {
        selectChat(targetChat)
        return
      }
    }

    if (discussions.value.length > 0) {
      selectChat(discussions.value[0])
    }
  } catch (e) {
    console.error('Erreur chargement discussions:', e)
    discussions.value = []
  } finally {
    loading.value = false
  }
}

const filteredDiscussions = computed(() => {
  if (!searchQuery.value.trim()) return discussions.value
  const q = searchQuery.value.toLowerCase().trim()
  return discussions.value.filter(d => 
    d.code_reservation?.toLowerCase().includes(q) ||
    d.client_nom?.toLowerCase().includes(q) ||
    d.agent_nom?.toLowerCase().includes(q) ||
    d.colis_description?.toLowerCase().includes(q) ||
    d.trajet?.toLowerCase().includes(q)
  )
})

const totalPages = computed(() => {
  return Math.ceil(filteredDiscussions.value.length / itemsPerPage.value) || 1
})

const paginatedDiscussions = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value
  return filteredDiscussions.value.slice(start, start + itemsPerPage.value)
})

const nextPage = () => {
  if (currentPage.value < totalPages.value) currentPage.value++
}

const prevPage = () => {
  if (currentPage.value > 1) currentPage.value--
}

const visiblePages = computed(() => {
  const total = totalPages.value
  const current = currentPage.value

  if (total <= 5) {
    return Array.from({ length: total }, (_, i) => i + 1)
  }

  if (current <= 3) {
    return [1, 2, 3, '...', total]
  }

  if (current >= total - 2) {
    return [1, '...', total - 2, total - 1, total]
  }

  return [1, '...', current, '...', total]
})

const selectChat = async (chat) => {
  selectedChat.value = chat
  if (!chat.reservation_id) return

  loadingMessages.value = true
  try {
    const res = await entrepriseService.getDiscussionMessages(chat.reservation_id)
    const rawMsgs = res?.messages || res?.data?.messages || []
    if (Array.isArray(rawMsgs) && rawMsgs.length > 0) {
      chat.messages = rawMsgs.map(m => {
        const isClient = m.expediteur_id === chat.client_user_id || m.expediteur?.role === 'client' || m.expediteur_type === 'client'
        return {
          id: m.id,
          expediteur_nom: m.expediteur ? `${m.expediteur.prenom || ''} ${m.expediteur.nom || ''}`.trim() : (isClient ? chat.client_nom : chat.agent_nom),
          expediteur_type: isClient ? 'client' : 'agent',
          contenu: m.contenu,
          heure: m.created_at ? new Date(m.created_at).toLocaleString('fr-FR', { dateStyle: 'short', timeStyle: 'short' }) : 'Récemment'
        }
      })
    }
  } catch (e) {
    // Si la route specifique echoue, on conserve la liste de messages pre-chargees
  } finally {
    loadingMessages.value = false
  }
}

onMounted(() => {
  loadDiscussions()
})
</script>
