<template>
    <div class="fixed z-10 inset-0 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
        <div class="flex items-end justify-center h-4/6 pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div class="fixed inset-0 bg-gray-600 bg-opacity-75 dark:bg-opacity-90 transition-opacity" aria-hidden="true"></div>

            <!-- This element is to trick the browser into centering the modal contents. -->
            <span class="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

            <div class="inline-block text-xl dark:text-gray-50 align-bottom dark:bg-proto_background_gray-dark bg-white my-auto rounded-md px-6 pt-5 pb-4 w-full lg:w-8/12 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
                Connect to the ProTube display
                <div class="text-sm ml-1 text-gray-400 pb-4">Enter the PIN on the ProTube screen</div>
                <Pincode />
            </div>
        </div>
    </div>
</template>

<script setup>
import Pincode from '@/components/Pincode.vue'
</script>