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
      redirect: '/client',
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
          component: () => import('../views/client/BookingStep1View.vue')
        },
        {
          path: 'booking/step-2',
          name: 'booking-step-2',
          component: () => import('../views/client/BookingStep2View.vue')
        },
        {
          path: 'booking/step-3',
          name: 'booking-step-3',
          component: () => import('../views/client/BookingStep3View.vue')
        },
        {
          path: 'messages',
          name: 'client-messages',
          component: () => import('../views/client/MessagesView.vue')
        },
        {
          path: 'colis',
          name: 'client-colis',
          component: () => import('../views/client/ColisView.vue')
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
router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('rahma_token') || localStorage.getItem('token')
  if (to.meta.requiresAuth && !token) {
    next({ name: 'login' })
  } else {
    next()
  }
})

export default router
