<template>
  <div
    :class="classes"
    class="display-block mr-6 ml-10 mt-auto shrink-0 justify-center">
    <div v-if="name" class="my-2 text-2xl text-white">Welcome {{ name }}!</div>
    <div
      class="grid grid-cols-2 gap-2 sm:grid-cols-4 md:grid-cols-2 xl:grid-cols-4">
      <router-link
        to="/remote/admin"
        v-if="adminRemote"
        class="bg-proto_blue rounded-md py-2 px-4 text-center text-white duration-200 hover:-translate-x-1 hover:-translate-y-0.5 hover:opacity-80 hover:shadow-lg"
        >Admin remote</router-link
      >
      <router-link
        to="/screen/admin"
        v-if="adminScreen"
        class="bg-proto_blue rounded-md py-2 px-4 text-center text-white duration-200 hover:-translate-x-1 hover:-translate-y-0.5 hover:opacity-80 hover:shadow-lg"
        >Admin screen</router-link
      >
      <router-link
        to="/screen"
        v-if="screen"
        class="bg-proto_blue rounded-md py-2 px-4 text-center text-white duration-200 hover:-translate-x-1 hover:-translate-y-0.5 hover:opacity-80 hover:shadow-lg"
        >Screen</router-link
      >
      <router-link
        to="/statistics"
        v-if="statistics"
        class="bg-proto_blue rounded-md py-2 px-4 text-center text-white duration-200 hover:-translate-x-1 hover:-translate-y-0.5 hover:opacity-80 hover:shadow-lg"
        >Statistics</router-link
      >
      <router-link
        to="/remote"
        v-if="remote"
        class="bg-proto_blue rounded-md py-2 px-4 text-center text-white duration-200 hover:-translate-x-1 hover:-translate-y-0.5 hover:opacity-80 hover:shadow-lg"
        >Remote</router-link
      >
      <router-link
        to="/soundboard"
        v-if="soundboard"
        class="bg-proto_blue rounded-md py-2 px-4 text-center text-white duration-200 hover:-translate-x-1 hover:-translate-y-0.5 hover:opacity-80 hover:shadow-lg"
        >Soundboard</router-link
      >
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
  adminRemote: {
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
  name: String,
  classes: String,
});
</script>
