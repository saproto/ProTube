const fetch = require("node-fetch");
const endpoint = io.of("/socket/screen");
const queueManager = require("../QueueManager");
const playbackManager = require("../PlaybackManager");
const { getCurrentSetting } = require("../ScreenSettings");
let newPhotoInterval = null;
let photo = null;

endpoint.on("connection", (socket) => {
  logger.screenInfo(
    `Screen connected from ${socket.handshake.address} with socket id ${socket.id}`
  );

  if (!photo) emitNewPhoto();
  socket.emit("photo-update", photo);

  socket.emit("queue-photos-visibility-changed", getCurrentSetting());

  socket.emit("queue-update", {
    queue: queueManager.getQueue(),
    duration: queueManager.getTotalDurationFormatted(),
  });

  socket.on("disconnect", () => {
    logger.screenInfo(`Disconnected socket: ${socket.id}`);
  });

  socket.on("get-photo", (callback) => {
    callback(photo);
  });

  socket.emit("player-update", {
    playerType: playbackManager.getPlayerType(),
    playerMode: playbackManager.getPlayerMode(),
    timestamp: playbackManager.getCurrentVideoTimestamp(),
    video: queueManager.getCurrentVideo(),
    queue: queueManager.getQueue(),
    volume: playbackManager.getVolume(),
    radio: playbackManager.getLastStation(),
  });
});

eventBus.on("queue-update", () => {
  endpoint.emit("queue-update", {
    queue: queueManager.getQueue(),
    duration: queueManager.getTotalDurationFormatted(),
  });
});

eventBus.on("player-update", () => {
  let queue = queueManager.getQueue();
  let playerType = playbackManager.getPlayerType();
  if (queue.length <= 0 || playerType !== enums.TYPES.VIDEO) {
    emitNewPhoto();
  } else if (playerType === enums.TYPES.VIDEO) {
    clearInterval(newPhotoInterval);
    newPhotoInterval = null;
  }

  endpoint.emit("player-update", {
    playerType: playerType,
    playerMode: playbackManager.getPlayerMode(),
    timestamp: playbackManager.getCurrentVideoTimestamp(),
    video: queueManager.getCurrentVideo(),
    queue: queue,
    volume: playbackManager.getVolume(),
    radio: playbackManager.getLastStation(),
  });
});

eventBus.on("new-video-timestamp", (timestamp) => {
  endpoint.emit("new-video-timestamp", timestamp);
});

eventBus.on("queue-photos-visibility-changed", (newSetting) => {
  endpoint.emit("queue-photos-visibility-changed", newSetting);
});

function emitNewPhoto() {
  if (newPhotoInterval === null) {
    newPhotoInterval = setInterval(emitNewPhoto, 10000);
  }
  fetch(`${process.env.LARAVEL_ENDPOINT}/api/photos/random_photo`)
    .then((res) => res.json())
    .then((newPhoto) => {
      photo = newPhoto;
      endpoint.emit("photo-update", photo);
    })
    .catch((e) => {
      endpoint.emit("photo-update", {
        url: "",
        album_name: "",
        date_taken: 0,
        error: e,
      });
    });
}
