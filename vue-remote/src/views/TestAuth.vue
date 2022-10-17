<template>
  <div>
    Test
    <button @click=connectSocket()  class="p-4 m-4 bg-green-200">
        Connect to socket
    </button>
  </div>
</template>

<script setup>
import { connectSocket } from '@/js/auth_test'
connectSocket();
</script>

<style>

</style>