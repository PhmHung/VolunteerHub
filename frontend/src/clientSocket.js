/** @format */
import { io } from "socket.io-client";
const SOCKET_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

export const socket = io(SOCKET_URL, {
  autoConnect: false,
});

export const connectSocket = (user) => {
  if (!user?._id) return;

  if (!socket.connected) {
    socket.connect();

    socket.on("connect", () => {
      console.log("✅ Đã kết nối Socket thời gian thực");

      socket.emit("join", user._id);

      if (user.role === "admin") {
        //socket.emit("join", "admin");
        socket.emit("join-admin");
      }
    });
  }
};

export const disconnectSocket = () => {
  if (socket.connected) {
    socket.disconnect();
    console.log("❌ Đã ngắt kết nối Socket");
  }
};
