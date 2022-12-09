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
      <SearchResult
        v-on:display-toast="$emit('display-toast', $event)"
        v-for="(video, index) in videos"
        :video="video"
        :index="index"
        :key="video.id" />
    </ul>
  </ContentField>
</template>

<script setup>
import SearchResult from "@/components/SearchResult.vue";
import SkeletonResult from "@/components/skeletons/SkeletonResult.vue";
import ContentField from "@/layout/ContentField.vue";

defineProps({
  videos: Object,
  skeletonLoading: Boolean,
});
</script>

<style></style>
