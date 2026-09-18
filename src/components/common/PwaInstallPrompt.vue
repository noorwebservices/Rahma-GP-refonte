<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const deferredPrompt = ref(null)
const showInstallBanner = ref(false)
const isInstalled = ref(false)
const isOffline = ref(!navigator.onLine)
const showOfflineToast = ref(false)

const handleBeforeInstallPrompt = (e) => {
  e.preventDefault()
  deferredPrompt.value = e
  
  // Check if dismissed previously in session
  const isDismissed = sessionStorage.getItem('rahma_pwa_dismissed')
  if (!isDismissed && !isInstalled.value) {
    showInstallBanner.value = true
  }
}

const installPwa = async () => {
  if (!deferredPrompt.value) return
  
  showInstallBanner.value = false
  deferredPrompt.value.prompt()
  const { outcome } = await deferredPrompt.value.userChoice
  
  if (outcome === 'accepted') {
    isInstalled.value = true
  }
  deferredPrompt.value = null
}

const dismissBanner = () => {
  showInstallBanner.value = false
  sessionStorage.setItem('rahma_pwa_dismissed', 'true')
}

const updateOnlineStatus = () => {
  const offline = !navigator.onLine
  isOffline.value = offline
  if (offline) {
    showOfflineToast.value = true
  } else {
    // Show back online brief toast then hide
    showOfflineToast.value = true
    setTimeout(() => {
      showOfflineToast.value = false
    }, 4000)
  }
}

onMounted(() => {
  // Detect standalone mode
  if (window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone) {
    isInstalled.value = true
  }

  window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
  window.addEventListener('online', updateOnlineStatus)
  window.addEventListener('offline', updateOnlineStatus)
  window.addEventListener('appinstalled', () => {
    isInstalled.value = true
    showInstallBanner.value = false
    deferredPrompt.value = null
  })
})

onUnmounted(() => {
  window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
  window.removeEventListener('online', updateOnlineStatus)
  window.removeEventListener('offline', updateOnlineStatus)
})
</script>

<template>
  <div>
    <!-- Offline Indicator Toast -->
    <transition
      enter-active-class="transform transition duration-300 ease-out"
      enter-from-class="translate-y-[-100%] opacity-0"
      enter-to-class="translate-y-0 opacity-100"
      leave-active-class="transform transition duration-300 ease-in"
      leave-from-class="translate-y-0 opacity-100"
      leave-to-class="translate-y-[-100%] opacity-0"
    >
      <div
        v-if="isOffline || showOfflineToast"
        class="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 px-4 py-2.5 rounded-full shadow-lg border text-sm font-medium flex items-center gap-2 backdrop-blur-md transition-all"
        :class="isOffline 
          ? 'bg-amber-600/95 text-white border-amber-500 shadow-amber-900/20' 
          : 'bg-emerald-600/95 text-white border-emerald-500 shadow-emerald-900/20'"
      >
        <span class="relative flex h-2.5 w-2.5">
          <span
            v-if="isOffline"
            class="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-200 opacity-75"
          ></span>
          <span
            class="relative inline-flex rounded-full h-2.5 w-2.5"
            :class="isOffline ? 'bg-amber-100' : 'bg-emerald-100'"
          ></span>
        </span>

        <span>
          {{ isOffline ? 'Mode hors ligne (données enregistrées localement)' : 'Connexion rétablie !' }}
        </span>

        <button
          v-if="!isOffline"
          @click="showOfflineToast = false"
          class="ml-2 text-white/80 hover:text-white"
        >
          ✕
        </button>
      </div>
    </transition>

    <!-- Floating PWA Install Prompt Banner -->
    <transition
      enter-active-class="transform transition duration-300 ease-out"
      enter-from-class="translate-y-full opacity-0 scale-95"
      enter-to-class="translate-y-0 opacity-100 scale-100"
      leave-active-class="transform transition duration-200 ease-in"
      leave-from-class="translate-y-0 opacity-100 scale-100"
      leave-to-class="translate-y-full opacity-0 scale-95"
    >
      <div
        v-if="showInstallBanner && !isInstalled"
        class="fixed bottom-20 sm:bottom-6 left-4 right-4 sm:left-auto sm:right-6 sm:max-w-md z-40 bg-slate-900/95 dark:bg-slate-900/95 text-white border border-slate-700/80 shadow-2xl rounded-2xl p-4 backdrop-blur-lg"
      >
        <div class="flex items-start justify-between gap-3">
          <div class="flex items-center gap-3">
            <div class="w-12 h-12 rounded-xl bg-gradient-to-br from-red-600 to-amber-500 p-0.5 shadow-md flex-shrink-0 flex items-center justify-center">
              <img src="/pwa-192x192.png" alt="Rahma GP" class="w-full h-full object-cover rounded-[10px]" />
            </div>
            <div>
              <h4 class="font-bold text-base text-white leading-tight">Installer Rahma GP</h4>
              <p class="text-xs text-slate-300 mt-1">
                Profitez d'un accès rapide, du mode hors-ligne et des notifications instantanées.
              </p>
            </div>
          </div>

          <button
            @click="dismissBanner"
            class="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
            title="Fermer"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div class="mt-4 flex items-center justify-end gap-2.5">
          <button
            @click="dismissBanner"
            class="px-3.5 py-1.5 text-xs font-medium text-slate-300 hover:text-white hover:bg-white/10 rounded-xl transition-colors"
          >
            Plus tard
          </button>

          <button
            @click="installPwa"
            class="px-4 py-2 text-xs font-semibold bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-600 text-white rounded-xl shadow-lg shadow-red-600/30 hover:shadow-red-600/50 transition-all flex items-center gap-1.5"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Installer l'application
          </button>
        </div>
      </div>
    </transition>
  </div>
</template>
