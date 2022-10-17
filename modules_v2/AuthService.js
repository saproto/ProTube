const passport = require("passport");
const fetch = require('node-fetch');
const OAuth2Strategy = require("passport-oauth2").Strategy;
const { db } = require('./Middlewares')

// passport setup
passport.use(
    new OAuth2Strategy({
      authorizationURL: 'https://localhost:8080/oauth/authorize',
      tokenURL: 'https://localhost:8080/oauth/token',
      clientID: 1,
      clientSecret: 'J68O7JyGn6BIxnBjaTVmxqB9RZfYqG5BkM83Z7eP',
      //callbackURL: "http://localhost:3000/api/auth/example/callback"
    },
    async function(accessToken, refreshToken, profile, done) {
        let response = await fetch(`https://localhost:8080/api/protube/test`, {
            headers: {
                'Authorization': 'Bearer ' + accessToken
            }
        });
        const userData = await response.json();
        if(userData.authenticated){
            db.query(`
                REPLACE INTO users (user_id, admin, refresh_token, access_token) 
                VALUES ('${userData.user_id}', '${+userData.is_admin}', '${refreshToken}', '${accessToken}')
            `);
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
  
passport.deserializeUser(function(user, done) {
    db.query("select * from users where user_id = "+user.id, function(err,rows){	
        done(err, rows[0]);
    });
});
