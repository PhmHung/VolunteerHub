/** @format */

import mongoose from "mongoose";
import dotenv from "dotenv";
import colors from "colors";
import bcrypt from "bcryptjs";

// Import Models
import User from "../models/userModel.js";
import Event from "../models/eventModel.js";
import Registration from "../models/registrationModel.js";
import ApprovalRequest from "../models/approvalRequestModel.js";

// Import Config
import connectDB from "../config/mongodb.js";

// Import Data
import usersData from "../database/user.js";
import eventsData from "../database/events.js"; // Giả sử file này có > 10 sự kiện

dotenv.config();
connectDB();

const importData = async () => {
  try {
    console.log("1. Xóa sạch dữ liệu cũ...".yellow);
    await Registration.deleteMany();
    await ApprovalRequest.deleteMany();
    await Event.deleteMany();
    await User.deleteMany();

    console.log("2. Tạo Users...".yellow);
    // Tạo user từ file data
    const createdUsers = await User.insertMany(usersData);

    // Lấy ra các role quan trọng
    const admin = createdUsers.find((u) => u.role === "admin");
    const managerA = createdUsers.find(
      (u) => u.userEmail === "managerA@example.com"
    );
    const managerB = createdUsers.find(
      (u) => u.userEmail === "managerB@example.com"
    );
    const volunteers = createdUsers.filter((u) => u.role === "volunteer");

    if (!managerA || !managerB) {
      throw new Error(
        "Cần có cả Manager A và Manager B trong file users.js để chia sự kiện."
      );
    }

    console.log(`   -> Manager A: ${managerA.userName}`);
    console.log(`   -> Manager B: ${managerB.userName}`);

    console.log("3. Tạo Events và Chia đều...".yellow);

    // Lấy 10 sự kiện mẫu đầu tiên
    const selectedEvents = eventsData.slice(0, 10);
    const createdEvents = [];

    for (let i = 0; i < selectedEvents.length; i++) {
      const eventInfo = selectedEvents[i];

      // CHIA SỰ KIỆN: 5 cái đầu cho A, 5 cái sau cho B
      // (Hoặc chẵn/lẻ tùy ý, ở đây chia nửa đầu/nửa sau cho dễ kiểm tra)
      const isManagerA = i < 5;
      const owner = isManagerA ? managerA : managerB;

      // Random số lượng tham gia (5-15 người)
      let numParticipants = Math.floor(Math.random() * 10) + 5;
      // Riêng sự kiện "Tao Đàn" (nếu có) thì fix 19 người
      if (eventInfo.title.includes("Tao Đàn")) numParticipants = 19;

      // Chọn volunteer ngẫu nhiên
      const shuffledVols = volunteers.sort(() => 0.5 - Math.random());
      const selectedVols = shuffledVols.slice(0, numParticipants);
      const volunteerIds = selectedVols.map((v) => v._id);

      // Tạo Event
      const newEvent = new Event({
        ...eventInfo,
        createdBy: owner._id,
        managers: [owner._id], // Chỉ owner quản lý
        volunteers: volunteerIds, // Lưu mảng ID vào event
        currentParticipants: numParticipants,
        status: "approved", // Mặc định approved để test Dashboard
      });

      // Tạo Approval Request (cho đúng quy trình)
      const approval = await ApprovalRequest.create({
        event: newEvent._id,
        requestedBy: owner._id,
        status: "approved",
        reviewedBy: admin._id,
        reviewedAt: new Date(),
      });
      newEvent.approvalRequest = approval._id;

      // Lưu Event
      const savedEvent = await newEvent.save();
      createdEvents.push(savedEvent);

      // TẠO REGISTRATION (Quan trọng để hiển thị danh sách)
      const registrationDocs = selectedVols.map((vol) => ({
        userId: vol._id,
        eventId: savedEvent._id,
        status: "registered",
        registeredAt: new Date(),
        completionStatus: "in-progress",
      }));

      if (registrationDocs.length > 0) {
        await Registration.insertMany(registrationDocs);
      }

      console.log(
        `   -> Event [${i + 1}]: "${savedEvent.title}" thuộc về [${
          owner.userName
        }] (${numParticipants} người)`.green
      );
    }

    console.log("------------------------------------------------".cyan);
    console.log("SEED THÀNH CÔNG!".green.inverse.bold);
    console.log("Test Case:");
    console.log(
      "1. Login 'managerA@example.com' (Pass: MP456@) -> Thấy 5 sự kiện đầu."
    );
    console.log(
      "2. Login 'managerB@example.com' (Pass: MP456@) -> Thấy 5 sự kiện sau."
    );
    process.exit();
  } catch (error) {
    console.error(`LỖI: ${error.message}`.red.inverse);
    process.exit(1);
  }
};

const destroyData = async () => {
  // ... (Code xóa giống các file trước)
};

if (process.argv[2] === "-d") {
  destroyData();
} else {
  importData();
}
