const endpoint = io.of("/socket/remote/admin");
const { socketCheckAdminAuthenticated } = require("../Middlewares");
const {
  getVolume,
  playRadio,
  playPause,
  getPlayerMode,
  toggleType,
  playNextVideo,
  setVolume,
  getPlayerType
} = require("../PlaybackManager");
const { isEmpty } = require("lodash");
const { adminResetScreenCode } = require("../ScreenCode");
const radio = require("../RadioStations");
const queueManager = require("../QueueManager");

endpoint.use(socketCheckAdminAuthenticated);

endpoint.on("connection", (socket) => {
  logger.adminInfo(`Successfully connected - ${socket.id}`);

  socket.on("disconnect", () => {
    logger.adminInfo(`Disconnected admin socket: ${socket.id}`);
  });

  socket.on("get-queue", (callback) => {
    callback({
      queue: queueManager.getQueue(),
      duration: queueManager.getTotalDurationFormatted(),
    });
  });

  socket.on("get-radiostations", (callback) => {
    callback(radio.getAllRadioStations());
  });

  // change the screen's volume
  socket.on("get-player-settings", (callback) => {
    callback({
      volume: getVolume(),
      playerMode: getPlayerMode(),
      playerType: getPlayerType(),
    });
  });

  socket.on("reset-screen-code", async (callback) => {
    logger.adminInfo(`${socket.id} Requested new screencode`);
    callback({ success: await adminResetScreenCode() });
  });

  socket.on("clear-queue", (callback) => {
    logger.adminInfo(`${socket.id} Requested to clear the queue`);
    try {
      callback({ success: queueManager.clearQueue() });
    } catch (e) {
      callback(e.getInfo());
    }
  });

  socket.on("toggle-radio-protube", async (callback) => {
    logger.adminInfo(`${socket.id} Toggling protube or radio`);
    try {
      callback({ success: toggleType() });
    } catch (e) {
      callback(e.getInfo());
    }
  });

  socket.on("play-radio", (stationID, callback) => {
    logger.adminInfo(`${socket.id} Setting the radio to: ${stationID}`);
    try {
      callback({ success: playRadio(stationID) });
    } catch (e) {
      callback(e.getInfo());
    }
  });

  socket.on("play-pause", (callback) => {
    logger.adminInfo(`${socket.id} Requested to play/pause the content`);
    try {
      callback({ success: playPause() });
    } catch (e) {
      callback(e.getInfo());
    }
  });

  socket.on("skip-video", (callback) => {
    logger.adminInfo(`${socket.id} Requested to skip a video`);
    const wasPlaying = (getPlayerMode() !== enums.MODES.IDLE);
    try {
      callback({ success: playNextVideo() });
    } catch (e) {
      // unable to play next video (empty queue), but we were playing so we did have a successful skip
      if(wasPlaying) callback({ success: enums.SUCCESS });

      callback(e.getInfo());
    }
  });

  // change the screen's volume
  socket.on("set-new-volume", (volume, callback) => {
    logger.adminInfo(
      `${socket.id} Requested to change the volume to: ${volume}`
    );
    try {
      callback({ success: setVolume(volume) });
      updateAdminPanels();
      eventBus.emit("volume-update", volume);
    } catch (e) {
      callback(e.getInfo());
    }
  });
});

eventBus.on("player-update", updateAdminPanels);

eventBus.on("queue-update", () => {
  endpoint.emit("queue-update", {
    queue: queueManager.getQueue(),
    duration: queueManager.getTotalDurationFormatted(),
  });
});

function updateAdminPanels() {
  endpoint.emit("update-admin-panel", {
    volume: getVolume(),
    playerMode: getPlayerMode(),
    playerType: getPlayerType(),
  });
}
