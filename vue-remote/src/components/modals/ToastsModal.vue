<template>
    <div aria-live="assertive" class="fixed inset-0 flex px-4 py-6 pointer-events-none sm:p-6 items-start">
        <div class="w-full flex flex-col items-center space-y-4">
            <transition-group name="list">
                <Toast v-for="toast in toasts" :message="toast.message" :status="toast.status" :key="toast"/>
            </transition-group>
        </div>
    </div>
</template>

<script setup>
import Toast from '@/components/Toast.vue'
import { defineProps, watch, ref } from 'vue'

const toasts = ref([]);

const props = defineProps({
  latestToast: Object
});
// latestToast items: duration (ms), message, status

watch(() => props.latestToast, (newValue) => {
  // adding random string to prevent duplicate toasts
  newValue.rand = Math.random();
  toasts.value.push(newValue);
  setTimeout(() => {
        let index = toasts.value.indexOf(newValue);
        if (index !== -1) toasts.value.splice(index, 1);
    }, newValue.duration ?? 2500);
});

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