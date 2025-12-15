/** @format */

import asyncHandler from "express-async-handler";
import mongoose from "mongoose";
import Attendance from "../models/attendanceModel.js";
import Registration from "../models/registrationModel.js";
import Event from "../models/eventModel.js";

// --- HÀM PHỤ: TÍNH TOÁN VÀ CẬP NHẬT RATING CHO EVENT ---
const calcAverageRatings = async (eventId) => {
  try {
    // 1. Tìm tất cả các Registration của Event này
    const regIds = await Registration.find({ eventId }).distinct("_id");

    // 2. Tính trung bình rating từ bảng Attendance
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

    // 3. Cập nhật vào bảng Event
    if (stats.length > 0) {
      await Event.findByIdAndUpdate(eventId, {
        averageRating: stats[0].avgRating,
        ratingCount: stats[0].numRatings,
      });
    } else {
      // Trường hợp không có/xóa hết feedback
      await Event.findByIdAndUpdate(eventId, {
        averageRating: 0,
        ratingCount: 0,
      });
    }
  } catch (error) {
    console.error("Lỗi cập nhật rating event:", error);
  }
};

// ... (Giữ nguyên recordCheckIn, recordCheckOut) ...
// (Copy lại 2 hàm recordCheckIn và recordCheckOut từ code cũ của bạn vào đây)
const recordCheckIn = asyncHandler(async (req, res) => {
  // ... code checkin cũ ...
  const { regId } = req.body;
  const registration = await Registration.findById(regId).populate("eventId");
  if (!registration) {
    res.status(404);
    throw new Error("Không tìm thấy bản ghi đăng ký.");
  }

  const event = registration.eventId;
  const now = new Date();
  const startDate = new Date(event.startDate);
  const endDate = new Date(event.endDate);

  if (now < startDate) {
    res.status(400);
    throw new Error("Sự kiện chưa bắt đầu, chưa thể điểm danh.");
  }
  if (now > endDate) {
    res.status(400);
    throw new Error("Sự kiện đã kết thúc, không thể điểm danh vào.");
  }

  let attendance = await Attendance.findOne({ regId });
  if (attendance) {
    if (attendance.checkIn) {
      res.status(400);
      throw new Error("Người dùng đã check-in rồi.");
    }
    attendance.checkIn = now;
    attendance.status = "in-progress";
    await attendance.save();
  } else {
    attendance = await Attendance.create({
      regId,
      checkIn: now,
      status: "in-progress",
    });
  }
  res.status(201).json({
    message: "Check-In thành công.",
    attendanceId: attendance._id,
    checkInTime: attendance.checkIn,
  });
});

const recordCheckOut = asyncHandler(async (req, res) => {
  // ... code checkout cũ ...
  const { regId } = req.body;
  const attendance = await Attendance.findOne({ regId }).populate({
    path: "regId",
    populate: { path: "eventId" },
  });
  if (!attendance) {
    res.status(404);
    throw new Error(
      "Chưa tìm thấy bản ghi điểm danh. Vui lòng Check-in trước."
    );
  }
  if (!attendance.checkIn) {
    res.status(400);
    throw new Error("Bạn chưa Check-in nên không thể Check-out.");
  }
  if (attendance.checkOut) {
    res.status(400);
    throw new Error("Bạn đã Check-out rồi.");
  }

  const now = new Date();
  attendance.checkOut = now;
  attendance.status = "completed";
  await attendance.save();

  const durationMs = attendance.checkOut - attendance.checkIn;
  const durationMinutes = Math.floor(durationMs / 60000);
  const durationHours = (durationMs / (1000 * 60 * 60)).toFixed(2);

  res.json({
    message: "Check-Out thành công. Hoàn thành tham gia.",
    attendanceId: attendance._id,
    checkOutTime: attendance.checkOut,
    duration: {
      milliseconds: durationMs,
      minutes: durationMinutes,
      hours: Number(durationHours),
    },
  });
});

// @desc    Add feedback and rating -> CẬP NHẬT LOGIC TÍNH RATING
// @route   PUT /api/attendances/:id/feedback
// @access  Private
const addFeedback = asyncHandler(async (req, res) => {
  const { rating, comment } = req.body;

  // 1. Tìm attendance
  const attendance = await Attendance.findById(req.params.id);
  if (!attendance) {
    res.status(404);
    throw new Error("Không tìm thấy bản ghi điểm danh.");
  }

  // 2. Validate
  if (attendance.status !== "completed" || !attendance.checkOut) {
    res.status(400);
    throw new Error(
      "Bạn chỉ có thể gửi phản hồi sau khi đã hoàn thành sự kiện."
    );
  }

  if (attendance.feedback && attendance.feedback.comment) {
    res.status(400);
    throw new Error("Bạn đã gửi phản hồi cho sự kiện này rồi.");
  }

  // 3. Lưu feedback
  if (!attendance.feedback) attendance.feedback = {};
  attendance.feedback.rating = rating;
  attendance.feedback.comment = comment;
  attendance.feedback.submittedAt = Date.now();
  await attendance.save();

  // 4. 🔥 KÍCH HOẠT TÍNH TOÁN RATING CHO EVENT
  // Cần lấy eventId thông qua registration
  const registration = await Registration.findById(attendance.regId);
  if (registration) {
    await calcAverageRatings(registration.eventId);
  }

  res.json({
    message: "Gửi phản hồi thành công.",
    feedback: attendance.feedback,
  });
});

// @desc    Lấy rating công khai (Lấy trực tiếp từ Event Model cho nhanh)
// @route   GET /api/events/:eventId/rating
// @access  Public
const getEventPublicRating = asyncHandler(async (req, res) => {
  const { eventId } = req.params;

  // Lấy trực tiếp từ Event Model thay vì tính toán aggregate
  const event = await Event.findById(eventId).select(
    "averageRating ratingCount"
  );

  if (!event) {
    res.status(404);
    throw new Error("Sự kiện không tồn tại");
  }

  res.json({
    message: "Public event rating",
    data: {
      averageRating: event.averageRating || 0,
      totalRatings: event.ratingCount || 0,
    },
  });
});

const getAttendanceByRegId = asyncHandler(async (req, res) => {
  const { regId } = req.params;
  const attendance = await Attendance.findOne({ regId }).populate({
    path: "regId",
    select: "userId eventId",
  });
  if (!attendance) {
    res.status(404);
    throw new Error("Không tìm thấy thông tin điểm danh cho lượt đăng ký này.");
  }
  res.json({
    message: "Lấy thông tin điểm danh thành công.",
    data: attendance,
  });
});

const getEventPrivateFeedbacks = asyncHandler(async (req, res) => {
  const { eventId } = req.params;
  const event = await Event.findById(eventId);
  if (!event) {
    res.status(404);
    throw new Error("Không tìm thấy sự kiện.");
  }
  const isManager = event.createdBy.toString() === req.user._id.toString();
  const isAdmin = req.user.role === "admin";
  if (!isManager && !isAdmin) {
    res.status(403);
    throw new Error("Bạn không có quyền xem chi tiết phản hồi.");
  }

  const registrationIds = await Registration.find({ eventId }).distinct("_id");
  const feedbacks = await Attendance.find({
    regId: { $in: registrationIds },
    "feedback.rating": { $exists: true },
  })
    .select("+feedback")
    .populate({
      path: "regId",
      populate: { path: "userId", select: "userName userEmail profilePicture" },
    });

  res.json({
    message: "Private feedbacks",
    data: feedbacks.map((f) => ({
      _id: f._id,
      user: {
        name: f.regId.userId ? f.regId.userId.userName : "Người dùng ẩn",
        email: f.regId.userId ? f.regId.userId.userEmail : "",
        avatar: f.regId.userId ? f.regId.userId.profilePicture : null,
      },
      rating: f.feedback.rating,
      comment: f.feedback.comment,
      submittedAt: f.feedback.submittedAt,
    })),
  });
});

const getAttendancesByEvent = asyncHandler(async (req, res) => {
  const { eventId } = req.params;
  const regIds = await Registration.find({ eventId }).distinct("_id");
  const attendances = await Attendance.find({
    regId: { $in: regIds },
  }).populate({
    path: "regId",
    select: "userId status",
    populate: {
      path: "userId",
      select: "userName userEmail profilePicture phoneNumber",
    },
  });

  res.json({ success: true, count: attendances.length, data: attendances });
});

export {
  recordCheckIn,
  recordCheckOut,
  addFeedback,
  getAttendanceByRegId,
  getEventPublicRating,
  getEventPrivateFeedbacks,
  getAttendancesByEvent,
};
