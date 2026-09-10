<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import BookingProgressBar from '@/components/client/BookingProgressBar.vue'

const router = useRouter()

const selectedType = ref('vetements')
const weightKg = ref(6)
const estimatedValue = ref(75000)
const description = ref('Vêtements pliés et chaussures légères pour la famille')
const fileName = ref('')
const previewImage = ref(null)

const packageTypes = [
  { id: 'vetements', label: 'Vêtements & tissus', icon: '👗' },
  { id: 'documents', label: 'Documents', icon: '📄' },
  { id: 'electroniques', label: 'Électroniques', icon: '📱' },
  { id: 'cosmetiques', label: 'Cosmétiques', icon: '💄' },
  { id: 'cadeaux', label: 'Cadeaux', icon: '🎁' },
  { id: 'autres', label: 'Autres objets', icon: '📦' }
]

const unitPrice = 8500
const totalPrice = computed(() => weightKg.value * unitPrice)

const handleFileChange = (e) => {
  const file = e.target.files[0]
  if (file) {
    fileName.value = file.name
    previewImage.value = URL.createObjectURL(file)
  }
}

const goToStep2 = () => {
  router.push('/client/booking/step-2')
}
</script>

<template>
  <div class="space-y-6 pb-12 max-w-3xl mx-auto">
    <!-- Progress Bar Step 1 -->
    <BookingProgressBar
      :step="1"
      :totalSteps="4"
      title="Détails du colis"
      subtitle="Détails du colis"
    />

    <!-- Form Section -->
    <div class="space-y-6 bg-white rounded-3xl p-6 sm:p-8 border border-gray-200 shadow-2xs">
      
      <!-- Type de colis * -->
      <div class="space-y-2.5">
        <label class="block text-xs font-bold text-[#074C72]">
          Type de colis <span class="text-[#B50302]">*</span>
        </label>
        <div class="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          <button
            v-for="type in packageTypes"
            :key="type.id"
            type="button"
            @click="selectedType = type.id"
            :class="[
              'p-3.5 rounded-2xl border text-left flex items-center gap-3 transition-all cursor-pointer shadow-2xs',
              selectedType === type.id
                ? 'border-[#074C72] bg-white ring-2 ring-[#074C72]/20 font-bold text-[#074C72] shadow-xs'
                : 'border-gray-200 bg-white hover:border-gray-300 text-gray-600 font-medium'
            ]"
          >
            <span class="text-xl shrink-0">{{ type.icon }}</span>
            <span class="text-xs sm:text-sm font-semibold truncate">{{ type.label }}</span>
          </button>
        </div>
      </div>

      <!-- Photo du contenu du colis * (Exact Mockup Match) -->
      <div class="space-y-2.5">
        <label class="block text-xs font-bold text-[#074C72]">
          Photo du contenu du colis <span class="text-[#B50302]">*</span>
        </label>
        
        <div class="border border-gray-200 bg-white rounded-2xl p-5 flex items-center gap-5">
          <!-- Left Square Image Container (#EAEFF4) -->
          <div class="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-[#EAEFF4] border border-gray-200/80 flex items-center justify-center shrink-0 overflow-hidden relative">
            <img v-if="previewImage" :src="previewImage" alt="Colis preview" class="w-full h-full object-cover" />
            <svg v-else class="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>

          <!-- Right Side Controls -->
          <div class="space-y-3 flex-1">
            <p class="text-xs text-gray-500 font-medium italic">
              importer une image du colis
            </p>
            <div>
              <label class="inline-block px-5 py-2.5 rounded-xl border border-[#B50302] bg-white text-[#B50302] hover:bg-red-50 text-xs sm:text-sm font-bold transition-colors cursor-pointer shadow-2xs">
                <span>Choisir un fichier</span>
                <input type="file" accept="image/*" class="hidden" @change="handleFileChange" />
              </label>
            </div>
            <p v-if="fileName" class="text-[11px] text-gray-600 font-semibold truncate">
              {{ fileName }}
            </p>
          </div>
        </div>
      </div>

      <!-- Description précise du contenu * -->
      <div class="space-y-2">
        <label class="block text-xs font-bold text-[#074C72]">
          Description précise du contenu <span class="text-[#B50302]">*</span>
        </label>
        <textarea
          v-model="description"
          rows="3"
          placeholder="ex: 3 tenues traditionnelles brodées et 2 pagnes neufs..."
          class="w-full p-3.5 text-xs sm:text-sm bg-white border border-gray-300 rounded-2xl outline-none focus:border-[#074C72] focus:ring-2 focus:ring-[#074C72]/20 font-medium placeholder-gray-400"
        ></textarea>
      </div>

      <!-- Valeur estimée(CFA) -->
      <div class="space-y-2">
        <label class="block text-xs font-bold text-[#074C72]">
          Valeur estimée(CFA)
        </label>
        <input
          v-model="estimatedValue"
          type="number"
          placeholder="0"
          class="w-full px-4 py-3 text-xs sm:text-sm bg-white border border-gray-300 rounded-xl outline-none focus:border-[#074C72] focus:ring-2 focus:ring-[#074C72]/20 font-bold text-principal-dark"
        />
      </div>

      <!-- Poids estimée(Kg) Slider -->
      <div class="bg-gray-50 rounded-2xl p-5 border border-gray-200 space-y-3">
        <div class="flex items-center justify-between">
          <div>
            <div class="text-sm font-bold text-[#074C72]">Poids estimée(Kg)</div>
            <div class="text-[11px] text-gray-400 font-medium italic">Pesée certifiée au point de collecte</div>
          </div>
          <div class="text-lg font-black text-[#074C72]">
            {{ weightKg }}kg
          </div>
        </div>

        <!-- Slider Range Input -->
        <input
          v-model="weightKg"
          type="range"
          min="1"
          max="15"
          step="1"
          class="w-full accent-[#B50302] cursor-pointer"
        />

        <div class="flex items-center justify-between text-xs pt-1">
          <span class="text-[#FF9F02] font-extrabold bg-amber-50 border border-amber-200 px-3 py-1 rounded-full text-[11px]">
            1kg= 8 500 F CFA
          </span>
          <span class="text-gray-400 font-medium text-[11px]">
            Capacité restante: 15Kg
          </span>
        </div>
      </div>

    </div>

    <!-- Bottom Price Bar & Submit CTA -->
    <div class="flex items-center justify-between pt-4 border-t border-gray-200 bg-white p-5 rounded-2xl border shadow-xs">
      <div class="space-y-0.5">
        <div class="text-xs text-gray-500 font-medium">Prix :</div>
        <div class="text-sm sm:text-base font-extrabold text-[#B50302]">
          {{ weightKg }} * 8 500 = {{ totalPrice.toLocaleString() }} FCFA
        </div>
      </div>

      <button
        @click="goToStep2"
        type="button"
        class="bg-[#B50302] hover:bg-[#870202] text-white font-extrabold text-xs sm:text-sm px-7 py-3.5 rounded-xl shadow-md transition-all cursor-pointer active:scale-[0.99]"
      >
        CONTINUER
      </button>
    </div>

  </div>
</template>
