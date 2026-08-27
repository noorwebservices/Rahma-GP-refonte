<script setup>
import { ref } from 'vue'
import bannerContact from '@/assets/images/banner-contact.jpeg'

const form = ref({
  companyName: '',
  managerName: '',
  email: '',
  phone: '',
  comments: ''
})

const isSubmitted = ref(false)

const handleSubmit = () => {
  if (!form.value.companyName || !form.value.email || !form.value.phone) {
    alert('Veuillez remplir les champs obligatoires (*)')
    return
  }
  isSubmitted.value = true
  setTimeout(() => {
    isSubmitted.value = false
    form.value = { companyName: '', managerName: '', email: '', phone: '', comments: '' }
    alert('Votre demande de réservation VIP a été enregistrée avec succès ! Notre équipe vous recontactera rapidement.')
  }, 1000)
}
</script>

<template>
  <section id="devenir-partenaire" class="relative pt-6 sm:pt-10 pb-12 sm:pb-16 bg-white overflow-hidden">
    
    <!-- Section Header (Top Part) -->
    <div class="max-w-7xl 2xl:max-w-[1536px] mx-auto px-4 sm:px-6 lg:px-8 mb-6 sm:mb-8">
      <div class="text-center max-w-4xl mx-auto space-y-3">
        
        <!-- Subtitle Badge -->
        <div>
          <span class="inline-block px-6 py-2 rounded-full border border-secondaire/40 bg-secondaire/5 text-secondaire text-xs sm:text-sm font-bold uppercase tracking-widest">
            Partenariat
          </span>
        </div>

        <!-- Main Title -->
        <h2 class="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-principal tracking-tight leading-tight">
          Devenez l'une des 1ères Entreprises Partenaires VIP
        </h2>

        <!-- Sub-description -->
        <p class="text-texte text-xs sm:text-base font-normal leading-relaxed max-w-3xl mx-auto">
          Vous exercez professionnellement le transport et l'acheminement de colis ? Pré-inscrivez votre entreprise dès aujourd'hui pour bénéficier d'un accès prioritaire garanti au lancement, de 0% de commission sur vos 6 premiers mois et d'un accompagnement personnalisé sur-mesure.
        </p>

      </div>
    </div>

    <!-- Main Full-Width Hero Banner Container (Plein écran sans marges latérales) -->
    <div class="relative w-full overflow-hidden">
      
      <!-- Background Image & Overlay Noir à 68% d'opacité -->
      <div class="absolute inset-0 z-0">
        <img 
          :src="bannerContact" 
          alt="Business Partnership Background" 
          class="w-full h-full object-cover object-center"
        />
        <!-- Overlay Noir 68% d'opacité -->
        <div class="absolute inset-0 bg-black/68"></div>
      </div>

      <!-- Content Grid inside max-w-7xl 2xl:max-w-[1536px] (2 Columns) -->
      <div class="relative z-10 max-w-7xl 2xl:max-w-[1536px] mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 lg:py-20">
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
          
          <!-- LEFT COLUMN: Privilèges (6 cols) -->
          <div class="lg:col-span-6 space-y-8 text-white">
            
            <h3 class="text-2xl sm:text-3xl font-extrabold tracking-tight leading-snug">
              Privilèges réservés aux premiers inscrits
            </h3>

            <div class="space-y-6">
              
              <!-- Bullet 1: Visibilité Prioritaire -->
              <div class="flex items-start gap-4">
                <div class="w-12 h-12 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center shrink-0 text-amber-400 shadow-md">
                  <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
                <div class="space-y-1">
                  <h4 class="font-bold text-base sm:text-lg">
                    Visibilité Prioritaire en Tête des Recherches
                  </h4>
                  <p class="text-white/70 text-xs sm:text-sm font-normal leading-relaxed">
                    Vos trajets réguliers seront systématiquement mis en avant auprès des expéditeurs de votre secteur.
                  </p>
                </div>
              </div>

              <!-- Bullet 2: 0% Commission -->
              <div class="flex items-start gap-4">
                <div class="w-12 h-12 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center shrink-0 text-amber-400 shadow-md">
                  <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M9 14l6-6m-5.5.5a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0zm7 7a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                  </svg>
                </div>
                <div class="space-y-1">
                  <h4 class="font-bold text-base sm:text-lg">
                    0% de commission pendant 3 mois
                  </h4>
                  <p class="text-white/70 text-xs sm:text-sm font-normal leading-relaxed">
                    Conservez 100% de vos tarifs de transport sur tous les colis acheminés lors du premier trimestre.
                  </p>
                </div>
              </div>

              <!-- Bullet 3: Account Manager -->
              <div class="flex items-start gap-4">
                <div class="w-12 h-12 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center shrink-0 text-amber-400 shadow-md">
                  <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5 5 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <div class="space-y-1">
                  <h4 class="font-bold text-base sm:text-lg">
                    Account Manager dédié 7j/7
                  </h4>
                  <p class="text-white/70 text-xs sm:text-sm font-normal leading-relaxed">
                    Assistance personnalisée pour l'import de vos plannings de vols et la gestion des demandes de colis.
                  </p>
                </div>
              </div>

            </div>

            <!-- Guarantee Badge -->
            <div class="pt-4 flex items-center gap-2 text-emerald-400 text-xs sm:text-sm font-semibold">
              <svg class="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>Inscription sans engagement · Aucun frais d'entrée requis</span>
            </div>

          </div>

          <!-- RIGHT COLUMN: Formulaire de Réservation Prioritaire (6 cols) -->
          <div class="lg:col-span-6">
            <div class="bg-white/10 backdrop-blur-md rounded-3xl p-6 sm:p-8 border border-white/20 shadow-2xl text-white">
              
              <h3 class="text-2xl sm:text-3xl font-extrabold mb-2">
                Formulaire de Réservation Prioritaire
              </h3>
              <p class="text-white/80 text-xs sm:text-sm mb-6 pb-4 border-b border-white/10">
                Complétez ce formulaire pour réserver le statut Partenaire VIP de votre entreprise.
              </p>

              <form @submit.prevent="handleSubmit" class="space-y-4">
                
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <!-- Nom de l'Entreprise -->
                  <div class="space-y-1.5">
                    <label class="block text-xs font-bold text-white/90">
                      Nom de l'Entreprise <span class="text-secondaire-light">*</span>
                    </label>
                    <input 
                      v-model="form.companyName"
                      type="text" 
                      required
                      placeholder="Ex: Rahma Express Transit"
                      class="w-full bg-slate-900/60 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:border-secondaire focus:ring-1 focus:ring-secondaire text-xs sm:text-sm transition-colors"
                    />
                  </div>

                  <!-- Nom du Responsable -->
                  <div class="space-y-1.5">
                    <label class="block text-xs font-bold text-white/90">
                      Nom du Responsable <span class="text-secondaire-light">*</span>
                    </label>
                    <input 
                      v-model="form.managerName"
                      type="text" 
                      required
                      placeholder="Ex: Ousmane Ba"
                      class="w-full bg-slate-900/60 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:border-secondaire focus:ring-1 focus:ring-secondaire text-xs sm:text-sm transition-colors"
                    />
                  </div>
                </div>

                <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <!-- Email Professionnel -->
                  <div class="space-y-1.5">
                    <label class="block text-xs font-bold text-white/90">
                      Email Professionnel <span class="text-secondaire-light">*</span>
                    </label>
                    <input 
                      v-model="form.email"
                      type="email" 
                      required
                      placeholder="Ex: Direction@votre-entreprise.com"
                      class="w-full bg-slate-900/60 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:border-secondaire focus:ring-1 focus:ring-secondaire text-xs sm:text-sm transition-colors"
                    />
                  </div>

                  <!-- Téléphone -->
                  <div class="space-y-1.5">
                    <label class="block text-xs font-bold text-white/90">
                      Téléphone <span class="text-secondaire-light">*</span>
                    </label>
                    <input 
                      v-model="form.phone"
                      type="tel" 
                      required
                      placeholder="Ex: 77 000 00 00"
                      class="w-full bg-slate-900/60 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:border-secondaire focus:ring-1 focus:ring-secondaire text-xs sm:text-sm transition-colors"
                    />
                  </div>
                </div>

                <!-- Remarques particulières -->
                <div class="space-y-1.5">
                  <label class="block text-xs font-bold text-white/90">
                    Remarques particulières
                  </label>
                  <textarea 
                    v-model="form.comments"
                    rows="3"
                    placeholder="Laissez un commentaire"
                    class="w-full bg-slate-900/60 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:border-secondaire focus:ring-1 focus:ring-secondaire text-xs sm:text-sm transition-colors resize-none"
                  ></textarea>
                </div>

                <!-- Submit Button -->
                <div class="pt-2">
                  <button
                    type="submit"
                    :disabled="isSubmitted"
                    class="w-full bg-secondaire hover:bg-secondaire-light text-white font-bold text-xs sm:text-sm uppercase tracking-wider py-4 px-6 rounded-xl shadow-lg transition-all duration-200 transform hover:scale-[1.01] active:scale-95 cursor-pointer text-center"
                  >
                    <span v-if="!isSubmitted">RÉSERVER VOTRE PLACE MAINTENANT</span>
                    <span v-else>ENREGISTREMENT EN COURS...</span>
                  </button>
                </div>

              </form>

            </div>
          </div>

        </div>
      </div>

    </div>

  </section>
</template>
