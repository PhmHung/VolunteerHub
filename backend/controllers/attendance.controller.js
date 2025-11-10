/** @format */

import asyncHandler from "express-async-handler";
import Attendance from "../models/attendanceModel.js"; // Giả định đường dẫn
import Registration from "../models/registrationModel.js"; // Cần dùng để kiểm tra đăng ký

/**
 * Các Controller cho việc quản lý Điểm Danh (Attendance)
 */

// @desc    Record a Check-In for a registration
// @route   POST /api/v1/attendances/checkin
// @access  Private
const recordCheckIn = asyncHandler(async (req, res) => {
  // regId: ID của bản ghi đăng ký (Registration) mà người dùng đang điểm danh
  const { regId } = req.body;

  // 1. Xác thực regId
  const registration = await Registration.findById(regId);
  if (!registration) {
    res.status(404);
    throw new Error("Registration record not found.");
  }

  // 2. Kiểm tra xem người này đã điểm danh vào (Check-In) chưa
  let attendance = await Attendance.findOne({ regId });

  if (attendance) {
    if (attendance.checkIn) {
      res.status(400);
      throw new Error("User has already checked in.");
    }

    // Nếu bản ghi tồn tại nhưng chưa check-in (ví dụ: status: 'absent')
    attendance.checkIn = Date.now();
    attendance.status = "in-progress";
    await attendance.save();
  } else {
    // 3. Tạo bản ghi điểm danh mới (Check-In lần đầu)
    attendance = await Attendance.create({
      regId,
      checkIn: Date.now(),
      status: "in-progress",
    });
  }

  res.status(201).json({
    message: "Check-In recorded successfully.",
    attendanceId: attendance._id,
    checkInTime: attendance.checkIn,
  });
});

// @desc    Record a Check-Out and finalize attendance
// @route   POST /api/v1/attendances/checkout
// @access  Private
const recordCheckOut = asyncHandler(async (req, res) => {
  const { regId } = req.body;

  // 1. Tìm bản ghi điểm danh
  const attendance = await Attendance.findOne({ regId });

  if (!attendance) {
    res.status(404);
    throw new Error("Attendance record not found. Please check in first.");
  }

  if (!attendance.checkIn) {
    res.status(400);
    throw new Error("Cannot check out without checking in.");
  }

  if (attendance.checkOut) {
    res.status(400);
    throw new Error("User has already checked out.");
  }

  // 2. Cập nhật Check-Out và Status
  attendance.checkOut = Date.now();
  attendance.status = "completed";
  await attendance.save();

  res.json({
    message: "Check-Out recorded successfully. Attendance completed.",
    attendanceId: attendance._id,
    checkOutTime: attendance.checkOut,
    duration: attendance.checkOut - attendance.checkIn, // Thời gian tham gia (miligiây)
  });
});

// @desc    Add feedback and rating to a completed attendance record
// @route   PUT /api/v1/attendances/:id/feedback
// @access  Private
const addFeedback = asyncHandler(async (req, res) => {
  const { rating, comment } = req.body;

  // 1. Tìm bản ghi điểm danh theo ID
  const attendance = await Attendance.findById(req.params.id);

  if (!attendance) {
    res.status(404);
    throw new Error("Attendance record not found.");
  }

  // 2. Kiểm tra điều kiện (Nên chỉ cho phép feedback khi đã checkOut và chưa có feedback)
  if (attendance.status !== "completed" || attendance.checkOut === null) {
    res.status(400);
    throw new Error(
      "Feedback can only be submitted for completed attendance records."
    );
  }

  if (attendance.feedback && attendance.feedback.comment) {
    res.status(400);
    throw new Error("Feedback has already been submitted for this record.");
  }

  // 3. Cập nhật Feedback
  attendance.feedback.rating = rating;
  attendance.feedback.comment = comment;
  await attendance.save();

  res.json({
    message: "Feedback submitted successfully.",
    feedback: attendance.feedback,
  });
});

// @desc    Get attendance records for a specific registration
// @route   GET /api/v1/attendances/registration/:regId
// @access  Private
const getAttendanceByRegId = asyncHandler(async (req, res) => {
  // regId này thường sẽ được dùng để lấy thông tin điểm danh của người dùng
  const { regId } = req.params;

  // Logic: Lấy bản ghi điểm danh, populate thêm thông tin Registration nếu cần
  const attendance = await Attendance.findOne({ regId }).populate({
    path: "regId",
    select: "user event", // Giả định Registration có chứa ID người dùng và ID sự kiện
  });

  if (!attendance) {
    res.status(404);
    throw new Error("Attendance record for this registration not found.");
  }

  res.json({
    message: "Attendance details retrieved.",
    data: attendance,
  });
});

export { recordCheckIn, recordCheckOut, addFeedback, getAttendanceByRegId };
