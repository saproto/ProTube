import { useUserStore } from '@stores/userStore';
import { NavigationGuardWithThis } from 'vue-router';

const authenticationGuard: NavigationGuardWithThis<undefined> = (to, from) => {
    if (to.name === 'Login') return true;

    const userStore = useUserStore();
    if (userStore.user.authenticated) return true;

    return { name: 'Login' };
};

export default authenticationGuard;
