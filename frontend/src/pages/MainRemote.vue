<script setup lang="ts">
import PrimaryLayout from '@/layouts/PrimaryLayout.vue';
import RemoteHeader from '@/components/remote/RemoteHeader.vue';
import { useSearchVideosStore } from '@stores/searchVideosStore';
import route from 'routeHelper';

const videoSearch = useSearchVideosStore();
</script>

<template>
    <PrimaryLayout>
        <template #header>
            <RemoteHeader />
        </template>
        <template #body>
            Body {{ videoSearch.status.isLoading }} {{ route('http.create.test3', { id: '3' }) }}</template
        >
        <template #sidebar> Sidebar </template>
    </PrimaryLayout>
</template>
