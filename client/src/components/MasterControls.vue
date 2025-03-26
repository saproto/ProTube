<template>
  <ContentField>
    <div class="mb-1 flex">
      <h3 class="h-full text-2xl text-gray-600 dark:text-white">
        Master controls
      </h3>
      <button
        v-if="!inProduction"
        class="ml-auto flex-none rounded-md bg-gray-800 px-4 py-1 text-center text-white duration-200 hover:-translate-x-1 hover:-translate-y-0.5 hover:opacity-80 hover:shadow-lg dark:bg-gray-100 dark:text-gray-800 md:mt-0"
        @click="switchTheme">
        Switch Theme
      </button>
    </div>
    <div class="md:flex">
      <div class="mx-auto w-full text-center lg:w-2/3">
        <span
          class="w-full text-right text-lg text-gray-500 dark:text-white md:text-center">
          Volume - {{ playerSettings.volume }}
        </span>
        <input
          class="bg-proto_blue hover:bg-proto_blue/80 h-2 w-full appearance-none rounded-xl border border-gray-500 outline-none"
          type="range"
          min="0"
          max="100"
          :value="playerSettings.volume"
          @change="volumeChange" />
        <div class="container mt-2 flex gap-2 flex-wrap justify-between">
          <!--     Video/Radio toggle     -->
          <div class="flex shrink-0 basis-[0] grow">
            <div class="mr-3 ">
              <span class="text-sm font-medium text-gray-900 dark:text-white">
                ProTube
              </span>
            </div>
            <SwitchButton
                :on = "playerSettings.playerType === enums.TYPES.RADIO"
                @toggled="toggleRadioProtube"
            ></SwitchButton>

            <div class="ml-3">
              <span class="text-sm font-medium text-gray-900 dark:text-white">
                Radio
              </span>
            </div>
          </div>
          <!--   Video controls   -->
          <div class="shrink-0 basis-[0] grow">
            <font-awesome-icon
              class="cursor-pointer text-2xl text-gray-600 dark:text-white"
              :icon="
                playerSettings.playerMode === enums.MODES.PLAYING
                  ? 'pause'
                  : 'play'
              "
              @click="playPause">
            </font-awesome-icon>
            <font-awesome-icon
              class="mx-2 cursor-pointer text-2xl text-gray-600 dark:text-white"
              icon="forward"
              @click="skipVideo">
            </font-awesome-icon>
          </div>

          <!--     New code button     -->
          <div class="basis-[0] grow">
          <button
              class="whitespace-nowrap bg-proto_blue hover:bg-proto_blue/80 p-2 rounded-md text-sm text-white shadow-md duration-200 hover:-translate-x-1 hover:-translate-y-0.5 hover:opacity-80"
              @click="resetScreenCode">
            New code
          </button>
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
import SwitchButton from "@/components/SwitchButton.vue";
const emit = defineEmits(["display-toast"]);

const user = ref({});
const playerSettings = ref({
  volume: 75,
  playerMode: enums.MODES.IDLE,
  playerType: enums.TYPES.VIDEO,
});

const router = useRouter();

const inProduction = process.env.NODE_ENV === "production";

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
  emit("display-toast", toast);
}

async function switchTheme() {
  if (localStorage.theme !== "dark" || !("theme" in localStorage)) {
    document.documentElement.classList.add("dark");
    localStorage.theme = "dark";
  } else {
    document.documentElement.classList.remove("dark");
    localStorage.theme = "light";
  }
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
