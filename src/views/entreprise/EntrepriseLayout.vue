<template>
  <div class="min-h-screen bg-[#FAF7F2] dark:bg-slate-950 font-sans flex text-gray-800 dark:text-slate-100 selection:bg-[#053754] selection:text-white transition-colors duration-300">
    
    <!-- Mobile Sidebar Backdrop Overlay -->
    <div 
      v-if="isMobileMenuOpen" 
      @click="isMobileMenuOpen = false"
      class="fixed inset-0 z-40 bg-black/50 backdrop-blur-xs lg:hidden transition-opacity"
    ></div>

    <!-- Sidebar (Desktop & Mobile Drawer) -->
    <aside 
      class="fixed lg:sticky top-0 left-0 z-50 h-screen w-64 bg-white dark:bg-slate-900 border-r border-gray-200 dark:border-slate-800 flex flex-col justify-between transition-transform duration-300 ease-in-out shrink-0 shadow-sm"
      :class="isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'"
    >
      <div>
        <!-- Sidebar Logo Area -->
        <div class="p-6 border-b border-gray-100 dark:border-slate-800 flex items-center justify-between">
          <router-link to="/entreprise" class="flex items-center gap-2">
            <img src="@/assets/images/logo-rouge.svg" alt="Rahma Delivery" class="h-9 w-auto object-contain" />
            <span class="px-2 py-0.5 bg-[#B50302] text-white text-[10px] font-black rounded-md uppercase tracking-wider shadow-xs">GP</span>
          </router-link>
          
          <button @click="isMobileMenuOpen = false" class="lg:hidden text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 p-1">
            ✕
          </button>
        </div>

        <!-- Sidebar Navigation Menu -->
        <nav class="p-4 space-y-1">
          <router-link 
            to="/entreprise" 
            exact
            @click="isMobileMenuOpen = false"
            class="flex items-center px-4 py-3 rounded-2xl text-xs font-extrabold transition-all duration-200 cursor-pointer"
            :class="$route.path === '/entreprise' ? 'bg-[#053754] text-white shadow-md' : 'text-gray-600 dark:text-gray-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-[#053754] dark:hover:text-sky-400'"
          >
            <span>Tableau de bord</span>
          </router-link>

          <router-link 
            to="/entreprise/agents" 
            @click="isMobileMenuOpen = false"
            class="flex items-center px-4 py-3 rounded-2xl text-xs font-extrabold transition-all duration-200 cursor-pointer"
            :class="$route.path.startsWith('/entreprise/agents') ? 'bg-[#053754] text-white shadow-md' : 'text-gray-600 dark:text-gray-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-[#053754] dark:hover:text-sky-400'"
          >
            <span>Mes Agents GP</span>
          </router-link>

          <router-link 
            to="/entreprise/voyages" 
            @click="isMobileMenuOpen = false"
            class="flex items-center px-4 py-3 rounded-2xl text-xs font-extrabold transition-all duration-200 cursor-pointer"
            :class="$route.path.startsWith('/entreprise/voyages') ? 'bg-[#053754] text-white shadow-md' : 'text-gray-600 dark:text-gray-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-[#053754] dark:hover:text-sky-400'"
          >
            <span>Voyages Entreprise</span>
          </router-link>

          <router-link 
            to="/entreprise/discussions" 
            @click="isMobileMenuOpen = false"
            class="flex items-center px-4 py-3 rounded-2xl text-xs font-extrabold transition-all duration-200 cursor-pointer"
            :class="$route.path.startsWith('/entreprise/discussions') ? 'bg-[#053754] text-white shadow-md' : 'text-gray-600 dark:text-gray-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-[#053754] dark:hover:text-sky-400'"
          >
            <span>Discussions Clients</span>
          </router-link>

          <router-link 
            to="/entreprise/revenus" 
            @click="isMobileMenuOpen = false"
            class="flex items-center px-4 py-3 rounded-2xl text-xs font-extrabold transition-all duration-200 cursor-pointer"
            :class="$route.path.startsWith('/entreprise/revenus') ? 'bg-[#053754] text-white shadow-md' : 'text-gray-600 dark:text-gray-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-[#053754] dark:hover:text-sky-400'"
          >
            <span>Finances & Revenus</span>
          </router-link>

          <router-link 
            to="/entreprise/activites" 
            @click="isMobileMenuOpen = false"
            class="flex items-center px-4 py-3 rounded-2xl text-xs font-extrabold transition-all duration-200 cursor-pointer"
            :class="$route.path.startsWith('/entreprise/activites') ? 'bg-[#053754] text-white shadow-md' : 'text-gray-600 dark:text-gray-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-[#053754] dark:hover:text-sky-400'"
          >
            <span>Journal d'Audit</span>
          </router-link>

          <router-link 
            to="/entreprise/trash" 
            @click="isMobileMenuOpen = false"
            class="flex items-center px-4 py-3 rounded-2xl text-xs font-extrabold transition-all duration-200 cursor-pointer"
            :class="$route.path.startsWith('/entreprise/trash') ? 'bg-[#053754] text-white shadow-md' : 'text-gray-600 dark:text-gray-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-[#053754] dark:hover:text-sky-400'"
          >
            <span>Corbeille (Archives)</span>
          </router-link>

          <router-link 
            to="/entreprise/profile" 
            @click="isMobileMenuOpen = false"
            class="flex items-center px-4 py-3 rounded-2xl text-xs font-extrabold transition-all duration-200 cursor-pointer"
            :class="$route.path.startsWith('/entreprise/profile') ? 'bg-[#053754] text-white shadow-md' : 'text-gray-600 dark:text-gray-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-[#053754] dark:hover:text-sky-400'"
          >
            <span>Profil Entreprise</span>
          </router-link>
        </nav>
      </div>

      <!-- Bottom Sidebar Area -->
      <div class="p-4 border-t border-gray-100 dark:border-slate-800 space-y-3">
        <!-- Return to Client Portal Pill -->
        <router-link to="/client" class="w-full py-2.5 px-3 rounded-xl text-xs font-extrabold text-[#074C72] dark:text-sky-300 bg-[#D8ECF8] dark:bg-sky-950/60 hover:bg-sky-200 dark:hover:bg-sky-900 transition-colors flex items-center justify-center gap-2 cursor-pointer border-l-2 border-[#B50302]">
          <span>➔</span>
          <span>Portail Client</span>
        </router-link>

        <!-- Enterprise Profile Pill -->
        <div class="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
          <div class="flex items-center gap-2.5 overflow-hidden">
            <div class="w-8 h-8 rounded-full bg-[#B50302] text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-xs">
              {{ currentUser?.prenom?.charAt(0) || 'G' }}
            </div>
            <div class="overflow-hidden">
              <p class="text-xs font-bold text-[#053754] dark:text-sky-300 truncate">{{ currentUser?.entreprise?.nom || currentUser?.prenom }}</p>
              <p class="text-[10px] text-gray-500 dark:text-gray-400 truncate">Gérant / Admin</p>
            </div>
          </div>
          <button @click="logout" title="Déconnexion" class="text-gray-400 hover:text-[#B50302] p-1.5 transition cursor-pointer">
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          </button>
        </div>
      </div>
    </aside>

    <!-- Main Right Content Column -->
    <div class="flex-1 min-w-0 flex flex-col min-h-screen">
      
      <!-- Top Mobile & Desktop Navbar -->
      <header class="h-16 bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-800 px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30 shadow-2xs transition-colors duration-300">
        <div class="flex items-center gap-3">
          <button @click="isMobileMenuOpen = !isMobileMenuOpen" class="lg:hidden p-2 rounded-xl bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-slate-700">
            <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          
          <h1 class="font-extrabold text-base sm:text-lg text-[#053754] dark:text-sky-300">
            {{ headerTitle }}
          </h1>
        </div>

        <div class="flex items-center gap-2 sm:gap-3">
          <!-- Status Pill -->
          <span 
            class="hidden sm:inline-block px-3 py-1 rounded-full text-xs font-bold"
            :class="isVerifie ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300' : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'"
          >
            {{ isVerifie ? '✓ Entreprise Vérifiée' : '⏳ En attente de vérification' }}
          </span>

          <!-- Notification Bell -->
          <button
            @click="showNotifModal = true"
            type="button"
            class="w-9 h-9 rounded-full bg-[#F3F4F6] dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 flex items-center justify-center text-gray-600 dark:text-gray-300 relative transition-colors cursor-pointer"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            <span
              v-if="unreadNotifCount > 0"
              class="absolute -top-1 -right-1 bg-[#B50302] text-white text-[10px] font-black rounded-full min-w-4.5 h-4.5 px-1 flex items-center justify-center border-2 border-white dark:border-slate-900"
            >
              {{ unreadNotifCount }}
            </span>
          </button>

          <!-- Theme Toggle -->
          <ThemeToggle variant="pill" />

          <!-- Currency Switcher Pill -->
          <div class="flex items-center gap-1 bg-[#F3F4F6] dark:bg-slate-800 border border-gray-200 dark:border-slate-700 px-2.5 py-1 rounded-full text-xs font-extrabold text-gray-700 dark:text-slate-200">
            <span>💱</span>
            <select
              :value="currentCurrency"
              @change="setCurrency($event.target.value)"
              class="bg-transparent border-none text-xs font-extrabold text-[#053754] dark:text-sky-300 outline-none cursor-pointer p-0"
            >
              <option v-for="c in availableCurrencies" :key="c.code" :value="c.code" class="dark:bg-slate-800 text-slate-800 dark:text-slate-100">
                {{ c.code }}
              </option>
            </select>
          </div>
        </div>
      </header>

      <!-- Dynamic View Container -->
      <main class="flex-1 w-full max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        <router-view />
      </main>

    </div>

    <!-- Modal Notifications -->
    <NotificationModal
      :is-open="showNotifModal"
      @close="showNotifModal = false"
      @refresh-count="loadUnreadCount"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { currentCurrency, availableCurrencies, setCurrency } from '@/utils/currencyState'
import ThemeToggle from '@/components/common/ThemeToggle.vue'
import NotificationModal from '@/components/common/NotificationModal.vue'
import { fetchUnreadNotificationsCount } from '@/services/notificationService'

const router = useRouter()
const route = useRoute()

const currentUser = ref(null)
const isMobileMenuOpen = ref(false)
const showNotifModal = ref(false)
const unreadNotifCount = ref(0)

const isVerifie = computed(() => {
  const ent = currentUser.value?.entreprise
  return ent && ent.statut_verification === 'verifiee' && !!ent.email_verifie_at
})

const headerTitle = computed(() => {
  if (route.path === '/entreprise') return 'Tableau de Bord Entreprise'
  if (route.path.startsWith('/entreprise/agents')) return 'Gestion des Agents GP'
  if (route.path.startsWith('/entreprise/voyages')) return 'Voyages de l\'Entreprise'
  if (route.path.startsWith('/entreprise/discussions')) return 'Supervision des Discussions'
  if (route.path.startsWith('/entreprise/revenus')) return 'Finances & Revenus'
  if (route.path.startsWith('/entreprise/activites')) return 'Journal d\'Audit & Activités'
  if (route.path.startsWith('/entreprise/trash')) return 'Corbeille (Archives)'
  if (route.path.startsWith('/entreprise/profile')) return 'Profil & Conformité Entreprise'
  return 'Espace Entreprise GP'
})

onMounted(() => {
  const userJson = localStorage.getItem('rahma_user')
  if (userJson) {
    try {
      currentUser.value = JSON.parse(userJson)
    } catch (e) {
      console.error(e)
    }
  }

  loadUnreadCount()
})

const loadUnreadCount = async () => {
  try {
    const res = await fetchUnreadNotificationsCount()
    unreadNotifCount.value = Number(res?.unread_count ?? res?.data?.unread_count ?? 0)
  } catch (e) {
    // silencieux
  }
}

const logout = () => {
  localStorage.removeItem('rahma_token')
  localStorage.removeItem('token')
  localStorage.removeItem('rahma_user')
  router.push('/auth/login')
}
</script>
