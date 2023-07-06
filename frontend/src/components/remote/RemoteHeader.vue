<script setup lang="ts">
import HeaderButtons from './HeaderButtons.vue';
// import { useAxios } from '@vueuse/integrations/useAxios';
import { useToggle } from '@vueuse/core';
import { Menu, GithubCircle, Search } from '@iconoir/vue';
import { ref } from 'vue';

interface SearchResults {
    status: statuses;
    items: Array<Record<string, unknown>>;
}
enum statuses {
    'ok',
    'loading',
}

defineProps({
    searchResults: {
        type: Object as () => SearchResults,
        default: () => ({
            status: 'ok',
            items: [],
        }),
    },
});

defineEmits(['update:searchResults']);

const [openedMenu, toggleMenu] = useToggle(false);
const searchString = ref('');

// const searchVideos = useAxios('http://google.com', { method: 'GET' }, { immediate: false });

import { useSearchVideosStore } from '@stores/searchVideosStore';

const videoSearch = useSearchVideosStore();
// props.searchResults.status = 'ok';
</script>

<template>
    <div class="flex flex-1 flex-col items-stretch">
        <h3 class="flex w-full text-2xl font-medium leading-6 text-white md:block">
            <span class="w-full"> ProTube playlist panel</span>
            <Menu
                :class="{ 'rotate-90': openedMenu }"
                class="block cursor-pointer duration-500 md:hidden"
                @click="toggleMenu()"
            ></Menu>
        </h3>
        <div class="mt-2 max-w-xl text-sm text-gray-200">
            <p>Search for any song on YouTube and add it to the ProTube playlist</p>
        </div>
        <div class="mt-auto flex pt-4 sm:items-center">
            <div class="group flex h-10 w-full md:max-w-md">
                <input
                    v-model="searchString"
                    minlength="1"
                    class="w-full min-w-min rounded-l-md border border-gray-400 bg-white pl-2 text-gray-700 placeholder-gray-500 outline-none focus:placeholder-gray-600"
                    placeholder="Search"
                />
                <button
                    :disabled="!searchString"
                    :class="
                        searchString
                            ? 'hover:border-search_button_border hover:bg-search_button_background hover:text-white'
                            : 'cursor-default opacity-80'
                    "
                    class="bg-search_button_background-light focus:border-search_button_border focus:bg-search_button_background dark:border-search_button_background-dark dark:bg-search_button_background-dark mx-auto inline-flex items-center justify-center rounded-r-md border p-2 font-medium shadow-sm duration-200 focus:text-white focus:outline-none dark:text-white"
                    @click="videoSearch.search(searchString)"
                >
                    <Search class="mx-1" />
                </button>
            </div>
        </div>
    </div>
    <HeaderButtons :opened-menu="openedMenu" :admin-screen="true" />

    <div class="absolute top-0 right-0 m-3 hidden md:block group">
        <GithubCircle class="ml-auto text-white opacity-70 hover:opacity-100" />
        <div class="group-hover:block hidden bg-primary-gray transition-300 mr-3 max-w-[250px] rounded-md py-2 px-5">
            If you are experiencing any problems with ProTube or have a feature request please let the
            <a href="https://haveyoutriedturningitoffandonagain.nl" class="text-secondary">HYTTIOAOAc</a>
            know by creating an issue on
            <a class="text-secondary" href="https://github.com/saproto/ProTube/issues/new">GitHub</a>!
        </div>
    </div>
</template>
