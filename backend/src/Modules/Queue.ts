import { TypedEventEmitter } from '#Kernel/Services/EventEmitter.js';
import moment from 'moment';
import { type SearchedVideo } from '#Services/YouTubeSearchService.js';
import c from '#Config.js';

export interface Video extends SearchedVideo {
    user_id: number
    queue: string
};

interface QueueEvents {
    'queue-updated': [Video[]]
}

// ToDo: Add Redis to this queue
export class Queue extends TypedEventEmitter<QueueEvents> {
    /**
     * The actual queue
     */
    private queue: Video[] = [];

    /**
     * The video that was removed from the queue by playNext()
     * (so is currently playing) like the queue[-1], used for sorting the queue
     */
    private recentlyPlayed: Video | null = null;

    constructor (
        public readonly name: string
    ) {
        super();
    }

    /**
     * Add a video to the queue
     *
     * @param searchedVideo The video to add to the queue
     * @param userId For which user we want to add it
     * @param isAdmin Is this user an admin? (for the duration limit)
     */
    public add (searchedVideo: SearchedVideo, userId: number, isAdmin = false): void {
        // Inject userId
        const video = this.injectQueueNameAndUserId(searchedVideo, userId);

        if (this.findDoppelganger(video)) throw new Error('Video already in queue!');
        if (this.videoIsTooLong(video, isAdmin)) throw new Error('Video too long!');

        this.queue.push(video);
        this.queueUpdated();
    }

    /**
     * Add multiple videos to the queue
     *
     * @param searchedVideos The videos to add to the queue
     * @param userId For which user we want to add it
     * @param isAdmin Is this user an admin? (for the duration limit)
     */
    public addMany (searchedVideos: SearchedVideo[], userId: number, isAdmin = false): void {
        let partiallyAdded = false;

        for (const searchedVideo of searchedVideos) {
            // Inject userId
            const video = this.injectQueueNameAndUserId(searchedVideo, userId);

            // Don't allow duplicate videos or videos that are too long
            if (this.findDoppelganger(video) || this.videoIsTooLong(video, isAdmin)) {
                partiallyAdded = true;
                continue;
            }

            this.queue.push(video);
        }

        this.queueUpdated();

        if (partiallyAdded) throw new Error('Some videos were already in the queue!');
    }

    /**
     * Add a video to the top of the queue
     *
     * @param searchedVideo The video to add to the queue
     * @param userId For which user we want to add it
     */
    public addToTop (inputVideo: SearchedVideo | Video, userId: number): void {
        let video: Video;

        if ('user_id' in inputVideo) {
            video = inputVideo;
        } else {
            // Inject the user_id
            video = this.injectQueueNameAndUserId(inputVideo, userId);
        }

        this.queue.unshift(video);
        this.queueUpdated();
    }

    /**
     * Clear the queue
     */
    public clear (): void {
        if (this.isEmpty()) return;

        this.queue = [];
        this.queueUpdated();
    }

    /**
     * Get the current queue
     *
     * @returns The current queue
     */
    public getQueue (): Video[] {
        return this.queue;
    }

    /**
     * Go to the next video in the queue
     *
     * @returns The video that is next in line to be played
     */
    public playNext (): Video | null {
        const video = this.queue.shift() ?? null;
        if (video !== null) {
            this.queueUpdated();
        }

        this.recentlyPlayed = video;

        return video;
    }

    /**
     * Get the next video in the queue without shifting it yet
     *
     * @returns The video that is next in line to be played
     */
    public getNext (): Video | null {
        return this.queue[0] ?? null;
    }

    /**
     * Remove a set of videos from the queue by video_id
     *
     * @param ids An array of video_ids which to be removed from the queue
     * @param userId The user that is deleting these videos
     * @param isAdmin Is this user an admin (can delete all videos)
     * @returns The amount of videos that were deleted
     */
    public removeVideosById (ids: string[], userId: number, isAdmin = false): number {
        let deletedVideoCount = 0;

        const newQueue = this.queue.filter((video) => {
            // We don't see the id of this video in our list, keep it
            if (!ids.includes(video.video_id)) return true;

            // This video is in our list, but we're not allowed to remove it
            if (!isAdmin && userId !== video.user_id) {
                throw new Error('Illegal removal of video!');
            }
            deletedVideoCount++;

            // delete this video
            return false;
        });

        this.queue = newQueue;

        if (deletedVideoCount > 0) {
            this.queueUpdated();
        }

        return deletedVideoCount;
    }

    /**
     * Get the queue duration (S)
     *
     * @returns The current queue duration in seconds
     */
    public getTotalDurationS (): number {
        return this.queue.reduce((total, video) => total + video.duration_s, 0);
    }

    /**
     * Get the queue duration (formatted HH:mm:ss)
     *
     * @returns The current queue duration in HH:mm:ss
     */
    public getTotalDurationFormatted (): string {
        const totalDurationS = this.getTotalDurationS();

        return moment.utc(
            moment.duration(totalDurationS, 'seconds')
                .asMilliseconds()
        ).format('HH:mm:ss');
    }

    /**
     * Is the queue empty?
     *
     * @returns Whether the queue is empty or not
     */
    public isEmpty (): boolean {
        return this.queue.length === 0;
    }

    /**
     * The queue was changed somehow, resort it and update the listeners
     */
    private queueUpdated (): void {
        this.sortQueue();
        this.emit('queue-updated', this.queue);
    }

    /**
     * Sort the queue Round-Robin style
     * Takes into account the currently playing video (this.recentlyplayed)
     */
    private sortQueue (): void {
        // duplicate the queue
        const oldQueue = [...this.queue];

        if (oldQueue.length === 0) return;

        // insert the last removed video at the start of the queue (if not null)
        if (this.recentlyPlayed !== null) {
            oldQueue.unshift(this.recentlyPlayed);
        }

        // get all ids in the queue on which to order
        const allIds = new Set(oldQueue.map((video) => video.user_id));
        let videosPerUser: Video[][] = [];
        // create a 2d array for all videos per user [[videos of user a], [videos of user b]]
        allIds.forEach((userId) => {
            videosPerUser.push(
                oldQueue.filter((video) => {
                    return video.user_id === userId;
                })
            );
        });

        const newQueue: Video[] = [];
        const maxVideos = videosPerUser.slice().sort((a, b) => {
            return b.length - a.length;
        })[0].length;
        let userCount = allIds.size;

        // round robin style of adding to the new queue
        // we loop x times for the longest 2d array and loop in that the amount of users that still need to
        // be added to the new queue
        for (let i = 0; i < maxVideos; i++) {
            let noMoreVideosForUser = false;

            // loop over all users and keep adding until this user has no more videos
            for (let j = 0; j < userCount; j++) {
                const videoToAdd = videosPerUser[j].shift();
                if (videoToAdd === undefined) {
                    noMoreVideosForUser = true;
                    continue;
                }

                newQueue.push(videoToAdd);
            }
            // if a user has run out of videos we can reduce the next loop size
            if (noMoreVideosForUser) {
                videosPerUser = videosPerUser.filter((video) => {
                    if (video.length === 0) userCount--;
                    return video.length;
                });
            }
        }

        // The currentvideo wasn't empty and was added for the sorting algorithm. Remove it again
        if (this.recentlyPlayed !== null) {
            newQueue.shift();
        }

        this.queue = newQueue;
    }

    /**
     * Check if the video is already in the queue
     *
     * @param video The video to check
     * @returns Whether the video is already in the queue
     */
    private findDoppelganger (video: Video): boolean {
        return this.queue.some(queueVideo => queueVideo.video_id === video.video_id);
    }

    /**
     * Check if the video is too long
     *
     * @param video The video to check
     * @param isAdmin Whether the user is an admin (duration is ignored)
     * @returns Whether the video is too long
     */
    private videoIsTooLong (video: Video, isAdmin = false): boolean {
        if (video.duration_s > c.general.max_video_duration && !isAdmin) {
            return true;
        }
        return false;
    }

    private injectQueueNameAndUserId (video: SearchedVideo, userId: number): Video {
        return { ...video, user_id: userId, queue: this.name };
    }
}
