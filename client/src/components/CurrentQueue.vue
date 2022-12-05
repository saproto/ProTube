<template>
  <ContentField>
    <label class="absolute text-2xl text-gray-600 dark:text-white">
      The current queue - {{ queueDuration }}</label
    >
    <div class="no-scrollbar flex overflow-x-scroll pt-7 md:pt-10">
      <div v-if="skeletonLoading" class="flex h-full flex-nowrap">
        <ul
          v-for="index in 10"
          :key="index"
          class="inline-block grid min-h-full w-96 px-3">
          <li
            class="group group col-span-1 flex cursor-pointer flex-col rounded-sm border-l-4 border-proto_blue text-center shadow">
            <!--divide-y dark:divide-proto_green divide-gray-500-->
            <SkeletonResult />
          </li>
        </ul>
      </div>
      <div v-if="!skeletonLoading" class="h-full md:flex md:flex-nowrap">
        <ul
          v-for="(video, index) in queue"
          :video="video"
          :index="index"
          :key="video.id"
          class="mt-3 inline-block grid min-h-full w-full px-3 md:mt-0 md:w-96">
          <li
            :style="{ background: `url(${video.thumbnail.url})` }"
            style="
              background-repeat: no-repeat;
              background-size: cover;
              background-position: center center;
            "
            :class="admin ? 'group cursor-pointer ' : ''"
            class="group col-span-1 flex flex-col rounded-sm border-l-4 border-proto_blue text-center shadow">
            <!--divide-y dark:divide-proto_green divide-gray-500-->
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
              <div class="mt-auto w-full">
                <div
                  class="justify-bottom mt-auto flex flex-1 text-right align-bottom text-gray-900">
                  <svg
                    class="align mr-1.5 h-5 w-5 shrink-0 dark:text-stone-300"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                    xmlns="http://www.w3.org/2000/svg">
                    <path
                      fill-rule="evenodd"
                      d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                      clip-rule="evenodd"></path>
                  </svg>
                  <span
                    class="truncate text-sm font-medium text-gray-900 dark:text-stone-300"
                    >{{ video.user.name }}</span
                  >
                </div>
                <div class="mt-0 flex flex-1 text-right text-gray-900">
                  <svg
                    class="align mr-1.5 h-5 w-5 shrink-0 dark:text-stone-300"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="currentColor">
                    <path
                      d="M8.25 4.5a3.75 3.75 0 117.5 0v8.25a3.75 3.75 0 11-7.5 0V4.5z" />
                    <path
                      d="M6 10.5a.75.75 0 01.75.75v1.5a5.25 5.25 0 1010.5 0v-1.5a.75.75 0 011.5 0v1.5a6.751 6.751 0 01-6 6.709v2.291h3a.75.75 0 010 1.5h-7.5a.75.75 0 010-1.5h3v-2.291a6.751 6.751 0 01-6-6.709v-1.5A.75.75 0 016 10.5z" />
                  </svg>
                  <span
                    class="truncate text-sm font-medium text-gray-900 dark:text-stone-300"
                    >{{ video.channel }}</span
                  >
                </div>
                <div class="mt-0 flex flex-1 text-right text-gray-900">
                  <svg
                    class="mr-1.5 h-5 w-5 shrink-0 dark:text-stone-300"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                    xmlns="http://www.w3.org/2000/svg">
                    <path
                      fill-rule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                      clip-rule="evenodd"></path>
                  </svg>
                  <span
                    class="truncate text-sm font-medium text-gray-900 dark:text-stone-300"
                    >{{ video.durationFormatted }}</span
                  >
                  <span
                    v-if="admin"
                    class="ml-auto truncate rounded-sm bg-red-600 p-1 text-xs font-medium text-white opacity-0 shadow-lg duration-300 group-hover:opacity-100"
                    >Remove</span
                  >
                </div>
              </div>
            </div>
          </li>
        </ul>
        <div
          v-if="!skeletonLoading && queue.length < 1"
          class="ml-8 text-gray-400">
          Empty queue
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
