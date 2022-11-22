<template>
    <ContentField>
        <label class="text-gray-600 dark:text-white text-2xl absolute"> Radio stations</label>
        <input v-model="radiofilter" class="bg-white placeholder-gray-500 w-32 sm:w-64 focus:placeholder-gray-600  text-gray-700 pl-2 rounded-md border border-gray-400 outline-none ml-48" placeholder="Filter"/>
        <div class="flex overflow-x-scroll pt-10 no-scrollbar">
            <div class="flex flex-nowrap ">
                <template v-if="!skeletonLoading" >
                    <div v-for="radio in filteredRadioStations" :key="radio" class="inline-block px-3">
                        <button @click="setRadio" :id="radio.z" :name="radio.o" class="p-4 w-48 truncate overflow-hidden rounded-lg shadow-md bg-proto_blue text-white hover:bg-opacity-80">
                            {{ radio.o }}
                        </button>
                    </div>
                    <div v-if="filteredRadioStations.length < 1" class="text-gray-400 ml-8 -mt-6"> No radio stations found.. </div>
                </template>
                <!-- <RadioStations v-on:added-radio="displayToast" :radiofilter="radiofilter" /> -->
                <template v-else >
                    <div v-for="index in 10" :key="index" class="inline-block px-3">
                        <div class="p-4 w-48 truncate overflow-hidden rounded-lg shadow-md bg-proto_blue animate-pulse text-white hover:bg-opacity-80">
                            <div class="bg-gray-100 rounded-md w-28 p-3 animate-pulse" />
                        </div>
                    </div>
                </template>
            </div>
        </div>
    </ContentField>
</template>

<script setup>
import ContentField from '@/layout/ContentField.vue'
//eslint-disable-next-line
import { ref, computed, defineEmits } from 'vue'
import socket from '@/js-2/AdminRemoteSocket'
import { STATUS } from '../../../utils/constants'

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

async function setRadio(event){
    const requestedRadioID = event.target.id;
    const data = await new Promise( resolve => {
        socket.emit('play-radio', requestedRadioID, callback => {
            resolve(callback);
        });
    });
    emit('display-toast', {
      status: data.status ?? STATUS.SUCCESS, 
      message: data.message ?? `Successfully started playing: ${event.target.innerText}`
    });
}
// async function setRadio(event){
//     var requested_radio = event.target.id;
//     // if(await setRadioSocket(requested_radio)){
//     //     emit('added-radio', `Started playing: ${event.target.name} `)
//     // } else {
//     //     emit('added-radio', `Failed to start: ${event.target.name} `)
//     // }
// }
</script>

<style>
</style>