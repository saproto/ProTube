<template>
  <ContentField>
    <div
      v-if="!skeletonLoading && videos.length === 0"
      class="block text-gray-200">
      <div class="flex items-center px-4 py-4 sm:px-6">
        <div class="mx-auto mb-1 flex min-w-0 items-center text-3xl">
          <span class="text-stone-400 dark:text-white"
            >Start searching for your favorite tunes!</span
          >
        </div>
      </div>
    </div>
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
