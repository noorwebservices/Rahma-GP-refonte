<script setup>
import { ref, reactive, computed, watch } from 'vue'
import { useRouter, RouterLink } from 'vue-router'
import { useAuth } from '@/composables/useAuth'
import CountryPhoneInput from '@/components/common/CountryPhoneInput.vue'

const router = useRouter()
const { register, isLoading, error } = useAuth()

// Profile selection: 'client' | 'voyageur'
const profileType = ref('client')

// Voyageur step: 1 | 2
const voyageurStep = ref(1)

// Reset step if switching profile type
watch(profileType, () => {
  voyageurStep.value = 1
})

const showPassword = ref(false)
const showConfirmPassword = ref(false)

const form = reactive({
  nom: '',
  prenom: '',
  email: '',
  telephone: '',
  adresse: '',
  password: '',
  password_confirmation: '',
  // Voyageur specific fields
  type_piece: 'cni',
  numero_piece: '',
  cni_recto: null,
  cni_verso: null
})

const errors = reactive({
  nom: '',
  prenom: '',
  email: '',
  telephone: '',
  password: '',
  password_confirmation: '',
  numero_piece: '',
  cni_recto: '',
  cni_verso: ''
})

const touched = reactive({
  nom: false,
  prenom: false,
  email: false,
  telephone: false,
  password: false,
  password_confirmation: false,
  numero_piece: false,
  cni_recto: false,
  cni_verso: false
})

const rectoFileName = ref('')
const versoFileName = ref('')

const handleFileChange = (event, field) => {
  const file = event.target.files[0]
  if (file) {
    form[field] = file
    if (field === 'cni_recto') rectoFileName.value = file.name
    if (field === 'cni_verso') versoFileName.value = file.name
  } else {
    form[field] = null
    if (field === 'cni_recto') rectoFileName.value = ''
    if (field === 'cni_verso') versoFileName.value = ''
  }
  if (touched[field]) {
    validateField(field)
  }
}

// Step 1 Validation (Informations personnelles)
const isStep1Valid = computed(() => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  const cleanPhone = form.telephone.replace(/\s+/g, '')
  const emailVal = form.email.trim()
  
  const isEmailValid = profileType.value === 'voyageur'
    ? (!!emailVal && emailRegex.test(emailVal))
    : (!emailVal || emailRegex.test(emailVal))

  return (
    form.nom.trim().length >= 2 &&
    form.prenom.trim().length >= 3 &&
    isEmailValid &&
    cleanPhone.length >= 8 &&
    !!form.password &&
    form.password.length >= 6 &&
    form.password_confirmation === form.password
  )
})

// Step 2 Validation (Pièce d'identité)
const isStep2Valid = computed(() => {
  return (
    form.numero_piece.trim().length >= 3 &&
    !!form.cni_recto &&
    !!form.cni_verso
  )
})

// Total Form Validity
const isFormValid = computed(() => {
  if (profileType.value === 'voyageur') {
    return isStep1Valid.value && isStep2Valid.value
  }
  return isStep1Valid.value
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
    if (profileType.value === 'voyageur' && !val) {
      errors.email = "L'adresse email est requise pour le profil Voyageur"
    } else if (val && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) {
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

  if (profileType.value === 'voyageur') {
    if (field === 'numero_piece') {
      if (!form.numero_piece.trim()) {
        errors.numero_piece = 'Le numéro de pièce est requis'
      } else {
        errors.numero_piece = ''
      }
    }

    if (field === 'cni_recto') {
      if (!form.cni_recto) {
        errors.cni_recto = 'La photo recto de la pièce est requise'
      } else {
        errors.cni_recto = ''
      }
    }

    if (field === 'cni_verso') {
      if (!form.cni_verso) {
        errors.cni_verso = 'La photo verso de la pièce est requise'
      } else {
        errors.cni_verso = ''
      }
    }
  }
}

const validateStep1 = () => {
  ['prenom', 'nom', 'email', 'telephone', 'password', 'password_confirmation'].forEach(f => validateField(f))
  return isStep1Valid.value
}

const goToStep2 = () => {
  if (validateStep1()) {
    voyageurStep.value = 2
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
}

const validateForm = () => {
  let isValid = true
  Object.keys(touched).forEach(f => validateField(f))
  
  if (profileType.value === 'voyageur') {
    validateField('numero_piece')
    validateField('cni_recto')
    validateField('cni_verso')
  }

  Object.keys(errors).forEach(key => {
    if (errors[key]) isValid = false
  })
  return isValid
}

import Swal from 'sweetalert2'

const handleSubmit = async () => {
  if (!isFormValid.value || !validateForm()) return

  if (profileType.value === 'voyageur') {
    const formData = new FormData()
    formData.append('profile_type', 'voyageur')
    formData.append('nom', form.nom)
    formData.append('prenom', form.prenom)
    formData.append('telephone', form.telephone.replace(/\s+/g, ''))
    if (form.email && form.email.trim()) formData.append('email', form.email.trim())
    if (form.adresse) formData.append('adresse', form.adresse)
    formData.append('password', form.password)
    formData.append('password_confirmation', form.password_confirmation)
    formData.append('mot_de_passe', form.password)
    formData.append('mot_de_passe_confirmation', form.password_confirmation)

    formData.append('type_piece', form.type_piece)
    formData.append('numero_piece', form.numero_piece)
    if (form.cni_recto) formData.append('cni_recto', form.cni_recto)
    if (form.cni_verso) formData.append('cni_verso', form.cni_verso)

    try {
      await register(formData)
      await Swal.fire({
        title: 'Inscription Voyageur Réussie ! ✈️',
        html: `
          <div class="space-y-3 text-left text-xs sm:text-sm text-gray-700">
            <p>Votre profil voyageur et vos pièces d'identité ont été transmis avec succès.</p>
            <div class="p-3 bg-amber-50 border border-amber-200 rounded-2xl text-amber-900 text-xs font-medium space-y-1">
              <strong>🔒 Ce que vous devez faire ensuite :</strong>
              <ol class="list-decimal pl-4 space-y-1 mt-1">
                <li>L'administration va examiner vos pièces d'identité.</li>
                <li>Dès approbation, un email vous sera envoyé à <strong>${form.email}</strong>.</li>
                <li>Vous devez cliquer sur le lien dans ce mail pour activer définitivement votre compte voyageur.</li>
              </ol>
            </div>
          </div>
        `,
        icon: 'success',
        confirmButtonColor: '#053754',
        confirmButtonText: 'J\'ai compris, aller à la connexion',
        customClass: {
          popup: 'rounded-3xl font-sans'
        }
      })
      router.push('/auth/login')
    } catch (err) {
      // Handled in useAuth
    }
  } else {
    const payload = {
      profile_type: 'client',
      nom: form.nom,
      prenom: form.prenom,
      telephone: form.telephone.replace(/\s+/g, ''),
      adresse: form.adresse,
      password: form.password,
      password_confirmation: form.password_confirmation
    }

    if (form.email && form.email.trim()) {
      payload.email = form.email.trim()
    }

    try {
      await register(payload)
      router.push('/client')
    } catch (err) {
      // Handled in useAuth
    }
  }
}

</script>

<template>
  <div class="w-full max-w-lg mx-auto py-2">
    <!-- Header -->
    <div class="mb-5 text-center sm:text-left">
      <span class="text-xs sm:text-sm font-semibold uppercase tracking-wider text-tertiaire font-sans">
        Bienvenue chez Rahma GP
      </span>
      <h1 class="text-2xl sm:text-3xl font-serif font-bold text-principal-dark dark:text-sky-300 mt-1">
        Créer votre compte
      </h1>
      <p class="text-xs sm:text-sm text-gray-500 dark:text-slate-400 mt-1">
        Choisissez votre profil et rejoignez notre réseau de livraison collaborative.
      </p>
    </div>

    <!-- Profile Selector (Client vs Voyageur) -->
    <div class="mb-6 p-1.5 bg-gray-100 dark:bg-slate-800 rounded-2xl grid grid-cols-2 gap-1 border border-gray-200 dark:border-slate-700">
      <button
        type="button"
        @click="profileType = 'client'"
        :class="[
          'py-3 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 cursor-pointer',
          profileType === 'client'
            ? 'bg-white dark:bg-slate-900 text-principal-dark dark:text-sky-300 shadow-md border border-gray-200/80 dark:border-slate-700'
            : 'text-gray-500 dark:text-slate-400 hover:text-gray-800 dark:hover:text-slate-200'
        ]"
      >
        <svg class="w-4 h-4 text-principal dark:text-sky-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
        <span>Profil Client</span>
      </button>

      <button
        type="button"
        @click="profileType = 'voyageur'"
        :class="[
          'py-3 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 cursor-pointer',
          profileType === 'voyageur'
            ? 'bg-principal dark:bg-sky-600 text-white shadow-md'
            : 'text-gray-500 dark:text-slate-400 hover:text-gray-800 dark:hover:text-slate-200'
        ]"
      >
        <svg class="w-4 h-4 text-tertiaire" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 002 2h1.5a2.5 2.5 0 002.5-2.5V7a2 2 0 00-2-2h-1.5A2.5 2.5 0 0113 2.5V2m0 0a9 9 0 11-9 9 9 9 0 019-9z" />
        </svg>
        <span>Profil Voyageur (GP)</span>
      </button>
    </div>

    <!-- Voyageur Multi-Step Indicator -->
    <div v-if="profileType === 'voyageur'" class="mb-6 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs">
      <div class="flex items-center justify-between gap-4">
        <!-- Step 1 Button/Header -->
        <button 
          type="button" 
          @click="voyageurStep = 1"
          class="flex items-center gap-3 text-left focus:outline-none cursor-pointer group"
        >
          <div :class="[
            'w-9 h-9 rounded-full font-bold text-xs flex items-center justify-center transition-all',
            voyageurStep === 1 
              ? 'bg-principal text-white shadow-md ring-4 ring-principal/20 dark:ring-sky-900' 
              : isStep1Valid 
                ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400'
                : 'bg-gray-100 dark:bg-slate-800 text-gray-400'
          ]">
            <svg v-if="isStep1Valid && voyageurStep === 2" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7" />
            </svg>
            <span v-else>1</span>
          </div>
          <div>
            <span class="block text-[10px] font-extrabold uppercase tracking-wider text-gray-400">Étape 1</span>
            <span :class="[
              'text-xs font-bold transition-colors',
              voyageurStep === 1 ? 'text-principal-dark dark:text-sky-300' : 'text-gray-600 dark:text-slate-400'
            ]">Informations Compte</span>
          </div>
        </button>

        <!-- Divider bar -->
        <div class="flex-1 h-0.5 bg-gray-200 dark:bg-slate-700 rounded-full mx-2">
          <div :class="[
            'h-full bg-principal dark:bg-sky-500 transition-all duration-300',
            voyageurStep === 2 ? 'w-full' : 'w-0'
          ]"></div>
        </div>

        <!-- Step 2 Button/Header -->
        <button 
          type="button" 
          @click="goToStep2"
          :disabled="!isStep1Valid"
          :class="[
            'flex items-center gap-3 text-left focus:outline-none transition-all',
            isStep1Valid ? 'cursor-pointer opacity-100' : 'cursor-not-allowed opacity-60'
          ]"
        >
          <div :class="[
            'w-9 h-9 rounded-full font-bold text-xs flex items-center justify-center transition-all',
            voyageurStep === 2 
              ? 'bg-principal text-white shadow-md ring-4 ring-principal/20 dark:ring-sky-900' 
              : 'bg-gray-100 dark:bg-slate-800 text-gray-400'
          ]">
            2
          </div>
          <div>
            <span class="block text-[10px] font-extrabold uppercase tracking-wider text-gray-400">Étape 2</span>
            <span :class="[
              'text-xs font-bold transition-colors',
              voyageurStep === 2 ? 'text-principal-dark dark:text-sky-300' : 'text-gray-600 dark:text-slate-400'
            ]">Pièce d'Identité</span>
          </div>
        </button>
      </div>
    </div>

    <!-- Alert Error -->
    <div v-if="error" class="mb-4 p-3 bg-red-50 dark:bg-red-950/80 border border-red-200 dark:border-red-900 text-red-700 dark:text-red-300 text-xs sm:text-sm rounded-xl flex items-center gap-2 shadow-2xs">
      <svg class="w-5 h-5 text-red-500 dark:text-red-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <span>{{ error }}</span>
    </div>

    <!-- Form Container -->
    <form @submit.prevent="handleSubmit" class="space-y-3.5" novalidate>
      
      <!-- ==================== ÉTAPE 1 : Client OU Voyageur Step 1 ==================== -->
      <div v-show="profileType === 'client' || (profileType === 'voyageur' && voyageurStep === 1)" class="space-y-3.5 animate-in fade-in duration-200">
        <!-- Grid Nom & Prénom -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div class="space-y-1">
            <label for="prenom" class="block text-xs font-semibold text-gray-700 dark:text-slate-200">Prénom</label>
            <input
              id="prenom"
              v-model="form.prenom"
              @blur="validateField('prenom')"
              @input="touched.prenom && validateField('prenom')"
              type="text"
              placeholder="Zahra"
              class="w-full px-3.5 py-2.5 text-xs sm:text-sm text-gray-900 dark:text-slate-100 bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded-xl focus:border-principal dark:focus:border-sky-400 focus:ring-2 focus:ring-principal/20 outline-none transition-all placeholder-gray-400 dark:placeholder-slate-500 font-medium"
            />
            <p v-if="errors.prenom" class="text-[11px] text-red-600 dark:text-red-400 font-medium">{{ errors.prenom }}</p>
          </div>

          <div class="space-y-1">
            <label for="nom" class="block text-xs font-semibold text-gray-700 dark:text-slate-200">Nom</label>
            <input
              id="nom"
              v-model="form.nom"
              @blur="validateField('nom')"
              @input="touched.nom && validateField('nom')"
              type="text"
              placeholder="Ndiaye"
              class="w-full px-3.5 py-2.5 text-xs sm:text-sm text-gray-900 dark:text-slate-100 bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded-xl focus:border-principal dark:focus:border-sky-400 focus:ring-2 focus:ring-principal/20 outline-none transition-all placeholder-gray-400 dark:placeholder-slate-500 font-medium"
            />
            <p v-if="errors.nom" class="text-[11px] text-red-600 dark:text-red-400 font-medium">{{ errors.nom }}</p>
          </div>
        </div>

        <!-- Email -->
        <div class="space-y-1">
          <label for="email" class="block text-xs font-semibold text-gray-700 dark:text-slate-200">
            Adresse email 
            <span v-if="profileType === 'client'" class="text-gray-400 dark:text-slate-400 font-normal">(Optionnel)</span>
            <span v-else class="text-red-600 dark:text-red-400 font-bold">* (Requis pour la vérification du compte)</span>
          </label>
          <input
            id="email"
            v-model="form.email"
            @blur="validateField('email')"
            @input="touched.email && validateField('email')"
            type="email"
            placeholder="zahra.ndiaye@example.com"
            class="w-full px-3.5 py-2.5 text-xs sm:text-sm text-gray-900 dark:text-slate-100 bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded-xl focus:border-principal dark:focus:border-sky-400 focus:ring-2 focus:ring-principal/20 outline-none transition-all placeholder-gray-400 dark:placeholder-slate-500 font-medium"
          />
          <p v-if="errors.email" class="text-[11px] text-red-600 dark:text-red-400 font-medium">{{ errors.email }}</p>
        </div>

        <!-- Téléphone avec Sélecteur d'Indicatif de Pays -->
        <div class="space-y-1">
          <label for="telephone" class="block text-xs font-semibold text-gray-700 dark:text-slate-200">Téléphone</label>
          <CountryPhoneInput
            id="telephone"
            v-model="form.telephone"
            @blur="validateField('telephone')"
            @update:modelValue="touched.telephone && validateField('telephone')"
            placeholder="78 150 96 80"
          />
          <p v-if="errors.telephone" class="text-[11px] text-red-600 dark:text-red-400 font-medium">{{ errors.telephone }}</p>
        </div>

        <!-- Adresse -->
        <div class="space-y-1">
          <label for="adresse" class="block text-xs font-semibold text-gray-700 dark:text-slate-200">Adresse (Ville, Région)</label>
          <input
            id="adresse"
            v-model="form.adresse"
            type="text"
            placeholder="Thiès, Sénégal"
            class="w-full px-3.5 py-2.5 text-xs sm:text-sm text-gray-900 dark:text-slate-100 bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded-xl focus:border-principal dark:focus:border-sky-400 focus:ring-2 focus:ring-principal/20 outline-none transition-all placeholder-gray-400 dark:placeholder-slate-500 font-medium"
          />
        </div>

        <!-- Password & Confirmation -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div class="space-y-1">
            <label for="password" class="block text-xs font-semibold text-gray-700 dark:text-slate-200">Mot de passe</label>
            <div class="relative">
              <input
                id="password"
                v-model="form.password"
                @blur="validateField('password')"
                @input="touched.password && validateField('password')"
                :type="showPassword ? 'text' : 'password'"
                placeholder="••••••••"
                class="w-full px-3 py-2.5 pr-8 text-xs sm:text-sm text-gray-900 dark:text-slate-100 bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded-xl focus:border-principal dark:focus:border-sky-400 focus:ring-2 focus:ring-principal/20 outline-none font-medium placeholder-gray-400 dark:placeholder-slate-500"
              />
              <button type="button" @click="showPassword = !showPassword" class="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 dark:text-slate-400 hover:text-gray-600 dark:hover:text-slate-200 p-1">
                <svg v-if="!showPassword" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
                <svg v-else class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858-5.908a10.016 10.016 0 014.122-.963c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21M3 3l18 18"/></svg>
              </button>
            </div>
            <p v-if="errors.password" class="text-[11px] text-red-600 dark:text-red-400 font-medium">{{ errors.password }}</p>
          </div>

          <div class="space-y-1">
            <label for="password_confirmation" class="block text-xs font-semibold text-gray-700 dark:text-slate-200">Confirmation</label>
            <div class="relative">
              <input
                id="password_confirmation"
                v-model="form.password_confirmation"
                @blur="validateField('password_confirmation')"
                @input="touched.password_confirmation && validateField('password_confirmation')"
                :type="showConfirmPassword ? 'text' : 'password'"
                placeholder="••••••••"
                class="w-full px-3 py-2.5 pr-8 text-xs sm:text-sm text-gray-900 dark:text-slate-100 bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded-xl focus:border-principal dark:focus:border-sky-400 focus:ring-2 focus:ring-principal/20 outline-none font-medium placeholder-gray-400 dark:placeholder-slate-500"
              />
              <button type="button" @click="showConfirmPassword = !showConfirmPassword" class="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 dark:text-slate-400 hover:text-gray-600 dark:hover:text-slate-200 p-1">
                <svg v-if="!showConfirmPassword" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
                <svg v-else class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858-5.908a10.016 10.016 0 014.122-.963c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21M3 3l18 18"/></svg>
              </button>
            </div>
            <p v-if="errors.password_confirmation" class="text-[11px] text-red-600 dark:text-red-400 font-medium">{{ errors.password_confirmation }}</p>
          </div>
        </div>

        <!-- Button Voyageur Step 1 -> Next Step -->
        <button
          v-if="profileType === 'voyageur'"
          type="button"
          @click="goToStep2"
          :disabled="!isStep1Valid"
          :class="[
            'w-full py-3.5 rounded-xl font-bold transition-all duration-200 flex items-center justify-center gap-2 mt-6 cursor-pointer',
            isStep1Valid
              ? 'bg-principal hover:bg-principal-dark text-white shadow-md hover:shadow-lg active:scale-[0.99]'
              : 'bg-gray-200 dark:bg-slate-800 text-gray-400 dark:text-slate-600 cursor-not-allowed border border-gray-300 dark:border-slate-700 opacity-75'
          ]"
        >
          <span>Continuer vers l'Étape 2 (Pièce d'identité)</span>
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
          </svg>
        </button>
      </div>

      <!-- ==================== ÉTAPE 2 : Voyageur Step 2 (Pièce d'identité) ==================== -->
      <div v-show="profileType === 'voyageur' && voyageurStep === 2" class="space-y-4 animate-in fade-in duration-200">
        <div class="p-4.5 bg-gray-50 dark:bg-slate-800/80 rounded-2xl border border-gray-200 dark:border-slate-700 space-y-4">
          <div class="flex items-center justify-between border-b border-gray-200 dark:border-slate-700 pb-3">
            <h3 class="text-xs font-extrabold uppercase tracking-wider text-principal-dark dark:text-sky-300 flex items-center gap-1.5">
              <svg class="w-4 h-4 text-principal dark:text-sky-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0" />
              </svg>
              <span>Vérification d'Identité</span>
            </h3>
            <span class="text-[11px] font-bold text-amber-700 bg-amber-100 dark:bg-amber-950 dark:text-amber-300 px-2.5 py-0.5 rounded-full">Requis</span>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div class="space-y-1">
              <label for="type_piece" class="block text-xs font-semibold text-gray-700 dark:text-slate-200">Type de pièce</label>
              <select
                id="type_piece"
                v-model="form.type_piece"
                class="w-full px-3.5 py-2.5 text-xs sm:text-sm text-gray-900 dark:text-slate-100 bg-white dark:bg-slate-900 border border-gray-300 dark:border-slate-700 rounded-xl outline-none font-medium"
              >
                <option value="cni">Carte Nationale d'Identité (CNI)</option>
                <option value="passeport">Passeport</option>
              </select>
            </div>

            <div class="space-y-1">
              <label for="numero_piece" class="block text-xs font-semibold text-gray-700 dark:text-slate-200">Numéro de pièce</label>
              <input
                id="numero_piece"
                v-model="form.numero_piece"
                @blur="validateField('numero_piece')"
                @input="touched.numero_piece && validateField('numero_piece')"
                type="text"
                placeholder="1342199800123"
                class="w-full px-3.5 py-2.5 text-xs sm:text-sm text-gray-900 dark:text-slate-100 bg-white dark:bg-slate-900 border border-gray-300 dark:border-slate-700 rounded-xl outline-none font-medium placeholder-gray-400 dark:placeholder-slate-500"
              />
              <p v-if="errors.numero_piece" class="text-[11px] text-red-600 dark:text-red-400 font-medium">{{ errors.numero_piece }}</p>
            </div>
          </div>

          <!-- File Upload Recto -->
          <div class="space-y-1">
            <label class="block text-xs font-semibold text-gray-700 dark:text-slate-200">Photo Recto de la pièce</label>
            <input
              type="file"
              accept="image/*,.pdf"
              @change="(e) => handleFileChange(e, 'cni_recto')"
              class="w-full text-xs text-gray-500 dark:text-slate-400 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-principal/10 dark:file:bg-sky-950 file:text-principal dark:file:text-sky-300 hover:file:bg-principal/20 dark:hover:file:bg-sky-900 cursor-pointer"
            />
            <p v-if="rectoFileName" class="text-[11px] text-gray-600 dark:text-slate-400 font-medium">Fichier sélectionné : {{ rectoFileName }}</p>
            <p v-if="errors.cni_recto" class="text-[11px] text-red-600 dark:text-red-400 font-medium">{{ errors.cni_recto }}</p>
          </div>

          <!-- File Upload Verso -->
          <div class="space-y-1">
            <label class="block text-xs font-semibold text-gray-700 dark:text-slate-200">Photo Verso de la pièce</label>
            <input
              type="file"
              accept="image/*,.pdf"
              @change="(e) => handleFileChange(e, 'cni_verso')"
              class="w-full text-xs text-gray-500 dark:text-slate-400 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-principal/10 dark:file:bg-sky-950 file:text-principal dark:file:text-sky-300 hover:file:bg-principal/20 dark:hover:file:bg-sky-900 cursor-pointer"
            />
            <p v-if="versoFileName" class="text-[11px] text-gray-600 dark:text-slate-400 font-medium">Fichier sélectionné : {{ versoFileName }}</p>
            <p v-if="errors.cni_verso" class="text-[11px] text-red-600 dark:text-red-400 font-medium">{{ errors.cni_verso }}</p>
          </div>
        </div>

        <!-- Buttons for Step 2 -->
        <div class="flex items-center gap-3 pt-2">
          <button
            type="button"
            @click="voyageurStep = 1"
            class="w-1/3 py-3.5 bg-gray-100 hover:bg-gray-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-gray-700 dark:text-slate-200 font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-1 cursor-pointer"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            <span>Retour</span>
          </button>

          <button
            type="submit"
            :disabled="!isFormValid || isLoading"
            :class="[
              'w-2/3 py-3.5 rounded-xl font-bold transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer',
              isFormValid && !isLoading
                ? 'bg-principal-dark hover:bg-principal dark:bg-sky-600 dark:hover:bg-sky-500 text-white shadow-md hover:shadow-lg active:scale-[0.99]'
                : 'bg-gray-200 dark:bg-slate-800 text-gray-400 dark:text-slate-600 cursor-not-allowed border border-gray-300 dark:border-slate-700 opacity-75'
            ]"
          >
            <svg v-if="isLoading" class="w-5 h-5 animate-spin text-white" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span>{{ isLoading ? 'Création en cours...' : 'S\'inscrire comme Voyageur' }}</span>
          </button>
        </div>
      </div>

      <!-- Submit Button for CLIENT profile -->
      <button
        v-if="profileType === 'client'"
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
        <span>{{ isLoading ? 'Création en cours...' : 'S\'inscrire' }}</span>
      </button>

    </form>

    <!-- Footer Login link -->
    <div class="mt-6 text-center text-xs sm:text-sm text-gray-600 dark:text-slate-400">
      Déjà un compte ?
      <RouterLink to="/auth/login" class="font-bold text-principal-dark dark:text-sky-400 hover:text-secondaire dark:hover:text-sky-300 transition-colors underline ml-1">
        Se connecter
      </RouterLink>
    </div>
  </div>
</template>
