const passport = require("passport");
const fetch = require("node-fetch");
const OAuth2Strategy = require("passport-oauth2").Strategy;
const { User } = require("./DataBase");

const authURL = `${process.env.LARAVEL_ENDPOINT}/oauth/authorize`;
const tokenURL = `${process.env.LARAVEL_ENDPOINT}/oauth/token`;

// passport setup
passport.use(
  new OAuth2Strategy(
    {
      authorizationURL: authURL,
      tokenURL: tokenURL,
      clientID: process.env.OAUTH_CLIENT_ID,
      clientSecret: process.env.OAUTH_CLIENT_SECRET,
      //callbackURL: "http://localhost:3000/api/auth/example/callback"
    },
    async function (accessToken, refreshToken, profile, done) {
      let response = await fetch(
        `${process.env.LARAVEL_ENDPOINT}/api/protube/userdetails`,
        {
          headers: {
            Authorization: "Bearer " + accessToken,
          },
        }
      );

      if (!response.ok) {
        logger.serverError(`User fetch failed:  ${response.status}, ${response.statusText}`);
        return done(null, false);
      }

      const userData = await response.json();

      if (!userData.authenticated) {
        logger.serverError(`User not authenticated by Laravel: ${userData}`);
        return done(null, false);
      }

      if (userData.authenticated) {
        await User.upsert({
          id: userData.id,
          name: userData.name,
          admin: +userData.admin,
          refresh_token: refreshToken,
          access_token: accessToken,
        });
        return done(null, {
          id: userData.id,
          admin: userData.admin,
          name: userData.name,
        });
      }
      return done(null, false);
    }
  )
);

passport.serializeUser(function (user, done) {
  return done(null, {
    id: user.id,
    name: user.name,
  });
});

passport.deserializeUser(async function (user, done) {
  const userData = await User.findByPk(user.id);
  if (!userData) return done(true, null);
  done(null, userData);
});
