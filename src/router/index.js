import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: () => import('@/views/HomeView.vue'),
    meta: {
      title: 'Oscarizados - O Cinema dos Vencedores'
    }
  },
  {
    path: '/winners',
    name: 'Winners',
    component: () => import('@/views/WinnersView.vue'),
    meta: {
      title: 'Vencedores do Oscar - Oscarizados'
    }
  },
  {
    path: '/categories',
    name: 'Categories',
    component: () => import('@/views/CategoriesView.vue'),
    meta: {
      title: 'Categorias do Oscar - Oscarizados'
    }
  },
  {
    path: '/timeline',
    name: 'Timeline',
    component: () => import('@/views/TimeLine.vue'),
    meta: {
      title: 'Linha do Tempo - Oscarizados'
    }
  },
  // Rota 404
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('@/views/NotFound.vue'),
    meta: {
      title: '404 - Página não encontrada'
    }
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
  document.title = to.meta.title || 'Oscarizados - O Cinema dos Vencedores'
  next()
})

export default router