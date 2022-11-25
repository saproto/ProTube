<template>
  <div class="dark:bg-proto_background_gray-dark">
    <div class="absolute grid grid-cols-3 gap-4 w-full pt-3 ">
      <div class=""></div> <!-- empty filler block for the grid -->
      <div >
        <div v-show="screenCode !== -1" class="bg-white dark:bg-proto_secondary_gray-dark shadow-lg rounded-lg ring-1 ring-black ring-opacity-5 text-2xl px-4 py-2 mx-auto font-medium text-gray-900 dark:text-gray-50 max-w-min">{{ screenCode }}</div>
      </div>
      <div v-show="playerState.playerMode !== MODES.IDLE" class="bg-white dark:bg-proto_secondary_gray-dark shadow-lg rounded-lg ring-1 ring-black ring-opacity-5 px-4 py-2 ml-auto mr-4 font-medium text-gray-900 dark:text-gray-50 ">
        <div class="text-sm text-gray-600 dark:text-gray-300 mr-1">
          Now playing:
        </div>
        <span class="">
          {{ playerState.video.title }}
        </span>
        <div class="mt-1">
          <span class=" text-sm text-gray-600 dark:text-gray-300">
            Added by: 
          </span>
          {{ playerState.video?.user?.name }}
        </div>
      </div>
    </div>
    <div v-if="playerState.playerMode === MODES.IDLE" class="grid place-items-center min-h-screen">
      <RadioScreen v-if="playerState.playerType === TYPES.RADIO" :radio="playerState.radio" :volume="volume"/>
      <div v-else class="dark:text-white text-4xl">
          Nothing currently in the queue...<br>
          Visit protu.be to add some tunes!
      </div>
    </div>
    <div v-show="playerState.playerType === TYPES.VIDEO && playerState.playerMode !== MODES.IDLE " >
      <div :id="playerID" class="w-full min-h-screen" />
    </div>
  </div>
  <ReconnectionHandler v-if="screenCode === -1" :socket="socket" :maxAttempts="5"/>
</template>

  
<script setup>
import RadioScreen from '@/components/RadioScreen'
import ReconnectionHandler from '@/components/ReconnectionHandler'
import { onMounted, onBeforeUnmount, onBeforeMount, ref, defineProps, watch, defineEmits } from 'vue'
import socket, { connectSocket } from '@/js/ScreenSocket'
import YoutubePlayer from 'youtube-player'
import { MODES, TYPES } from '../../../utils/constants'

const playerID = "player-"+Math.random();
let player;
const playerState = ref({
  playerMode: MODES.IDLE,
  playerType: TYPES.VIDEO,
  queue: [],
  radio: {},
  timestamp: 0,
  video: {},
  volume: 0,
});

const emit = defineEmits(['youtube-media-error']);
const props = defineProps({
    volume: {
        type: Number,
        default: -1
    },
    screenCode: {
      type: Number,
      default: -1
    }
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
        loop: 0
      },

    });

    // the iframe api player generates any error (unplayable media)
    player.on('error', (event) => {
      emit('youtube-media-error', event.data);
    });
    
});

watch(() => props.volume, () => {
    if(props.volume < 0) return;
    player.setVolume(props.volume);
});

onBeforeUnmount(() => {
    socket.disconnect();
});

socket.on('player-update', (newState) => {
    if(newState.playerType === TYPES.VIDEO){
        if(newState.playerMode === MODES.PLAYING) player.loadVideoById(newState.video.id, newState.timestamp);
        else player.pauseVideo();
    } else if(playerState.value.playerType === TYPES.VIDEO) player.stopVideo();
    playerState.value = newState;
});

socket.on('new-video-timestamp', async (newStamp) => {
    if (Math.abs(await player.getCurrentTime() - newStamp) > 5){
      player.seekTo(newStamp, true);
      if(await player.getPlayerState() === 2) player.playVideo();
    }
});


</script>