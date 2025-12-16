/** @format */

import mongoose from "mongoose";
import dotenv from "dotenv";
import colors from "colors";

// Import Models
import User from "../models/userModel.js";
import Event from "../models/eventModel.js";
import Registration from "../models/registrationModel.js";

// Import Data & Config
import connectDB from "../config/mongodb.js";
import { REGISTRATION_STATUS } from "../database/registrations.js"; // Import Enum

dotenv.config();
connectDB();

const importData = async () => {
  try {
    console.log("⏳ Đang tải dữ liệu Users và Events...".yellow);

    // Lấy danh sách Volunteer và Event
    const volunteers = await User.find({ role: "volunteer" });
    const events = await Event.find({});

    if (volunteers.length === 0 || events.length === 0) {
      console.log("❌ CẢNH BÁO: Cần chạy seederUser và seederEvent trước!".red);
      process.exit();
    }

    console.log("🧹 Đang dọn dẹp dữ liệu cũ...".yellow);
    await Registration.deleteMany();
    // Reset số liệu trong Event về 0
    await Event.updateMany(
      {},
      { $set: { volunteers: [], currentParticipants: 0 } }
    );

    console.log("🚀 Đang tạo dữ liệu đăng ký...".yellow);

    const allRegistrations = [];
    const eventUpdatePromises = [];

    // Duyệt qua từng sự kiện
    for (const event of events) {
      // Random số lượng người đăng ký (5 - 15 người)
      const numRegistrations = Math.floor(Math.random() * 11) + 5;

      // Lấy ngẫu nhiên volunteer
      const shuffledVolunteers = volunteers.sort(() => 0.5 - Math.random());
      const selectedVolunteers = shuffledVolunteers.slice(0, numRegistrations);

      const registeredVolunteerIds = []; // Danh sách người ĐÃ ĐƯỢC DUYỆT

      selectedVolunteers.forEach((vol) => {
        // Random trạng thái dựa trên Enum
        // 70% REGISTERED (Đã duyệt)
        // 20% WAITLISTED (Chờ duyệt)
        // 10% CANCELLED (Hủy)
        let status = REGISTRATION_STATUS.REGISTERED;
        const rand = Math.random();

        if (rand > 0.9) status = REGISTRATION_STATUS.CANCELLED;
        else if (rand > 0.7) status = REGISTRATION_STATUS.WAITLISTED;

        // Tạo ngày đăng ký ngẫu nhiên
        const registeredAt = new Date(event.startDate);
        registeredAt.setDate(
          registeredAt.getDate() - Math.floor(Math.random() * 5) - 1
        );

        // Đẩy vào mảng insert (KHÔNG CÓ NOTE)
        allRegistrations.push({
          userId: vol._id,
          eventId: event._id,
          status: status,
          registeredAt: registeredAt,
          // note: ... Đã bỏ theo yêu cầu
        });

        // Chỉ update vào Event nếu trạng thái là REGISTERED (Đã duyệt)
        if (status === REGISTRATION_STATUS.REGISTERED) {
          registeredVolunteerIds.push(vol._id);
        }
      });

      // Update Event
      event.volunteers = registeredVolunteerIds;
      event.currentParticipants = registeredVolunteerIds.length;
      eventUpdatePromises.push(event.save());

      console.log(
        `   -> Event "${event.title}": ${registeredVolunteerIds.length} approved / ${selectedVolunteers.length} total`
          .cyan
      );
    }

    // Lưu vào DB
    // await Registration.insertMany(allRegistrations);

    for (const reg of allRegistrations) {
      const doc = new Registration(reg);
      await doc.save(); 
    }
    await Promise.all(eventUpdatePromises);

    console.log(
      `✅ Đã tạo ${allRegistrations.length} lượt đăng ký thành công!`.green
        .inverse.bold
    );
    process.exit();
  } catch (error) {
    console.error(`❌ LỖI: ${error.message}`.red.inverse);
    process.exit(1);
  }
};

const destroyData = async () => {
  try {
    await Registration.deleteMany();
    await Event.updateMany(
      {},
      { $set: { volunteers: [], currentParticipants: 0 } }
    );
    console.log("🔥 Đã xóa toàn bộ dữ liệu Registration!".red.inverse);
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
