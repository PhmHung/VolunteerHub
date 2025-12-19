/** @format */

import express from "express";
import {
  addFeedback,
  getAttendancesByEvent,
  getEventFeedbacks,
  getEventPublicRating,
  getAttendanceByRegId,
} from "../controllers/attendance.controller.js";
import {
  protect,
  allowAdminOrManager,
} from "../middlewares/auth.middleware.js";

const router = express.Router();

// --- PUBLIC ROUTES (Không cần đăng nhập) ---

// @desc    Lấy điểm đánh giá trung bình của sự kiện (Public)
// @route   GET /api/attendances/event/:eventId/rating
router.get("/event/:eventId/rating", getEventPublicRating);

// --- PROTECTED ROUTES (Phải đăng nhập) ---
// Áp dụng middleware protect cho tất cả các route bên dưới
router.use(protect);

// 1. Nhóm thao tác Feedback (User)
// @desc    Gửi feedback (Chỉ người đã check-out mới gửi được - logic nằm trong controller)
// @route   PUT /api/attendances/:id/feedback
router.put("/:id/feedback", addFeedback);

// @desc    Xem danh sách feedback của sự kiện (Ai đăng nhập cũng xem được)
// @route   GET /api/attendances/event/:eventId/feedbacks
router.get("/event/:eventId/feedbacks", getEventFeedbacks);

// 2. Nhóm tiện ích cá nhân
// @desc    Lấy thông tin điểm danh dựa trên Registration ID (Để hiển thị trạng thái check-in cho user)
// @route   GET /api/attendances/registration/:regId
router.get("/registration/:regId", getAttendanceByRegId);

// @desc    Lấy danh sách người tham gia & trạng thái điểm danh (Dành cho Manager quản lý)
// @route   GET /api/attendances/event/:eventId
router.get("/event/:eventId", allowAdminOrManager, getAttendancesByEvent);

export default router;
