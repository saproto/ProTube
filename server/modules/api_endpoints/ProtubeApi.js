const express = require("express");
const bearerToken = require("express-bearer-token");
const { checkBearerToken } = require("../Middlewares");
const { playSound } = require("../socket_endpoints/SoundBoard");
const { User } = require("../DataBase");

exports.protubeApi = express.Router();

this.protubeApi.use(bearerToken());
this.protubeApi.use(checkBearerToken);

// Endpoint to update the admin status of a user id
this.protubeApi.post("/updateadmin/:userID(d+)", async function (req, res) {
  const userID = parseInt(req.params.userID);

  logger.apiInfo(
    `Attempt from ${req.hostname} to update the admin status of user ${userID}`
  );
  // finding and updating the users admin status in the database
  const user = await User.findByPk(userID);
  if (!user) {
    logger.apiInfo("User is not found!");
    return res.send({ success: enums.FAIL, message: "User not found!" });
  }

  fetch(`${process.env.LARAVEL_ENDPOINT}/api/protube/userdetails`, {
    headers: {
      Authorization: "Bearer " + user.access_token,
    },
  }).then(async (response) => {
    const userData = await response.json();
    await User.upsert({
      id: userData.id,
      name: userData.name,
      admin_from: +userData.admin_from,
      admin_until: +userData.admin_until,
      refresh_token: refreshToken,
      access_token: accessToken,
    });
  });
  return res.send({ success: enums.SUCCESS });
});

this.protubeApi.post("/playsound", async function (req, res) {
  // todo implement playsound
  playSound();
  res.send({ success: true });
});
