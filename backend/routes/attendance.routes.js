/** @format */

import express from "express";
import {
  recordCheckIn,
  recordCheckOut,
  addFeedback,
  getEventPublicRating,
  getEventPrivateFeedbacks,
} from "../controllers/attendance.controller.js";
import {
  protect,
  allowAdminOrManager,
} from "../middlewares/auth.middleware.js";

const router = express.Router();

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

// @desc    Xem rating công khai của sự kiện
// @route   GET /api/events/:eventId/rating
// @access  Public
router.route("/events/:eventId/rating").get(getEventPublicRating);

// @desc    Xem toàn bộ feedback (Manager/Admin)
// @route   GET /api/events/:eventId/feedbacks
// @access  Private (Manager/Admin)
router
  .route("/events/:eventId/feedbacks")
  .get(protect, allowAdminOrManager, getEventPrivateFeedbacks);

export default router;
