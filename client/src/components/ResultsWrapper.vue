<template>
  <ContentField v-if="skeletonLoading || videos.length > 0">
    <ul
      v-if="skeletonLoading"
      class="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
      <SkeletonResult v-for="index in 16" :key="index" />
    </ul>
    <ul
      v-else
      class="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
      <VideoCard
        v-for="(video, index) in videos"
        :key="video.id"
        :index="index"
        :title="video.title"
        :channel="video.channel"
        :duration="video.durationFormatted"
        :views="video.viewsFormatted"
        :thumbnail="video.thumbnail.url"
        :clickable="video?.status === undefined ? 'show' : ''"
        :videoID="video.id"
        :statusIcon="video.status"
        @video-clicked="addVideoToQueue" />
    </ul>
    <button
      v-if="videos.length > 17"
      class="bg-proto_blue mt-4 flex-none rounded-md px-4 py-2 text-center text-white duration-200 hover:-translate-x-1 hover:-translate-y-0.5 hover:opacity-80 hover:shadow-lg"
      @click="$emit('nextPage')">
      Get more results
    </button>
  </ContentField>
</template>

<script setup>
import SkeletonResult from "@/components/skeletons/SkeletonResult.vue";
import ContentField from "@/layout/ContentField.vue";
import VideoCard from "@/components/VideoCard.vue";
import enums from "@/js/Enums";
import socket from "@/js/RemoteSocket";

const emit = defineEmits(["display-toast"]);

const props = defineProps({
  videos: Object,
  continuationToken: String,
  skeletonLoading: Boolean,
});

async function addVideoToQueue(videoID) {
  // Disable the button
  props.videos.forEach((video) => {
    if (video.id === videoID) video.status = enums.STATUS.NOTHING;
  });
  const data = await new Promise((resolve) => {
    socket.emit("fetch-then-add-video", videoID, (callback) => {
      resolve(callback);
    });
  });
  // Set the status icon of the video accordingly
  props.videos.forEach((video) => {
    if (video.id === videoID) {
      video.status = data.success === true ? enums.STATUS.SUCCESS : data.status;
    }
  });
  emit("display-toast", {
    status: data.status ?? enums.STATUS.SUCCESS,
    message: data.message ?? "Successfully added to the queue!",
  });
}
</script>
