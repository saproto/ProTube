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
        socket.request.user.admin,
        queueManager.getQueue()
      );
      callback(result);
      logger.youtubeInfo("Returned list of music to client (remote)");
    } catch (e) {
      callback({});
    }
  });

  socket.on("fetch-playlist", async (playlistId, callback) => {
    try {
      const playlist = await youtube.getPlaylistInfo(playlistId);
      callback(playlist);
      logger.youtubeInfo(
        "Returned playlist information to the client (remote)"
      );
    } catch (e) {
      callback(e.getInfo());
    }
  });

  socket.on("add-playlist", async (playlistId, shufflePlaylist, callback) => {
    try {
      let videos = await youtube.getVideosInPlaylist(
        playlistId,
        socket.request.user.admin
      );

      videos.forEach((video) => (video.user = formatUser(socket)));

      if (shufflePlaylist) {
        videos = videos
          .map((value) => ({ value, sort: Math.random() }))
          .sort((a, b) => a.sort - b.sort)
          .map(({ value }) => value);
      }

      callback(queueManager.addAllFair(videos));
      logger.youtubeInfo("Added playlist with id: " + playlistId);
    } catch (e) {
      callback(e.getInfo());
    }
  });

  socket.on("fetch-then-add-video", async (videoId, callback) => {
    try {
      const video = await youtube.getVideo(videoId, socket.request.user.admin);
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
          socket.request.user.admin
        ),
      });
    } catch (e) {
      callback(e.getInfo());
    }
  });

  socket.on("move-video", (videoID, up, callback) => {
    logger.clientInfo(
      `${socket.id} Requested change in order ${
        up ? "up" : "down"
      } of ${videoID}`
    );
    try {
      callback({
        success: queueManager.changeOrder(
          videoID,
          up,
          socket.request.session.passport.user.id,
          socket.request.user.admin
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
    admin: socket.request.user.admin,
  };
}

eventBus.on("queue-update", () => {
  endpoint.emit("queue-update", {
    queue: queueManager.getQueue(),
    duration: queueManager.getTotalDurationFormatted(),
  });
});
