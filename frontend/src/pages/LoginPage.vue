<script setup lang="ts">
import LoadingLogo from '@components/LoadingLogo.vue';
import router from '@router/index';
import { useUserStore } from '@stores/userStore';

const userStore = useUserStore();

userStore.userIsAuthenticated.then(() => {
    router.push({ name: 'Remote' });
    return;
});
</script>

<template>
    <div class="flex h-screen bg-primary">
        <LoadingLogo class="center m-auto text-4xl w-72 text-white">Logging in... </LoadingLogo>
    </div>
</template>
