import { Queue, type Video } from '#Modules/Queue.js';
import c from '#Config.js';
import { faker } from '@faker-js/faker';
import { jest, describe, it, beforeEach, afterAll } from '@jest/globals';
import { PlaybackHandler, PlaybackMode, PlaybackState } from '#Modules/PlaybackHandler.js';
import { type SearchedVideo } from '#Services/YouTubeSearchService.js';

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

describe('PlaybackManager test', () => {
    const queue = new Queue('regular');
    const priorityQueue = new Queue('priority');

    const pm = new PlaybackHandler(queue, priorityQueue);

    const videoPausedEvent = jest.fn(() => { });
    const videoTimestampEvent = jest.fn(() => { });
    const videoChangedEvent = jest.fn(() => { });
    const radioStationChangedEvent = jest.fn(() => { });
    const stateChangedEvent = jest.fn(() => { });
    const modeChangedEvent = jest.fn(() => { });
    const volumeChangedEvent = jest.fn(() => { });

    function videoWithUserIdAndQueueName (video: SearchedVideo, userId: number, queue: Queue): Video {
        return { ...video, user_id: userId, queue: queue.name };
    }

    function attachEventListeners (): void {
        pm.on('video-paused', videoPausedEvent);
        pm.on('video-timestamp', videoTimestampEvent);
        pm.on('video-changed', videoChangedEvent);
        pm.on('radio-station-changed', radioStationChangedEvent);
        pm.on('state-changed', stateChangedEvent);
        pm.on('mode-changed', modeChangedEvent);
        pm.on('volume-change', volumeChangedEvent);
    }

    function expectEventCalls (events: {
        'video-paused': number
        'video-timestamp': number
        'video-changed': number
        'radio-station-changed': number
        'state-changed': number
        'mode-changed': number
        'volume-change': number
    }): void {
        expect(videoPausedEvent).toHaveBeenCalledTimes(events['video-paused']);
        expect(videoTimestampEvent).toHaveBeenCalledTimes(events['video-timestamp']);
        expect(videoChangedEvent).toHaveBeenCalledTimes(events['video-changed']);
        expect(radioStationChangedEvent).toHaveBeenCalledTimes(events['radio-station-changed']);
        expect(stateChangedEvent).toHaveBeenCalledTimes(events['state-changed']);
        expect(modeChangedEvent).toHaveBeenCalledTimes(events['mode-changed']);
        expect(volumeChangedEvent).toHaveBeenCalledTimes(events['volume-change']);
    }

    function resetListeners (): void {
        jest.resetAllMocks();
    }

    jest.useFakeTimers();

    beforeEach(() => {
        resetListeners();
    });

    afterAll(() => {
        pm.destroy();
    });

    beforeAll(() => {
        attachEventListeners();
    });

    it('should play a video once it is added to the queue', async () => {
        const video = createVideo('cool', 400);
        queue.add(video, 1);

        // adding a video, expecting a video-change event
        expectEventCalls({
            'video-paused': 0,
            'video-timestamp': 0,
            'video-changed': 1,
            'radio-station-changed': 0,
            'state-changed': 1, // Idle->Playing
            'mode-changed': 0,
            'volume-change': 0
        });

        expect(videoChangedEvent).toHaveBeenCalledWith(videoWithUserIdAndQueueName(video, 1, queue));
        expect(stateChangedEvent).toHaveBeenCalledWith(PlaybackState.PLAYING);
    });

    it('should go to idle once it has finished playing', async () => {
        jest.advanceTimersByTime(500 * 1000); // make sure the song has finished by now

        expectEventCalls({
            'video-paused': 0,
            'video-timestamp': 399, // 400 seconds, 399 updates (don't emit the last timestamp)
            'video-changed': 1,
            'radio-station-changed': 0,
            'state-changed': 1, // Playing->Idle
            'mode-changed': 0,
            'volume-change': 0
        });

        expect(videoTimestampEvent).toHaveBeenNthCalledWith(1, 1, 400, '00:06:39');
        expect(videoTimestampEvent).toHaveBeenNthCalledWith(44, 44, 400, '00:05:56');

        expect(videoChangedEvent).toHaveBeenCalledWith(null);
        expect(stateChangedEvent).toHaveBeenCalledWith(PlaybackState.IDLE);
    });

    it('should go to the next video once it has finished the first video', async () => {
        const video1 = createVideo('cool', 400);
        const video2 = createVideo('cool', 200);

        // note we can add the same video twice, as the first one
        // will already be playing once the second is added
        queue.add(video1, 1);
        queue.add(video2, 1);

        jest.advanceTimersByTime(700 * 1000); // finish the first video

        expectEventCalls({
            'video-paused': 0,
            'video-timestamp': 598, // 2 less because we don't emit the last timestamp
            'video-changed': 3,
            'radio-station-changed': 0,
            'state-changed': 2, // Idle->Playing->Idle
            'mode-changed': 0,
            'volume-change': 0
        });

        // video 1 playing -> video 2 playing -> null
        expect(videoChangedEvent).toHaveBeenNthCalledWith(1, videoWithUserIdAndQueueName(video1, 1, queue));
        expect(videoChangedEvent).toHaveBeenNthCalledWith(2, videoWithUserIdAndQueueName(video2, 1, queue));
        expect(videoChangedEvent).toHaveBeenNthCalledWith(3, null);

        // idle -> playing -> idle
        expect(stateChangedEvent).toHaveBeenNthCalledWith(1, PlaybackState.PLAYING);
        expect(stateChangedEvent).toHaveBeenNthCalledWith(2, PlaybackState.IDLE);
    });

    it('should play the priority queue asap', async () => {
        const video1 = createVideo('cool', 400);
        const video2 = createVideo('cool', 200);
        const priorityVideo = createVideo('cool', 200);

        queue.add(video1, 1);
        queue.add(video2, 1);
        priorityQueue.add(priorityVideo, 1);

        jest.advanceTimersByTime(700 * 1000); // finish the first video

        expectEventCalls({
            'video-paused': 0,
            'video-timestamp': 698, // 2 less because we don't emit the last second;
            'video-changed': 3,
            'radio-station-changed': 0,
            'state-changed': 1, // Idle->Playing
            'mode-changed': 0,
            'volume-change': 0
        });

        // video 1 playing -> priorityvideo playing -> video 2 playing
        expect(videoChangedEvent).toHaveBeenNthCalledWith(1, videoWithUserIdAndQueueName(video1, 1, queue));
        expect(videoChangedEvent).toHaveBeenNthCalledWith(2, videoWithUserIdAndQueueName(priorityVideo, 1, priorityQueue));
        expect(videoChangedEvent).toHaveBeenNthCalledWith(3, videoWithUserIdAndQueueName(video2, 1, queue));

        // idle -> playing
        expect(stateChangedEvent).toHaveBeenNthCalledWith(1, PlaybackState.PLAYING);

        jest.advanceTimersByTime(120 * 1000); // play for 100 seconds to finish the test
    });

    it('should be able to pause a video and resume', async () => {
        const video1 = createVideo('cool', 200);
        const video2 = createVideo('cool', 100);

        queue.add(video1, 1);
        queue.add(video2, 1);

        jest.advanceTimersByTime(120 * 1000); // partially play the first video

        pm.playPauseVideo();

        expectEventCalls({
            'video-paused': 1,
            'video-timestamp': 120,
            'video-changed': 1,
            'radio-station-changed': 0,
            'state-changed': 2, // Idle->playing->paused
            'mode-changed': 0,
            'volume-change': 0
        });

        // video 1 playing
        expect(videoChangedEvent).toHaveBeenNthCalledWith(1, videoWithUserIdAndQueueName(video1, 1, queue));
        // expect(videoChangedEvent).toHaveBeenNthCalledWith(3, videoWithUserIdAndQueueName(video2, 1, queue));

        // idle -> playing
        expect(stateChangedEvent).toHaveBeenNthCalledWith(1, PlaybackState.PLAYING);
        expect(stateChangedEvent).toHaveBeenNthCalledWith(2, PlaybackState.PAUSED);

        resetListeners();

        jest.advanceTimersByTime(10 * 1000); // some advancement should not change anything

        expectEventCalls({
            'video-paused': 0,
            'video-timestamp': 0,
            'video-changed': 0,
            'radio-station-changed': 0,
            'state-changed': 0,
            'mode-changed': 0,
            'volume-change': 0
        });

        pm.playPauseVideo();

        jest.advanceTimersByTime(90 * 1000); // we should be 10 seconds into the second video now

        expectEventCalls({
            'video-paused': 0,
            'video-timestamp': 89, // 80 remaining from the first video + 9 from the second
            'video-changed': 1,
            'radio-station-changed': 0,
            'state-changed': 1, // paused->playing
            'mode-changed': 0,
            'volume-change': 0
        });

        // video 2 playing
        expect(videoChangedEvent).toHaveBeenCalledWith(videoWithUserIdAndQueueName(video2, 1, queue));
        expect(stateChangedEvent).toHaveBeenCalledWith(PlaybackState.PLAYING);

        jest.advanceTimersByTime(100 * 1000); // finish the second video
    });

    it('should be able to go to radio mode and go back playing', async () => {
        const video1 = createVideo('cool', 200);

        queue.add(video1, 1);
        priorityQueue.add(video1, 2);

        jest.advanceTimersByTime(20 * 1000); // play for 20 seconds

        pm.toggleQueueRadioMode(); // go to radio mode

        expectEventCalls({
            'video-paused': 1,
            'video-timestamp': 20,
            'video-changed': 1,
            'radio-station-changed': 1,
            'state-changed': 1, // Idle->Playing
            'mode-changed': 1, // Queue->Radio
            'volume-change': 0
        });

        expect(videoChangedEvent).toHaveBeenCalledWith(videoWithUserIdAndQueueName(video1, 1, queue));
        expect(radioStationChangedEvent).toHaveBeenCalledWith('123'); // the default radio station
        expect(stateChangedEvent).toHaveBeenCalledWith(PlaybackState.PLAYING);
        expect(modeChangedEvent).toHaveBeenCalledWith(PlaybackMode.RADIO);

        // now go back to playing
        resetListeners();

        pm.toggleQueueRadioMode();

        expectEventCalls({
            'video-paused': 0,
            'video-timestamp': 0,
            'video-changed': 0,
            'radio-station-changed': 0,
            'state-changed': 0,
            'mode-changed': 1, // Radio->Queue
            'volume-change': 0
        });

        expect(modeChangedEvent).toHaveBeenCalledWith(PlaybackMode.QUEUE);

        resetListeners();

        // finish the first video
        jest.advanceTimersByTime(180 * 1000);

        expectEventCalls({
            'video-paused': 0,
            'video-timestamp': 179,
            'video-changed': 1,
            'radio-station-changed': 0,
            'state-changed': 0,
            'mode-changed': 0,
            'volume-change': 0
        });

        expect(videoChangedEvent).toHaveBeenCalledWith(videoWithUserIdAndQueueName(video1, 2, priorityQueue));

        // finish the priority queue's video
        jest.advanceTimersByTime(210 * 1000);
    });

    it('should be able to set the volume', async () => {
        pm.setVolume(0);
        expect(pm.getVolume()).toBe(0);

        pm.setVolume(100);
        expect(pm.getVolume()).toBe(100);

        expect(() => {
            pm.setVolume(-1);
        }).toThrow('Volume must be between 0 and 100!');

        expect(() => {
            pm.setVolume(101);
        }).toThrow('Volume must be between 0 and 100!');

        expectEventCalls({
            'video-paused': 0,
            'video-timestamp': 0,
            'video-changed': 0,
            'radio-station-changed': 0,
            'state-changed': 0,
            'mode-changed': 0,
            'volume-change': 2
        });

        expect(volumeChangedEvent).toHaveBeenNthCalledWith(1, 0);
        expect(volumeChangedEvent).toHaveBeenNthCalledWith(2, 100);
    });

    it('should be able to skip a video', async () => {
        // we're in queue mode, can't skip on an empty queue
        expect(() => {
            pm.skipVideo();
        }).toThrow('No next video to play!');

        // empty queue, nothing should happen
        expectEventCalls({
            'video-paused': 0,
            'video-timestamp': 0,
            'video-changed': 0,
            'radio-station-changed': 0,
            'state-changed': 0,
            'mode-changed': 0,
            'volume-change': 0
        });

        // add 2 videos to the queue and try skipping them both
        const video1 = createVideo('cool', 200);
        const video2 = createVideo('cool', 100);

        queue.add(video1, 1);
        queue.add(video2, 1);

        resetListeners();

        pm.skipVideo();

        expectEventCalls({
            'video-paused': 0,
            'video-timestamp': 0,
            'video-changed': 1, // video 1 -> video 2
            'radio-station-changed': 0,
            'state-changed': 0,
            'mode-changed': 0,
            'volume-change': 0
        });

        expect(videoChangedEvent).toHaveBeenCalledWith(videoWithUserIdAndQueueName(video2, 1, queue));

        // skip again
        resetListeners();

        expect(() => {
            pm.skipVideo();
        }).toThrow('No next video to play!');

        // empty queue, nothing should happen
        expectEventCalls({
            'video-paused': 0,
            'video-timestamp': 0,
            'video-changed': 1, // video 2 -> null
            'radio-station-changed': 0,
            'state-changed': 1, // playing -> idle
            'mode-changed': 0,
            'volume-change': 0
        });

        expect(videoChangedEvent).toHaveBeenCalledWith(null);
        expect(stateChangedEvent).toHaveBeenCalledWith(PlaybackState.IDLE);
    });

    it('should be able to skip a paused video', async () => {
        // add 2 videos to the queue and try skipping them both
        const video1 = createVideo('cool', 200);
        const video2 = createVideo('cool', 100);

        queue.add(video1, 1);
        queue.add(video2, 1);

        // play for 20 seconds and then pause the video
        jest.advanceTimersByTime(20 * 100);

        pm.playPauseVideo();

        resetListeners();

        pm.skipVideo();

        expectEventCalls({
            'video-paused': 0,
            'video-timestamp': 0,
            'video-changed': 1, // video 1 -> video 2
            'radio-station-changed': 0,
            'state-changed': 1, // paused -> playing
            'mode-changed': 0,
            'volume-change': 0
        });

        expect(videoChangedEvent).toHaveBeenCalledWith(videoWithUserIdAndQueueName(video2, 1, queue));
        expect(stateChangedEvent).toHaveBeenCalledWith(PlaybackState.PLAYING);

        // skip again
        try {
            pm.skipVideo();
        } catch (error) {}
    });

    it('should be able to skip a from the radio without changing to the queue', async () => {
        pm.playRadioStation('123');

        resetListeners();

        // add 2 videos to the queue and try skipping them both
        const video1 = createVideo('cool', 200);
        const video2 = createVideo('cool2', 100);

        queue.add(video1, 1);
        queue.add(video2, 1);

        // play for 20, expect nothing to change
        jest.advanceTimersByTime(20 * 100);

        pm.skipVideo();
        pm.skipVideo();

        // still no change, still at radio (only in the queue)
        expectEventCalls({
            'video-paused': 0,
            'video-timestamp': 0,
            'video-changed': 0,
            'radio-station-changed': 0,
            'state-changed': 0,
            'mode-changed': 0,
            'volume-change': 0
        });

        pm.toggleQueueRadioMode();
    });

    it('should not be able to pause the video if the queue is empty', async () => {
        expect(() => {
            pm.playPauseVideo();
        }).toThrow('The queue is empty, can\'t play or pause anything!');

        // still no change, still at radio (only in the queue)
        expectEventCalls({
            'video-paused': 0,
            'video-timestamp': 0,
            'video-changed': 0,
            'radio-station-changed': 0,
            'state-changed': 0,
            'mode-changed': 0,
            'volume-change': 0
        });
    });

    it('should go back to queue mode if playpause is being pressed', async () => {
        pm.playRadioStation('123');

        resetListeners();

        pm.playPauseVideo();

        expectEventCalls({
            'video-paused': 0,
            'video-timestamp': 0,
            'video-changed': 0,
            'radio-station-changed': 0,
            'state-changed': 0,
            'mode-changed': 1, // radio -> queue
            'volume-change': 0
        });

        expect(modeChangedEvent).toHaveBeenCalledWith(PlaybackMode.QUEUE);
    });
});
