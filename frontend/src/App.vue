<script setup lang="ts">
import ToastsModal from '@components/ToastsModal.vue';
import ServiceWorker from './ServiceWorker.vue';
import route from 'routeHelper';
route('http.create.test');
</script>

<template>
    <ToastsModal />
    <ServiceWorker />
    <router-view />
</template>
