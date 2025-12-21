/** @format */
import express from "express";
import http from "http"; // 1. Thêm import http
import { initSocket } from "./socket.js"; // 2. Thêm import initSocket
import webpush from "web-push";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import cors from "cors";

// Import Routes
import authRoutes from "./routes/auth.routes.js";
import channelRoutes from "./routes/channel.routes.js";
import commentRoutes from "./routes/comment.routes.js";
import postRoutes from "./routes/post.routes.js";
import reactionRoutes from "./routes/reaction.routes.js";
import userRoutes from "./routes/user.routes.js";
import pushRoutes from "./routes/pushSubscription.routes.js";
import eventRoutes from "./routes/event.routes.js";
import registrationRoutes from "./routes/registration.routes.js";
import attendanceRoutes from "./routes/attendance.routes.js";
import approvalRequestRoutes from "./routes/approvalRequest.routes.js";

import connectDB from "./config/mongodb.js";
import errorMiddleware from "./middlewares/error.middleware.js";

dotenv.config({ path: ".env.development.local" });

// --- KHỞI TẠO APP (PHẢI NẰM ĐẦU TIÊN) ---
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

// --- KHỞI TẠO SERVER & SOCKET (PHẢI SAU KHI CÓ APP) ---
const server = http.createServer(app);
const io = initSocket(server);

// Middleware để gắn io vào mọi request (Controller có thể dùng req.io)
app.use((req, res, next) => {
  req.io = io;
  next();
});

// Cấu hình Web Push
webpush.setVapidDetails(
  "mailto:" + process.env.SMTP_USER,
  process.env.PUBLIC_VAPID_KEY,
  process.env.PRIVATE_VAPID_KEY
);

// --- CÁC ROUTE API ---
app.use("/api/auth", authRoutes);
app.use("/api/channel", channelRoutes);
app.use("/api/comment", commentRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/post", postRoutes);
app.use("/api/reaction", reactionRoutes);
app.use("/api/user", userRoutes);
app.use("/api/push", pushRoutes);
app.use("/api/registrations", registrationRoutes);
app.use("/api/attendances", attendanceRoutes);
app.use("/api/approval-requests", approvalRequestRoutes);

// Error Middleware (Luôn nằm cuối cùng của các app.use)
app.use(errorMiddleware);

// --- CHẠY SERVER BẰNG server.listen (THAY CHO app.listen) ---
const PORT = process.env.PORT || 5000;
server.listen(PORT, async () => {
  console.log(`🚀 API & Socket server đang chạy tại: http://localhost:${PORT}`);
  await connectDB();
});
