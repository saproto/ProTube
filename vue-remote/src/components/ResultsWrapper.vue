<template>
  <ContentField>
    <div v-if="!skeletonLoading && videos.length === 0" class="block text-gray-200 ">
      <div class="flex items-center px-4 py-4 sm:px-6">
        <div class="min-w-0 mx-auto flex items-center text-3xl mb-1">
          <span class="dark:text-white text-true_gray-400" >Start searching for your favorite tunes!</span>
          <!--<svg :class="isLoading ? 'animate-bounce' : '' " class="w-14 h-14 mr-2 ml-10 mt-2 text-white dark:text-proto_background_gray-dark" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
          </svg>-->
        </div>
      </div>
    </div>
    <ul v-if="skeletonLoading" class="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
      <SkeletonResult v-for="index in 16" :key="index" />
    </ul>
    <ul v-else class="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
      <Result v-on:display-toast="$emit('display-toast', $event)" v-for="(video, index) in videos" :video="video" :index="index" :key="video.id" />
    </ul>
  </ContentField>
</template>

<script setup>
import Result from '@/components/Result.vue'
import SkeletonResult from '@/components/skeletons/SkeletonResult.vue'
import { defineProps } from 'vue'
// import { eventBus } from '@/js/eventbus'
import ContentField from '@/layout/ContentField.vue'

// const results = ref([]);
// const isLoading = ref(false);
defineProps({
  videos: Object,
  skeletonLoading: Boolean
})

</script>

<style>
</style>
