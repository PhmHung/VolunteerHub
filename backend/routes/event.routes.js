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
  getEventPrivateFeedbacks,
} from "../controllers/attendance.controller.js";
import { canModifyEvent } from "../middlewares/event.middleware.js";

const router = express.Router();

// --- CÁC ROUTE CỤ THỂ (STATIC ROUTES) PHẢI ĐẶT LÊN TRƯỚC ---

// Public - General List
router.get("/", getEvents);

router.get("/me", protect, getMyEvents);


// Manager - Management List (Đưa lên trên để tránh bị ăn vào :eventId)
// Lưu ý: Tôi đã đổi authorize("admin", "manager") thành allowAdminOrManager cho đồng bộ
router.get("/management", protect, allowAdminOrManager, getAllEvents);

// --- CÁC ROUTE CÓ THAM SỐ (DYNAMIC ROUTES) ĐẶT SAU ---

// Public - Detail & Rating
router.get("/:eventId", getEventById);
router.get("/:eventId/rating", getEventPublicRating);

// Manager - Create/Update/Delete/Feedback
router.post("/", protect, allowAdminOrManager, createEvent);

router.put(
  "/:eventId",
  protect,
  allowAdminOrManager,
  canModifyEvent,
  updateEvent
);

// Sửa :id thành :eventId cho đồng bộ
router.delete("/:eventId", protect, allowAdminOrManager, deleteEvent);

router.get(
  "/:eventId/feedbacks",
  protect,
  allowAdminOrManager,
  getEventPrivateFeedbacks
);

router.get(
  "/:eventId/registrations",
  protect,
  allowAdminOrManager,
  getEventRegistrations
);

// Admin - Approve
router.patch("/:eventId/approve", protect, allowAdminOnly, approveEvent);
router.route("/:id/cancel").put(protect, allowAdminOrManager, cancelEvent); // Manager/Admin: Hủy sự kiện
export default router;
