import route from '@/utils/routeHelper';
import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useUserStore = defineStore('user', () => {
    let userFetched: (value: boolean | PromiseLike<boolean>) => void;

    const user = ref({
        name: 'unknown',
        authenticated: false,
        admin: false,
    });

    const userIsAuthenticated = new Promise((resolve) => {
        userFetched = resolve;
    });

    fetch(route('http.user'), {
        redirect: 'manual',
    }).then(async (response) => {
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
    });

    return { userIsAuthenticated, user };
});
