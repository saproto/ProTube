<template>
  <div class="dark:bg-proto_background_gray-dark">
    <!-- empty filler block for the grid -->
    <div class="absolute top-0 mt-2 w-full">
      <div
        v-show="screenCode !== -1"
        class="dark:bg-proto_secondary_gray-dark mx-auto max-w-min rounded-lg bg-white px-4 py-2 text-3xl font-medium text-gray-900 shadow-lg ring-1 ring-black ring-opacity-5 dark:text-gray-50">
        {{ screenCode }}
      </div>
    </div>

    <div v-show="isPlayingVideo">
      <div
      id="player-wrapper" class="overflow-hidden"
      :class="{
        'small-player': screenSettings.smallPlayer,
        'hide-queue': screenSettings.hideQueue,
      }">
        <div
            v-if="screenSettings.smallPlayer"
            :style="`width:${queueProgress}%;`"
            class="bg-proto_blue absolute bottom-0 h-2 w-0 rounded-sm z-[1] opacity-60"></div>
        <div
            :id="playerID"
        ></div>

      </div>
    </div>

    <div
      v-if="playerState.playerType === enums.TYPES.VIDEO"
      class="absolute right-0 top-0 mt-2">
      <div
        class="border-proto_blue dark:bg-proto_secondary_gray-dark mb-1 mr-4 mt-1 w-max rounded-lg border-r-4 bg-white px-4 py-2 font-medium text-gray-900 opacity-80 shadow-lg ring-1 ring-black ring-opacity-5 dark:text-gray-50">
        Want to add your own music? Visit www.protu.be!
      </div>
    </div>

    <div v-if="isPlayingVideo">
      <div class="absolute bottom-0 mb-1 w-screen rounded-lg">
        <div class="flex justify-between">
          <div
            class="border-proto_blue dark:bg-proto_secondary_gray-dark mb-1 ml-4 rounded-lg border-l-4 bg-white p-1 px-4 py-2 font-medium text-gray-900 opacity-80 shadow-lg ring-1 ring-black ring-opacity-5 dark:text-gray-50">
            Queue: {{ totalDuration }}
          </div>
        </div>
        <div
            v-if="!screenSettings.hideQueue"
             class="mx-4 mb-1 grid grid-cols-5 gap-2 overflow-hidden">
          <VideoCard
            v-for="(video, index) in queueWithCurrent.slice(0, 5)"
            :key="video.id"
            :index="index"
            :title="video.title"
            :name="video.user.name"
            :channel="video.channel"
            :duration="video.durationFormatted"
            :thumbnail="video.thumbnail.url"
            :video-i-d="video.id"
            :text-scrolling="true"
            :rounded-corners="true"
            :progress-bar="index === 0 ? queueProgress : 0"
            :opacity="0.9" />
        </div>
      </div>
    </div>

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
      <div
        v-else-if="playerState.playerType === enums.TYPES.RADIO"
        class="grid h-screen place-items-center">
        <div class="text-4xl dark:text-white">
          Nothing currently in the queue...<br />
          Visit protu.be to add some tunes!
        </div>
      </div>

      <div
        v-if="isPlayingRadio"
        class=""
        :class="
          photo && !photo.error && photo.url !== ''
            ? 'absolute bottom-0 right-0 mr-2 place-items-end'
            : ' grid h-screen place-items-center'
        ">
        <RadioScreen :radio="playerState.radio" :volume="volume" />
      </div>
    </div>
  </div>

  <ReconnectionHandler
    v-if="screenCode === -1"
    :socket="socket"
    :max-attempts="5" />
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

const screenSettings = ref({
  hideQueue: false,
  smallPlayer: false,
})

const photo = ref({
  url: "",
  album_name: "",
  date_taken: 0,
});

const emit = defineEmits(["youtube-media-error", "screen-settings-update"]);
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

const allowedDelta = props.screenCode === -1 ? 2 : 0.12;
let YTPlayerState = -1;
let bufferTime = -1;
let firstTime = -1;
let maySync = true;

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

const isPlayingRadio = computed(
  () =>
    playerState.value.playerType === enums.TYPES.RADIO &&
    playerState.value.playerMode === enums.MODES.IDLE
);

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

  player.on("stateChange", (event) => {
    if (event.data === -1) {
      return;
    }

    if (
      event.data === 5 &&
      playerState.value.playerType === enums.TYPES.VIDEO
    ) {
      player.playVideo();
      bufferTime = (Date.now() - firstTime) / 1000;
    }
    YTPlayerState = event.data;
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
      player.cueVideoById(newState.video.id, newState.timestamp);
      firstTime = Date.now();
      maySync = true;
    } else player.pauseVideo();
  } else if (playerState.value.playerType === enums.TYPES.VIDEO)
    player.stopVideo();
  playerState.value = newState;
});

//the seconds the player skips when the player is off by more than the delta
socket.on("new-video-timestamp", async (newStamp) => {
  const playerTime = await player.getCurrentTime();
  //if the player is buffering or we can not get a playertime do nothing
  if (Number.isNaN(playerTime) || YTPlayerState === 3) {
    return;
  }
  let delta = newStamp.timestamp - playerTime;
  totalDuration.value = newStamp.totalDuration;
  queueProgress.value =
    (newStamp.timestamp / playerState.value.video.duration) * 100;

  if (Math.abs(delta) <= allowedDelta) {
    maySync = false;
  }

  if (
    (Math.abs(delta) > allowedDelta && maySync) ||
    Math.abs(delta) > allowedDelta * 10
  ) {
    if (Math.abs(delta) > bufferTime * 2) {
      setTimeout(async () => {
        player.playVideo();
      }, bufferTime * 2000);
      player.pauseVideo().then(() => {
        player.seekTo(newStamp.timestamp + bufferTime * 2, true);
      });
    } else {
      player.seekTo(newStamp.timestamp, true).then(() => {
        player.playVideo();
      });
    }
  }
});

socket.on("screen-settings-update", (newValue) => {
  screenSettings.value = newValue
});

socket.on("queue-update", (newQueue) => {
  queue.value = newQueue.queue;
});

socket.on("photo-update", (newPhoto) => {
  photo.value = newPhoto;
});
</script>
<style scoped>
:global(.small-player){
  width: calc(20% - 0.8rem)!important;
  position: absolute !important;
  right: 1rem !important;
  bottom: 8.5rem !important;
  left: unset !important;
  height: unset !important;
  aspect-ratio: 16 / 9;
  border-radius: 0.5rem;
  border-left: 4px solid rgb(0, 170, 192);
}

:global(.small-player.hide-queue){
  bottom: 0.5rem !important;
}


/* Target the iframe inside the dynamically created div */
::v-deep(iframe) {
  aspect-ratio: 16 / 9;
  width: 100%;
  height: 100%;
  position: absolute;
  top: unset;
  left: unset;
}
</style>