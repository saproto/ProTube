<template>
  <div
    class="dark:bg-proto_background_gray-dark grid min-h-screen place-items-center">
    <!-- snowflake (after use remove 'z-50 class')-->
    <div
      class="z-50 mx-auto max-w-fit content-center rounded-md bg-white p-8 shadow-md">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        class="h-20 w-full text-center text-yellow-600"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor">
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      </svg>
      {{ codeLookupTable[errorcode] }}
      <router-link
        :to="routeback"
        v-if="routeback"
        :replace="true"
        class="bg-proto_blue hover:bg-proto_blue/80 mx-auto mt-2 flex justify-center rounded-md p-2 text-white">
        Go Back
      </router-link>
      <router-link
        :to="'/remote'"
        :replace="true"
        class="bg-proto_blue hover:bg-proto_blue/80 mx-auto mt-2 flex justify-center rounded-md p-2 text-white">
        Return home
      </router-link>
    </div>
  </div>
</template>

<script setup>
// See https://en.wikipedia.org/wiki/List_of_HTTP_status_codes for the error codes
defineProps({
  errorcode: {
    type: Number,
    default: 404,
  },
  routeback: String,
});
const codeLookupTable = {
  404: "404 - Page not found!",
  401: "401 - Unauthorized!",
  408: "408 - Page timeout!",
};
</script>
