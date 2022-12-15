const endpoint = io.of("/socket/screen");
const queueManager = require("../QueueManager");
const playbackManager = require("../PlaybackManager");

endpoint.on("connection", (socket) => {
  logger.screenInfo(
    `Screen connected from ${socket.handshake.address} with socket id ${socket.id}`
  );

  socket.emit("queue-update", {
    queue: queueManager.getQueue(),
    duration: queueManager.getTotalDurationFormatted(),
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
  endpoint.emit("queue-update", {
    queue: queueManager.getQueue(),
    duration: queueManager.getTotalDurationFormatted(),
  });
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
