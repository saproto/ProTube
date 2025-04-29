import z from 'zod';
import VideoSchema from './SearchVideos/VideoSchema.js';

export default VideoSchema.extend({
    username: z.string({
        description: 'The username of the person that added the video'
    }),
    user_id: z.number({
        description: 'The user id of the person that added this video to the queue'
    }),
    queue: z.string({
        description: 'The queue of the video'
    })
});
