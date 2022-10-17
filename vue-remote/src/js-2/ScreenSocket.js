const io = window.io = require('socket.io-client');

const serverUrl = `${process.env.VUE_APP_SOCKET_ADDRESS}/socket/screen`;

const socket = new io(serverUrl, {
    timeout: 5*1000,
    forceNew: false,
    withCredentials: true,
    reconnection: false,
    autoConnect: false,
});

export const connectSocket = () => {
    console.log("triggered connect");
    socket.connect();
};

// socket.on("disconnect", () => {
//     // socket.disconnect();
//     // socket.removeAllListeners();
// });

socket.on("connect_error", async (err) => {
    console.log("v2:");
    console.log("Socket connect error: ");
    console.log(err);
    // if(err.message == 'unauthorized') router.push({name: "Login"});
});

export default socket;