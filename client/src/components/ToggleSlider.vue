<template>
  <div class="mx-auto flex">
    <slot name="left">Left</slot>
    <button
      @click="$emit('click')"
      type="button"
      :class="isLeft ? 'bg-proto_blue' : 'bg-proto_green'"
      class="relative mx-3 inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
      role="switch">
      <span
        :class="!isLeft ? 'translate-x-5' : 'translate-x-0'"
        class="pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out">
      </span>
    </button>
    <slot name="right">Right</slot>
  </div>
</template>

<script setup>
import { defineProps } from "vue";

defineProps({
  isLeft: {
    type: Boolean,
    default: true,
  },
});

defineEmits(["click"]);
</script>
