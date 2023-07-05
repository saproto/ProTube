<script setup lang="ts">
import PrimaryLayout from '@/layouts/PrimaryLayout.vue';
</script>

<template>
    <PrimaryLayout>
        <template #header> Header </template>
        <template #body> Body </template>
        <template #sidebar> Sidebar </template>
    </PrimaryLayout>
</template>
