/** @format */

import mongoose from "mongoose";
import dotenv from "dotenv";
import colors from "colors";

// Import Models
import Registration from "../models/registrationModel.js";
import Attendance from "../models/attendanceModel.js";
import Event from "../models/eventModel.js"; // Đã import Event

// Import Data & Config
import connectDB from "../config/mongodb.js";
import { REGISTRATION_STATUS } from "../database/registrations.js";
import { ATTENDANCE_STATUS, sampleFeedbacks } from "../database/attendances.js";

dotenv.config();
connectDB();

const importData = async () => {
  try {
    console.log("⏳ Đang tìm các lượt đăng ký hợp lệ (REGISTERED)...".yellow);

    const validRegs = await Registration.find({
      status: REGISTRATION_STATUS.REGISTERED,
    }).populate("eventId");

    if (validRegs.length === 0) {
      throw new Error(
        "Không tìm thấy đăng ký nào trạng thái REGISTERED. Hãy chạy seederRegistration.js trước!"
      );
    }

    console.log("🧹 Đang dọn dẹp dữ liệu điểm danh cũ...".yellow);
    await Attendance.deleteMany({});

    // Reset rating của tất cả event về 0 trước khi tính lại
    await Event.updateMany({}, { $set: { averageRating: 0, ratingCount: 0 } });

    console.log("🚀 Đang tạo dữ liệu điểm danh & feedback...".yellow);
    const attendances = [];

    // Lưu lại danh sách các Event ID cần cập nhật rating
    const affectedEventIds = new Set();

    for (const reg of validRegs) {
      const event = reg.eventId;
      if (!event) continue;

      affectedEventIds.add(event._id.toString()); // Lưu ID sự kiện

      // Random trạng thái điểm danh
      let status = ATTENDANCE_STATUS.COMPLETED;
      const rand = Math.random();

      if (rand > 0.9) status = ATTENDANCE_STATUS.ABSENT;
      else if (rand > 0.8) status = ATTENDANCE_STATUS.IN_PROGRESS;

      let checkIn = null;
      let checkOut = null;
      let feedback = null;

      if (status !== ATTENDANCE_STATUS.ABSENT) {
        checkIn = new Date(event.startDate);
        checkIn.setMinutes(
          checkIn.getMinutes() + Math.floor(Math.random() * 30) - 15
        );
      }

      if (status === ATTENDANCE_STATUS.COMPLETED) {
        checkOut = new Date(event.endDate);
        checkOut.setMinutes(
          checkOut.getMinutes() + Math.floor(Math.random() * 20)
        );

        if (Math.random() > 0.4) {
          const sample =
            sampleFeedbacks[Math.floor(Math.random() * sampleFeedbacks.length)];
          feedback = {
            rating: sample.rating,
            comment: sample.comment,
            submittedAt: new Date(checkOut.getTime() + 1000 * 60 * 60),
          };
        }
      }

      attendances.push({
        regId: reg._id,
        status: status,
        checkIn: checkIn,
        checkOut: checkOut,
        feedback: feedback,
      });
    }

    await Attendance.insertMany(attendances);
    console.log(`✅ Đã tạo ${attendances.length} bản ghi điểm danh!`.green);

    // =========================================================
    // 👇 PHẦN MỚI THÊM: TÍNH TOÁN RATING CHO TỪNG EVENT 👇
    // =========================================================
    console.log("🔄 Đang cập nhật Rating cho Events...".magenta);

    for (const eventId of affectedEventIds) {
      // 1. Tìm tất cả Registration của Event này
      const regIds = await Registration.find({ eventId }).distinct("_id");

      // 2. Aggregate dữ liệu Attendance để tính trung bình
      const stats = await Attendance.aggregate([
        {
          $match: {
            regId: { $in: regIds },
            "feedback.rating": { $exists: true, $ne: null },
          },
        },
        {
          $group: {
            _id: null,
            avgRating: { $avg: "$feedback.rating" },
            numRatings: { $sum: 1 },
          },
        },
      ]);

      // 3. Update vào Event
      if (stats.length > 0) {
        await Event.findByIdAndUpdate(eventId, {
          averageRating: stats[0].avgRating,
          ratingCount: stats[0].numRatings,
        });
        console.log(
          `   -> Event ID ${eventId}: ${stats[0].avgRating.toFixed(1)}⭐ (${
            stats[0].numRatings
          } đánh giá)`.cyan
        );
      }
    }
    // =========================================================

    console.log("🎉 SEED ATTENDANCE HOÀN TẤT!".green.inverse.bold);
    process.exit();
  } catch (err) {
    console.error(`❌ LỖI: ${err.message}`.red.inverse);
    process.exit(1);
  }
};

const destroyData = async () => {
  try {
    await Attendance.deleteMany({});
    // Reset rating khi xóa data
    await Event.updateMany({}, { $set: { averageRating: 0, ratingCount: 0 } });
    console.log("🔥 Đã xóa dữ liệu Attendance và Reset Rating!".red.inverse);
    process.exit();
  } catch (err) {
    console.error(`${err}`.red.inverse);
    process.exit(1);
  }
};

if (process.argv[2] === "-d") destroyData();
else importData();
