<script setup lang="ts">
import ToastsModal from '@components/ToastsModal.vue';
import ServiceWorker from './ServiceWorker.vue';
</script>

<template>
    <ToastsModal />
    <ServiceWorker />
    <router-view />
</template>
