<template>
    <ProtubeScreen :volume="volume" :screenCode="screenCode" />
    <ReconnectionHandler :socket="socket"/>
</template>

<script setup>
import ProtubeScreen from '@/views/ProtubeScreen.vue'
import ReconnectionHandler from '@/components/ReconnectionHandler'
import socket, { connectSocket } from '@/js-2/AdminScreenSocket'
import { onBeforeUnmount, onBeforeMount, ref } from 'vue'

const screenCode = ref('0000');
const volume = ref(50);

onBeforeMount(async () => {
    connectSocket();
});

onBeforeUnmount(() => {
    socket.disconnect();
});

socket.on('volume-update', (newVolume) => {
    volume.value = newVolume;
});

socket.on('get-volume-code', (newData) => {
    screenCode.value = newData.screencode;
    volume.value = newData.volume;
});

socket.on('new-screen-code', (newCode) => {
    screenCode.value = newCode;
});

// soundboardddd

</script>