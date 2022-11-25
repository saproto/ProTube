<template>
  <ContentField>
    <div v-if="!skeletonLoading && videos.length === 0" class="block text-gray-200 ">
      <div class="flex items-center px-4 py-4 sm:px-6">
        <div class="min-w-0 mx-auto flex items-center text-3xl mb-1">
          <span class="dark:text-white text-stone-400" >Start searching for your favorite tunes!</span>
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
import ContentField from '@/layout/ContentField.vue'

defineProps({
  videos: Object,
  skeletonLoading: Boolean
})

</script>

<style>
</style>
