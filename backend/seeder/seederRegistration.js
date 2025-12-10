/** @format */

import mongoose from "mongoose";
import dotenv from "dotenv";
import colors from "colors";

// 1. IMPORT MODELS
import User from "../models/userModel.js";
import Event from "../models/eventModel.js";
import Registration from "../models/registrationModel.js";

// 2. IMPORT CONFIG DB
import connectDB from "../config/mongodb.js";

// 3. CẤU HÌNH & KẾT NỐI
dotenv.config();
connectDB();

const importData = async () => {
  try {
    // --- DEBUG: Kiểm tra xem Model đã import đúng chưa ---
    if (!Event || typeof Event.find !== "function") {
      throw new Error(
        "LỖI IMPORT: Biến 'Event' chưa nhận được Model. Hãy kiểm tra lại tên file 'eventModel.js' (chữ hoa/thường) trong thư mục models."
      );
    }
    // ----------------------------------------------------

    console.log("1. Đang tải dữ liệu Users và Events...".yellow);

    // Lấy danh sách Volunteer
    const volunteers = await User.find({ role: "volunteer" });
    // Lấy danh sách Event
    const events = await Event.find({});

    if (volunteers.length === 0) {
      console.log("CẢNH BÁO: Không có volunteer nào trong DB.".red);
      process.exit();
    }
    if (events.length === 0) {
      console.log("CẢNH BÁO: Không có event nào trong DB.".red);
      process.exit();
    }

    console.log("2. Reset dữ liệu cũ...".yellow);
    // Xóa Registration cũ
    await Registration.deleteMany();
    // Reset số lượng trong Event về 0
    await Event.updateMany(
      {},
      { $set: { volunteers: [], currentParticipants: 0 } }
    );

    console.log("3. Đang đồng bộ Registration và Event...".yellow);

    const allRegistrations = [];
    const eventUpdatePromises = [];

    // Duyệt qua từng sự kiện
    for (const event of events) {
      // Random số lượng tham gia (từ 5 - 15 người)
      // Riêng sự kiện "Tao Đàn" (nếu có) thì fix cứng 19 người
      let numParticipants = Math.floor(Math.random() * 10) + 5;
      if (event.title && event.title.includes("Tao Đàn")) {
        numParticipants = 19;
      }

      // Xáo trộn volunteer và lấy n người
      const shuffled = volunteers.sort(() => 0.5 - Math.random());
      const selectedVolunteers = shuffled.slice(0, numParticipants);

      // Tạo object Registration cho từng người
      selectedVolunteers.forEach((vol) => {
        allRegistrations.push({
          userId: vol._id,
          eventId: event._id,
          status: "registered", // Mặc định là đã duyệt
          registeredAt: new Date(),
          completionStatus: "in-progress",
        });
      });

      // Cập nhật ngược lại vào Event (Để hiển thị đúng số lượng và mảng ID)
      event.volunteers = selectedVolunteers.map((v) => v._id);
      event.currentParticipants = selectedVolunteers.length;

      // Đẩy promise update vào mảng để chạy song song sau
      eventUpdatePromises.push(event.save());

      console.log(
        `   -> Event: "${event.title}" - ${selectedVolunteers.length} người.`
          .green
      );
    }

    // Thực thi lưu vào DB
    await Registration.insertMany(allRegistrations);
    await Promise.all(eventUpdatePromises);

    console.log("DỮ LIỆU ĐÃ ĐỒNG BỘ THÀNH CÔNG!".green.inverse);
    process.exit();
  } catch (error) {
    console.error(`LỖI: ${error.message}`.red.inverse);
    process.exit(1);
  }
};

const destroyData = async () => {
  try {
    await Registration.deleteMany();
    // Reset Event về 0 khi xóa registration
    await Event.updateMany(
      {},
      { $set: { volunteers: [], currentParticipants: 0 } }
    );

    console.log("Dữ liệu Registration đã bị xóa!".red.inverse);
    process.exit();
  } catch (error) {
    console.error(`${error}`.red.inverse);
    process.exit(1);
  }
};

if (process.argv[2] === "-d") {
  destroyData();
} else {
  importData();
}
