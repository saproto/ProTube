<template>
    <div> 
        <transition name="modal">
            <LoadModal message="Authenticating..." :opacity="100" />
        </transition>
    </div>
</template>

<script setup>
import LoadModal from '@/components/modals/LoadModal.vue'
import { onMounted } from 'vue'

onMounted(() => {
    location.href = '/api/login'
});
</script>