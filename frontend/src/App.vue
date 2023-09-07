<script setup lang="ts">
import ToastsModal from '@components/ToastsModal.vue';
import ServiceWorker from './ServiceWorker.vue';
import route from 'routeHelper';
console.log(route('http.create.test3', {
    'id'
}));

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
