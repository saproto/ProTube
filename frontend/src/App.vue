<script setup lang="ts">
import ToastsModal from '@components/ToastsModal.vue';
import ServiceWorker from './ServiceWorker.vue';

const f: http.create.test2.request = {
    test: 5,
};

console.log(f);
</script>

<template>
    <ToastsModal />
    <ServiceWorker />
    <router-view />
</template>
