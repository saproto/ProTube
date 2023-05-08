const endpoint = io.of("/socket/remote");
const queueManager = require("../QueueManager");
const { socketCheckAuthenticated, screenCodeCheck } = require("../Middlewares");
const youtube = require("../../utils/yt");

endpoint.use(socketCheckAuthenticated);

endpoint.use(screenCodeCheck);

endpoint.on("connection", (socket) => {
  logger.clientInfo(`Successfully connected - ${socket.id}`);

  socket.on("disconnect", () => {
    logger.clientInfo(`Disconnected socket: ${socket.id}`);
  });

  socket.on("fetch-videos", async (request, callback) => {
    try {
      const result = await youtube.search(
        request.query,
        request.continuationToken,
        socket.request.user.isAdmin(),
        queueManager.getQueue()
      );
      callback(result);
      logger.youtubeInfo("Returned list of music to client (remote)");
    } catch (e) {
      callback({});
    }
  });

  socket.on("fetch-then-add-playlist", async (playlistId, callback) => {
    try {
      const videos = await youtube.getVideosInPlaylist(
        playlistId,
        socket.request.user.isAdmin()
      );
      videos.forEach((video) => (video.user = formatUser(socket)));
      callback(queueManager.addAllFair(videos));
    } catch (e) {
      callback(e.getInfo());
    }
  });

  socket.on("fetch-then-add-video", async (videoId, callback) => {
    try {
      const video = await youtube.getVideo(
        videoId,
        socket.request.user.isAdmin()
      );
      video.user = formatUser(socket);

      callback({ success: queueManager.addFair(video) });
    } catch (e) {
      callback(e.getInfo());
    }
  });

  socket.on("remove-videos", (videoIDs, callback) => {
    logger.clientInfo(
      `${socket.id} Requested video removal of ${videoIDs.length}`
    );
    try {
      callback({
        success: queueManager.removeVideos(
          videoIDs,
          socket.request.session.passport.user.id,
          socket.request.user.isAdmin()
        ),
      });
    } catch (e) {
      callback(e.getInfo());
    }
  });

  socket.on("get-queue", (callback) => {
    callback({
      queue: queueManager.getQueue(),
      duration: queueManager.getTotalDurationFormatted(),
    });
  });
});

function formatUser(socket) {
  return {
    name: socket.request.user.name,
    id: socket.request.user.id,
    admin: socket.request.user.isAdmin(),
  };
}

eventBus.on("queue-update", () => {
  endpoint.emit("queue-update", {
    queue: queueManager.getQueue(),
    duration: queueManager.getTotalDurationFormatted(),
  });
});
