<template>
  <transition name="search" mode="out-in" appear>
    <SearchWrapper
      :user="user"
      @query-videos="fetchVideos"
      @query-single-video="fetchThenAddVideo"
      @query-playlist="fetchPlaylist" />
  </transition>

  <div class="gap-2 md:grid md:grid-cols-6">
    <div class="col-span-3 lg:col-span-4">
      <transition name="results" mode="out-in" appear>
        <MasterControls v-if="user.admin" @display-toast="displayToast" />
      </transition>

      <transition name="results" mode="out-in" appear>
        <RadioStations v-if="user.admin" @display-toast="displayToast" />
      </transition>

      <transition id="resultsWrapper" name="results" mode="out-in" appear>
        <ResultsWrapper
          :videos="foundVideos"
          :continuation-token="continuationToken"
          :skeleton-loading="resultsWrapperSkeletons"
          @next-page="fetchVideos"
          @display-toast="displayToast" />
      </transition>
    </div>
    <div class="col-span-3 lg:col-span-2">
      <transition name="results" mode="out-in" appear>
        <CurrentQueue
          :admin="user.admin"
          :user-i-d="user.id"
          @display-toast="displayToast" />
      </transition>

      <ToastsModal :latest-toast="latestToast" />

      <transition name="modal" appear>
        <PincodeModal v-if="loginModalVisible" />
      </transition>

      <transition name="modal" appear>
        <LoadModal
          v-if="loadModalVisible && !loginModalVisible"
          :message="loadModalMessage" />
      </transition>

      <transition name="modal" appear>
        <PlaylistModal
          v-if="!loginModalVisible"
          ref="confirmModal"
          :admin="user.admin"
          @add-playlist="addPlaylist" />
      </transition>
    </div>
  </div>
</template>

<script setup>
import SearchWrapper from "@/components/SearchWrapper.vue";
import ResultsWrapper from "@/components/ResultsWrapper.vue";
import PincodeModal from "@/components/modals/PincodeModal.vue";
import LoadModal from "@/components/modals/LoadModal.vue";
import CurrentQueue from "@/components/CurrentQueue.vue";
import ToastsModal from "@/components/modals/ToastsModal.vue";
import MasterControls from "@/components/MasterControls.vue";
import RadioStations from "@/components/RadioStations.vue";
import socket, { connectSocket } from "@/js/RemoteSocket";
import { onBeforeMount, onBeforeUnmount, onMounted, ref } from "vue";
import enums from "@/js/Enums";
import PlaylistModal from "../components/modals/PlaylistModal.vue";

const loginModalVisible = ref(true);
const loadModalVisible = ref(false);
const resultsWrapperSkeletons = ref(false);
const loadModalMessage = ref("");
const foundVideos = ref([]);
const continuationToken = ref(null);
const latestToast = ref(null);
const confirmModal = ref(null);

const user = ref({
  name: "",
  admin: false,
  hasValidRemote: false,
  id: -1,
});

onBeforeMount(async () => {
  const response = await fetch("/api/user");
  if (response.redirected) return (window.location.href = response.url);
  user.value = await response.json();
  if (user.value.hasValidRemote) connectSocket();
});

onMounted(() => {
  document.addEventListener("visibilitychange", handleVisibilityChange);
});

onBeforeUnmount(() => {
  document.removeEventListener("visibilitychange", handleVisibilityChange);
  socket.disconnect();
});

// does not get retriggered?
socket.on("connect", () => {
  setTimeout(() => {
    loginModalVisible.value = false;
  }, 200);
});

socket.on("disconnect", () => {
  loginModalVisible.value = true;
});

function displayToast(toast) {
  latestToast.value = toast;
}

function handleVisibilityChange() {
  if (document.visibilityState === "visible") {
    if (user.value.hasValidRemote) connectSocket();
  }
}

async function fetchThenAddVideo(videoId) {
  loadModalVisible.value = true;
  loadModalMessage.value = "Adding video...";
  const result = await new Promise((resolve) => {
    socket.emit("fetch-then-add-video", videoId, (result) => {
      resolve(result);
    });
  });
  displayToast({
    status: result.status ?? enums.STATUS.SUCCESS,
    message: result.message ?? "Successfully added to the queue!",
  });
  loadModalVisible.value = false;
}

async function fetchPlaylist(playlistId) {
  loadModalVisible.value = true;
  loadModalMessage.value = "Adding videos from playlist...";
  const playlist = await new Promise((resolve) => {
    socket.emit("fetch-playlist", playlistId, (result) => {
      resolve(result);
    });
  });

  loadModalVisible.value = false;
  confirmModal.value.show(playlist);
}

async function addPlaylist(playlistId, shuffled) {
  loadModalVisible.value = true;
  loadModalMessage.value = "Adding videos from playlist...";
  const result = await new Promise((resolve) => {
    socket.emit("add-playlist", playlistId, shuffled, (result) => {
      resolve(result);
    });
  });
  displayToast({
    status: result.status ?? enums.STATUS.SUCCESS,
    message: result.message ?? "Successfully added playlist to the queue!",
  });
  loadModalVisible.value = false;
}

async function fetchVideos(query) {
  if (query) {
    continuationToken.value = null;
  }

  loadModalVisible.value = true;
  resultsWrapperSkeletons.value = true;
  loadModalMessage.value = query
    ? `Searching for ${query}...`
    : "Getting results from next page...";
  const result = await new Promise((resolve) => {
    socket.emit(
      "fetch-videos",
      {
        query,
        continuationToken: continuationToken.value,
      },
      (result) => {
        resolve(result);
      }
    );
  });
  foundVideos.value = result.videos;
  continuationToken.value = result.continuationToken;
  loadModalVisible.value = false;
  resultsWrapperSkeletons.value = false;

  // scroll to the top of the results
  document
    .getElementById("resultsWrapper")
    .scrollIntoView({ behavior: "smooth" });
}
</script>

<style>
#resultsWrapper {
  scroll-margin-top: 5px;
}
.search-enter-from {
  opacity: 0;
  transform: translateY(-100px);
}
.search-enter-to {
  opacity: 1;
  transform: translateY(0);
}
.search-enter-active {
  transition: all 1s ease;
}

.results-enter-from {
  opacity: 0;
  transform: translateY(-250px);
}
.results-enter-to {
  opacity: 1;
  transform: translateY(0);
}
.results-enter-active {
  transition: all 1s ease;
}

.modal-enter-from {
  opacity: 0;
}
.modal-enter-to {
  opacity: 1;
}
.modal-enter-active {
  transition: all 0.5s ease;
}
.modal-leave-from {
  opacity: 1;
}
.modal-leave-to {
  opacity: 0;
}
.modal-leave-active {
  transition: all 1s ease;
}
</style>
