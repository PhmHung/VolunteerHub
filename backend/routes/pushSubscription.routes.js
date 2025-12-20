import express from "express";
import {
  saveSubscription,
  deleteSubscription,
  sendNotificationToUser,
} from "../controllers/pushSubscription.controller.js";
import { protect } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post("/subscribe", protect, saveSubscription);
router.post("/unsubscribe", protect, deleteSubscription);
router.post("/send-to-user", sendNotificationToUser); // admin / system

export default router;
