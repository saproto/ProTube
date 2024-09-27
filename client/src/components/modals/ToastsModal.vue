<template>
  <div
    aria-live="assertive"
    class="pointer-events-none fixed inset-0 flex items-start px-4 py-6 sm:p-6">
    <div class="flex w-full flex-col items-center space-y-4">
      <transition-group name="list">
        <ToastComponent
          v-for="toast in toasts"
          :key="toast"
          :message="toast.message"
          :status="toast.status" />
      </transition-group>
    </div>
  </div>
</template>

<script setup>
import ToastComponent from "@/components/ToastComponent.vue";
import { watch, ref } from "vue";

const toasts = ref([]);

// latestToast items: duration (ms), message, status
const props = defineProps({
  latestToast: { type: Object, default: null },
});

watch(
  () => props.latestToast,
  (newValue) => {
    // adding random string to prevent duplicate toasts
    newValue.rand = Math.random();
    toasts.value.push(newValue);
    setTimeout(() => {
      let index = toasts.value.indexOf(newValue);
      if (index !== -1) toasts.value.splice(index, 1);
    }, newValue.duration ?? 2500);
  }
);
</script>

<style>
/* list transitions */
.list-enter-from {
  opacity: 0;
  transform: scale(0.6);
}
.list-enter-active {
  transition: all 0.4s ease;
}
.list-leave-to {
  opacity: 0;
  transform: scale(0.6);
}
.list-leave-active {
  transition: all 0.4s ease;
  position: absolute; /* for move transition after item leaves */
}
.list-move {
  transition: all 0.3s ease;
}
</style>
