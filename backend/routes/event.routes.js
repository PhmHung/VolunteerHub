/** @format */

import express from "express";
import {
  getEvents,
  getMyEvents,
  getAllEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent,
  approveEvent,
  getEventRegistrations,
  cancelEvent,
} from "../controllers/event.controller.js";
import {
  protect,
  allowAdminOnly,
  allowAdminOrManager,
} from "../middlewares/auth.middleware.js";

import {
  getEventPublicRating,
  getEventFeedbacks,
} from "../controllers/attendance.controller.js";
import { canModifyEvent } from "../middlewares/event.middleware.js";

const router = express.Router();

// ============================================================
// 1. STATIC ROUTES (Phải đặt lên đầu để tránh trùng với :eventId)
// ============================================================

// Public: Lấy danh sách sự kiện (Home page)
router.get("/", getEvents);

router.get("/me", protect, getMyEvents);

// Manager - Management List (Đưa lên trên để tránh bị ăn vào :eventId)
// Lưu ý: Tôi đã đổi authorize("admin", "manager") thành allowAdminOrManager cho đồng bộ
router.get("/management", protect, allowAdminOrManager, getAllEvents);

// Manager: Tạo sự kiện mới
router.post("/", protect, allowAdminOrManager, createEvent);

// ============================================================
// 2. DYNAMIC ROUTES (Có tham số :eventId)
// ============================================================

// --- PUBLIC ---
router.get("/:eventId", getEventById);
router.get("/:eventId/rating", getEventPublicRating);

// --- MANAGER / ADMIN ACTIONS ---

// Cập nhật thông tin (Chỉ Manager sở hữu hoặc Admin)
router.put(
  "/:eventId",
  protect,
  allowAdminOrManager,
  canModifyEvent,
  updateEvent
);

// Xóa sự kiện
router.delete("/:eventId", protect, allowAdminOrManager, deleteEvent);

// Lấy feedback (riêng tư)
router.get(
  "/:eventId/feedbacks",
  protect,
  allowAdminOrManager,
  getEventFeedbacks
);

// Lấy danh sách đăng ký
router.get(
  "/:eventId/registrations",
  protect,
  allowAdminOrManager,
  getEventRegistrations
);

// --- SPECIFIC ACTIONS (DUYỆT & HỦY) ---

// Admin: Duyệt hoặc Từ chối sự kiện
router.patch("/:eventId/approve", protect, allowAdminOnly, approveEvent);

// Manager/Admin: Hủy sự kiện (Đã sửa :id thành :eventId cho đồng bộ)
router.put("/:eventId/cancel", protect, allowAdminOrManager, cancelEvent);

export default router;
