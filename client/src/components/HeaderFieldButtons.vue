<template>
  <div
    :class="classes"
    class="display-block ml-2 mr-6 mt-auto shrink-0 justify-center">
    <div v-if="name" class="my-2 text-2xl text-white">Welcome {{ name }}!</div>
    <div
      class="grid grid-cols-2 gap-2 sm:grid-cols-4 md:grid-cols-2 xl:grid-cols-4">
      <router-link
        v-if="adminScreen"
        to="/screen/admin"
        class="bg-proto_blue rounded-md px-4 py-2 text-center text-white duration-200 hover:-translate-x-1 hover:-translate-y-0.5 hover:opacity-80 hover:shadow-lg">
        Admin screen
      </router-link>
      <router-link
        v-if="screen"
        to="/screen"
        class="bg-proto_blue rounded-md px-4 py-2 text-center text-white duration-200 hover:-translate-x-1 hover:-translate-y-0.5 hover:opacity-80 hover:shadow-lg">
        Screen
      </router-link>
      <router-link
        v-if="statistics"
        to="/statistics"
        class="bg-proto_blue rounded-md px-4 py-2 text-center text-white duration-200 hover:-translate-x-1 hover:-translate-y-0.5 hover:opacity-80 hover:shadow-lg">
        Statistics
      </router-link>
      <router-link
        v-if="remote"
        to="/remote"
        class="bg-proto_blue rounded-md px-4 py-2 text-center text-white duration-200 hover:-translate-x-1 hover:-translate-y-0.5 hover:opacity-80 hover:shadow-lg">
        Remote
      </router-link>
      <router-link
        v-if="soundboard"
        to="/soundboard"
        class="bg-proto_blue rounded-md px-4 py-2 text-center text-white duration-200 hover:-translate-x-1 hover:-translate-y-0.5 hover:opacity-80 hover:shadow-lg">
        Soundboard
      </router-link>
    </div>
  </div>
  <div class="my-auto mr-6 hidden shrink-0 lg:block">
    <img
      class="w-30 mx-auto h-0 shrink-0 object-cover md:h-32"
      :src="classicLogo" />
  </div>
</template>

<script setup>
import classicLogo from "@/assets/logo_classic.png";
defineProps({
  screen: {
    type: Boolean,
    default: false,
  },
  adminScreen: {
    type: Boolean,
    default: false,
  },
  statistics: {
    type: Boolean,
    default: false,
  },
  remote: {
    type: Boolean,
    default: false,
  },
  soundboard: {
    type: Boolean,
    default: false,
  },
  name: {type:String, default: ''},
  classes: {type:String, default: ''},
});
</script>
