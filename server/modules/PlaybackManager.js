const queueManager = require("./QueueManager");
const radio = require("./RadioStations");
const fetch = require("node-fetch");
const { isEmpty } = require("lodash");
const { format_hh_mm_ss } = require("../utils/time-formatter");

let playerMode = enums.MODES.IDLE;
let playerType = enums.TYPES.VIDEO;

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
  if (newVolume > 100 || newVolume < 0) throw new hardError("Invalid volume!");
  volume = parseInt(newVolume);
  return enums.SUCCESS;
};

exports.playVideo = (video) => {
  playerType = enums.TYPES.VIDEO;
  playerMode = enums.MODES.PLAYING;
  queueManager.setCurrentVideo(video);

  playbackInterval = setInterval(() => {
    if (timestamp < video.duration) {
      timestamp++;
      eventBus.emit("new-video-timestamp", {
        timestamp: timestamp,
        totalDuration: format_hh_mm_ss(
          queueManager.getTotalDuration() + (video.duration - timestamp)
        ),
      });
    } else {
      // video ended, add video to played videos
      fetch(
        `${process.env.LARAVEL_ENDPOINT}/api/protube/played?` +
          new URLSearchParams({
            secret: process.env.LARAVEL_API_KEY,
            user_id: video.user.id,
            video_id: video.id,
            video_title: video.title,
          })
      ).catch(function () {
        // non-asynchronous because we don't need to wait for this to be done to play the next video (it can do it in the background)
        logger.serverError("Failed to send video data to ProTube site");
      });
      try {
        this.playNextVideo();
      } catch (e) {
        logger.serverError(e);
      }
      eventBus.emit("player-update");
    }
  }, 1000);
  eventBus.emit("player-update");
};

exports.pauseVideo = () => {
  clearInterval(playbackInterval);
  playerMode = enums.MODES.PAUSED;
  eventBus.emit("player-update");
};

exports.playNextVideo = () => {
  if (playerType === enums.TYPES.RADIO)
    throw new softError("Radio is currently playing!");

  const previouslyPlaying = queueManager.getCurrentVideo();
  this.stopVideo();

  try {
    queueManager.moveToNext();
    this.playVideo(queueManager.getCurrentVideo());
  } catch (e) {
    // skip was pressed on an empty queue so we can't move and need to update the players
    if (!isEmpty(previouslyPlaying)) eventBus.emit("player-update");
    throw e;
  }
  return enums.SUCCESS;
};

exports.stopVideo = () => {
  clearInterval(playbackInterval);
  playerMode = enums.MODES.IDLE;
  timestamp = 0;
  queueManager.setCurrentVideo({});
};

exports.playRadio = (newStationId) => {
  const newRadio = radio.validateRadioStation(newStationId);

  if (!newRadio) throw new hardError("Radio station not found!");

  selectedRadioStation = newRadio;
  if (playerType === enums.TYPES.VIDEO) this.toggleType();
  else eventBus.emit("player-update");
  return enums.SUCCESS;
};

exports.playPause = () => {
  if (playerMode === enums.MODES.IDLE && playerType === enums.TYPES.RADIO)
    return this.toggleType();
  if (playerMode === enums.MODES.PAUSED)
    return this.playVideo(queueManager.getCurrentVideo());
  if (playerMode === enums.MODES.PLAYING) return this.pauseVideo();
  throw new hardError("Can't resume ProTube!");
};

exports.toggleType = () => {
  if (playerType === enums.TYPES.RADIO) {
    playerType = enums.TYPES.VIDEO;
    try {
      this.playNextVideo();
    } catch {}
    eventBus.emit("player-update");
    return enums.SUCCESS;
  }

  //check if there is a radio set, if not, try to
  if (isEmpty(selectedRadioStation)) {
    try {
      selectedRadioStation = radio.getAllRadioStations()[0];
    } catch (e) {
      throw new hardError("Can't find a radiostation!");
    }
  }

  //add the current playing video back into the queue
  if (playerMode !== enums.MODES.IDLE) {
    queueManager.addToTop(queueManager.getCurrentVideo());
    eventBus.emit("queue-update");
  }
  this.stopVideo();
  playerType = enums.TYPES.RADIO;

  try {
    this.playRadio(selectedRadioStation.z);
  } catch (e) {
    // if we cant play the radio, revert back to protube
    this.toggleType();
    throw e;
  }

  // eventBus.emit('player-update');
  return enums.SUCCESS;
};

// on queue update, if empty start playing
eventBus.on("queue-update", () => {
  if (
    playerMode === enums.MODES.IDLE &&
    playerType === enums.TYPES.VIDEO &&
    !queueManager.isQueueEmpty() &&
    isEmpty(queueManager.getCurrentVideo())
  ) {
    this.playNextVideo();
  }
});
