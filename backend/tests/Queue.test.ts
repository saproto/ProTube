import { Queue, type Video } from '#Services/Queue.js';
import { describe, it, jest } from '@jest/globals';
import { faker } from '@faker-js/faker';
import { type SearchedVideo } from '#Services/YouTubeSearchService.js';
import c from '#Config.js';

function createVideo (videoId: string | null = null, duration: number | null = null): SearchedVideo {
    return {
        video_id: videoId ?? faker.string.uuid(),
        title: faker.lorem.words({ min: 1, max: 4 }),
        duration_s: duration ?? faker.number.int({
            min: 10,
            max: c.general.max_video_duration
        }),
        duration_formatted: '00:01:40',
        thumbnail: faker.image.url(),
        uploadDate: '24-12-2020',
        views: faker.number.int({
            min: 100,
            max: 1000000
        }),
        views_formatted: '100k'
    };
}

function videoWithUserId (video: SearchedVideo, userId: number): Video {
    return { ...video, user_id: userId };
}

describe('Testing the queue class', () => {
    let queue = new Queue();
    const firstVideo = createVideo('testVideo');

    const queueUpdatedEvent = jest.fn(() => { });

    beforeEach(() => {
        queueUpdatedEvent.mockReset();
    });

    // We're adding a video to the queue and testing its basic events
    it('should add a video to the queue and emit updates', () => {
        queue.on('queue-updated', queueUpdatedEvent);
        queue.add(firstVideo, 1);

        expect(queueUpdatedEvent).toHaveBeenCalledWith([videoWithUserId(firstVideo, 1)]);
    });

    // We're trying to add duplicate videos to the queue
    it('should not be able to add the same video to the queue', () => {
        const sampleVideo = createVideo('testVideo');

        queue.on('queue-updated', queueUpdatedEvent);

        expect(() => {
            queue.add(sampleVideo, 2);
        }).toThrow('Video already in queue!');

        expect(queueUpdatedEvent).not.toHaveBeenCalled();
    });

    // We're trying to add a video that's too long and were not an admin
    it('should not be able to add videos that are too long', () => {
        const sampleVideo = createVideo('someVideo', c.general.max_video_duration + 10);

        queue.on('queue-updated', queueUpdatedEvent);

        expect(() => {
            queue.add(sampleVideo, 2);
        }).toThrow('Video too long!');

        expect(queueUpdatedEvent).not.toHaveBeenCalled();
    });

    // We're trying to add a video that's too long, but were admin
    it('should be able to add videos that are too long if we\'re admin', () => {
        const sampleVideo = createVideo('someVideo', c.general.max_video_duration + 10);

        queue.on('queue-updated', queueUpdatedEvent);
        queue.add(sampleVideo, 2, true);

        expect(queueUpdatedEvent).toHaveBeenCalledWith([videoWithUserId(firstVideo, 1), videoWithUserId(sampleVideo, 2)]);
    });

    // We're trying to clear the queue
    it('should be able to clear the queue', () => {
        queue.on('queue-updated', queueUpdatedEvent);

        queue.clear();

        expect(queueUpdatedEvent).toHaveBeenCalledWith([]);
        expect(queue.isEmpty()).toBe(true);

        queueUpdatedEvent.mockReset();

        // We're trying to clear an empty queue
        queue.clear();
        expect(queueUpdatedEvent).not.toHaveBeenCalled();
    });

    // We're trying to add a video to the top of the queue
    it('should be able to add a video to the top of the queue', () => {
        const videoOnTop = createVideo();

        queue.on('queue-updated', queueUpdatedEvent);
        queue.add(firstVideo, 1);
        queue.addToTop(videoOnTop, 2);

        expect(queueUpdatedEvent).toHaveBeenCalledWith([videoWithUserId(videoOnTop, 2), videoWithUserId(firstVideo, 1)]);
    });

    // we're going from 1 item in the queue to an empty queue
    it('should be able to go to the next item in the queue', () => {
        queue = new Queue();
        // reset the queue to 1 item
        queue.add(firstVideo, 1);

        queue.on('queue-updated', queueUpdatedEvent);

        expect(queue.playNext()).toEqual(videoWithUserId(firstVideo, 1));
        expect(queueUpdatedEvent).toHaveBeenCalledWith([]);
    });

    // we're trying to skip on an empty queue
    it('should return null if it can\'t go to the next video', () => {
        queue.on('queue-updated', queueUpdatedEvent);

        expect(queue.playNext()).toBeNull();
        expect(queueUpdatedEvent).not.toHaveBeenCalled();
    });

    // we're adding multiple videos to the queue
    it('should be able to add multiple (valid) videos to the queue', () => {
        const videos = [
            createVideo(),
            createVideo(),
            createVideo()
        ];

        // attach the user id to all videos
        const videosWithUserId = videos.map(video => videoWithUserId(video, 1));

        queue.on('queue-updated', queueUpdatedEvent);
        queue.addMany(videos, 1);

        expect(queueUpdatedEvent).toHaveBeenCalledWith(videosWithUserId);
    });

    // we're adding multiple videos to the queue
    it('should not be able to duplicate videos to the queue when adding many', () => {
        queue = new Queue();

        const videos = [
            createVideo('duplicate'),
            createVideo('duplicate'),
            createVideo()
        ];

        // attach the user id to all videos
        const videosWithUserId = videos.map(video => videoWithUserId(video, 1));
        // remove the first duplicate (the first one is added to the queue)
        videosWithUserId.splice(1, 1);

        queue.on('queue-updated', queueUpdatedEvent);

        expect(() => {
            queue.addMany(videos, 1);
        }).toThrow('Some videos were already in the queue!');

        expect(queueUpdatedEvent).toHaveBeenCalledWith(videosWithUserId);
    });

    // we're adding multiple videos to the queue
    it('should not be able to add videos that are too long to the queue when adding many', () => {
        queue = new Queue();

        const videos = [
            createVideo('notTooLong'),
            createVideo('tooLong', c.general.max_video_duration + 10),
            createVideo()
        ];

        // attach the user id to all videos
        const videosWithUserId = videos.map(video => videoWithUserId(video, 1));
        // remove the first duplicate (the first one is added to the queue)
        videosWithUserId.splice(1, 1);

        queue.on('queue-updated', queueUpdatedEvent);

        expect(() => {
            queue.addMany(videos, 1);
        }).toThrow('Some videos were already in the queue!');

        expect(queueUpdatedEvent).toHaveBeenCalledWith(videosWithUserId);
    });

    // we're adding multiple videos to the queue
    it('should be able to add videos that are too long to the queue when adding many if we\'re an admin', () => {
        queue = new Queue();

        const videos = [
            createVideo('notTooLong'),
            createVideo('tooLong', c.general.max_video_duration + 10),
            createVideo()
        ];

        // attach the user id to all videos
        const videosWithUserId = videos.map(video => videoWithUserId(video, 1));

        queue.on('queue-updated', queueUpdatedEvent);

        queue.addMany(videos, 1, true);

        expect(queueUpdatedEvent).toHaveBeenCalledWith(videosWithUserId);
    });

    it('should not be able to add duplicate videos to the queue when adding many if we\'re an admin', () => {
        queue = new Queue();

        const videos = [
            createVideo('duplicate'),
            createVideo('duplicate'),
            createVideo()
        ];

        // attach the user id to all videos
        const videosWithUserId = videos.map(video => videoWithUserId(video, 1));
        // remove the first duplicate (the first one is added to the queue)
        videosWithUserId.splice(1, 1);

        queue.on('queue-updated', queueUpdatedEvent);

        expect(() => {
            queue.addMany(videos, 1, true);
        }).toThrow('Some videos were already in the queue!');

        expect(queueUpdatedEvent).toHaveBeenCalledWith(videosWithUserId);
    });

    it('should show the correct duration of the queue', () => {
        queue = new Queue();

        const videos = [
            createVideo('1', 400),
            createVideo('2', 200),
            createVideo('3', 13)
        ];

        queue.add(videos[0], 1);
        queue.add(videos[1], 1);
        queue.add(videos[2], 1);

        expect(queue.getTotalDurationS()).toBe(613);
        expect(queue.getTotalDurationFormatted()).toBe('00:10:13');
    });

    it('should round-robin add items to the queue 1', () => {
        queue = new Queue();

        const videos = [
            createVideo(),
            createVideo(),
            createVideo()
        ];

        // attach the user id to all videos
        const videosWithUserId = [
            videoWithUserId(videos[0], 1),
            videoWithUserId(videos[1], 2),
            videoWithUserId(videos[2], 3)
        ];

        videos.forEach((video, index) => {
            queue.add(video, index + 1);
        });

        queue.on('queue-updated', queueUpdatedEvent);

        const newVideo = createVideo();
        queue.add(newVideo, 2);

        // expect the order to be 1,2,3,2 (round-robin)
        videosWithUserId.push(videoWithUserId(newVideo, 2));

        expect(queueUpdatedEvent).toHaveBeenCalledWith(videosWithUserId);
    });

    it('should round-robin add items to the queue 2', () => {
        queue = new Queue();

        const videos = [
            createVideo(),
            createVideo(),
            createVideo()
        ];

        queue.add(videos[0], 1);
        queue.add(videos[1], 2);
        queue.add(videos[2], 1);

        queue.on('queue-updated', queueUpdatedEvent);

        const newVideo = createVideo();
        queue.add(newVideo, 3);

        // expect the order to be 1,2,3,1 (round-robin)
        const videosWithUserId = [
            videoWithUserId(videos[0], 1),
            videoWithUserId(videos[1], 2),
            videoWithUserId(newVideo, 3),
            videoWithUserId(videos[2], 1)
        ];

        expect(queueUpdatedEvent).toHaveBeenCalledWith(videosWithUserId);
    });

    it('should round-robin add items to the queue 3', () => {
        queue = new Queue();

        const videos = [
            createVideo(),
            createVideo(),
            createVideo(),
            createVideo()
        ];

        queue.add(videos[0], 1);
        queue.add(videos[1], 2);
        queue.add(videos[2], 1);
        queue.add(videos[3], 1);

        queue.on('queue-updated', queueUpdatedEvent);

        const newVideo = createVideo();
        queue.add(newVideo, 3);

        // expect the order to be 1,2,3,1,1 (round-robin)
        const videosWithUserId = [
            videoWithUserId(videos[0], 1),
            videoWithUserId(videos[1], 2),
            videoWithUserId(newVideo, 3),
            videoWithUserId(videos[2], 1),
            videoWithUserId(videos[3], 1)
        ];

        expect(queueUpdatedEvent).toHaveBeenCalledWith(videosWithUserId);
    });

    it('should round-robin add items to the queue 4', () => {
        queue = new Queue();

        const videos = [
            createVideo(),
            createVideo(),
            createVideo(),
            createVideo()
        ];

        queue.add(videos[0], 1);
        queue.add(videos[1], 2);
        queue.add(videos[2], 1);
        queue.add(videos[3], 1);

        queue.on('queue-updated', queueUpdatedEvent);

        const newVideo = createVideo();
        queue.add(newVideo, 2);

        // expect the order to be 1,2,1,2,1 (round-robin)
        const videosWithUserId = [
            videoWithUserId(videos[0], 1),
            videoWithUserId(videos[1], 2),
            videoWithUserId(videos[2], 1),
            videoWithUserId(newVideo, 2),
            videoWithUserId(videos[3], 1)
        ];

        expect(queueUpdatedEvent).toHaveBeenCalledWith(videosWithUserId);
    });

    // Checking if the currently playing video is being taken into account when sorting
    it('should round-robin add items to the queue 5', () => {
        queue = new Queue();

        const videos = [
            createVideo(),
            createVideo()
        ];

        // currently playing: 1, queue: 1
        queue.add(videos[0], 1);
        queue.add(videos[1], 1);
        queue.playNext();

        queue.on('queue-updated', queueUpdatedEvent);

        const newVideo = createVideo();
        queue.add(newVideo, 2);

        // expect the order to be (1,)2,1 (round-robin)
        const videosWithUserId = [
            videoWithUserId(newVideo, 2),
            videoWithUserId(videos[1], 1)
        ];

        expect(queueUpdatedEvent).toHaveBeenCalledWith(videosWithUserId);
    });

    // Checking if the isEmpty functionaly works
    it('should show an empty queue', () => {
        queue = new Queue();

        expect(queue.isEmpty()).toBe(true);

        queue.add(createVideo(), 1);

        expect(queue.isEmpty()).toBe(false);

        queue.playNext();

        expect(queue.isEmpty()).toBe(true);
    });

    // Checking if we can remove a video
    it('should be able to remove videos', () => {
        queue = new Queue();
        const videos = [
            createVideo('video1'),
            createVideo('video2')
        ];

        // Both videos are from user 1
        queue.add(videos[0], 1);
        queue.add(videos[1], 1);

        queue.on('queue-updated', queueUpdatedEvent);

        // User 2 doesn't own this video, don't delete it
        expect(() => queue.removeVideosById(['video2'], 2))
            .toThrow('Illegal removal of video!');
        expect(queueUpdatedEvent).not.toHaveBeenCalled();

        // User 1 owns this video, delete it
        expect(queue.removeVideosById(['video2'], 1)).toBe(1);
        expect(queueUpdatedEvent).toHaveBeenCalledWith([videoWithUserId(videos[0], 1)]);

        queueUpdatedEvent.mockReset();

        // User 2, is an admin, therefore can delete user 1's video
        expect(queue.removeVideosById(['video1'], 2, true)).toBe(1);
        expect(queueUpdatedEvent).toHaveBeenCalledWith([]);

        expect(queue.isEmpty()).toBe(true);

        queueUpdatedEvent.mockReset();

        // We're trying to delete a video that's not in the queue
        expect(queue.removeVideosById(['video1'], 2)).toBe(0);
        expect(queueUpdatedEvent).not.toHaveBeenCalled();
    });
});
