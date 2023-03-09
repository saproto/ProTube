const express = require("express");
const bearerToken = require("express-bearer-token");
const { checkBearerToken } = require("../Middlewares");
const { playSound } = require("../socket_endpoints/SoundBoard");
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
  if (!req.body?.user_id || !req.body?.admin_until || !req.body?.admin_from) {
    logger.apiInfo("Request had incomplete body");
    return res.send({ success: enums.FAIL, message: "Incomplete body" });
  }
  const userID = parseInt(req.body.user_id);
  const adminFrom = parseInt(req.body.admin_from);
  const adminUntil = parseInt(req.body.admin_until);

  // finding and updating the users admin status in the database
  const user = await User.findByPk(userID);
  if (!user) {
    logger.apiInfo("User is not found!");
    return res.send({ success: enums.FAIL, message: "User not found!" });
  }

  user.admin_until = adminUntil;
  user.admin_from = adminFrom;
  await user.save();

  logger.apiInfo(
    `User ${userID}'s is admin from: ${adminFrom} until: ${adminUntil}`
  );
  return res.send({ success: enums.SUCCESS });
});

this.protubeApi.post("/playsound", async function (req, res) {
  // todo implement playsound
  playSound();
  res.send({ success: true });
});
