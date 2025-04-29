import route from '@/utils/routeHelper';
import { defineStore } from 'pinia';
import { ref } from 'vue';
import router from '@router/index';

export const useUserStore = defineStore('user', () => {
    let userFetched: (value: boolean | PromiseLike<boolean>) => void;
    let userRejected: (reason?: any) => void;

    const user = ref({
        name: 'unknown',
        authenticated: false,
        admin: false,
    });

    const userIsAuthenticated = new Promise((resolve, reject) => {
        userFetched = resolve;
        userRejected = reject;
    });

    login();

    function login() {
        fetch(route('http.user'), {
            redirect: 'manual',
        })
            .then(async (response) => {
                console.log('logging in...');
                console.log(response);
                if (response.type === 'opaqueredirect') {
                    window.location.href = '/auth/login';
                    return;
                } else {
                    const data = (await response.json()) as http.user;
                    user.value.authenticated = true;
                    user.value.name = data.name;
                    user.value.admin = data.admin;
                    console.log('logged in');
                    console.log(user.value);
                    userFetched(true);
                }
            })
            .catch(() => {
                console.log('login error');
                router.push({ name: 'Error' });
                userRejected(new Error('Unable to login'));
            });
    }

    /**
     * Slow login becuase otherwise our login is instant again,
     * so if it fails it doesn't fail instant
     */
    function slowLogin() {
        setTimeout(() => {
            login();
        }, 500);
    }

    return { userIsAuthenticated, user, slowLogin };
});
