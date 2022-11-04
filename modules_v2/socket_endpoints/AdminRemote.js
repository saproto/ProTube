const endpoint = io.of('/socket/remote/admin');
const { socketCheckAdminAuthenticated } = require('../Middlewares')
const { getVolume, playRadio, playPause, getPlayerMode, skipVideo, toggleType, playNextVideo, setVolume, getPlayerType, } = require('../PlaybackManager');
const { adminResetScreenCode } = require('../ScreenCode');
const radio = require('../RadioStations');
const queueManager = require('../QueueManager');

endpoint.use(socketCheckAdminAuthenticated);

endpoint.on('connection', (socket) => {
    logger.adminInfo(`Successfully connected - ${socket.id}`);

    socket.on('disconnect', () => {
        logger.adminInfo(`Disconnected admin socket: ${socket.id}`)
    });

    socket.on('get-queue', (callback) => {
        callback({
            queue: queueManager.getQueue(),
            duration: queueManager.getTotalDuration()
        });
    });

    socket.on('get-radiostations', (callback) => {
        callback(radio.getAllRadioStations());
    });

    // change the screen's volume 
    socket.on('get-player-settings', (callback) => {
        callback({
            volume: getVolume(),
            playerMode: getPlayerMode(),
            playerType: getPlayerType()
        });
    });


    socket.on('reset-screen-code', (callback) => {
        logger.adminInfo(`${socket.id} Requested new screencode`);
        callback({success: adminResetScreenCode()});
    });

    socket.on('remove-video', (video, callback) => {
        logger.adminInfo(`${socket.id} Requested video removal of ${video.title}`)
        try {
            callback({success: queueManager.removeVideo(video.id)});
            updateAdminPanels();
        } catch (e) {
            callback(e.getInfo());
        }
      });
    
      socket.on('toggle-radio-protube', async (callback) => {
        logger.adminInfo(`${socket.id} Toggling protube or radio`);
        try {
            callback({success: toggleType()});
            updateAdminPanels();
        } catch (e) {
            callback(e.getInfo());
        }
      });
    
    socket.on('play-radio', (stationID, callback) => {
        logger.adminInfo(`${socket.id} Setting the radio to: ${stationID}`);
        try {
            callback({success: playRadio(stationID)});
            updateAdminPanels();
        } catch (e) {
            callback(e.getInfo());
        }
    });
    
    socket.on('play-pause', async (callback) => {
        logger.adminInfo(`${socket.id} Requested to play/pause the content`);
        try {
            callback({success: await playPause()});
            updateAdminPanels();
        } catch (e) {
            callback(e.getInfo());
        }
    });
    
    socket.on('skip-video', async (callback) => {
        logger.adminInfo(`${socket.id} Requested to skip a video`);
        try {
            callback({success: await playNextVideo()});
            updateAdminPanels();
        } catch (e) {
            callback(e.getInfo());
        }
    });
    
    // change the screen's volume 
    socket.on('set-new-volume', (volume, callback) => {
        logger.adminInfo(`${socket.id} Requested to change the volume to: ${volume}`);
        try {
            callback({success: setVolume(volume)});
            updateAdminPanels();
            eventBus.emit('volume-update', volume);
        } catch (e) {
            callback(e.getInfo());
        }
    });

    
});

eventBus.on('player-update', updateAdminPanels);

eventBus.on('queue-update', () => {
    endpoint.emit('queue-update', {
        queue: queueManager.getQueue(),
        duration: queueManager.getTotalDuration()
    });
});

function updateAdminPanels() {
    endpoint.emit('update-admin-panel', {
        volume: getVolume(),
        playerMode: getPlayerMode(),
        playerType: getPlayerType()
    });
}