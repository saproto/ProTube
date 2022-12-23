// this is dedicated to the logging of protube
// It automatically cycles log files and creates a new file every day
// All system errors/ manually thrown errors are also thrown into a special log

require("colors");
require("winston-daily-rotate-file");
const winston = require("winston");

let fileRotationTransport = new winston.transports.DailyRotateFile({
  level: "info",
  filename: "%DATE%-protube.log",
  datePattern: "YYYY-MM-DD",
  zippedArchive: false,
  dirname: process.env.LOGDIR,
  maxSize: "20m",
  maxFiles: process.env.LOG_RETENTION_DAYS + "d",
});

let errorFileRotationTransport = new winston.transports.DailyRotateFile({
  level: "error",
  filename: "%DATE%-protube-error.log",
  datePattern: "YYYY-MM-DD",
  zippedArchive: false,
  dirname: process.env.LOGDIR + "/errors",
  maxSize: "20m",
  maxFiles: process.env.LOG_RETENTION_DAYS + "d",
});

let dbFileRotationTransport = new winston.transports.DailyRotateFile({
  level: "info",
  filename: "%DATE%-protube-db.log",
  datePattern: "YYYY-MM-DD",
  zippedArchive: true,
  dirname: process.env.LOGDIR + "/db",
  maxSize: "20m",
  maxFiles: process.env.LOG_RETENTION_DAYS + "d",
});

let color = winston.format.uncolorize();
// Dev mode: log with colors into console except for logging to files
if (process.env.NODE_ENV !== "production") {
  fileRotationTransport = new winston.transports.Console();
  color = winston.format.colorize();
}

const logFormat = winston.format.combine(
  color,
  winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
  winston.format.printf((info) => {
    return `${info.timestamp} - ${info.message}`;
  })
);

const logger = winston.createLogger({
  transports: [fileRotationTransport, errorFileRotationTransport],
  format: logFormat,
});
const dbLogger = winston.createLogger({
  transports: [dbFileRotationTransport],
  format: logFormat,
});

let prefix = {
  server: "[SERVER]       ".yellow,
  screen: "[SCREEN]       ".magenta,
  youtube: "[YOUTUBE]      ".red,
  client: "[REMOTECLIENT] ".blue,
  admin: "[ADMIN]        ".gray,
  user: "[USER]         ".green,
  queue: "[QUEUE]        ".yellow,
  localClient: "[LOCALCLIENT]  ".cyan,
  session: "[SESSIONSTORE] ".blue,
};

exports.serverInfo = (message) => {
  log(prefix.server + message);
};

exports.serverError = (message) => {
  log(prefix.server + message.red, true);
};

exports.screenInfo = (message) => {
  log(prefix.screen + message.brightMagenta);
};

exports.youtubeInfo = (message) => {
  log(prefix.youtube + message);
};

exports.clientInfo = (message) => {
  log(prefix.client + message);
};

exports.adminInfo = (message) => {
  log(prefix.admin + message);
};

exports.userInfo = (message) => {
  log(prefix.user + message);
};

exports.queueInfo = (message) => {
  log(prefix.queue + message.yellow);
};

exports.localClientInfo = (message) => {
  log(prefix.localClient + message);
};

exports.sessionStoreInfo = (message) => {
  log(prefix.session + message);
};

exports.dbLog = (message) => {
  dbLogger.info(message);
};

function log(message, error = false) {
  if (error) logger.error(message);
  else logger.info(message);
}

this.serverInfo(
  `----------------------- Starting ProTube server -----------------------`
);

// Catch all and log system crashes
process.on("uncaughtException", (err) => {
  logger.error(`[SEVERE ERROR] ${err}`);
  logger.error(err.stack);
  process.exitCode = 1;
  // wait for logger flush
  setTimeout(() => {
    console.log(
      `Program crashed of uncaught exception, see the logs at ${new Date().toLocaleString()}!`
    );
    process.exit(1);
  }, 500);
});

// Log all exits of the program
process.on("exit", (code) => {
  this.serverInfo(
    `----------------------- ProTube server exited with exit code ${code} -----------------------`
  );
  dbLogger.end();
  logger.end();
});

// Add signal listeners
["SIGINT", "SIGTERM", "SIGQUIT"].forEach((signal) => {
  process.on(signal, (code) => {
    process.exit(code);
  });
});
