<template>
  <ContentField>
    <div class="h-10">
    <label class="absolute text-2xl text-gray-600 dark:text-white">
      The current queue - {{ queueDuration }}</label
    >
    </div>
    <div
      class="scrollbar-thin scrollbar-thumb-gray-600 overflow-y-auto h-[65vh] scrollbar-track-gray-900 py-5 pt-10">
      <div v-if="skeletonLoading" class="flex-nowrap">
        <ul
          v-for="index in 10"
          :key="index"
          class="inline-block grid min-h-full w-96 mt-1 px-3">
          <li
            class="border-proto_blue group group col-span-1 flex cursor-pointer flex-col rounded-sm border-l-4 text-center shadow">
            <SkeletonResult />
          </li>
        </ul>
      </div>
      <div v-if="!skeletonLoading" class="flex-no-wrap">
        <ul
          v-for="(video, index) in queue"
          :video="video"
          :index="index"
          :key="video.id"
          class="inline-block grid min-h-full px-3 mt-1 w-96">
          <li
            :style="{ background: `url(${video.thumbnail.url})` }"
            style="
              background-repeat: no-repeat;
              background-size: cover;
              background-position: center center;
            "
            :class="admin ? 'group cursor-pointer ' : ''"
            class="border-proto_blue group col-span-1 flex flex-col rounded-sm border-l-4 text-center shadow">
            <div
              @click="removeFromQueue(video)"
              :class="
                admin
                  ? 'group-hover:bg-white/60 group-hover:dark:bg-stone-800/60'
                  : ''
              "
              class="rounded-m flex flex-1 flex-col border-t border-b border-r border-gray-400 bg-white/80 px-8 py-4 duration-200 dark:border-gray-800/80 dark:bg-stone-800/80">
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
                  <span
                    v-if="admin"
                    class="ml-auto truncate rounded-sm bg-red-600 p-1 text-xs font-medium text-white opacity-0 shadow-lg duration-300 group-hover:opacity-100">
                    Remove
                  </span>
                </li>
              </ul>
            </div>
          </li>
        </ul>
        <div
          v-if="!skeletonLoading && queue.length < 1"
          class="mt-5 text-gray-400">
          The queue is empty, try searching for some fun tunes!
        </div>
      </div>
    </div>
  </ContentField>
</template>

<script setup>
import ContentField from "@/layout/ContentField.vue";
import SkeletonResult from "@/components/skeletons/SkeletonResult.vue";
import { ref, computed } from "vue";
import adminSocket from "@/js/AdminRemoteSocket";
import normalSocket from "@/js/RemoteSocket";
import enums from "@/js/Enums";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";

const emit = defineEmits(["display-toast"]);
const skeletonLoading = ref(true);
const queue = ref([]);
const socket = computed(() => {
  if (props.admin) return adminSocket;
  return normalSocket;
}).value;

const queueDuration = ref("--:--:--");

const props = defineProps({
  admin: {
    type: Boolean,
    default: false,
  },
});

async function removeFromQueue(video) {
  if (!props.admin) return;
  //remove video from queue
  const data = await new Promise((resolve) => {
    socket.emit("remove-video", video, (callback) => {
      resolve(callback);
    });
  });
  emit("display-toast", {
    status: data.status ?? enums.STATUS.SUCCESS,
    message: data.message ?? `Successfully skipped video!`,
  });
}

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
