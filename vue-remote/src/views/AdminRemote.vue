<template>
    <div> 
        <transition name="search" mode="out-in">
            <HeaderField>
                <div class="md:flex-1">
                    <h3 class=" leading-6 font-medium text-white text-2xl w-full flex md:block">
                        <span class="w-full"> ProTube admin panel</span>
                        <font-awesome-icon @click="openMenu = !openMenu" :class="openMenu ? 'fa-rotate-90' : 'fa-rotate-0'" class="md:hidden block duration-500 cursor-pointer" icon="bars" />
                    </h3>
                    <div class="mt-2 max-w-xl text-sm text-gray-200 ">
                        <p>With great power comes great responsibility</p>
                    </div>
                    <h2 class="hidden md:block mt-4 leading-6 font-medium text-white md:text-6xl text-3xl">Welcome {{ name }}</h2>
                </div>
                <HeaderFieldButtons :classes="openMenu ? '' : 'md:block hidden'" :name="name" screen adminScreen remote/>
            </HeaderField>
        </transition>
        <transition name="results" mode="out-in" appear>
            <ContentField>
                <div class="md:flex">
                    <label class="text-gray-600 dark:text-white text-2xl absolute"> Master Controls</label>
                    <div class="w-full md:w-2/3 md:mt-12">
                        <p class=" text-right md:text-center text-md text-gray-500 dark:text-white w-full "> Volume Slider</p>
                        <input @change="volumeChange" class="bg-proto_blue hover:bg-opacity-80 rounded-xl h-2 w-full border outline-none border-gray-500 appearance-none" type="range" min="1" max="100" :value="volume">
                        <!-- Has no functionality yet.. TODO -->
                        <!--<font-awesome-icon class="cursor-pointer text-2xl mx-2 text-gray-600 dark:text-white" icon="backward" />-->
                        <font-awesome-icon @click="playPause" class="cursor-pointer text-2xl mx-2 text-gray-600 dark:text-white" :icon="playing ? 'pause' : 'play'"/>
                        <font-awesome-icon @click="skip" class="cursor-pointer text-2xl mx-2 text-gray-600 dark:text-white" icon="forward" />
                    </div>
                    <div class="flex md:mt-12 mt-4 md:w-1/3">
                        <button @click="regenScreenCode" class="shadow-md bg-proto_blue hover:bg-opacity-80 text-white py-1 px-2 md:ml-5 rounded-md my-auto flex">
                            New code
                        </button>
                        <div class="flex items-center mx-auto ">
                            <span class="mr-3" id="annual-billing-label">
                                <span class="text-sm font-medium text-gray-900 dark:text-white">Protube</span>
                            </span>
                            <button @click="toggleRadioProtube" type="button" :class="currentPlayerMode === 'radio' ? 'bg-proto_blue' : 'bg-proto_green'" class="bg-gray-200 relative inline-flex flex-shrink-0 h-6 w-11 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500" role="switch" aria-checked="false" aria-labelledby="annual-billing-label">
                                <!-- Enabled: "translate-x-5", Not Enabled: "translate-x-0" -->
                                <span aria-hidden="true" :class="currentPlayerMode === 'radio' ? 'translate-x-5' : 'translate-x-0'" class="pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition ease-in-out duration-200"></span>
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
            <ContentField>
                <label class="text-gray-600 dark:text-white text-2xl absolute"> Radiostations</label>
                <input minlength="1" v-model="radiofilter" class="bg-white min-w-min placeholder-gray-500  focus:placeholder-gray-600  text-gray-700 pl-2 rounded-md border border-gray-400 outline-none ml-48" placeholder="Filter"/>
                <div class="flex overflow-x-scroll pt-10 no-scrollbar">
                    <div class="flex flex-nowrap ">
                        <Suspense>
                            <template #default>
                                <RadioStations v-on:added-radio="displayToast" :radiofilter="radiofilter" />
                            </template>
                            <template #fallback>
                                <div v-for="index in 10" :key="index" class="inline-block px-3">
                                    <div class="p-4 w-48 truncate overflow-hidden rounded-lg shadow-md bg-proto_blue animate-pulse text-white hover:bg-opacity-80">
                                        <div class="bg-gray-100 rounded-md w-28 p-3 animate-pulse" />
                                    </div>
                                </div>
                            </template>
                        </Suspense>
                    </div>
                </div>
            </ContentField>
        </transition>

        <transition name="results" mode="out-in" appear>
                <CurrentQueue 
                    admin
                    v-on:remove-from-queue="removeVideo"
                    :queueData="queueData"
                    :skeletonLoading="queueSkeletonLoading"
                />
            <!--<ContentField>
                <label class="text-gray-600 dark:text-white text-2xl absolute"> The current Queue - {{ totalQueueDuration }}</label>
                    <div class="flex overflow-x-scroll pt-10 no-scrollbar">
                        <div class="flex flex-nowrap h-full">
                            <ul v-for="(video, index) in videoQueue" :video="video" :index="index" :key="video.id" class="grid inline-block px-3 w-96 min-h-full" >
                                <li :style='{background: `url(${video.thumbnail.url})`}' style="background-repeat: no-repeat; background-size: cover; background-position: center center;" class="group cursor-pointer col-span-1 flex group flex-col text-center  border-proto_blue border-l-4 rounded-sm shadow"> !--divide-y dark:divide-proto_green divide-gray-500--
                                    <div @click="removeVideo(video)" class="group-hover:bg-opacity-60 flex-1 rounded-m border-t border-b border-r dark:border-gray-800 border-gray-400 flex flex-col px-8 py-4 bg-white dark:bg-true_gray-800 bg-opacity-80">
                                        <h3 class="font-bold dark:text-true_gray-300 text-gray-800 text-left text-md">{{ video.title }}</h3>
                                        <div class="mt-auto w-full">
                                            <div class="flex-1 text-gray-900 justify-bottom align-bottom mt-auto flex text-right ">
                                            <svg class="align flex-shrink-0 mr-1.5 h-5 w-5 dark:text-true_gray-300" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                                                <path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clip-rule="evenodd"></path>
                                            </svg>
                                            <span class="text-gray-900 dark:text-true_gray-300 text-sm font-medium truncate">{{ video.channel }}</span>
                                            </div>
                                            <div class="flex-1 text-gray-900 mt-0 flex text-right ">
                                            <svg class="flex-shrink-0 mr-1.5 h-5 w-5 dark:text-true_gray-300" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                                                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clip-rule="evenodd"></path>
                                            </svg>
                                            <span class="text-gray-900 dark:text-true_gray-300 text-sm font-medium truncate">{{ video.durationFormatted }}</span>
                                            <span class="ml-auto group-hover:opacity-100 opacity-0 duration-300 text-red-400 dark:text-true_gray-300 text-sm font-medium truncate">Remove</span>
                                            </div>
                                        </div>
                                    </div>
                                </li>
                            </ul>
                            <div v-if="videoQueue.length < 1" class="text-gray-400 ml-8"> Empty queue </div>
                        </div>
                    </div>
            </ContentField>-->
        </transition>
        
        <!--<div aria-live="assertive" class="fixed inset-0 flex px-4 py-6 pointer-events-none sm:p-6 items-start">
            <div class="w-full flex flex-col items-center space-y-4">
                <transition-group name="list">
                    <Toast v-for="item in toasts" :data="item" :key="item+Math.random()"/>
                </transition-group>
            </div>
        </div>-->
        <ToastsModal :toasts="toasts" />
    </div>
</template>

<script setup>
import HeaderField from '@/layout/HeaderField.vue'
import HeaderFieldButtons from '@/components/HeaderFieldButtons.vue'
import ContentField from '@/layout/ContentField.vue'
import ToastsModal from '@/components/modals/ToastsModal.vue'
import RadioStations from '@/components/RadioStations.vue'
import CurrentQueue from '@/components/CurrentQueue.vue'
import { getPlayerStatusSocket, getUserDataSocket, removeVideoSocket, playPauseSocket, getVideoQueueSocket, skipSocket, regenScreenCodeSocket, toggleRadioProtubeSocket, volumeChangeSocket, socket } from '@/js/admin_socket.js'
import { ref, onMounted } from 'vue'

const currentPlayerMode = ref('video'); // radio or video
const name = ref("");
const radiofilter = ref("");
const queueData = ref({});
const queueSkeletonLoading = ref(true);

const toasts = ref([]);
const playing = ref(true);
const openMenu = ref(false);
const volume = ref(75);

// with keepalive this acts as an onCreated, so runs once
onMounted(async () => {
    const queue = await getVideoQueueSocket();
    queueData.value = queue;
    queueSkeletonLoading.value = false;
    // smh doesnt work when directly assigned
    let user =  await getUserDataSocket();
    name.value = user.name;

    await updatePlayingStatus();
});

socket.on('admin-new-screen-code', (screencode) => {
    displayToast('New screen code: ' + screencode);
});

// there was a change in the queue, update this on the admin remote
socket.on('admin-queue-update', (queue) => {
    queueData.value = queue;
});

//there was a change in the player status, update certain elements on the admin remote
socket.on('admin-player-update', playerStatus => {
    playing.value = playerStatus.status === 'playing';
    currentPlayerMode.value = playerStatus.type;
})

// the volume on the screens was changed
socket.on('admin-new-volume', (newVolume) => {
    volume.value = newVolume;
});

function displayToast(message){
    let toastMessage = {
        message: message,
        type: 'message',
        id: Math.random()
    };
    toasts.value.push(toastMessage);
    setTimeout(() => {
        let index = toasts.value.indexOf(toastMessage);
        if (index !== -1) {
            toasts.value.splice(index, 1);
        }
    }, 2500);
}

async function toggleRadioProtube(){
    const previousPlayMode = currentPlayerMode.value;
    let newPlayStatus = await toggleRadioProtubeSocket();
    if(newPlayStatus.type === previousPlayMode) displayToast(`Failed to switch!`);
    else displayToast(`Switched to ${newPlayStatus.type}`);
    currentPlayerMode.value = newPlayStatus.type;
}

async function removeVideo(video){
    if(await removeVideoSocket(video)) {
      displayToast(`Successfully removed video!`);
      return;
    }
    displayToast("Failed to remove video!");
}
// currently disabled, backend needs functionality for this
async function volumeChange(event){
    if(await volumeChangeSocket(event.target.value)) {
      displayToast("Successfully changed the volume!");
      return;
    }
    displayToast("Failed to change volume!");
}

async function regenScreenCode(){
    displayToast(`Setting new screencode`);
    await regenScreenCodeSocket();
}

async function playPause(){
    if(await playPauseSocket()) {
      await updatePlayingStatus();
      displayToast(`Successfully ${playing.value ? 'resumed' : 'paused'} ProTube!`);
      return;
    }
    displayToast(`Something went wrong trying to ${!playing.value ? 'resume' : 'pause'} ProTube.`);
}

async function skip() {
  if (await skipSocket()) {
    displayToast('Skipped current video!');
    return;
  }
  displayToast('Failed to skip current video!');
}

async function updatePlayingStatus() {
  let playerStatus = await getPlayerStatusSocket();
  currentPlayerMode.value = playerStatus.type;
  playing.value = playerStatus.status === 'playing';
  volume.value = playerStatus.volume;

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