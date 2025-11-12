/** @format */

import express from "express";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
dotenv.config({ path: ".env.development.local" });

import authRoutes from "./routes/auth.routes.js";
import userRoutes from "./routes/user.routes.js";
import eventRoutes from "./routes/event.routes.js";
import registerForEvent from "./routes/registration.routes.js";
import attendanceRoutes from "./routes/attendance.routes.js";
import approvalRequestRoutes from "./routes/approvalRequest.routes.js";
import connectDB from "./config/mongodb.js";
import errorMiddleware from "./middlewares/error.middleware.js";
import cors from "cors";

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(cors());

app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/registrations", registerForEvent);
app.use("/api/attendances", attendanceRoutes);
app.use("/api/approval-requests", approvalRequestRoutes);

app.use(errorMiddleware);

app.listen(process.env.PORT, async () => {
  console.log(`API is running on http://localhost:${process.env.PORT}`);

  await connectDB(); //session commitTransaction() vào DB đang chạy
});
