<template>
  <transition
    name="slide-up"
    mode="out-in"
    class="bg-proto_blue hover:bg-proto_blue/80 rounded-md py-1 px-2 text-sm text-white shadow-md hover:opacity-80">
    <button v-if="screenSetting === enums.SCREEN_SETTINGS.SHOW_DEFAULT">
      {{ currentScreenSetting }}
    </button>
    <button v-else-if="screenSetting === enums.SCREEN_SETTINGS.SHOW_NOQUEUE">
      {{ currentScreenSetting }}
    </button>
    <button v-else-if="screenSetting === enums.SCREEN_SETTINGS.SHOW_NOTHING">
      {{ currentScreenSetting }}
    </button>
    <button v-else-if="screenSetting === enums.SCREEN_SETTINGS.SHOW_PHOTOS">
      {{ currentScreenSetting }}
    </button>
    <button v-else-if="screenSetting === enums.SCREEN_SETTINGS.SHOW_QUEUE">
      {{ currentScreenSetting }}
    </button>
  </transition>
</template>

<script setup>
import { defineProps, computed } from "vue";
import enums from "@/js/Enums";

const props = defineProps({
  screenSetting: Number,
});

const currentScreenSetting = computed(() => {
  switch (props.screenSetting) {
    case enums.SCREEN_SETTINGS.SHOW_DEFAULT:
      return "Default";
    case enums.SCREEN_SETTINGS.SHOW_QUEUE:
      return "Queue only";
    case enums.SCREEN_SETTINGS.SHOW_PHOTOS:
      return "Photos only";
    case enums.SCREEN_SETTINGS.SHOW_NOQUEUE:
      return "No queue";
    case enums.SCREEN_SETTINGS.SHOW_NOTHING:
    default:
      return "Nothing";
  }
});
</script>

<style>
.slide-up-enter-active,
.slide-up-leave-active {
  transition: all 0.25s ease-out;
}

.slide-up-enter-from {
  opacity: 0;
  transform: translateY(30px);
}

.slide-up-leave-to {
  opacity: 0;
  transform: translateY(-30px);
}
</style>
