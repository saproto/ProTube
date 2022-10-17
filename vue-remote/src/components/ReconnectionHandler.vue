<template>
    <LoadModal v-show="message" :message="message" :opacity="50"  />
</template>
<script setup>
import LoadModal from '@/components/modals/LoadModal'
import { ref, defineProps } from 'vue'

const message = ref("");
let connectionAttempts = 0;

const props = defineProps({
    socket: Object
});

props.socket.on('connect', () => {
    message.value = "";
    connectionAttempts = 0;
});

props.socket.on('connect_error', (err) => {
    console.log("disconnect handler errored");
    if(err.message == 'unauthorized') return;
    connectionAttempts++;
    message.value = `Connection attempt ${connectionAttempts} failed.`;
    if(connectionAttempts < 5) setTimeout(()=> {
        props.socket.connect();
    }, 1000);
    else message.value = "Attempted to reconnect but with no success...";
});

props.socket.on('disconnect', () => {
    console.log("disconnect handler");
    message.value = "Lost connection, attempting to reconnect..";
    if(connectionAttempts < 5) props.socket.connect();
    else message.value = "Attempted to reconnect but with no success...";
});
</script>