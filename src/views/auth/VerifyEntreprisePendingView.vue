<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { entrepriseService } from '@/services/entrepriseService'
import Swal from 'sweetalert2'

const router = useRouter()
const user = ref(null)
const isResending = ref(false)
const resendSuccess = ref(false)

onMounted(() => {
  const userStr = localStorage.getItem('rahma_user')
  if (userStr) {
    try {
      user.value = JSON.parse(userStr)
    } catch (e) {
      console.error(e)
    }
  }
})

const handleResend = async () => {
  isResending.value = true
  resendSuccess.value = false

  try {
    const res = await entrepriseService.resendVerification()
    resendSuccess.value = true
    Swal.fire({
      title: 'E-mail envoyé ! ✉️',
      text: res.message || 'Un nouvel e-mail de confirmation a été transmis.',
      icon: 'success',
      confirmButtonColor: '#053754'
    })
  } catch (err) {
    console.error(err)
    Swal.fire({
      title: 'Erreur',
      text: err.message || 'Impossible de renvoyer l\'e-mail pour le moment.',
      icon: 'error',
      confirmButtonColor: '#053754'
    })
  } finally {
    isResending.value = false
  }
}

const logout = () => {
  localStorage.removeItem('rahma_token')
  localStorage.removeItem('token')
  localStorage.removeItem('rahma_user')
  router.push('/auth/login')
}
</script>

<template>
  <div class="min-h-[80vh] flex items-center justify-center p-4">
    <div class="w-full max-w-lg bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl text-center space-y-6">
      
      <!-- Icon Header -->
      <div class="w-16 h-16 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 mx-auto flex items-center justify-center shadow-inner">
        <svg class="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
        </svg>
      </div>

      <!-- Main Heading & Message -->
      <div>
        <span class="inline-block px-3 py-1 bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 text-xs font-black rounded-full uppercase tracking-wider mb-2">
          Compte En Attente de Vérification
        </span>
        <h1 class="text-xl sm:text-2xl font-serif font-bold text-[#053754] dark:text-sky-300">
          Vérification d'E-mail Requise
        </h1>
        <p class="text-xs sm:text-sm text-gray-600 dark:text-slate-400 mt-2 leading-relaxed">
          Merci pour votre inscription ! L'accès au tableau de bord et aux fonctionnalités réservées aux entreprises GP nécessite la confirmation de votre adresse e-mail.
        </p>
      </div>

      <!-- Information Box -->
      <div class="p-4 bg-sky-50 dark:bg-slate-800 border border-sky-200 dark:border-slate-700 rounded-2xl text-left space-y-2 text-xs text-sky-900 dark:text-sky-200">
        <div class="font-bold flex items-center gap-2">
          <span>📩 E-mail de confirmation transmis :</span>
        </div>
        <p class="font-mono text-xs font-bold text-[#053754] dark:text-sky-300">
          {{ user?.entreprise?.email || user?.email || 'e-mail de votre entreprise' }}
        </p>
        <p class="text-[11px] text-gray-500 dark:text-slate-400">
          Veuillez ouvrir votre boîte de réception et cliquer sur le lien de confirmation. N'oubliez pas de vérifier vos courriers indésirables (Spam).
        </p>
      </div>

      <!-- Actions Buttons -->
      <div class="space-y-3 pt-2">
        <button
          @click="handleResend"
          :disabled="isResending"
          class="w-full py-3 px-4 bg-[#053754] hover:bg-[#0284c7] text-white font-bold text-xs sm:text-sm rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
        >
          <svg v-if="isResending" class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span>{{ isResending ? 'Renvoi en cours...' : 'Renvoyer l\'e-mail de vérification' }}</span>
        </button>

        <button
          @click="logout"
          class="w-full py-2.5 px-4 bg-gray-100 hover:bg-gray-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-gray-700 dark:text-slate-300 font-bold text-xs rounded-xl transition-all cursor-pointer"
        >
          Se déconnecter
        </button>
      </div>

      <!-- Return to public homepage -->
      <div class="pt-2">
        <router-link to="/" class="text-xs font-bold text-[#053754] dark:text-sky-400 hover:underline">
          ← Naviguer sur le portail public
        </router-link>
      </div>
    </div>
  </div>
</template>
