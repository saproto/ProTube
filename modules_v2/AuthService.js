const passport = require("passport");
const fetch = require('node-fetch');
const OAuth2Strategy = require("passport-oauth2").Strategy;
// const { db } = require('./Middlewares');
const { sequelize, User, ScreenCode } = require('./DataBase');
const { getCurrentUnix } = require('../utils/time-formatter');

const authURL = `${process.env.LARAVEL_ENDPOINT}/oauth/authorize`;
const tokenURL = `${process.env.LARAVEL_ENDPOINT}/oauth/token`;

// passport setup
passport.use(
    new OAuth2Strategy({
      authorizationURL: authURL,
      tokenURL: tokenURL,
      clientID: 1,
      clientSecret: 'J68O7JyGn6BIxnBjaTVmxqB9RZfYqG5BkM83Z7eP',
      //callbackURL: "http://localhost:3000/api/auth/example/callback"
    },
    async function(accessToken, refreshToken, profile, done) {
        let response = await fetch(`${process.env.API_ENDPOINT}/test`, {
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
            // db.query(`
            //     REPLACE INTO users (user_id, admin, refresh_token, access_token) 
            //     VALUES ('${userData.user_id}', '${+userData.is_admin}', '${refreshToken}', '${accessToken}')
            // `);
            // db.query(`REPLACE INTO screencode (user_id) VALUES ('${userData.user_id}')`);
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
    // db.query(`
    //     SELECT * FROM users 
    //     JOIN screencode ON screencode.user_id = users.user_id 
    //     WHERE users.user_id = ${user.id}`, function(err,rows){	
    //         rows[0].banned = rows[0].banned_until > getCurrentUnix();
    //         done(err, rows[0]);
    // });
});
