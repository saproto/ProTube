import router from "@/router/index";
import { io } from "socket.io-client";

const serverUrl = `/socket/remote/admin`;

const socket = new io(serverUrl, {
  timeout: 5 * 1000,
  forceNew: false,
  withCredentials: true,
  reconnection: false,
  autoConnect: false,
});

export const connectSocket = () => {
  socket.connect();
};

socket.on("connect_error", async (err) => {
  if (err.message === "unauthorized") router.push({ name: "Login" });
});

export default socket;
