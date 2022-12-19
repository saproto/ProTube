<template>
  <ContentField id="nav" style="transition: all 0.5s ease 0.5s" class="sticky top-0">
    <div class="items-top flex flex-col justify-between pb-2 md:flex-row">
      <label class="text-2xl text-gray-600 dark:text-white">
        Queue - {{ queueDuration }}
      </label>
      <button
        @click="clearQueue()"
        v-if="queue.length >= 1 && admin"
        class="bg-proto_blue mt-4 flex-none rounded-md px-4 text-center text-white duration-200 hover:-translate-x-1 hover:-translate-y-0.5 hover:opacity-80 hover:shadow-lg md:mt-0">
        Clear queue
      </button>
    </div>
    <div
      class="scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-proto_background_gray dark:scrollbar-thumb-neutral-800 dark:scrollbar-track-proto_background_gray-dark flex max-h-[84vh] justify-center overflow-y-scroll overscroll-contain px-0">
      <div v-if="skeletonLoading" class="w-full">
        <ul class="grid gap-2">
          <SkeletonResult 
            v-for="index in 10"
            :key="index"
          />
        </ul>
      </div>
      <div v-if="!skeletonLoading" class="w-full">
        <ul class="gap-2 grid">
          <VideoCard 
            v-for="(video, index) in queue"
            :key="video.id"
            :index="index"
            :title="video.title"
            :name="video.user.name"
            :channel="video.channel"
            :duration="video.durationFormatted"
            :thumbnail="video.thumbnail.url"
            :removeButton="true"
            :videoID="video.id"
            @remove-clicked="removeFromQueue"
          />
        </ul>
        <div
          v-if="!skeletonLoading && queue.length < 1"
          class="mt-4 text-gray-400">
          The queue is empty, try searching for some fun tunes!
        </div>
      </div>
    </div>
  </ContentField>
</template>

<script setup>
import ContentField from "@/layout/ContentField.vue";
import SkeletonResult from "@/components/skeletons/SkeletonResult.vue";
import VideoCard from "@/components/VideoCard.vue";
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
});

const queueDuration = ref("--:--:--");

const props = defineProps({
  admin: {
    type: Boolean,
    default: false,
  },
});

async function removeFromQueue(videoID) {
  if (!props.admin) return;
  const data = await new Promise((resolve) => {
    socket.value.emit("remove-video", videoID, (callback) => {
      resolve(callback);
    });
  });
  emit("display-toast", {
    status: data.status ?? enums.STATUS.SUCCESS,
    message: data.message ?? `Successfully skipped video!`,
  });
}

async function clearQueue() {
  if (!props.admin) return;
  const data = await new Promise((resolve) => {
    socket.value.emit("clear-queue", (callback) => {
      resolve(callback);
    });
  });
  emit("display-toast", {
    status: data.status ?? enums.STATUS.SUCCESS,
    message: data.message ?? `Succesfully removed all videos from the queue!`,
  });
}

// retrieving the queue and stop skeletonloading
socket.value.on("connect", async () => {
  const data = await new Promise((resolve) => {
    socket.value.emit("get-queue", (queue) => {
      resolve(queue);
    });
  });
  queue.value = data.queue;
  queueDuration.value = data.duration;
  skeletonLoading.value = false;
});

socket.value.on("queue-update", (newQueue) => {
  queueDuration.value = newQueue.duration;
  queue.value = newQueue.queue;
});
</script>