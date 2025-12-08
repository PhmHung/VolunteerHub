/** @format */

import { protect } from "../middlewares/auth.middleware.js";
import {
  registerForEvent,
  cancelRegistration,
  getMyRegistrations,
  getPendingRegistrations,
} from "../controllers/registration.controller.js";
import express from "express";
const router = express.Router();

router.post("/", protect, registerForEvent);
router.get("/my-registrations", protect, getMyRegistrations);
router.get("/pending", protect, getPendingRegistrations);
router.delete("/:id", protect, cancelRegistration);

export default router;
