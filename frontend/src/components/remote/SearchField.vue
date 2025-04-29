<script setup lang="ts">
import { ref } from 'vue';
import { useSearchVideosStore } from '@stores/searchVideosStore';
import { Search } from '@iconoir/vue';

const searchString = ref('');
const videoSearch = useSearchVideosStore();

function search() {
    videoSearch.search(searchString.value);
}
</script>

<template>
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
                @click="search()"
            >
                <Search class="mx-1" />
            </button>
        </div>
    </div>
</template>
