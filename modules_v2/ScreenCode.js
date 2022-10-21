// const { updateCodeAdminScreen } = require('./socket_endpoints/AdminScreen');
const { getCurrentUnix } = require('../utils/time-formatter');

let sessionStore;
const SUCCESS = true;
let recreateScreencodeInterval = setInterval(regenerateAuthToken, parseInt(process.env.CODE_REFRESH_INTERVAL)*1000);
let screenCode;
regenerateAuthToken();
setInterval(revokeExpiredRemotes, parseInt(process.env.CODE_VALID_FLUSHING_INTERVAL)*1000);

function regenerateAuthToken() {
    const setCode = parseInt(process.env.FORCE_CODE || -1);
    screenCode = setCode !== -1 ? setCode : Math.floor(1000 + Math.random() * 9000);
    eventBus.emit('new-screen-code', screenCode);
    logger.serverInfo(`New auth token: ${screenCode}`);
}

exports.getScreenCode = () => screenCode;
exports.setSessionStore = (store) => sessionStore = store;

exports.adminResetScreenCode = () => {
    logger.serverInfo(`Admin requested new auth token`);
    clearInterval(recreateScreencodeInterval);
    recreateScreencodeInterval = setInterval(regenerateAuthToken, parseInt(process.env.CODE_REFRESH_INTERVAL)*1000);
    regenerateAuthToken();
    // revoking all correct screencodes on this session
    sessionStore.all((err, sessions) => {
        const currenTime = getCurrentUnix();
        for (const [sessId, session] of Object.entries(sessions)) {
            if(!('screencode' in session)) continue;
            session.screencode = {
                expires: currenTime + parseInt(process.env.CODE_VALID_DURATION),
                correct: false
            };
            sessionStore.set(sessId, session);
        }
    });
    io.of('/socket/remote').disconnectSockets(true);
    return SUCCESS;
}

exports.checkScreenCode = (code) => {
    return parseInt(code) === screenCode;
}
//bug, socket that is already flushed throug sockets also gets flushed through the sessionstore
async function revokeExpiredRemotes(){
    const soks = await io.of('/socket/remote').fetchSockets();
    const currentTime = getCurrentUnix();
    let flushCount = 0;
    // finding all connected remotes and flushing+disconnecting
    soks.forEach((sock) => {
        if(sock.request.session.screencode.expires < currentTime && sock.request.session.screencode.correct ) {
            sock.request.session.screencode = {
                expires: currentTime + parseInt(process.env.CODE_VALID_DURATION),
                correct: false
            };
            sock.request.session.save();
            sock.disconnect(true);
            flushCount++;
        }
    });
    // flush al disconnected but expired remotes
    await new Promise((resolve)=> {
        sessionStore.all(async (err, sessions) => {
            const currenTime = getCurrentUnix();
            for (const [sessId, session] of Object.entries(sessions)) {
                if(!('screencode' in session)) continue;
                if(session.screencode.expires < currentTime && session.screencode.correct){
                    session.screencode = {
                        attempts: 0,
                        expires: currenTime + parseInt(process.env.CODE_VALID_DURATION),
                        correct: false,
                        // banned_until: -1
                    };
                    await new Promise((resolve)=> {
                        sessionStore.set(sessId, session, (cb) => {
                            resolve();
                        });
                    });
                    flushCount++;
                }
            }
            resolve();
        });
    });
    if(flushCount > 0) logger.serverInfo(`Flushed ${flushCount} sockets!`);
}
