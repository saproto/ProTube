<template>
  <div class="dark:bg-proto_background_gray-dark">
    <div class="absolute grid w-full grid-cols-3 gap-4 pt-3">
      <div class=""></div>
      <!-- empty filler block for the grid -->
      <div>
        <div
          v-show="screenCode !== -1"
          class="dark:bg-proto_secondary_gray-dark mx-auto max-w-min rounded-lg bg-white px-4 py-2 text-2xl font-medium text-gray-900 shadow-lg ring-1 ring-black ring-opacity-5 dark:text-gray-50">
          {{ screenCode }}
        </div>
      </div>
    </div>

    <div
      v-if="playerState.playerMode === enums.MODES.IDLE"
      class="grid min-h-screen place-items-center">
      <RadioScreen
        v-if="playerState.playerType === enums.TYPES.RADIO"
        :radio="playerState.radio"
        :volume="volume" />
      <div v-else class="text-4xl dark:text-white">
        Nothing currently in the queue...<br />
        Visit protu.be to add some tunes!
      </div>
    </div>
    <div
      v-show="
        playerState.playerType === enums.TYPES.VIDEO &&
        playerState.playerMode !== enums.MODES.IDLE
      ">
      <div :id="playerID" class="min-h-screen w-full" />
    </div>
  </div>
  <div class="absolute bottom-0 mb-1 w-screen rounded-lg">
    <div v-if="isPlayingVideo" class="flex justify-between">
      <div
        class="border-proto_blue dark:bg-proto_secondary_gray-dark ml-4 mb-1 rounded-lg border-l-4 bg-white p-1 px-4 py-2 font-medium text-gray-900 opacity-80 shadow-lg ring-1 ring-black ring-opacity-5 dark:text-gray-50">
        Queue: {{ totalDuration }}
      </div>
      <div
        class="border-proto_blue dark:bg-proto_secondary_gray-dark mb-1 mr-4 rounded-lg border-r-4 bg-white p-1 px-4 py-2 font-medium text-gray-900 opacity-80 shadow-lg ring-1 ring-black ring-opacity-5 dark:text-gray-50">
        Want to add your own music? Visit www.protu.be!
      </div>
    </div>
    <div class="flex flex-1 gap-1 overflow-hidden pl-3">
      <div
        v-for="(video, index) in queueWithCurrent.slice(0, 5)"
        :video="video"
        :index="index"
        :key="video.id"
        ref="queuecontainer"
        class="mb-1 inline-block w-1/5 rounded-lg p-1">
        <div
          :style="{ background: `url(${video.thumbnail.url})` }"
          style="
            background-repeat: no-repeat;
            background-size: cover;
            background-position: center center;
          "
          class="border-proto_blue group relative col-span-1 inline-block flex h-full w-full flex-1 overflow-hidden rounded-lg border-l-4 text-center shadow">
          <div
            :style="index === 0 ? `width:${queueProgress}%;` : 'width:0%'"
            class="absolute h-full bg-white opacity-70" />
          <div
            class="rounded-m relative flex w-full flex-col rounded-r-lg border-t border-b border-r border-gray-400 bg-white/70 px-8 py-4 duration-200 dark:border-gray-800/80 dark:bg-stone-800/80">
            <div class="video-title-container overflow-hidden">
              <h3
                :class="titleIsOverflowing(index) ? 'scroll-title' : ''"
                class="video-title text-md z-1 h-[2rem] w-fit whitespace-nowrap text-left font-bold text-gray-800 dark:text-stone-300">
                {{ video.title }}
              </h3>
            </div>
            <ul
              class="fa-ul mt-auto ml-5 w-full text-sm font-medium text-gray-900 dark:text-stone-300">
              <li
                class="justify-bottom mt-auto flex flex-1 text-right align-bottom">
                <span class="fa-li">
                  <font-awesome-icon icon="fa-solid fa-user" fixed-width>
                  </font-awesome-icon>
                </span>
                <span class="truncate">
                  {{ video.user.name }}
                </span>
              </li>
              <li class="flex flex-1 text-right">
                <span class="fa-li">
                  <font-awesome-icon icon="fa-solid fa-microphone" fixed-width>
                  </font-awesome-icon>
                </span>
                <span class="truncate">
                  {{ video.channel }}
                </span>
              </li>
              <li class="flex flex-1 text-right">
                <span class="fa-li">
                  <font-awesome-icon icon="fa-solid fa-microphone" fixed-width>
                  </font-awesome-icon>
                </span>
              </li>
              <li class="flex flex-1 text-right">
                <span class="fa-li">
                  <font-awesome-icon icon="fa-solid fa-clock fa-li" fixed-width>
                  </font-awesome-icon>
                </span>
                <span class="truncate">
                  {{ video.durationFormatted }}
                </span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  </div>
  <ReconnectionHandler
    v-if="screenCode === -1"
    :socket="socket"
    :maxAttempts="5" />
</template>

<script setup>
import RadioScreen from "@/components/RadioScreen";
import ReconnectionHandler from "@/components/ReconnectionHandler";
import {
  onMounted,
  onBeforeUnmount,
  onBeforeMount,
  ref,
  watch,
  computed,
} from "vue";
import socket, { connectSocket } from "@/js/ScreenSocket";
import YoutubePlayer from "youtube-player";
import enums from "@/js/Enums";

const playerID = "player-" + Math.random();
const totalDuration = ref();
const queueProgress = ref(0);
const queue = ref([]);
const queuecontainer = ref(null);
let player;
const playerState = ref({
  playerMode: enums.MODES.IDLE,
  playerType: enums.TYPES.VIDEO,
  queue: [],
  radio: {},
  timestamp: 0,
  video: {},
  volume: 0,
});

// Compute the queue with the currently playing video at the front
const queueWithCurrent = computed(() => {
  let currentVideo = playerState.value.video;
  // if currentvideo = empty -> queue is empty
  if (Object.keys(currentVideo).length === 0) return [];
  return [currentVideo].concat(queue.value);
});

const isPlayingVideo = computed(
  () =>
    playerState.value.playerType === enums.TYPES.VIDEO &&
    playerState.value.playerMode !== enums.MODES.IDLE
);

const titleIsOverflowing = (index) => {
  if (!queuecontainer.value) return false;
  let titleContainer = queuecontainer.value[index].querySelector(
    `.video-title-container`
  );
  let title = queuecontainer.value[index].querySelector(`.video-title`);
  return title.clientWidth > titleContainer.clientWidth;
};

const emit = defineEmits(["youtube-media-error"]);
const props = defineProps({
  volume: {
    type: Number,
    default: -1,
  },
  screenCode: {
    type: Number,
    default: -1,
  },
});

onBeforeMount(() => {
  connectSocket();
});

onMounted(() => {
  player = YoutubePlayer(playerID, {
    host: "https://www.youtube-nocookie.com",
    videoId: "",
    playerVars: {
      autoplay: 1,
      controls: 0,
      modestbranding: 0,
      loop: 0,
    },
  });

  // the iframe api player generates any error (unplayable media)
  player.on("error", (event) => {
    emit("youtube-media-error", event.data);
  });
});

watch(
  () => props.volume,
  () => {
    if (props.volume < 0) return;
    player.setVolume(props.volume);
  }
);

onBeforeUnmount(() => {
  socket.disconnect();
});

socket.on("player-update", (newState) => {
  if (newState.playerType === enums.TYPES.VIDEO) {
    if (newState.playerMode === enums.MODES.PLAYING) {
      player.loadVideoById(newState.video.id, newState.timestamp);
    } else player.pauseVideo();
  } else if (playerState.value.playerType === enums.TYPES.VIDEO)
    player.stopVideo();
  playerState.value = newState;
});

socket.on("new-video-timestamp", async (newStamp) => {
  totalDuration.value = newStamp.totalDuration;
  queueProgress.value =
    (newStamp.timestamp / playerState.value.video.duration) * 100;
  if (Math.abs((await player.getCurrentTime()) - newStamp.timestamp) > 5) {
    player.seekTo(newStamp.timestamp, true);
    if ((await player.getPlayerState()) === 2) player.playVideo();
  }
});

socket.on("queue-update", (newQueue) => {
  queue.value = newQueue.queue;
});
</script>

<style scoped>
.scroll-title {
  animation: slide-left 10s linear infinite;
}

@keyframes slide-left {
  0% {
    -webkit-transform: translateX(0);
    transform: translateX(0);
  }
  20% {
    -webkit-transform: translateX(0);
    transform: translateX(0);
  }
  85% {
    -webkit-transform: translateX(-60%);
    transform: translateX(-60%);
  }
  98% {
    -webkit-transform: translateX(-60%);
    transform: translateX(-60%);
  }
  100% {
    -webkit-transform: translateX(0%);
    transform: translateX(0%);
  }
}
</style>
