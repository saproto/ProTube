import { createRouter, createWebHistory } from 'vue-router';
import MainRemote from '@/pages/MainRemote.vue';
import LoginPage from '@/pages/LoginPage.vue';
import BaseLayout from '@/layouts/BaseLayout.vue';
import authenticationGuard from './authenticationGuard';
import adminGuard from './adminGuard';
import AdminPage from '@/pages/AdminPage.vue';
import ErrorPage from '@/pages/ErrorPage.vue';

const routes = [
    {
        path: '/',
        component: BaseLayout,
        beforeEnter: authenticationGuard,
        children: [
            {
                path: '',
                name: 'Remote',
                component: MainRemote,
            },
            {
                path: 'admin',
                name: 'Admin',
                component: AdminPage,
                beforeEnter: adminGuard,
            },
        ],
    },
    {
        path: '/login',
        name: 'Login',
        component: LoginPage,
    },
    {
        path: '/:pathMatch(.*)*',
        name: 'Error',
        component: ErrorPage,
    },
];

const router = createRouter({
    history: createWebHistory(),
    routes,
});

// router.beforeEach(guard);

export default router;
