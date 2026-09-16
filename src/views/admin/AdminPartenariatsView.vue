<template>
  <div class="space-y-6">
    
    <!-- Filter Header Card -->
    <div class="bg-white border border-gray-200 rounded-3xl p-5 shadow-2xs flex flex-col md:flex-row items-center justify-between gap-4">
      
      <div class="relative w-full md:w-96">
        <svg class="w-5 h-5 absolute left-3.5 top-3 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input 
          v-model="filters.search"
          @input="fetchDemandes"
          type="text" 
          placeholder="Rechercher par entreprise, responsable, email..."
          class="w-full bg-[#FAF7F2] border border-gray-200 rounded-2xl pl-10 pr-4 py-2.5 text-xs sm:text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#074C72] transition-colors"
        />
      </div>

      <select v-model="filters.statut" @change="fetchDemandes" class="bg-[#FAF7F2] border border-gray-200 rounded-2xl px-4 py-2.5 text-xs font-bold text-[#053754] outline-none cursor-pointer">
        <option value="">Tous les Statuts</option>
        <option value="en_attente">En Attente</option>
        <option value="contacte">Contacté</option>
        <option value="traite">Traité</option>
        <option value="archive">Archivé</option>
      </select>
    </div>

    <!-- Table Container -->
    <div class="bg-white border border-gray-200 rounded-3xl shadow-2xs overflow-hidden">
      
      <!-- Loading State -->
      <div v-if="loading" class="p-12 text-center space-y-3">
        <div class="w-10 h-10 border-4 border-[#053754] border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p class="text-xs font-bold text-[#074C72]">Chargement des demandes de partenariat...</p>
      </div>

      <!-- Empty State -->
      <div v-else-if="demandes.length === 0" class="text-center py-16 text-gray-400 font-semibold text-sm">
        Aucune demande de partenariat trouvée.
      </div>

      <div v-else class="overflow-x-auto">
        <table class="w-full min-w-[850px] text-left text-xs sm:text-sm">
          <thead class="bg-slate-50 text-[#053754] uppercase tracking-wider font-extrabold border-b border-gray-200 text-[11px] whitespace-nowrap">
            <tr>
              <th class="px-6 py-4">Entreprise / Responsable</th>
              <th class="px-6 py-4">Contact</th>
              <th class="px-6 py-4">Type Partenariat</th>
              <th class="px-6 py-4">Date Soumission</th>
              <th class="px-6 py-4">Statut</th>
              <th class="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100">
            <tr v-for="d in paginatedDemandes" :key="d.id" class="hover:bg-slate-50/80 transition-colors">
              
              <!-- Entreprise -->
              <td class="px-6 py-4 whitespace-nowrap">
                <p class="font-extrabold text-[#053754] text-xs sm:text-sm whitespace-nowrap">{{ d.entreprise || 'Entreprise / Transporteur' }}</p>
                <p class="text-xs text-gray-500 font-medium whitespace-nowrap">Responsable : {{ d.nom_complet }}</p>
              </td>

              <!-- Contact -->
              <td class="px-6 py-4 text-xs font-medium whitespace-nowrap">
                <p class="text-[#074C72] font-bold whitespace-nowrap">{{ d.email }}</p>
                <p class="text-gray-500 font-mono font-bold whitespace-nowrap">{{ d.telephone }}</p>
              </td>

              <!-- Type Partenariat -->
              <td class="px-6 py-4 whitespace-nowrap">
                <span class="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-sky-50 text-[#074C72] border border-sky-200 whitespace-nowrap">
                  {{ getTypeLabel(d) }}
                </span>
              </td>

              <!-- Date -->
              <td class="px-6 py-4 text-xs font-mono font-bold text-gray-500 whitespace-nowrap">
                {{ formatDate(d.created_at) }}
              </td>

              <!-- Statut -->
              <td class="px-6 py-4 whitespace-nowrap">
                <span class="px-3 py-1 rounded-full text-xs font-extrabold capitalize border whitespace-nowrap" :class="getStatutBadge(d.statut)">
                  {{ d.statut }}
                </span>
              </td>

              <!-- Actions -->
              <td class="px-6 py-4 text-right whitespace-nowrap">
                <button @click="openModal(d)" class="px-3.5 py-1.5 rounded-xl text-xs font-extrabold bg-[#053754] hover:bg-[#074C72] text-white transition-all shadow-xs cursor-pointer flex items-center gap-1.5 ml-auto whitespace-nowrap">
                  <span>👁️ Consulter la Demande</span>
                </button>
              </td>

            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination Footer (5 items per page) -->
      <div v-if="totalPages > 1" class="p-4 border-t border-gray-100 bg-slate-50 flex items-center justify-between text-xs font-bold text-gray-600">
        <span>Page {{ currentPage }} sur {{ totalPages }} ({{ demandes.length }} demandes)</span>

        <div class="flex items-center gap-1.5">
          <button 
            @click="currentPage > 1 && currentPage--" 
            :disabled="currentPage === 1"
            class="px-3 py-1.5 rounded-xl border border-gray-200 bg-white hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
          >
            ← Précédent
          </button>

          <button 
            v-for="p in totalPages" 
            :key="p" 
            @click="currentPage = p"
            class="w-8 h-8 rounded-xl border text-xs font-extrabold transition-colors cursor-pointer"
            :class="currentPage === p ? 'bg-[#053754] text-white border-[#053754]' : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-100'"
          >
            {{ p }}
          </button>

          <button 
            @click="currentPage < totalPages && currentPage++" 
            :disabled="currentPage === totalPages"
            class="px-3 py-1.5 rounded-xl border border-gray-200 bg-white hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
          >
            Suivant →
          </button>
        </div>
      </div>

    </div>

    <!-- Modal Consultation & Gestion Demande -->
    <Teleport to="body">
      <div v-if="selectedDemande" class="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" @click.self="selectedDemande = null">
        <div class="w-full max-w-2xl bg-white border border-gray-200 rounded-3xl shadow-2xl p-6 sm:p-8 space-y-6 text-gray-800 animate-in fade-in duration-200 max-h-[90vh] overflow-y-auto">
          
          <!-- Modal Header -->
          <div class="flex items-start justify-between border-b border-gray-100 pb-5">
            <div class="space-y-1">
              <span class="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-[#D8ECF8] text-[#074C72] border border-[#074C72]/20">
                {{ getTypeLabel(selectedDemande) }}
              </span>
              <h3 class="text-xl sm:text-2xl font-black text-[#053754] mt-2">
                {{ selectedDemande.entreprise || selectedDemande.nom_complet }}
              </h3>
              <p class="text-xs text-gray-500 font-medium">Demande de partenariat professionnel soumise le {{ formatDate(selectedDemande.created_at) }}</p>
            </div>
            <button @click="selectedDemande = null" class="w-9 h-9 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 font-bold text-base flex items-center justify-center transition">✕</button>
          </div>

          <!-- Structured Info Cards -->
          <div class="space-y-5 text-xs">
            
            <!-- Information du Responsable -->
            <div class="bg-[#FAF7F2] p-5 rounded-2xl border border-gray-200 space-y-3">
              <h4 class="font-extrabold text-xs uppercase tracking-wider text-[#053754] flex items-center gap-2">
                <span>👤 Responsable & Contact Direct</span>
              </h4>

              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div class="space-y-0.5">
                  <span class="text-gray-400 font-bold uppercase text-[10px]">Nom Complet</span>
                  <p class="text-[#053754] font-extrabold text-sm">{{ selectedDemande.nom_complet }}</p>
                </div>

                <div class="space-y-0.5">
                  <span class="text-gray-400 font-bold uppercase text-[10px]">Statut Actuel</span>
                  <div>
                    <span class="px-3 py-0.5 rounded-full text-xs font-extrabold capitalize border" :class="getStatutBadge(selectedDemande.statut)">
                      {{ selectedDemande.statut }}
                    </span>
                  </div>
                </div>

                <div class="space-y-0.5">
                  <span class="text-gray-400 font-bold uppercase text-[10px]">Email Professionnel</span>
                  <a :href="`mailto:${selectedDemande.email}`" class="text-[#074C72] hover:underline font-bold text-xs flex items-center gap-1">
                    <span>✉️ {{ selectedDemande.email }}</span>
                  </a>
                </div>

                <div class="space-y-0.5">
                  <span class="text-gray-400 font-bold uppercase text-[10px]">Numéro Téléphone</span>
                  <a :href="`tel:${selectedDemande.telephone}`" class="text-[#074C72] hover:underline font-bold text-xs font-mono flex items-center gap-1">
                    <span>📞 {{ selectedDemande.telephone }}</span>
                  </a>
                </div>
              </div>
            </div>

            <!-- Message & Contenu de la Demande -->
            <div class="space-y-4">
              
              <!-- Formule / Offre si disponible -->
              <div v-if="parsedDetails.formula" class="p-4 bg-amber-50 border border-amber-200 rounded-2xl space-y-1">
                <span class="text-[10px] font-extrabold uppercase tracking-wider text-amber-800 block">Offre / Formule Souhaitée</span>
                <p class="text-amber-950 font-black text-sm">{{ parsedDetails.formula }}</p>
              </div>

              <!-- Cartes Détails Séparées (Adresse & Fréquence) -->
              <div v-if="parsedDetails.address || parsedDetails.frequency" class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div v-if="parsedDetails.address" class="p-4 bg-[#FAF7F2] border border-gray-200 rounded-2xl space-y-1">
                  <span class="text-[10px] font-extrabold uppercase tracking-wider text-gray-400 block">Adresse / Zone d'Activité</span>
                  <p class="text-[#053754] font-extrabold text-xs sm:text-sm">📍 {{ parsedDetails.address }}</p>
                </div>

                <div v-if="parsedDetails.frequency" class="p-4 bg-[#FAF7F2] border border-gray-200 rounded-2xl space-y-1">
                  <span class="text-[10px] font-extrabold uppercase tracking-wider text-gray-400 block">Fréquence de Transport</span>
                  <p class="text-[#074C72] font-extrabold text-xs sm:text-sm">✈️ {{ parsedDetails.frequency }}</p>
                </div>
              </div>

              <!-- Message Texte -->
              <div class="bg-white p-5 rounded-2xl border-l-4 border-l-[#053754] border border-gray-200 shadow-2xs space-y-2">
                <span class="text-[#053754] font-extrabold uppercase tracking-wider block text-[11px]">
                  💬 Message & Motivation de la Demande
                </span>
                <div class="p-4 bg-[#FAF7F2] rounded-xl text-gray-700 leading-relaxed font-medium text-sm whitespace-pre-line border border-gray-100">
                  {{ parsedDetails.messageText }}
                </div>
              </div>

            </div>

          </div>

          <!-- Actions Modération -->
          <div class="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-gray-100">
            <span class="text-xs text-gray-500 font-semibold">Changer l'état du traitement :</span>

            <div class="flex items-center gap-2">
              <button 
                v-if="selectedDemande.statut === 'en_attente'" 
                @click="updateStatut(selectedDemande.id, 'contacte')" 
                class="px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-extrabold text-xs rounded-xl shadow-md transition-all cursor-pointer flex items-center gap-1.5"
              >
                <span>📞 Marquer Contacté</span>
              </button>
              
              <button 
                v-if="selectedDemande.statut !== 'traite'" 
                @click="updateStatut(selectedDemande.id, 'traite')" 
                class="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl shadow-md transition-all cursor-pointer flex items-center gap-1.5"
              >
                <span>✓ Valider Traité</span>
              </button>

              <div v-if="selectedDemande.statut === 'traite'" class="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 font-extrabold text-xs">
                <span>✓ Demande entièrement traitée et validée</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </Teleport>

  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { adminService } from '@/services/adminService'
import Swal from 'sweetalert2'

const demandes = ref([])
const loading = ref(true)
const selectedDemande = ref(null)
const currentPage = ref(1)
const perPage = 5

const filters = reactive({
  search: '',
  statut: ''
})

onMounted(() => {
  fetchDemandes()
})

const fetchDemandes = async () => {
  loading.value = true
  currentPage.value = 1
  try {
    const res = await adminService.getDemandesPartenariat({
      ...filters,
      per_page: 100
    })
    if (res && res.data) {
      demandes.value = res.data.data || []
    }
  } catch (err) {
    console.error('Erreur chargement demandes partenariat:', err)
  } finally {
    loading.value = false
  }
}

const totalPages = computed(() => {
  return Math.ceil(demandes.value.length / perPage) || 1
})

const paginatedDemandes = computed(() => {
  const start = (currentPage.value - 1) * perPage
  return demandes.value.slice(start, start + perPage)
})

const parsedDetails = computed(() => {
  const msgStr = selectedDemande.value?.message || ''
  if (!msgStr) return { formula: null, address: null, frequency: null, messageText: '' }

  let str = msgStr
  let formula = null
  let address = null
  let frequency = null

  // 1. Bracket option e.g. [Tester gratuitement au lancement (0% commission)]
  const bracketMatch = str.match(/\[(.*?)\]/)
  if (bracketMatch) {
    formula = bracketMatch[1].trim()
    str = str.replace(bracketMatch[0], '').trim()
  }

  // 2. Extract Adresse / Localisation
  const addressMatch = str.match(/(?:Adresse|Localisation)\s*:\s*([^\-\n]+)/i)
  if (addressMatch) {
    address = addressMatch[1].trim()
    str = str.replace(addressMatch[0], '').trim()
  }

  // 3. Extract Fréquence
  const freqMatch = str.match(/(?:Fréquence|Frequence)\s*:\s*([^\-\n]+)/i)
  if (freqMatch) {
    frequency = freqMatch[1].trim()
    str = str.replace(freqMatch[0], '').trim()
  }

  // Clean remaining text
  str = str.replace(/^[\-\s,:]+|[\-\s,:]+$/g, '').trim()

  return {
    formula,
    address,
    frequency,
    messageText: str || 'Aucun message supplémentaire.'
  }
})

const openModal = (demande) => {
  selectedDemande.value = demande
}

const updateStatut = async (id, statut) => {
  try {
    await adminService.updateDemandePartenariatStatut(id, statut)
    await Swal.fire('Succès !', 'Statut mis à jour avec succès.', 'success')
    selectedDemande.value = null
    fetchDemandes()
  } catch (err) {
    Swal.fire('Erreur', err.message || 'Erreur lors de la mise à jour', 'error')
  }
}

const getTypeLabel = (demande) => {
  if (!demande) return 'Transporteur / Pro'
  const type = demande.type_partenariat || ''
  if (type === 'transporteur') return 'Transporteur / Pro'
  if (type === 'agence') return 'Agence de Transit'
  if (type === 'entreprise') return 'Entreprise'
  return type || 'Transporteur / Pro'
}

const getStatutBadge = (statut) => {
  if (statut === 'traite') return 'bg-emerald-50 text-emerald-700 border-emerald-200'
  if (statut === 'contacte') return 'bg-amber-50 text-amber-700 border-amber-200'
  return 'bg-sky-50 text-[#074C72] border-sky-200'
}

const formatDate = (dateStr) => {
  if (!dateStr) return '-'
  return new Date(dateStr).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })
}
</script>
