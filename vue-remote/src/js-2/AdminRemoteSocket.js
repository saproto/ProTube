import router from '@/router/index'
const io = window.io = require('socket.io-client');

const serverUrl = `${process.env.VUE_APP_SOCKET_ADDRESS}/socket/remote/admin`;

const socket = new io(serverUrl, {
    timeout: 5*1000,
    forceNew: false,
    withCredentials: true,
    reconnection: false,
    autoConnect: false,
});

export const connectSocket = () => {
    socket.connect();
};

socket.on("disconnect", () => {
    socket.disconnect();
    // socket.removeAllListeners();
});

socket.on("connect_error", async (err) => {
    console.log("v2:");
    console.log("Admin Socket connect error: ");
    if(err.message == 'unauthorized') router.push({name: "Login"});
});

export default socket;