const io = window.io = require('socket.io-client');
export let socket;

export function connectSocket(){
    console.log("Instantiating a connection");
    const serverUrl = `https://localhost:3000/socket/test`;
    socket = new io(serverUrl, {
        timeout: 5*1000,
        forceNew: true,
        withCredentials: true,
        reconnection: false,
        autoConnect: true,
    });

    socket.on("disconnect", (reason) => {
        console.log("Socket disconnect reason: ");
        console.log(reason);
        if(reason == 'io server disconnect') {
            socket.disconnect();
            socket.removeAllListeners();
        }
    });

    // connection errors
    socket.on("connect_error", async (err) => {
        console.log("Socket connect error: ");
        console.log(err.message);
        if(err.message == 'no_cookie_please_reconnect'){
            await fetch('https://localhost:3000/api/test');
            socket.connect();
        } if(err.message == 'unauthorized') {
            // await fetch('http://localhost:3000/api/auth/example');
            location.href="/api/login";
        }
    });

    socket.on('connect', () => {
        console.log("Socket connected");
    });
}



















// const io = window.io = require('socket.io-client');
// export let socket;

// export function connectSocket(){
//     console.log("Instantiating a connection");
//     const serverUrl = `${process.env.VUE_APP_SOCKET_ADDRESS}/socket/test`;
//     socket = new io(serverUrl, {
//         timeout: 5*1000,
//         forceNew: true,
//         withCredentials: true,
//         reconnection: false,
//         autoConnect: true,
//     });

//     socket.on("disconnect", (reason) => {
//         console.log("Socket disconnect reason: ");
//         console.log(reason);
//         if(reason == 'io server disconnect') {
//             socket.disconnect();
//             socket.removeAllListeners();
//         }
//     });

//     // connection errors
//     socket.on("connect_error", async (err) => {
//         console.log("Socket connect error: ");
//         if(err.message == 'no_cookie_please_reconnect'){
//             await ('http://localhost:3000/api/test');
//             socket.connect();
//         }
//         console.log(err);
//     });

//     socket.on('connect', () => {
//         console.log("Socket connected");
//     });
// }