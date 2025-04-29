import route from '@/utils/routeHelper';
import { useAxios } from '@vueuse/integrations/useAxios';
import { defineStore } from 'pinia';
import { ref, Ref } from 'vue';

export const useSearchVideosStore = defineStore('searchVideoStore', () => {
    const foundVideos: Ref<http.searchYoutube['videos']['results']> = ref([]);
    const foundPlaylists: Ref<http.searchYoutube['playlists']['results']> = ref([]);
    const videoContinuationToken: Ref<string | null> = ref(null);
    const playlistContinuationToken: Ref<string | null> = ref(null);

    // const searchVideos = useAxios('https://google.com', { method: 'GET' }, { immediate: false });
    const httpClient = useAxios(route('http.searchYoutube'), { method: 'GET' }, { immediate: false });
    const addClient = useAxios(route('http.addVideoToQueue'), { method: 'POST' }, { immediate: false });

    async function search(searcheable: string): Promise<void> {
        const r = await httpClient.execute({
            params: {
                search: searcheable,
            },
        });

        updateSearchResults(r.data.value as http.searchYoutube);
    }

    function resetSearchResults(): void {
        foundVideos.value = [];
        foundPlaylists.value = [];
        videoContinuationToken.value = null;
        playlistContinuationToken.value = null;
    }

    function updateSearchResults(results: http.searchYoutube): void {
        foundVideos.value = results.results;
        // foundPlaylists.value = results.playlists.results;
        videoContinuationToken.value = results.continuationToken;
        // playlistContinuationToken.value = results.playlists.continuationToken;
    }

    async function addToQueue(videoId: string): Promise<void> {
        addClient.execute({
            data: {
                videoId,
            },
        });
    }

    return {
        foundVideos,
        foundPlaylists,
        videoContinuationToken,
        playlistContinuationToken,
        status: httpClient,
        search,
        addToQueue,
    };
});
