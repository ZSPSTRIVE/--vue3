import { createRouter, createWebHistory,createWebHashHistory } from 'vue-router'

const router = createRouter({
  history: createWebHashHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'mood',
      component: () => import('@/components/Mood.vue'),
      // meta: { requiresAuth: true }
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('@/views/Login.vue'),
      // meta: { requiresAuth: false }
    },
    {
      path: '/analysis',
      name: 'analysis',
      component: () => import('@/components/Analysis.vue'),
      // meta: { requiresAuth: true }
    },
    {
      path: '/myinfo',
      name: 'myinfo',
      component: () => import('@/components/MyInfo.vue'),
      // meta: { requiresAuth: true }
    }
  ]
})

// 添加路由守卫
router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('token')
  
  if (to.meta.requiresAuth && !token) {
    next('/login')
  } else if (to.path === '/login' && token) {
    next('/')
  } else {
    next()
  }
})

export default router
