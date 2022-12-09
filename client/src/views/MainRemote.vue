<template>
  <div>
    <transition name="search" mode="out-in" appear>
      <SearchWrapper
        :user="user"
        v-on:query-videos="fetchVideos"
        v-on:query-single-video="fetchThenAddVideo"
        v-on:query-playlist="fetchThenAddPlaylist" />
    </transition>
    <transition name="results" mode="out-in" appear>
      <ResultsWrapper
        v-on:next-page="fetchVideos"
        v-on:display-toast="displayToast"
        :videos="foundVideos"
        :continuationToken="continuationToken"
        :skeletonLoading="resultsWrapperSkeletons" 
        :fetchVideos="fetchVideos"/>
    </transition>
    <ToastsModal :latestToast="latestToast" />
    <transition name="modal" appear>
      <PincodeModal v-if="loginModalVisible" />
    </transition>
    <transition name="modal" appear>
      <LoadModal
        :message="loadModalMessage"
        v-if="loadModalVisible && !loginModalVisible" />
    </transition>
    <transition name="results" mode="out-in" appear>
      <CurrentQueue />
    </transition>
  </div>
</template>

<script setup>
import SearchWrapper from "@/components/SearchWrapper.vue";
import ResultsWrapper from "@/components/ResultsWrapper.vue";
import PincodeModal from "@/components/modals/PincodeModal.vue";
import LoadModal from "@/components/modals/LoadModal.vue";
import CurrentQueue from "@/components/CurrentQueue.vue";
import ToastsModal from "@/components/modals/ToastsModal.vue";
import socket, { connectSocket } from "@/js/RemoteSocket";
import { onMounted, ref, onBeforeMount, onBeforeUnmount } from "vue";
import enums from "@/js/Enums";

const loginModalVisible = ref(true);
const loadModalVisible = ref(false);
const resultsWrapperSkeletons = ref(false);
const loadModalMessage = ref("");
const foundVideos = ref([]);
const continuationToken = ref(null);
const latestToast = ref(null);

const user = ref({
  name: "",
  admin: false,
  validRemote: false,
});

onBeforeMount(async () => {
  const response = await fetch("/api/user");
  if (response.redirected) return (window.location.href = response.url);
  const data = await response.json();
  user.value.name = data.name;
  user.value.admin = data.admin;
  user.value.validRemote = data.hasValidRemote;
  if (user.value.validRemote) connectSocket();
});

onMounted(() => {});

onBeforeUnmount(() => {
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

async function fetchThenAddPlaylist(playlistId) {
  loadModalVisible.value = true;
  loadModalMessage.value = "Adding videos from playlist...";
  const result = await new Promise((resolve) => {
    socket.emit("fetch-then-add-playlist", playlistId, (result) => {
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
  if(query) {
    continuationToken.value = null;
  }else{
    window.scrollTo({top: 0, behavior: 'smooth'});
  }
  loadModalVisible.value = true;
  resultsWrapperSkeletons.value = true;
  loadModalMessage.value = query ? `Searching for ${query}...` : 'Getting results from next page...';
  let result = await new Promise((resolve) => {
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
}
</script>

<style>
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
