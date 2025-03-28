<template>
  <ContentField additional-classes="grow">
    <div class="mx-auto mb-4 flex">
      <h3 class="text-2xl text-gray-600 dark:text-white">Screen Settings</h3>
    </div>
    <div class="mx-auto mt-2 flex w-fit items-center justify-between gap-2">
      <span
        class="w-full whitespace-nowrap text-right text-lg text-gray-500 dark:text-white md:text-center">
        Hide Queue
      </span>
      <SwitchButton
        :on="screenSettings.hideQueue"
        @toggled="emit('toggle-queue-visibility')"></SwitchButton>
    </div>

    <div class="mx-auto mt-2 flex w-fit items-center justify-between gap-2">
      <span
        class="w-full whitespace-nowrap text-right text-lg text-gray-500 dark:text-white md:text-center">
        Small Player
      </span>
      <SwitchButton
          :on="screenSettings.smallPlayer"
          @toggled="emit('toggle-small-player')"></SwitchButton>
    </div>
  </ContentField>
</template>
<script setup>
import ContentField from "../layout/ContentField.vue";
import SwitchButton from "./SwitchButton.vue";

const emit = defineEmits(["toggle-queue-visibility", "toggle-small-player"]);

defineProps({
  screenSettings: {
    type: Object,
default:()=>{
  return {
    hideQueue: false,
    smallPlayer: false,
  }
}
  }
})
</script>