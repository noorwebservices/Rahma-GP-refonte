<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import api from '@/services/api'
import CountryPhoneInput from '@/components/common/CountryPhoneInput.vue'
import Swal from 'sweetalert2'

const route = useRoute()
const router = useRouter()

const token = ref('')
const isSubmitting = ref(false)
const errorMessage = ref('')
const showPassword = ref(false)
const showConfirmPassword = ref(false)

const form = reactive({
  prenom: '',
  nom: '',
  telephone: '',
  email: '',
  mot_de_passe: '',
  mot_de_passe_confirmation: '',
})

onMounted(() => {
  if (route.query.token) {
    token.value = String(route.query.token)
  } else {
    errorMessage.value = 'Jeton d\'invitation manquant. Veuillez utiliser le lien reçu.'
  }
})

const isFormValid = computed(() => {
  const cleanPhone = (form.telephone || '').replace(/\s+/g, '')
  const isPrenomOk = form.prenom.trim().length > 0
  const isNomOk = form.nom.trim().length > 0
  const isPhoneOk = cleanPhone.length >= 8
  const isPasswordOk = form.mot_de_passe.length >= 6
  const isPasswordMatch = form.mot_de_passe === form.mot_de_passe_confirmation

  return isPrenomOk && isNomOk && isPhoneOk && isPasswordOk && isPasswordMatch
})

const handleSubmit = async () => {
  if (!isFormValid.value || isSubmitting.value) return

  if (!token.value) {
    return Swal.fire('Erreur', 'Jeton d\'invitation manquant ou invalide.', 'error')
  }

  isSubmitting.value = true
  errorMessage.value = ''

  try {
    const payload = {
      token: token.value,
      prenom: form.prenom,
      nom: form.nom,
      telephone: form.telephone.replace(/\s+/g, ''),
      mot_de_passe: form.mot_de_passe,
    }

    const response = await api.post('/auth/agent/register-with-token', payload)

    // Stockage du token et profil (compatibilité avec le système d'auth API)
    const resData = response?.data || response
    const tokenVal = resData?.access_token || resData?.token

    if (tokenVal) {
      localStorage.setItem('rahma_token', tokenVal)
      localStorage.setItem('token', tokenVal)
      localStorage.setItem('auth_token', tokenVal)

      let userVal = resData?.agent?.user || resData?.user
      if (userVal) {
        const rawAgent = resData?.agent
        let cleanAgent = null
        if (rawAgent) {
          const { user, ...agentProps } = rawAgent
          cleanAgent = agentProps
        }

        const finalUser = {
          ...userVal,
          agent_gp: cleanAgent || userVal.agent_gp || userVal.agentGp
        }

        localStorage.setItem('rahma_user', JSON.stringify(finalUser))
        localStorage.setItem('user', JSON.stringify(finalUser))
      }
    }

    await Swal.fire({
      title: 'Bienvenue dans l\'équipe ! 🎉',
      text: 'Votre compte Agent GP a été activé avec succès.',
      icon: 'success',
      confirmButtonColor: '#053754',
    })

    // Redirection vers l'espace agent GP
    router.push('/agent')
  } catch (err) {
    console.error(err)
    const msg = err?.message || err?.response?.data?.message || 'Erreur lors de l\'activation de l\'invitation.'
    errorMessage.value = msg
    Swal.fire('Erreur', msg, 'error')
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <div class="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-4 sm:p-6">
    <div class="w-full max-w-md bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-3xl shadow-xl p-6 sm:p-8 space-y-6">
      
      <!-- Banner Header -->
      <div class="text-center space-y-2">
        <div class="w-14 h-14 bg-[#053754] text-white rounded-2xl flex items-center justify-center mx-auto text-2xl font-black shadow-md">
          ✈️
        </div>
        <h1 class="text-xl sm:text-2xl font-extrabold text-[#053754] dark:text-sky-300">
          Activation du Compte Agent GP
        </h1>
        <p class="text-xs text-gray-500 dark:text-slate-400">
          Finalisez votre inscription pour rejoindre l'équipe de votre entreprise GP.
        </p>
      </div>

      <!-- Alert Jeton Manquant ou Erreur -->
      <div v-if="errorMessage" class="p-4 bg-red-50 dark:bg-red-950/60 border border-red-200 dark:border-red-800 rounded-2xl text-xs text-red-700 dark:text-red-300 font-semibold">
        {{ errorMessage }}
      </div>

      <!-- Formulaire d'inscription -->
      <form v-else @submit.prevent="handleSubmit" class="space-y-4">
        
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block text-xs font-semibold text-gray-700 dark:text-slate-200 mb-1">Prénom *</label>
            <input
              v-model="form.prenom"
              type="text"
              required
              placeholder="Ousmane"
              class="w-full h-10 px-3 text-xs bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded-xl outline-none text-gray-900 dark:text-slate-100 font-medium"
            />
          </div>
          <div>
            <label class="block text-xs font-semibold text-gray-700 dark:text-slate-200 mb-1">Nom *</label>
            <input
              v-model="form.nom"
              type="text"
              required
              placeholder="Sow"
              class="w-full h-10 px-3 text-xs bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded-xl outline-none text-gray-900 dark:text-slate-100 font-medium"
            />
          </div>
        </div>

        <div>
          <label class="block text-xs font-semibold text-gray-700 dark:text-slate-200 mb-1">Téléphone *</label>
          <CountryPhoneInput v-model="form.telephone" placeholder="77 000 00 00" />
        </div>

        <!-- Mot de Passe -->
        <div>
          <label class="block text-xs font-semibold text-gray-700 dark:text-slate-200 mb-1">Créer votre Mot de Passe *</label>
          <div class="relative">
            <input
              v-model="form.mot_de_passe"
              :type="showPassword ? 'text' : 'password'"
              required
              placeholder="Minimum 6 caractères"
              class="w-full h-10 px-3 pr-10 text-xs bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded-xl outline-none text-gray-900 dark:text-slate-100 font-medium"
            />
            <button
              type="button"
              @click="showPassword = !showPassword"
              class="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-slate-200 p-1 cursor-pointer transition-colors"
            >
              <svg v-if="!showPassword" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              <svg v-else class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858-5.908a10.016 10.016 0 014.122-.963c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21M3 3l18 18" />
              </svg>
            </button>
          </div>
          <p v-if="form.mot_de_passe && form.mot_de_passe.length < 6" class="text-[11px] text-red-500 font-medium mt-1">
            Le mot de passe doit contenir au moins 6 caractères
          </p>
        </div>

        <!-- Confirmer le Mot de Passe -->
        <div>
          <label class="block text-xs font-semibold text-gray-700 dark:text-slate-200 mb-1">Confirmer le Mot de Passe *</label>
          <div class="relative">
            <input
              v-model="form.mot_de_passe_confirmation"
              :type="showConfirmPassword ? 'text' : 'password'"
              required
              placeholder="Confirmez votre mot de passe"
              class="w-full h-10 px-3 pr-10 text-xs bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded-xl outline-none text-gray-900 dark:text-slate-100 font-medium"
            />
            <button
              type="button"
              @click="showConfirmPassword = !showConfirmPassword"
              class="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-slate-200 p-1 cursor-pointer transition-colors"
            >
              <svg v-if="!showConfirmPassword" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              <svg v-else class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858-5.908a10.016 10.016 0 014.122-.963c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21M3 3l18 18" />
              </svg>
            </button>
          </div>
          <p v-if="form.mot_de_passe_confirmation && form.mot_de_passe !== form.mot_de_passe_confirmation" class="text-[11px] text-red-500 font-medium mt-1">
            Les mots de passe ne correspondent pas
          </p>
        </div>

        <!-- Submit Button -->
        <button
          type="submit"
          :disabled="!isFormValid || isSubmitting"
          :class="[
            'w-full h-11 font-bold text-xs rounded-xl transition shadow-md flex items-center justify-center gap-2 mt-2',
            isFormValid && !isSubmitting
              ? 'bg-[#053754] hover:bg-[#0284c7] text-white cursor-pointer active:scale-[0.99]'
              : 'bg-gray-200 dark:bg-slate-800 text-gray-400 dark:text-slate-600 cursor-not-allowed border border-gray-300 dark:border-slate-700 opacity-75'
          ]"
        >
          <svg v-if="isSubmitting" class="w-4 h-4 animate-spin text-white" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span>{{ isSubmitting ? 'Activation en cours...' : 'Activer mon compte Agent GP →' }}</span>
        </button>
      </form>

      <div class="text-center pt-2 border-t border-gray-100 dark:border-slate-800">
        <router-link to="/auth/login" class="text-xs text-sky-600 font-bold hover:underline">
          Déjà un compte ? Se connecter
        </router-link>
      </div>

    </div>
  </div>
</template>
