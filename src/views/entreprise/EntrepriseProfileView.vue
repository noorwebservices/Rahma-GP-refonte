<template>
  <div class="space-y-6 max-w-4xl mx-auto">
    <!-- Header Banner -->
    <div class="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
      <div>
        <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#D8ECF8] dark:bg-sky-950/80 text-[#074C72] dark:text-sky-300 text-xs font-bold mb-2">
          <span>🏢 Identité & Conformité Légal</span>
        </div>
        <h2 class="text-2xl font-black text-[#053754] dark:text-slate-100 tracking-tight">Profil de l'Entreprise GP</h2>
        <p class="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Gérez vos informations juridiques, vos coordonnées et vos documents d'immatriculation.
        </p>
      </div>

      <!-- Verification Badge Pill -->
      <div
        class="px-4 py-2 rounded-2xl text-xs font-black flex items-center gap-2"
        :class="isVerifie ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' : 'bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-300'"
      >
        <span class="text-base">{{ isVerifie ? '✓' : '⏳' }}</span>
        <div>
          <p class="leading-none">{{ isVerifie ? 'Entreprise Vérifiée' : 'Vérification en Cours' }}</p>
          <p class="text-[10px] opacity-80 font-normal mt-0.5">{{ isVerifie ? 'Compte conforme' : 'Accès restreint tant que non validé' }}</p>
        </div>
      </div>
    </div>

    <!-- Alert Banner if Unverified -->
    <div v-if="!isVerifie" class="p-5 rounded-3xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 flex items-start gap-4">
      <div class="text-2xl shrink-0">⚠️</div>
      <div class="space-y-1 text-xs text-amber-900 dark:text-amber-200">
        <h4 class="font-bold text-sm">Vérification de votre compte entreprise requise</h4>
        <p>
          Votre entreprise GP a été enregistrée. Veuillez consulter votre boîte de réception e-mail pour cliquer sur le lien de confirmation de votre compte. 
          Tant que l'adresse n'est pas vérifiée, vous ne pourrez pas créer de nouveaux voyages ni affecter d'agents GP.
        </p>
        <button
          @click="resendVerification"
          :disabled="resending"
          class="mt-2 text-xs font-bold text-[#053754] dark:text-sky-300 underline hover:no-underline cursor-pointer disabled:opacity-50"
        >
          {{ resending ? 'Envoi en cours...' : 'Renvoyer l\'email de confirmation' }}
        </button>
      </div>
    </div>

    <!-- Profile Edit Form -->
    <div class="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800 shadow-xs">
      <form @submit.prevent="handleUpdateProfile" class="space-y-6">
        <!-- Success / Error Toast -->
        <div v-if="statusMessage" class="p-4 rounded-2xl text-xs font-bold" :class="statusSuccess ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'">
          {{ statusMessage }}
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <!-- Nom de l'entreprise -->
          <div class="space-y-1.5">
            <label class="text-xs font-bold text-slate-700 dark:text-slate-300">Nom commercial de l'entreprise *</label>
            <input
              v-model="form.nom"
              type="text"
              required
              class="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#053754]"
            />
          </div>

          <!-- Email professionnel -->
          <div class="space-y-1.5">
            <label class="text-xs font-bold text-slate-700 dark:text-slate-300">Adresse e-mail professionnelle *</label>
            <input
              v-model="form.email"
              type="email"
              required
              disabled
              class="w-full px-4 py-3 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-500 dark:text-slate-400 cursor-not-allowed"
            />
          </div>

          <!-- Numéro NINEA -->
          <div class="space-y-1.5">
            <label class="text-xs font-bold text-slate-700 dark:text-slate-300">Numéro NINEA *</label>
            <input
              v-model="form.ninea"
              type="text"
              required
              class="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#053754]"
            />
          </div>

          <!-- Registre du Commerce -->
          <div class="space-y-1.5">
            <label class="text-xs font-bold text-slate-700 dark:text-slate-300">Registre du Commerce (RC)</label>
            <input
              v-model="form.registre_commerce"
              type="text"
              class="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#053754]"
            />
          </div>

          <!-- Téléphone professionnel -->
          <div class="space-y-1.5">
            <label class="text-xs font-bold text-slate-700 dark:text-slate-300">Téléphone de l'entreprise *</label>
            <input
              v-model="form.telephone"
              type="tel"
              required
              class="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#053754]"
            />
          </div>

          <!-- Adresse Siège Social -->
          <div class="space-y-1.5">
            <label class="text-xs font-bold text-slate-700 dark:text-slate-300">Adresse du siège social</label>
            <input
              v-model="form.adresse"
              type="text"
              class="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#053754]"
            />
          </div>
        </div>

        <!-- Documents Legal & Verification -->
        <div class="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 space-y-4">
          <h4 class="text-xs font-extrabold text-[#053754] dark:text-sky-300 uppercase tracking-wider">
            📄 Documents Légaux & Justificatifs
          </h4>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <p class="font-bold text-slate-700 dark:text-slate-300">Document d'immatriculation NINEA/RC</p>
              <p class="text-[11px] text-slate-400 mt-0.5">PDF ou Image (Max 5Mo)</p>
              <input
                type="file"
                @change="handleFileChange($event, 'document_legal')"
                accept=".pdf,.jpg,.png"
                class="mt-2 text-xs text-slate-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-[#053754] file:text-white hover:file:bg-[#074C72]"
              />
            </div>

            <div>
              <p class="font-bold text-slate-700 dark:text-slate-300">Logo de l'entreprise</p>
              <p class="text-[11px] text-slate-400 mt-0.5">PNG, JPG (Max 2Mo)</p>
              <input
                type="file"
                @change="handleFileChange($event, 'logo')"
                accept="image/*"
                class="mt-2 text-xs text-slate-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-[#053754] file:text-white hover:file:bg-[#074C72]"
              />
            </div>
          </div>
        </div>

        <!-- Submit Button -->
        <div class="flex justify-end">
          <button
            type="submit"
            :disabled="saving"
            class="px-6 py-3 rounded-2xl bg-[#053754] text-white text-xs font-black shadow-md hover:bg-[#074C72] transition cursor-pointer disabled:opacity-50"
          >
            {{ saving ? 'Enregistrement...' : 'Enregistrer les Modifications' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import entrepriseService from '@/services/entrepriseService'

const saving = ref(false)
const resending = ref(false)
const statusMessage = ref('')
const statusSuccess = ref(true)

const form = ref({
  nom: '',
  email: '',
  ninea: '',
  registre_commerce: '',
  telephone: '',
  adresse: '',
  document_legal: null,
  logo: null
})

const isVerifie = ref(false)

const loadProfile = async () => {
  try {
    const res = await entrepriseService.getProfile()
    const ent = res?.data ?? res ?? {}
    form.value.nom = ent.nom || ''
    form.value.email = ent.email || ''
    form.value.ninea = ent.ninea || ''
    form.value.registre_commerce = ent.registre_commerce || ''
    form.value.telephone = ent.telephone || ''
    form.value.adresse = ent.adresse || ''
    isVerifie.value = ent.statut_verification === 'verifiee' && !!ent.email_verifie_at
  } catch (e) {
    console.error('Erreur chargement profil entreprise:', e)
  }
}

const handleFileChange = (e, field) => {
  const file = e.target.files[0]
  if (file) {
    form.value[field] = file
  }
}

const handleUpdateProfile = async () => {
  saving.value = true
  statusMessage.value = ''
  try {
    const formData = new FormData()
    formData.append('nom', form.value.nom)
    formData.append('ninea', form.value.ninea)
    formData.append('registre_commerce', form.value.registre_commerce || '')
    formData.append('telephone', form.value.telephone)
    formData.append('adresse', form.value.adresse || '')

    if (form.value.document_legal) {
      formData.append('document_legal', form.value.document_legal)
    }
    if (form.value.logo) {
      formData.append('logo', form.value.logo)
    }

    await entrepriseService.updateProfile(formData)
    statusSuccess.value = true
    statusMessage.value = 'Profil de l\'entreprise mis à jour avec succès.'
    await loadProfile()
  } catch (e) {
    statusSuccess.value = false
    statusMessage.value = e.response?.data?.message || 'Erreur lors de la mise à jour du profil.'
  } finally {
    saving.value = false
  }
}

const resendVerification = async () => {
  resending.value = true
  try {
    await entrepriseService.resendVerification()
    alert('Un nouvel e-mail de vérification a été envoyé à votre adresse.')
  } catch (e) {
    alert(e.response?.data?.message || 'Erreur lors de l\'envoi de l\'email.')
  } finally {
    resending.value = false
  }
}

onMounted(() => {
  loadProfile()
})
</script>
