/** @format */

import mongoose from "mongoose";
import dotenv from "dotenv";
import Registration from "../models/registrationModel.js";
import Attendance from "../models/attendanceModel.js";
import Event from "../models/eventModel.js";
import connectDB from "../config/mongodb.js";


dotenv.config();
connectDB();

const randomPick = (arr) => arr[Math.floor(Math.random() * arr.length)];
const randomRating = () => Math.floor(Math.random() * 5) + 1;

const randomComment = (rating) => {
  const comments = {
    5: ["Sự kiện rất tuyệt vời", "Trải nghiệm xuất sắc", "Rất đáng tham gia"],
    4: ["Sự kiện tốt", "Nội dung ổn", "Tổ chức khá ổn"],
    3: ["Bình thường", "Ổn nhưng chưa nổi bật"],
    2: ["Chưa như kỳ vọng", "Cần cải thiện"],
    1: ["Trải nghiệm không tốt"],
  };
  return randomPick(comments[rating]);
};

const seedAttendance = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB connected");

    const registrations = await Registration.find({
      status: "registered",
    }).populate("eventId");

    const now = new Date();
    let created = 0;
    let skipped = 0;

    for (const reg of registrations) {
      const existed = await Attendance.findOne({ regId: reg._id });
      if (existed) {
        skipped++;
        continue;
      }

      const event = reg.eventId;
      if (!event) continue;

      const now = new Date();
const startDate = new Date(event.startDate);
const endDate = new Date(event.endDate);

let status;

// ===============================
// XÁC ĐỊNH STATUS
// ===============================
if (now < startDate) {
  // 🔹 Event chưa bắt đầu
  status = "in-progress";
} else if (now >= startDate && now <= endDate) {
  // 🔹 Event đang diễn ra
  status = randomPick(["in-progress", "completed"]);
} else {
  // 🔹 Event đã kết thúc
  status = randomPick(["completed", "absent"]);
}

const attendanceData = {
  regId: reg._id,
  status,
};

// ===============================
// NẾU COMPLETED → checkout + feedback
// ===============================
if (status === "completed") {
  const rating = randomRating();

  // checkout phụ thuộc thời điểm event
  attendanceData.checkOut =
    now > endDate ? endDate : now;

  // attendanceData.feedback = {
  //   rating,
  //   comment: randomComment(rating),
  //   submittedAt: now > endDate ? endDate : now,
  // };
}


      await Attendance.create(attendanceData);
      created++;
    }

    console.log("Attendance seeding finished");
    console.log("Created:", created);
    console.log("Skipped:", skipped);

    process.exit();
  } catch (error) {
    console.error("Seeder error:", error);
    process.exit(1);
  }
};

seedAttendance();
