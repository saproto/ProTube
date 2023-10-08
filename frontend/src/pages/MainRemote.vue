<script setup lang="ts">
import PrimaryLayout from '@/layouts/PrimaryLayout.vue';
import RemoteHeader from '@/components/remote/RemoteHeader.vue';
import { useSearchVideosStore } from '@stores/searchVideosStore';
import { io } from 'socket.io-client';

const videoSearch = useSearchVideosStore();
const socket = io('http://localhost:3000/dev-socket', {
    withCredentials: true,
    extraHeaders: {
        'Access-Control-Allow-Origin': 'http://localhost:3000',
    },
});

socket.on('connect', () => {
    console.log('connected socket');
    setInterval(() => {
        socket.emit('homeevent');
    }, 3000);
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
