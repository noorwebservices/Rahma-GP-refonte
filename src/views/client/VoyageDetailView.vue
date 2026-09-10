<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()

const startBooking = () => {
  router.push('/client/booking/step-1')
}
</script>

<template>
  <div class="space-y-6 pb-12">
    
    <!-- Responsive Grid Layout: 2 Columns on Desktop (lg:) -->
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      
      <!-- Left Column: Hero Voyage Card, Capacité, Tarif & Points (lg:col-span-7) -->
      <div class="lg:col-span-7 space-y-5">
        
        <!-- Hero Summary Card (Dark Blue #053754) -->
        <div class="bg-[#053754] text-white rounded-3xl p-6 sm:p-7 shadow-xl relative overflow-hidden space-y-4">
          <div class="flex items-center justify-between">
            <div></div>
            <span class="bg-white/15 backdrop-blur-md px-3.5 py-1 rounded-full text-[11px] font-extrabold text-gray-200 border border-white/10 flex items-center gap-1.5">
              <span>👤</span> Entreprise GP
            </span>
          </div>

          <!-- Route Flag visual -->
          <div class="flex items-center justify-between text-lg sm:text-xl font-black px-2">
            <div>
              <span class="text-2xl">🇸🇳</span>
              <div class="text-base sm:text-lg font-bold text-white">Dakar</div>
              <div class="text-xs text-gray-300 font-normal">Sénégal</div>
            </div>

            <div class="flex-1 flex items-center justify-center px-4 relative">
              <div class="w-full border-b-2 border-[#B50302] border-dashed"></div>
              <div class="absolute bg-[#053754] px-2 text-[#B50302] text-lg font-bold">
                ✈️
              </div>
            </div>

            <div class="text-right">
              <span class="text-2xl">🇫🇷</span>
              <div class="text-base sm:text-lg font-bold text-white">Paris</div>
              <div class="text-xs text-gray-300 font-normal">France</div>
            </div>
          </div>

          <!-- Dates Row -->
          <div class="grid grid-cols-2 gap-4 pt-4 border-t border-white/15 text-xs">
            <div>
              <div class="text-gray-300 font-medium">Départ</div>
              <div class="font-bold text-white text-xs sm:text-sm mt-0.5">22 Septembre 2026</div>
            </div>
            <div class="text-right">
              <div class="text-gray-300 font-medium">Arrivée Estimée</div>
              <div class="font-bold text-white text-xs sm:text-sm mt-0.5">23 Septembre 2026</div>
            </div>
          </div>
        </div>

        <!-- Capacité disponible Card -->
        <div class="bg-white rounded-2xl p-5 border border-gray-200 shadow-2xs space-y-2">
          <div class="flex items-center justify-between font-bold text-sm">
            <span class="text-[#074C72]">Capacité disponible</span>
            <span class="text-[#074C72] font-black text-base">15kg</span>
          </div>
          <div class="w-full h-2.5 bg-gray-200 rounded-full overflow-hidden">
            <div class="h-full bg-[#B50302] w-[40%] rounded-full"></div>
          </div>
          <div class="text-right text-[11px] text-gray-400 font-medium">
            10 kg déjà réservés sur 25 kg
          </div>
        </div>

        <!-- Tarif Card -->
        <div class="bg-white rounded-2xl p-5 border border-gray-200 shadow-2xs flex items-center justify-between">
          <div class="space-y-0.5">
            <div class="text-xs font-bold text-gray-400">Tarif</div>
            <div class="text-xl sm:text-2xl font-black text-[#B50302]">
              8 500 FCFA
            </div>
            <div class="text-xs text-gray-400 font-medium">par kilogramme</div>
          </div>
          <div class="w-12 h-12 rounded-2xl bg-red-50 text-[#B50302] flex items-center justify-center text-2xl shadow-xs shrink-0">
            ⚖️
          </div>
        </div>

        <!-- Où déposer mon colis ? Card (Dakar) -->
        <div class="bg-white rounded-2xl p-5 border border-gray-200 shadow-2xs space-y-3">
          <div class="text-xs font-bold text-gray-400">Où déposer mon colis ?</div>
          <div class="flex items-start gap-3">
            <div class="w-8 h-8 rounded-full bg-red-50 text-[#B50302] flex items-center justify-center shrink-0 font-bold">
              📍
            </div>
            <div>
              <div class="text-sm font-bold text-[#074C72]">Parcelles Assainies, Dakar</div>
              <div class="text-xs text-gray-500 mt-1 flex items-center gap-2">
                <span>Horaires de dépôt :</span>
                <span class="font-bold text-[#074C72]">Lun - Ven: 09h00 - 18h00</span>
              </div>
            </div>
          </div>

          <button type="button" class="w-full py-2.5 rounded-xl border border-red-200 bg-red-50/50 hover:bg-red-50 text-[#B50302] font-bold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer">
            <span>📖</span>
            <span>Voir l'itinéraire</span>
          </button>
        </div>

        <!-- Point de retrait à l'arrivée Card (Paris) -->
        <div class="bg-white rounded-2xl p-5 border border-gray-200 shadow-2xs space-y-3">
          <div class="text-xs font-bold text-gray-400">Point de retrait à l'arrivée</div>
          <div class="flex items-start gap-3">
            <div class="w-8 h-8 rounded-full bg-red-50 text-[#B50302] flex items-center justify-center shrink-0 font-bold">
              📍
            </div>
            <div>
              <div class="text-sm font-bold text-[#074C72]">Agence Paris 10ème (Gare du Nord)</div>
              <div class="text-xs text-gray-500 mt-1 flex items-center gap-2">
                <span>Horaires de dépôt :</span>
                <span class="font-bold text-[#074C72]">Lun - Ven: 09h00 - 18h00</span>
              </div>
            </div>
          </div>

          <button type="button" class="w-full py-2.5 rounded-xl border border-red-200 bg-red-50/50 hover:bg-red-50 text-[#B50302] font-bold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer">
            <span>📖</span>
            <span>Voir l'itinéraire</span>
          </button>
        </div>

      </div>

      <!-- Right Column: Colis Acceptés, Interdits, Transporteur & CTA Button (lg:col-span-5) -->
      <div class="lg:col-span-5 space-y-5 lg:sticky lg:top-20">
        
        <!-- Colis acceptés Card (Green Border) -->
        <div class="bg-white rounded-2xl p-5 border border-emerald-300 shadow-2xs space-y-3">
          <div class="flex items-center gap-2 text-emerald-700 font-extrabold text-sm">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>Colis acceptés :</span>
          </div>
          <ul class="space-y-2 text-xs font-semibold text-gray-600 pl-1">
            <li class="flex items-center gap-2">
              <span class="w-2 h-2 rounded-full bg-emerald-600"></span>
              <span>Vêtements & tissus</span>
            </li>
            <li class="flex items-center gap-2">
              <span class="w-2 h-2 rounded-full bg-emerald-600"></span>
              <span>Documents & papiers</span>
            </li>
            <li class="flex items-center gap-2">
              <span class="w-2 h-2 rounded-full bg-emerald-600"></span>
              <span>Cosmétiques scellés</span>
            </li>
            <li class="flex items-center gap-2">
              <span class="w-2 h-2 rounded-full bg-emerald-600"></span>
              <span>Petite électronique</span>
            </li>
          </ul>
        </div>

        <!-- Objets interdits Card (Red Border) -->
        <div class="bg-white rounded-2xl p-5 border border-red-300 shadow-2xs space-y-3">
          <div class="flex items-center gap-2 text-[#B50302] font-extrabold text-sm">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <span>Objets interdits</span>
          </div>
          <ul class="space-y-2 text-xs font-semibold text-gray-600 pl-1">
            <li class="flex items-center gap-2">
              <span class="w-2 h-2 rounded-full bg-[#B50302]"></span>
              <span>Liquides inflammable</span>
            </li>
            <li class="flex items-center gap-2">
              <span class="w-2 h-2 rounded-full bg-[#B50302]"></span>
              <span>Substances illicites</span>
            </li>
            <li class="flex items-center gap-2">
              <span class="w-2 h-2 rounded-full bg-[#B50302]"></span>
              <span>Objets dangereux ou armes</span>
            </li>
            <li class="flex items-center gap-2">
              <span class="w-2 h-2 rounded-full bg-[#B50302]"></span>
              <span>Contrefaçons</span>
            </li>
          </ul>
        </div>

        <!-- À propos du transporteur Card -->
        <div class="bg-white rounded-2xl p-5 border border-gray-200 shadow-2xs space-y-3">
          <div class="flex items-center gap-2 text-[#074C72] font-extrabold text-sm">
            <svg class="w-5 h-5 text-[#074C72]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            <span>À propos du transporteur</span>
          </div>

          <div class="flex items-center justify-between pt-1">
            <div class="flex items-center gap-3">
              <div class="w-11 h-11 rounded-full bg-[#053754] text-white font-black text-xs flex items-center justify-center shadow-xs">
                RGP
              </div>
              <div>
                <div class="font-bold text-[#074C72] text-sm">Rahma Gp Express</div>
                <div class="text-xs text-[#FF9F02] font-extrabold flex items-center gap-1">
                  <span>★</span> <span>4.9</span>
                </div>
              </div>
            </div>

            <button class="text-xs text-[#074C72] font-bold hover:underline flex items-center gap-1">
              <span>32 avis</span>
              <span>➔</span>
            </button>
          </div>

          <p class="text-xs text-gray-500 leading-relaxed font-medium">
            Entreprise de fret GP agréée. 4 liaisons régulières par semaine Dakar - Paris avec assurance transport incluse.
          </p>
        </div>

        <!-- CTA Button -->
        <button
          @click="startBooking"
          type="button"
          class="w-full bg-[#B50302] hover:bg-[#870202] text-white font-extrabold text-sm py-4 rounded-2xl shadow-xl transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99]"
        >
          <span>RÉSERVER POUR CE VOYAGE</span>
          <span class="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center text-xs">➔</span>
        </button>

      </div>

    </div>

  </div>
</template>
