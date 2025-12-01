import { createRouter, createWebHistory } from 'vue-router'

const routes =  [
    {
      path: '/',
      name: 'home',
      component: () => import('../views/HomeView.vue')
    },
    {
      path: '/winners',
      name: 'winners',
      component: () => import('../views/WinnersView.vue')
    },
    {
      path: '/categories',
      name: 'categories',
      component: () => import('../views/CategoriesView.vue')
    },
    {
      path: '/timeline',
      name: 'timeline',
      component: () => import('../views/TimeLine.vue')
    },
    {
      path: '/movie/:id',
      name: 'movie',
      component: () => import('../views/MovieDetailView.vue')
    },
    {
      path: '/person/:id',
      name: 'person',
      component: () => import('../views/PersonDetailView.vue')
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'not-found',
      component: () => import('../views/NotFound.vue')
    }
  ]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    } else {
      return { 
        top: 0,
        behavior: 'smooth'
      }
    }
  }
})

// Guard para atualizar título da página
router.beforeEach((to, from, next) => {
  document.title = to.meta.title || 'Award Watch'
  next()
})

export default router