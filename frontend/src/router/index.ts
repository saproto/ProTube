import { createRouter, createWebHistory } from 'vue-router';
import HomePage from '@/pages/HomePage.vue';
import LoginPage from '@/pages/LoginPage.vue';
import PrimaryLayout from '@/layouts/PrimaryLayout.vue';
import { useUserStore } from '@stores/userStore';

const routes = [
    {
        path: '/',
        component: PrimaryLayout,
        children: [
            {
                path: '',
                name: 'Home',
                component: HomePage,
            },
            {
                path: 'login',
                name: 'Login',
                component: LoginPage,
            },
        ],
    },
];

const router = createRouter({
    history: createWebHistory(),
    routes,
});

router.beforeEach(async (to, from) => {
    // Prevent infinite loops
    if (to.name === 'Login') return true;

    const userStore = useUserStore();

    if (!userStore.initialized && !userStore.initializing) {
        userStore.init().then(() => {
            console.log('then');
            router.push({ name: 'Home' });
        });
        return { name: 'Login' };
    }

    if (!userStore.user.authenticated) return { name: 'Login' };
});

export default router;
