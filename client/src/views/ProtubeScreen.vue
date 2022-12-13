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
      <div
          v-show="playerState.playerMode !== enums.MODES.IDLE"
          class="dark:bg-proto_secondary_gray-dark ml-auto mr-4 rounded-lg bg-white px-4 py-2 font-medium text-gray-900 shadow-lg ring-1 ring-black ring-opacity-5 dark:text-gray-50">
        <div class="mr-1 text-sm text-gray-600 dark:text-gray-300">
          Now playing:
        </div>
        <span class="">
          {{ playerState.video.title }}
        </span>
        <div class="mt-1">
          <span class="text-sm text-gray-600 dark:text-gray-300">
            Added by:
          </span>
          {{ playerState.video?.user?.name }}
        </div>
      </div>
    </div>

    <div
        v-if="playerState.playerMode === enums.MODES.IDLE"
        class="grid min-h-screen place-items-center">
      <RadioScreen
          v-if="playerState.playerType === enums.TYPES.RADIO"
          :radio="playerState.radio"
          :volume="volume"/>
      <div v-else class="text-4xl dark:text-white">
        Nothing currently in the queue...<br/>
        Visit protu.be to add some tunes!
      </div>
    </div>
    <div
        v-show="
        playerState.playerType === enums.TYPES.VIDEO &&
        playerState.playerMode !== enums.MODES.IDLE
      ">
      <div :id="playerID" class="min-h-screen w-full"/>
    </div>
  </div>
  <div class="absolute bottom-0 mb-1 opacity-80 rounded-lg w-screen">
    <div
        class="rounded-sm rounded-lg border-proto_blue border-l-4 p-1 ml-1 max-w-[10%] dark:bg-proto_secondary_gray-dark rounded-lg bg-white px-4 py-2 font-medium text-gray-900 shadow-lg ring-1 ring-black ring-opacity-5 dark:text-gray-50">
      Queue: {{ QueueDuration }}
    </div>
    <div class="flex flex-1">
      <ul
          v-for="(video, index) in queue.slice(0,5)"
          :video="video"
          :index="index"
          :key="video.id"
          class="inline-block p-1 mb-1 w-1/5">
        <div
            :style="{ background: `url(${video.thumbnail.url})` }"
            style="
              background-repeat: no-repeat;
              background-size: cover;
              background-position: center center;
            "
            class="group col-span-1 mr-4 flex w-full h-full flex-1 rounded-sm rounded-lg border-proto_blue border-l-4 text-center shadow inline-block">
          <div
              class="rounded-m flex w-full flex-col border-t border-b border-r border-gray-400 bg-white/80 px-8 py-4 duration-200 dark:border-gray-800/80 dark:bg-stone-800/80">
            <h3
                class="text-md text-left font-bold text-gray-800 dark:text-stone-300">
              {{ video.title }}
            </h3>
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
                    <font-awesome-icon
                        icon="fa-solid fa-microphone"
                        fixed-width>
                    </font-awesome-icon>
                  </span>
                <span class="truncate">
                    {{ video.channel }}
                  </span>
              </li>
              <li class="flex flex-1 text-right">
                  <span class="fa-li">
                    <font-awesome-icon
                        icon="fa-solid fa-clock fa-li"
                        fixed-width>
                    </font-awesome-icon>
                  </span>
                <span class="truncate">
                    {{ video.durationFormatted }}
                  </span>
              </li>
            </ul>
          </div>
        </div>
      </ul>
    </div>

  </div>
  <ReconnectionHandler
      v-if="screenCode === -1"
      :socket="socket"
      :maxAttempts="5"/>
</template>

<script setup>
import RadioScreen from "@/components/RadioScreen";
import ReconnectionHandler from "@/components/ReconnectionHandler";
import {onMounted, onBeforeUnmount, onBeforeMount, ref, watch} from "vue";
import socket, {connectSocket} from "@/js/ScreenSocket";
import YoutubePlayer from "youtube-player";
import enums from "@/js/Enums";

const playerID = "player-" + Math.random();
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

onBeforeMount(() => {
  connectSocket();
});

onMounted(() => {
  player = YoutubePlayer(playerID, {
    host: "https://www.youtube.com",
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
    if (newState.playerMode === enums.MODES.PLAYING)
      player.loadVideoById(newState.video.id, newState.timestamp);
    else player.pauseVideo();
  } else if (playerState.value.playerType === enums.TYPES.VIDEO)
    player.stopVideo();
  playerState.value = newState;
});

socket.on("new-video-timestamp", async (newStamp) => {
  if (Math.abs((await player.getCurrentTime()) - newStamp) > 5) {
    player.seekTo(newStamp, true);
    if ((await player.getPlayerState()) === 2) player.playVideo();
  }
});

const queueDuration = ref("--:--:--");
const skeletonLoading = ref(true);
const queue = ref([]);
// retrieving the queue and stop skeletonloading
socket.on("connect", async () => {
  const data = await new Promise((resolve) => {
    socket.emit("get-queue", (queue) => {
      resolve(queue);
    });
  });
  queue.value = data.queue;
  queueDuration.value = data.duration;
  skeletonLoading.value = false;
});

socket.on("queue-update", (newQueue) => {
  queueDuration.value = newQueue.duration;
  queue.value = newQueue.queue;
});

</script>
