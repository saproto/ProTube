<template>
    <div :class="classes" class="display-block flex-shrink-0 mr-6 ml-2 justify-center mt-auto">
        <div v-if="name" class="text-white text-2xl my-2"> Welcome {{ name }}!</div>
        <div class="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-2 xl:grid-cols-4 gap-2">
            <router-link to="/remote/admin" v-if="adminRemote"  class="text-center py-2 px-4 bg-proto_blue text-white hover:opacity-80 rounded-md">Admin remote</router-link>
            <router-link to="/screen/admin" v-if="adminScreen"  class="text-center py-2 px-4 bg-proto_blue text-white hover:opacity-80 rounded-md">Admin screen</router-link>
            <router-link to="/screen"       v-if="screen"       class="text-center py-2 px-4 bg-proto_blue text-white hover:opacity-80 rounded-md">Screen</router-link>
            <router-link to="/statistics"   v-if="statistics"   class="text-center py-2 px-4 bg-proto_blue text-white hover:opacity-80 rounded-md">Statistics</router-link>
            <router-link to="/remote"       v-if="remote"       class="text-center py-2 px-4 bg-proto_blue text-white hover:opacity-80 rounded-md">Remote</router-link>
            <router-link to="/soundboard"   v-if="soundboard"   class="text-center py-2 px-4 bg-proto_blue text-white hover:opacity-80 rounded-md">Soundboard</router-link>
        </div>
    </div>
    <div  class="hidden lg:block flex-shrink-0 mr-6 my-auto">
        <img class="w-30 h-0 md:h-32 object-cover flex-shrink-0 mx-auto" :src="require('@/assets/logo_classic.png')" />
    </div>
</template>

<script setup>
import { defineProps } from 'vue'

defineProps({
    screen: {
        type: Boolean,
        default: false
    },
    adminScreen: {
        type: Boolean,
        default: false
    },
    statistics: {
        type: Boolean,
        default: false
    },
    adminRemote: {
        type: Boolean,
        default: false
    },
    remote: {
        type: Boolean,
        default: false
    },
    soundboard: {
        type: Boolean,
        default: false
    },
    name: String,
    classes: String,
})
</script>