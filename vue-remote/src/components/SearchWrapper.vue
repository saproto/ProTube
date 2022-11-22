
<template>
  <HeaderField>
    <div class="flex-1">
      <h3 class=" leading-6 font-medium text-white text-2xl w-full flex md:block">
        <span class="w-full"> ProTube playlist panel</span>
        <font-awesome-icon @click="openMenu = !openMenu" :class="openMenu ? 'fa-rotate-90' : 'fa-rotate-0'" class="md:hidden block duration-500 cursor-pointer" icon="bars" />
      </h3>
      <div class="mt-2 max-w-xl text-sm text-gray-200 ">
        <p>Search for any song on YouTube and add it to the ProTube playlist</p>
      </div>
      <form @submit.prevent="processQuery" class="mt-5 flex  sm:items-center">
        <div class="w-full h-10 flex group md:max-w-md ">
          <input minlength="1" v-model="searchString" class="bg-white min-w-min placeholder-gray-500  focus:placeholder-gray-600  text-gray-700 pl-2 rounded-l-md border border-gray-400 outline-none w-full" placeholder="Search"/>
          <button :disabled="!searchString" :class="searchString ? 'hover:bg-search_button_background hover:border-search_button_border hover:text-white' : 'cursor-default opacity-80'" class="inline-flex items-center mx-auto justify-center p-2 border shadow-sm font-medium rounded-r-md dark:bg-search_button_background-dark dark:border-search_button_background-dark bg-search_button_background-light focus:outline-none focus:bg-search_button_background focus:text-white dark:text-white focus:border-search_button_border">
            <svg class="w-5 h-5 mx-1" id="searchIcon" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
            </svg>
          </button>
        </div>
      </form>      
    </div>
    <HeaderFieldButtons :classes="openMenu ? '' : 'md:block hidden'" :admin-remote="user.admin" :admin-screen="user.admin" screen :name="user.name"/>
  </HeaderField>
</template>

<script setup>
import { ref, onMounted, defineEmits, defineProps } from 'vue';
import HeaderField from '@/layout/HeaderField.vue'
import HeaderFieldButtons from '@/components/HeaderFieldButtons.vue'
import socket from '@/js-2/RemoteSocket'

const searchString = ref("");
defineProps({
  user: Object
});

const emit = defineEmits(['query-videos', 'query-single-video', 'query-playlist']);
const openMenu = ref(false);

onMounted(async () => {
});

socket.on("connect_error", async (err) => {
    console.log("v2:_searchwrapper");
    console.log("Socket connect error: ");
    if(err.message == 'no_cookie_please_reconnect'){
        await fetch('https://localhost:3000/api/test');
        socket.connect();
    } if(err.message == 'unauthorized') {
        console.log("no_auth");
    }
});

async function processQuery() {
  const query = searchString.value;
  searchString.value = "";
  //nothing was filled in, so do nothing
  if(query.trim() === '') return;

  let url = {};
  try {
    url = new URL(query);
  }catch(e) {
    //failed to parse as url, treat as search query.
    return emit('query-videos', query);
  }

  //get host, filtering out subdomains
  const host = url.host.replace(/^[^.]+\./g, "");
  switch(host) {
    case 'youtube.com': {
      const playlistId = url.searchParams.get('list');

      if(playlistId) return emit('query-playlist', playlistId);
      
      const videoId = url.pathname.startsWith('/v') ? url.pathname.substring(3, url.pathname.length - 1) : url.searchParams.get('v');
      if(videoId) return emit('query-single-video', videoId);
      break;
    }
    case 'spotify.com': {
      //todo implement other hosts
    }
  }

  //url was invalid or an unknown host. treat as search query
  return emit('query-videos', query);
}
</script>
