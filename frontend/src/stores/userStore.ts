import axios from 'axios';
import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useUserStore = defineStore('user', () => {
    const user = ref({
        name: 'unknown',
        authenticated: false,
    });

    let hasFetchedData = false;
    const initialized = ref(false);
    const initializing = ref(false);

    async function init(): Promise<void> {
        if (hasFetchedData || initializing.value) return;
        await fetchAndUpdateUser();
    }

    async function fetchAndUpdateUser(): Promise<void> {
        initializing.value = true;
        // const response = (await axios.get('https://unimatrix52.nl/api/user')).data;
        // console.log(response);
        // if (!response.success) return;

        await new Promise((resolve) => setTimeout(resolve, 500));

        // user.value = response.data as userInfo;
        user.value.authenticated = true;
        hasFetchedData = true;
        initialized.value = true;
        return;
    }

    return { user, init, initialized, initializing };
});
