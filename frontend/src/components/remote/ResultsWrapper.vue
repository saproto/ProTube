<script setup lang="ts">
import SkeletonResult from '@components/skeletons/SkeletonResult.vue';
import { useSearchVideosStore } from '@stores/searchVideosStore';
import VideoCard from './VideoCard.vue';

const searchVideos = useSearchVideosStore();
</script>

<template>
    <div v-if="searchVideos.status.isLoading || searchVideos.foundVideos.length > 0">
        <ul
            v-if="searchVideos.status.isLoading"
            class="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4"
        >
            <SkeletonResult v-for="index in 16" :key="index" />
        </ul>
        <ul v-else class="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
            <VideoCard
                v-for="(video, index) in searchVideos.foundVideos"
                :key="video.video_id"
                :index="index"
                :title="video.title"
                :channel="video.title"
                :duration="video.duration_formatted"
                :views="video.views_formatted"
                :thumbnail="video.thumbnail"
                :clickable="true"
                :video-i-d="video.video_id"
                @video-clicked="searchVideos.addToQueue(video.video_id)"
            />
        </ul>
        <button
            v-if="searchVideos.videoContinuationToken !== null"
            class="bg-proto_blue mt-4 flex-none rounded-md py-2 px-4 text-center text-white duration-200 hover:-translate-x-1 hover:-translate-y-0.5 hover:opacity-80 hover:shadow-lg"
        >
            Get more results
        </button>
    </div>
</template>
