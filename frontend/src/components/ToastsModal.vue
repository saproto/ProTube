<template>
    <div
        aria-live="assertive"
        class="z-10 text-black pointer-events-none fixed inset-0 flex items-start px-4 py-6 sm:p-6"
    >
        <div class="flex w-full flex-col items-center space-y-4">
            <transition-group name="list">
                <ToastComponent v-for="toast in toaster.toasts" :key="toast.random" :text="toast.text" />
            </transition-group>
        </div>
    </div>
</template>

<script setup lang="ts">
import ToastComponent from '@components/ToastComponent.vue';
import { useToastStore } from '@stores/toastStore';

const toaster = useToastStore();
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
