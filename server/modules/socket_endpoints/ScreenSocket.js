const fetch = require("node-fetch");
const endpoint = io.of("/socket/screen");
const queueManager = require("../QueueManager");
const playbackManager = require("../PlaybackManager");
const {getQueueVisibility, getSmallPlayer} = require("../PlaybackManager");
setInterval(emitNewPhoto, 10000);
let photo = null;
let album = {
  album_name: "",
  date_taken: "",
  photos: [],
};

endpoint.on("connection", (socket) => {
  logger.screenInfo(
    `Screen connected from ${socket.handshake.address} with socket id ${socket.id}`
  );

  endpoint.emit("photo-update", {
    url: photo,
    album_name: album.album_name,
    date_taken: album.date_taken,
  });

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

eventBus.on("screen-settings-update", () => {
  endpoint.emit("screen-settings-update", {
    hideQueue: getQueueVisibility(),
    smallPlayer: getSmallPlayer()
  });
});

eventBus.on("player-update", () => {
  let queue = queueManager.getQueue();
  let playerType = playbackManager.getPlayerType();

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

function emitNewPhoto() {
  if (album.photos.length > 0) {
    photo = album.photos.shift();
    endpoint.emit("photo-update", {
      url: photo,
      album_name: album.album_name,
      date_taken: album.date_taken,
    });
  }
  if (album.photos.length === 0) {
    fetch(`${process.env.LARAVEL_ENDPOINT}/api/photos/random_album`)
      .then((res) => res.json())
      .then((newAlbum) => {
        album = newAlbum;
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
}
