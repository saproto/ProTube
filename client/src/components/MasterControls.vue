<template>
  <ContentField>
    <h3 class="h-full text-2xl text-gray-600 dark:text-white">
      Master controls
    </h3>
    <div class="md:flex">
      <div class="mx-auto w-full text-center lg:w-2/3">
        <span
          class="w-full text-right text-lg text-gray-500 dark:text-white md:text-center">
          Volume - {{ playerSettings.volume }}
        </span>
        <input
          @change="volumeChange"
          class="bg-proto_blue hover:bg-proto_blue/80 h-2 w-full appearance-none rounded-xl border border-gray-500 outline-none"
          type="range"
          min="0"
          max="100"
          :value="playerSettings.volume" />
        <div class="container mt-2 flex">
          <!--     Video/Radio toggle     -->
          <div class="flex">
            <div class="mr-3">
              <span class="text-sm font-medium text-gray-900 dark:text-white">
                ProTube
              </span>
            </div>
            <button
              @click="toggleRadioProtube"
              type="button"
              :class="
                playerSettings.playerType === enums.TYPES.RADIO
                  ? 'bg-proto_blue'
                  : 'bg-proto_green'
              "
              class="relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
              role="switch">
              <span
                :class="
                  playerSettings.playerType === enums.TYPES.RADIO
                    ? 'translate-x-5'
                    : 'translate-x-0'
                "
                class="pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out">
              </span>
            </button>
            <div class="ml-3">
              <span class="text-sm font-medium text-gray-900 dark:text-white">
                Radio
              </span>
            </div>
          </div>
          <!--   Video controls   -->
          <div class="mx-auto">
            <!-- TODO: Add back button in admin controls -->
            <!--<font-awesome-icon class="cursor-pointer text-2xl mx-2 text-gray-600 dark:text-white" icon="backward" />-->
            <font-awesome-icon
              @click="playPause"
              class="cursor-pointer text-2xl text-gray-600 dark:text-white"
              :icon="
                playerSettings.playerMode === enums.MODES.PLAYING
                  ? 'pause'
                  : 'play'
              ">
            </font-awesome-icon>
            <font-awesome-icon
              @click="skipVideo"
              class="mx-2 cursor-pointer text-2xl text-gray-600 dark:text-white"
              icon="forward">
            </font-awesome-icon>
          </div>
          <!--     New code button     -->
          <div class="relative ml-auto">
            <div class="absolute -right-full min-w-max">
              <button
                @click="resetScreenCode"
                class="bg-proto_blue hover:bg-proto_blue/80 rounded-md py-1 px-2 text-sm text-white shadow-md duration-200 hover:-translate-x-1 hover:-translate-y-0.5 hover:opacity-80">
                New code
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </ContentField>
</template>

<script setup>
import socket, { connectSocket } from "@/js/AdminRemoteSocket";
import { ref, onBeforeMount, onBeforeUnmount } from "vue";
import { useRouter } from "vue-router";
import enums from "@/js/Enums";
import ContentField from "../layout/ContentField.vue";

const latestToast = ref(null);

const user = ref({});
const playerSettings = ref({
  volume: 75,
  playerMode: enums.MODES.IDLE,
  playerType: enums.TYPES.VIDEO,
});

const router = useRouter();

onBeforeMount(async () => {
  const response = await fetch("/api/user");
  if (response.redirected) return (window.location.href = response.url);
  const data = await response.json();
  user.value.name = data.name;
  user.value.admin = data.admin;
  if (data.admin) connectSocket();
  else await router.push({ name: "Error", params: { errorcode: 401 } });
});

onBeforeUnmount(() => {
  socket.disconnect();
});

socket.on("connect", () => {
  socket.emit("get-player-settings", (result) => {
    playerSettings.value = result;
  });
});

socket.on("update-admin-panel", (newSettings) => {
  playerSettings.value = newSettings;
});

function displayToast(toast) {
  latestToast.value = toast;
}

async function volumeChange(event) {
  const volume = event.target.value;
  if (volume > 100 || volume < 0) {
    return displayToast({
      status: enums.STATUS.ERROR,
      message: "Invalid volume!",
    });
  }
  const data = await new Promise((resolve) => {
    socket.emit("set-new-volume", volume, (callback) => {
      resolve(callback);
    });
  });
  displayToast({
    status: data.status ?? enums.STATUS.SUCCESS,
    message: data.message ?? `Successfully Updated the volume to: ${volume}`,
  });
}

async function toggleRadioProtube() {
  const data = await new Promise((resolve) => {
    socket.emit("toggle-radio-protube", (callback) => {
      resolve(callback);
    });
  });
  displayToast({
    status: data.status ?? enums.STATUS.SUCCESS,
    message:
      data.message ??
      `Successfully switched to: ${
        playerSettings.value.playerType === enums.TYPES.RADIO
          ? "Radio"
          : "ProTube"
      }`,
  });
}

async function skipVideo() {
  const data = await new Promise((resolve) => {
    socket.emit("skip-video", (callback) => {
      resolve(callback);
    });
  });
  displayToast({
    status: data.status ?? enums.STATUS.SUCCESS,
    message: data.message ?? `Successfully skipped video!`,
  });
}

async function resetScreenCode() {
  const data = await new Promise((resolve) => {
    socket.emit("reset-screen-code", (callback) => {
      resolve(callback);
    });
  });
  displayToast({
    status: data.status ?? enums.STATUS.SUCCESS,
    message: data.message ?? `Successfully reset the screencode!`,
  });
}

async function playPause() {
  const data = await new Promise((resolve) => {
    socket.emit("play-pause", (callback) => {
      resolve(callback);
    });
  });
  displayToast({
    status: data.status ?? enums.STATUS.SUCCESS,
    message:
      data.message ??
      `Successfully ${
        playerSettings.value.playerMode === enums.MODES.PLAYING
          ? "paused"
          : "resumed"
      } video!`,
  });
}
</script>
