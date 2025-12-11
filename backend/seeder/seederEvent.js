/** @format */

import mongoose from "mongoose";
import dotenv from "dotenv";
import colors from "colors";

import eventsData from "../database/events.js";
import User from "../models/userModel.js";
import Event from "../models/eventModel.js";
import ApprovalRequest from "../models/approvalRequestModel.js";
import connectDB from "../config/mongodb.js";

dotenv.config();
connectDB();

const importData = async () => {
  try {
    const manager = await User.findOne({ role: "manager" });
    const admin = await User.findOne({ role: "admin" });
    const allVolunteers = await User.find({ role: "volunteer" });

    if (!manager)
      throw new Error("Không tìm thấy manager! Hãy chạy seederUser.js trước");
    if (!admin) throw new Error("Không tìm thấy admin!");

    console.log(`Tìm thấy manager: ${manager.userName}`.cyan);
    console.log(`Tìm thấy ${allVolunteers.length} tình nguyện viên`.cyan);

    await Event.deleteMany({});
    await ApprovalRequest.deleteMany({});
    console.log("Đã xóa Events + ApprovalRequests cũ".yellow);

    const createdEvents = [];

    for (const e of eventsData) {
      const volunteerCount = e.maxParticipants
        ? Math.floor(Math.random() * (e.maxParticipants * 0.7)) + 5 // 5 → ~70%
        : Math.floor(Math.random() * 30) + 5;

      const shuffled = allVolunteers.sort(() => 0.5 - Math.random());
      const selectedVolunteers = shuffled
        .slice(0, volunteerCount)
        .map((v) => v._id);

      const event = await Event.create({
        ...e,
        createdBy: manager._id,
        managers: [manager._id],
        volunteers: selectedVolunteers,
        currentParticipants: selectedVolunteers.length,
      });

      const approval = await ApprovalRequest.create({
        event: event._id,
        requestedBy: manager._id,
        status: e.status || "pending",
        reviewedBy: e.status === "approved" ? admin._id : null,
        reviewedAt: e.status === "approved" ? new Date() : null,
        adminNote: e.status === "approved" ? "Duyệt tự động" : null,
      });

      event.approvalRequest = approval._id;
      await event.save();

      createdEvents.push(event);
    }

    console.log(
      `SEED EVENT THÀNH CÔNG! Đã tạo ${createdEvents.length} sự kiện với manager & volunteer thật!`
        .green.inverse.bold
    );
    process.exit(0);
  } catch (err) {
    console.error(`${err.message}`.red.inverse);
    process.exit(1);
  }
};

const destroyData = async () => {
  try {
    await Event.deleteMany({});
    await ApprovalRequest.deleteMany({});
    console.log("Events & ApprovalRequests đã bị xóa!".red.inverse);
    process.exit();
  } catch (err) {
    console.error(`${err}`.red.inverse);
    process.exit(1);
  }
};

if (process.argv[2] === "-d") {
  destroyData();
} else {
  importData();
}
