<script setup lang="ts">
import classicLogo from '@/assets/logo_classic.png';
import BlueButton from '@components/BlueButton.vue';
import { useUserStore } from '@stores/userStore';
defineProps({
    screen: {
        type: Boolean,
        default: false,
    },
    adminScreen: {
        type: Boolean,
        default: false,
    },
    statistics: {
        type: Boolean,
        default: false,
    },
    remote: {
        type: Boolean,
        default: false,
    },
    soundboard: {
        type: Boolean,
        default: false,
    },
    openedMenu: {
        type: Boolean,
        default: false,
    },
});

const userStore = useUserStore();
</script>

<template>
    <div :class="{ 'md:block hidden': !openedMenu }" class="display-block mr-6 ml-2 mt-auto shrink-0 justify-center">
        <div class="my-2 text-2xl text-white">Welcome {{ userStore.user.name }}!</div>
        <div class="grid grid-cols-2 gap-2 sm:grid-cols-4 md:grid-cols-2 xl:grid-cols-4">
            <router-link v-if="adminScreen" :to="{ name: 'Admin' }">
                <BlueButton> Admin screen </BlueButton>
            </router-link>
        </div>
    </div>
    <div class="my-auto mr-6 hidden shrink-0 lg:block">
        <img class="w-30 mx-auto h-0 shrink-0 object-cover md:h-32" :src="classicLogo" />
    </div>
</template>
