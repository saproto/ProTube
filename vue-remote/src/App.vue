<template>
    <div v-if="currentRoute == 'Screen' || currentRoute == 'Admin Screen' || currentRoute == 'Error' || currentRoute == 'Local Admin Screen'">
        <router-view v-slot="{ Component, route }">
            <transition :name="route.meta.transition || ''">
                <component :is="Component" />
            </transition>
        </router-view>
    </div>
    <div v-else class="xl:max-w-screen-2xl mx-auto md:pt-8 sm:pt-0">
        <router-view v-slot="{ Component }">
            <!-- <keep-alive> -->
                <component :is="Component" />
            <!-- </keep-alive> -->
        </router-view>
    </div>
</template>

<script setup>
import { useRoute } from 'vue-router'
import { computed } from 'vue'

const currentRoute = computed(() => {
    return useRoute().name;
});
</script>

<style>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>