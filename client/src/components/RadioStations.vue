<template>
    <ContentField >
        <label class="text-gray-600 dark:text-white text-2xl absolute"> Radio stations</label>
        <input v-model="radiofilter" class="bg-white placeholder-gray-500 w-32 sm:w-64 focus:placeholder-gray-600  text-gray-700 pl-2 rounded-md border border-gray-400 outline-none ml-48" placeholder="Filter"/>
        <div class="flex overflow-x-scroll overflow-y-visible pt-10 pb-5 -mb-4 no-scrollbar">
            <div class="flex flex-nowrap">
                <template v-if="!skeletonLoading" >
                    <div v-for="radio in filteredRadioStations" :key="radio" class="inline-block px-3">
                        <div  @click="setRadio(radio.z, radio.o)"  class="w-24 h-[3.75rem] hover:-translate-x-1 hover:-translate-y-0.5 hover:cursor-pointer hover:shadow-lg hover:opacity-80 duration-200 rounded-lg">
                            <img
                                :alt="radio.o"
                                class="truncate overflow-hidden rounded-lg bg-proto_blue text-white hover:bg-proto_blue/80"
                                :src="`https://www.nederland.fm/i/l/${radio.z}.gif`" />
                        </div>
                    </div>
                    <div v-if="filteredRadioStations.length < 1" class="text-gray-400 ml-8 -mt-6"> No radio stations found.. </div>
                </template>
                <template v-else >
                    <div v-for="index in 20" :key="index" class="inline-block px-3">
                        <div class="w-24 h-[3.75rem] truncate overflow-hidden rounded-lg shadow-md bg-proto_blue animate-pulse text-white hover:bg-proto_blue/80">
                        </div>
                    </div>
                </template>
            </div>
        </div>
    </ContentField>
</template>

<script setup>
import ContentField from '@/layout/ContentField.vue'
import { ref, computed } from 'vue'
import socket from '@/js/AdminRemoteSocket'

const { STATUS } = require( '../../../server/utils/constants')
const radioStations = ref([]);
const skeletonLoading = ref(true);
const radiofilter = ref('');

const emit = defineEmits(['display-toast']);

// retrieving the radiostations and stop skeletonloading
socket.on("connect", async () => {
    const data = await new Promise( resolve => {
        socket.emit('get-radiostations', (stations) => {
            resolve(stations);
        });
    });
    radioStations.value = data;
    skeletonLoading.value = false;
});

const filteredRadioStations = computed(() => {
    return radioStations.value.filter((station) => station.o.toLowerCase().includes(radiofilter.value.toLowerCase()));
});

async function setRadio(radioID, name){
    const data = await new Promise( resolve => {
        socket.emit('play-radio', radioID, callback => {
            resolve(callback);
        });
    });
    emit('display-toast', {
      status: data.status ?? STATUS.SUCCESS, 
      message: data.message ?? `Successfully started playing: ${name}`
    });
}
</script>