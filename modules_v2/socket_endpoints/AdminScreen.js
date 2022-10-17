const endpoint = io.of('/socket/screen/admin');
const { socketCheckAdminAuthenticated } = require('../Middlewares');
const { getScreenCode } = require('../ScreenCode');
const { getVolume } = require('../PlaybackManager');

endpoint.use(socketCheckAdminAuthenticated);

endpoint.on('connection', (socket) => {
    logger.screenInfo(`Admin Screen connected from ${socket.handshake.address} with socket id ${socket.id}`);
    
    socket.on('disconnect', (error) => {
        logger.screenInfo(`Disconnected socket: ${socket.id}`);
    });

    socket.emit('get-volume-code', {
            volume: getVolume(),
            screencode: getScreenCode()
    });

    socket.on('get-screen-code', (callback) => {
        logger.adminInfo(`Requested the screen code: ${socket.id}`);
        callback(getScreenCode());
    });
    
});

eventBus.on('volume-update', (newVolume)=> { endpoint.emit('volume-update', newVolume) });
eventBus.on('new-screen-code', (screenCode) => { endpoint.emit('new-screen-code', screenCode) });
// exports.updateCodeAdminScreen = (newCode) => endpoint.emit('new-screen-code', newCode);
