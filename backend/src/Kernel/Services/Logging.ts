import winston from 'winston';
import 'winston-daily-rotate-file';
import type DailyRotateFile from 'winston-daily-rotate-file';
import c from '#Config.js';
import colors from 'colors/safe.js';

let logOutPut: DailyRotateFile | winston.transports.ConsoleTransportInstance = new winston.transports.DailyRotateFile({
    level: 'debug',
    filename: '%DATE%-protube.log',
    datePattern: 'YYYY-MM-DD',
    zippedArchive: true,
    dirname: c.logging.path,
    maxSize: '20m',
    maxFiles: c.logging.retention_days.toString() + 'd'
});

const prefixes = {
    QUEUE: colors.yellow('QUEUE'),
    OAUTH: colors.red('OAUTH'),
    API: colors.yellow('API'),
    PLAYBACKHANDLER: colors.cyan('PLAYBACKHANDLER'),
    USERSOCKET: colors.green('USERSOCKET'),
    ADMINSOCKET: colors.gray('ADMINSOCKET'),
    REDIS: colors.red('REDIS')
};

const logLevels = {
    DEBUG: 0,
    INFO: 1,
    ERROR: 2
};

type availableLogLabels = keyof typeof prefixes;

let color = winston.format.uncolorize();
let timestampFormat = 'YYYY-MM-DD HH:mm:ss';
let logLevel = logLevels.INFO;

// Dev mode: log with colors into console except for logging to files + different timestamp format
if (c.env.development) {
    logOutPut = new winston.transports.Console({ level: 'debug' });
    color = winston.format.colorize();
    timestampFormat = 'HH:mm:ss';
    logLevel = logLevels.DEBUG;
}

const logFormat = winston.format.combine(
    color,
    winston.format.timestamp({ format: timestampFormat }),
    winston.format.printf((info) => {
        // eslint-disable-next-line
        return `${info.timestamp} ${info.message}`;
    })
);

const logger = winston.createLogger({
    transports: [logOutPut],
    format: logFormat
});

logger.info(
    '----------------------- Starting ProTube server -----------------------'
);

// Log all exits of the program
process.on('exit', (code) => {
    logger.info(
        `----------------------- ProTube server exited with exit code ${code} -----------------------`
    );
    logger.close();
});

process.on('uncaughtExceptionMonitor', (err, origin) => {
    console.error('Uncaught Exception with monitoring:', err, 'Origin:', origin);
    // Perform cleanup or logging actions
    logger.close();
    process.exit(1);
});

// Add signal listeners
['SIGINT', 'SIGTERM', 'SIGQUIT'].forEach((signal) => {
    process.on(signal, (stringCode: string, code: number) => {
        console.log(`Received ${stringCode} with code ${code}`);
        process.exit(code);
    });
});

function formatLog (prefix: availableLogLabels, message: string): string {
    return `[${prefixes[prefix]}] ${message}`;
}

const log = {
    debug: (prefix: availableLogLabels, message: string, meta?: any[]) => logLevel === logLevels.DEBUG ? logger.debug(formatLog(prefix, message), meta) : null,
    info: (prefix: availableLogLabels, message: string, meta?: any[]) => logLevel <= logLevels.INFO ? logger.info(formatLog(prefix, message), meta) : null,
    error: (prefix: availableLogLabels, message: string, meta?: any[]) => logLevel <= logLevels.ERROR ? logger.error(formatLog(prefix, message), meta) : null
};

export default log;
