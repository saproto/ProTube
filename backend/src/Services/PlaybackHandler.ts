import { TypedEventEmitter } from '#Kernel/Services/EventEmitter.js';
import { type Video, type Queue } from '#Services/Queue.js';
import moment from 'moment';

interface PlaybackHandlerEvents {
    'state-changed': [PlaybackState]
    'mode-changed': [PlaybackMode]
    'video-changed': [Video | null]
    'video-paused': []
    'volume-change': [volume: number]
    'radio-station-changed': [string]
    'video-timestamp': [currentVideoTimestamp: number, videoLength: number, formattedQueueDuration: string]
}

export enum PlaybackState {
    PLAYING = 'PLAYING',
    PAUSED = 'PAUSED',
    IDLE = 'IDLE'
}

export enum PlaybackMode {
    RADIO = 'RADIO',
    QUEUE = 'QUEUE'
}

export class PlaybackHandler extends TypedEventEmitter<PlaybackHandlerEvents> {
    private volume: number = 100;
    private state: PlaybackState = PlaybackState.IDLE;
    private mode: PlaybackMode = PlaybackMode.QUEUE;
    private playbackInterval: NodeJS.Timeout | null = null;
    private currentTimestamp: number = 0;
    private currentVideo: Video | null = null;
    private radioStation: string;

    constructor (
        private readonly queue: Queue,
        private readonly priorityQueue: Queue
    ) {
        super();

        this.queue.on('queue-updated', this.onQueueUpdated.bind(this));
        this.priorityQueue.on('queue-updated', (q) => { this.onQueueUpdated(q); });

        this.radioStation = '123';
    }

    /**
     * A change was made to the queue, trigged this function
     *
     * @param newQueue The new queue
     */
    private onQueueUpdated (newQueue: Video[]): void {
        // we're not in idle mode, or were already playing, no chanche that we can directly play the video
        if (this.state !== PlaybackState.IDLE) return;

        // try to play the next video
        try {
            this.playNextVideo();
        } catch (error) { }
    };

    /**
     * Used for the tests, to gracefully shutdown any running intervals
     */
    public destroy (): void {
        if (this.playbackInterval !== null) clearInterval(this.playbackInterval);
    }

    /**
     * The video next in line to be played
     *
     * @returns The video that should be played next
     */
    private getNextVideoInQueue (): Video | null {
        return this.priorityQueue.getNext() ?? this.queue.getNext();
    }

    /**
     * The next video that should be played, remove it from the queue
     *
     * @returns The video that was removed from the queue
     */
    private playNextVideoInQueue (): Video | null {
        return this.priorityQueue.playNext() ?? this.queue.playNext();
    }

    /**
     * Play the next video in the queue
     *
     * @throws If we're in radio mode or there is no video to play
     * @emits video-changed [Video] the next video to be played
     */
    public playNextVideo (): void {
        if (this.mode === PlaybackMode.RADIO) throw new Error('Cannot play next video in radio mode!');

        if (this.playbackInterval !== null) clearInterval(this.playbackInterval);

        // retrieve the next video in the queue
        const nextVideo = this.getNextVideoInQueue();
        this.currentVideo = nextVideo;

        // No video to play, set state to IDLE (if not already)
        if (nextVideo === null) {
            this.setState(PlaybackState.IDLE);
            throw new Error('No next video to play!');
        }

        this.setState(PlaybackState.PLAYING);

        // shift the next video in the queue
        this.playNextVideoInQueue();

        this.emit('video-changed', nextVideo);
        this.currentTimestamp = 0;

        this.playbackInterval = setInterval(() => {
            this.currentTimestamp++;
            this.updatePlayingVideo(nextVideo, this.currentTimestamp);
        }, 1000);
    }

    /**
     * Update the timestamp of the currently playing video
     * runs every second to update the timestamp
     *
     * @param video The video that is currently playing
     * @param currentTimestamp The current timestamp of the video
     *
     * @emits video-changed [Video|null] if we're done playing the queue
     * @emits video-timestamp [currentVideoTimestamp, videoLength, formattedQueueDuration] every second
     */
    private updatePlayingVideo (video: Video, currentTimestamp: number): void {
        // timestamp > video duration, stop and try to play next video
        if (currentTimestamp >= video.duration_s) {
            // used to satisfy typescript
            if (this.playbackInterval === null) {
                throw new Error('playbackInterval is null, but should not be!');
            }

            clearInterval(this.playbackInterval);
            this.currentTimestamp = 0;

            try {
                this.playNextVideo();
            } catch (error) {
                // we were just playing but cant go to the next = empty queue
                this.emit('video-changed', null);
            }
        } else { // timestamp < video duration, update timestamp
            // Calculate the total duration of the queue + the remaining duration of the video
            const totalQueueDuration = this.queue.getTotalDurationS() + this.priorityQueue.getTotalDurationS() + (video.duration_s - currentTimestamp);

            // Format the queue duration to a human readable format
            const durationFormatted = moment.utc(
                moment.duration(totalQueueDuration, 'seconds')
                    .as('milliseconds')
            ).format('HH:mm:ss');

            this.emit('video-timestamp', currentTimestamp, video.duration_s, durationFormatted);
        }
    }

    /**
     * Play or pause the video
     *
     * @throws If we're in idle state and queue mode
     */
    public playPauseVideo (): void {
        // we're in radio mode, switch to queue mode and resume playing
        if (this.mode === PlaybackMode.RADIO) {
            this.toggleQueueRadioMode();
            return;
        }

        if (this.state === PlaybackState.PAUSED) {
            this.setState(PlaybackState.PLAYING);
            this.resumeVideo();
        } else if (this.state === PlaybackState.PLAYING) {
            this.setState(PlaybackState.PAUSED);
            this.pauseVideo();
        } else {
            throw new Error('The queue is empty, can\'t play or pause anything!');
        }
    }

    /**
     * Skip the first video in the queue
     */
    public skipVideo (): void {
        // we're in radio, reset the timestamp and get the next video
        if (this.mode === PlaybackMode.RADIO) {
            this.currentTimestamp = 0;
            this.currentVideo = this.playNextVideoInQueue();
        } else {
            const previousState = this.state;
            try {
                // try to play the next video
                this.playNextVideo();
            } catch (error) {
                // we were not in idle before, but we couldn't skip so now we are
                if (previousState !== PlaybackState.IDLE) {
                    this.emit('video-changed', null);
                }

                throw error;
            }
        }
    }

    /**
     * Toggle between radio and queue mode
     */
    public toggleQueueRadioMode (): void {
        if (this.mode === PlaybackMode.RADIO) {
            this.setMode(PlaybackMode.QUEUE);
            // attempt to resume playing the video or start a new video
            try {
                this.resumeVideo();
            } catch (error) {}
        } else {
            this.playRadioStation(this.radioStation);
        }
    }

    /**
     * Play a radio station
     *
     * @param station The station to play
     * @emits radio-station-changed [station]
     */
    public playRadioStation (station: string): void {
        // we were playing sth, pause it for now
        if (this.mode === PlaybackMode.QUEUE && this.state === PlaybackState.PLAYING) {
            this.pauseVideo();
        }

        this.radioStation = station;
        this.setMode(PlaybackMode.RADIO);
        this.emit('radio-station-changed', station);
    }

    /**
     * Resume playing the video
     */
    private resumeVideo (): void {
        // current video is null, try to play the next then
        if (this.currentVideo === null) {
            try {
                this.playNextVideo();
                return;
            } catch (error) {
                throw new Error('No video to play or resume!');
            }
        }

        const video = this.currentVideo;

        this.playbackInterval = setInterval(() => {
            this.currentTimestamp++;
            this.updatePlayingVideo(video, this.currentTimestamp);
        }, 1000);
    }

    /**
     * Pause the video
     *
     * @emits video-paused
     */
    private pauseVideo (): void {
        if (this.playbackInterval === null) throw new Error('There is nothing playing to be paused!');

        clearInterval(this.playbackInterval);
        this.emit('video-paused');
    }

    /**
     * Set a state of the application
     * emits the state-changed event (if changed)
     *
     * @emits state-changed [state]
     * @param state The new state to be in
     */
    private setState (state: PlaybackState): void {
        if (this.state === state) return;

        this.state = state;
        this.emit('state-changed', this.state);
    }

    /**
     * Set the mode of the application
     * emits the mode-changed event (if changed)
     *
     * @emits mode-changed [mode]
     * @param mode The new mode to be in
     */
    private setMode (mode: PlaybackMode): void {
        if (this.mode === mode) return;

        this.mode = mode;
        this.emit('mode-changed', this.mode);
    }

    /**
     * Get the current volume
     * 0 - 100
     *
     * @returns The current volume
     */
    public getVolume (): number {
        return this.volume;
    }

    /**
     * Set the new volume
     *
     * @emits volume-change [volume]
     * @param volume The new volume (0-100)
     * @throws Error if volume is not between 0 and 100
     */
    public setVolume (volume: number): void {
        if (volume < 0 || volume > 100) throw new Error('Volume must be between 0 and 100!');

        this.volume = volume;
        this.emit('volume-change', this.volume);
    }
}
