<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import api from '@/services/api'
import CountryPhoneInput from '@/components/common/CountryPhoneInput.vue'
import Swal from 'sweetalert2'

const route = useRoute()
const router = useRouter()

const token = ref('')
const isSubmitting = ref(false)
const errorMessage = ref('')

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

const handleSubmit = async () => {
  if (!token.value) {
    return Swal.fire('Erreur', 'Jeton d\'invitation manquant ou invalide.', 'error')
  }

  if (!form.prenom || !form.nom || !form.telephone || !form.mot_de_passe) {
    return Swal.fire('Attention', 'Veuillez remplir tous les champs obligatoires.', 'warning')
  }

  if (form.mot_de_passe.length < 6) {
    return Swal.fire('Attention', 'Le mot de passe doit contenir au moins 6 caractères.', 'warning')
  }

  if (form.mot_de_passe !== form.mot_de_passe_confirmation) {
    return Swal.fire('Attention', 'Les mots de passe ne correspondent pas.', 'warning')
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

      const userVal = resData?.agent?.user || resData?.user
      if (userVal) {
        localStorage.setItem('rahma_user', JSON.stringify(userVal))
        localStorage.setItem('user', JSON.stringify(userVal))
      }
    }

    await Swal.fire({
      title: 'Bienvenue dans l\'équipe ! 🎉',
      text: 'Votre compte Agent GP a été activé avec succès.',
      icon: 'success',
      confirmButtonColor: '#053754',
    })

    // Redirection vers le tableau de bord entreprise / agent
    router.push('/entreprise')
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
              class="w-full h-10 px-3 text-xs bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded-xl outline-none text-gray-900 dark:text-slate-100"
            />
          </div>
          <div>
            <label class="block text-xs font-semibold text-gray-700 dark:text-slate-200 mb-1">Nom *</label>
            <input
              v-model="form.nom"
              type="text"
              required
              placeholder="Sow"
              class="w-full h-10 px-3 text-xs bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded-xl outline-none text-gray-900 dark:text-slate-100"
            />
          </div>
        </div>

        <div>
          <label class="block text-xs font-semibold text-gray-700 dark:text-slate-200 mb-1">Téléphone *</label>
          <CountryPhoneInput v-model="form.telephone" placeholder="77 000 00 00" />
        </div>

        <div>
          <label class="block text-xs font-semibold text-gray-700 dark:text-slate-200 mb-1">Créer votre Mot de Passe *</label>
          <input
            v-model="form.mot_de_passe"
            type="password"
            required
            placeholder="Minimum 6 caractères"
            class="w-full h-10 px-3 text-xs bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded-xl outline-none text-gray-900 dark:text-slate-100"
          />
        </div>

        <div>
          <label class="block text-xs font-semibold text-gray-700 dark:text-slate-200 mb-1">Confirmer le Mot de Passe *</label>
          <input
            v-model="form.mot_de_passe_confirmation"
            type="password"
            required
            placeholder="Confirmez votre mot de passe"
            class="w-full h-10 px-3 text-xs bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded-xl outline-none text-gray-900 dark:text-slate-100"
          />
        </div>

        <button
          type="submit"
          :disabled="isSubmitting"
          class="w-full h-11 bg-[#053754] hover:bg-[#0284c7] text-white font-bold text-xs rounded-xl transition shadow-md flex items-center justify-center gap-2 cursor-pointer mt-2"
        >
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
