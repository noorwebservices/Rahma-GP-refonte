<script setup>
import { ref, reactive, computed } from 'vue'
import { useRouter, RouterLink } from 'vue-router'
import { useAuth } from '@/composables/useAuth'
import CountryPhoneInput from '@/components/common/CountryPhoneInput.vue'

const router = useRouter()
const { register, isLoading, error } = useAuth()

const showPassword = ref(false)
const showConfirmPassword = ref(false)

const form = reactive({
  nom: '',
  prenom: '',
  email: '',
  telephone: '',
  adresse: '',
  password: '',
  password_confirmation: ''
})

const errors = reactive({
  nom: '',
  prenom: '',
  email: '',
  telephone: '',
  password: '',
  password_confirmation: ''
})

const touched = reactive({
  nom: false,
  prenom: false,
  email: false,
  telephone: false,
  password: false,
  password_confirmation: false
})

// Computed validation to disable button if fields are empty or invalid
const isFormValid = computed(() => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  const cleanPhone = form.telephone.replace(/\s+/g, '')
  
  return (
    form.nom.trim().length >= 2 &&
    form.prenom.trim().length >= 3 &&
    emailRegex.test(form.email.trim()) &&
    cleanPhone.length >= 8 &&
    !!form.password &&
    form.password.length >= 6 &&
    form.password_confirmation === form.password
  )
})

const validateField = (field) => {
  touched[field] = true

  if (field === 'prenom') {
    const val = form.prenom.trim()
    if (!val) {
      errors.prenom = 'Le prénom est requis'
    } else if (val.length < 3) {
      errors.prenom = 'Le prénom doit contenir au moins 3 caractères'
    } else {
      errors.prenom = ''
    }
  }

  if (field === 'nom') {
    const val = form.nom.trim()
    if (!val) {
      errors.nom = 'Le nom est requis'
    } else if (val.length < 2) {
      errors.nom = 'Le nom doit contenir au moins 2 caractères'
    } else {
      errors.nom = ''
    }
  }

  if (field === 'email') {
    const val = form.email.trim()
    if (!val) {
      errors.email = "L'adresse email est requise"
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) {
      errors.email = 'Adresse email invalide'
    } else {
      errors.email = ''
    }
  }

  if (field === 'telephone') {
    const cleanPhone = form.telephone.replace(/\s+/g, '')
    if (!cleanPhone) {
      errors.telephone = 'Le numéro de téléphone est requis'
    } else if (cleanPhone.length < 8) {
      errors.telephone = 'Saisissez un numéro de téléphone valide'
    } else {
      errors.telephone = ''
    }
  }

  if (field === 'password') {
    if (!form.password) {
      errors.password = 'Le mot de passe est requis'
    } else if (form.password.length < 6) {
      errors.password = 'Au moins 6 caractères requis'
    } else {
      errors.password = ''
    }
    if (touched.password_confirmation && form.password_confirmation) {
      validateField('password_confirmation')
    }
  }

  if (field === 'password_confirmation') {
    if (!form.password_confirmation) {
      errors.password_confirmation = 'Veuillez confirmer votre mot de passe'
    } else if (form.password_confirmation !== form.password) {
      errors.password_confirmation = 'Les mots de passe ne correspondent pas'
    } else {
      errors.password_confirmation = ''
    }
  }
}

const validateForm = () => {
  let isValid = true
  Object.keys(touched).forEach(f => validateField(f))
  Object.keys(errors).forEach(key => {
    if (errors[key]) isValid = false
  })
  return isValid
}

const handleSubmit = async () => {
  if (!isFormValid.value || !validateForm()) return

  const payload = {
    nom: form.nom,
    prenom: form.prenom,
    email: form.email,
    telephone: form.telephone.replace(/\s+/g, ''),
    adresse: form.adresse,
    password: form.password,
    password_confirmation: form.password_confirmation
  }

  try {
    await register(payload)
    router.push('/client')
  } catch (err) {
    // Handled by useAuth state
  }
}
</script>

<template>
  <div class="w-full max-w-md mx-auto py-2">
    <!-- Header -->
    <div class="mb-5">
      <span class="text-xs sm:text-sm font-semibold uppercase tracking-wider text-tertiaire font-sans">
        Bienvenue chez Rahma GP
      </span>
      <h1 class="text-2xl sm:text-3xl font-serif font-bold text-principal-dark mt-1">
        Créer votre compte
      </h1>
      <p class="text-xs sm:text-sm text-gray-500 mt-1">
        Rejoignez la communauté de livraison collaborative.
      </p>
    </div>

    <!-- Alert Error -->
    <div v-if="error" class="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs sm:text-sm rounded-xl flex items-center gap-2 shadow-2xs">
      <svg class="w-5 h-5 text-red-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <span>{{ error }}</span>
    </div>

    <!-- Form -->
    <form @submit.prevent="handleSubmit" class="space-y-3.5" novalidate>
      <!-- Grid Nom & Prénom -->
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div class="space-y-1">
          <label for="prenom" class="block text-xs font-semibold text-gray-700">Prénom</label>
          <input
            id="prenom"
            v-model="form.prenom"
            @blur="validateField('prenom')"
            @input="touched.prenom && validateField('prenom')"
            type="text"
            placeholder="Zahra"
            class="w-full px-3 py-2.5 text-xs sm:text-sm text-gray-900 bg-white border border-gray-300 rounded-xl focus:border-principal focus:ring-2 focus:ring-principal/20 outline-none transition-all font-medium"
          />
          <p v-if="errors.prenom" class="text-[11px] text-red-600 font-medium">{{ errors.prenom }}</p>
        </div>

        <div class="space-y-1">
          <label for="nom" class="block text-xs font-semibold text-gray-700">Nom</label>
          <input
            id="nom"
            v-model="form.nom"
            @blur="validateField('nom')"
            @input="touched.nom && validateField('nom')"
            type="text"
            placeholder="Ndiaye"
            class="w-full px-3 py-2.5 text-xs sm:text-sm text-gray-900 bg-white border border-gray-300 rounded-xl focus:border-principal focus:ring-2 focus:ring-principal/20 outline-none transition-all font-medium"
          />
          <p v-if="errors.nom" class="text-[11px] text-red-600 font-medium">{{ errors.nom }}</p>
        </div>
      </div>

      <!-- Email -->
      <div class="space-y-1">
        <label for="email" class="block text-xs font-semibold text-gray-700">Adresse email</label>
        <input
          id="email"
          v-model="form.email"
          @blur="validateField('email')"
          @input="touched.email && validateField('email')"
          type="email"
          placeholder="zahra.ndiaye@example.com"
          class="w-full px-3 py-2.5 text-xs sm:text-sm text-gray-900 bg-white border border-gray-300 rounded-xl focus:border-principal focus:ring-2 focus:ring-principal/20 outline-none transition-all font-medium"
        />
        <p v-if="errors.email" class="text-[11px] text-red-600 font-medium">{{ errors.email }}</p>
      </div>

      <!-- Téléphone avec Sélecteur d'Indicatif de Pays -->
      <div class="space-y-1">
        <label for="telephone" class="block text-xs font-semibold text-gray-700">Téléphone</label>
        <CountryPhoneInput
          id="telephone"
          v-model="form.telephone"
          @blur="validateField('telephone')"
          @update:modelValue="touched.telephone && validateField('telephone')"
          placeholder="78 150 96 80"
        />
        <p v-if="errors.telephone" class="text-[11px] text-red-600 font-medium">{{ errors.telephone }}</p>
      </div>

      <!-- Adresse -->
      <div class="space-y-1">
        <label for="adresse" class="block text-xs font-semibold text-gray-700">Adresse (Ville, Région)</label>
        <input
          id="adresse"
          v-model="form.adresse"
          type="text"
          placeholder="Thiès, Sénégal"
          class="w-full px-3 py-2.5 text-xs sm:text-sm text-gray-900 bg-white border border-gray-300 rounded-xl focus:border-principal focus:ring-2 focus:ring-principal/20 outline-none transition-all font-medium"
        />
      </div>

      <!-- Password & Confirmation -->
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div class="space-y-1">
          <label for="password" class="block text-xs font-semibold text-gray-700">Mot de passe</label>
          <div class="relative">
            <input
              id="password"
              v-model="form.password"
              @blur="validateField('password')"
              @input="touched.password && validateField('password')"
              :type="showPassword ? 'text' : 'password'"
              placeholder="••••••••"
              class="w-full px-3 py-2.5 pr-8 text-xs sm:text-sm text-gray-900 bg-white border border-gray-300 rounded-xl focus:border-principal focus:ring-2 focus:ring-principal/20 outline-none font-medium"
            />
            <button type="button" @click="showPassword = !showPassword" class="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 p-1">
              <svg v-if="!showPassword" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
              <svg v-else class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858-5.908a10.016 10.016 0 014.122-.963c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21M3 3l18 18"/></svg>
            </button>
          </div>
          <p v-if="errors.password" class="text-[11px] text-red-600 font-medium">{{ errors.password }}</p>
        </div>

        <div class="space-y-1">
          <label for="password_confirmation" class="block text-xs font-semibold text-gray-700">Confirmation</label>
          <div class="relative">
            <input
              id="password_confirmation"
              v-model="form.password_confirmation"
              @blur="validateField('password_confirmation')"
              @input="touched.password_confirmation && validateField('password_confirmation')"
              :type="showConfirmPassword ? 'text' : 'password'"
              placeholder="••••••••"
              class="w-full px-3 py-2.5 pr-8 text-xs sm:text-sm text-gray-900 bg-white border border-gray-300 rounded-xl focus:border-principal focus:ring-2 focus:ring-principal/20 outline-none font-medium"
            />
            <button type="button" @click="showConfirmPassword = !showConfirmPassword" class="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 p-1">
              <svg v-if="!showConfirmPassword" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
              <svg v-else class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858-5.908a10.016 10.016 0 014.122-.963c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21M3 3l18 18"/></svg>
            </button>
          </div>
          <p v-if="errors.password_confirmation" class="text-[11px] text-red-600 font-medium">{{ errors.password_confirmation }}</p>
        </div>
      </div>

      <!-- Submit Button (Disabled if empty or invalid) -->
      <button
        type="submit"
        :disabled="!isFormValid || isLoading"
        :class="[
          'w-full py-3.5 rounded-xl font-bold transition-all duration-200 flex items-center justify-center gap-2 mt-4',
          isFormValid && !isLoading
            ? 'bg-principal-dark hover:bg-principal text-white shadow-md hover:shadow-lg active:scale-[0.99] cursor-pointer'
            : 'bg-gray-200 text-gray-400 cursor-not-allowed border border-gray-300 opacity-75'
        ]"
      >
        <svg v-if="isLoading" class="w-5 h-5 animate-spin text-white" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <span>{{ isLoading ? 'Création en cours...' : "S'inscrire" }}</span>
      </button>
    </form>

    <!-- Footer Login link -->
    <div class="mt-6 text-center text-xs sm:text-sm text-gray-600">
      Déjà un compte ?
      <RouterLink to="/auth/login" class="font-bold text-principal-dark hover:text-secondaire transition-colors underline ml-1">
        Se connecter
      </RouterLink>
    </div>
  </div>
</template>
