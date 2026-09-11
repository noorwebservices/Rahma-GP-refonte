<script setup>
import { ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import {
  fetchNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead
} from '@/services/notificationService'
import { formatVoyageDate } from '@/utils/flagHelper'

const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['close', 'refresh-count'])
const router = useRouter()

const isLoading = ref(true)
const notifications = ref([])
const errorMsg = ref('')

const loadNotificationsList = async () => {
  isLoading.value = true
  errorMsg.value = ''
  try {
    const res = await fetchNotifications()
    if (res) {
      const rawData = res.data?.data || res.data?.notifications || res.data || res.notifications || res
      const items = Array.isArray(rawData) ? rawData : (Array.isArray(res.data) ? res.data : [])
      notifications.value = items.map(n => ({
        id: n.id,
        titre: n.titre || n.title || n.data?.titre || n.data?.title || 'Notification',
        contenu: n.contenu || n.message || n.body || n.data?.message || n.data?.contenu || '',
        type: n.type || n.data?.type || 'info',
        lu: Boolean(n.lu || n.read_at || n.is_read),
        date: formatVoyageDate(n.date_envoi || n.created_at)
      }))
    }
  } catch (err) {
    errorMsg.value = err?.message || 'Erreur lors du chargement des notifications.'
  } finally {
    isLoading.value = false
  }
}

// Watch isOpen prop to load notifications every time modal is opened
watch(() => props.isOpen, (newVal) => {
  if (newVal) {
    loadNotificationsList()
  }
}, { immediate: true })

const handleMarkOneAsRead = async (notif) => {
  if (!notif.lu) {
    try {
      await markNotificationAsRead(notif.id)
      notif.lu = true
      emit('refresh-count')
    } catch (e) {
      console.error(e)
    }
  }
}

const handleMarkAllAsRead = async () => {
  try {
    await markAllNotificationsAsRead()
    notifications.value.forEach(n => (n.lu = true))
    emit('refresh-count')
  } catch (e) {
    console.error(e)
  }
}

const close = () => {
  emit('close')
}
</script>

<template>
  <Teleport to="body">
    <div
      v-if="isOpen"
      class="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-start justify-center sm:justify-end p-3 sm:p-6"
      @click.self="close"
    >
      <div class="bg-white w-full max-w-md rounded-3xl p-5 shadow-2xl space-y-4 max-h-[85vh] flex flex-col font-sans animate-in fade-in zoom-in-95 duration-200 mt-12 sm:mt-10">
        <!-- Modal Top Bar -->
        <div class="flex items-center justify-between border-b border-gray-100 pb-3">
          <div class="flex items-center gap-2">
            <div class="w-8 h-8 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center text-sm font-bold">
              🔔
            </div>
            <div>
              <h3 class="text-sm font-extrabold text-[#053754]">Notifications</h3>
              <p class="text-[11px] text-gray-400 font-medium">Alertes et mises à jour en temps réel</p>
            </div>
          </div>

          <div class="flex items-center gap-2">
            <button
              @click="handleMarkAllAsRead"
              type="button"
              class="text-[11px] font-bold text-[#074C72] hover:underline cursor-pointer"
            >
              Tout marquer comme lu
            </button>
            <button @click="close" class="text-gray-400 hover:text-gray-600 p-1">
              ✕
            </button>
          </div>
        </div>

        <!-- Loading State -->
        <div v-if="isLoading" class="py-8 text-center space-y-2">
          <div class="w-7 h-7 border-3 border-[#053754] border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p class="text-xs text-gray-500 font-bold">Chargement des notifications...</p>
        </div>

        <!-- Error State -->
        <div v-else-if="errorMsg" class="bg-red-50 p-4 rounded-2xl text-center text-xs text-red-700 font-bold space-y-2">
          <p>{{ errorMsg }}</p>
          <button @click="loadNotificationsList" class="px-3 py-1 bg-red-600 text-white rounded-lg text-[11px]">Réessayer</button>
        </div>

        <!-- Notifications List -->
        <div v-else-if="notifications.length > 0" class="flex-1 overflow-y-auto space-y-2.5 pr-1">
          <div
            v-for="notif in notifications"
            :key="notif.id"
            @click="handleMarkOneAsRead(notif)"
            class="p-3.5 rounded-2xl border transition-all cursor-pointer space-y-1 relative"
            :class="notif.lu ? 'bg-gray-50/70 border-gray-200 opacity-80' : 'bg-sky-50/60 border-sky-200 shadow-2xs'"
          >
            <div v-if="!notif.lu" class="absolute top-3 right-3 w-2 h-2 rounded-full bg-[#B50302]"></div>

            <div class="flex items-center justify-between text-xs pr-3">
              <span class="font-extrabold text-[#053754]">{{ notif.titre }}</span>
              <span class="text-[10px] text-gray-400 font-medium">{{ notif.date }}</span>
            </div>

            <p class="text-xs text-gray-600 leading-snug">
              {{ notif.contenu }}
            </p>
          </div>
        </div>

        <!-- Empty State -->
        <div v-else class="py-8 text-center space-y-2">
          <div class="w-10 h-10 rounded-full bg-gray-100 text-gray-400 flex items-center justify-center mx-auto text-lg">
            🔕
          </div>
          <p class="text-xs font-bold text-gray-600">Aucune notification pour le moment.</p>
        </div>
      </div>
    </div>
  </Teleport>
</template>
