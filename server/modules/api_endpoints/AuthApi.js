const express = require("express");
const passport = require("passport");
require("passport-oauth2");
const { checkAuthenticated } = require("../Middlewares");

exports.authApi = express.Router();

// Instantiate Oauth2 login process
this.authApi.get("/login", passport.authenticate("oauth2"));

// Passport Oauth2 callback
this.authApi.get(
  "/login/callback",
  passport.authenticate("oauth2", { failureRedirect: "/fail" }),
  (req, res) => {
    res.status(200).redirect("/remote");
  }
);

// Only accessible for logged in users
this.authApi.get("/user", checkAuthenticated, (req, res) => {
  res.send({
    name: req.user.name,
    admin: req.user.isAdmin(),
    hasValidRemote: req.user.hasValidRemote(),
    id: req.user.id,
  });
});
