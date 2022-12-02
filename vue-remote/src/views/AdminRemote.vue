<template>
    <div> 
        <transition name="search" mode="out-in">
            <HeaderField>
                <div class="md:flex-1">
                    <h3 class=" leading-6 font-medium text-white text-2xl w-full flex md:block">
                        <span class="w-full"> ProTube admin panel</span>
                        <font-awesome-icon @click="mobileMenuOpen = !mobileMenuOpen" :class="mobileMenuOpen ? 'fa-rotate-90' : 'fa-rotate-0'" class="md:hidden block duration-500 cursor-pointer" icon="bars" />
                    </h3>
                    <div class="mt-2 max-w-xl text-sm text-gray-200 ">
                        <p>With great power comes great responsibility</p>
                    </div>
                    <h2 class="hidden md:block mt-4 leading-6 font-medium text-white md:text-6xl text-3xl">Welcome {{ user.name }}</h2>
                </div>
                <HeaderFieldButtons :classes="mobileMenuOpen ? '' : 'md:block hidden'" screen adminScreen remote/>
            </HeaderField>
        </transition>
        <transition name="results" mode="out-in" appear>
            <ContentField>
                <div class="md:flex">
                    <label class="text-gray-600 dark:text-white text-2xl absolute"> Master controls</label>
                    <div class="w-full md:w-2/3 md:mt-12">
                        <p class=" text-right md:text-center text-md text-gray-500 dark:text-white w-full "> Volume slider</p>
                        <input @change="volumeChange" class="bg-proto_blue hover:bg-proto_blue/80 rounded-xl h-2 w-full border outline-none border-gray-500 appearance-none" type="range" min="0" max="100" :value="playerSettings.volume">
                        <!-- Has no functionality yet.. TODO -->
                        <!--<font-awesome-icon class="cursor-pointer text-2xl mx-2 text-gray-600 dark:text-white" icon="backward" />-->
                        <font-awesome-icon @click="playPause" class="cursor-pointer text-2xl mx-2 text-gray-600 dark:text-white" :icon="playerSettings.playerMode !== MODES.PLAYING ? 'play' : 'pause'"/>
                        <font-awesome-icon @click="skipVideo" class="cursor-pointer text-2xl mx-2 text-gray-600 dark:text-white" icon="forward" />
                    </div>
                    <div class="flex md:mt-12 mt-4 md:w-1/3">
                        <!-- <button @click="resetScreenCode" class="shadow-md bg-proto_blue hover:bg-proto_blue/80 text-white py-1 px-2 md:ml-5 rounded-md my-auto flex">
                            New code
                        </button> -->
                        <div class="flex items-center mx-auto ">
                            <span class="mr-3" id="annual-billing-label">
                                <span class="text-sm font-medium text-gray-900 dark:text-white">ProTube</span>
                            </span>
                            <button @click="toggleRadioProtube" type="button" :class="playerSettings.playerType === TYPES.RADIO ? 'bg-proto_blue' : 'bg-proto_green'" class=" relative inline-flex shrink-0 h-6 w-11 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500" role="switch" aria-checked="false" aria-labelledby="annual-billing-label">
                                <!-- Enabled: "translate-x-5", Not Enabled: "translate-x-0" -->
                                <span aria-hidden="true" :class="playerSettings.playerType === TYPES.RADIO ? 'translate-x-5' : 'translate-x-0'" class="pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition ease-in-out duration-200"></span>
                            </button>
                            <span class="ml-3" id="annual-billing-label">
                                <span class="text-sm font-medium text-gray-900 dark:text-white">Radio</span>
                            </span>
                        </div>
                    </div>
                </div>
            </ContentField>
        </transition>
        <transition name="results" mode="out-in" appear>
            <RadioStations v-on:display-toast="displayToast" />
        </transition>

        <transition name="results" mode="out-in" appear>
            <CurrentQueue v-on:display-toast="displayToast" admin />
        </transition>

        <ToastsModal :latestToast="latestToast" />
    </div>
</template>

<script setup>
import HeaderField from '@/layout/HeaderField.vue'
import HeaderFieldButtons from '@/components/HeaderFieldButtons.vue'
import ContentField from '@/layout/ContentField.vue'
import ToastsModal from '@/components/modals/ToastsModal.vue'
import RadioStations from '@/components/RadioStations.vue'
import CurrentQueue from '@/components/CurrentQueue.vue'
import socket, { connectSocket } from '@/js/AdminRemoteSocket'
import { ref, onBeforeMount, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'

const { MODES, STATUS, TYPES } = require( '../../../utils/constants')
const latestToast = ref(null);
const mobileMenuOpen = ref(false);

const user = ref({});
const playerSettings = ref({
    volume: 75,
    playerMode: MODES.IDLE,
    playerType: TYPES.VIDEO
});

const router = useRouter();

onBeforeMount(async () => {
    const response = await fetch('/api/user');
    if(response.redirected) return window.location.href = response.url;
    const data = await response.json();
    user.value.name = data.name;
    user.value.admin = data.admin;
    if(data.admin) connectSocket();
    else router.push({name: "Error", params: { errorcode: 401 }});
})

onBeforeUnmount(() => {
    socket.disconnect();
});



socket.on('connect', () => {
    socket.emit('get-player-settings', result => {
        playerSettings.value = result;
    });
});

socket.on('update-admin-panel', (newSettings) => {
    playerSettings.value = newSettings;
});

function displayToast(toast){
    latestToast.value = toast;
}

async function volumeChange(event){
    const volume = event.target.value;
    if(volume > 100 || volume < 0) {
        return displayToast({
            status: STATUS.ERROR,
            message: "Invalid volume!"
        })
    }
    const data = await new Promise( resolve => {
        socket.emit('set-new-volume', volume, callback => {
            resolve(callback);
        });
    });
    displayToast({
        status: data.status ?? STATUS.SUCCESS, 
        message: data.message ?? `Successfully Updated the volume to: ${volume}`
    });
}

async function toggleRadioProtube(){
    const data = await new Promise( resolve => {
        socket.emit('toggle-radio-protube', callback => {
            resolve(callback);
        });
    });
    displayToast({
        status: data.status ?? STATUS.SUCCESS, 
        message: data.message ?? `Successfully switched to: ${playerSettings.value.playerType === TYPES.RADIO ? 'Radio' : 'ProTube'}`
    });
}

async function skipVideo() {
    const data = await new Promise( resolve => {
        socket.emit('skip-video', callback => {
            resolve(callback);
        });
    });
    displayToast({
        status: data.status ?? STATUS.SUCCESS, 
        message: data.message ?? `Successfully skipped video!`
    });
}
// todo fix new code button
// async function resetScreenCode() {
//     const data = await new Promise( resolve => {
//         socket.emit('reset-screen-code', callback => {
//             resolve(callback);
//         });
//     });
//     displayToast({
//         status: data.status ?? STATUS.SUCCESS, 
//         message: data.message ?? `Successfully reset the screencode!`
//     });
// }

async function playPause() {
    const data = await new Promise( resolve => {
        socket.emit('play-pause', callback => {
            resolve(callback);
        });
    });
    displayToast({
        status: data.status ?? STATUS.SUCCESS, 
        message: data.message ?? `Successfully ${playerSettings.value.playerMode === MODES.PLAYING ? 'paused' : 'resumed'} video!`
    });
}


</script>

<style scoped>
.no-scrollbar::-webkit-scrollbar {
    display: none;
}

/* Hide scrollbar for IE, Edge and Firefox */
.no-scrollbar {
    -ms-overflow-style: none;  /* IE and Edge */
    scrollbar-width: none;  /* Firefox */
}
</style>