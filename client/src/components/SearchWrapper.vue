<template>
  <HeaderField>
    <div class="flex flex-1 flex-col items-stretch">
      <h3
        class="flex w-full text-2xl font-medium leading-6 text-white md:block">
        <span class="w-full"> ProTube playlist panel</span>
        <font-awesome-icon
          @click="openMenu = !openMenu"
          :class="openMenu ? 'fa-rotate-90' : 'fa-rotate-0'"
          class="block cursor-pointer duration-500 md:hidden"
          icon="bars" />
      </h3>
      <div class="mt-2 max-w-xl text-sm text-gray-200">
        <p>Search for any song on YouTube and add it to the ProTube playlist</p>
      </div>
      <form
        @submit.prevent="processQuery"
        class="mt-auto flex p-0 sm:items-center">
        <div class="group flex h-10 w-full md:max-w-md">
          <input
            minlength="1"
            v-model="searchString"
            class="w-full min-w-min rounded-l-md border border-gray-400 bg-white pl-2 text-gray-700 placeholder-gray-500 outline-none focus:placeholder-gray-600"
            placeholder="Search" />
          <button
            :disabled="!searchString"
            :class="
              searchString
                ? 'hover:border-search_button_border hover:bg-search_button_background hover:text-white'
                : 'cursor-default opacity-80'
            "
            class="bg-search_button_background-light focus:border-search_button_border focus:bg-search_button_background dark:border-search_button_background-dark dark:bg-search_button_background-dark mx-auto inline-flex items-center justify-center rounded-r-md border p-2 font-medium shadow-sm duration-200 focus:text-white focus:outline-none dark:text-white">
            <font-awesome-icon
              icon="fa-solid fa-search"
              class="mx-1"></font-awesome-icon>
          </button>
        </div>
      </form>
    </div>
    <HeaderFieldButtons
      :classes="openMenu ? '' : 'md:block hidden'"
      :admin-remote="user.admin"
      :admin-screen="user.admin"
      screen
      :name="user.name" />
  </HeaderField>
</template>

<script setup>
import { ref, onMounted } from "vue";
import HeaderField from "@/layout/HeaderField.vue";
import HeaderFieldButtons from "@/components/HeaderFieldButtons.vue";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";

const searchString = ref("");
defineProps({
  user: Object,
});

const emit = defineEmits([
  "query-videos",
  "query-single-video",
  "query-playlist",
]);
const openMenu = ref(false);

onMounted(async () => {});

async function processQuery() {
  const query = searchString.value;
  searchString.value = "";
  //nothing was filled in, so do nothing
  if (query.trim() === "") return;

  let url = {};
  try {
    url = new URL(query);
  } catch (e) {
    //failed to parse as url, treat as search query.
    return emit("query-videos", query);
  }

  //get host, filtering out subdomains
  const host = url.host.replace(/^[^.]*\.(?=\w+\.\w+$)/g, "");
  switch (host) {
    case "youtube.com": {
      const playlistId = url.searchParams.get("list");

      if (playlistId) return emit("query-playlist", playlistId);

      const videoId = url.pathname.startsWith("/v")
        ? url.pathname.substring(3, url.pathname.length - 1)
        : url.searchParams.get("v");
      if (videoId) return emit("query-single-video", videoId);
      break;
    }
    case "spotify.com": {
      // TODO: Implement other music/video hosts
    }
  }

  //url was invalid or an unknown host. treat as search query
  return emit("query-videos", query);
}
</script>
