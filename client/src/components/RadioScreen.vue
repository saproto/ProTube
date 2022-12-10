<template>
  <div class="z-50">
    <img
      :alt="radio.o"
      class="bg-proto_blue hover:bg-proto_blue/80 overflow-hidden truncate rounded-lg text-white"
      style="width: 150px"
      :src="`https://www.nederland.fm/i/l/${radio.z}.gif`" />
    <br />
    <audio
      id="radio"
      autoplay
      :src="radio.m"
      frameborder="0"
      width="400"
      height="200">
    </audio>
    <button
      v-if="playButton"
      class="bg-proto_blue hover:bg-proto_blue/80 my-auto mx-auto mt-5 flex rounded-md py-1 px-2 text-white shadow-md"
      @click="playClick">
      play audio
    </button>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from "vue";

const playButton = ref(true);
const props = defineProps({
  radio: Object,
  volume: {
    type: Number,
    default: -1,
  },
});

onMounted(() => {
  document.getElementById("radio").addEventListener("canplaythrough", () => {
    if (!document.getElementById("radio").paused) playButton.value = false;
    document.getElementById("radio").volume = props.volume / 100;
  });
});

// enabling volume control via prop watcher
watch(
  () => props.volume,
  (to) => {
    if (props.volume < 0) return;
    document.getElementById("radio").volume = to / 100;
  }
);

function playClick() {
  document.getElementById("radio").play();
  playButton.value = false;
}
</script>
