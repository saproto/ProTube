<template>
  <div
    class="dark:bg-proto_secondary_gray-dark pointer-events-auto w-full max-w-sm overflow-hidden rounded-lg bg-white shadow-lg ring-1 ring-black ring-opacity-5">
    <div class="p-4">
      <div class="flex items-center">
        <div class="flex w-0 flex-1 justify-between">
          <div v-if="status !== enums.STATUS.NOTHING">
            <font-awesome-icon
              v-show="status === enums.STATUS.SUCCESS"
              icon="fa-solid fa-check-circle"
              class="mr-3 text-green-500">
            </font-awesome-icon>

            <font-awesome-icon
              v-show="status === enums.STATUS.WARNING"
              icon="fa-solid fa-warning"
              class="mr-3 text-yellow-400">
            </font-awesome-icon>

            <font-awesome-icon
              v-show="status === enums.STATUS.ERROR"
              icon="fa-solid fa-xmark-circle"
              class="mr-3 text-red-500">
            </font-awesome-icon>
          </div>

          <p
            class="w-0 flex-1 text-sm font-medium text-gray-900 dark:text-gray-50">
            {{ message }}
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import enums from "@/js/Enums";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";

defineProps({
  message: { type: String, default: "" },
  status: {
    type: Number,
    default: -1,
  },
});
</script>
