<template>
  <div
    class="fixed inset-0 z-[999] grid h-screen w-screen place-items-center bg-gray-600/75 transition-opacity dark:bg-gray-600/90"
    aria-labelledby="modal-title"
    role="dialog"
    aria-modal="true">
    <div
      class="dark:bg-proto_background_gray-dark my-auto inline-block w-full transform overflow-hidden rounded-md bg-white px-6 pb-4 pt-5 text-left align-bottom text-xl shadow-xl transition-all dark:text-gray-50 sm:my-8 sm:w-full sm:max-w-lg sm:p-6 sm:align-middle lg:w-8/12">
      Connect to the ProTube display
      <div class="ml-1 pb-4 text-sm text-gray-400">
        Enter the PIN on the ProTube screen
      </div>
      <PincodeComponent />
    </div>
  </div>
</template>

<script setup>
import PincodeComponent from "@/components/PincodeComponent.vue";
</script>
