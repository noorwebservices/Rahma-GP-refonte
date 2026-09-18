<script setup>
import { onMounted, onUnmounted } from 'vue'
import { RouterView } from 'vue-router'
import { useTheme } from '@/composables/useTheme'
import { startPushNotificationPoller, stopPushNotificationPoller } from '@/utils/pushNotification'
import PwaInstallPrompt from '@/components/common/PwaInstallPrompt.vue'

const { initTheme } = useTheme()

onMounted(() => {
  initTheme()
  startPushNotificationPoller(15000)
})

onUnmounted(() => {
  stopPushNotificationPoller()
})
</script>

<template>
  <RouterView />
  <PwaInstallPrompt />
</template>


