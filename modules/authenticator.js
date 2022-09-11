const fetch = require('node-fetch');
const cookie = require('cookie');
const logger = require('../utils/logger');
const { InMemorySessionStore } = require("./sessionStore");
const { getCurrentUnix } = require('../utils/time-formatter');
const sessionStore = new InMemorySessionStore();

// Ignoring ssl errors on fetches
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

// time based session expiration, check every 30 seconds
const maxSessionDuration = 3600;
setInterval(async () => {
    sessionStore.flushExpiredSessions();
}, parseInt(process.env.SESSION_FLUSHING_INTERVAL) * 1000);

// returns true as long as the cookie is present and valid
exports.validateClient = async (_cookies, screencode_correct=false) => {
    try {
        // extract proto_session cookie
        const proto_cookie = cookie.parse(_cookies)['proto_session'];
        // Check if we have already validated this cookie once
        const existingSession = sessionStore.findSession(proto_cookie);
        if(existingSession){
            // cookie had previously not yet authorization for a screencode
            if(screencode_correct && !existingSession.screencode_correct){
                sessionStore.deleteSession(proto_cookie);
                sessionStore.saveSession(proto_cookie, {
                    session_id: existingSession.session_id,
                    name: existingSession.name,
                    is_admin: existingSession.is_admin,
                    screencode_correct: screencode_correct,
                    user_id: existingSession.user_id,
                    unix: existingSession.unix
                });
            }
            return true;
        }
        // secret validation for local client (electron app)
        if(proto_cookie == process.env.CLIENT_IDENTIFIER) {
            sessionStore.saveSession(proto_cookie, {
                session_id: proto_cookie,
                name: "Client-Screen",
                is_admin: true,
                screencode_correct: true,
                user_id: -1,
                unix: Date.now() //intentionally high to omit session flushing
            });
            logger.localClientInfo("Succesfully connected!");
            return true;
        }
        // Cookie is new, validate it at the webserver
        // Check if we want real authentication or emulated
        if(process.env.EMULATE_AUTHENTICATION === 'false') {
            //get user data from the Proto API endpoint
            let response = await fetch(`${process.env.API_ENDPOINT}/userdetails`, {
                headers: {
                    cookie: `proto_session=${proto_cookie}`
                }});
            var userdata = await response.json();
        }else{
            //emulated authentication, construct a dummy user with admin rights
            var userdata = {
                authenticated: true,
                name: 'John Doe',
                is_admin: true,
                user_id: 0
            }
        }
        // The cookie sent is valid
        if(userdata.authenticated){
            // Store the cookie in the session
            sessionStore.saveSession(proto_cookie, {
                session_id: proto_cookie,
                name: userdata.name,
                is_admin: userdata.is_admin,
                screencode_correct: screencode_correct,
                user_id: userdata.user_id,
                unix: (getCurrentUnix() + (parseInt(process.env.SESSION_DURATION) || 3600))
            });
            return true;
        }
    } catch (e) {
        logger.serverError(`Error at the authentication of a cookie. Caused by authenticator.js, error message: ${e}`);
        throw new Error('Error at parsing cookies');
    }
    throw new Error('Invalid session cookie');
}

exports.validateAdmin = async (_cookies) => {
    try{
        await this.validateClient(_cookies);
        // extract proto_session cookie
        const proto_cookie = cookie.parse(_cookies)['proto_session'];
        return sessionStore.findSession(proto_cookie).is_admin;
    } catch (error){
        throw new Error('Error at parsing cookies');
    }
    throw new Error('Unauthorized admin');
}

exports.flushAllRemotes = async () => {
    await sessionStore.flushAllRemotes();
}

exports.getSessionData = async (_cookies) => {
    try{
        await this.validateClient(_cookies);
        // extract proto_session cookie
        const proto_cookie = cookie.parse(_cookies)['proto_session'];
        return sessionStore.findSession(proto_cookie);
    } catch (error){
        return false;
    }
}

exports.flushAllSessions = () =>{
    sessionStore.flushAllSessions();
}