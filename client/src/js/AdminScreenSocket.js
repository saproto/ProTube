import router from "@/router/index";
import { io } from "socket.io-client";

const serverUrl = `/socket/screen/admin`;

const socket = new io(serverUrl, {
  timeout: 5 * 1000,
  forceNew: false,
  withCredentials: true,
  reconnection: false,
});

socket.connect();

socket.on("connect_error", async (err) => {
  if (err.message == "unauthorized")
    router.push({ name: "Error", params: { errorcode: 401 } });
});

export default socket;
