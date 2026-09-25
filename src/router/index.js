import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import AuthLayout from '../views/auth/AuthLayout.vue'
import LoginView from '../views/auth/LoginView.vue'
import RegisterView from '../views/auth/RegisterView.vue'
import ProfileView from '../views/auth/ProfileView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'portail',
      component: HomeView,
    },
    {
      path: '/portail',
      redirect: '/',
    },
    {
      path: '/auth',
      component: AuthLayout,
      redirect: '/auth/login',
      meta: { guestOnly: true },
      children: [
        {
          path: 'login',
          name: 'login',
          component: LoginView,
          meta: { guestOnly: true }
        },
        {
          path: 'register',
          name: 'register',
          component: RegisterView,
          meta: { guestOnly: true }
        },
        {
          path: 'register-entreprise',
          redirect: to => ({ name: 'register', query: { type: 'entreprise' } })
        },
        {
          path: 'verify-entreprise-pending',
          name: 'verify-entreprise-pending',
          component: () => import('../views/auth/VerifyEntreprisePendingView.vue')
        },
        {
          path: 'verify-entreprise',
          name: 'verify-entreprise-query',
          component: () => import('../views/auth/VerifyEntrepriseView.vue')
        },
        {
          path: 'verify-entreprise/:token',
          name: 'verify-entreprise',
          component: () => import('../views/auth/VerifyEntrepriseView.vue')
        },
        {
          path: 'verify-voyageur',
          name: 'verify-voyageur-query',
          component: () => import('../views/auth/VerifyVoyageurView.vue')
        },
        {
          path: 'verify-voyageur/:token',
          name: 'verify-voyageur',
          component: () => import('../views/auth/VerifyVoyageurView.vue')
        },
        {
          path: 'register-invite',
          name: 'auth-register-invite',
          component: () => import('../views/auth/AgentRegisterInviteView.vue')
        },
      ],
    },
    {
      path: '/agent/register-invite',
      name: 'agent-register-invite',
      component: () => import('../views/auth/AgentRegisterInviteView.vue')
    },
    {
      path: '/profile',
      name: 'profile',
      component: ProfileView,
      meta: { requiresAuth: true },
    },
    {
      path: '/entreprise',
      component: () => import('../views/entreprise/EntrepriseLayout.vue'),
      meta: { requiresAuth: true, requiresEntreprise: true },
      children: [
        {
          path: '',
          name: 'entreprise-dashboard',
          component: () => import('../views/entreprise/EntrepriseDashboardView.vue')
        },
        {
          path: 'agents',
          name: 'entreprise-agents',
          component: () => import('../views/entreprise/EntrepriseAgentsView.vue')
        },
        {
          path: 'agents/:id',
          name: 'entreprise-agent-detail',
          component: () => import('../views/entreprise/EntrepriseAgentDetailView.vue'),
          meta: { showBack: true }
        },
        {
          path: 'voyages',
          name: 'entreprise-voyages',
          component: () => import('../views/entreprise/EntrepriseVoyagesView.vue')
        },
        {
          path: 'voyages/:id',
          name: 'entreprise-voyage-detail',
          component: () => import('../views/entreprise/EntrepriseVoyageDetailView.vue'),
          meta: { showBack: true }
        },
        {
          path: 'demandes/:id',
          name: 'entreprise-demande-detail',
          component: () => import('../views/entreprise/EntrepriseDemandeDetailView.vue'),
          meta: { showBack: true }
        },
        {
          path: 'reservations/:id',
          redirect: to => ({ name: 'entreprise-demande-detail', params: { id: to.params.id } })
        },
        {
          path: 'discussions',
          name: 'entreprise-discussions',
          component: () => import('../views/entreprise/EntrepriseDiscussionsView.vue')
        },
        {
          path: 'revenus',
          name: 'entreprise-revenus',
          component: () => import('../views/entreprise/EntrepriseRevenusView.vue')
        },
        {
          path: 'activites',
          name: 'entreprise-activites',
          component: () => import('../views/entreprise/EntrepriseActivitesView.vue')
        },
        {
          path: 'trash',
          name: 'entreprise-trash',
          component: () => import('../views/entreprise/EntrepriseTrashView.vue')
        },
        {
          path: 'profile',
          name: 'entreprise-profile',
          component: () => import('../views/entreprise/EntrepriseProfileView.vue')
        }
      ]
    },
    {
      path: '/client',
      component: () => import('../views/client/ClientLayout.vue'),
      children: [
        {
          path: '',
          name: 'client-home',
          component: () => import('../views/client/ClientHomeView.vue')
        },
        {
          path: 'voyage/:id',
          name: 'voyage-detail',
          component: () => import('../views/client/VoyageDetailView.vue')
        },
        {
          path: 'booking/step-1',
          name: 'booking-step-1',
          component: () => import('../views/client/BookingStep1View.vue'),
          meta: { requiresAuth: true }
        },
        {
          path: 'booking/step-2',
          name: 'booking-step-2',
          component: () => import('../views/client/BookingStep2View.vue'),
          meta: { requiresAuth: true }
        },
        {
          path: 'booking/step-3',
          name: 'booking-step-3',
          component: () => import('../views/client/BookingStep3View.vue'),
          meta: { requiresAuth: true }
        },
        {
          path: 'booking/step-4',
          name: 'booking-step-4',
          component: () => import('../views/client/BookingStep4View.vue'),
          meta: { requiresAuth: true }
        },
        {
          path: 'messages',
          name: 'client-messages',
          component: () => import('../views/client/MessagesView.vue'),
          meta: { requiresAuth: true }
        },
        {
          path: 'messages/:id',
          name: 'client-message-detail',
          component: () => import('../views/client/MessageDetailView.vue'),
          meta: { requiresAuth: true }
        },
        {
          path: 'colis',
          name: 'client-colis',
          component: () => import('../views/client/ColisView.vue'),
          meta: { requiresAuth: true }
        },
        {
          path: 'colis/:id',
          name: 'client-colis-detail',
          component: () => import('../views/client/ColisDetailView.vue'),
          meta: { requiresAuth: true, headerTitle: 'Suivi de livraison', headerTitleKey: 'headers.deliveryTracking', headerSubtitle: '#RS-7729' }
        }
      ]
    },
    {
      path: '/voyageur',
      component: () => import('../views/voyageur/VoyageurLayout.vue'),
      meta: { requiresAuth: true, requiresVoyageur: true },
      children: [
        {
          path: '',
          name: 'voyageur-dashboard',
          component: () => import('../views/voyageur/VoyagesView.vue')
        },
        {
          path: 'voyages',
          redirect: '/voyageur'
        },
        {
          path: 'voyages/nouveau',
          name: 'voyageur-create-voyage',
          component: () => import('../views/voyageur/CreateVoyageView.vue'),
          meta: { showBack: true, headerTitle: 'Publier un voyage', headerTitleKey: 'headers.publishTrip' }
        },
        {
          path: 'voyages/:id',
          name: 'voyageur-voyage-detail',
          component: () => import('../views/voyageur/VoyageDetailView.vue'),
          meta: { showBack: true }
        },
        {
          path: 'voyages/:id/edit',
          name: 'voyageur-edit-voyage',
          component: () => import('../views/voyageur/EditVoyageView.vue'),
          meta: { showBack: true, headerTitle: 'Modifier le voyage', headerTitleKey: 'headers.editTrip' }
        },
        {
          path: 'demandes',
          name: 'voyageur-demandes',
          component: () => import('../views/voyageur/DemandesView.vue')
        },
        {
          path: 'demandes/:id',
          name: 'voyageur-demande-detail',
          component: () => import('../views/voyageur/DemandeDetailView.vue'),
          meta: { showBack: true, headerTitle: 'Détails de la demande', headerTitleKey: 'headers.requestDetails' }
        },
        {
          path: 'messages',
          name: 'voyageur-messages',
          component: () => import('../views/voyageur/VoyageurMessagesView.vue')
        },
        {
          path: 'messages/:id',
          name: 'voyageur-message-detail',
          component: () => import('../views/voyageur/VoyageurMessageDetailView.vue')
        },
        {
          path: 'revenus',
          name: 'voyageur-revenus',
          component: () => import('../views/voyageur/RevenusView.vue'),
          meta: { showBack: true, headerTitle: 'Mes Revenus GP', headerTitleKey: 'headers.myRevenues' }
        },
        {
          path: 'evaluations',
          name: 'voyageur-evaluations',
          component: () => import('../views/voyageur/EvaluationsView.vue'),
          meta: { showBack: true, headerTitle: 'Avis & Évaluations', headerTitleKey: 'headers.reviews' }
        }
      ]
    },
    {
      path: '/admin',
      component: () => import('../views/admin/AdminLayout.vue'),
      meta: { requiresAuth: true, requiresAdmin: true },
      children: [
        {
          path: '',
          name: 'admin-dashboard',
          component: () => import('../views/admin/AdminDashboardView.vue')
        },
        {
          path: 'users',
          name: 'admin-users',
          component: () => import('../views/admin/AdminUsersView.vue')
        },
        {
          path: 'users/:id',
          name: 'admin-user-detail',
          component: () => import('../views/admin/AdminUserDetailView.vue')
        },
        {
          path: 'signalements',
          name: 'admin-signalements',
          component: () => import('../views/admin/AdminSignalementsView.vue')
        },
        {
          path: 'partenariats',
          name: 'admin-partenariats',
          component: () => import('../views/admin/AdminPartenariatsView.vue')
        },
        {
          path: 'voyages',
          name: 'admin-voyages',
          component: () => import('../views/admin/AdminVoyagesView.vue')
        },
        {
          path: 'profile',
          name: 'admin-profile',
          component: () => import('../views/admin/AdminProfileView.vue')
        },
        {
          path: 'monitoring',
          name: 'admin-monitoring',
          component: () => import('../views/admin/AdminMonitoringView.vue')
        },
        {
          path: 'monitoring/countries',
          name: 'admin-monitoring-countries',
          component: () => import('../views/admin/AdminMonitoringCountriesView.vue')
        },
        {
          path: 'monitoring/countries/:code',
          name: 'admin-monitoring-country-detail',
          component: () => import('../views/admin/AdminMonitoringCountryDetailView.vue')
        },
        {
          path: 'monitoring/active-users',
          name: 'admin-monitoring-active-users',
          component: () => import('../views/admin/AdminMonitoringActiveUsersView.vue')
        },
        {
          path: 'monitoring/users/:id',
          name: 'admin-monitoring-user-detail',
          component: () => import('../views/admin/AdminMonitoringUserDetailView.vue')
        }
      ]
    },
    {
      path: '/:pathMatch(.*)*',
      redirect: '/client',
    },
  ],
  scrollBehavior(to) {
    if (to.hash) {
      return {
        el: to.hash,
        behavior: 'smooth',
      }
    }
    return { top: 0 }
  },
})

// Navigation Guard for Protected Routes & Role Authorization
import { clearHeaderRoute } from '@/utils/headerState'

router.beforeEach((to, from) => {
  clearHeaderRoute()

  const token = localStorage.getItem('rahma_token') || localStorage.getItem('token')
  let user = null
  try {
    const userStr = localStorage.getItem('rahma_user')
    if (userStr) user = JSON.parse(userStr)
  } catch (err) {
    console.error('Error reading stored user from localStorage:', err)
  }

  const isAuthenticated = !!token && !!user
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth)
  const guestOnly = to.matched.some(record => record.meta.guestOnly)
  const requiresAdmin = to.matched.some(record => record.meta.requiresAdmin)
  const requiresVoyageur = to.matched.some(record => record.meta.requiresVoyageur)
  const requiresEntreprise = to.matched.some(record => record.meta.requiresEntreprise) || to.path.startsWith('/entreprise')

  // Roles helpers
  const isAdmin = user && Array.isArray(user.roles)
    ? user.roles.some(r => typeof r === 'string' ? r === 'admin' : r.name === 'admin')
    : false

  const isVoyageur = user && (
    (Array.isArray(user.roles) && user.roles.some(r => typeof r === 'string' ? r === 'voyageur' : r.name === 'voyageur')) ||
    !!user.voyageur
  )

  const isVoyageurVerifie = isVoyageur && user?.voyageur && user.voyageur.statut === 'verifie' && !!user.voyageur.email_verifie_at

  const isEntrepriseGerant = user && (
    (Array.isArray(user.roles) && user.roles.some(r => typeof r === 'string' ? r === 'gerant_entreprise' : r.name === 'gerant_entreprise')) ||
    !!user.entreprise
  )

  const isEntrepriseVerifiee = isEntrepriseGerant && user?.entreprise && user.entreprise.statut_verification === 'verifiee' && !!user.entreprise.email_verifie_at

  // 1. Unauthenticated users trying to access protected routes
  if (requiresAuth && !isAuthenticated) {
    return { name: 'login', query: { redirect: to.fullPath } }
  }

  const isVerificationRoute = to.path.includes('/verify-entreprise') || to.path.includes('/verify-voyageur')

  // 2. Authenticated users trying to access guest-only routes (login/register)
  if (guestOnly && isAuthenticated && !isVerificationRoute) {
    if (isAdmin) return { name: 'admin-dashboard' }
    if (isEntrepriseVerifiee) return { name: 'entreprise-dashboard' }
    if (isVoyageurVerifie && user?.mode_actuel === 'voyageur') return { name: 'voyageur-dashboard' }
    return { name: 'client-home' }
  }

  // 3. Non-admin users trying to access admin routes
  if (requiresAdmin && !isAdmin) {
    if (isEntrepriseVerifiee) return { name: 'entreprise-dashboard' }
    if (isVoyageurVerifie && user?.mode_actuel === 'voyageur') return { name: 'voyageur-dashboard' }
    return { name: 'client-home' }
  }

  // 4. Non-voyageur or UNVERIFIED voyageur trying to access voyageur routes
  if (to.path.startsWith('/voyageur') || requiresVoyageur) {
    if (!isVoyageur) {
      return { name: 'profile', query: { registerVoyageur: 'true' } }
    }
    if (!isVoyageurVerifie) {
      return { name: 'profile', query: { voyageurUnverified: 'true' } }
    }
  }

  // 5. Non-entreprise or UNVERIFIED entreprise trying to access entreprise workspace routes
  if (requiresEntreprise) {
    if (!isEntrepriseGerant) {
      return { name: 'client-home' }
    }
    // Strict restriction per user directive: If account is not verified, block access to /entreprise/* workspace pages
    if (!isEntrepriseVerifiee) {
      return { name: 'verify-entreprise-pending' }
    }
  }
})

// Tracking des pages vues (analytics maison). Après chaque navigation réussie.
import { trackPageView } from '@/services/trackService'
import { applySeo, ROUTE_SEO } from '@/utils/seo'

router.afterEach((to) => {
  trackPageView(to.fullPath)

  // SEO : pages publiques indexables, zones privées en noindex.
  const publicMeta = ROUTE_SEO[to.name]
  if (publicMeta) {
    applySeo({ ...publicMeta, path: to.path })
  } else {
    applySeo({ path: to.path, noindex: true, title: 'Espace membre' })
  }
})

export default router
