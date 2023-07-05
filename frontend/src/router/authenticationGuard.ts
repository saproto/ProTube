import { useUserStore } from '@stores/userStore';
import { NavigationGuardWithThis } from 'vue-router';
import router from '.';

const authenticationGuard: NavigationGuardWithThis<undefined> = (to, from) => {
    if (to.name === 'Login') return true;

    const userStore = useUserStore();

    if (!userStore.initialized && !userStore.initializing) {
        userStore.init().then(() => {
            console.log('then');
            router.push(to);
            return;
        });
        return { name: 'Login' };
    }

    if (!userStore.user.authenticated) return { name: 'Login' };
};

export default authenticationGuard;
