import z from 'zod';

export default z.object({
    video_id: z.string({
        description: 'The id of the video'
    }),
    title: z.string({
        description: 'The title of the video'
    }),
    duration_s: z.number({
        description: 'The duration of the video in seconds'
    }).min(0),
    duration_formatted: z.string({
        description: 'The duration of the video formatted in hh:mm:ss'
    }),
    thumbnail: z.string({
        description: 'The thumbnail of the video'
    }).url(),
    uploadDate: z.string({
        description: 'The upload date of the video formatted in YYYY-MM-DD'
    }),
    views: z.number({
        description: 'The amount of views the video has'
    }).min(0),
    views_formatted: z.string({
        description: 'The amount of views the video has formatted (e.g. 1.2M)'
    }),
    live: z.boolean({
        description: 'Whether the video is live or not'
    }).default(false)
});
