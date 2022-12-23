<template>
  <ContentField
    id="nav"
    style="transition: all 0.5s ease 0.5s"
    class="sticky top-0">
      <div class="items-top flex flex-col justify-between pb-2 md:flex-row">
        <label class="text-2xl text-gray-600 dark:text-white">
          Queue - {{ queueDuration }}
        </label>
        <div class="relative" v-if="queue.length >= 1 && admin">
          <div class="flex rounded-md md:mt-0 mt-4 duration-200 text-center text-white">
            <button
              @click="clearQueue()"
              class="px-4 py-0.5 rounded-l-md hover:-translate-x-1 hover:-translate-y-0.5 hover:opacity-80 hover:shadow-lg bg-proto_blue ">
              Clear queue
            </button>
            <button
              @click="removeVideoDropDown = true"
              @focusout="hideRemoveVideoDropDown" 
              class="px-4 py-0.5 rounded-r-md border-l border-l-white hover:-translate-x-1 hover:opacity-80 hover:-translate-y-0.5 hover:shadow-lg bg-proto_blue ">
              <font-awesome-icon :class="removeVideoDropDown ? 'rotate-180' : ''" class="duration-300" icon="fa-solid fa-caret-down" fixed-width/>
            </button>
          </div>
          <div v-show="removeVideoDropDown" class="relative mt-1">
            <div class="absolute top-0 z-10 w-full">
              <div class="bg-proto_green rounded-t-md px-2 py-0.5 text-white">
                Remove user
              </div>
              <ul class="w-full max-h-60 overflow-auto scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-proto_background_gray dark:scrollbar-thumb-neutral-800 dark:scrollbar-track-proto_background_gray-dark rounded-b-md dark:bg-proto_background_gray-dark bg-white py-1 focus:outline-none divide-y divide-stone-300 border border-stone-300">
                <li v-for="video in usersInQueue" :key="video.user.id" @click="removeVideosForUser(video.user.user_id)" class="text-gray-600 dark:text-white py-1 pl-3 pr-9 hover:cursor-pointer w-full duration-300 text-left hover:text-white hover:bg-proto_blue">
                  {{ video.user.name }}
                </li>                
              </ul>
            </div>
          </div>
        </div>
        <div v-else-if="!admin && userHasItemsInQueue">
          <button
              @click="removeVideosForUser(userID)"
              class="px-4 py-0.5 rounded-md hover:-translate-x-1 hover:-translate-y-0.5 hover:opacity-80 hover:shadow-lg bg-proto_blue text-white">
              Remove all my videos
            </button>
        </div>
    </div>
    <div
      class="scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-proto_background_gray dark:scrollbar-thumb-neutral-800 dark:scrollbar-track-proto_background_gray-dark flex max-h-[84vh] justify-center overflow-y-scroll overscroll-contain px-0">
      <div v-if="skeletonLoading" class="w-full">
        <ul class="grid gap-2">
          <SkeletonResult v-for="index in 10" :key="index" />
        </ul>
      </div>
      <div v-if="!skeletonLoading" class="w-full">
        <ul class="grid gap-2 pr-4">
          <VideoCard
            v-for="(video, index) in queue"
            :key="video.id"
            :index="index"
            :title="video.title"
            :name="video.user.name"
            :channel="video.channel"
            :duration="video.durationFormatted"
            :thumbnail="video.thumbnail.url"
            :removeButton="admin || video.user.user_id === userID"
            :videoID="video.id"
            @remove-clicked="removeFromQueue([video.id])" />
        </ul>
        <div
          v-if="!skeletonLoading && queue.length < 1"
          class="mt-4 text-gray-400">
          The queue is empty, try searching for some fun tunes!
        </div>
      </div>
    </div>
  </ContentField>
</template>

<script setup>
import ContentField from "@/layout/ContentField.vue";
import SkeletonResult from "@/components/skeletons/SkeletonResult.vue";
import VideoCard from "@/components/VideoCard.vue";
import { ref, computed } from "vue";
import adminSocket from "@/js/AdminRemoteSocket";
import normalSocket from "@/js/RemoteSocket";
import enums from "@/js/Enums";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";

const emit = defineEmits(["display-toast"]);
const skeletonLoading = ref(true);
const removeVideoDropDown = ref(false);
const queue = ref([]);
const socket = computed(() => {
  if (props.admin) return adminSocket;
  return normalSocket;
});

const queueDuration = ref("--:--:--");

const props = defineProps({
  admin: {
    type: Boolean,
    default: false,
  },
  userID: Number
});

// return array of unique users in queue
const usersInQueue = computed(() => {
  return queue.value.filter((video, index, self) =>
    index === self.findIndex((t) => (
      t.user.user_id === video.user.user_id && t.user.name === video.user.name
    )
  )) 
});

const userHasItemsInQueue = computed(() => {
  const videosOfUser = queue.value.filter((video) => {
    return video.user.user_id === props.userID
  });
  console.log(videosOfUser);
  return videosOfUser.length > 0;
})

// Dropdown to select a user for deleting videos
function hideRemoveVideoDropDown(){
  setTimeout(() => {
    removeVideoDropDown.value = false;
  }, 100)
}

async function removeFromQueue(videoIDs) {
  const data = await new Promise((resolve) => {
    normalSocket.emit("remove-videos", videoIDs, (callback) => {
      resolve(callback);
    });
  });
  emit("display-toast", {
    status: data.status ?? enums.STATUS.SUCCESS,
    message: data.message ?? `Successfully removed video(s)!`,
  });
}

async function clearQueue() {
  if (!props.admin) return;
  const data = await new Promise((resolve) => {
    socket.value.emit("clear-queue", (callback) => {
      resolve(callback);
    });
  });
  emit("display-toast", {
    status: data.status ?? enums.STATUS.SUCCESS,
    message: data.message ?? `Succesfully removed all videos from the queue!`,
  });
}

// Remove all videos by user id
async function removeVideosForUser(userID){
  // get all videos for a user id
  const videosToRemove = queue.value.filter((video) => {
    return video.user.user_id === userID
  });

  // create an array of video ids to remove
  let videoIDs = [];
  for(const video of videosToRemove){
    videoIDs.push(video.id);
  }

  await removeFromQueue(videoIDs);
}

// retrieving the queue and stop skeletonloading
socket.value.on("connect", async () => {
  const data = await new Promise((resolve) => {
    socket.value.emit("get-queue", (queue) => {
      resolve(queue);
    });
  });
  queue.value = data.queue;
  queueDuration.value = data.duration;
  skeletonLoading.value = false;
});

socket.value.on("queue-update", (newQueue) => {
  queueDuration.value = newQueue.duration;
  queue.value = newQueue.queue;
});
</script>
