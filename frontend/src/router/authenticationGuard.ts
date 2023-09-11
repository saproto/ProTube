import { useUserStore } from '@stores/userStore';
import { NavigationGuardWithThis } from 'vue-router';
import router from '.';

const authenticationGuard: NavigationGuardWithThis<undefined> = (to, from) => {
    if (to.name === 'Login') return true;

    const userStore = useUserStore();
    // console.log(from.name, to.name, userStore.user, 'logged out?');

    if (!userStore.initialized && !userStore.initializing) {
        userStore.init().then(() => {
            console.log(to.name, 'then init');
            router.push(to);
            return;
        });
        return { name: 'Login' };
    }

    if (!userStore.user.authenticated) return { name: 'Login' };
    // return true;
};

export default authenticationGuard;
