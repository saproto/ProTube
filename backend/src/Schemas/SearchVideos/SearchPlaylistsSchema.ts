import z from 'zod';
import PlaylistSchema from './PlaylistSchema.js';

export default z.object({
    results: z.array(
        PlaylistSchema,
        {
            description: 'The playlists found for a given query'
        }
    ),
    continuationToken: z.string({
        description: 'The continuation token to resume previous searches'
    }).nullable()
});
