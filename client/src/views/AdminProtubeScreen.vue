<template>
  <ProtubeScreen :volume="volume" :screenCode="screenCode" />
  <ReconnectionHandler :socket="socket" />
</template>

<script setup>
import ProtubeScreen from "@/views/ProtubeScreen.vue";
import ReconnectionHandler from "@/components/ReconnectionHandler";
import socket, { connectSocket } from "@/js/AdminScreenSocket";
import { onBeforeUnmount, onBeforeMount, ref } from "vue";
import { useRouter } from "vue-router";

const router = useRouter();
const screenCode = ref("0000");
const volume = ref(50);

onBeforeMount(async () => {
  const response = await fetch("/api/user");
  if (response.redirected) return (window.location.href = response.url);
  const data = await response.json();
  if (data.admin) connectSocket();
  else router.push({ name: "Error", params: { errorcode: 401 } });
});

onBeforeUnmount(() => {
  socket.disconnect();
});

socket.on("volume-update", (newVolume) => {
  volume.value = newVolume;
});

socket.on("get-volume-code", (newData) => {
  screenCode.value = newData.screencode;
  volume.value = newData.volume;
});

socket.on("new-screen-code", (newCode) => {
  screenCode.value = newCode;
});
</script>
