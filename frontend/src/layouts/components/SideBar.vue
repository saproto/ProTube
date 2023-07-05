<script setup lang="ts">
function switchTheme() {
    if (localStorage.theme !== 'dark' || !('theme' in localStorage)) {
        document.documentElement.classList.add('dark');
        localStorage.theme = 'dark';
    } else {
        document.documentElement.classList.remove('dark');
        localStorage.theme = 'light';
    }
}
</script>

<template>
    <div class="bg-primary-gray mt-4 overflow-hidden shadow md:rounded-sm">
        <div class="m-8">
            <button @click="switchTheme">Switch Theme</button>
            <slot></slot>
        </div>
    </div>
</template>
