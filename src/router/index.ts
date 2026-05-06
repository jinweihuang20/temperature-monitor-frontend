import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      component: () => import('../layouts/MainLayout.vue'),
      children: [
        {
          path: '',
          name: 'realtime',
          component: () => import('../views/RealtimeView.vue'),
          meta: { title: '即時監控' },
        },
        {
          path: 'history',
          name: 'history',
          component: () => import('../views/HistoryView.vue'),
          meta: { title: '歷史查詢' },
        },
        {
          path: 'alerts',
          name: 'alerts',
          component: () => import('../views/AlertSettingsView.vue'),
          meta: { title: '警戒值設定' },
        },
      ],
    },
  ],
})

router.afterEach((to) => {
  document.title = `Temperature Monitor | ${String(to.meta.title ?? 'Dashboard')}`
})

export default router
