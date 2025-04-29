import { Client, SearchResult, type PlaylistCompact, VideoCompact, PlaylistVideos } from 'youtubei';
import moment from 'moment';
import c from '#Config.js';
import type SearchVideosSchema from '#App/Schemas/SearchVideos/SearchVideosSchema.js';
import type SearchPlaylistsSchema from '#App/Schemas/SearchVideos/SearchPlaylistsSchema.js';

const youtube = new Client();

type SearchedVideos = Zod.infer<typeof SearchVideosSchema>;
type SearchedPlaylists = Zod.infer<typeof SearchPlaylistsSchema>;

/**
 * Search the YouTube api for videos!
 *
 * @param query The search query where to search for
 * @param isAdmin Whether we're searching for an admin or not (a duration limit basically)
 * @returns The found playlists + videos
 */
export async function searchYtVideos (query: string, isAdmin: boolean = false): Promise<SearchedVideos> {
    const durationLimitS: number = isAdmin ? -1 : c.general.max_video_duration;

    return await searchVideos(query, durationLimitS);
}

// export async function searchYtPlaylists (query: string, isAdmin: boolean = false): Promise<SearchedVideos> {
//     const durationLimitS: number = isAdmin ? -1 : c.general.max_video_duration;

//     return await searchPlaylists(query, durationLimitS);
// }

export async function searchVideoById (videoId: string, isAdmin: boolean = false): Promise<SearchedVideos['results']> {
    const durationLimitS: number = isAdmin ? -1 : c.general.max_video_duration;

    const video = await youtube.findOne(videoId);

    // if (video === undefined) return [];
    if (!(video instanceof VideoCompact)) return [];

    return formatSearchVideos([video], durationLimitS).results;
};

/**
 * Do an initial search for videos on youtube for a given string
 *
 * @param query The search query
 * @param durationLimitS The limit of a video (in seconds), set to -1 for admins to disable this. By default this is set to the max_video_duration in the config
 * @returns Formatted videos that were found for the query
 */
async function searchVideos (query: string, durationLimitS: number): Promise<SearchedVideos> {
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
async function searchPlaylists (query: string): Promise<SearchedPlaylists> {
    const playlists = await youtube.search(query, {
        type: 'playlist'
    });

    return formatSearchPlaylists(playlists.items, playlists.continuation);
}

// /**
//  * Search the next page of a previous result based on a continuationtoken
//  *
//  * @param playListContinuationToken The continuationtoken for a playlist search
//  * @param videoContinuationToken The continuationtoken for a video search
//  * @param durationLimitS The limit of a video (in seconds), set to -1 for admins to disable this. By default this is set to the max_video_duration in the config
//  * @returns
//  */
// export async function searchNextPage (playListContinuationToken: string | null, videoContinuationToken: string | null, durationLimitS: number = c.general.max_video_duration): Promise<SearchResults> {
//     return {
//         videos: await searchNextPageVideos(playListContinuationToken, durationLimitS),
//         playlists: await searchNextPagePlayLists(videoContinuationToken)
//     };
// }

/**
 * Search the next page of a previous result based on a continuationtoken
 *
 * @param continuationToken The continuationtoken for a video search
 * @param durationLimitS The limit of a video (in seconds), set to -1 for admins to disable this. By default this is set to the max_video_duration in the config
 * @returns Formatted videos that were found for the query
 */
export async function searchNextPageVideos (continuationToken: string | null = null, durationLimitS: number = c.general.max_video_duration): Promise<SearchedVideos> {
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
export async function searchNextPagePlayLists (continuationToken: string | null = null): Promise<SearchedPlaylists> {
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
function formatSearchVideos (videos: VideoCompact[], durationLimitS: number, continuationToken: string | null = null): SearchedVideos {
    // Filter out videos that are too long (-1 for admins to disable this)
    if (durationLimitS > 0) {
        videos = videos.filter(video => (video.duration ?? 43200) < durationLimitS);
    }

    const formattedVideos = videos.map(video => {
        const duration = video.duration ?? 43200; // live videos don't have a duration
        const durationFormatted = moment.utc(
            moment.duration(duration, 'seconds')
                .as('milliseconds')
        ).format('HH:mm:ss');

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
            views_formatted: formattedViews,
            live: video.isLive
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
function formatSearchPlaylists (playlists: PlaylistCompact[], continuationToken: string | null = null): SearchedPlaylists {
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
 * @param isAdmin Whether we're searching for an admin or not (a duration limit basically)
 * @returns An array of videos
 */
export async function getVideosInPlaylist (playlistId: string, isAdmin: boolean = false): Promise<SearchedVideos['results']> {
    const playlist = await youtube.getPlaylist(playlistId);

    if (playlist === undefined || playlist.videoCount === 0) return [];

    let videos: VideoCompact[] = [];

    if (playlist.videos instanceof PlaylistVideos) {
        await playlist.videos.next(0);
        videos = playlist.videos.items;
    } else {
        videos = playlist.videos;
    }

    const durationLimitS: number = isAdmin ? -1 : c.general.max_video_duration;

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
