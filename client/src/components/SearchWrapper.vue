<template>
  <HeaderField>
    <div class="flex flex-1 flex-col items-stretch">
      <h3
        class="flex w-full text-2xl font-medium leading-6 text-white md:block">
        <span class="w-full"> ProTube playlist panel</span>
        <font-awesome-icon
          :class="openMenu ? 'fa-rotate-90' : 'fa-rotate-0'"
          class="block cursor-pointer duration-500 md:hidden"
          icon="bars"
          @click="openMenu = !openMenu" />
      </h3>
      <div class="mt-2 max-w-xl text-sm text-gray-200">
        <p>Search for any song on YouTube and add it to the ProTube playlist</p>
      </div>
      <form
        class="mt-auto flex pt-4 sm:items-center"
        @submit.prevent="processQuery">
        <div class="group flex h-10 w-full md:max-w-md">
          <input
            v-model="searchString"
            minlength="1"
            class="w-full min-w-min rounded-l-md border border-gray-400 bg-white pl-2 text-gray-700 placeholder-gray-500 outline-hidden focus:placeholder-gray-600"
            placeholder="Search" />
          <button
            :disabled="!searchString"
            :class="
              searchString
                ? 'hover:border-search_button_border hover:bg-search_button_background hover:text-white'
                : 'cursor-default opacity-80'
            "
            class="bg-search_button_background-light focus:border-search_button_border focus:bg-search_button_background dark:border-search_button_background-dark dark:bg-search_button_background-dark mx-auto inline-flex items-center justify-center rounded-r-md border p-2 font-medium shadow-xs duration-200 focus:text-white focus:outline-hidden dark:text-white">
            <font-awesome-icon icon="fa-solid fa-search" class="mx-1">
            </font-awesome-icon>
          </button>
        </div>
      </form>
    </div>
    <HeaderFieldButtons
      :classes="openMenu ? '' : 'md:block hidden'"
      :admin-screen="user.admin"
      screen
      :name="user.name" />

    <div
      class="absolute right-0 top-0 m-3 hidden md:block"
      @mouseleave="infoTooltipVisible = false">
      <font-awesome-icon
        icon="fa-solid fa-question-circle"
        size="lg"
        class="transition-500 text-white opacity-70 transition-opacity hover:opacity-100"
        @mouseenter="infoTooltipVisible = true">
      </font-awesome-icon>
      <div
        v-show="infoTooltipVisible"
        class="dark:bg-proto_secondary_gray-dark transition-300 float-left mr-3 max-w-[250px] rounded-md bg-white px-5 py-2 text-justify dark:text-white">
        If you are experiencing any problems with ProTube or have a feature
        request please let the
        <a
          href="https://haveyoutriedturningitoffandonagain.nl"
          class="text-proto_blue"
          >HYTTIOAOAc</a
        >
        know by creating an issue on
        <a
          class="text-proto_blue"
          href="https://github.com/saproto/ProTube/issues/new"
          >GitHub</a
        >!
      </div>
    </div>
  </HeaderField>
</template>

<script setup>
import { ref } from "vue";
import HeaderField from "@/layout/HeaderField.vue";
import HeaderFieldButtons from "@/components/HeaderFieldButtons.vue";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";

const searchString = ref("");
defineProps({
  user: { type: Object, default: null },
});

const emit = defineEmits([
  "query-videos",
  "query-single-video",
  "query-playlist",
]);
const openMenu = ref(false);
const infoTooltipVisible = ref(false);

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
