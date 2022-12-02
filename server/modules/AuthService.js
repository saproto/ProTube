const passport = require("passport");
const fetch = require('node-fetch');
const OAuth2Strategy = require("passport-oauth2").Strategy;
const { sequelize, User, ScreenCode } = require('./DataBase');
const { getCurrentUnix } = require('../utils/time-formatter');

const authURL = `${process.env.LARAVEL_ENDPOINT}/oauth/authorize`;
const tokenURL = `${process.env.LARAVEL_ENDPOINT}/oauth/token`;

// passport setup
passport.use(
    new OAuth2Strategy({
      authorizationURL: authURL,
      tokenURL: tokenURL,
      clientID: process.env.OAUTH_CLIENT_ID,
      clientSecret: process.env.OAUTH_CLIENT_SECRET,
      //callbackURL: "http://localhost:3000/api/auth/example/callback"
    },
    async function(accessToken, refreshToken, profile, done) {
        let response = await fetch(`${process.env.LARAVEL_ENDPOINT}/api/protube/userdetails`, {
            headers: {
                'Authorization': 'Bearer ' + accessToken
            }
        });
        const userData = await response.json();
        if(userData.authenticated){
            await User.upsert({
                id: userData.user_id,
                admin: +userData.is_admin,
                refresh_token: refreshToken,
                access_token: accessToken
            });
            await ScreenCode.upsert({
                user_id: userData.user_id
            });
            return done(null, {
                id: userData.user_id,
                admin: userData.is_admin,
                name: userData.name
            });
        } return done(null, false);
    })
);

passport.serializeUser(function(user, done) {
    return done(null, {
        id: user.id,
        name: user.name
    });
});
  
passport.deserializeUser(async function(user, done) {
    const userData = await User.findOne({ 
        include: ScreenCode,
        where: {
            id: user.id
        }
    });
    if(!userData) return done(true, null);
    userData.screencode.banned = userData.screencode.banned_until > getCurrentUnix();
    done(null, userData);
});
