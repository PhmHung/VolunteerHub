import express from "express";
import {
  getChannels,
  getChannelById,
  getChannelByEventId
} from "../controllers/channel.controller.js";
import { protect, allowAdminOnly } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.route("/")
  .get(protect, getChannels)

router.route("/:id")
  .get(protect, getChannelById)

router.route("/event/:eventId")
  .get(protect, getChannelByEventId)

export default router;
