<template>
  <div>
    <transition name="search" mode="out-in">
      <HeaderField>
        <div class="md:flex-1">
          <h3
            class="flex w-full text-2xl font-medium leading-6 text-white md:block">
            <span class="w-full"> ProTube admin panel</span>
            <font-awesome-icon
              @click="mobileMenuOpen = !mobileMenuOpen"
              :class="mobileMenuOpen ? 'fa-rotate-90' : 'fa-rotate-0'"
              class="block cursor-pointer duration-500 md:hidden"
              icon="bars" />
          </h3>
          <div class="my-2 max-w-xl text-sm text-gray-200">
            <p>With great power comes great responsibility</p>
          </div>
          <h2
            class="mt-4 hidden text-3xl font-medium leading-6 text-white md:block md:text-6xl">
            Welcome {{ user.name }}
          </h2>
        </div>
        <HeaderFieldButtons
          :classes="mobileMenuOpen ? '' : 'md:block hidden'"
          screen
          adminScreen
          remote />
      </HeaderField>
    </transition>
    <transition name="results" mode="out-in" appear>
      <ContentField>
        <div class="md:flex">
          <label class="absolute text-2xl text-gray-600 dark:text-white">
            Master controls</label
          >
          <div class="w-full md:mt-12 md:w-2/3">
            <p
              class="text-md w-full text-right text-gray-500 dark:text-white md:text-center">
              Volume slider
            </p>
            <input
              @change="volumeChange"
              class="bg-proto_blue hover:bg-proto_blue/80 h-2 w-full appearance-none rounded-xl border border-gray-500 outline-none"
              type="range"
              min="0"
              max="100"
              :value="playerSettings.volume" />
            <!-- TODO: Add back button in admin controls -->
            <!--<font-awesome-icon class="cursor-pointer text-2xl mx-2 text-gray-600 dark:text-white" icon="backward" />-->
            <font-awesome-icon
              @click="playPause"
              class="mx-2 cursor-pointer text-2xl text-gray-600 dark:text-white"
              :icon="
                playerSettings.playerMode !== enums.MODES.PLAYING
                  ? 'play'
                  : 'pause'
              " />
            <font-awesome-icon
              @click="skipVideo"
              class="mx-2 cursor-pointer text-2xl text-gray-600 dark:text-white"
              icon="forward" />
          </div>
          <div class="mt-4 flex md:mt-12 md:w-1/3">
            <!-- <button @click="resetScreenCode" class="shadow-md bg-proto_blue hover:bg-proto_blue/80 text-white py-1 px-2 md:ml-5 rounded-md my-auto flex">
                            New code
                        </button> -->
            <div class="mx-auto flex items-center">
              <span class="mr-3" id="annual-billing-label">
                <span class="text-sm font-medium text-gray-900 dark:text-white"
                  >ProTube</span
                >
              </span>
              <button
                @click="toggleRadioProtube"
                type="button"
                :class="
                  playerSettings.playerType === enums.TYPES.RADIO
                    ? 'bg-proto_blue'
                    : 'bg-proto_green'
                "
                class="relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                role="switch"
                aria-checked="false"
                aria-labelledby="annual-billing-label">
                <!-- Enabled: "translate-x-5", Not Enabled: "translate-x-0" -->
                <span
                  aria-hidden="true"
                  :class="
                    playerSettings.playerType === enums.TYPES.RADIO
                      ? 'translate-x-5'
                      : 'translate-x-0'
                  "
                  class="pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out"></span>
              </button>
              <span class="ml-3" id="annual-billing-label">
                <span class="text-sm font-medium text-gray-900 dark:text-white"
                  >Radio</span
                >
              </span>
            </div>
          </div>
        </div>
      </ContentField>
    </transition>
    <transition name="results" mode="out-in" appear>
      <RadioStations v-on:display-toast="displayToast" />
    </transition>

    <transition name="results" mode="out-in" appear>
      <CurrentQueue v-on:display-toast="displayToast" admin />
    </transition>

    <ToastsModal :latestToast="latestToast" />
  </div>
</template>

<script setup>
import HeaderField from "@/layout/HeaderField.vue";
import HeaderFieldButtons from "@/components/HeaderFieldButtons.vue";
import ContentField from "@/layout/ContentField.vue";
import ToastsModal from "@/components/modals/ToastsModal.vue";
import RadioStations from "@/components/RadioStations.vue";
import CurrentQueue from "@/components/CurrentQueue.vue";
import socket, { connectSocket } from "@/js/AdminRemoteSocket";
import { ref, onBeforeMount, onBeforeUnmount } from "vue";
import { useRouter } from "vue-router";
import enums from "@/js/Enums";

const latestToast = ref(null);
const mobileMenuOpen = ref(false);

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
  else router.push({ name: "Error", params: { errorcode: 401 } });
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
// TODO: Fix new screencode button
// async function resetScreenCode() {
//     const data = await new Promise( resolve => {
//         socket.emit('reset-screen-code', callback => {
//             resolve(callback);
//         });
//     });
//     displayToast({
//         status: data.status ?? STATUS.SUCCESS,
//         message: data.message ?? `Successfully reset the screencode!`
//     });
// }

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

<style scoped>
.no-scrollbar::-webkit-scrollbar {
  display: none;
}

/* Hide scrollbar for IE, Edge and Firefox */
.no-scrollbar {
  -ms-overflow-style: none; /* IE and Edge */
  scrollbar-width: none; /* Firefox */
}
</style>
