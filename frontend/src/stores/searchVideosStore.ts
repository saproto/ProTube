import { useAxios } from '@vueuse/integrations/useAxios';
import { defineStore } from 'pinia';
import { ref, Ref } from 'vue';

export const useSearchVideosStore = defineStore('searchVideoStore', () => {
    const foundVideos: Ref<string[]> = ref([]);

    const searchVideos = useAxios('https://google.com', { method: 'GET' }, { immediate: false });

    async function search(searcheable: string) {
        return await searchVideos.execute({
            params: {
                search: searcheable,
            },
        });
    }

    return { foundVideos, status: searchVideos, search };
});
