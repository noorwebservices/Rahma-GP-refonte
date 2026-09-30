<template>
  <div class="space-y-6">
    
    <!-- Top Navigation Bar -->
    <div class="flex items-center justify-between">
      <button 
        @click="router.push('/admin/users')"
        class="inline-flex items-center gap-2 text-xs font-extrabold text-[#074C72] dark:text-sky-300 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 px-4 py-2 rounded-2xl hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors shadow-2xs cursor-pointer"
      >
        <span>←</span>
        <span>Retour à la liste des utilisateurs</span>
      </button>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="bg-white dark:bg-slate-900 rounded-3xl p-16 text-center border border-gray-200 dark:border-slate-800 shadow-2xs space-y-3">
      <div class="w-10 h-10 border-4 border-[#053754] dark:border-sky-400 border-t-transparent rounded-full animate-spin mx-auto"></div>
      <p class="text-xs font-bold text-[#074C72] dark:text-sky-300">Chargement de la fiche complète de l'utilisateur...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="bg-red-50 dark:bg-red-950/80 border border-red-200 dark:border-red-900 rounded-3xl p-8 text-center space-y-3">
      <p class="text-sm font-bold text-[#B50302] dark:text-red-400">{{ error }}</p>
      <button @click="router.push('/admin/users')" class="px-4 py-2 bg-[#053754] text-white font-bold text-xs rounded-xl">Retour à la liste</button>
    </div>

    <template v-else-if="user">
      
      <!-- Top Profile Overview Banner Card -->
      <div class="bg-[#053754] dark:bg-slate-900 border border-transparent dark:border-slate-800 text-white rounded-3xl p-6 sm:p-8 shadow-xl space-y-6 relative overflow-hidden">
        <div class="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          
          <div class="flex items-center gap-4">
            <div v-if="user.avatar" class="w-16 h-16 sm:w-20 sm:h-20 rounded-full overflow-hidden shrink-0 border-4 border-white/20 shadow-md">
              <img :src="formatImageUrl(user.avatar)" class="w-full h-full object-cover" />
            </div>
            <div v-else class="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-white/20 text-white font-black text-2xl flex items-center justify-center shrink-0 border-4 border-white/20 shadow-md">
              {{ getInitials(user.prenom, user.nom) }}
            </div>
            
            <div class="space-y-1">
              <div class="flex items-center gap-2">
                <h1 class="text-xl sm:text-2xl font-black text-white">{{ user.prenom }} {{ user.nom }}</h1>
                <span class="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider border" :class="user.statut === 'actif' ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400/30' : 'bg-red-500/20 text-red-300 border-red-400/30'">
                  {{ user.statut }}
                </span>
              </div>
              
              <p class="text-xs sm:text-sm text-gray-200 font-medium">{{ user.email }} • {{ user.telephone }}</p>
              
              <div class="flex flex-wrap gap-1.5 pt-1">
                <span v-for="r in user.roles" :key="r.name" class="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-white/20 text-white">
                  {{ r.name }}
                </span>
              </div>
            </div>
          </div>

          <!-- Quick Action Buttons -->
          <div class="flex items-center gap-3 shrink-0">
            <button 
              @click="toggleBlock"
              :disabled="!!actionLoading"
              class="px-5 py-3 rounded-2xl text-xs font-extrabold shadow-lg transition-all cursor-pointer flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              :class="user.statut === 'suspendu' ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950' : 'bg-[#B50302] hover:bg-[#870202] text-white'"
            >
              <span v-if="actionLoading === 'block'" class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
              <span>{{ user.statut === 'suspendu' ? '✓ Débloquer le compte' : '🔒 Bloquer le compte' }}</span>
            </button>
          </div>

        </div>
      </div>

      <!-- Account Info Grid -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        
        <div class="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-gray-200 dark:border-slate-800 shadow-2xs space-y-1">
          <span class="text-[10px] font-extrabold text-gray-400 uppercase tracking-wider">Dernière Connexion</span>
          <p class="text-sm font-black text-[#053754] dark:text-sky-300 font-mono">{{ user.dernier_connexion ? formatDate(user.dernier_connexion) : 'Jamais' }}</p>
        </div>

        <div class="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-gray-200 dark:border-slate-800 shadow-2xs space-y-1">
          <span class="text-[10px] font-extrabold text-gray-400 uppercase tracking-wider">Membre Depuis</span>
          <p class="text-sm font-black text-[#053754] dark:text-sky-300 font-mono">{{ formatDate(user.created_at) }}</p>
        </div>

        <div class="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-gray-200 dark:border-slate-800 shadow-2xs space-y-1">
          <span class="text-[10px] font-extrabold text-gray-400 uppercase tracking-wider">Adresse Personnelle Gérant</span>
          <p class="text-sm font-extrabold text-[#053754] dark:text-slate-100 truncate">{{ user.adresse || 'Non renseignée' }}</p>
        </div>

        <div class="bg-indigo-50 dark:bg-indigo-950/80 p-5 rounded-3xl border border-indigo-200 dark:border-indigo-900 shadow-2xs space-y-1">
          <span class="text-[10px] font-extrabold text-indigo-700 dark:text-indigo-300 uppercase tracking-wider">Capacité Données BD</span>
          <p class="text-sm font-black text-indigo-950 dark:text-white font-mono">{{ user.capacite_donnees?.formatted || '0 Ko' }} ({{ user.capacite_donnees?.octets || 0 }} octets)</p>
        </div>

      </div>

      <!-- Section Profil Entreprise GP & Documents Légaux -->
      <div v-if="entreprise" class="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-3xl p-6 shadow-2xs space-y-6">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 dark:border-slate-800 pb-4">
          <div class="flex items-center gap-4">
            <div v-if="entreprise.logo" class="w-14 h-14 rounded-2xl overflow-hidden border border-gray-200 dark:border-slate-700 bg-white p-1 shrink-0">
              <img :src="formatImageUrl(entreprise.logo)" class="w-full h-full object-contain" />
            </div>
            <div v-else class="w-14 h-14 rounded-2xl bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-black text-xl flex items-center justify-center shrink-0 border border-indigo-100 dark:border-indigo-900">
              🏢
            </div>
            <div>
              <h3 class="font-extrabold text-base text-[#053754] dark:text-sky-300 flex items-center gap-2">
                {{ entreprise.nom }}
                <span class="text-xs font-bold text-gray-400 dark:text-gray-400">
                  ({{ user.entreprise_geree ? 'Gérant Propriétaire' : 'Agent Rattaché' }})
                </span>
              </h3>
              <p class="text-xs text-gray-500 dark:text-gray-400 font-medium">
                Raison Sociale / Entité GP • {{ entreprise.ville || '-' }}, {{ entreprise.pays || '-' }}
              </p>
            </div>
          </div>

          <!-- Statut de Vérification & Action Badge -->
          <div class="flex items-center gap-2 self-start sm:self-auto">
            <span class="px-3.5 py-1.5 rounded-full text-xs font-extrabold border uppercase tracking-wider" :class="getEntrepriseStatutBadge(entreprise.statut_verification)">
              Validation : {{ entreprise.statut_verification === 'verifiee' ? 'Validée' : (entreprise.statut_verification === 'refusee' ? 'Refusée' : 'En Attente') }}
            </span>
          </div>
        </div>

        <!-- Grille d'Informations Clés de l'Entreprise (3 cartes par ligne) -->
        <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-xs">
          <!-- 1. NINEA -->
          <div class="p-3.5 bg-slate-50 dark:bg-slate-800/80 rounded-2xl border border-slate-100 dark:border-slate-700 space-y-1">
            <span class="text-[10px] font-extrabold text-gray-400 dark:text-gray-400 uppercase tracking-wider block">Numéro NINEA</span>
            <p class="font-mono font-bold text-[#053754] dark:text-slate-100 text-sm">{{ entreprise.ninea || 'Non renseigné' }}</p>
          </div>

          <!-- 2. RCCM -->
          <div class="p-3.5 bg-slate-50 dark:bg-slate-800/80 rounded-2xl border border-slate-100 dark:border-slate-700 space-y-1">
            <span class="text-[10px] font-extrabold text-gray-400 dark:text-gray-400 uppercase tracking-wider block">Registre de Commerce (RCCM)</span>
            <p class="font-mono font-bold text-[#053754] dark:text-slate-100 text-sm">{{ entreprise.registre_commerce || 'Non renseigné' }}</p>
          </div>

          <!-- 3. Email Professionnel -->
          <div class="p-3.5 bg-slate-50 dark:bg-slate-800/80 rounded-2xl border border-slate-100 dark:border-slate-700 space-y-1">
            <span class="text-[10px] font-extrabold text-gray-400 dark:text-gray-400 uppercase tracking-wider block">Email Professionnel</span>
            <p class="font-bold text-[#074C72] dark:text-sky-300 text-sm truncate">{{ entreprise.email || user.email }}</p>
          </div>

          <!-- 4. Téléphone Entreprise -->
          <div class="p-3.5 bg-slate-50 dark:bg-slate-800/80 rounded-2xl border border-slate-100 dark:border-slate-700 space-y-1">
            <span class="text-[10px] font-extrabold text-gray-400 dark:text-gray-400 uppercase tracking-wider block">Téléphone Entreprise</span>
            <p class="font-mono font-bold text-[#053754] dark:text-slate-100 text-sm">{{ entreprise.telephone || entreprise.telephone_fixe || user.telephone }}</p>
          </div>

          <!-- 5. Adresse Siège Social -->
          <div class="p-3.5 bg-slate-50 dark:bg-slate-800/80 rounded-2xl border border-slate-100 dark:border-slate-700 space-y-1">
            <span class="text-[10px] font-extrabold text-gray-400 dark:text-gray-400 uppercase tracking-wider block">Adresse Siège Social (Adresse, Ville, Pays)</span>
            <p class="font-bold text-[#053754] dark:text-slate-100 truncate">
              {{ entreprise.adresse || entreprise.adresse_siege || 'Non renseignée' }}<span v-if="entreprise.ville">, {{ entreprise.ville }}</span><span v-if="entreprise.pays"> ({{ entreprise.pays }})</span>
            </p>
          </div>

          <!-- 6. Vérification Email Entreprise -->
          <div class="p-3.5 bg-slate-50 dark:bg-slate-800/80 rounded-2xl border border-slate-100 dark:border-slate-700 space-y-1">
            <span class="text-[10px] font-extrabold text-gray-400 dark:text-gray-400 uppercase tracking-wider block">Vérification Email Entreprise</span>
            <p class="font-bold text-sm" :class="entreprise.email_verifie_at ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'">
              {{ entreprise.email_verifie_at ? `Vérifié le ${formatDate(entreprise.email_verifie_at)}` : 'Non vérifié (En attente)' }}
            </p>
          </div>
        </div>

        <!-- Documents Légaux Entreprise Display (NINEA & Registre du Commerce) -->
        <div class="space-y-3 pt-2 border-t border-gray-100 dark:border-slate-800">
          <span class="text-xs font-extrabold text-[#053754] dark:text-sky-300 uppercase tracking-wider block">
            📄 Documents Juridiques & Légaux Fournis
          </span>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <!-- NINEA Doc -->
            <div class="p-4 bg-[#FAF7F2] dark:bg-slate-800/80 border border-gray-200 dark:border-slate-700 rounded-2xl space-y-2">
              <div class="flex items-center justify-between">
                <span class="text-[10px] font-extrabold text-gray-500 dark:text-gray-400 uppercase tracking-wider block">Document NINEA</span>
                <span v-if="entreprise.ninea_doc" class="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">Fourni</span>
              </div>

              <div v-if="entreprise.ninea_doc" class="relative h-48 rounded-xl overflow-hidden border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 group cursor-pointer" @click="openImagePreview(entreprise.ninea_doc, 'Document NINEA')">
                <img :src="formatImageUrl(entreprise.ninea_doc)" class="w-full h-full object-contain p-2 transition-transform duration-300 group-hover:scale-105" />
                <div class="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-bold gap-2">
                  🔍 Clic pour voir le document
                </div>
              </div>
              <div v-else class="h-40 rounded-xl border border-dashed border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-900 flex flex-col items-center justify-center text-gray-400 text-xs font-semibold p-4 text-center">
                <span>Aucun document NINEA joint</span>
              </div>
            </div>

            <!-- Registre du commerce Doc -->
            <div class="p-4 bg-[#FAF7F2] dark:bg-slate-800/80 border border-gray-200 dark:border-slate-700 rounded-2xl space-y-2">
              <div class="flex items-center justify-between">
                <span class="text-[10px] font-extrabold text-gray-500 dark:text-gray-400 uppercase tracking-wider block">Registre du Commerce (RCCM)</span>
                <span v-if="entreprise.registre_commerce_doc" class="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">Fourni</span>
              </div>

              <div v-if="entreprise.registre_commerce_doc" class="relative h-48 rounded-xl overflow-hidden border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 group cursor-pointer" @click="openImagePreview(entreprise.registre_commerce_doc, 'Document Registre de Commerce')">
                <img :src="formatImageUrl(entreprise.registre_commerce_doc)" class="w-full h-full object-contain p-2 transition-transform duration-300 group-hover:scale-105" />
                <div class="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-bold gap-2">
                  🔍 Clic pour voir le document
                </div>
              </div>
              <div v-else class="h-40 rounded-xl border border-dashed border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-900 flex flex-col items-center justify-center text-gray-400 text-xs font-semibold p-4 text-center">
                <span>Aucun registre du commerce joint</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Documents d'Identité du Gérant (CNI / Passeport) -->
        <div class="space-y-3 pt-4 border-t border-gray-100 dark:border-slate-800">
          <span class="text-xs font-extrabold text-[#053754] dark:text-sky-300 uppercase tracking-wider block">
            🪪 Pièce d'Identité du Gérant (CNI / Passeport)
          </span>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs mb-3">
            <div class="p-3.5 bg-slate-50 dark:bg-slate-800/80 rounded-2xl border border-slate-100 dark:border-slate-700 space-y-1">
              <span class="text-[10px] font-extrabold text-gray-400 dark:text-gray-400 uppercase tracking-wider block">Type de Pièce Gérant</span>
              <p class="font-bold text-[#053754] dark:text-slate-100 text-sm uppercase">{{ entreprise.type_piece || 'CNI / Passeport' }}</p>
            </div>
            <div class="p-3.5 bg-slate-50 dark:bg-slate-800/80 rounded-2xl border border-slate-100 dark:border-slate-700 space-y-1">
              <span class="text-[10px] font-extrabold text-gray-400 dark:text-gray-400 uppercase tracking-wider block">Numéro de Pièce Gérant</span>
              <p class="font-mono font-bold text-[#053754] dark:text-slate-100 text-sm">{{ entreprise.numero_piece || 'Non renseigné' }}</p>
            </div>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <!-- CNI Recto Gérant -->
            <div class="p-4 bg-[#FAF7F2] dark:bg-slate-800/80 border border-gray-200 dark:border-slate-700 rounded-2xl space-y-2">
              <div class="flex items-center justify-between">
                <span class="text-[10px] font-extrabold text-gray-500 dark:text-gray-400 uppercase tracking-wider block">Pièce Gérant - Face Recto</span>
                <span v-if="entreprise.cni_recto" class="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">Fourni</span>
              </div>

              <div v-if="entreprise.cni_recto" class="relative h-48 rounded-xl overflow-hidden border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 group cursor-pointer" @click="openImagePreview(entreprise.cni_recto, 'Pièce Gérant - Recto')">
                <img :src="formatImageUrl(entreprise.cni_recto)" class="w-full h-full object-contain p-2 transition-transform duration-300 group-hover:scale-105" />
                <div class="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-bold gap-2">
                  🔍 Clic pour voir la pièce
                </div>
              </div>
              <div v-else class="h-40 rounded-xl border border-dashed border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-900 flex flex-col items-center justify-center text-gray-400 text-xs font-semibold p-4 text-center">
                <span>Aucune pièce recto téléchargée</span>
              </div>
            </div>

            <!-- CNI Verso Gérant -->
            <div class="p-4 bg-[#FAF7F2] dark:bg-slate-800/80 border border-gray-200 dark:border-slate-700 rounded-2xl space-y-2">
              <div class="flex items-center justify-between">
                <span class="text-[10px] font-extrabold text-gray-500 dark:text-gray-400 uppercase tracking-wider block">Pièce Gérant - Face Verso</span>
                <span v-if="entreprise.cni_verso" class="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">Fourni</span>
              </div>

              <div v-if="entreprise.cni_verso" class="relative h-48 rounded-xl overflow-hidden border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 group cursor-pointer" @click="openImagePreview(entreprise.cni_verso, 'Pièce Gérant - Verso')">
                <img :src="formatImageUrl(entreprise.cni_verso)" class="w-full h-full object-contain p-2 transition-transform duration-300 group-hover:scale-105" />
                <div class="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-bold gap-2">
                  🔍 Clic pour voir la pièce
                </div>
              </div>
              <div v-else class="h-40 rounded-xl border border-dashed border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-900 flex flex-col items-center justify-center text-gray-400 text-xs font-semibold p-4 text-center">
                <span>Aucune pièce verso téléchargée</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Actions de validation Administrateur pour l'Entreprise -->
        <div class="flex flex-col sm:flex-row sm:items-center gap-3 pt-3 border-t border-gray-100 dark:border-slate-800">
          <template v-if="entreprise.statut_verification === 'verifiee'">
            <div class="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400 font-extrabold text-xs w-full sm:w-auto text-center">
              <span>✓ Entreprise GP officiellement validée par l'administration</span>
            </div>
            <button 
              @click="updateEntrepriseStatut('refusee')"
              :disabled="!!actionLoading"
              class="px-5 py-2.5 bg-red-100 text-[#B50302] hover:bg-red-200 border border-red-200 rounded-xl text-xs font-extrabold transition-all cursor-pointer w-full sm:w-auto sm:ml-auto text-center flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span v-if="actionLoading === 'entreprise_refusee'" class="w-4 h-4 border-2 border-[#B50302] border-t-transparent rounded-full animate-spin"></span>
              <span>✕ Révoquer / Refuser l'entreprise</span>
            </button>
          </template>

          <template v-else>
            <button 
              @click="updateEntrepriseStatut('verifiee')" 
              :disabled="!!actionLoading" 
              class="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-extrabold shadow-md transition-all cursor-pointer w-full sm:w-auto text-center flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span v-if="actionLoading === 'entreprise_verifiee'" class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
              <span>✓ Valider l'Entreprise GP</span>
            </button>

            <button 
              @click="updateEntrepriseStatut('refusee')" 
              :disabled="!!actionLoading" 
              class="px-5 py-2.5 bg-red-100 text-[#B50302] hover:bg-red-200 border border-red-200 rounded-xl text-xs font-extrabold transition-all cursor-pointer w-full sm:w-auto text-center flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span v-if="actionLoading === 'entreprise_refusee'" class="w-4 h-4 border-2 border-[#B50302] border-t-transparent rounded-full animate-spin"></span>
              <span>✕ Refuser l'Entreprise GP</span>
            </button>
          </template>
        </div>
      </div>

      <!-- Section Agents Rattachés à l'Entreprise -->
      <div v-if="entreprise && entreprise.agents && entreprise.agents.length > 0" class="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-3xl p-6 shadow-2xs space-y-4">
        <div class="flex items-center justify-between border-b border-gray-100 dark:border-slate-800 pb-3">
          <h3 class="font-extrabold text-base text-[#053754] dark:text-sky-300">
            👥 Agents de l'Entreprise ({{ entreprise.agents.length }})
          </h3>
          <span class="text-xs text-slate-400 font-medium hidden sm:inline">Cliquez sur un agent pour afficher sa fiche complète</span>
        </div>

        <!-- Table Format on Desktop & Cards on Mobile -->
        <div class="overflow-x-auto rounded-2xl border border-gray-200 dark:border-slate-800">
          <table class="w-full min-w-[700px] text-left text-xs bg-white dark:bg-slate-900">
            <thead class="bg-slate-50 dark:bg-slate-800/80 text-[#053754] dark:text-sky-300 uppercase tracking-wider font-extrabold border-b border-gray-200 dark:border-slate-800 text-[11px] whitespace-nowrap">
              <tr>
                <th class="px-5 py-3">Agent GP</th>
                <th class="px-5 py-3">Matricule & Poste</th>
                <th class="px-5 py-3">Contact</th>
                <th class="px-5 py-3">Statut</th>
                <th class="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100 dark:divide-slate-800 font-medium">
              <tr 
                v-for="agent in entreprise.agents" 
                :key="agent.id"
                @click="agent.user_id && router.push(`/admin/users/${encodeId(agent.user_id || agent.user?.id)}`)"
                class="hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors cursor-pointer group"
              >
                <!-- Agent Avatar & Name -->
                <td class="px-5 py-3.5 whitespace-nowrap">
                  <div class="flex items-center gap-3">
                    <div v-if="agent.user?.avatar" class="w-9 h-9 rounded-full overflow-hidden shrink-0 border border-gray-200 dark:border-slate-700">
                      <img :src="formatImageUrl(agent.user.avatar)" class="w-full h-full object-cover" />
                    </div>
                    <div v-else class="w-9 h-9 rounded-full bg-[#053754] text-white font-black text-xs flex items-center justify-center shrink-0 border border-gray-200 dark:border-slate-700">
                      {{ getInitials(agent.user?.prenom, agent.user?.nom) }}
                    </div>
                    <div>
                      <p class="font-extrabold text-[#053754] dark:text-slate-100 group-hover:text-[#074C72] dark:group-hover:text-sky-300 transition-colors">
                        {{ agent.user?.prenom }} {{ agent.user?.nom }}
                      </p>
                      <span class="text-[10px] text-gray-400 font-mono">ID: {{ (agent.id || '').substring(0, 8) }}</span>
                    </div>
                  </div>
                </td>

                <!-- Matricule & Poste -->
                <td class="px-5 py-3.5 whitespace-nowrap">
                  <p class="font-bold text-slate-800 dark:text-slate-200">{{ agent.poste || 'Agent GP' }}</p>
                  <p v-if="agent.matricule" class="text-[10px] font-mono text-indigo-600 dark:text-indigo-400 font-bold">Mat: {{ agent.matricule }}</p>
                </td>

                <!-- Contact -->
                <td class="px-5 py-3.5 whitespace-nowrap">
                  <p class="text-[#074C72] dark:text-sky-300 font-bold">{{ agent.user?.email || agent.email || 'Email non renseigné' }}</p>
                  <p class="text-gray-500 dark:text-gray-400 font-mono text-[11px]">{{ agent.user?.telephone || agent.telephone }}</p>
                </td>

                <!-- Statut -->
                <td class="px-5 py-3.5 whitespace-nowrap">
                  <span class="px-2.5 py-1 rounded-full text-[10px] font-extrabold capitalize border" :class="agent.statut === 'actif' ? 'bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800' : 'bg-red-50 dark:bg-red-950/80 text-[#B50302] dark:text-red-400 border-red-200 dark:border-red-800'">
                    {{ agent.statut || 'actif' }}
                  </span>
                </td>

                <!-- Actions -->
                <td class="px-5 py-3.5 text-right whitespace-nowrap">
                  <button
                    @click.stop="agent.user_id && router.push(`/admin/users/${encodeId(agent.user_id || agent.user?.id)}`)"
                    class="px-3 py-1.5 rounded-xl text-xs font-extrabold bg-[#053754] hover:bg-[#074C72] text-white transition-all shadow-xs inline-flex items-center gap-1.5 cursor-pointer"
                  >
                    <span>👁️</span>
                    <span>Voir Fiche</span>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Section Agent GP Info & Voyages (If user is an Agent GP) -->
      <div v-if="user.agent_gp || user.agentGp" class="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-3xl p-6 shadow-2xs space-y-6">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 dark:border-slate-800 pb-4">
          <div>
            <h3 class="font-extrabold text-base text-[#053754] dark:text-sky-300 flex items-center gap-2">
              <span>👤 Profil Agent GP</span>
              <span v-if="(user.agent_gp || user.agentGp)?.matricule" class="text-xs font-mono font-bold text-indigo-600 dark:text-indigo-400">
                (Matricule: {{ (user.agent_gp || user.agentGp).matricule }})
              </span>
            </h3>
            <p class="text-xs text-gray-500 dark:text-gray-400 font-medium">
              Rattaché à l'entreprise GP : <strong class="text-[#053754] dark:text-sky-300">{{ (user.agent_gp || user.agentGp)?.entreprise?.nom || 'Entreprise GP' }}</strong>
            </p>
          </div>
          <span class="px-3 py-1 rounded-full text-xs font-extrabold border bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800">
            Statut: {{ (user.agent_gp || user.agentGp)?.statut || 'actif' }}
          </span>
        </div>

        <!-- Voyages de l'Agent GP -->
        <div class="space-y-3">
          <h4 class="font-extrabold text-xs text-[#074C72] dark:text-sky-300 uppercase tracking-wider">
            ✈️ Voyages affectés à cet Agent GP ({{ (user.agent_gp || user.agentGp)?.voyages?.length || 0 }})
          </h4>

          <div v-if="!(user.agent_gp || user.agentGp)?.voyages || (user.agent_gp || user.agentGp).voyages.length === 0" class="text-xs text-gray-400 italic">
            Aucun voyage affecté à cet agent pour le moment.
          </div>

          <div v-else class="overflow-x-auto rounded-2xl border border-gray-200 dark:border-slate-800">
            <table class="w-full min-w-[600px] text-left text-xs bg-white dark:bg-slate-900">
              <thead class="bg-slate-50 dark:bg-slate-800/80 text-[#053754] dark:text-sky-300 uppercase tracking-wider font-extrabold border-b border-gray-200 dark:border-slate-800 text-[11px] whitespace-nowrap">
                <tr>
                  <th class="px-4 py-3">Trajet</th>
                  <th class="px-4 py-3">Date Départ</th>
                  <th class="px-4 py-3">Capacité</th>
                  <th class="px-4 py-3">Prix / kg</th>
                  <th class="px-4 py-3">Statut</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-100 dark:divide-slate-800 font-medium whitespace-nowrap">
                <tr
                  v-for="v in (user.agent_gp || user.agentGp).voyages"
                  :key="v.id"
                  class="hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors"
                >
                  <td class="px-4 py-3.5">
                    <div class="flex items-center gap-1.5 font-extrabold text-[#053754] dark:text-sky-300 text-xs sm:text-sm">
                      <span>{{ v.ville_depart }}</span>
                      <span class="text-gray-400 text-xs">➔</span>
                      <span>{{ v.ville_destination || v.ville_arrivee }}</span>
                    </div>
                  </td>
                  <td class="px-4 py-3.5 font-bold text-gray-800 dark:text-slate-200">
                    {{ formatDate(v.date_depart) }}
                  </td>
                  <td class="px-4 py-3.5 font-bold text-emerald-600 dark:text-emerald-400">
                    {{ v.capacite_totale }} kg
                  </td>
                  <td class="px-4 py-3.5 font-extrabold text-[#B50302] dark:text-rose-400">
                    {{ v.prix_kg ? `${v.prix_kg} F CFA` : '—' }}
                  </td>
                  <td class="px-4 py-3.5">
                    <span
                      class="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider border"
                      :class="v.statut === 'publie' ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300' : 'bg-gray-100 text-gray-700 border-gray-200 dark:bg-slate-800 dark:text-slate-300'"
                    >
                      {{ v.statut || 'brouillon' }}
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- Section Profil Voyageur / KYC Verification (If Voyageur) -->
      <div v-if="user.voyageur" class="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-3xl p-6 shadow-2xs space-y-5">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-100 dark:border-slate-800 pb-3">
          <h3 class="font-extrabold text-base text-[#053754] dark:text-sky-300 flex items-center gap-2">
            <span>Profil & Vérification Voyageur</span>
          </h3>

          <span class="px-3 py-1 rounded-full text-xs font-extrabold border capitalize self-start sm:self-auto" :class="getVoyageurStatutBadge(user.voyageur.statut)">
            Statut : {{ user.voyageur.statut === 'verifie' ? 'Vérifié' : (user.voyageur.statut === 'refuse' ? 'Refusé' : 'En Attente') }}
          </span>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-medium text-gray-700 dark:text-gray-300">
          <div>
            <span class="text-gray-400 font-bold block uppercase text-[10px]">Type Pièce Identité:</span>
            <span class="font-bold text-[#053754] dark:text-slate-100 text-sm uppercase">{{ user.voyageur.type_piece || 'Passeport / CNI' }}</span>
          </div>
          <div>
            <span class="text-gray-400 font-bold block uppercase text-[10px]">Numéro de Pièce:</span>
            <span class="font-bold font-mono text-[#053754] dark:text-slate-100 text-sm">{{ user.voyageur.numero_piece || 'Non renseigné' }}</span>
          </div>
          <div>
            <span class="text-gray-400 font-bold block uppercase text-[10px]">Note Moyenne Avis:</span>
            <span class="font-black text-amber-500 text-sm flex items-center gap-1">
              ★ {{ noteMoyenneVoyageur }}
              <span class="text-gray-400 font-normal text-xs">({{ evaluationsList.length }} avis)</span>
            </span>
          </div>
        </div>

        <!-- CNI Identity Photos Display -->
        <div class="space-y-2 pt-2 border-t border-gray-100 dark:border-slate-800">
          <span class="text-xs font-extrabold text-[#053754] dark:text-sky-300 uppercase tracking-wider block">
            Document d'Identité Fourni (CNI / Passeport)
          </span>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <!-- Recto -->
            <div class="p-4 bg-[#FAF7F2] dark:bg-slate-800/80 border border-gray-200 dark:border-slate-700 rounded-2xl space-y-2">
              <div class="flex items-center justify-between">
                <span class="text-[10px] font-extrabold text-gray-500 dark:text-gray-400 uppercase tracking-wider block">Face Recto</span>
                <span v-if="rectoUrl" class="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">Fourni</span>
              </div>
              
              <div v-if="rectoUrl" class="relative h-48 rounded-xl overflow-hidden border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 group cursor-pointer" @click="openImagePreview(rectoUrl, 'CNI Recto')">
                <img :src="formatImageUrl(rectoUrl)" class="w-full h-full object-contain p-2 transition-transform duration-300 group-hover:scale-105" />
                <div class="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-bold">
                  🔍 Clic pour agrandir
                </div>
              </div>
              <div v-else class="h-40 rounded-xl border border-dashed border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-900 flex flex-col items-center justify-center text-gray-400 text-xs font-semibold p-4 text-center">
                <span>Aucune photo recto téléchargée</span>
              </div>
            </div>

            <!-- Verso -->
            <div class="p-4 bg-[#FAF7F2] dark:bg-slate-800/80 border border-gray-200 dark:border-slate-700 rounded-2xl space-y-2">
              <div class="flex items-center justify-between">
                <span class="text-[10px] font-extrabold text-gray-500 dark:text-gray-400 uppercase tracking-wider block">Face Verso</span>
                <span v-if="versoUrl" class="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">Fourni</span>
              </div>

              <div v-if="versoUrl" class="relative h-48 rounded-xl overflow-hidden border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 group cursor-pointer" @click="openImagePreview(versoUrl, 'CNI Verso')">
                <img :src="formatImageUrl(versoUrl)" class="w-full h-full object-contain p-2 transition-transform duration-300 group-hover:scale-105" />
                <div class="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-bold">
                  🔍 Clic pour agrandir
                </div>
              </div>
              <div v-else class="h-40 rounded-xl border border-dashed border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-900 flex flex-col items-center justify-center text-gray-400 text-xs font-semibold p-4 text-center">
                <span>Aucune photo verso téléchargée</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Verification Action Buttons -->
        <div class="flex flex-col sm:flex-row sm:items-center gap-3 pt-3 border-t border-gray-100">
          <template v-if="user.voyageur.statut === 'verifie'">
            <div class="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 font-extrabold text-xs w-full sm:w-auto text-center">
              <span>✓ Compte Voyageur actuellement vérifié et actif</span>
            </div>
            <button 
              @click="toggleBlock"
              :disabled="!!actionLoading"
              class="px-5 py-2.5 bg-[#B50302] hover:bg-[#870202] text-white rounded-xl text-xs font-extrabold shadow-md transition-all cursor-pointer w-full sm:w-auto sm:ml-auto text-center flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span v-if="actionLoading === 'block'" class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
              <span>🔒 Bloquer l'utilisateur</span>
            </button>
          </template>

          <template v-else>
            <button 
              @click="verifyVoyageur('verifie')" 
              :disabled="!!actionLoading" 
              class="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-extrabold shadow-md transition-all cursor-pointer w-full sm:w-auto text-center flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span v-if="actionLoading === 'verifie'" class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
              <span>✓ Valider le compte Voyageur</span>
            </button>

            <button 
              @click="verifyVoyageur('refuse')" 
              :disabled="!!actionLoading" 
              class="px-5 py-2.5 bg-red-100 text-[#B50302] hover:bg-red-200 border border-red-200 rounded-xl text-xs font-extrabold transition-all cursor-pointer w-full sm:w-auto text-center flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span v-if="actionLoading === 'refuse'" class="w-4 h-4 border-2 border-[#B50302] border-t-transparent rounded-full animate-spin"></span>
              <span>✕ Refuser le compte Voyageur</span>
            </button>

            <button 
              @click="toggleBlock"
              :disabled="!!actionLoading"
              class="px-5 py-2.5 bg-[#B50302] hover:bg-[#870202] text-white rounded-xl text-xs font-extrabold shadow-md transition-all cursor-pointer w-full sm:w-auto sm:ml-auto text-center flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span v-if="actionLoading === 'block'" class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
              <span>🔒 Bloquer l'utilisateur</span>
            </button>
          </template>
        </div>
      </div>


      <!-- Section Avis & Évaluations Reçus (Uniquement pour les voyageurs) -->
      <div v-if="user.voyageur" class="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-3xl p-6 shadow-2xs space-y-4">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-100 dark:border-slate-800 pb-3">
          <h3 class="font-extrabold text-base text-[#053754] dark:text-sky-300 flex items-center gap-2 flex-wrap">
            <span>⭐ Avis & Évaluations Reçus par {{ user.prenom }}</span>
            <span class="text-gray-400 dark:text-gray-400 text-xs font-semibold">({{ evaluationsList.length }})</span>
          </h3>
          <span class="text-xs font-black text-amber-500 bg-amber-50 dark:bg-amber-950/80 border border-amber-200 dark:border-amber-800 px-3 py-1 rounded-full self-start sm:self-auto">
            Note Moyenne : ★ {{ noteMoyenneVoyageur }} / 5
          </span>
        </div>

        <div v-if="evaluationsList.length === 0" class="text-xs text-gray-400 italic py-2">
          Aucun avis ou évaluation reçu pour le moment.
        </div>

        <template v-else>
          <div class="space-y-3">
            <div v-for="evalItem in paginatedEvaluations" :key="evalItem.id" class="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs space-y-2">
              <div class="flex items-center justify-between border-b border-gray-200/60 dark:border-slate-700 pb-2">
                <div class="flex items-center gap-2">
                  <div class="w-7 h-7 rounded-full bg-[#053754] text-white text-[10px] font-black flex items-center justify-center">
                    {{ getInitials(evalItem.evaluateur?.prenom, evalItem.evaluateur?.nom) }}
                  </div>
                  <div>
                    <span class="font-extrabold text-[#053754] dark:text-sky-300 text-xs sm:text-sm">
                      {{ evalItem.evaluateur?.prenom }} {{ evalItem.evaluateur?.nom }}
                    </span>
                    <span class="text-gray-400 text-[10px] ml-2">({{ evalItem.evaluateur?.email || evalItem.evaluateur?.telephone }})</span>
                  </div>
                </div>

                <div class="flex items-center gap-1 bg-amber-100/80 dark:bg-amber-950 text-amber-800 dark:text-amber-300 font-extrabold px-2.5 py-0.5 rounded-full text-xs border border-amber-300 dark:border-amber-700">
                  <span>★</span>
                  <span>{{ evalItem.note }} / 5</span>
                </div>
              </div>

              <p class="text-gray-700 dark:text-slate-200 font-medium text-xs sm:text-sm italic pl-1">
                "{{ evalItem.commentaire || 'Aucun commentaire rédigé.' }}"
              </p>

              <div class="flex items-center justify-between text-[11px] text-gray-400 font-medium pt-1 border-t border-gray-100 dark:border-slate-700">
                <span v-if="evalItem.reservation?.voyage">
                  Trajet concerné : <strong class="text-[#074C72] dark:text-sky-300">{{ evalItem.reservation.voyage.ville_depart }} ➔ {{ evalItem.reservation.voyage.ville_destination }}</strong>
                </span>
                <span v-else>Évaluation directe</span>
                <span class="font-mono text-gray-500 dark:text-gray-400">{{ formatDate(evalItem.created_at) }}</span>
              </div>
            </div>
          </div>

          <!-- Pagination Avis (5 items per page) -->
          <div v-if="totalEvaluationsPages > 1" class="pt-3 flex items-center justify-between text-xs font-bold text-gray-600 dark:text-gray-300 border-t border-gray-100 dark:border-slate-800">
            <span>Page {{ evaluationsPage }} sur {{ totalEvaluationsPages }}</span>
            <div class="flex items-center gap-1.5">
              <button @click="evaluationsPage > 1 && evaluationsPage--" :disabled="evaluationsPage === 1" class="px-3 py-1 rounded-lg border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-700 dark:text-slate-200 disabled:opacity-40">← Préc.</button>
              <button @click="evaluationsPage < totalEvaluationsPages && evaluationsPage++" :disabled="evaluationsPage === totalEvaluationsPages" class="px-3 py-1 rounded-lg border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-700 dark:text-slate-200 disabled:opacity-40">Suiv. →</button>
            </div>
          </div>
        </template>
      </div>

      <!-- Section Voyages Créés (If Voyageur) -->
      <div v-if="user.voyageur && user.voyageur.voyages" class="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-3xl p-6 shadow-2xs space-y-4">
        <div class="flex items-center justify-between border-b border-gray-100 dark:border-slate-800 pb-3">
          <h3 class="font-extrabold text-base text-[#053754] dark:text-sky-300">
            ✈️ Voyages Publiés par {{ user.prenom }} ({{ user.voyageur.voyages.length }})
          </h3>
        </div>

        <div v-if="user.voyageur.voyages.length === 0" class="text-xs text-gray-400 italic">
          Aucun voyage publié.
        </div>

        <template v-else>
          <div class="space-y-3">
            <div v-for="voyage in paginatedVoyages" :key="voyage.id" class="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs space-y-3">
              <div class="flex items-center justify-between border-b border-gray-200 dark:border-slate-700 pb-2">
                <span class="font-black text-[#053754] dark:text-sky-300 text-sm sm:text-base">{{ voyage.ville_depart }} ➔ {{ voyage.ville_destination || voyage.ville_arrivee }}</span>
                <span class="px-2.5 py-0.5 rounded-full font-bold bg-white dark:bg-slate-900 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 text-[10px] sm:text-xs">{{ voyage.statut }}</span>
              </div>
              <!-- Each element on its own line on mobile -->
              <div class="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-6 text-gray-600 dark:text-gray-300 font-medium">
                <div><span>Date départ :</span> <strong class="text-[#053754] dark:text-slate-100">{{ formatDate(voyage.date_depart) }}</strong></div>
                <div><span>Kilos dispos :</span> <strong class="text-[#B50302] dark:text-red-400 font-black">{{ voyage.capacite_dispo ?? voyage.capacite_totale }} kg</strong></div>
                <div><span>Réservations :</span> <strong class="text-[#074C72] dark:text-sky-300">{{ voyage.reservations ? voyage.reservations.length : 0 }}</strong></div>
              </div>
            </div>
          </div>

          <!-- Pagination Voyages (5 items per page) -->
          <div v-if="totalVoyagesPages > 1" class="pt-3 flex items-center justify-between text-xs font-bold text-gray-600 dark:text-gray-300 border-t border-gray-100 dark:border-slate-800">
            <span>Page {{ voyagesPage }} sur {{ totalVoyagesPages }}</span>
            <div class="flex items-center gap-1.5">
              <button @click="voyagesPage > 1 && voyagesPage--" :disabled="voyagesPage === 1" class="px-3 py-1 rounded-lg border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-700 dark:text-slate-200 disabled:opacity-40">← Préc.</button>
              <button @click="voyagesPage < totalVoyagesPages && voyagesPage++" :disabled="voyagesPage === totalVoyagesPages" class="px-3 py-1 rounded-lg border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-700 dark:text-slate-200 disabled:opacity-40">Suiv. →</button>
            </div>
          </div>
        </template>
      </div>

      <!-- Section Réservations faites par cet utilisateur (If Client) -->
      <div class="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-3xl p-6 shadow-2xs space-y-4">
        <div class="flex items-center justify-between border-b border-gray-100 dark:border-slate-800 pb-3">
          <h3 class="font-extrabold text-base text-[#053754] dark:text-sky-300">
            📦 Réservations effectuées par {{ user.prenom }} ({{ user.reservations_client ? user.reservations_client.length : 0 }})
          </h3>
        </div>

        <div v-if="!user.reservations_client || user.reservations_client.length === 0" class="text-xs text-gray-400 italic">
          Aucune réservation effectuée par cet utilisateur.
        </div>

        <template v-else>
          <div class="space-y-3">
            <div v-for="res in paginatedReservations" :key="res.id" class="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs space-y-3">
              <div class="flex items-center justify-between border-b border-gray-200 dark:border-slate-700 pb-2">
                <span class="font-mono font-black text-[#053754] dark:text-sky-300 text-sm">#{{ res.numero || res.id.substring(0, 8) }}</span>
                <span class="px-2.5 py-0.5 rounded-full font-bold bg-white dark:bg-slate-900 text-[#074C72] dark:text-sky-300 border border-sky-200 dark:border-slate-700 text-[10px] sm:text-xs">{{ res.statut }}</span>
              </div>
              <!-- Each element on its own line on mobile -->
              <div class="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-6 text-gray-600 dark:text-gray-300 font-medium">
                <div><span>Trajet :</span> <strong class="dark:text-slate-100">{{ res.voyage ? `${res.voyage.ville_depart} ➔ ${res.voyage.ville_destination}` : 'N/A' }}</strong></div>
                <div><span>Poids réservé :</span> <strong class="text-[#B50302] dark:text-red-400 font-black">{{ res.colis?.poids ?? res.poids_kg ?? 0 }} kg</strong></div>
                <div><span>Messages échangés :</span> <strong class="text-[#074C72] dark:text-sky-300">{{ res.messages ? res.messages.length : 0 }}</strong></div>
              </div>
            </div>
          </div>

          <!-- Pagination Reservations (5 items per page) -->
          <div v-if="totalReservationsPages > 1" class="pt-3 flex items-center justify-between text-xs font-bold text-gray-600 dark:text-gray-300 border-t border-gray-100 dark:border-slate-800">
            <span>Page {{ reservationsPage }} sur {{ totalReservationsPages }}</span>
            <div class="flex items-center gap-1.5">
              <button @click="reservationsPage > 1 && reservationsPage--" :disabled="reservationsPage === 1" class="px-3 py-1 rounded-lg border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-700 dark:text-slate-200 disabled:opacity-40">← Préc.</button>
              <button @click="reservationsPage < totalReservationsPages && reservationsPage++" :disabled="reservationsPage === totalReservationsPages" class="px-3 py-1 rounded-lg border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-700 dark:text-slate-200 disabled:opacity-40">Suiv. →</button>
            </div>
          </div>
        </template>
      </div>

    </template>

    <!-- Modal preview image / document -->
    <Teleport to="body">
      <div v-if="previewModal.isOpen" class="fixed inset-0 z-[9999] bg-black/80 flex items-center justify-center p-4" @click.self="previewModal.isOpen = false">
        <div class="max-w-4xl w-full bg-white dark:bg-slate-900 rounded-3xl p-5 space-y-4 relative border border-gray-200 dark:border-slate-800 shadow-2xl">
          <div class="flex items-center justify-between border-b dark:border-slate-800 pb-3">
            <h4 class="font-black text-[#053754] dark:text-sky-300 text-sm sm:text-base">{{ previewModal.title }}</h4>
            <div class="flex items-center gap-2">
              <a :href="previewModal.url" target="_blank" class="px-3 py-1 bg-[#053754] text-white rounded-lg text-xs font-bold hover:bg-[#074C72]">Ouvrir dans un nouvel onglet ↗</a>
              <button @click="previewModal.isOpen = false" class="text-gray-500 hover:text-gray-800 dark:hover:text-white font-bold p-1 text-base">✕</button>
            </div>
          </div>
          <div class="max-h-[75vh] flex items-center justify-center overflow-hidden">
            <iframe v-if="previewModal.url.toLowerCase().endsWith('.pdf')" :src="previewModal.url" class="w-full h-[70vh] rounded-xl border"></iframe>
            <img v-else :src="previewModal.url" class="max-h-[70vh] w-auto object-contain rounded-xl" />
          </div>
        </div>
      </div>
    </Teleport>

  </div>
</template>

<script setup>
import { ref, reactive, computed, watch, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { adminService } from '@/services/adminService'
import { encodeId, decodeId } from '@/utils/idMasker'
import Swal from 'sweetalert2'
import { formatImageUrl } from '@/utils/imageUrl'

const route = useRoute()
const router = useRouter()

const user = ref(null)
const loading = ref(true)
const actionLoading = ref(null)
const error = ref('')

const voyagesPage = ref(1)
const reservationsPage = ref(1)
const evaluationsPage = ref(1)
const perPage = 5

const previewModal = reactive({
  isOpen: false,
  url: '',
  title: ''
})

const openImagePreview = (url, title) => {
  if (!url) return
  previewModal.url = formatImageUrl(url)
  previewModal.title = title
  previewModal.isOpen = true
}

const fetchUserData = async () => {
  const currentId = decodeId(route.params.id) || route.params.id
  if (!currentId) {
    error.value = 'ID Utilisateur invalide.'
    loading.value = false
    return
  }

  loading.value = true
  error.value = ''
  user.value = null
  voyagesPage.value = 1
  reservationsPage.value = 1
  evaluationsPage.value = 1

  try {
    const res = await adminService.getUserDetail(currentId)
    if (res && res.data) {
      user.value = res.data
    } else {
      error.value = 'Utilisateur non trouvé.'
    }
  } catch (err) {
    error.value = err?.message || 'Erreur lors du chargement des détails.'
  } finally {
    loading.value = false
  }
}

onMounted(fetchUserData)

watch(
  () => route.params.id,
  (newId, oldId) => {
    if (newId && newId !== oldId) {
      fetchUserData()
    }
  }
)

const entreprise = computed(() => {
  return user.value?.entreprise_geree || user.value?.agent_gp?.entreprise || null
})

const rectoUrl = computed(() => {
  const v = user.value?.voyageur
  if (!v) return null
  return v.cni_recto || v.piece_recto || v.photo_recto || v.cni_photo || v.piece_identite_url || null
})

const versoUrl = computed(() => {
  const v = user.value?.voyageur
  if (!v) return null
  return v.cni_verso || v.piece_verso || v.photo_verso || null
})

const paginatedVoyages = computed(() => {
  if (!user.value?.voyageur?.voyages) return []
  const start = (voyagesPage.value - 1) * perPage
  return user.value.voyageur.voyages.slice(start, start + perPage)
})

const totalVoyagesPages = computed(() => {
  const total = user.value?.voyageur?.voyages?.length || 0
  return Math.ceil(total / perPage) || 1
})

const paginatedReservations = computed(() => {
  if (!user.value?.reservations_client) return []
  const start = (reservationsPage.value - 1) * perPage
  return user.value.reservations_client.slice(start, start + perPage)
})

const totalReservationsPages = computed(() => {
  const total = user.value?.reservations_client?.length || 0
  return Math.ceil(total / perPage) || 1
})

const evaluationsList = computed(() => {
  return user.value?.evaluations_recues || user.value?.voyageur?.evaluations || []
})

const noteMoyenneVoyageur = computed(() => {
  if (!user.value) return '5.0'
  const v = user.value.voyageur
  if (v?.moyenne_notes !== undefined && v?.moyenne_notes !== null && !isNaN(Number(v.moyenne_notes))) {
    return Number(v.moyenne_notes).toFixed(1)
  }
  if (v?.note_moyenne !== undefined && v?.note_moyenne !== null && !isNaN(Number(v.note_moyenne))) {
    return Number(v.note_moyenne).toFixed(1)
  }
  if (user.value.note_moyenne !== undefined && user.value.note_moyenne !== null && !isNaN(Number(user.value.note_moyenne))) {
    return Number(user.value.note_moyenne).toFixed(1)
  }
  const evals = evaluationsList.value
  if (Array.isArray(evals) && evals.length > 0) {
    const sum = evals.reduce((acc, curr) => acc + (Number(curr.note) || 0), 0)
    return (sum / evals.length).toFixed(1)
  }
  return '5.0'
})

const paginatedEvaluations = computed(() => {
  const list = evaluationsList.value
  const start = (evaluationsPage.value - 1) * perPage
  return list.slice(start, start + perPage)
})

const totalEvaluationsPages = computed(() => {
  const total = evaluationsList.value.length
  return Math.ceil(total / perPage) || 1
})

const getInitials = (prenom, nom) => {
  const p = (prenom || '').charAt(0).toUpperCase()
  const n = (nom || '').charAt(0).toUpperCase()
  return (p + n) || 'U'
}

const toggleBlock = async () => {
  if (!user.value || actionLoading.value) return
  const nextStatut = user.value.statut === 'suspendu' ? 'actif' : 'suspendu'
  const isUnblocking = user.value.statut === 'suspendu'
  
  const result = await Swal.fire({
    title: isUnblocking ? 'Débloquer le compte' : 'Bloquer le compte',
    text: `Voulez-vous vraiment ${isUnblocking ? 'débloquer' : 'bloquer'} le compte de ${user.value.prenom} ${user.value.nom} ?`,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: isUnblocking ? '#059669' : '#B50302',
    cancelButtonColor: '#6B7280',
    confirmButtonText: isUnblocking ? 'Oui, débloquer' : 'Oui, bloquer',
    cancelButtonText: 'Annuler'
  })

  if (!result.isConfirmed) return

  actionLoading.value = 'block'
  try {
    await adminService.toggleBlockUser(user.value.id, nextStatut)
    user.value.statut = nextStatut
    Swal.fire({
      toast: true,
      position: 'top-end',
      icon: 'success',
      title: `Compte ${isUnblocking ? 'débloqué' : 'bloqué'} avec succès`,
      showConfirmButton: false,
      timer: 3000,
      timerProgressBar: true
    })
  } catch (err) {
    Swal.fire({
      toast: true,
      position: 'top-end',
      icon: 'error',
      title: err.message || 'Erreur lors du changement de statut',
      showConfirmButton: false,
      timer: 4000
    })
  } finally {
    actionLoading.value = null
  }
}

const verifyVoyageur = async (statut) => {
  if (!user.value || !user.value.voyageur || actionLoading.value) return
  const isValidation = statut === 'verifie'

  const result = await Swal.fire({
    title: isValidation ? 'Valider le compte Voyageur' : 'Refuser le compte Voyageur',
    text: `Voulez-vous vraiment ${isValidation ? 'valider' : 'refuser'} ce compte voyageur ?`,
    icon: isValidation ? 'question' : 'warning',
    showCancelButton: true,
    confirmButtonColor: isValidation ? '#059669' : '#B50302',
    cancelButtonColor: '#6B7280',
    confirmButtonText: isValidation ? 'Oui, valider' : 'Oui, refuser',
    cancelButtonText: 'Annuler'
  })
  if (!result.isConfirmed) return

  actionLoading.value = statut
  try {
    await adminService.updateStatutVoyageur(user.value.voyageur.id, statut)
    user.value.voyageur.statut = statut
    Swal.fire({
      toast: true,
      position: 'top-end',
      icon: 'success',
      title: `Compte voyageur ${isValidation ? 'validé' : 'refusé'} avec succès`,
      showConfirmButton: false,
      timer: 3000,
      timerProgressBar: true
    })
  } catch (err) {
    Swal.fire({
      toast: true,
      position: 'top-end',
      icon: 'error',
      title: err.message || 'Erreur lors de la vérification voyageur',
      showConfirmButton: false,
      timer: 4000
    })
  } finally {
    actionLoading.value = null
  }
}

const updateEntrepriseStatut = async (newStatut) => {
  if (!entreprise.value || actionLoading.value) return

  let motifRefus = ''
  if (newStatut === 'refusee') {
    const { value: text, isConfirmed } = await Swal.fire({
      title: 'Refuser l\'entreprise GP',
      input: 'textarea',
      inputLabel: 'Motif du refus (optionnel)',
      inputPlaceholder: 'Expliquez la raison du refus...',
      showCancelButton: true,
      confirmButtonColor: '#B50302',
      cancelButtonColor: '#6B7280',
      confirmButtonText: 'Oui, refuser',
      cancelButtonText: 'Annuler'
    })
    if (!isConfirmed) return
    motifRefus = text || ''
  } else {
    const result = await Swal.fire({
      title: 'Valider l\'Entreprise GP',
      text: `Voulez-vous vraiment valider l'entreprise "${entreprise.value.nom}" ?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#059669',
      cancelButtonColor: '#6B7280',
      confirmButtonText: 'Oui, valider',
      cancelButtonText: 'Annuler'
    })
    if (!result.isConfirmed) return
  }

  actionLoading.value = `entreprise_${newStatut}`
  try {
    await adminService.updateStatutEntreprise(entreprise.value.id, newStatut, motifRefus)
    entreprise.value.statut_verification = newStatut
    Swal.fire({
      toast: true,
      position: 'top-end',
      icon: 'success',
      title: `Entreprise GP ${newStatut === 'verifiee' ? 'validée' : 'refusée'} avec succès`,
      showConfirmButton: false,
      timer: 3000,
      timerProgressBar: true
    })
  } catch (err) {
    Swal.fire({
      toast: true,
      position: 'top-end',
      icon: 'error',
      title: err.response?.data?.message || err.message || 'Erreur lors de la mise à jour',
      showConfirmButton: false,
      timer: 4000
    })
  } finally {
    actionLoading.value = null
  }
}

const getVoyageurStatutBadge = (statut) => {
  if (statut === 'verifie') return 'bg-emerald-50 text-emerald-700 border-emerald-200'
  if (statut === 'refuse') return 'bg-red-50 text-[#B50302] border-red-200'
  return 'bg-amber-50 text-amber-700 border-amber-200'
}

const getEntrepriseStatutBadge = (statut) => {
  if (statut === 'verifiee') return 'bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800'
  if (statut === 'refusee') return 'bg-red-50 dark:bg-red-950/80 text-[#B50302] dark:text-red-400 border-red-200 dark:border-red-800'
  return 'bg-amber-50 dark:bg-amber-950/80 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800'
}

const formatDate = (dateStr) => {
  if (!dateStr) return '-'
  return new Date(dateStr).toLocaleString('fr-FR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}
</script>
