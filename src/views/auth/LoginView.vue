<script setup>
import { ref, reactive, computed } from 'vue'
import { useRouter, useRoute, RouterLink } from 'vue-router'
import { useAuth } from '@/composables/useAuth'
import CountryPhoneInput from '@/components/common/CountryPhoneInput.vue'

const router = useRouter()
const route = useRoute()
const { login, isLoading, error } = useAuth()

const loginType = ref('phone') // 'phone' | 'email'
const showPassword = ref(false)
const rememberMe = ref(false)

const form = reactive({
  telephone: '',
  email: '',
  password: ''
})

const errors = reactive({
  loginField: '',
  password: ''
})

const toggleLoginType = (type) => {
  loginType.value = type
  errors.loginField = ''
  errors.password = ''
}

// Computed validation for disabling the submit button
const isFormValid = computed(() => {
  if (loginType.value === 'phone') {
    const cleanPhone = form.telephone.replace(/\s+/g, '')
    return cleanPhone.length >= 8 && !!form.password && form.password.length >= 6
  } else {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(form.email) && !!form.password && form.password.length >= 6
  }
})

const touched = reactive({
  telephone: false,
  email: false,
  password: false
})

const validateField = (field) => {
  if (field === 'telephone' || field === 'phone') {
    touched.telephone = true
    const cleanPhone = form.telephone.replace(/\s+/g, '')
    if (!cleanPhone) {
      errors.loginField = 'Le numéro de téléphone est requis'
    } else if (cleanPhone.length < 8) {
      errors.loginField = 'Veuillez saisir un numéro de téléphone valide'
    } else {
      errors.loginField = ''
    }
  }

  if (field === 'email') {
    touched.email = true
    if (!form.email.trim()) {
      errors.loginField = "L'adresse email est requise"
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      errors.loginField = 'Adresse email invalide'
    } else {
      errors.loginField = ''
    }
  }

  if (field === 'password') {
    touched.password = true
    if (!form.password) {
      errors.password = 'Le mot de passe est requis'
    } else if (form.password.length < 6) {
      errors.password = 'Le mot de passe doit contenir au moins 6 caractères'
    } else {
      errors.password = ''
    }
  }
}

const validateForm = () => {
  let isValid = true
  errors.loginField = ''
  errors.password = ''

  if (loginType.value === 'phone') {
    validateField('telephone')
  } else {
    validateField('email')
  }
  validateField('password')

  if (errors.loginField || errors.password) isValid = false
  return isValid
}

const handleSubmit = async () => {
  if (!isFormValid.value || !validateForm()) return

  const payload = {
    password: form.password,
    ...(loginType.value === 'phone'
      ? { telephone: form.telephone.replace(/\s+/g, '') }
      : { email: form.email })
  }

  try {
    const res = await login(payload)
    const user = res?.user
    const roles = user?.roles || []
    
    const isAdmin = (Array.isArray(roles) && roles.some(r => typeof r === 'string' ? r === 'admin' : r.name === 'admin')) || user?.mode_actuel === 'admin'
    const isEntreprise = (Array.isArray(roles) && roles.some(r => typeof r === 'string' ? (r === 'gerant_entreprise' || r === 'entreprise') : (r.name === 'gerant_entreprise' || r.name === 'entreprise'))) ||
                         user?.mode_actuel === 'entreprise' ||
                         !!user?.entreprise

    const mode = user?.mode_actuel

    if (isAdmin) {
      router.push('/admin')
    } else if (isEntreprise) {
      router.push('/entreprise')
    } else if (mode === 'voyageur') {
      router.push('/voyageur')
    } else {
      router.push('/client')
    }
  } catch (err) {
    // Handled by useAuth state
  }
}
</script>

<template>
  <div class="w-full max-w-md mx-auto">
    <!-- Form Subtitle & Title -->
    <div class="mb-6">
      <span class="text-xs sm:text-sm font-semibold uppercase tracking-wider text-tertiaire font-sans">
        Espace personnel
      </span>
      <h1 class="text-2xl sm:text-3xl font-serif font-bold text-principal-dark dark:text-sky-300 mt-1">
        Content de vous revoir
      </h1>
      <p class="text-xs sm:text-sm text-gray-500 dark:text-slate-400 mt-1">
        Connectez-vous pour suivre vos colis, vos trajets et vos échanges.
      </p>
    </div>

    <!-- Alert Global Error -->
    <div v-if="error" class="mb-5 p-3.5 bg-red-50 dark:bg-red-950/80 border border-red-200 dark:border-red-900 text-red-700 dark:text-red-300 text-xs sm:text-sm rounded-xl flex items-center gap-2 shadow-2xs">
      <svg class="w-5 h-5 text-red-500 dark:text-red-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <span>{{ error }}</span>
    </div>

    <!-- Login Mode Switcher Tabs (Téléphone | Email) -->
    <div class="bg-gray-100 dark:bg-slate-800 p-1 rounded-2xl flex items-center mb-6 border border-gray-200/80 dark:border-slate-700">
      <button
        type="button"
        @click="toggleLoginType('phone')"
        :class="[
          'flex-1 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 cursor-pointer text-center',
          loginType === 'phone'
            ? 'bg-white dark:bg-slate-700 text-principal-dark dark:text-sky-300 shadow-2xs font-bold'
            : 'text-gray-500 dark:text-slate-400 hover:text-gray-800 dark:hover:text-white'
        ]"
      >
        Téléphone
      </button>
      <button
        type="button"
        @click="toggleLoginType('email')"
        :class="[
          'flex-1 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 cursor-pointer text-center',
          loginType === 'email'
            ? 'bg-white dark:bg-slate-700 text-principal-dark dark:text-sky-300 shadow-2xs font-bold'
            : 'text-gray-500 dark:text-slate-400 hover:text-gray-800 dark:hover:text-white'
        ]"
      >
        Email
      </button>
    </div>

    <!-- Form -->
    <form @submit.prevent="handleSubmit" class="space-y-4" novalidate>
      <!-- Phone Input Mode with International Country Code Selector -->
      <div v-if="loginType === 'phone'" class="space-y-1">
        <label for="telephone" class="block text-xs sm:text-sm font-semibold text-gray-700 dark:text-slate-200">
          Numéro de téléphone
        </label>
        <CountryPhoneInput
          id="telephone"
          v-model="form.telephone"
          @blur="validateField('telephone')"
          @update:modelValue="touched.telephone && validateField('telephone')"
          placeholder="77 000 00 00"
        />
        <p v-if="errors.loginField" class="text-xs text-red-600 dark:text-red-400 mt-1 font-medium">{{ errors.loginField }}</p>
      </div>

      <!-- Email Input Mode -->
      <div v-else class="space-y-1">
        <label for="email" class="block text-xs sm:text-sm font-semibold text-gray-700 dark:text-slate-200">
          Adresse email
        </label>
        <div class="relative">
          <input
            id="email"
            v-model="form.email"
            @blur="validateField('email')"
            @input="touched.email && validateField('email')"
            type="email"
            placeholder="exemple@rahma.sn"
            class="w-full h-11 px-3.5 text-xs sm:text-sm text-gray-900 dark:text-slate-100 bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded-xl focus:border-principal dark:focus:border-sky-400 focus:ring-2 focus:ring-principal/20 outline-none transition-all placeholder-gray-400 dark:placeholder-slate-500 font-medium"
          />
        </div>
        <p v-if="errors.loginField" class="text-xs text-red-600 dark:text-red-400 mt-1 font-medium">{{ errors.loginField }}</p>
      </div>

      <!-- Password Input -->
      <div class="space-y-1">
        <label for="password" class="block text-xs sm:text-sm font-semibold text-gray-700 dark:text-slate-200">
          Mot de passe
        </label>
        <div class="relative">
          <input
            id="password"
            v-model="form.password"
            @blur="validateField('password')"
            @input="touched.password && validateField('password')"
            :type="showPassword ? 'text' : 'password'"
            placeholder="••••••••"
            class="w-full h-11 px-3.5 pr-10 text-xs sm:text-sm text-gray-900 dark:text-slate-100 bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded-xl focus:border-principal dark:focus:border-sky-400 focus:ring-2 focus:ring-principal/20 outline-none transition-all placeholder-gray-400 dark:placeholder-slate-500 font-medium"
          />
          <button
            type="button"
            @click="showPassword = !showPassword"
            class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-slate-400 hover:text-gray-600 dark:hover:text-slate-200 transition-colors p-1"
          >
            <svg v-if="!showPassword" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            <svg v-else class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858-5.908a10.016 10.016 0 014.122-.963c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21M3 3l18 18" />
            </svg>
          </button>
        </div>
        <p v-if="errors.password" class="text-xs text-red-600 dark:text-red-400 mt-1 font-medium">{{ errors.password }}</p>
      </div>

      <!-- Remember Me -->
      <div class="flex items-center pt-1">
        <label class="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            v-model="rememberMe"
            class="w-4 h-4 rounded text-principal focus:ring-principal/20 border-gray-300 dark:border-slate-700 dark:bg-slate-800"
          />
          <span class="text-xs text-gray-600 dark:text-slate-300 font-medium">Se souvenir de moi</span>
        </label>
      </div>

      <!-- Submit Button (Disabled if empty or invalid) -->
      <button
        type="submit"
        :disabled="!isFormValid || isLoading"
        :class="[
          'w-full py-3.5 rounded-xl font-bold transition-all duration-200 flex items-center justify-center gap-2 mt-4',
          isFormValid && !isLoading
            ? 'bg-principal-dark hover:bg-principal dark:bg-sky-600 dark:hover:bg-sky-500 text-white shadow-md hover:shadow-lg active:scale-[0.99] cursor-pointer'
            : 'bg-gray-200 dark:bg-slate-800 text-gray-400 dark:text-slate-600 cursor-not-allowed border border-gray-300 dark:border-slate-700 opacity-75'
        ]"
      >
        <svg v-if="isLoading" class="w-5 h-5 animate-spin text-white" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <span>{{ isLoading ? 'Connexion en cours...' : 'Se connecter' }}</span>
      </button>
    </form>

    <!-- Footer Register link -->
    <div class="mt-8 text-center text-xs sm:text-sm text-gray-600 dark:text-slate-400">
      Pas encore de compte ?
      <RouterLink to="/auth/register" class="font-bold text-principal-dark dark:text-sky-400 hover:text-secondaire dark:hover:text-sky-300 transition-colors underline ml-1">
        Créer un compte
      </RouterLink>
    </div>
  </div>
</template>
