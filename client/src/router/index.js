import { createRouter, createWebHistory } from 'vue-router'
import MainRemote from '@/views/MainRemote.vue'
import AdminRemote from '@/views/AdminRemote.vue'
import ProtubeScreen from '@/views/ProtubeScreen.vue'
import AdminProtubeScreen from '@/views/AdminProtubeScreen.vue'
import ErrorPage from '@/views/ErrorPage.vue'
import LoginPage from '@/views/LoginPage.vue'
import LocalClientProtubeScreen from '@/views/LocalClientProtubeScreen.vue'

const routes = [
  {
    path: '/',
    redirect: '/remote',
  },
  {
    path: '/login',
    name: 'Login',
    component: LoginPage,
    meta: {
      transition: 'fade'
    }
  },
  {
    path: '/remote',
    name: 'Remote',
    component: MainRemote,

  },
  {
    path: '/remote/admin',
    name: 'Admin Remote',
    component: AdminRemote,
  },
  {
    path: '/screen',
    name: 'Screen',
    component: ProtubeScreen,
  },
  {
    path: '/screen/admin',
    name: 'Admin Screen',
    component: AdminProtubeScreen,
  },
  {
    path: '/screen/local',
    name: 'Local Admin Screen',
    component: LocalClientProtubeScreen,
  },
  {
    path: '/error',
    name: "Error",
    component: ErrorPage,
    props: true
  },
  { 
    path: '/:pathMatch(.*)*', 
    redirect: {
      name: 'Error',
      params: {
        errorcode: 404
      }
    }
  }

]
const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router