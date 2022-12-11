const session = require("express-session");
const { sequelize, ScreenCode, User } = require("./DataBase");
const SequelizeStore = require("connect-session-sequelize")(session.Store);
const { getCurrentUnix } = require("../utils/time-formatter");
const { checkScreenCode } = require("./ScreenCode");
const moment = require("moment");
require("passport");

const sessionStore = new SequelizeStore({ db: sequelize, table: "sessions" });

exports.sessionMiddleware = session({
  secret: process.env.SESSION_SECRET,
  name: process.env.SESSION_NAME,
  resave: false,
  store: sessionStore,
  saveUninitialized: false,
  cookie: {
    maxAge: parseInt(process.env.SESSION_DURATION) * 1000,
  },
});

exports.checkAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect("/login");
};

exports.socketCheckAuthenticated = (socket, next) => {
  if (socket.request.isAuthenticated()) return next();
  next(new Error("unauthorized"));
};

exports.socketCheckAdminAuthenticated = (socket, next) => {
  if (socket.request.isAuthenticated()) {
    if (socket.request.user.admin) return next();
    else return next(new Error("forbidden"));
  }
  // accept localhost connections also to be admin (local client)
  else if (socket.handshake.address === process.env.LOCAL_CLIENT_IP) return next();
  next(new Error("unauthorized"));
};


exports.screenCodeCheck = async (socket, next) => {
  const user = socket.request.user;

  // if ban return immediately
  if (user.isBanned()) {
    return next(
      new Error(
        `Your ban is lifted ${moment
          .duration(
            user.banned_until - getCurrentUnix(),
            "seconds"
          )
          .humanize(true)}`
      )
    );
  }

  // Always accept admins and previously validated remotes
  if(user.hasValidRemote()) return next()

  // Correct screencode, accept socket
  if (checkScreenCode(socket.handshake.auth.token)) {
    user.setValidRemote();
    user.save();
    return next();
  }

  // User reached connection attempt limit, ban him!
  if (user.connection_attempts >= parseInt(process.env.FAIL_2_BAN_ATTEMPTS)) {
    user.setBanned();
    user.save();
    logger.clientInfo(
      `Banned user: ${user.id} until ${
        getCurrentUnix() + parseInt(process.env.FAIL_2_BAN_DURATION)
      }`
    );
    return next(
      new Error(
        `Your ban is lifted ${moment
          .duration(parseInt(process.env.FAIL_2_BAN_DURATION), "seconds")
          .humanize(true)}`
      )
    );
  }
  
  // User not bannable or valid = wrong entered screencode
  user.connectionAttemptsPlusOne();
  user.save();
  return next(new Error("Invalid screencode"));
};

exports.checkBearerToken = (req, res, next) => {
  if (req.token === process.env.PROTUBE_API_SECRET) return next();
  return res.status(401).json({
    success: false,
    message: "Not Authorized for this API",
  });
};

exports.checkLocalClientToken = (socket, next) => {
  next(new Error("Invalid token!"));
};
