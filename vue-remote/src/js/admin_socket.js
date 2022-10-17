const io = window.io = require('socket.io-client');
export let socket;
import { eventBus } from '@/js/eventbus.js';

export function connectAdminSocket(){
    const serverUrl = `${process.env.VUE_APP_SOCKET_ADDRESS}/socket/remote/admin`;
    socket = new io(serverUrl, {
        timeout: 5*1000,
        forceNew: true,
        withCredentials: true,
        reconnection: false,
        autoConnect: true
    });

    socket.on("disconnect", (reason) => {
        let disconnectReason = 'Lost connection';
        if(reason == 'io server disconnect') {
            socket.disconnect();
            socket.removeAllListeners();
            disconnectReason = 'Session expired!';
        }
        eventBus.emit('adminsocket-disconnect', disconnectReason);
    });

    // connection errors
    socket.on("connect_error", (err) => {
        let reason = "Unable to connect to ProTube";
        if (err == "Error: Not authorized") {
            reason = "Unauthorized!";
        } else if(err == "Error: Unable to validate"){
            reason = "Login error!";
        }
        eventBus.emit('adminsocket-connect-error', reason);
    });

    socket.on('connect', () => {
        eventBus.emit('adminsocket-connect-success', socket);
    });
}

export function getScreenCode() {
    return new Promise(resolve => {
        socket.emit('get_screen_code', code => {
            resolve(code);
        });
    });
}

export function getPlayerStatusSocket() {
    return new Promise(resolve => {
        socket.emit('get-player-status', data => {
            resolve(data);
        });
    });
}

export function getVolumeSocket() {
    return new Promise(resolve => {
        socket.emit('get-volume', volume => {
            resolve(volume);
        });
    });
}

export function getUserDataSocket() {
    return new Promise(resolve => {
        socket.emit('get-user-data', userData => {
            resolve(userData);
        });
    });
}

export function removeVideoSocket(video) {
    return new Promise(resolve => {
        socket.emit('remove-video', video, success => {
            resolve(success);
        });
    });
}

export function getVideoQueueSocket(){
    return new Promise(resolve => {
        socket.emit('get-video-queue', (queue) => {
            resolve(queue);
        });
    });
}

export function regenScreenCodeSocket(){
    socket.emit('create-new-screen-code');
}

export function skipSocket() {
    return new Promise(resolve => {
        socket.emit('skip', (success) => {
            resolve(success);
        });
    });
}

export function setRadioSocket(radiostation){
    return new Promise( resolve => {
        socket.emit('set-radio', radiostation, callback => {
            resolve(callback);
        });
    });
}

export function playPauseSocket(){
    return new Promise( resolve => {
        socket.emit('play-pause', callback => {
            resolve(callback);
        });
    });
}

export function volumeChangeSocket(volume){
    return new Promise( resolve => {
        socket.emit('volume-change', volume, callback => {
            resolve(callback);
        });
    });
}

export function toggleRadioProtubeSocket() {
    return new Promise(resolve => {
        socket.emit('toggle-radio-protube', newStatus => {
            resolve(newStatus);
        });
    });
}

export function getRadioStationsSocket(){
    return new Promise( resolve => {
        socket.emit('get-all-radiostations', callback => {
            // setTimeout(async () => {
                resolve(callback);
            // }, 1000)
        });
    });
}