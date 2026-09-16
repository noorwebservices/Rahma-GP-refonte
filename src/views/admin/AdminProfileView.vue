<template>
  <div class="space-y-6 max-w-4xl mx-auto">
    
    <!-- Profile Banner Card -->
    <div class="bg-[#053754] text-white rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col sm:flex-row items-center gap-6">
      <div class="w-20 h-20 rounded-full bg-white/20 border-4 border-white/30 text-white font-black text-2xl flex items-center justify-center shrink-0 shadow-lg">
        {{ currentUser?.prenom?.charAt(0) || 'A' }}
      </div>
      
      <div class="space-y-1 text-center sm:text-left">
        <div class="flex items-center justify-center sm:justify-start gap-2">
          <h2 class="text-2xl font-black text-white">{{ currentUser?.prenom }} {{ currentUser?.nom }}</h2>
          <span class="px-3 py-0.5 rounded-full text-xs font-black uppercase tracking-wider bg-white/20 text-white">
            Administrateur
          </span>
        </div>
        <p class="text-xs text-gray-200 font-medium">{{ currentUser?.email }} • {{ currentUser?.telephone }}</p>
      </div>
    </div>

    <!-- Alert Messages -->
    <div v-if="successMsg" class="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2">
      <span>✓</span> <span>{{ successMsg }}</span>
    </div>
    
    <div v-if="errorMsg" class="p-4 rounded-2xl bg-red-50 border border-red-200 text-[#B50302] text-xs font-bold flex items-center gap-2">
      <span>⚠️</span> <span>{{ errorMsg }}</span>
    </div>

    <!-- Profile Form Card -->
    <div class="bg-white border border-gray-200 rounded-3xl p-6 sm:p-8 shadow-2xs space-y-6">
      
      <div class="border-b border-gray-100 pb-3">
        <h3 class="font-extrabold text-base text-[#053754]">Modifier mes informations de compte</h3>
        <p class="text-xs text-gray-500 font-medium">Mettez à jour vos identifiants administrateur et mot de passe</p>
      </div>

      <form @submit.prevent="handleSaveProfile" class="space-y-4">
        
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <!-- Prénom -->
          <div class="space-y-1">
            <label class="block text-xs font-extrabold text-[#074C72]">Prénom *</label>
            <input 
              v-model="form.prenom"
              type="text"
              required
              class="w-full bg-[#FAF7F2] border border-gray-200 rounded-2xl px-4 py-3 text-xs text-gray-800 focus:outline-none focus:border-[#074C72]"
            />
          </div>

          <!-- Nom -->
          <div class="space-y-1">
            <label class="block text-xs font-extrabold text-[#074C72]">Nom *</label>
            <input 
              v-model="form.nom"
              type="text"
              required
              class="w-full bg-[#FAF7F2] border border-gray-200 rounded-2xl px-4 py-3 text-xs text-gray-800 focus:outline-none focus:border-[#074C72]"
            />
          </div>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <!-- Email -->
          <div class="space-y-1">
            <label class="block text-xs font-extrabold text-[#074C72]">Adresse Email *</label>
            <input 
              v-model="form.email"
              type="email"
              required
              class="w-full bg-[#FAF7F2] border border-gray-200 rounded-2xl px-4 py-3 text-xs text-gray-800 focus:outline-none focus:border-[#074C72]"
            />
          </div>

          <!-- Téléphone -->
          <div class="space-y-1">
            <label class="block text-xs font-extrabold text-[#074C72]">Numéro de Téléphone *</label>
            <input 
              v-model="form.telephone"
              type="tel"
              required
              class="w-full bg-[#FAF7F2] border border-gray-200 rounded-2xl px-4 py-3 text-xs text-gray-800 focus:outline-none focus:border-[#074C72]"
            />
          </div>
        </div>

        <!-- Adresse -->
        <div class="space-y-1">
          <label class="block text-xs font-extrabold text-[#074C72]">Adresse</label>
          <input 
            v-model="form.adresse"
            type="text"
            placeholder="Ex: Dakar, Sénégal"
            class="w-full bg-[#FAF7F2] border border-gray-200 rounded-2xl px-4 py-3 text-xs text-gray-800 focus:outline-none focus:border-[#074C72]"
          />
        </div>

        <div class="border-t border-gray-100 pt-4 space-y-4">
          <h4 class="font-extrabold text-sm text-[#053754]">Changer le mot de passe (optionnel)</h4>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div class="space-y-1">
              <label class="block text-xs font-extrabold text-[#074C72]">Nouveau mot de passe</label>
              <input 
                v-model="form.password"
                type="password"
                placeholder="••••••••"
                class="w-full bg-[#FAF7F2] border border-gray-200 rounded-2xl px-4 py-3 text-xs text-gray-800 focus:outline-none focus:border-[#074C72]"
              />
            </div>

            <div class="space-y-1">
              <label class="block text-xs font-extrabold text-[#074C72]">Confirmer le mot de passe</label>
              <input 
                v-model="form.password_confirmation"
                type="password"
                placeholder="••••••••"
                class="w-full bg-[#FAF7F2] border border-gray-200 rounded-2xl px-4 py-3 text-xs text-gray-800 focus:outline-none focus:border-[#074C72]"
              />
            </div>
          </div>
        </div>

        <!-- Submit Button -->
        <div class="pt-4 flex justify-end">
          <button 
            type="submit" 
            :disabled="loading"
            class="px-6 py-3.5 bg-[#053754] hover:bg-[#074C72] text-white font-extrabold text-xs rounded-2xl shadow-md transition-all cursor-pointer disabled:opacity-50 flex items-center gap-2"
          >
            <span v-if="!loading">Enregistrer les modifications</span>
            <span v-else>Mise à jour en cours...</span>
          </button>
        </div>

      </form>

    </div>

  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useAuth } from '@/composables/useAuth'

const { user: currentUser, updateProfile } = useAuth()

const form = reactive({
  prenom: '',
  nom: '',
  email: '',
  telephone: '',
  adresse: '',
  password: '',
  password_confirmation: ''
})

const loading = ref(false)
const successMsg = ref('')
const errorMsg = ref('')

onMounted(() => {
  if (currentUser.value) {
    form.prenom = currentUser.value.prenom || ''
    form.nom = currentUser.value.nom || ''
    form.email = currentUser.value.email || ''
    form.telephone = currentUser.value.telephone || ''
    form.adresse = currentUser.value.adresse || ''
  }
})

const handleSaveProfile = async () => {
  if (form.password && form.password !== form.password_confirmation) {
    errorMsg.value = 'Les mots de passe ne correspondent pas.'
    return
  }

  loading.value = true
  successMsg.value = ''
  errorMsg.value = ''

  try {
    const payload = {
      prenom: form.prenom,
      nom: form.nom,
      email: form.email,
      telephone: form.telephone,
      adresse: form.adresse,
      ...(form.password ? { password: form.password, password_confirmation: form.password_confirmation } : {})
    }

    await updateProfile(payload)
    successMsg.value = 'Votre profil administrateur a été mis à jour avec succès.'
    form.password = ''
    form.password_confirmation = ''
  } catch (err) {
    errorMsg.value = err?.message || 'Erreur lors de la mise à jour du profil.'
  } finally {
    loading.value = false
  }
}
</script>
