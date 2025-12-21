/** @format */

import asyncHandler from "express-async-handler";
import mongoose from "mongoose";
import Attendance from "../models/attendanceModel.js";
import Registration from "../models/registrationModel.js";
import Event from "../models/eventModel.js";
import { emitNotification } from "../utils/notificationHelper.js";

const calcAverageRatings = async (eventId) => {
  try {
    const regIds = await Registration.find({ eventId }).distinct("_id");

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

    if (stats.length > 0) {
      await Event.findByIdAndUpdate(eventId, {
        averageRating: stats[0].avgRating,
        ratingCount: stats[0].numRatings,
      });
    } else {
      await Event.findByIdAndUpdate(eventId, {
        averageRating: 0,
        ratingCount: 0,
      });
    }
  } catch (error) {
    console.error("Lỗi cập nhật rating event:", error);
  }
};

// @desc    Add feedback and rating
// @route   PUT /api/attendances/:id/feedback
// @access  Private (User đã tham gia và đã check-out)
const addFeedback = asyncHandler(async (req, res) => {
  const { rating, comment } = req.body;

  // 1. Tìm attendance
  const attendance = await Attendance.findById(req.params.id);
  if (!attendance) {
    res.status(404);
    throw new Error("Không tìm thấy bản ghi điểm danh.");
  }

  // 2. Validate: Phải là người tham gia (đã check-out)
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

  // 4. Update Event Rating
  const registration = await Registration.findById(attendance.regId);
  if (registration) {
    await calcAverageRatings(registration.eventId);
    const event = registration.eventId;
    const volunteerName = registration.userId?.userName || "Một TNV";

    emitNotification(req, event.createdBy.toString(), {
      title: "Đánh giá mới cho sự kiện",
      message: `${volunteerName} vừa gửi đánh giá ${rating}⭐ cho sự kiện "${event.title}"`,
      type: "info",
      link: `/dashboard?tab=events&highlight=${event._id}`,
    });
  }

  res.json({
    message: "Gửi phản hồi thành công.",
    feedback: attendance.feedback,
  });
});

// @desc    Xem danh sách tất cả phản hồi của một sự kiện
// @route   GET /api/attendances/event/:eventId/feedbacks
// @access  Protected (Người dùng đã đăng nhập)
const getEventFeedbacks = asyncHandler(async (req, res) => {
  const { eventId } = req.params;

  const event = await Event.findById(eventId);
  if (!event) {
    res.status(404);
    throw new Error("Không tìm thấy sự kiện.");
  }

  // --- ĐÃ XÓA ĐOẠN CHECK QUYỀN MANAGER/ADMIN ---
  // Mặc định route này sẽ đi qua middleware 'protect' (verifyToken) ở Router
  // nên req.user tồn tại là đủ điều kiện để xem.

  const registrationIds = await Registration.find({ eventId }).distinct("_id");

  // Tìm tất cả feedback của sự kiện đó
  const feedbacks = await Attendance.find({
    regId: { $in: registrationIds },
    "feedback.rating": { $exists: true },
  })
    .select("+feedback")
    .populate({
      path: "regId",
      populate: {
        path: "userId",
        select: "userName userEmail profilePicture",
      },
    })
    .sort({ "feedback.submittedAt": -1 });

  res.json({
    message: "Danh sách phản hồi của sự kiện",
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

// @desc    Lấy điểm đánh giá trung bình công khai (số liệu)
// @route   GET /api/attendances/event/:eventId/rating
// @access  Public (Ai cũng xem được)
const getEventPublicRating = asyncHandler(async (req, res) => {
  const { eventId } = req.params;
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

// @desc    Lấy thông tin điểm danh cá nhân (Check trạng thái Check-in)
// @route   GET /api/attendances/registration/:regId
// @access  Private (User sở hữu vé hoặc Admin)
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

// @desc    Lấy danh sách điểm danh chi tiết của sự kiện (Quản lý danh sách)
// @route   GET /api/attendances/event/:eventId
// @access  Private (Manager/Admin - Chỉ người quản lý sự kiện)
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
  addFeedback,
  getAttendanceByRegId,
  getEventPublicRating,
  getEventFeedbacks,
  getAttendancesByEvent,
};
