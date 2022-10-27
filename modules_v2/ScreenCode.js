// const { updateCodeAdminScreen } = require('./socket_endpoints/AdminScreen');
const { getCurrentUnix } = require('../utils/time-formatter');
const { sequelize, Session } = require('./DataBase');

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

// flushing all expired remotes and disconnecting currently connected sockets
async function revokeExpiredRemotes(){
    const sockets = await io.of('/socket/remote').fetchSockets();
    const currentTime = getCurrentUnix();
    let flushCount = 0;
    // finding all connected remotes and flushing+disconnecting
    for (const sock of sockets){
        if(sock.request.session.screencode.expires < currentTime && sock.request.session.screencode.correct ) {
            sock.request.session.screencode = {
                expires: currentTime + parseInt(process.env.CODE_VALID_DURATION),
                correct: false
            };
            await new Promise(resolve => {
                sock.request.session.save(resolve);
            });
            sock.disconnect(true);
            flushCount++;
        }
    };

    const sessionIDs = await Session.findAll({ attributes: ['sid'] });

    const currenTime = getCurrentUnix();
    // flushing all currently disconnected sockets
    for (const session of sessionIDs){
        const sid = session.sid;
        const sessData = await new Promise((resolve) => {
            const cb = (rej, res) => resolve(res);
            sessionStore.get(sid, cb);
        });
        if(!('screencode' in sessData)) continue;
        // valid screencode has expired
        if(sessData.screencode.expires < currentTime && sessData.screencode.correct) {
            sessData.screencode = {
                expires: currentTime + parseInt(process.env.CODE_VALID_DURATION),
                correct: false
            }
            await new Promise((resolve) => {
                const cb = (rej, res) => resolve(res);
                sessionStore.set(sid, sessData, cb);
            });
            flushCount++;
        }
    };
    if(flushCount > 0) logger.serverInfo(`Flushed ${flushCount} sockets!`);
}
