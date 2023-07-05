<template>
    <div
        class="pointer-events-auto w-full max-w-sm overflow-hidden rounded-lg bg-white shadow-lg ring-1 ring-black ring-opacity-5"
    >
        <div class="p-4">
            <div class="flex items-center">
                <div class="flex w-0 flex-1 justify-between">
                    <p class="w-0 flex-1 text-sm font-medium text-black">
                        {{ text }}
                    </p>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
defineProps({
    text: {
        type: String,
        required: true,
        default: 'Undifined toast',
    },
});
</script>
