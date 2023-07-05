<script setup lang="ts">
/* eslint vue/no-multiple-template-root: 0 */ // Allow multiple root elements only in this file
import ToastsModal from '@components/ToastsModal.vue';
import ServiceWorker from './ServiceWorker.vue';
</script>

<template>
    <ToastsModal />
    <ServiceWorker />
    <router-view />
</template>
