<!-- hardcoded countdown for ProtoTrip, should be made adjustable in the future -->
<template>
  <div
    class="border-proto_blue dark:bg-proto_secondary_gray-dark absolute top-0 left-0 mt-3 ml-4 w-2/5 rounded-lg border-l-4 bg-white pr-4 font-medium text-gray-900 shadow-lg ring-1 ring-black ring-opacity-5 dark:text-gray-50"
    style="
      background: url(https://static.saproto.com/image/32733/d8368c638dbb4c5e5cab9f0b8631d9d4fba34be2?w=800&h=300);
      background-repeat: no-repeat;
      background-size: cover;
      background-position: center center;
    ">
    <div
      class="dark:bg-proto_secondary_gray-dark/50 m-2 flex h-full w-full flex-col content-center rounded-lg bg-white/50 px-4">
      <h1 class="text-center text-3xl" style="text-shadow: #ffffff 1px 1px 10px">
        ProtoTrip 2023 location reveal & sign up
      </h1>
      <div v-if="!countdownOver" class="m-2 flex justify-center" id="countdown">
        <ul class="flex justify-center px-3">
          <li class="mx-3 text-4xl" style="color: white;
        text-shadow:
        -1px -1px 0 #000,
        1px -1px 0 #000,
        -1px 1px 0 #000,
        1px 1px 0 #000;">
            <span></span>{{ hours }} hours
          </li>
          <li class="mx-3 text-4xl" style="color: white;
        text-shadow:
        -1px -1px 0 #000,
        1px -1px 0 #000,
        -1px 1px 0 #000,
        1px 1px 0 #000;">
            <span></span>{{ minutes }} minutes
          </li>
          <li class="mx-3 text-4xl" style="color: white;
        text-shadow:
        -1px -1px 0 #000,
        1px -1px 0 #000,
        -1px 1px 0 #000,
        1px 1px 0 #000;">
            <span></span>{{ seconds }} seconds
          </li>
        </ul>
      </div>
      <!-- if any of you spoil the location i will royeer you -->
      <h1
        v-else
        class="m-2 animate-bounce text-center text-4xl"
        style="color: white;
        text-shadow:
        -1px -1px 0 #000,
        1px -1px 0 #000,
        -1px 1px 0 #000,
        1px 1px 0 #000;">
        We will venture to Aarhus, Denmark!
      </h1>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";

onMounted(() => {
  calculateNewTimes();
  setInterval(calculateNewTimes, 1000);
});

const calculateNewTimes = () => {
  let difference = countdownTo.value - new Date();
  hours.value = (difference / 3.6e6) | 0;
  minutes.value = ((difference % 3.6e6) / 6e4) | 0;
  seconds.value = Math.round((difference % 6e4) / 1e3);
  if (difference <= 0) {
    countdownOver.value = true;
  }
};

const countdownTo = ref(new Date("February 8, 2023 13:00:00"));
const countdownOver = ref(false);
const hours = ref(0);
const minutes = ref(0);
const seconds = ref(0);
</script>
