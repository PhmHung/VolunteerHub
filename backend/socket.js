/** @format */
import { Server } from "socket.io";

let io;

export const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: ["http://localhost:5173", "http://localhost:3000"],
      methods: ["GET", "POST", "PATCH", "PUT", "DELETE"],
      credentials: true,
    },
  });

  io.on("connection", (socket) => {
    console.log("🔌 Một người dùng đã kết nối:", socket.id);

    socket.on("join", (userId) => {
      if (userId) {
        socket.join(userId);
        console.log(`👤 User ${userId} đã tham gia phòng cá nhân`);
      }
    });

    socket.on("join-admin", () => {
      socket.join("admin");
      console.log("🛡️ Một Admin đã tham gia phòng quản trị");
    });

    socket.on("disconnect", () => {
      console.log("🔌 Người dùng đã ngắt kết nối");
    });
  });

  return io;
};

export const getIO = () => {
  if (!io) throw new Error("Socket.io chưa được khởi tạo!");
  return io;
};
