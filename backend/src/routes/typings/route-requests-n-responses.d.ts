declare namespace http {
export type searchYoutube = {
    /** The videos found for a given query */
    results: {
        /** The id of the video */
        video_id: string;
        /** The title of the video */
        title: string;
        /** The duration of the video in seconds */
        duration_s: number;
        /** The duration of the video formatted in hh:mm:ss */
        duration_formatted: string;
        /** The thumbnail of the video */
        thumbnail: string;
        /** The upload date of the video formatted in YYYY-MM-DD */
        uploadDate: string;
        /** The amount of views the video has */
        views: number;
        /** The amount of views the video has formatted (e.g. 1.2M) */
        views_formatted: string;
        /** Whether the video is live or not */
        live?: boolean;
    }[];
    /** The continuation token to resume previous searches */
    continuationToken: string | null;
};
declare namespace searchYoutube { 
export type request = {
    /** The title of the video */
    search: string;
    videoContinuationToken?: string | undefined;
};
}
export type addVideoToQueue = (void | undefined) | string;
declare namespace addVideoToQueue { 
export type request = {
    /** The id of the video */
    videoId: string;
};
}
export type user = {
    /** The id of the user */
    id: number;
    /** The name of the user */
    name: string;
    /** Whether the user is an admin or not */
    admin: boolean;
};
declare namespace admin {
export type admin = {
    incr: number;
};
declare namespace prefix {
export type admin = {
    incr: number;
};
}
}
}
declare namespace guest {
export type logincallback = null;
export type user = {
    /** The id of the user */
    id: number;
    /** The name of the user */
    name: string;
    /** Whether the user is an admin or not */
    admin: boolean;
};
}
