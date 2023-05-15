<template>
  <div class="dark:bg-proto_background_gray-dark">
    <div class="absolute top-0 mt-2 w-full">
      <div
        v-show="screenCode !== -1"
        class="dark:bg-proto_secondary_gray-dark mx-auto max-w-min rounded-lg bg-white px-4 py-2 text-2xl font-medium text-gray-900 shadow-lg ring-1 ring-black ring-opacity-5 dark:text-gray-50">
        {{ screenCode }}
      </div>
    </div>

    <div v-show="isPlayingVideo && !screenSetting.showPhotos">
      <div :id="playerID" class="min-h-screen w-full" />
    </div>

    <div
      v-if="playerState.playerType === enums.TYPES.VIDEO"
      class="absolute top-0 right-0 mt-2">
      <div
        class="border-proto_blue dark:bg-proto_secondary_gray-dark mb-1 mr-4 mt-1 w-max rounded-lg border-r-4 bg-white px-4 py-2 font-medium text-gray-900 opacity-80 shadow-lg ring-1 ring-black ring-opacity-5 dark:text-gray-50">
        Want to add your own music? Visit protu.be!
      </div>
    </div>

    <ScreenQueue
      v-if="displayQueue"
      :currentVideo="playerState.video"
      :queue="queue"
      :currentTimeStamp="currentTimeStamp" />

    <RadioScreen
      v-if="isPlayingRadio"
      :radio="playerState.radio"
      :volume="volume" />

    <PhotosOverlay v-if="displayPhotos" />

    <div
      v-if="
        playerState.playerType === enums.TYPES.VIDEO &&
        !isPlayingVideo &&
        !showPhotos
      "
      class="grid h-screen place-items-center">
      <div class="text-4xl dark:text-white">
        Nothing currently in the queue...<br />
        Visit protu.be to add some tunes!
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
import ScreenQueue from "../components/ScreenQueue.vue";
import PhotosOverlay from "../components/PhotosOverlay.vue";

const playerID = "player-" + Math.random();
const currentTimeStamp = ref({
  timestamp: 0,
  totalDuration: "00:00:00",
});
const queue = ref([]);
const screenSetting = ref({
  showQueue: true,
  showPhotos: true,
});
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

const isPlayingVideo = computed(
  () =>
    playerState.value.playerType === enums.TYPES.VIDEO &&
    playerState.value.playerMode !== enums.MODES.IDLE
);

const isVideoIdle = computed(() => {
  return (
    playerState.value.playerType === enums.TYPES.VIDEO &&
    playerState.value.playerMode === enums.MODES.IDLE
  );
});

const isPlayingRadio = computed(
  () =>
    playerState.value.playerType === enums.TYPES.RADIO &&
    playerState.value.playerMode === enums.MODES.IDLE
);

// show if playing video and when in showDefault or queue only
const displayQueue = computed(() => {
  return isPlayingVideo.value && screenSetting.value.showQueue;
});

// show photos if show photos, or default and video idle
const displayPhotos = computed(() => {
  return (
    isVideoIdle.value ||
    isPlayingRadio.value ||
    (isPlayingVideo.value && screenSetting.value.showPhotos)
  );
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
  currentTimeStamp.value = newStamp;
  // keep video in sync with backend
  if (Math.abs((await player.getCurrentTime()) - newStamp.timestamp) > 5) {
    player.seekTo(newStamp.timestamp, true);
    if ((await player.getPlayerState()) === 2) player.playVideo();
  }
});

socket.on("queue-update", (newQueue) => {
  queue.value = newQueue.queue;
});

socket.on("queue-photos-visibility-changed", (newSetting) => {
  screenSetting.value = newSetting;
});
</script>
