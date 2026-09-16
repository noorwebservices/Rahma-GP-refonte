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
      children: [
        {
          path: 'login',
          name: 'login',
          component: LoginView,
        },
        {
          path: 'register',
          name: 'register',
          component: RegisterView,
        },
      ],
    },
    {
      path: '/profile',
      name: 'profile',
      component: ProfileView,
      meta: { requiresAuth: true },
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
          meta: { requiresAuth: true, headerTitle: 'Suivi de livraison', headerSubtitle: '#RS-7729' }
        }
      ]
    },
    {
      path: '/voyageur',
      component: () => import('../views/voyageur/VoyageurLayout.vue'),
      meta: { requiresAuth: true },
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
          meta: { showBack: true, headerTitle: 'Publier un voyage' }
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
          meta: { showBack: true, headerTitle: 'Modifier le voyage' }
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
          meta: { showBack: true, headerTitle: 'Détails de la demande' }
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
          meta: { showBack: true, headerTitle: 'Mes Revenus GP' }
        },
        {
          path: 'evaluations',
          name: 'voyageur-evaluations',
          component: () => import('../views/voyageur/EvaluationsView.vue'),
          meta: { showBack: true, headerTitle: 'Avis & Évaluations' }
        }
      ]
    },
    {
      path: '/admin',
      component: () => import('../views/admin/AdminLayout.vue'),
      meta: { requiresAuth: true },
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

// Navigation Guard for Protected Routes
import { clearHeaderRoute } from '@/utils/headerState'

router.beforeEach((to, from) => {
  clearHeaderRoute()
  const token = localStorage.getItem('rahma_token') || localStorage.getItem('token')
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth)

  if (requiresAuth && !token) {
    return { name: 'login' }
  }
})

export default router
