const session = require("express-session");
const MySQLStore = require('express-mysql-session')(session);
const mysql = require('mysql2');
const { getCurrentUnix } = require('../utils/time-formatter');
const { checkScreenCode, setSessionStore } = require('./ScreenCode');
require('passport')

//database setup
const dbOptions = {
    connectionLimit: 2,
    host     : 'localhost',
    user     : 'root',
    password : 'root',
    port     : 3636,
    database : 'pt'
};
exports.db = mysql.createPool(dbOptions);
exports.sessionStore = new MySQLStore({
    clearExpired: true,
    checkExpirationInterval: 10*1000,
}, this.db.promise());
setSessionStore(this.sessionStore);

exports.sessionMiddleware = session({
    secret: "changeit",
    name: "protube",
    resave: false,
    store: this.sessionStore,
    saveUninitialized: false,
    cookie: {
        maxAge: 1500 * 1000
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
    const ses = socket.request.session;
    if(!('screencode' in ses)){
        ses.screencode = {
            attempts: 0,
            expires: getCurrentUnix() + parseInt(process.env.CODE_VALID_DURATION),
            correct: false
        }
    }
    if(ses.screencode.correct === true) return next();
    ses.screencode.attempts++;
    if(ses.screencode.attempts < 5 && checkScreenCode(socket.handshake.auth.token)){
        ses.screencode.correct = true;
        ses.screencode.expires = getCurrentUnix() + parseInt(process.env.CODE_VALID_DURATION),
        ses.save();
        return next();
    }
    ses.save();
    return next(new Error("Invalid screencode"));
}
