/** @format */

import { protect } from "../middlewares/auth.middleware.js";
import {
  registerForEvent,
  cancelRegistration,
} from "../controllers/registration.controller.js";
import express from "express";
const router = express.Router();

router.post("/", protect, registerForEvent);
router.delete("/:id", protect, cancelRegistration);

export default router;
