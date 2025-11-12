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
  const registration = await Registration.findById(regId).populate("eventId");
  if (!registration) {
    res.status(404);
    throw new Error("Registration record not found.");
  }

  //Sự kiện đang diễn ra
  const event = registration.eventId;
  const now = new Date();

  // Chuyển now sang múi giờ Việt Nam (+07:00)
  const nowInVietnam = new Date(
    now.toLocaleString("en-US", { timeZone: "Asia/Ho_Chi_Minh" })
  );

  if (
    nowInVietnam < new Date(event.startDate) ||
    nowInVietnam > new Date(event.endDate)
  ) {
    res.status(400);
    throw new Error("Sự kiện chưa bắt đầu hoặc đã kết thúc.");
  }
  //

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

  // 1. Tìm attendance + populate registration + event
  const attendance = await Attendance.findOne({ regId }).populate({
    path: "regId",
    populate: { path: "eventId" }, // Lấy thông tin event
  });

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

  // === THÊM: KIỂM TRA SỰ KIỆN CÒN DIỄN RA KHÔNG ===
  const event = attendance.regId.eventId;
  const now = new Date();
  const nowInVietnam = new Date(
    now.toLocaleString("en-US", { timeZone: "Asia/Ho_Chi_Minh" })
  );

  // Cho phép check-out TRƯỚC HOẶC TRONG THỜI GIAN sự kiện
  if (nowInVietnam > new Date(event.endDate)) {
    res.status(400);
    throw new Error("Sự kiện đã kết thúc. Không thể check-out.");
  }
  // === HẾT PHẦN SỬA ===

  // Cập nhật check-out với giờ Việt Nam
  attendance.checkOut = nowInVietnam;
  attendance.status = "completed";
  await attendance.save();

  // Tính thời gian tham gia (ms)
  const durationMs = attendance.checkOut - attendance.checkIn;
  const durationMinutes = Math.floor(durationMs / 60000); // Chuyển sang phút

  res.json({
    message: "Check-Out recorded successfully. Attendance completed.",
    attendanceId: attendance._id,
    checkOutTime: attendance.checkOut,
    duration: {
      milliseconds: durationMs,
      minutes: durationMinutes,
    },
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

// @desc    Lấy rating công khai của sự kiện (Public)
// @route   GET /api/events/:eventId/rating
// @access  Public
const getEventPublicRating = asyncHandler(async (req, res) => {
  const { eventId } = req.params;

  const stats = await Attendance.aggregate([
    {
      $lookup: {
        from: "registrations",
        localField: "regId",
        foreignField: "_id",
        as: "reg",
      },
    },
    { $unwind: "$reg" },
    {
      $match: {
        "reg.eventId": mongoose.Types.ObjectId.createFromHexString(eventId),
        feedback: { $ne: null },
      },
    },
    {
      $group: {
        _id: null,
        avgRating: { $avg: "$feedback.rating" },
        totalRatings: { $sum: 1 },
      },
    },
  ]);

  const result = stats[0] || { avgRating: 0, totalRatings: 0 };

  res.json({
    message: "Public event rating",
    data: {
      averageRating: result.avgRating ? Number(result.avgRating.toFixed(2)) : 0,
      totalRatings: result.totalRatings,
    },
  });
});

// @desc    Xem toàn bộ feedback + comment (Manager/Admin)
// @route   GET /api/events/:eventId/feedbacks
// @access  Private/Manager
const getEventPrivateFeedbacks = asyncHandler(async (req, res) => {
  const { eventId } = req.params;

  const event = await Event.findById(eventId);
  if (!event) throw new Error("Event not found");

  const isManager = event.createdBy.toString() === req.user._id.toString();
  const isAdmin = req.user.role === "admin";
  if (!isManager && !isAdmin) throw new Error("Not authorized");

  const feedbacks = await Attendance.find({
    regId: {
      $in: await Registration.find({ eventId }).select("_id"),
    },
    feedback: { $ne: null },
  })
    .select("+feedback") // BẮT BUỘC: bật field bị ẩn
    .populate({
      path: "regId",
      populate: { path: "userId", select: "name email" },
    });

  res.json({
    message: "Private feedbacks (Manager/Admin only)",
    data: feedbacks.map((f) => ({
      user: f.regId.userId.name,
      rating: f.feedback.rating,
      comment: f.feedback.comment,
      submittedAt: f.feedback.submittedAt,
    })),
  });
});

export {
  recordCheckIn,
  recordCheckOut,
  addFeedback,
  getAttendanceByRegId,
  getEventPublicRating,
  getEventPrivateFeedbacks,
};
