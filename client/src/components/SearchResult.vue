<template >
<transition @before-enter="beforeEnter" @enter="enter" appear>
    <li :style='{background: "url("+video.thumbnail.url+")"}' style="background-repeat: no-repeat; background-size: cover; background-position: center center;" class="col-span-1 flex group flex-col text-center  border-proto_blue border-l-4 rounded-sm shadow"> <!--divide-y dark:divide-proto_green divide-gray-500-->
    <button 
        :disabled="videoStatusCode !== STATUS.NOTHING" 
        @click="addVideoToQueue()" 
        :class='(videoStatusCode !== STATUS.NOTHING) ? "cursor-default" : "group-hover:bg-white/60 group-hover:dark:bg-stone-800/60"' 
        class="flex-1 duration-200 rounded-m border-t border-b border-r dark:border-gray-800 border-gray-400 flex flex-col px-8 py-4 bg-white/80 dark:bg-stone-800/80"
      >
      <h3 class="font-bold dark:text-stone-300 text-gray-800 text-left text-md">{{ video.title }}</h3>
      <div class="mt-auto w-full">
        <div class="flex-1 text-gray-900 justify-bottom align-bottom mt-auto flex text-right ">
          <svg class="align shrink-0 mr-1.5 h-5 w-5 dark:text-stone-300" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
            <path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clip-rule="evenodd"></path>
          </svg>
          <span class="text-gray-900 dark:text-stone-300 text-sm font-medium truncate">{{ video.channel }}</span>
        </div>
        <div class="flex-1 text-gray-900 mt-0 flex text-right ">
          <svg class="shrink-0 mr-1.5 h-5 w-5 dark:text-stone-300" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clip-rule="evenodd"></path>
          </svg>
          <span class="text-gray-900 dark:text-stone-300 text-sm font-medium truncate">{{ video.durationFormatted }}</span>
        </div>
        <div class="flex-1 text-gray-900 flex w-full  text-right ">
            <svg class="align shrink-0 mr-1.5 h-5 w-5 dark:text-stone-300" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
              <path d="M10 12a2 2 0 100-4 2 2 0 000 4z"></path>
              <path fill-rule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clip-rule="evenodd"></path>
            </svg>
          <span class="text-gray-900 dark:text-stone-300 text-sm font-medium truncate">{{ video.viewsFormatted }}</span>

            <!-- Heroicon name: check/success -->
            <svg v-show="videoStatusCode === STATUS.SUCCESS" class="w-5 h-5 ml-auto text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>

            <!-- Heroicon name: warning/duplicate -->
            <svg v-show="videoStatusCode === STATUS.WARNING" class="w-5 h-5 ml-auto text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
            </svg>

            <!-- Heroicon name: cross/error -->
            <svg v-show="videoStatusCode === STATUS.ERROR" class="w-5 h-5 ml-auto text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>

        </div>
      </div>
    </button>
  </li> 
</transition>
</template>

<script setup>
import { defineProps, defineEmits, ref } from 'vue';
import socket from '@/js/RemoteSocket'
import gsap from 'gsap'

const { STATUS } = require('../../../utils/constants')

const emit = defineEmits(['display-toast'])

const props = defineProps({
  video: Object,
  index: Number
});

const videoStatusCode = ref(STATUS.NOTHING);

async function addVideoToQueue(){
    // set to arbitrary value to disable the button
    videoStatusCode.value = -4;
    const data = await new Promise( resolve => {
        socket.emit('fetch-then-add-video', props.video.id, callback => {
            resolve(callback);
        });
    });
    videoStatusCode.value = data.success === true ? STATUS.SUCCESS : data.status;
    emit('display-toast', {
      status: data.status ?? STATUS.SUCCESS, 
      message: data.message ?? "Successfully added to the queue!"
    });
}

//animations
const beforeEnter = ((el) => {
    el.style.opacity = 0;
    el.style.transform = 'translateY(-50px)';
});

const enter = ((el, done) => {
    gsap.to(el, {
        opacity: 1,
        ease: "back.out(1.4)",
        y: 0,
        duration: 0.5,
        onComplete: done,
        delay: 0.05*props.index
    });
});

</script>