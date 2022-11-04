<template>
    <!-- <ErrorModal opacity=100 >
        {{ codeLookupTable[errorcode] }}
        <router-link to="/remote" class="w-full mt-2 justify-center mx-auto p-2 bg-proto_green rounded-md hover:bg-opacity-80 flex" >
            Return home
        </router-link>
    </ErrorModal> -->

    <div class="dark:bg-proto_background_gray-dark grid place-items-center min-h-screen">
        <div class="p-8 max-w-fit bg-white rounded-md mx-auto content-center shadow-md">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-20 text-yellow-600 text-center w-full" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            {{ codeLookupTable[errorcode] }}
            <router-link :to="routeback" v-if="routeback" :replace="true" class="mt-2 justify-center mx-auto p-2 bg-proto_blue text-white rounded-md hover:bg-opacity-80 flex" >
                Go Back
            </router-link>
            <router-link :to="'/remote'" :replace="true" class="mt-2 justify-center mx-auto p-2 bg-proto_blue text-white rounded-md hover:bg-opacity-80 flex" >
                Return home
            </router-link>
        </div>
    </div>
</template>

<script setup>
// import ErrorModal from '@/components/modals/ErrorModal.vue'
import { defineProps } from 'vue'
// import { useRoute, useRouter } from 'vue-router'

// const router = useRouter();
// const route = useRoute();
// See https://en.wikipedia.org/wiki/List_of_HTTP_status_codes for the error codes
defineProps({
    errorcode: {
        type: Number,
        default: 404
    }, 
    routeback: String
})
const codeLookupTable = {
    404: '404 - Page not found!',
    401: '401 - Unauthorized!',
    408: '408 - Page timeout!'
}
</script>