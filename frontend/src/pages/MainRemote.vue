<script setup lang="ts">
import PrimaryLayout from '@/layouts/PrimaryLayout.vue';
import RemoteHeader from '@/components/remote/RemoteHeader.vue';
// import { useSearchVideosStore } from '@stores/searchVideosStore';
import { io } from 'socket.io-client';
import ResultsWrapper from '@components/remote/ResultsWrapper.vue';
import { emit, onEvent } from '@/utils/socketHelper';

// const videoSearch = useSearchVideosStore();
const socket = io('http://localhost:3000/dev-socket', {
    withCredentials: true,
    extraHeaders: {
        'Access-Control-Allow-Origin': 'http://localhost:3000',
    },
});

socket.on('connect', () => {
    console.log('connected socket');
    window.socket = socket;
    setInterval(() => {
        socket.emit('homeevent');
    }, 3000);

    emit(socket, 'socket.devsocket.testRoute', undefined, (data) => {
        console.log('testRoute', data);
    });
    // console.log('socket', socket);
    // socket.emit('testRoute');
});

onEvent(socket, 'socket.devsocket.queueUpdate', (q) => {
    console.log('queueUpdate', q);
});
</script>

<template>
    <PrimaryLayout>
        <template #header>
            <RemoteHeader />
        </template>
        <template #body>
            <ResultsWrapper />
        </template>
        <template #sidebar> Sidebar </template>
    </PrimaryLayout>
</template>
