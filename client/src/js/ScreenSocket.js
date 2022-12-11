import { io } from "socket.io-client";

const serverUrl = `/socket/screen`;

const socket = new io(serverUrl, {
  timeout: 5 * 1000,
  forceNew: false,
  reconnection: false,
  autoConnect: false,
});

export const connectSocket = () => {
  socket.connect();
};

export default socket;
