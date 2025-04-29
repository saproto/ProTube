import z from 'zod';
import VideoSchema from './VideoSchema.js';

export default z.object({
    playlist_id: z.string({
        description: 'The id of the playlist'
    }),
    title: z.string({
        description: 'The title of the playlist'
    }),
    thumbnail: z.string({
        description: 'The thumbnail of the playlist'
    }).url(),
    videos: z.optional(
        z.array(
            VideoSchema,
            {
                description: 'The videos in the playlist'
            }
        )
    )
});
