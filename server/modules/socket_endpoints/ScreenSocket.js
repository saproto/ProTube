const endpoint = io.of("/socket/screen");
const queueManager = require("../QueueManager");
const playbackManager = require("../PlaybackManager");
let newPhotoInterval = null;
let photo = null;
endpoint.on("connection", (socket) => {
  logger.screenInfo(
    `Screen connected from ${socket.handshake.address} with socket id ${socket.id}`
  );

  if (!photo) emitNewPhoto();
  endpoint.emit("queue-update", {
    queue: [],
    duration: "00:00:00",
    photo: photo,
  });

  socket.on("disconnect", () => {
    logger.screenInfo(`Disconnected socket: ${socket.id}`);
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
  let queue = queueManager.getQueue();
  if (queue.length <= 0) {
    emitNewPhoto();
  } else {
    endpoint.emit("queue-update", {
      queue: queueManager.getQueue(),
      duration: queueManager.getTotalDurationFormatted(),
      photo: {},
    });
    clearInterval(newPhotoInterval);
    newPhotoInterval = null;
  }
});

eventBus.on("player-update", () => {
  endpoint.emit("player-update", {
    playerType: playbackManager.getPlayerType(),
    playerMode: playbackManager.getPlayerMode(),
    timestamp: playbackManager.getCurrentVideoTimestamp(),
    video: queueManager.getCurrentVideo(),
    queue: queueManager.getQueue(),
    volume: playbackManager.getVolume(),
    radio: playbackManager.getLastStation(),
  });
});

eventBus.on("new-video-timestamp", (timestamp) => {
  endpoint.emit("new-video-timestamp", timestamp);
});

function emitNewPhoto() {
  if (newPhotoInterval === null) {
    newPhotoInterval = setInterval(emitNewPhoto, 10000);
  }
  fetch(`${process.env.LARAVEL_ENDPOINT}/api/photos/random_photo`)
    .then((res) => res.json())
    .then((newPhoto) => {
      photo = newPhoto;
      endpoint.emit("queue-update", {
        queue: [],
        duration: "00:00:00",
        photo: photo,
      });
    });
}
