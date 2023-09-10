import { useUserStore } from '@stores/userStore';
import { NavigationGuardWithThis } from 'vue-router';

const adminGuard: NavigationGuardWithThis<undefined> = (to, from) => {
    if (to.name === 'Login') return true;

    const userStore = useUserStore();

    console.log(userStore.user, 'user');
    const isAdmin = false;
    return {
        name: 'Error',
        params: {
            pathMatch: to.path.substring(1).split('/'),
        },
    };
    return false;

    // if (!userStore.initialized && !userStore.initializing) {
    //     userStore.init().then(() => {
    //         console.log('then');
    //         router.push({ name: 'Home' });
    //         return;
    //     });
    //     return { name: 'Login' };
    // }

    // if (!userStore.user.authenticated) return { name: 'Login' };
};

export default adminGuard;
