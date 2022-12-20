<template>
  <div class="dark:bg-proto_background_gray-dark">
    <!-- empty filler block for the grid -->
    <div class="absolute top-0 mt-2 w-full">
      <div
        v-show="screenCode !== -1"
        class="dark:bg-proto_secondary_gray-dark mx-auto max-w-min rounded-lg bg-white px-4 py-2 text-2xl font-medium text-gray-900 shadow-lg ring-1 ring-black ring-opacity-5 dark:text-gray-50">
        {{ screenCode }}
      </div>
    </div>

    <div class="absolute top-0 right-0 mt-2">
      <div
        v-if="isPlayingVideo"
        class="border-proto_blue dark:bg-proto_secondary_gray-dark mb-1 mr-4 mt-1 w-max rounded-lg border-r-4 bg-white px-4 py-2 font-medium text-gray-900 opacity-80 shadow-lg ring-1 ring-black ring-opacity-5 dark:text-gray-50">
        Want to add your own music? Visit www.protu.be!
      </div>
    </div>

    <div
      v-if="playerState.playerMode === enums.MODES.IDLE"
      class="grid min-h-screen place-items-center">
      <RadioScreen
        v-if="playerState.playerType === enums.TYPES.RADIO"
        :radio="playerState.radio"
        :volume="volume" />
      <div v-else class="dark:text-white">
        <div v-if="!photo.error">
          <div class="h-screen w-full">
            <img
              :src="photo.url"
              class="border-proto_blue dark:bg-proto_secondary_gray-dark ml-4 mb-1 h-full w-full rounded-lg rounded-lg border-l-8 bg-white object-cover"
              alt="Loading..." />
          </div>
          <div
            class="absolute top-0 left-0 mt-1 rounded-lg text-xl text-zinc-400">
            <div
              class="border-proto_blue dark:bg-proto_secondary_gray-dark ml-4 mb-1 rounded-lg border-l-4 bg-white p-1 px-4 py-2 font-medium text-gray-900 opacity-80 shadow-lg ring-1 ring-black ring-opacity-5 dark:text-gray-50">
              Album: {{ photo.album_name }}<br />
              Taken on: {{ photo.date_taken }}
            </div>
          </div>
          <div
            class="absolute bottom-0 left-0 mb-1 rounded-lg text-4xl font-bold">
            <div
              class="border-proto_blue dark:bg-proto_secondary_gray-dark ml-4 mb-1 rounded-lg border-l-4 bg-white p-1 px-4 py-2 font-medium text-gray-900 opacity-80 shadow-lg ring-1 ring-black ring-opacity-5 dark:text-gray-50">
              The queue is empty! Visit ProTu.be to play some epic tunes!
            </div>
          </div>
        </div>
        <div v-else class="text-4xl dark:text-white">
          Nothing currently in the queue...<br />
          Visit protu.be to add some tunes!
        </div>
      </div>
    </div>
    <div v-show="isPlayingVideo">
      <div :id="playerID" class="min-h-screen w-full" />
    </div>
  </div>
  <div class="absolute bottom-0 mb-1 w-screen rounded-lg">
    <div v-if="isPlayingVideo" class="flex justify-between">
      <div
        class="border-proto_blue dark:bg-proto_secondary_gray-dark ml-4 mb-1 rounded-lg border-l-4 bg-white p-1 px-4 py-2 font-medium text-gray-900 opacity-80 shadow-lg ring-1 ring-black ring-opacity-5 dark:text-gray-50">
        Queue: {{ totalDuration }}
      </div>
    </div>
    <div class="mx-4 mb-1 grid grid-cols-5 gap-2 overflow-hidden">
      <VideoCard
        class="opacity-90"
        v-for="(video, index) in queueWithCurrent.slice(0, 5)"
        :key="video.id"
        :index="index"
        :title="video.title"
        :name="video.user.name"
        :channel="video.channel"
        :duration="video.durationFormatted"
        :thumbnail="video.thumbnail.url"
        :videoID="video.id"
        :textScrolling="true"
        :progressBar="index === 0 ? queueProgress : 0" />
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
import VideoCard from "@/components/VideoCard.vue";
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

const photo = ref({
  url: "",
  album_name: "",
  date_taken: 0,
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
  photo.value = newQueue.photo;
});
</script>
