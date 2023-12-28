import { TypedEventEmitter } from '#Kernel/Services/EventEmitter.js';
import moment from 'moment';
import { type SearchedVideo } from '#Services/YouTubeSearchService.js';
import c from '#Config.js';

export interface Video extends SearchedVideo {
    user_id: number
};

interface QueueEvents {
    'queue-updated': [Video[]]
}

export class Queue extends TypedEventEmitter<QueueEvents> {
    private queue: Video[] = [];
    private recentlyRemoved: Video | null = null;

    constructor () {
        super();
        this.queue = [];
    }

    public add (searchedVideo: SearchedVideo, userId: number, isAdmin = false): void {
        // Inject userId
        const video: Video = { ...searchedVideo, user_id: userId };

        if (this.findDoppelganger(video)) throw new Error('Video already in queue!');
        if (this.videoIsTooLong(video, isAdmin)) throw new Error('Video too long!');

        this.queue.push(video);
        this.queueUpdated();
    }

    public addMany (searchedVideos: SearchedVideo[], userId: number, isAdmin = false): void {
        let partiallyAdded = false;

        for (const searchedVideo of searchedVideos) {
            // Inject userId
            const video: Video = { ...searchedVideo, user_id: userId };

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

    public addToTop (searchedVideo: SearchedVideo, userId: number): void {
        // Inject userId
        const video: Video = { ...searchedVideo, user_id: userId };

        this.queue.unshift(video);
        this.queueUpdated();
    }

    public clear (): void {
        this.queue = [];
        this.queueUpdated();
    }

    public playNext (): Video | null {
        const video = this.queue.shift() ?? null;
        if (video !== null) {
            this.queueUpdated();
        }

        this.recentlyRemoved = video;

        return video;
    }

    public removeVideoById (id: string, userId: number, isAdmin = false): void {
        this.queue = this.queue.filter((video) => {
            // video can only be removed if the id matches and the user is an admin or the user is the one who added the video
            if (video.video_id === id && (isAdmin || video.user_id === userId)) {
                return false;
            }
            return true;
        });
    }

    public getTotalDurationS (): number {
        return this.queue.reduce((total, video) => total + video.duration_s, 0);
    }

    public getTotalDurationFormatted (): string {
        const totalDurationS = this.getTotalDurationS();

        return moment.utc(
            moment.duration(totalDurationS, 'seconds')
                .asMilliseconds()
        ).format('HH:mm:ss');
    }

    public isEmpty (): boolean {
        return this.queue.length === 0;
    }

    private queueUpdated (): void {
        this.sortQueue();
        this.emit('queue-updated', this.queue);
    }

    private sortQueue (): void {
        // duplicate the queue
        const oldQueue = [...this.queue];

        if (oldQueue.length === 0) return;

        // insert the last removed video at the start of the queue (if not null)
        if (this.recentlyRemoved !== null) {
            oldQueue.unshift(this.recentlyRemoved);
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
        if (this.recentlyRemoved !== null) {
            newQueue.shift();
        }

        this.queue = newQueue;
    }

    private findDoppelganger (video: Video): boolean {
        return this.queue.some(queueVideo => queueVideo.video_id === video.video_id);
    }

    private videoIsTooLong (video: Video, isAdmin = false): boolean {
        if (video.duration_s > c.general.max_video_duration && !isAdmin) {
            return true;
        }
        return false;
    }
}
