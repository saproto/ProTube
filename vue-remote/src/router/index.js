import { createRouter, createWebHistory } from 'vue-router'
import Remote from '@/views/Remote.vue'
import AdminRemote from '@/views/AdminRemote.vue'
import ProtubeScreen from '@/views/ProtubeScreen.vue'
import AdminProtubeScreen from '@/views/AdminProtubeScreen.vue'
import ErrorPage from '@/views/ErrorPage.vue'
import LoginPage from '@/views/LoginPage.vue'
import TestAuth from '@/views/TestAuth.vue'
// import ExpiredSession from '@/views/ExpiredSession.vue'
// import { socketDetails } from '@/js/authenticator'

const routes = [
  {
    path: '/',
    redirect: '/remote',
  },
  {
    path: '/login',
    name: 'Login',
    component: LoginPage,
    // props: route => ({
    //   targetPath: String(route.params.targetPath || "Remote"),
    //   requests_admin: route.params.requests_admin === 'true'
    // }),
    meta: {
      transition: 'fade'
    }
  },
  {
    path: '/remote',
    name: 'Remote',
    component: Remote,

  },
  {
    path: '/test',
    name: 'Test',
    component: TestAuth,
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
  history: createWebHistory(process.env.VUE_APP_PUBLIC_PATH),
  routes
})

// // authentication middleware
// router.beforeEach((to, from, next) => {

//   let socketdetails = socketDetails();
//   // prevent login route looping
//   if(to.name == 'Login' || to.name == 'Error' || to.name == 'Test') return next();
//   // user is authenticated for the requested path
//   if(   (to.meta.adminAuth && socketdetails.admin_socket.connected) 
//     ||  (to.meta.auth && socketdetails.user_socket.connected)) return next();
 
//   // requested path is admin and the user had no admin socket
//   else if(to.meta.adminAuth || to.meta.auth){
//     return next({ name: 'Login' , params: {
//       targetPath: to.name,
//       requests_admin: to.meta.adminAuth
//     }});
//   }
//   // Default to 404 error
//   return next({ name: 'Error', params: { 'errorCode': 404 }});
// });

export default router