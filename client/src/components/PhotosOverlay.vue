<template>
    <div v-if="photo && !photo.error && photo.url !== ''">
        <div class="flex h-screen justify-center overflow-x-hidden p-5">
            <img
            :src="photo.url"
            class="dark:bg-proto_secondary_gray-dark -z-10 h-full max-w-none rounded-lg bg-white"
            alt="Loading..." />
        </div>
        <div class="absolute top-0 left-0 mt-2 ml-4 rounded-lg text-lg">
            <div
            class="border-proto_blue dark:bg-proto_secondary_gray-dark rounded-lg border-l-4 bg-white p-1 px-4 py-2 text-gray-900 opacity-80 shadow-lg ring-1 ring-black ring-opacity-5 dark:text-gray-50">
            Album: {{ photo.album_name }}<br />
            Taken on: {{ photo.date_taken }}
            </div>
        </div>
    </div>
</template>

<script setup>
import socket from "@/js/ScreenSocket";
import { ref, onMounted } from "vue";

onMounted(async () => {
    photo.value = await new Promise((resolve) => {
        socket.emit("get-photo", (result) => {
            resolve(result);
        });
    });
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