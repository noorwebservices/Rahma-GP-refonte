<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter, RouterLink } from 'vue-router'
import { useAuth } from '@/composables/useAuth'

const route = useRoute()
const router = useRouter()
const { verifyVoyageurAccount, fetchUser, isAuthenticated, isLoading, error } = useAuth()

const isSuccess = ref(false)
const message = ref('')

onMounted(async () => {
  const token = route.query.token || route.params.token
  if (!token) {
    error.value = "Jeton de vérification introuvable dans le lien."
    return
  }

  try {
    const res = await verifyVoyageurAccount(token)
    isSuccess.value = true
    message.value = res.message || 'Votre compte voyageur a été vérifié et activé avec succès !'

    // Refresh user profile if authenticated
    if (isAuthenticated.value) {
      await fetchUser()
      setTimeout(() => {
        router.push('/voyageur')
      }, 2000)
    }
  } catch (err) {
    isSuccess.value = false
  }
})
</script>

<template>
  <div class="min-h-[70vh] flex items-center justify-center py-12 px-4 sm:px-6">
    <div class="max-w-md w-full bg-white dark:bg-slate-900 rounded-3xl p-8 shadow-xl border border-gray-100 dark:border-slate-800 text-center space-y-6">
      
      <!-- Loading State -->
      <div v-if="isLoading" class="space-y-4 py-8">
        <div class="w-16 h-16 border-4 border-[#053754] border-t-transparent dark:border-sky-400 dark:border-t-transparent rounded-full animate-spin mx-auto"></div>
        <h2 class="text-xl font-bold text-[#053754] dark:text-sky-300">Vérification en cours...</h2>
        <p class="text-xs sm:text-sm text-gray-500 dark:text-slate-400">Nous validons votre jeton de vérification.</p>
      </div>

      <!-- Success State -->
      <div v-else-if="isSuccess" class="space-y-4 py-4">
        <div class="w-20 h-20 bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mx-auto shadow-md">
          <svg class="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 class="text-2xl font-bold text-[#053754] dark:text-sky-300">Compte Voyageur Activé !</h2>
        <p class="text-xs sm:text-sm text-gray-600 dark:text-slate-300 font-medium">
          {{ message }}
        </p>
        <p v-if="isAuthenticated" class="text-xs text-emerald-600 font-semibold animate-pulse">
          Redirection automatique vers votre espace voyageur...
        </p>
        <div class="pt-4">
          <RouterLink
            :to="isAuthenticated ? '/voyageur' : '/auth/login'"
            class="inline-block w-full py-3.5 bg-[#053754] hover:bg-[#074C72] text-white font-bold text-xs sm:text-sm rounded-2xl shadow-md transition-all cursor-pointer"
          >
            {{ isAuthenticated ? 'Accéder à mon Espace Voyageur ✈️' : 'Se connecter à mon compte' }}
          </RouterLink>
        </div>
      </div>

      <!-- Error State -->
      <div v-else class="space-y-4 py-4">
        <div class="w-20 h-20 bg-red-100 dark:bg-red-950 text-red-600 dark:text-red-400 rounded-full flex items-center justify-center mx-auto shadow-md">
          <svg class="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h2 class="text-2xl font-bold text-red-700 dark:text-red-400">Échec de la vérification</h2>
        <p class="text-xs sm:text-sm text-gray-600 dark:text-slate-300 font-medium">
          {{ error || "Le lien de vérification est expiré ou invalide." }}
        </p>
        <div class="pt-4">
          <RouterLink
            to="/profile"
            class="inline-block w-full py-3.5 bg-gray-200 dark:bg-slate-800 hover:bg-gray-300 dark:hover:bg-slate-700 text-gray-800 dark:text-slate-200 font-bold text-xs sm:text-sm rounded-2xl transition-all cursor-pointer"
          >
            Retour à mon profil
          </RouterLink>
        </div>
      </div>

    </div>
  </div>
</template>


