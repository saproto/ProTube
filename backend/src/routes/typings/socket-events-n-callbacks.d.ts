declare namespace socket.devsocket {
declare namespace testRoute { 
export type callback = {
    name: string;
};
}
export type queueUpdate = {
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
    /** The username of the person that added the video */
    username: string;
    /** The user id of the person that added this video to the queue */
    user_id: number;
    /** The queue of the video */
    queue: string;
}[];
}
declare namespace socket.nsp1 {
export type testRoute2 = {
    name: string;
};
declare namespace testRoute2 { 
export type callback = boolean;
}
export type soemEmit = never;
}

