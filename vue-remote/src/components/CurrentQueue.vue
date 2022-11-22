<template>    
    <ContentField>
        <label class="text-gray-600 dark:text-white text-2xl absolute"> The current queue - {{ queueDuration }}</label>
            <div class="flex overflow-x-scroll pt-10 no-scrollbar">
                <div v-if="skeletonLoading" class="flex flex-nowrap h-full">
                    <ul v-for="index in 10" :key="index" class="grid inline-block px-3 w-96 min-h-full">
                        <li class="group cursor-pointer col-span-1 flex group flex-col text-center  border-proto_blue border-l-4 rounded-sm shadow"> <!--divide-y dark:divide-proto_green divide-gray-500-->
                            <SkeletonResult />
                        </li>
                    </ul>
                </div>
                <div v-if="!skeletonLoading" class="flex flex-nowrap h-full">
                    <ul v-for="(video, index) in queue" :video="video" :index="index" :key="video.id" class="grid inline-block px-3 w-96 min-h-full" >
                        <li :style='{background: `url(${video.thumbnail.url})`}' style="background-repeat: no-repeat; background-size: cover; background-position: center center;" :class="admin ? 'group cursor-pointer ' : ''" class="col-span-1 flex group flex-col text-center  border-proto_blue border-l-4 rounded-sm shadow"> <!--divide-y dark:divide-proto_green divide-gray-500-->
                            <div @click="removeFromQueue(video)" :class="admin ? 'group-hover:bg-opacity-60' : ''" class=" flex-1 rounded-m border-t border-b border-r dark:border-gray-800 border-gray-400 flex flex-col px-8 py-4 bg-white dark:bg-stone-800 bg-opacity-80">
                                <h3 class="font-bold dark:text-stone-300 text-gray-800 text-left text-md">{{ video.title }}</h3>
                                <div class="mt-auto w-full">
                                    <div class="flex-1 text-gray-900 justify-bottom align-bottom mt-auto flex text-right ">
                                    <svg class="align flex-shrink-0 mr-1.5 h-5 w-5 dark:text-stone-300" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                                        <path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clip-rule="evenodd"></path>
                                    </svg>
                                    <span class="text-gray-900 dark:text-stone-300 text-sm font-medium truncate">{{ video.channel }}</span>
                                    </div>
                                    <div class="flex-1 text-gray-900 mt-0 flex text-right ">
                                    <svg class="flex-shrink-0 mr-1.5 h-5 w-5 dark:text-stone-300" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                                        <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clip-rule="evenodd"></path>
                                    </svg>
                                    <span class="text-gray-900 dark:text-stone-300 text-sm font-medium truncate">{{ video.durationFormatted }}</span>
                                    <span v-if="admin" class="ml-auto group-hover:opacity-100 opacity-0 duration-300 bg-red-600 rounded-sm p-1 text-xs shadow-lg text-white font-medium truncate">Remove</span>
                                    </div>
                                </div>
                            </div>
                        </li>
                    </ul>
                    <div v-if="!skeletonLoading && queue.length < 1" class="text-gray-400 ml-8"> Empty queue </div>
                </div>
            </div>
    </ContentField>
</template>

<script setup>
import ContentField from '@/layout/ContentField.vue'
import SkeletonResult from '@/components/skeletons/SkeletonResult.vue'
import { defineProps, ref, computed, defineEmits } from 'vue'
import adminSocket from '@/js-2/AdminRemoteSocket'
import normalSocket from '@/js-2/RemoteSocket'
import { STATUS } from '../../../utils/constants'

const emit = defineEmits(['display-toast']);
const skeletonLoading = ref(true);
const queue = ref([]);
const socket = computed(() => {
    if(props.admin) return adminSocket;
    return normalSocket;
}).value;

const queueDuration = ref('--:--:--');

const props = defineProps({
    admin: {
        type: Boolean,
        default: false
    }
});


//eslint-disable-next-line
async function removeFromQueue(video) {
    if(!props.admin) return;
    //remove video from queue
    const data = await new Promise( resolve => {
        socket.emit('remove-video', video, callback => {
            resolve(callback);
        });
    });
    emit('display-toast', {
        status: data.status ?? STATUS.SUCCESS, 
        message: data.message ?? `Successfully skipped video!`
    });
}

// retrieving the queue and stop skeletonloading
socket.on("connect", async () => {
    const data = await new Promise( resolve => {
        socket.emit('get-queue', (queue) => {
            resolve(queue);
        });
    });
    queue.value = data.queue;
    queueDuration.value = data.duration;
    skeletonLoading.value = false;
});

socket.on('queue-update', (newQueue) => {
    queueDuration.value = newQueue.duration;
    queue.value = newQueue.queue;
});

</script>
