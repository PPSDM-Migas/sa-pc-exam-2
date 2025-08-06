import {createRouter, createWebHashHistory, createWebHistory} from 'vue-router'
import HomeView from '../views/Welcome.vue'

const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView
    },
    {
      path: '/pre-exam',
      name: 'login',
      component: () => import('../views/CameraLogin.vue')
    },
    {
      path: '/exam',
      name: 'ujian',
      component: () => import('../views/ExamRoom.vue')
      // component: () => import('../views/Welcome.vue')
    },
    {
      path: '/post-exam/:sid/:pid',
      name: 'eval',
      props: true,
      // component: () => import('../views/Exam/PostExam.vue')
      component: () => import('../views/Welcome.vue')
    }
  ]
})

export default router
