/** @format */

import express from "express";
import {
  getEvents,
  getEventById,
  createEvent,
  updateEvent,
  approveEvent,
} from "../controllers/event.controller.js";
import {
  protect,
  allowAdminOnly,
  allowAdminOrManager,
} from "../middleware/auth.middleware.js";

import {
  getEventPublicRating,
  getEventPrivateFeedbacks,
} from "../controllers/attendance.controller.js";
import { canModifyEvent } from "../middleware/event.middleware.js";

const router = express.Router();

// Public
router.get("/", getEvents);
router.get("/:eventId", getEventById);
router.get("/:eventId/rating", getEventPublicRating);

// Manager
router.post("/", protect, allowAdminOrManager, createEvent);
router.put(
  "/:eventId",
  protect,
  allowAdminOrManager,
  canModifyEvent,
  updateEvent
);
router.get(
  "/:eventId/feedbacks",
  protect,
  allowAdminOrManager,
  getEventPrivateFeedbacks
);

// Admin
router.patch("/:eventId/approve", protect, allowAdminOnly, approveEvent);

export default router;
