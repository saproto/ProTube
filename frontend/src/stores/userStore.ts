import axios from 'axios';
import { defineStore } from 'pinia';
import { ref } from 'vue';
// import { useAxios } from '@vueuse/integrations/useAxios';

export const useUserStore = defineStore('user', () => {
    // axios.defaults.headers.get['Access-Control-Allow-Origin'] = '*';
    const user = ref({
        name: 'unknown',
        authenticated: false,
    });

    // const { data, isFinished } = useAxios('/api/user');

    let hasFetchedData = false;
    const initialized = ref(false);
    const initializing = ref(false);

    async function init(): Promise<void> {
        if (hasFetchedData || initializing.value) return;
        await fetchAndUpdateUser();
    }

    async function fetchAndUpdateUser(): Promise<void> {
        initializing.value = true;
        const response = (await axios.get('api/user')).data;
        console.log(response);
        // if (!response.success) return;

        await new Promise((resolve) => setTimeout(resolve, 500));

        console.log('user fetched');
        // user.value = rexport type first = {second}esponse.data as userInfo;
        const data = response as http.user;
        user.value.authenticated = true;
        hasFetchedData = true;
        initialized.value = true;
        user.value.name = data.name;
        initializing.value = false;
        return;
    }

    return { user, init, initialized, initializing };
});
