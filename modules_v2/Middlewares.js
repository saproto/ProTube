const session = require("express-session");
const MySQLStore = require('express-mysql-session')(session);
const mysql = require('mysql2');
const { getCurrentUnix } = require('../utils/time-formatter');
const { checkScreenCode, setSessionStore } = require('./ScreenCode');
const moment = require('moment');
require('passport')

//database setup
const dbOptions = {
    connectionLimit: 2,
    host     : process.env.MYSQL_HOST,
    user     : process.env.MYSQL_USER,
    password : process.env.MYSQL_PASSWORD,
    port     : process.env.MYSQL_PORT,
    database : process.env.MYSQL_DB
};
exports.db = mysql.createPool(dbOptions);
exports.sessionStore = new MySQLStore({
    clearExpired: true,
    checkExpirationInterval: parseInt(process.env.SESSION_CHECK_EXP_INTERVAL)*1000,
}, this.db.promise());
setSessionStore(this.sessionStore);

exports.sessionMiddleware = session({
    secret: process.env.SESSION_SECRET,
    name: process.env.SESSION_NAME,
    resave: false,
    store: this.sessionStore,
    saveUninitialized: false,
    cookie: {
        maxAge: parseInt(process.env.SESSION_DURATION) * 1000
    }
});

exports.checkAuthenticated = (req, res, next) => {
    if (req.isAuthenticated()) { return next() }
    res.redirect("/protube/login")
}

// add admin check
exports.CheckAdminAuthenticated = (req, res, next) => {
    if (req.isAuthenticated()) { return next() }
    res.redirect("/api/login");
}

exports.socketCheckAuthenticated = (socket, next) => {
    if (socket.request.isAuthenticated()) return next();
    console.log("unauthorized socket");
    next(new Error('unauthorized'));
}

exports.socketCheckAdminAuthenticated = (socket, next) => {
    if (socket.request.isAuthenticated()) { 
        if(socket.request.user.admin) return next();
        else return next(new Error('forbidden'));
    }
    next(new Error('unauthorized'));
}

exports.screenCodeCheck = (socket, next) => {
    // if ban return immediately
    if(socket.request.user.banned) return next(new Error(`Ban hammer lifted ${moment.duration(socket.request.user.banned_until - getCurrentUnix(), 'seconds').humanize(true)}`));

    const ses = socket.request.session;
    const req = socket.request;
    let connectionAttempts = req.user.connection_attempts;

    // check if were recently banned and reset to 0
    if(req.user.banned_until !== 0) {
        this.db.query(`
            UPDATE screencode
            SET connection_attempts = 0, banned_until = 0
            WHERE user_id = ${req.user.user_id}    
        `);
        connectionAttempts = 0;
    }
    // initialize session if empty
    if(!('screencode' in ses)){
        ses.screencode = {
            expires: getCurrentUnix() + parseInt(process.env.CODE_VALID_DURATION),
            correct: false
        }
    }
    // correctly entered screencode previously, accept
    if(ses.screencode.correct === true) return next();
    // correct screencode, accept
    if(checkScreenCode(socket.handshake.auth.token)){
        ses.screencode.correct = true;
        ses.screencode.expires = getCurrentUnix() + parseInt(process.env.CODE_VALID_DURATION);
        
        if(connectionAttempts > 0){
            this.db.query(`
                UPDATE screencode
                SET connection_attempts = 0
                WHERE user_id = ${req.user.user_id}    
            `);
        }

        // todo add promise to save
        //like: req.session.save(function(err) {console.log(err);}
        ses.save();
        return next();
    }

    // wrong screencode v
    connectionAttempts++;
    // above the connection limit, ban
    if(connectionAttempts >= parseInt(process.env.FAIL_2_BAN_ATTEMPTS)){
        this.db.query(`
            UPDATE screencode
            SET connection_attempts = ${connectionAttempts}, banned_until = ${getCurrentUnix() + parseInt(process.env.FAIL_2_BAN_DURATION)}
            WHERE user_id = ${req.user.user_id}    
        `);
        return next(new Error(`Ban hammer lifted ${moment.duration(socket.request.user.banned_until - getCurrentUnix(), 'seconds').humanize(true)}`));
    }
    //wrong code
    this.db.query(`
        UPDATE screencode
        SET connection_attempts = ${connectionAttempts}
        WHERE user_id = ${req.user.user_id}    
    `);
    return next(new Error("Invalid screencode"));
}