<template>
  <!-- snowflakes in december -->
  <keep-alive v-if="new Date().getMonth()===11">
    <SnowFall
      :class="
        currentRoute === 'Screen' ||
        currentRoute === 'Admin Screen' ||
        currentRoute === 'Error' ||
        currentRoute === 'Local Admin Screen'
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
  <div v-else class="mx-auto sm:pt-0 md:p-4 xl:max-w-screen-2xl">
    <router-view v-slot="{ Component }">
      <component :is="Component" />
    </router-view>
  </div>
</template>

<script setup>
import { useRoute } from "vue-router";
import { computed } from "vue";

// snowflake's
import SnowFall from "@/components/SnowFall";

document.title =
  process.env.NODE_ENV === "development" ? "[LOCAL] ProTube" : "ProTube";

// Set theme based on cookie
if (
  localStorage.theme === "dark" ||
  (!("theme" in localStorage) &&
    window.matchMedia("(prefers-color-scheme: dark)").matches)
) {
  document.documentElement.classList.add("dark");
} else {
  document.documentElement.classList.remove("dark");
}

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
