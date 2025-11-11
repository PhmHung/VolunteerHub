/** @format */

import asyncHandler from "express-async-handler";
import Event from "../models/eventModel.js";

const canModifyEvent = asyncHandler(async (req, res, next) => {
  const event = await Event.findById(req.params.id);
  if (!event) {
    res.status(404);
    throw new Error("Sự kiện không tồn tại");
  }

  const isOwner = event.createdBy.toString() === req.user._id.toString();
  const isAdmin = req.user.role === "admin";

  if (!isOwner && !isAdmin) {
    res.status(403);
    throw new Error("Không có quyền");
  }

  req.event = event;
  next();
});

export { canModifyEvent };
