import AsyncStorage from "@react-native-async-storage/async-storage";
import { jwtDecode } from "jwt-decode";
import { io } from "socket.io-client";
import { SOCKET_ENDPOINT } from "../constant";

let socket: any = null;

export const getSocket = () => {
  if (!socket) {
    socket = io(SOCKET_ENDPOINT, {
      autoConnect: true,
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 20000,
    });

    socket.on("connect", async () => {
      const token = await AsyncStorage.getItem("Authorization");
      if (token) {
        const decoded = jwtDecode(token) as any;
        socket.emit("login", decoded.id);
      }
    });
  }
  return socket;
};

export default getSocket();
