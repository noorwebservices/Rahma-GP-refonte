<template>
  <Teleport to="body">
    <Transition name="fade">
      <div v-if="show" class="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" @click.self="close">
        <div class="relative w-full max-w-md bg-white border border-gray-200 rounded-3xl shadow-2xl overflow-hidden text-gray-800 animate-in fade-in zoom-in duration-200">
          
          <!-- Header -->
          <div class="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-[#053754] text-white">
            <div class="flex items-center gap-3">
              <div class="w-9 h-9 rounded-xl bg-red-500/20 text-red-300 flex items-center justify-center border border-red-500/30">
                <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div>
                <h3 class="font-extrabold text-base text-white">Signaler un compte</h3>
                <p class="text-[11px] text-gray-300 font-medium">Transmettre un signalement à l'équipe de modération</p>
              </div>
            </div>
            <button @click="close" class="text-gray-300 hover:text-white p-1 rounded-lg transition font-bold">
              ✕
            </button>
          </div>

          <!-- Content -->
          <form @submit.prevent="submitReport" class="p-6 space-y-4 bg-[#FAF7F2]">
            
            <!-- Target User Info Card -->
            <div v-if="targetUser" class="flex items-center gap-3 p-3.5 rounded-2xl bg-white border border-gray-200 shadow-2xs">
              <img :src="targetUser.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80'" class="w-10 h-10 rounded-full object-cover border-2 border-[#053754] shrink-0" />
              <div>
                <p class="font-black text-sm text-[#053754]">{{ targetUser.prenom }} {{ targetUser.nom }}</p>
                <p class="text-xs text-gray-500 font-medium">{{ targetUser.email || targetUser.telephone || 'Membre Rahma GP' }}</p>
              </div>
            </div>

            <!-- Motifs Selection -->
            <div>
              <label class="block text-xs font-extrabold uppercase tracking-wider text-[#074C72] mb-2">Motif du signalement *</label>
              <div class="space-y-2">
                <label 
                  v-for="m in motifs" 
                  :key="m" 
                  class="flex items-center gap-3 p-3 rounded-2xl border transition-all cursor-pointer"
                  :class="form.motif === m ? 'bg-red-50 border-red-300 text-[#B50302] font-bold shadow-2xs' : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'"
                >
                  <input type="radio" v-model="form.motif" :value="m" class="text-[#B50302] focus:ring-[#B50302] bg-white border-gray-300" />
                  <span class="text-xs font-semibold">{{ m }}</span>
                </label>
              </div>
            </div>

            <!-- Description -->
            <div>
              <label class="block text-xs font-extrabold uppercase tracking-wider text-[#074C72] mb-2">Détails ou précisions (optionnel)</label>
              <textarea 
                v-model="form.description"
                rows="3"
                placeholder="Expliquez brièvement les faits répréhensibles..."
                class="w-full bg-white border border-gray-200 rounded-2xl px-4 py-2.5 text-xs text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#074C72] transition-colors resize-none"
              ></textarea>
            </div>

            <!-- Feedback Alert -->
            <div v-if="error" class="p-3 rounded-xl bg-red-50 border border-red-200 text-[#B50302] text-xs font-semibold">
              {{ error }}
            </div>
            <div v-if="success" class="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold">
              {{ success }}
            </div>

            <!-- Actions -->
            <div class="flex items-center justify-end gap-3 pt-2">
              <button 
                type="button" 
                @click="close"
                class="px-4 py-2.5 text-xs font-bold text-gray-600 hover:text-gray-900 bg-white hover:bg-gray-100 border border-gray-200 rounded-xl transition"
              >
                Annuler
              </button>
              <button 
                type="submit" 
                :disabled="loading || !form.motif"
                class="px-5 py-2.5 text-xs font-extrabold text-white bg-[#B50302] hover:bg-[#870202] rounded-xl shadow-md transition-all disabled:opacity-50 flex items-center gap-2 cursor-pointer"
              >
                <svg v-if="loading" class="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24" fill="none">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                </svg>
                <span>Envoyer le signalement</span>
              </button>
            </div>

          </form>

        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { ref, reactive, watch } from 'vue'
import { signalementService } from '@/services/signalementService'

const props = defineProps({
  show: Boolean,
  targetUser: Object
})

const emit = defineEmits(['close', 'reported'])

const motifs = [
  'Comportement inapproprié',
  'Fraude / Arnaque',
  'Faux profil',
  'Non respect des engagements',
  'Autre'
]

const form = reactive({
  motif: 'Comportement inapproprié',
  description: ''
})

const loading = ref(false)
const error = ref('')
const success = ref('')

watch(() => props.show, (newVal) => {
  if (newVal) {
    error.value = ''
    success.value = ''
    form.motif = 'Comportement inapproprié'
    form.description = ''
  }
})

const close = () => {
  emit('close')
}

const submitReport = async () => {
  if (!props.targetUser || !props.targetUser.id) {
    error.value = 'Utilisateur invalide.'
    return
  }

  loading.value = true
  error.value = ''
  success.value = ''

  try {
    await signalementService.envoyerSignalement({
      signale_id: props.targetUser.id,
      motif: form.motif,
      description: form.description
    })

    success.value = 'Votre signalement a été transmis aux modérateurs. Merci pour votre contribution.'
    setTimeout(() => {
      emit('reported')
      close()
    }, 1800)
  } catch (err) {
    error.value = err?.message || err?.data?.message || 'Impossible de transmettre le signalement.'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
