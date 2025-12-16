/** @format */

import {
  protect,
  allowAdminOrManager,
} from "../middlewares/auth.middleware.js";
import {
  registerForEvent,
  cancelRegistration,
  getMyRegistrations,
  getMyQRCode,
  getAllRegistrationsForManagement,
  acceptRegistration,
  rejectRegistration,
} from "../controllers/registration.controller.js";
import express from "express";
const router = express.Router();

router.use(protect);
router.post("/", protect, registerForEvent);
router.get("/my-registrations", protect, getMyRegistrations);
router.get("/:eventId/my-qr", protect, getMyQRCode);
router.delete("/:id", protect, cancelRegistration);
router.get("/pending", allowAdminOrManager, getAllRegistrationsForManagement);
router.put("/:id/accept", allowAdminOrManager, acceptRegistration);
router.put("/:id/reject", allowAdminOrManager, rejectRegistration);

export default router;
