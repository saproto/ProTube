const express = require("express");
const bearerToken = require("express-bearer-token");
const { checkBearerToken } = require("../Middlewares");
const { playSound } = require("../socket_endpoints/SoundBoard");
const { playNextVideo, getPlayerMode } = require("../PlaybackManager");
const { User } = require("../DataBase");

exports.protubeApi = express.Router();

this.protubeApi.use(bearerToken());
this.protubeApi.use(checkBearerToken);

// Endpoint to update the admin status of a user id
this.protubeApi.post("/updateadmin", async function (req, res) {
  logger.apiInfo(
    `Attempt from ${req.hostname} to update the admin status of a user`
  );

  // Check if the required data is present and parse it
  if (!Object.keys(req.body).includes('user_id') || !Object.keys(req.body).includes('admin')) {
    logger.apiInfo("Request had incomplete body");
    return res.send({ success: enums.FAIL, message: "Incomplete body" });
  }
  const userID = parseInt(req.body.user_id);
  const isAdmin = +req.body.admin === 1;

  // finding and updating the users admin status in the database
  const user = await User.findByPk(userID);

  if (!user) {
    logger.apiInfo("User is not found!");
    return res.send({ success: enums.FAIL, message: "User not found!" });
  }
  user.admin = isAdmin;
  await user.save();
  logger.apiInfo(`User ${userID}'s new admin status: ${isAdmin}`);

  if (isAdmin) return res.send({ success: enums.SUCCESS });

  // disconnecting admin screen and remote sockets if present
  const sockets = await io.of("/socket/remote/admin").fetchSockets();
  const screenSockets = await io.of("/socket/screen/admin").fetchSockets();

  for (const sock of sockets) {
    await sock.request.user.reload();
    if (sock.request.user.id === userID) {
      logger.apiInfo(`Disconnected admin remote socket`);
      sock.disconnect(true);
    }
  }

  for (const sock of screenSockets) {
    await sock.request.user.reload();
    if (sock.request.user.id === userID) {
      logger.apiInfo(`Disconnected admin screen socket`);
      sock.disconnect(true);
    }
  }

  return res.send({ success: enums.SUCCESS });
});

// Endpoint to skip a song
this.protubeApi.post("/skipsong", function (req, res) {
  logger.apiInfo(`Attempt from ${req.hostname} to skip a song`);
  const wasPlaying = getPlayerMode() !== enums.MODES.IDLE;
  try {
    playNextVideo();
    // eslint-disable-next-line
  } catch {}
  // we were playing sth so we did have a successful skip
  return res.send({ success: wasPlaying });
});

this.protubeApi.post("/playsound", async function (req, res) {
  // todo implement playsound
  playSound();
  res.send({ success: true });
});
