import SearchVideosSchema from '#App/Schemas/SearchVideos/SearchVideosSchema.js';
import { webRoute } from '#Kernel/Routes/Web/Registrar.js';
import { queue } from '#Services/PlaybackService.js';
import { searchVideoById, searchYtVideos } from '#Services/YouTubeSearchService.js';
import z from 'zod';

export const searchYouTubeVideos = webRoute({
    requestSchema: z.object({
        search: z.string({
            description: 'The title of the video'
        }).max(100),
        videoContinuationToken: z.optional(z.string({
            description: 'The continuation token to resume previous searches'
        }).max(100))
    }),
    schema: SearchVideosSchema,
    handler: async (request, reply) => {
        const videos = await searchYtVideos(request.query.search, request.user.isAdmin);
        await reply.send(videos);
    }
});

export const addVideoToQueue = webRoute({
    bodySchema: z.object({
        videoId: z.string({
            description: 'The id of the video'
        }).max(100)
    }),
    schema: z.void().or(z.string({})),
    handler: async (request, reply) => {
        const videoId = request.body.videoId;

        const videos = await searchVideoById(videoId, request.user.isAdmin);

        if (videos.length === 0) {
            await reply.status(404);
            return await reply.send('Video not found!');
        }

        queue.add(videos[0], request.user.id, request.user.name, request.user.isAdmin);

        await reply.send();
    }
});
