// this is dedicated to the logging of protube
// It automatically cycles log files and creates a new file every day
// All system errors/ manually thrown errors are also thrown into a special log

require('colors');
require('winston-daily-rotate-file');
const winston = require('winston');

let fileRotationTransport = new winston.transports.DailyRotateFile({
    level: "info",
    filename: '%DATE%-protube.log',
    datePattern: 'YYYY-MM-DD',
    zippedArchive: true,
    dirname: process.env.LOGDIR,
    maxSize: '20m',
    maxFiles: process.env.LOG_RETENTION_DAYS+'d'
});

let errorFileRotationTransport = new winston.transports.DailyRotateFile({
    level: "error",
    filename: '%DATE%-protube-error.log',
    datePattern: 'YYYY-MM-DD',
    zippedArchive: true,
    dirname: process.env.LOGDIR+'/errors',
    maxSize: '20m',
    maxFiles: process.env.LOG_RETENTION_DAYS+'d'
});

let color = winston.format.uncolorize();
// Dev mode: log with colors into console except for logging to files
if (process.env.NODE_ENV !== "production") {
    fileRotationTransport = new winston.transports.Console();
    // errorFileRotationTransport = new winston.transports.Console();
    color = winston.format.colorize();
}

const logConfig = {
    transports: [
        fileRotationTransport,
        errorFileRotationTransport
    ],
    format: winston.format.combine(
        color,
        winston.format.timestamp({format: 'YYYY-MM-DD HH:mm:ss'}),
        winston.format.printf((info) => {
            return `${info.timestamp} - ${info.message}`;
        })
    )
};

const logger = winston.createLogger(logConfig);

let prefix = {
    server:         '[SERVER]       '.yellow,
    screen:         '[SCREEN]       '.magenta,
    youtube:        '[YOUTUBE]      '.red,
    client:         '[REMOTECLIENT] '.blue,
    admin:          '[ADMIN]        '.gray,
    user:           '[USER]         '.green,
    queue:          '[QUEUE]        '.brightYellow,
    localClient:    '[LOCALCLIENT]  '.cyan,
    session:        '[SESSIONSTORE] '.blue,
}

exports.serverInfo = message => {
    log(prefix.server + message);
};

exports.serverError = message => {
    log(prefix.server + message.red, true);
}

exports.screenInfo = message => {
    log(prefix.screen + message.brightMagenta);
}

exports.youtubeInfo = message => {
    log(prefix.youtube + message);
}

exports.clientInfo = message => {
    log(prefix.client + message);
}

exports.adminInfo = message => {
    log(prefix.admin + message);
}

exports.userInfo = message => {
    log(prefix.user + message);
}

exports.queueInfo = message => {
    log(prefix.queue + message.yellow);
}

exports.localClientInfo = message => {
    log(prefix.localClient + message);
}

exports.sessionStoreInfo = message => {
    log(prefix.session + message);
}

function log(message, error=false){
    if(error) logger.error(message);
    else logger.info(message);
}


// catch all system crashes etc
process.on('unhandledRejection', (reason, p) => {
    logger.error(reason, 'Unhandled Rejection at Promise', p);
  }).on('uncaughtException', err => {
    logger.error(err, 'Uncaught Exception thrown');
    process.exit(1);
  });