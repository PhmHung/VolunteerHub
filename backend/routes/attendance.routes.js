/** @format */

import express from "express";
import {
  recordCheckIn,
  recordCheckOut,
  addFeedback,
  getAttendancesByEvent, // 👇 MỚI: Import thêm hàm này
} from "../controllers/attendance.controller.js";
import {
  protect,
  allowAdminOrManager,
} from "../middlewares/auth.middleware.js";

const router = express.Router();

// --- CÁC ROUTE CƠ BẢN (Volunteer thao tác) ---

// @desc    Check-in
// @route   POST /api/attendances/checkin
// @access  Private (Volunteer)
router.route("/checkin").post(protect, recordCheckIn);

// @desc    Check-out
// @route   POST /api/attendances/checkout
// @access  Private (Volunteer)
router.route("/checkout").post(protect, recordCheckOut);

// @desc    Gửi feedback sau check-out
// @route   PUT /api/attendances/:id/feedback
// @access  Private (Volunteer)
router.route("/:id/feedback").put(protect, addFeedback);

// --- CÁC ROUTE QUẢN LÝ (Manager/Admin thao tác) ---

// @desc    Lấy danh sách điểm danh của 1 sự kiện (Để Manager hiển thị bảng điểm danh)
// @route   GET /api/attendances/event/:eventId
// @access  Private (Manager/Admin)
router
  .route("/event/:eventId")
  .get(protect, allowAdminOrManager, getAttendancesByEvent);

export default router;
