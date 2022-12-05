<template>
  <!-- snowflake (after use delete entire keepalive block) -->
  <keep-alive>
    <SnowFall
      :class="
        currentRoute == 'Screen' ||
        currentRoute == 'Admin Screen' ||
        currentRoute == 'Error' ||
        currentRoute == 'Local Admin Screen'
          ? ''
          : '-z-10'
      " />
  </keep-alive>
  <div
    v-if="
      currentRoute == 'Screen' ||
      currentRoute == 'Admin Screen' ||
      currentRoute == 'Error' ||
      currentRoute == 'Local Admin Screen'
    ">
    <router-view v-slot="{ Component, route }">
      <transition :name="route.meta.transition || ''">
        <component :is="Component" />
      </transition>
    </router-view>
  </div>
  <div v-else class="mx-auto sm:pt-0 md:pt-8 xl:max-w-screen-2xl">
    <router-view v-slot="{ Component }">
      <!-- <keep-alive> -->
      <component :is="Component" />
      <!-- </keep-alive> -->
    </router-view>
  </div>
</template>

<script setup>
import { useRoute } from "vue-router";
import { computed } from "vue";
// snowflake (after use delete import statement)
import SnowFall from "@/components/SnowFall";

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
