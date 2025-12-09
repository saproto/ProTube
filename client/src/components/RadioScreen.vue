<template>
  <div class="z-50">
    <div
      style="width: 158px; height: 101.75px"
      class="relative overflow-hidden rounded-lg p-1 text-white">
      <img
        :alt="radio.o"
        class="bg-proto_blue hover:bg-proto_blue/80 absolute z-10 overflow-hidden truncate rounded-lg"
        style="width: 150px"
        :src="`https://www.nederland.fm/i/l/${radio.z}.gif`" />
      <div
        class="from-proto_blue bg-linear-to-r absolute -left-1/4 -top-1/2 h-52 w-52 animate-[spin_3s_linear_infinite] via-white to-white"></div>
    </div>
    <br />
    <audio
      id="radio"
      autoplay
      :src="radio.jp"
      frameborder="0"
      width="400"
      height="200"></audio>
    <button
      v-if="playButton"
      class="bg-proto_blue hover:bg-proto_blue/80 mx-auto my-auto mt-5 flex rounded-md px-2 py-1 text-white shadow-md"
      @click="playClick">
      play audio
    </button>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from "vue";

const playButton = ref(true);
const props = defineProps({
  radio: { type: Object, default: null },
  volume: {
    type: Number,
    default: -1,
  },
});

onMounted(() => {
  document.getElementById("radio").addEventListener("canplaythrough", () => {
    if (!document.getElementById("radio").paused) playButton.value = false;
    if (props.volume < 0) return;
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
