<template>
  <LoadModal v-show="message" :message="message" />
</template>
<script setup>
import LoadModal from "@/components/modals/LoadModal";
import { ref } from "vue";
import { useRouter } from "vue-router";

const message = ref("");
let connectionAttempts = 0;
const router = useRouter();
let stopConnecting = false;
const connectionDelayS = 5;

const props = defineProps({
  socket: Object,
  maxAttempts: {
    type: Number,
    default: -1,
  },
});

props.socket.on("connect", () => {
  message.value = "";
  connectionAttempts = 0;
});

props.socket.on("connect_error", async (err) => {
  if (stopConnecting) return;
  if (err.message == "unauthorized")
    return router.push({ name: "Error", params: { errorcode: 401 } });
  connectionAttempts++;
  message.value = `Connection attempt ${connectionAttempts} failed.`;
  if (props.maxAttempts < 0 || connectionAttempts < props.maxAttempts) {
    await new Promise((resolve) => {
      setTimeout(() => {
        resolve();
      }, connectionDelayS * 1000);
    });
    props.socket.connect();
  } else {
    message.value = "Attempted to reconnect but with no success...";
    stopConnecting = true;
    const currentPath = router.currentRoute.value.fullPath;
    router.push({
      name: "Error",
      params: { errorcode: 408, routeback: currentPath },
    });
  }
});

props.socket.on("disconnect", (reason) => {
  // Don't try to reconnect on manual disconnects (called on OnBeforeUnmounts)
  if (reason === "io client disconnect") return;
  message.value = "Lost connection, attempting to reconnect..";
  props.socket.connect();
});
</script>
