<template>
  <div
    class="relative flex h-full w-full -rotate-90 items-center justify-end overflow-hidden rounded-full">
    <!--background accent ring-->
    <div
      class="h-full w-full rounded-full bg-gray-600 ring-2 ring-inset ring-gray-400" />
    <!-- the stripes for the indicators-->
    <div
      v-for="i in 12"
      v-bind:key="i"
      class="absolute flex h-0.5 w-1/2 origin-left justify-end"
      :style="`transform:rotate(${i * (360 / 12)}deg)`">
      <div
        class="w-full rounded"
        :class="i % 3 === 0 ? 'w-6 bg-proto_blue' : 'w-3 bg-gray-400'">
      </div>
    </div>

    <!--minute hand-->
    <div
      class="absolute h-1 w-1/2 origin-left rounded-full bg-gray-300"
      :style="minuteRotation" />
    <!--hour hand-->
    <div class="absolute h-1 w-1/2 origin-left" :style="hourRotation">
      <div class="h-full w-2/3 rounded-full bg-gray-300" />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";

const minute = ref(0);
const hour = ref(0);

const hourRotation = computed(() => {
  return `transform:rotate(${hour.value * (360 / 12) + minute.value*(360.0 / 12 / 60)}deg)`;
});

const minuteRotation = computed(() => {
  return `transform:rotate(${minute.value * (360 / 60)}deg)`;
});

onMounted(() => {
  const date = new Date();
  minute.value = date.getMinutes();
  hour.value = date.getHours();
  setInterval(() => {
    const date = new Date();
    minute.value = date.getMinutes();
    hour.value = date.getHours();
  }, 1000);
});
</script>
