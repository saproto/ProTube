<script setup lang="ts">
import { ref} from 'vue';

const dialog = ref(null);
let playlist = ref(null);

const visible = ref(false);

const showModal = (playList) => {
  playlist.value = playList;
  dialog.value?.showModal();
  visible.value = true;
};

const maxVideos = parseInt(import.meta.env.VITE_USER_MAX_VIDEOS_IN_QUEUE??'20');
const closeModal = () => {
  dialog.value?.close();
  visible.value = false;
};

defineExpose({
  show: showModal,
  close: (returnVal) => {
    dialog.value?.close(returnVal);
    visible.value = false;
    playlist.value = null;
    },
  visible,
});

defineProps({
  admin: Boolean,
});

const emit = defineEmits([
  "addPlaylist",
]);

const addPlaylist = (shuffled) => {
  emit("addPlaylist", playlist.value.id, shuffled);
  closeModal();
};
</script>

<template>
  <dialog
    class="rounded-lg backdrop:bg-black/20 backdrop:backdrop-blur-md"
    ref="dialog"
    @close="visible = false"
  >
    <form
      v-if="visible"
      method="dialog"
      class="m-2"
    ><div class="flex w-full justify-between mb-3">
      <div class="text-3xl flex items-center mb-3">
        Add playlist
      </div>
        <button class="text-2xl text-red-500 items-center m-2" @click="closeModal">
          <font-awesome-icon class="mb-1" icon="fa-solid fa-times" />
        </button>
    </div>
      <div class="text-xl mb-1 text-gray-600 dark:text-white">
        {{ playlist.title }}
      </div>

      <img class="rounded-lg mb-1 max-w-sm" :src="playlist.thumbnail.url" alt="album thumbnail"/>
      <div class="mx-5 flex justify-between mb-3">
        <div class="text-md text-gray-600 dark:text-white">
          {{ playlist.channel }}
        </div>
        <div class="text-md text-gray-600 dark:text-white">
          {{ playlist.videoCount }} videos
        </div>
      </div>
      <div v-if="!admin && parseInt(playlist.videoCount)>maxVideos" class="mb-1 italic text-sm text-red-400 dark:text-white">
        Note: Only the first {{maxVideos}} videos will be added to the queue
      </div>
      <div class="flex flex-row justify-between">
      <button class="bg-proto_green hover:bg-proto_green/80 rounded-md py-1 px-2 text-sm text-white shadow-md duration-200 hover:-translate-x-1 hover:-translate-y-0.5 hover:opacity-80" @click="addPlaylist(false)">
        Add playlist
      </button>
      <button class="bg-proto_blue hover:bg-proto_blue/80 rounded-md py-1 px-2 text-sm text-white shadow-md duration-200 hover:-translate-x-1 hover:-translate-y-0.5 hover:opacity-80" @click="addPlaylist(true)">
        Add shuffled playlist
      </button>
      </div>
    </form>
  </dialog>
</template>