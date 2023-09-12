<script setup lang="ts">
import PrimaryLayout from '@/layouts/PrimaryLayout.vue';
import RemoteHeader from '@/components/remote/RemoteHeader.vue';
import { useSearchVideosStore } from '@stores/searchVideosStore';
import { io } from 'socket.io-client';

const videoSearch = useSearchVideosStore();
const socket = io('localhost:3005/socket', {
    withCredentials: true,
});

socket.on('connect', () => {
    console.log('connected socket');
});
</script>

<template>
    <PrimaryLayout>
        <template #header>
            <RemoteHeader />
        </template>
        <template #body> Body {{ videoSearch.status.isLoading }}</template>
        <template #sidebar> Sidebar </template>
    </PrimaryLayout>
</template>
