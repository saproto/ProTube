import { eventBus } from '@/js/eventbus';
import router from '@/router/index'
const io = window.io = require('socket.io-client');

export let socket;
// eslint-disable-next-line
let silentConnect = false;


export function resetSocket(pincode){
    const serverUrl = `${process.env.VUE_APP_SOCKET_ADDRESS}/socket/remote`;
    socket = new io(serverUrl, {
        auth: {
            token: pincode //socket handshake token
        },
        timeout: 5*1000,
        forceNew: false,
        withCredentials: true,
        reconnection: false,
        autoConnect: false,
    });
    // connectSocket();
    return;
}
//eslint-disable-next-line
function connectSocket(){
    socket.connect();

    socket.on("disconnect", () => {
        socket.disconnect();
        socket.removeAllListeners();
        eventBus.emit('remotesocket-disconnect');
    });

    socket.on("connect_error", async (err) => {
    console.log("Socket connect error: ");
    console.log(err.message);
    if(err.message == 'no_cookie_please_reconnect'){
        await fetch('https://localhost:3000/api/test');
        socket.connect();
    } if(err.message == 'unauthorized') {
        // await fetch('http://localhost:3000/api/auth/example');
        // location.href="/api/login";
        router.push({name: "Login"});
    }
});

    socket.on('connect', () => {
        console.log("connected!");
        eventBus.emit('remotesocket-connect-success', socket);
    });
}

// pincode entered, try to setup a connection
export function pinEntered(pincode){
    silentConnect = false;
    resetSocket(pincode);
}


// fetch YouTube videos from server
export function fetchVideosSocket(query) {
    return new Promise(resolve => {
        socket.emit('fetch-videos', query, result => {
            resolve(result);
        });
    });
}

export function fetchThenAddVideoSocket(videoId) {
    return new Promise(resolve => {
        socket.emit('fetch-then-add-video', videoId, result => {
            resolve(result);
        });
    });
}

export function fetchThenAddPlaylistSocket(playlistId) {
    return new Promise(resolve => {
        socket.emit('fetch-then-add-playlist', playlistId, result => {
            resolve(result);
        });
    });
}

// trying to add a video to the queue
export { addVideoToQueueSocket }
async function addVideoToQueueSocket(video){
    return await new Promise( resolve => {
        socket.emit('add-video-to-queue', video, callback => {
            resolve({
                result: callback.success,
                message: callback.error,
                videoId: video.videoId
            });
        });
    });
}

// // exiting the page, kill the socket
// export function killSocket(){
//     socket.disconnect();
// }

// Executed once on mounted of remote
export function silentRemoteConnect(){
    silentConnect = true;
    resetSocket();
}
