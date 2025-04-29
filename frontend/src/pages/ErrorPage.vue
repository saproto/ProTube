<template>
    <div class="flex h-screen bg-primary">
        <div class="center m-auto">
            <div class="m-auto text-4xl w-72 text-white">Brokey brokey</div>
            <div class="text-white">
                <RouterLink :to="{ name: 'Remote' }">Go home</RouterLink>
                or go
                <RouterLink to="/">back</RouterLink>
            </div>
        </div>
    </div>
</template>
