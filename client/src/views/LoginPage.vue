<template>
  <div class="bg-proto_background_gray-dark">
    <transition name="modal">
      <LoadModal message="Authenticating..." />
    </transition>
  </div>
</template>

<script setup>
import LoadModal from "@/components/modals/LoadModal.vue";
import { onMounted } from "vue";

onMounted(() => {
  location.href = "/api/login";
});
</script>
