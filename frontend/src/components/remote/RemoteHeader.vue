<script setup lang="ts">
import HeaderButtons from './HeaderButtons.vue';
import { useToggle } from '@vueuse/core';
import { Menu, GithubCircle } from '@iconoir/vue';

const [openedMenu, toggleMenu] = useToggle(false);

// const searchVideos = useAxios('http://google.com', { method: 'GET' }, { immediate: false });

import { useSearchVideosStore } from '@stores/searchVideosStore';
import SearchField from './SearchField.vue';
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
        <SearchField />
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
