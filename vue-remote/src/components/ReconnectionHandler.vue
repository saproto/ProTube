<template>
    <LoadModal v-show="message" :message="message" :opacity="50"  />
</template>
<script setup>
import LoadModal from '@/components/modals/LoadModal'
import { ref, defineProps } from 'vue'
import { useRouter } from 'vue-router'

const message = ref("");
let connectionAttempts = 0;
const router = useRouter();
let stopConnecting = false;

const props = defineProps({
    socket: Object,
    maxAttempts: {
        type: Number,
        default: -1
    }
});

props.socket.on('connect', () => {
    message.value = "";
    connectionAttempts = 0;
});

props.socket.on('connect_error', async (err) => {
    if(stopConnecting) return;
    console.log("disconnect handler errored");
    if(err.message == 'unauthorized') return;
    connectionAttempts++;
    message.value = `Connection attempt ${connectionAttempts} failed.`;
    if(props.maxAttempts < 0 || connectionAttempts < props.maxAttempts) {
        console.log("waiting");
        await new Promise(resolve => { setTimeout(()=> { resolve() }, 1 * 1000 )});
        console.log("attempting connect")
        props.socket.connect();
    }
    else {
        message.value = "Attempted to reconnect but with no success...";
        stopConnecting = true;
        console.log("route v");
        const currentPath = router.currentRoute.value.fullPath;
        router.push({name: "Error", params: { errorcode: 408, routeback: currentPath }});
    }
});

props.socket.on('disconnect', () => {
    console.log("disconnect handler");
    message.value = "Lost connection, attempting to reconnect..";
    // if(connectionAttempts < props.maxAttempts) props.socket.connect();
    props.socket.connect();
    // else message.value = "Attempted to reconnect but with no success...";
});
</script>