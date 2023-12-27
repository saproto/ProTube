import { Client, SearchResult, type PlaylistCompact, type VideoCompact, PlaylistVideos } from 'youtubei';
import moment from 'moment';
import c from '#Config.js';

const youtube = new Client();

interface SearchedVideo {
    video_id: string
    title: string
    duration_s: number
    duration_formatted: string
    thumbnail: string
    uploadDate: string
    views: number
    views_formatted: string
};
interface SearchedPlayList {
    playlist_id: string
    title: string
    thumbnail: string
}

interface SearchResults {
    videos: {
        results: SearchedVideo[]
        continuationToken: string | null
    }
    playlists: {
        results: SearchedPlayList[]
        continuationToken: string | null
    }
}

/**
 * Search the YouTube api for videos!
 *
 * @param query The search query where to search for
 * @param durationLimitS The limit of a video (in seconds), set to -1 for admins to disable this. By default this is set to the max_video_duration in the config
 * @returns The found playlists + videos
 */
export async function search (query: string, durationLimitS: number = c.general.max_video_duration): Promise<SearchResults> {
    return {
        videos: await searchVideos(query, durationLimitS),
        playlists: await searchPlaylists(query)
    };
}

/**
 * Do an initial search for videos on youtube for a given string
 *
 * @param query The search query
 * @param durationLimitS The limit of a video (in seconds), set to -1 for admins to disable this. By default this is set to the max_video_duration in the config
 * @returns Formatted videos that were found for the query
 */
async function searchVideos (query: string, durationLimitS: number): Promise<SearchResults['videos']> {
    const videos = await youtube.search(query, {
        type: 'video'
    });

    return formatSearchVideos(videos.items, durationLimitS, videos.continuation);
}

/**
 * Do an initial search for playlists on youtube for a given string
 *
 * @param query The search query
 * @returns Formatted playlists that were found for the query
 */
async function searchPlaylists (query: string): Promise<SearchResults['playlists']> {
    const playlists = await youtube.search(query, {
        type: 'playlist'
    });

    return formatSearchPlaylists(playlists.items, playlists.continuation);
}

/**
 * Search the next page of a previous result based on a continuationtoken
 *
 * @param playListContinuationToken The continuationtoken for a playlist search
 * @param videoContinuationToken The continuationtoken for a video search
 * @param durationLimitS The limit of a video (in seconds), set to -1 for admins to disable this. By default this is set to the max_video_duration in the config
 * @returns
 */
export async function searchNextPage (playListContinuationToken: string | null, videoContinuationToken: string | null, durationLimitS: number = c.general.max_video_duration): Promise<SearchResults> {
    return {
        videos: await searchNextPageVideos(playListContinuationToken, durationLimitS),
        playlists: await searchNextPagePlayLists(videoContinuationToken)
    };
}

/**
 * Search the next page of a previous result based on a continuationtoken
 *
 * @param continuationToken The continuationtoken for a video search
 * @param durationLimitS The limit of a video (in seconds), set to -1 for admins to disable this. By default this is set to the max_video_duration in the config
 * @returns Formatted videos that were found for the query
 */
async function searchNextPageVideos (continuationToken: string | null = null, durationLimitS: number = c.general.max_video_duration): Promise<SearchResults['videos']> {
    const videos = new SearchResult<'video'>({ client: youtube });
    videos.continuation = continuationToken;
    await videos.next();

    return formatSearchVideos(videos.items, durationLimitS, videos.continuation);
}

/**
 * Search the next page of a previous result based on a continuationtoken
 *
 * @param continuationToken The continuationtoken for a playlist search
 * @returns Formatted playlists that were found for the query
 */
async function searchNextPagePlayLists (continuationToken: string | null = null): Promise<SearchResults['playlists']> {
    const playlists = new SearchResult<'playlist'>({ client: youtube });
    playlists.continuation = continuationToken;
    await playlists.next();

    return formatSearchPlaylists(playlists.items, playlists.continuation);
}

/**
 * Format and filter the videos that were found
 *
 * @param videos The videos that were found
 * @param durationLimitS The limit of a video (in seconds), set to -1 for admins to disable this. By default this is set to the max_video_duration in the config
 * @param continuationToken The continuationtoken for the search
 * @returns Formatted videos that were found for the query
 */
function formatSearchVideos (videos: VideoCompact[], durationLimitS: number, continuationToken: string | null = null): SearchResults['videos'] {
    // Filter out videos that are too long (-1 for admins to disable this)
    if (durationLimitS > 0) {
        videos = videos.filter(video => (video.duration ?? -1) < durationLimitS);
    }

    const formattedVideos = videos.map(video => {
        const duration = video.duration ?? -1;
        const durationFormatted = moment.utc(
            moment.duration(duration, 'seconds')
                .as('milliseconds')
        ).format('hh:mm:ss');

        const views = video.viewCount ?? -1;
        const formattedViews = formatViews(views);

        return {
            video_id: video.id,
            title: video.title,
            duration_s: duration,
            duration_formatted: durationFormatted,
            thumbnail: video.thumbnails[video.thumbnails.length - 1].url,
            uploadDate: video.uploadDate ?? '',
            views,
            views_formatted: formattedViews
        };
    });

    return {
        results: formattedVideos,
        continuationToken
    };
}

/**
 * Format the playlists that were found
 *
 * @param playlists The playlists that were found
 * @param continuationToken The continuationtoken for the search
 * @returns Formatted playlists that were found for the query
 */
function formatSearchPlaylists (playlists: PlaylistCompact[], continuationToken: string | null = null): SearchResults['playlists'] {
    const formattedPlaylists = playlists.map(playlist => {
        return {
            playlist_id: playlist.id,
            title: playlist.title,
            thumbnail: playlist.thumbnails[playlist.thumbnails.length - 1].url
        };
    });

    return {
        results: formattedPlaylists,
        continuationToken
    };
}

/**
 * Get all the videos that are in the playlist
 *
 * @param playlistId The playlist id to search for
 * @param durationLimitS The limit of a video (in seconds), set to -1 for admins to disable this. By default this is set to the max_video_duration in the config
 * @returns An array of videos
 */
export async function getVideosInPlaylist (playlistId: string, durationLimitS: number = c.general.max_video_duration): Promise<SearchedVideo[]> {
    const playlist = await youtube.getPlaylist(playlistId);

    if (playlist === undefined || playlist.videoCount === 0) return [];

    let videos: VideoCompact[] = [];

    if (playlist.videos instanceof PlaylistVideos) {
        await playlist.videos.next(0);
        videos = playlist.videos.items;
    } else {
        videos = playlist.videos;
    }

    return formatSearchVideos(videos, durationLimitS).results;
};

/**
 * Format the views of a video
 *
 * @param views The views of a video
 * @returns Formatted views (100M, 1.5k, etc)
 */
export function formatViews (views: number): string {
    if (views > 999 && views < 1000000) {
        return (views / 1000).toFixed(1) + 'k';
    } else if (views > 1000000 && views < 1000000000) {
        return (views / 1000000).toFixed(1) + 'M';
    } else if (views > 1000000000) {
        return (views / 1000000000).toFixed(1) + 'B';
    }
    return views.toString();
}
