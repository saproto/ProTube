<template>
  <ContentField>
    <label class="text-2xl text-gray-600 dark:text-white">
      Radio stations
    </label>
    <input
      v-model="radiofilter"
      class="outline-hidden ml-4 rounded-md border border-gray-400 bg-white pl-2 text-gray-700 placeholder-gray-500 focus:placeholder-gray-600"
      placeholder="Filter" />
    <div
      class="scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-proto_background_gray dark:scrollbar-thumb-neutral-800 dark:scrollbar-track-proto_background_gray-dark flex overflow-x-scroll py-5">
      <div class="flex flex-nowrap">
        <template v-if="!skeletonLoading">
          <div
            v-for="radio in filteredRadioStations"
            :key="radio"
            class="inline-block px-3">
            <div
              class="h-15 w-24 rounded-lg duration-200 hover:-translate-x-1 hover:-translate-y-0.5 hover:cursor-pointer hover:opacity-80 hover:shadow-lg"
              @click="setRadio(radio.z, radio.o)">
              <img
                :alt="radio.o"
                class="bg-proto_blue hover:bg-proto_blue/80 overflow-hidden truncate rounded-lg text-white"
                :src="`https://www.nederland.fm/i/l/${radio.z}.gif`" />
            </div>
          </div>
          <div
            v-if="filteredRadioStations.length < 1"
            class="h-15 ml-8 text-gray-400">
            No radio stations found..
          </div>
        </template>
        <template v-else>
          <div v-for="index in 20" :key="index" class="inline-block px-3">
            <div
              class="bg-proto_blue hover:bg-proto_blue/80 h-15 w-24 animate-pulse overflow-hidden truncate rounded-lg text-white shadow-md"></div>
          </div>
        </template>
      </div>
    </div>
  </ContentField>
</template>

<script setup>
import ContentField from "@/layout/ContentField.vue";
import { ref, computed } from "vue";
import socket from "@/js/AdminRemoteSocket";
import enums from "@/js/Enums";

const radioStations = ref([]);
const skeletonLoading = ref(true);
const radiofilter = ref("");

const emit = defineEmits(["display-toast"]);

// retrieving the radiostations and stop skeletonloading
socket.on("connect", async () => {
  const data = await new Promise((resolve) => {
    socket.emit("get-radiostations", (stations) => {
      resolve(stations);
    });
  });
  radioStations.value = data;
  skeletonLoading.value = false;
});

const filteredRadioStations = computed(() => {
  return radioStations.value.filter((station) =>
    station.o.toLowerCase().includes(radiofilter.value.toLowerCase())
  );
});

async function setRadio(radioID, name) {
  const data = await new Promise((resolve) => {
    socket.emit("play-radio", radioID, (callback) => {
      resolve(callback);
    });
  });
  emit("display-toast", {
    status: data.status ?? enums.STATUS.SUCCESS,
    message: data.message ?? `Successfully started playing: ${name}`,
  });
}
</script>
