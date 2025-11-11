import express from "express";
import {
  getChannels,
  getChannelById
} from "../controllers/channel.controller.js";
import { protect, allowAdminOnly } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.route("/")
  .get(getChannels)
  .post(protect, allowAdminOnly, createChannel);

router.route("/:id")
  .get(getChannelById)
  .put(protect, allowAdminOnly, updateChannel)
  .delete(protect, allowAdminOnly, deleteChannel);

export default router;
