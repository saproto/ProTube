<template>
  <div class="dark:bg-proto_background_gray-dark">
    <!-- empty filler block for the grid -->
    <div class="absolute top-0 mt-2 w-full"></div>

    <div class="dark:text-white">
      <div v-if="photo && !photo.error && photo.url !== ''">
        <div class="flex h-screen justify-center overflow-x-hidden p-5">
          <img
            :src="photo.url"
            class="dark:bg-proto_secondary_gray-dark h-full max-w-none rounded-lg bg-white"
            alt="Loading..." />
        </div>
        <div class="absolute left-0 top-0 ml-4 mt-2 rounded-lg text-lg">
          <div
            class="border-proto_blue dark:bg-proto_secondary_gray-dark rounded-lg border-l-4 bg-white p-1 px-4 py-2 text-gray-900 opacity-80 shadow-lg ring-1 ring-black ring-opacity-5 dark:text-gray-50">
            Album: {{ photo.album_name }}<br />
            Taken on: {{ photo.date_taken }}
          </div>
        </div>
      </div>
    </div>
  </div>

  <ReconnectionHandler
    v-if="screenCode === -1"
    :socket="socket"
    :max-attempts="5" />
</template>

<script setup>
import socket, { connectSocket } from "@/js/ScreenSocket";
import {onBeforeMount, onBeforeUnmount, ref} from "vue";
import ReconnectionHandler from "../components/ReconnectionHandler.vue";

const screenCode = ref("0000");
socket.on("new-screen-code", (newCode) => {
  screenCode.value = newCode;
});

onBeforeMount(() => {
  connectSocket();
});

onBeforeUnmount(() => {
  socket.disconnect();
});

const photo = ref({
  url: "",
  album_name: "",
  date_taken: 0,
});

socket.on("photo-update", (newPhoto) => {
  photo.value = newPhoto;
});
</script>
