const session = require("express-session");
const { sequelize, ScreenCode } = require("./DataBase");
const SequelizeStore = require("connect-session-sequelize")(session.Store);
const { getCurrentUnix } = require("../utils/time-formatter");
const { checkScreenCode, setSessionStore } = require("./ScreenCode");
const moment = require("moment");
require("passport");

const sessionStore = new SequelizeStore({ db: sequelize, table: "sessions" });
setSessionStore(sessionStore);

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
  else if (socket.handshake.address === `::ffff:127.0.0.1`) return next();
  next(new Error("unauthorized"));
};

exports.screenCodeCheck = async (socket, next) => {
  // if ban return immediately
  if (socket.request.user.screencode.banned)
    return next(
      new Error(
        `Your ban is lifted ${moment
          .duration(
            socket.request.user.screencode.banned_until - getCurrentUnix(),
            "seconds"
          )
          .humanize(true)}`
      )
    );

  const ses = socket.request.session;
  const req = socket.request;
  let connectionAttempts = req.user.screencode.connection_attempts;

  // check if were recently banned and reset to 0
  if (req.user.screencode.banned_until !== 0) {
    await ScreenCode.update(
      { banned_until: 0, connection_attempts: 0 },
      { where: { user_id: req.user.id } }
    );
    connectionAttempts = 0;
  }
  // initialize session if empty
  if (!("screencode" in ses)) {
    ses.screencode = {
      expires: getCurrentUnix() + parseInt(process.env.CODE_VALID_DURATION),
      correct: false,
    };
  }
  // correctly entered screencode previously or user is admin, accept
  if (ses.screencode.correct === true || socket.request.user.admin === true)
    return next();
  // correct screencode, accept
  if (checkScreenCode(socket.handshake.auth.token)) {
    ses.screencode.correct = true;
    ses.screencode.expires =
      getCurrentUnix() + parseInt(process.env.CODE_VALID_DURATION);

    if (connectionAttempts > 0)
      await ScreenCode.update(
        { connection_attempts: 0 },
        { where: { user_id: req.user.id } }
      );

    ses.save();
    return next();
  }

  // wrong screencode v
  connectionAttempts++;
  // above the connection limit, ban
  if (connectionAttempts >= parseInt(process.env.FAIL_2_BAN_ATTEMPTS)) {
    logger.clientInfo(
      `Banned user: ${req.user.id} until ${
        getCurrentUnix() + parseInt(process.env.FAIL_2_BAN_DURATION)
      }`
    );
    await ScreenCode.update(
      {
        banned_until:
          getCurrentUnix() + parseInt(process.env.FAIL_2_BAN_DURATION),
        connection_attempts: connectionAttempts,
      },
      { where: { user_id: req.user.id } }
    );
    return next(
      new Error(
        `Your ban is lifted ${moment
          .duration(parseInt(process.env.FAIL_2_BAN_DURATION), "seconds")
          .humanize(true)}`
      )
    );
  }
  //wrong code
  await ScreenCode.update(
    { connection_attempts: connectionAttempts },
    { where: { user_id: req.user.id } }
  );
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
