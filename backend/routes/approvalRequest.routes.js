/** @format */

import express from "express";
import {
  getPendingRequests,
  approveRequest,
  rejectRequest,
  getRequestById,
  getMyRequests, // Manager xem yêu cầu của mình
} from "../controllers/approvalRequest.controller.js";
import { protect, allowAdminOnly } from "../middlewares/auth.middleware.js";

const router = express.Router();

// === ADMIN ROUTES ===
router.route("/pending").get(protect, allowAdminOnly, getPendingRequests); // Admin: Xem tất cả pending

router.route("/:id/approve").patch(protect, allowAdminOnly, approveRequest); // Admin: Duyệt

router.route("/:id/reject").patch(protect, allowAdminOnly, rejectRequest); // Admin: Từ chối

// === SHARED ROUTES ===
router.route("/:id").get(protect, getRequestById); // Manager/Admin: Xem chi tiết

// === MANAGER ROUTES ===
router.route("/my-request").get(protect, getMyRequests); // Manager: Xem yêu cầu của mình

export default router;
