<template>
  <div class="absolute bottom-0 mb-1 w-screen rounded-lg">
    <div class="flex justify-between">
      <div
        class="border-proto_blue dark:bg-proto_secondary_gray-dark ml-4 mb-1 rounded-lg border-l-4 bg-white p-1 px-4 py-2 font-medium text-gray-900 opacity-80 shadow-lg ring-1 ring-black ring-opacity-5 dark:text-gray-50">
        Queue: {{ currentTimeStamp.totalDuration }}
      </div>
    </div>
    <div class="mx-4 mb-1 grid grid-cols-5 gap-2 overflow-hidden">
      <VideoCard
        v-for="(video, index) in queueWithCurrent.slice(0, 5)"
        :key="video.id"
        :index="index"
        :title="video.title"
        :name="video.user.name"
        :channel="video.channel"
        :duration="video.durationFormatted"
        :thumbnail="video.thumbnail.url"
        :videoID="video.id"
        :textScrolling="true"
        :roundedCorners="true"
        :progressBar="index === 0 ? queueProgress : 0"
        :opacity="0.9" />
    </div>
  </div>
</template>

<script setup>
import VideoCard from "@/components/VideoCard.vue";
import { computed, defineProps } from "vue";

const props = defineProps({
  queue: Array,
  currentTimeStamp: Object,
  currentVideo: Object,
});

// Compute the queue with the currently playing video at the front
const queueWithCurrent = computed(() => {
  // if currentvideo = empty -> queue is empty
  if (Object.keys(props.currentVideo).length === 0) return [];
  return [props.currentVideo].concat(props.queue);
});

// Returns percentage of current queue
const queueProgress = computed(() => {
  return (props.currentTimeStamp.timestamp / props.currentVideo.duration) * 100;
});
</script>
