<script setup lang="ts">
import { ref } from "vue";

const dialog = ref(null);
let playlist = ref(null);

const visible = ref(false);

const showModal = (playList) => {
  playlist.value = playList;
  dialog.value?.showModal();
  visible.value = true;
};

const maxVideos = parseInt(
  import.meta.env.VITE_USER_MAX_VIDEOS_IN_QUEUE ?? "20"
);
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

const emit = defineEmits(["addPlaylist"]);

const addPlaylist = (shuffled) => {
  emit("addPlaylist", playlist.value.id, shuffled);
  closeModal();
};
</script>

<template>
  <dialog
    class="rounded-lg backdrop:bg-black/20 backdrop:backdrop-blur-md"
    ref="dialog"
    @close="visible = false">
    <form v-if="visible" method="dialog" class="m-2">
      <div class="mb-3 flex w-full justify-between">
        <div class="mb-3 flex items-center text-3xl">Add playlist</div>
        <button
          class="m-2 items-center text-2xl text-red-500"
          @click="closeModal">
          <font-awesome-icon class="mb-1" icon="fa-solid fa-times" />
        </button>
      </div>
      <div class="mb-1 text-xl text-gray-600 dark:text-white">
        {{ playlist.title }}
      </div>

      <img
        class="mb-1 max-w-sm rounded-lg"
        :src="playlist.thumbnail.url"
        alt="album thumbnail" />
      <div class="mx-5 mb-3 flex justify-between">
        <div class="text-md text-gray-600 dark:text-white">
          {{ playlist.channel }}
        </div>
        <div class="text-md text-gray-600 dark:text-white">
          {{ playlist.videoCount }} videos
        </div>
      </div>
      <div
        v-if="!admin && parseInt(playlist.videoCount) > maxVideos"
        class="mb-1 text-sm italic text-red-400 dark:text-white">
        Note: Only the first {{ maxVideos }} videos will be added to the queue
      </div>
      <div class="flex flex-row justify-between">
        <button
          class="bg-proto_green hover:bg-proto_green/80 rounded-md px-2 py-1 text-sm text-white shadow-md duration-200 hover:-translate-x-1 hover:-translate-y-0.5 hover:opacity-80"
          @click="addPlaylist(false)">
          Add playlist
        </button>
        <button
          class="bg-proto_blue hover:bg-proto_blue/80 rounded-md px-2 py-1 text-sm text-white shadow-md duration-200 hover:-translate-x-1 hover:-translate-y-0.5 hover:opacity-80"
          @click="addPlaylist(true)">
          Add shuffled playlist
        </button>
      </div>
    </form>
  </dialog>
</template>
