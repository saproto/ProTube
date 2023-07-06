<script setup lang="ts">
defineProps({
    text: {
        type: String,
        required: false,
        default: '',
    },
});
</script>

<template>
    <div
        class="bg-secondary rounded-md py-2 px-4 text-center text-white duration-200 hover:-translate-x-1 hover:-translate-y-0.5 hover:opacity-80 hover:shadow-lg"
    >
        <slot>
            {{ text }}
        </slot>
    </div>
</template>
