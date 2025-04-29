import z from 'zod';
import VideoSchema from './VideoSchema.js';

export default z.object({
    results: z.array(
        VideoSchema,
        {
            description: 'The videos found for a given query'
        }),
    continuationToken: z.string({
        description: 'The continuation token to resume previous searches'
    }).nullable()
});
