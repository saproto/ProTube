<template>
  <div
    class="fixed inset-0 z-10 overflow-y-auto"
    aria-labelledby="modal-title"
    role="dialog"
    aria-modal="true">
    <div
      class="flex h-4/6 items-end justify-center px-4 pb-20 pt-4 text-center sm:block sm:p-0">
      <div
        class="fixed inset-0 bg-gray-600/75 transition-opacity dark:bg-gray-600/90"
        aria-hidden="true"></div>

      <!-- This element is to trick the browser into centering the modal contents. -->
      <span
        class="hidden sm:inline-block sm:h-screen sm:align-middle"
        aria-hidden="true"
        >&#8203;</span
      >

      <div
        class="dark:bg-proto_background_gray-dark my-auto inline-block w-full transform overflow-hidden rounded-md bg-white px-6 pb-4 pt-5 text-left align-bottom text-xl shadow-xl transition-all dark:text-gray-50 sm:my-8 sm:w-full sm:max-w-lg sm:p-6 sm:align-middle lg:w-8/12">
        Connect to the ProTube display
        <div class="ml-1 pb-4 text-sm text-gray-400">
          Enter the PIN on the ProTube screen
        </div>
        <PincodeComponent />
      </div>
    </div>
  </div>
</template>

<script setup>
import PincodeComponent from "@/components/PincodeComponent.vue";
</script>
