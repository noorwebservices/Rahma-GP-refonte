<template>
  <div class="min-h-screen bg-[#FAF7F2] dark:bg-slate-950 font-sans flex text-gray-800 dark:text-slate-100 selection:bg-[#B50302] selection:text-white transition-colors duration-300">
    
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
          <router-link to="/admin" class="flex items-center">
            <img src="@/assets/images/logo-rouge.svg" alt="Rahma Delivery" class="h-9 w-auto object-contain" />
          </router-link>
          
          <button @click="isMobileMenuOpen = false" class="lg:hidden text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 p-1">
            ✕
          </button>
        </div>

        <!-- Sidebar Navigation Menu -->
        <nav class="p-4 space-y-1.5">
          <router-link 
            to="/admin" 
            exact
            @click="isMobileMenuOpen = false"
            class="flex items-center px-4 py-3 rounded-2xl text-xs font-extrabold transition-all duration-200 cursor-pointer"
            :class="$route.path === '/admin' ? 'bg-[#053754] text-white shadow-md' : 'text-gray-600 dark:text-gray-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-[#053754] dark:hover:text-sky-400'"
          >
            <span>Tableau de bord</span>
          </router-link>

          <router-link 
            to="/admin/users" 
            @click="isMobileMenuOpen = false"
            class="flex items-center px-4 py-3 rounded-2xl text-xs font-extrabold transition-all duration-200 cursor-pointer"
            :class="$route.path.startsWith('/admin/users') ? 'bg-[#053754] text-white shadow-md' : 'text-gray-600 dark:text-gray-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-[#053754] dark:hover:text-sky-400'"
          >
            <span>Utilisateurs</span>
          </router-link>

          <router-link 
            to="/admin/signalements" 
            @click="isMobileMenuOpen = false"
            class="flex items-center justify-between px-4 py-3 rounded-2xl text-xs font-extrabold transition-all duration-200 cursor-pointer"
            :class="$route.path.startsWith('/admin/signalements') ? 'bg-[#053754] text-white shadow-md' : 'text-gray-600 dark:text-gray-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-[#053754] dark:hover:text-sky-400'"
          >
            <span>Signalements</span>
            <span v-if="stats.signalements > 0" class="px-2 py-0.5 text-[10px] font-black rounded-full" :class="$route.path.startsWith('/admin/signalements') ? 'bg-[#B50302] text-white' : 'bg-red-100 text-[#B50302]'">
              {{ stats.signalements }}
            </span>
          </router-link>

          <router-link 
            to="/admin/partenariats" 
            @click="isMobileMenuOpen = false"
            class="flex items-center justify-between px-4 py-3 rounded-2xl text-xs font-extrabold transition-all duration-200 cursor-pointer"
            :class="$route.path.startsWith('/admin/partenariats') ? 'bg-[#053754] text-white shadow-md' : 'text-gray-600 dark:text-gray-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-[#053754] dark:hover:text-sky-400'"
          >
            <span>Partenariats</span>
            <span v-if="stats.partenariats > 0" class="px-2 py-0.5 text-[10px] font-black rounded-full" :class="$route.path.startsWith('/admin/partenariats') ? 'bg-amber-500 text-white' : 'bg-amber-100 text-amber-800'">
              {{ stats.partenariats }}
            </span>
          </router-link>

          <router-link 
            to="/admin/voyages" 
            @click="isMobileMenuOpen = false"
            class="flex items-center px-4 py-3 rounded-2xl text-xs font-extrabold transition-all duration-200 cursor-pointer"
            :class="$route.path.startsWith('/admin/voyages') ? 'bg-[#053754] text-white shadow-md' : 'text-gray-600 dark:text-gray-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-[#053754] dark:hover:text-sky-400'"
          >
            <span>Voyages & Stockage BD</span>
          </router-link>

          <router-link
            to="/admin/monitoring"
            @click="isMobileMenuOpen = false"
            class="flex items-center px-4 py-3 rounded-2xl text-xs font-extrabold transition-all duration-200 cursor-pointer"
            :class="$route.path.startsWith('/admin/monitoring') ? 'bg-[#053754] text-white shadow-md' : 'text-gray-600 dark:text-gray-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-[#053754] dark:hover:text-sky-400'"
          >
            <span>Supervision & Monitoring</span>
          </router-link>

          <router-link
            to="/admin/profile"
            @click="isMobileMenuOpen = false"
            class="flex items-center px-4 py-3 rounded-2xl text-xs font-extrabold transition-all duration-200 cursor-pointer"
            :class="$route.path.startsWith('/admin/profile') ? 'bg-[#053754] text-white shadow-md' : 'text-gray-600 dark:text-gray-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-[#053754] dark:hover:text-sky-400'"
          >
            <span>Mon Profil Admin</span>
          </router-link>
        </nav>
      </div>

      <!-- Bottom Sidebar Area -->
      <div class="p-4 border-t border-gray-100 dark:border-slate-800 space-y-3">
        <!-- Return to Portal Pill -->
        <router-link to="/client" class="w-full py-2.5 px-3 rounded-xl text-xs font-extrabold text-[#074C72] dark:text-sky-300 bg-[#D8ECF8] dark:bg-sky-950/60 hover:bg-sky-200 dark:hover:bg-sky-900 transition-colors flex items-center justify-center gap-2 cursor-pointer">
          <span>➔</span>
          <span>Portail Client</span>
        </router-link>

        <!-- User Profile Pill -->
        <div class="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
          <div class="flex items-center gap-2.5 overflow-hidden">
            <div class="w-8 h-8 rounded-full bg-[#053754] text-white font-bold text-xs flex items-center justify-center shrink-0">
              {{ currentUser?.prenom?.charAt(0) || 'A' }}
            </div>
            <div class="overflow-hidden">
              <p class="text-xs font-bold text-[#053754] dark:text-sky-300 truncate">{{ currentUser?.prenom }} {{ currentUser?.nom }}</p>
              <p class="text-[10px] text-gray-500 dark:text-gray-400 truncate">Administrateur</p>
            </div>
          </div>
          <button @click="logout" title="Déconnexion" class="text-gray-400 hover:text-[#B50302] p-1.5 transition">
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

          <!-- Language Switcher Pill -->
          <div class="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#F3F4F6] dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-xs font-extrabold text-gray-700 dark:text-slate-200">
            <span class="w-4 h-4 rounded-full overflow-hidden flex items-center justify-center text-[10px] shrink-0">🇫🇷</span>
            <span>FR</span>
          </div>
        </div>
      </header>

      <!-- Dynamic View Container -->
      <main class="flex-1 w-full max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        <router-view />
      </main>

    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { adminService } from '@/services/adminService'
import { currentCurrency, availableCurrencies, setCurrency } from '@/utils/currencyState'
import ThemeToggle from '@/components/common/ThemeToggle.vue'

const router = useRouter()
const route = useRoute()

const currentUser = ref(null)
const isMobileMenuOpen = ref(false)
const stats = ref({
  signalements: 0,
  partenariats: 0
})

const headerTitle = computed(() => {
  if (route.path === '/admin') return 'Tableau de Bord'
  if (route.path.startsWith('/admin/users')) return 'Gestion des Utilisateurs'
  if (route.path.startsWith('/admin/signalements')) return 'Signalements de Comptes'
  if (route.path.startsWith('/admin/partenariats')) return 'Demandes de Partenariat'
  if (route.path.startsWith('/admin/voyages')) return 'Voyages & Stockage BD'
  if (route.path.startsWith('/admin/monitoring')) return 'Supervision & Monitoring'
  if (route.path.startsWith('/admin/profile')) return 'Profil Administrateur'
  return 'Administration Rahma GP'
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

  fetchQuickStats()
})

const fetchQuickStats = async () => {
  try {
    const res = await adminService.getDashboardStats()
    if (res && res.data) {
      stats.value.signalements = res.data.signalements?.en_attente || 0
      stats.value.partenariats = res.data.partenariats?.en_attente || 0
    }
  } catch (e) {
    console.error('Quick stats fetch error:', e)
  }
}

const logout = () => {
  localStorage.removeItem('rahma_token')
  localStorage.removeItem('token')
  localStorage.removeItem('rahma_user')
  router.push('/auth/login')
}
</script>
