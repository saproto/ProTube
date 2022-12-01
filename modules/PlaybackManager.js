const queueManager = require('./QueueManager');
const radio = require('./RadioStations');
const fetch = require('node-fetch');
const { isEmpty } = require('lodash')
const { MODES, SUCCESS, TYPES } = require('../utils/constants')

let playerMode = MODES.IDLE;
let playerType = TYPES.VIDEO;

let selectedRadioStation = {};
let playbackInterval;
let volume = 75;
let timestamp = 0;

exports.getCurrentVideoTimestamp = () => timestamp;
exports.getPlayerType = () => playerType;
exports.getPlayerMode = () => playerMode;
exports.getLastStation = () => selectedRadioStation;
exports.getVolume = () => volume;

exports.setVolume = (newVolume) => {
    if(newVolume > 100 || newVolume < 0) throw new hardError('Invalid volume!');
    volume = parseInt(newVolume);
    return SUCCESS;
}

exports.playVideo = (video) => {
    playerType = TYPES.VIDEO;
    playerMode = MODES.PLAYING;
    queueManager.setCurrentVideo(video);

    playbackInterval = setInterval(() => {
        if(timestamp < video.duration) {
            timestamp++;
            eventBus.emit('new-video-timestamp', timestamp);
        } else {
            // video ended, add video to played videos
            fetch(`${process.env.LARAVEL_ENDPOINT}/api/protube/played?` + new URLSearchParams({
                secret: process.env.LARAVEL_API_KEY,
                user_id: video.user.user_id,
                video_id: video.id,
                video_title: video.title
            })).catch(function() {
                // non asynchronous because we don't need to wait for this to be done to play the next video (it can do it in the background)
                logger.serverError("Failed to send video data to protube site");
            });
            try { 
                this.playNextVideo(); 
            } catch {}
            eventBus.emit('player-update');
        }
    }, 1000);
    eventBus.emit('player-update');
};

exports.pauseVideo = () => {
    clearInterval(playbackInterval);
    playerMode = MODES.PAUSED;
    eventBus.emit('player-update');
}

exports.playNextVideo = () => {
    if(playerType === TYPES.RADIO) throw new softError('Radio is currently playing!');

    const previouslyPlaying = queueManager.getCurrentVideo();
    this.stopVideo();

    try{
        queueManager.moveToNext();
        this.playVideo(queueManager.getCurrentVideo());
    } catch(e){
        // skip was pressed on an empty queue so we can't move and need to update the players 
        if(!isEmpty(previouslyPlaying)) eventBus.emit('player-update');
        throw e;    
    }
    return SUCCESS;
}

exports.stopVideo = () => {
    clearInterval(playbackInterval);
    playerMode = MODES.IDLE;
    timestamp = 0;
    queueManager.setCurrentVideo({});
}

exports.playRadio = (newStationId) => {
    const newRadio = radio.validateRadioStation(newStationId);

    if(!newRadio) throw new hardError('Radio station not found!');

    selectedRadioStation = newRadio;
    if(playerType === TYPES.VIDEO) this.toggleType();
    else eventBus.emit('player-update');
    return SUCCESS;
};

exports.playPause = () => {
    if(playerMode === MODES.IDLE && playerType === TYPES.RADIO) return this.toggleType();
    if(playerMode === MODES.PAUSED) return this.playVideo(queueManager.getCurrentVideo());
    if(playerMode === MODES.PLAYING) return this.pauseVideo();
    throw new hardError("Can't resume ProTube!");
};

exports.toggleType = () => {
    if(playerType === TYPES.RADIO){
        playerType = TYPES.VIDEO;
        this.playNextVideo();
        eventBus.emit('player-update');
        return SUCCESS;
    }

    //check if there is a radio set, if not, try to
    if(isEmpty(selectedRadioStation)) {
        try {
            selectedRadioStation = radio.getAllRadioStations()[0];
        } catch (e) {
            throw new hardError('Can\'t find a radiostation!');
        }
    }

    //add the current playing video back into the queue
    if(playerMode !== MODES.IDLE) {
        queueManager.addToTop(queueManager.getCurrentVideo());
        eventBus.emit('queue-update');
    }
    this.stopVideo();
    playerType = TYPES.RADIO;

    try {
        this.playRadio(selectedRadioStation.z);
    } catch(e) {
        // if we cant play the radio, revert back to protube
        this.toggleType();
        throw(e);
    }
    
    // eventBus.emit('player-update');
    return SUCCESS;
}

// on queue update, if empty start playing
eventBus.on('queue-update', () => {
    if(playerMode === MODES.IDLE && playerType === TYPES.VIDEO && !queueManager.isQueueEmpty() && isEmpty(queueManager.getCurrentVideo())) {
        this.playNextVideo();
    }
});