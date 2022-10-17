<template>
    <div class="fixed z-10 inset-0 overflow-y-auto sm:-to" aria-labelledby="modal-title" role="dialog" aria-modal="true">
        <div class="flex items-end justify-center h-4/6 pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div class="fixed inset-0 bg-proto_background_gray-dark transition-opacity" :class="background_opacity" aria-hidden="true"></div>

            <!-- This element is to trick the browser into centering the modal contents. -->
            <span class="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            <div class="inline-block text-center border shadow-xl border-stone-600 transform transition-all align-middle bg-stone-500 p-8 rounded-md">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-20 w-20 text-yellow-600 text-center w-full" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <div class="text-gray-200 text-xl mt-4 flex justify-center">
                    <span class="my-auto">
                        <slot />
                    </span>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { defineProps, computed } from 'vue';

const props = defineProps({
  opacity: {
      type: Number, 
      default: 70
    }
});

const background_opacity = computed (() => {
    return "bg-opacity-"+props.opacity;
})
</script>