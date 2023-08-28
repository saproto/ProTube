<script setup lang="ts">
import ToastsModal from '@components/ToastsModal.vue';
import ServiceWorker from './ServiceWorker.vue';
import route from 'routeHelper';
route('http.create.test');

const f: http.create.test3 = {
    name: 3,
};

console.log(f);
</script>

<template>
    <ToastsModal />
    <ServiceWorker />
    <router-view />
</template>
