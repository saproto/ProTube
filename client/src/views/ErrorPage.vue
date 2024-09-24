<template>
  <div
    class="dark:bg-proto_background_gray-dark grid min-h-screen place-items-center">
    <div
      class="dark:bg-proto_secondary_gray-dark z-50 mx-5 mx-auto max-w-[450px] content-center rounded-md bg-white p-8 text-center shadow-md dark:text-white">
      <div class="w-full text-center">
        <font-awesome-icon
          icon="fa-solid fa-warning"
          class="text-yellow-400"
          size="6x">
        </font-awesome-icon>
      </div>
      <h3 class="mb-3 text-xl font-medium">{{ codeLookupTable[errorcode] }}</h3>
      <p class="mb-5 text-sm">
        If you are encountering an unexpected error please let the
        <a
          href="https://haveyoutriedturningitoffandonagain.nl"
          class="text-proto_blue"
          >HYTTIOAOAc</a
        >
        know by creating an issue on
        <a
          href="https://github.com/saproto/ProTube/issues/new"
          class="text-proto_blue"
          >GitHub</a
        >.
      </p>
      <router-link
        :to="routeback"
        v-if="routeback"
        :replace="true"
        class="bg-proto_blue hover:bg-proto_blue/80 mx-auto flex justify-center rounded-md p-2 text-white">
        Go Back
      </router-link>
      <router-link
        :to="'/remote'"
        :replace="true"
        class="bg-proto_blue hover:bg-proto_blue/80 mx-auto flex justify-center rounded-md p-2 text-white">
        Return home
      </router-link>
    </div>
  </div>
</template>

<script setup>
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";

defineProps({
  errorcode: {
    type: Number,
    default: 404,
  },
  routeback: String,
});

// See https://en.wikipedia.org/wiki/List_of_HTTP_status_codes for error codes
const codeLookupTable = {
  404: "404 - Page not found!",
  401: "401 - Unauthorized!",
  408: "408 - Page timeout!",
};
</script>
